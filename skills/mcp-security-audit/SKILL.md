---
name: mcp-security-audit
description: 'MCP（Model Context Protocol）サーバー構成のセキュリティ問題を監査する。次の場合にこのスキルを使用する。`.mcp.json` ファイルのセキュリティリスクをレビューする場合。MCP サーバーの引数にハードコードされたシークレットまたはシェルインジェクションパターンがないか確認する場合。MCP サーバーが固定バージョン（`@latest` ではない）を使用していることを検証する場合。MCP サーバー構成で固定されていない依存関係を検出する場合。プロジェクトが登録する MCP サーバーと、承認済み一覧に含まれるかどうかを監査する場合。MCP 構成での環境変数利用とハードコードされた資格情報を確認する場合。「MCP 構成は安全か」「MCP サーバーを監査して」「`.mcp.json` を確認して」のような依頼。'
keywords: [mcp, security, audit, secrets, shell-injection, supply-chain, governance]
---

# MCPセキュリティ監査

MCP サーバー構成について、シークレットの露出、シェルインジェクション、固定されていない依存関係、未承認サーバーを監査します。

## 概要

MCP サーバーはエージェントへ外部システムへの直接的なツールアクセスを与えます。誤構成の `.mcp.json` は資格情報を露出させ、シェルインジェクションを許したり、信頼できないサーバーへ接続したりする可能性があります。このスキルは、本番に到達する前にその問題を検出します。

```
.mcp.json → サーバーを解析 → 各サーバーを確認:
  1. 引数 / 環境変数にシークレットはあるか?
  2. シェルインジェクションパターンはあるか?
  3. バージョンは固定されていないか（`@latest`）?
  4. 危険なコマンド（`eval`、`bash -c`）はあるか?
  5. サーバーは承認済み一覧にあるか?
→ レポートを生成
```

## 使用する場合

- プロジェクト内の任意の `.mcp.json` ファイルをレビューするとき
- プロジェクトへ新しい MCP サーバーを導入するとき
- モノレポまたはプラグインマーケットプレイス内のすべての MCP サーバーを監査するとき
- MCP 構成変更に対するコミット前チェックを行うとき
- エージェントツール構成のセキュリティレビューを行うとき

---

## 監査チェック1：ハードコードされたシークレット

MCP サーバーの引数と環境変数値から、ハードコードされた資格情報を検索します。

```python
import json
import re
from pathlib import Path

SECRET_PATTERNS = [
    (r'(?i)(api[_-]?key|token|secret|password|credential)\s*[:=]\s*["\'][^"\']{8,}', "Hardcoded secret"),
    (r'(?i)Bearer\s+[A-Za-z0-9\-._~+/]+=*', "Hardcoded bearer token"),
    (r'(?i)(ghp_|gho_|ghu_|ghs_|ghr_)[A-Za-z0-9]{30,}', "GitHub token"),
    (r'sk-[A-Za-z0-9]{20,}', "OpenAI API key"),
    (r'AKIA[0-9A-Z]{16}', "AWS access key"),
    (r'-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----', "Private key"),
]

def check_secrets(mcp_config: dict) -> list[dict]:
    """Check for hardcoded secrets in MCP server configurations."""
    findings = []
    raw = json.dumps(mcp_config)
    for pattern, description in SECRET_PATTERNS:
        matches = re.findall(pattern, raw)
        if matches:
            findings.append({
                "severity": "CRITICAL",
                "check": "hardcoded-secret",
                "message": f"{description} found in MCP configuration",
                "evidence": f"Pattern matched: {pattern}",
                "fix": "Use environment variable references: ${ENV_VAR_NAME}"
            })
    return findings
```

**推奨事項 — 環境変数参照を使用する:**
```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["server.js"],
      "env": {
        "API_KEY": "${MY_API_KEY}",
        "DB_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

**悪い例 — ハードコードされた資格情報:**
```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["server.js", "--api-key", "sk-abc123realkey456"],
      "env": {
        "DB_URL": "postgresql://admin:password123@prod-db:5432/main"
      }
    }
  }
}
```

---

## 監査チェック2：シェルインジェクションパターン

MCP サーバーの引数から危険なコマンドパターンを検出します。

```python
import json
import re

DANGEROUS_PATTERNS = [
    (r'\$\(', "Command substitution $(...)"),
    (r'`[^`]+`', "Backtick command substitution"),
    (r';\s*\w', "Command chaining with semicolon"),
    (r'\|\s*\w', "Pipe to another command"),
    (r'&&\s*\w', "Command chaining with &&"),
    (r'\|\|\s*\w', "Command chaining with ||"),
    (r'(?i)eval\s', "eval usage"),
    (r'(?i)bash\s+-c\s', "bash -c execution"),
    (r'(?i)sh\s+-c\s', "sh -c execution"),
    (r'>\s*/dev/tcp/', "TCP redirect (reverse shell pattern)"),
    (r'curl\s+.*\|\s*(ba)?sh', "curl pipe to shell"),
]

def check_shell_injection(server_config: dict) -> list[dict]:
    """Check MCP server args for shell injection risks."""
    findings = []
    args_text = json.dumps(server_config.get("args", []))
    for pattern, description in DANGEROUS_PATTERNS:
        if re.search(pattern, args_text):
            findings.append({
                "severity": "HIGH",
                "check": "shell-injection",
                "message": f"Dangerous pattern in MCP server args: {description}",
                "fix": "Use direct command execution, not shell interpolation"
            })
    return findings
```

---

## 監査チェック3：固定されていない依存関係

パッケージ参照に `@latest` を使用している MCP サーバーを検出します。

```python
def check_pinned_versions(server_config: dict) -> list[dict]:
    """Check that MCP server dependencies use pinned versions, not @latest."""
    findings = []
    args = server_config.get("args", [])
    for arg in args:
        if isinstance(arg, str):
            if "@latest" in arg:
                findings.append({
                    "severity": "MEDIUM",
                    "check": "unpinned-dependency",
                    "message": f"Unpinned dependency: {arg}",
                    "fix": f"Pin to specific version: {arg.replace('@latest', '@1.2.3')}"
                })
            # npx with unversioned package
            if arg.startswith("-y") or (not "@" in arg and not arg.startswith("-")):
                pass  # npx flag or plain arg, ok
    # Check if using npx without -y (interactive prompt in CI)
    command = server_config.get("command", "")
    if command == "npx" and "-y" not in args:
        findings.append({
            "severity": "LOW",
            "check": "npx-interactive",
            "message": "npx without -y flag may prompt interactively in CI",
            "fix": "Add -y flag: npx -y package-name"
        })
    return findings
```

**良い例 — バージョンを固定:**
```json
{ "args": ["-y", "my-mcp-server@2.1.0"] }
```

**悪い例 — 未固定:**
```json
{ "args": ["-y", "my-mcp-server@latest"] }
```

---

## 監査チェック4：完全な監査ランナー

すべてのチェックを単一の監査にまとめます。

```python
def audit_mcp_config(mcp_path: str) -> dict:
    """Run full security audit on an .mcp.json file."""
    path = Path(mcp_path)
    if not path.exists():
        return {"error": f"{mcp_path} not found"}

    config = json.loads(path.read_text(encoding="utf-8"))
    servers = config.get("mcpServers", {})
    results = {"file": str(path), "servers": {}, "summary": {}}
    total_findings = []

    # Run secrets check once on the whole config (not per-server)
    config_level_findings = check_secrets(config)
    total_findings.extend(config_level_findings)

    for name, server_config in servers.items():
        if not isinstance(server_config, dict):
            continue
        findings = []
        findings.extend(check_shell_injection(server_config))
        findings.extend(check_pinned_versions(server_config))
        results["servers"][name] = {
            "command": server_config.get("command", ""),
            "findings": findings,
        }
        total_findings.extend(findings)

    # Summary
    by_severity = {}
    for f in total_findings:
        sev = f["severity"]
        by_severity[sev] = by_severity.get(sev, 0) + 1

    results["summary"] = {
        "total_servers": len(servers),
        "total_findings": len(total_findings),
        "by_severity": by_severity,
        "passed": len(total_findings) == 0,
    }
    return results
```

**使用方法:**
```python
results = audit_mcp_config(".mcp.json")
if not results["summary"]["passed"]:
    for server, data in results["servers"].items():
        for finding in data["findings"]:
            print(f"[{finding['severity']}] {server}: {finding['message']}")
            print(f"  Fix: {finding['fix']}")
```

---

## 出力形式

```
MCP Security Audit — .mcp.json
═══════════════════════════════
Servers scanned: 5
Findings: 3 (1 CRITICAL, 1 HIGH, 1 MEDIUM)

[CRITICAL] my-api-server: Hardcoded secret found in MCP configuration
  Fix: Use environment variable references: ${ENV_VAR_NAME}

[HIGH] data-processor: Dangerous pattern in MCP server args: bash -c execution
  Fix: Use direct command execution, not shell interpolation

[MEDIUM] analytics: Unpinned dependency: analytics-mcp@latest
  Fix: Pin to specific version: analytics-mcp@2.1.0
```

---

## 関連リソース

- [MCP 仕様](https://modelcontextprotocol.io/)
- [Agent Governance Toolkit](https://github.com/microsoft/agent-governance-toolkit) — MCP トラストプロキシを含む完全なガバナンスフレームワーク
- [OWASP ASI-02: 安全でないツール利用](https://owasp.org/www-project-agentic-ai-threats/)

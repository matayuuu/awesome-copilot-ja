---
name: agent-supply-chain
description: 'AIエージェントのプラグイン、ツール、依存関係のサプライチェーン整合性を検証するSkill。整合性マニフェストの生成、公開マニフェストとの照合、改ざん検出、依存関係のバージョン固定監査、プラグイン昇格時の来歴確認に使用します。'
---

# エージェントのサプライチェーン整合性

AIエージェントのプラグインとツール用の整合性マニフェストを生成・検証します。改ざんを検出し、バージョン固定を適用し、サプライチェーンの来歴を確立します。

## 概要

エージェントプラグインとMCPサーバーには、npmパッケージやコンテナーイメージと同じサプライチェーンリスクがあります。ただし、このエコシステムにはnpm provenance、Sigstore、SLSAに相当する仕組みがありません。このSkillはその空白を補います。

```
Plugin Directory → Hash All Files (SHA-256) → Generate INTEGRITY.json
                                                    ↓
Later: Plugin Directory → Re-Hash Files → Compare Against INTEGRITY.json
                                                    ↓
                                          Match? VERIFIED : TAMPERED
```

## 使用する場面

- プラグインを開発環境から本番環境へ昇格させる前
- プラグインのPRをコードレビューするとき
- レビュー後にファイルが変更されていないことをCIで確認するとき
- サードパーティ製のエージェントツールやMCPサーバーを監査するとき
- 整合性要件のあるプラグインマーケットプレースを構築するとき

---

## パターン1：整合性マニフェストを生成する

すべてのプラグインファイルのSHA-256ハッシュを含む、決定論的な`INTEGRITY.json`を作成します。

```python
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

EXCLUDE_DIRS = {".git", "__pycache__", "node_modules", ".venv", ".pytest_cache"}
EXCLUDE_FILES = {".DS_Store", "Thumbs.db", "INTEGRITY.json"}

def hash_file(path: Path) -> str:
    """Compute SHA-256 hex digest of a file."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

def generate_manifest(plugin_dir: str) -> dict:
    """Generate an integrity manifest for a plugin directory."""
    root = Path(plugin_dir)
    files = {}

    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        if path.name in EXCLUDE_FILES:
            continue
        if any(part in EXCLUDE_DIRS for part in path.relative_to(root).parts):
            continue
        rel = path.relative_to(root).as_posix()
        files[rel] = hash_file(path)

    # Chain hash: SHA-256 of all file hashes concatenated in sorted order
    chain = hashlib.sha256()
    for key in sorted(files.keys()):
        chain.update(files[key].encode("ascii"))

    manifest = {
        "plugin_name": root.name,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "algorithm": "sha256",
        "file_count": len(files),
        "files": files,
        "manifest_hash": chain.hexdigest(),
    }
    return manifest

# Generate and save
manifest = generate_manifest("my-plugin/")
Path("my-plugin/INTEGRITY.json").write_text(
    json.dumps(manifest, indent=2) + "\n"
)
print(f"Generated manifest: {manifest['file_count']} files, "
      f"hash: {manifest['manifest_hash'][:16]}...")
```

**出力（`INTEGRITY.json`）：**
```json
{
  "plugin_name": "my-plugin",
  "generated_at": "2026-04-01T03:00:00+00:00",
  "algorithm": "sha256",
  "file_count": 12,
  "files": {
    ".claude-plugin/plugin.json": "a1b2c3d4...",
    "README.md": "e5f6a7b8...",
    "skills/search/SKILL.md": "c9d0e1f2...",
    "agency.json": "3a4b5c6d..."
  },
  "manifest_hash": "7e8f9a0b1c2d3e4f..."
}
```

---

## パターン2：整合性を検証する

現在のファイルがマニフェストと一致することを確認します。

```python
# Requires: hash_file() and generate_manifest() from Pattern 1 above
import json
from pathlib import Path

def verify_manifest(plugin_dir: str) -> tuple[bool, list[str]]:
    """Verify plugin files against INTEGRITY.json."""
    root = Path(plugin_dir)
    manifest_path = root / "INTEGRITY.json"

    if not manifest_path.exists():
        return False, ["INTEGRITY.json not found"]

    manifest = json.loads(manifest_path.read_text())
    recorded = manifest.get("files", {})
    errors = []

    # Check recorded files
    for rel_path, expected_hash in recorded.items():
        full = root / rel_path
        if not full.exists():
            errors.append(f"MISSING: {rel_path}")
            continue
        actual = hash_file(full)
        if actual != expected_hash:
            errors.append(f"MODIFIED: {rel_path}")

    # Check for new untracked files
    current = generate_manifest(plugin_dir)
    for rel_path in current["files"]:
        if rel_path not in recorded:
            errors.append(f"UNTRACKED: {rel_path}")

    return len(errors) == 0, errors

# Verify
passed, errors = verify_manifest("my-plugin/")
if passed:
    print("VERIFIED: All files match manifest")
else:
    print(f"FAILED: {len(errors)} issue(s)")
    for e in errors:
        print(f"  {e}")
```

**改ざんされたプラグインでの出力：**
```
FAILED: 3 issue(s)
  MODIFIED: skills/search/SKILL.md
  MISSING: agency.json
  UNTRACKED: backdoor.py
```

---

## パターン3：依存関係のバージョンを監査する

エージェントの依存関係でバージョンが固定されていることを確認します。

```python
import re

def audit_versions(config_path: str) -> list[dict]:
    """Audit dependency version pinning in a config file."""
    findings = []
    path = Path(config_path)
    content = path.read_text()

    if path.name == "package.json":
        data = json.loads(content)
        for section in ("dependencies", "devDependencies"):
            for pkg, ver in data.get(section, {}).items():
                if ver.startswith("^") or ver.startswith("~") or ver == "*" or ver == "latest":
                    findings.append({
                        "package": pkg,
                        "version": ver,
                        "severity": "HIGH" if ver in ("*", "latest") else "MEDIUM",
                        "fix": f'Pin to exact: "{pkg}": "{ver.lstrip("^~")}"'
                    })

    elif path.name in ("requirements.txt", "pyproject.toml"):
        for line in content.splitlines():
            line = line.strip()
            if ">=" in line and "<" not in line:
                findings.append({
                    "package": line.split(">=")[0].strip(),
                    "version": line,
                    "severity": "MEDIUM",
                    "fix": f"Add upper bound: {line},<next_major"
                })

    return findings
```

---

## パターン4：昇格ゲート

プラグインを昇格させる前のゲートとして、整合性検証を使用します。

```python
def promotion_check(plugin_dir: str) -> dict:
    """Check if a plugin is ready for production promotion."""
    checks = {}

    # 1. Integrity manifest exists and verifies
    passed, errors = verify_manifest(plugin_dir)
    checks["integrity"] = {
        "passed": passed,
        "errors": errors
    }

    # 2. Required files exist
    root = Path(plugin_dir)
    required = ["README.md"]
    missing = [f for f in required if not (root / f).exists()]

    # Require at least one plugin manifest (supports both layouts)
    manifest_paths = [
        root / ".github/plugin/plugin.json",
        root / ".claude-plugin/plugin.json",
    ]
    if not any(p.exists() for p in manifest_paths):
        missing.append(".github/plugin/plugin.json (or .claude-plugin/plugin.json)")

    checks["required_files"] = {
        "passed": len(missing) == 0,
        "missing": missing
    }

    # 3. No unpinned dependencies
    mcp_path = root / ".mcp.json"
    if mcp_path.exists():
        config = json.loads(mcp_path.read_text())
        unpinned = []
        for server in config.get("mcpServers", {}).values():
            if isinstance(server, dict):
                for arg in server.get("args", []):
                    if isinstance(arg, str) and "@latest" in arg:
                        unpinned.append(arg)
        checks["pinned_deps"] = {
            "passed": len(unpinned) == 0,
            "unpinned": unpinned
        }

    # Overall
    all_passed = all(c["passed"] for c in checks.values())
    return {"ready": all_passed, "checks": checks}

result = promotion_check("my-plugin/")
if result["ready"]:
    print("Plugin is ready for production promotion")
else:
    print("Plugin NOT ready:")
    for name, check in result["checks"].items():
        if not check["passed"]:
            print(f"  FAILED: {name}")
```

---

## CIへの統合

GitHub Actionsワークフローに追加します。

```yaml
- name: Verify plugin integrity
  run: |
    PLUGIN_DIR="${{ matrix.plugin || '.' }}"
    cd "$PLUGIN_DIR"
    python -c "
    from pathlib import Path
    import json, hashlib, sys

    def hash_file(p):
        h = hashlib.sha256()
        with open(p, 'rb') as f:
            for c in iter(lambda: f.read(8192), b''):
                h.update(c)
        return h.hexdigest()

    manifest = json.loads(Path('INTEGRITY.json').read_text())
    errors = []
    for rel, expected in manifest['files'].items():
        p = Path(rel)
        if not p.exists():
            errors.append(f'MISSING: {rel}')
        elif hash_file(p) != expected:
            errors.append(f'MODIFIED: {rel}')
    if errors:
        for e in errors:
            print(f'::error::{e}')
        sys.exit(1)
    print(f'Verified {len(manifest[\"files\"])} files')
    "
```

---

## ベストプラクティス

| 実践項目 | 理由 |
|----------|------|
| **コードレビュー後にマニフェストを生成する** | レビュー済みのコードが本番コードと一致することを保証する |
| **PRにマニフェストを含める** | レビュー担当者がハッシュを検証できる |
| **デプロイ前にCIで検証する** | レビュー後の変更を検出する |
| **改ざんの証拠としてチェーンハッシュを使う** | 単一のハッシュでプラグイン全体の状態を表現できる |
| **ビルド成果物を除外する** | ソースファイルだけをハッシュする（.git、__pycache__、node_modulesを除外） |
| **すべての依存関係のバージョンを固定する** | 固定されていない依存関係では、インストールのたびに異なるコードになる |

---

## 関連リソース

- [OpenSSF SLSA](https://slsa.dev/) — ソフトウェア成果物のサプライチェーンレベル
- [npm Provenance](https://docs.npmjs.com/generating-provenance-statements) — Sigstoreベースのパッケージ来歴
- [Agent Governance Toolkit](https://github.com/microsoft/agent-governance-toolkit) — 整合性検証とプラグイン署名を含む
- [OWASP ASI-09: Supply Chain Integrity](https://owasp.org/www-project-agentic-ai-threats/)

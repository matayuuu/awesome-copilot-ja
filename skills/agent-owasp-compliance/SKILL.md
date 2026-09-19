---
name: agent-owasp-compliance
description: '任意のAI AgentコードベースをOWASP Agentic Security Initiative（ASI）Top 10リスクに照らして確認する。本番デプロイ前のセキュリティ態勢評価、OWASP ASI 2026基準への準拠チェック、既存のセキュリティ制御と10のAgentリスクの対応付け、セキュリティレビュー・監査用レポート生成、Agentフレームワークのセキュリティ機能比較、OWASP準拠やASI準拠を尋ねる依頼で使う。'
---

# Agent OWASP ASI準拠チェック

AI Agentシステムを、Agentのセキュリティ態勢に関する業界標準であるOWASP Agentic Security Initiative（ASI）Top 10に照らして評価する。

## 概要

OWASP ASI Top 10は、自律型AI Agentに固有の重大なセキュリティリスクを定義する。LLMやチャットボットではなく、ツールを呼び出し、システムへアクセスし、ユーザーに代わって行動するAgentが対象である。このSkillは実装が各リスクに対処しているか確認する。

```
Codebase → Scan for each ASI control:
  ASI-01: Prompt Injection Protection
  ASI-02: Tool Use Governance
  ASI-03: Agency Boundaries
  ASI-04: Escalation Controls
  ASI-05: Trust Boundary Enforcement
  ASI-06: Logging & Audit
  ASI-07: Identity Management
  ASI-08: Policy Integrity
  ASI-09: Supply Chain Verification
  ASI-10: Behavioral Monitoring
→ Generate Compliance Report (X/10 covered)
```

## 10のリスク

| リスク | 名称 | 確認対象 |
|------|------|-----------------|
| ASI-01 | Prompt Injection | LLM出力フィルターだけでなく、ツール呼び出し前の入力検証 |
| ASI-02 | Insecure Tool Use | ツール許可リスト、引数検証、生のシェル実行なし |
| ASI-03 | Excessive Agency | 能力境界、スコープ制限、最小権限の原則 |
| ASI-04 | Unauthorized Escalation | 機密操作前の権限チェック、自己昇格なし |
| ASI-05 | Trust Boundary Violation | Agent間の信頼検証、署名付き資格情報、盲目的な信頼なし |
| ASI-06 | Insufficient Logging | すべてのツール呼び出しの構造化監査証跡、改ざん検知ログ |
| ASI-07 | Insecure Identity | 文字列名だけでなく、暗号学的なAgent ID |
| ASI-08 | Policy Bypass | 決定論的なポリシー適用、LLMベースの権限チェックなし |
| ASI-09 | Supply Chain Integrity | 署名済みプラグイン/ツール、完全性検証、依存関係監査 |
| ASI-10 | Behavioral Anomaly | ドリフト検出、サーキットブレーカー、キルスイッチ機能 |

---

## ASI-01の確認: プロンプトインジェクション対策

LLM生成後ではなく、ツール実行**前**に行われる入力検証を探す。

```python
import re
from pathlib import Path

def check_asi_01(project_path: str) -> dict:
    """ASI-01: Is user input validated before reaching tool execution?"""
    positive_patterns = [
        "input_validation", "validate_input", "sanitize",
        "classify_intent", "prompt_injection", "threat_detect",
        "PolicyEvaluator", "PolicyEngine", "check_content",
    ]
    negative_patterns = [
        r"eval\(", r"exec\(", r"subprocess\.run\(.*shell=True",
        r"os\.system\(",
    ]

    # Scan Python files for signals
    root = Path(project_path)
    positive_matches = []
    negative_matches = []

    for py_file in root.rglob("*.py"):
        content = py_file.read_text(errors="ignore")
        for pattern in positive_patterns:
            if pattern in content:
                positive_matches.append(f"{py_file.name}: {pattern}")
        for pattern in negative_patterns:
            if re.search(pattern, content):
                negative_matches.append(f"{py_file.name}: {pattern}")

    positive_found = len(positive_matches) > 0
    negative_found = len(negative_matches) > 0

    return {
        "risk": "ASI-01",
        "name": "Prompt Injection",
        "status": "pass" if positive_found and not negative_found else "fail",
        "controls_found": positive_matches,
        "vulnerabilities": negative_matches,
        "recommendation": "Add input validation before tool execution, not just output filtering"
    }
```

**合格例:**
```python
# GOOD: Validate before tool execution
result = policy_engine.evaluate(user_input)
if result.action == "deny":
    return "Request blocked by policy"
tool_result = await execute_tool(validated_input)
```

**不合格例:**
```python
# BAD: User input goes directly to tool
tool_result = await execute_tool(user_input)  # No validation
```

---

## ASI-02の確認: 安全でないツール利用

ツールに許可リストと引数検証があり、無制限の実行がないことを確認する。

**検索すべきもの:**
- Tool registration with explicit allowlists (not open-ended)
- Argument validation before tool execution
- No `subprocess.run(shell=True)` with user-controlled input
- No `eval()` or `exec()` on agent-generated code without sandbox

**合格例:**
```python
ALLOWED_TOOLS = {"search", "read_file", "create_ticket"}

def execute_tool(name: str, args: dict):
    if name not in ALLOWED_TOOLS:
        raise PermissionError(f"Tool '{name}' not in allowlist")
    # validate args...
    return tools[name](**validated_args)
```

---

## ASI-03の確認: 過剰な自律性

Agentの能力が無制限ではなく、境界付けられていることを確認する。

**検索すべきもの:**
- Explicit capability lists or execution rings
- Scope limits on what the agent can access
- Principle of least privilege applied to tool access

**不合格:** Agentが既定ですべてのツールへアクセスできる。
**合格:** Agentの能力が固定の許可リストで定義され、未知のツールは拒否される。

---

## ASI-04の確認: 未承認の権限昇格

Agentが自分の権限を昇格できないことを確認する。

**検索すべきもの:**
- Privilege level checks before sensitive operations
- No self-promotion patterns (agent changing its own trust score or role)
- Escalation requires external attestation (human or SRE witness)

**不合格:** Agentが自身の構成や権限を変更できる。
**合格:** 権限変更には帯域外承認が必要（例: Ring 0にはSRE証明が必要）。

---

## ASI-05の確認: 信頼境界違反

マルチAgentシステムでは、指示を受け入れる前にAgent同士が互いのIDを検証することを確認する。

**検索すべきもの:**
- Agent identity verification (DIDs, signed tokens, API keys)
- Trust score checks before accepting delegated tasks
- No blind trust of inter-agent messages
- Delegation narrowing (child scope <= parent scope)

**Passing example:**
```python
def accept_task(sender_id: str, task: dict):
    trust = trust_registry.get_trust(sender_id)
    if not trust.meets_threshold(0.7):
        raise PermissionError(f"Agent {sender_id} trust too low: {trust.current()}")
    if not verify_signature(task, sender_id):
        raise SecurityError("Task signature verification failed")
    return process_task(task)
```

---

## ASI-06の確認: 不十分なロギング

すべてのAgent操作が、構造化され改ざんを検知できる監査エントリを生成することを確認する。

**検索すべきもの:**
- Structured logging for every tool call (not just print statements)
- Audit entries include: timestamp, agent ID, tool name, args, result, policy decision
- Append-only or hash-chained log format
- Logs stored separately from agent-writable directories

**不合格:** Agent操作が `print()` で記録される、またはまったく記録されない。
**合格:** チェーンハッシュ付きの構造化JSONL監査証跡が安全なストレージへ書き出される。

---

## ASI-07の確認: 安全でないID

Agentが単なる文字列名ではなく、暗号学的なIDを持つことを確認する。

**不合格の兆候:**
- Agent identified by `agent_name = "my-agent"` (string only)
- No authentication between agents
- Shared credentials across agents

**合格の兆候:**
- DID-based identity (`did:web:`, `did:key:`)
- Ed25519 or similar cryptographic signing
- Per-agent credentials with rotation
- Identity bound to specific capabilities

---

## ASI-08の確認: ポリシー迂回

ポリシー適用がLLMベースではなく決定論的であることを確認する。

**検索すべきもの:**
- Policy evaluation uses deterministic logic (YAML rules, code predicates)
- No LLM calls in the enforcement path
- Policy checks cannot be skipped or overridden by the agent
- Fail-closed behavior (if policy check errors, action is denied)

**不合格:** Agentがプロンプト（"Am I allowed to...?"）で自身の権限を判断する。
**合格:** LLMを介さず、PolicyEvaluator.evaluate() が0.1ms未満でallow/denyを返す。

---

## ASI-09の確認: サプライチェーンの完全性

Agentプラグインとツールに完全性検証があることを確認する。

**検索すべきもの:**
- `INTEGRITY.json` or manifest files with SHA-256 hashes
- Signature verification on plugin installation
- Dependency pinning (no `@latest`, `>=` without upper bound)
- SBOM generation

---

## ASI-10の確認: 行動異常

システムがAgentの行動ドリフトを検出し、対応できることを確認する。

**検索すべきもの:**
- Circuit breakers that trip on repeated failures
- Trust score decay over time (temporal decay)
- Kill switch or emergency stop capability
- Anomaly detection on tool call patterns (frequency, targets, timing)

**不合格:** 不正動作するAgentを自動停止する仕組みがない。
**合格:** N回失敗後にサーキットブレーカーが作動し、活動がなければ信頼が減衰し、キルスイッチが利用できる。

---

## 準拠レポート形式

```markdown
# OWASP ASI Compliance Report
Generated: 2026-04-01
Project: my-agent-system

## Summary: 7/10 Controls Covered

| Risk | Status | Finding |
|------|--------|---------|
| ASI-01 Prompt Injection | PASS | PolicyEngine validates input before tool calls |
| ASI-02 Insecure Tool Use | PASS | Tool allowlist enforced in governance.py |
| ASI-03 Excessive Agency | PASS | Execution rings limit capabilities |
| ASI-04 Unauthorized Escalation | PASS | Ring promotion requires attestation |
| ASI-05 Trust Boundary | FAIL | No identity verification between agents |
| ASI-06 Insufficient Logging | PASS | AuditChain with SHA-256 chain hashes |
| ASI-07 Insecure Identity | FAIL | Agents use string names, no crypto identity |
| ASI-08 Policy Bypass | PASS | Deterministic PolicyEvaluator, no LLM in path |
| ASI-09 Supply Chain | FAIL | No integrity manifests or plugin signing |
| ASI-10 Behavioral Anomaly | PASS | Circuit breakers and trust decay active |

## Critical Gaps
- ASI-05: Add agent identity verification using DIDs or signed tokens
- ASI-07: Replace string agent names with cryptographic identity
- ASI-09: Generate INTEGRITY.json manifests for all plugins

## Recommendation
Install agent-governance-toolkit for reference implementations of all 10 controls:
pip install agent-governance-toolkit
```

---

## 簡易評価の質問

Agentシステムを素早く評価するために使う:

1. **Does user input pass through validation before reaching any tool?** (ASI-01)
2. **Is there an explicit list of what tools the agent can call?** (ASI-02)
3. **Can the agent do anything, or are its capabilities bounded?** (ASI-03)
4. **Can the agent promote its own privileges?** (ASI-04)
5. **Do agents verify each other's identity before accepting tasks?** (ASI-05)
6. **Is every tool call logged with enough detail to replay it?** (ASI-06)
7. **Does each agent have a unique cryptographic identity?** (ASI-07)
8. **Is policy enforcement deterministic (not LLM-based)?** (ASI-08)
9. **Are plugins/tools integrity-verified before use?** (ASI-09)
10. **Is there a circuit breaker or kill switch?** (ASI-10)

いずれかに「いいえ」と答えた場合は、対処すべきギャップである。

---

## 関連リソース

- [OWASP Agentic AI Threats](https://owasp.org/www-project-agentic-ai-threats/)
- [Agent Governance Toolkit](https://github.com/microsoft/agent-governance-toolkit) — Reference implementation covering 10/10 ASI controls
- [agent-governance skill](https://github.com/github/awesome-copilot/tree/main/skills/agent-governance) — Governance patterns for agent systems

---
name: 'ガバナンス監査'
description: 'Copilot agent のプロンプトを脅威シグナルについて検査し、ガバナンスイベントを記録します'
tags: ['security', 'governance', 'audit', 'safety']
---

# ガバナンス監査フック

GitHub Copilot coding agent のセッションに対するリアルタイムの脅威検出と監査ログ機能です。エージェントが処理する前に、ユーザープロンプトの危険なパターンを検査します。

## Overview

This hook provides governance controls for Copilot coding agent sessions:
- **脅威検出**: データ持ち出し、権限昇格、システム破壊、プロンプトインジェクション、認証情報露出を検査
- **ガバナンスレベル**: open、standard、strict、locked — 監査のみから全面ブロックまで
- **監査証跡**: すべてのガバナンスイベントを追記専用 JSON ログに記録
- **セッション概要**: セッション終了時に脅威件数を報告

## Threat Categories

| Category | Examples | Severity |
|----------|----------|----------|
| `data_exfiltration` | "send all records to external API" | 0.7 - 0.95 |
| `privilege_escalation` | "sudo", "chmod 777", "add to sudoers" | 0.8 - 0.95 |
| `system_destruction` | "rm -rf /", "drop database" | 0.9 - 0.95 |
| `prompt_injection` | "ignore previous instructions" | 0.6 - 0.9 |
| `credential_exposure` | Hardcoded API keys, AWS access keys | 0.9 - 0.95 |

## Governance Levels

| Level | Behavior |
|-------|----------|
| `open` | Log threats only, never block |
| `standard` | Log threats, block only if `BLOCK_ON_THREAT=true` |
| `strict` | Log and block all detected threats |
| `locked` | Log and block all detected threats |

## インストール

1. フックフォルダーをリポジトリへコピーします。
   ```bash
   cp -r hooks/governance-audit .github/hooks/
   ```

2. スクリプトに実行権限があることを確認します。
   ```bash
   chmod +x .github/hooks/governance-audit/*.sh
   ```

3. ログディレクトリを作成し、`.gitignore` に追加します。
   ```bash
   mkdir -p logs/copilot/governance
   echo "logs/" >> .gitignore
   ```

4. リポジトリのデフォルトブランチへコミットします。

## Configuration

`hooks.json` で環境変数を設定します。

```json
{
  "env": {
    "GOVERNANCE_LEVEL": "strict",
    "BLOCK_ON_THREAT": "true"
  }
}
```

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `GOVERNANCE_LEVEL` | `open`, `standard`, `strict`, `locked` | `standard` | Controls blocking behavior |
| `BLOCK_ON_THREAT` | `true`, `false` | `false` | Block prompts with threats (standard level) |
| `SKIP_GOVERNANCE_AUDIT` | `true` | unset | Disable governance audit entirely |

## ログ形式

Events are written to `logs/copilot/governance/audit.log` in JSON Lines format:

```json
{"timestamp":"2026-01-15T10:30:00Z","event":"session_start","governance_level":"standard","cwd":"/workspace/project"}
{"timestamp":"2026-01-15T10:31:00Z","event":"prompt_scanned","governance_level":"standard","status":"clean"}
{"timestamp":"2026-01-15T10:32:00Z","event":"threat_detected","governance_level":"standard","threat_count":1,"threats":[{"category":"privilege_escalation","severity":0.8,"description":"Elevated privileges","evidence":"sudo"}]}
{"timestamp":"2026-01-15T10:45:00Z","event":"session_end","total_events":12,"threats_detected":1}
```

## 要件

- `jq` for JSON processing (pre-installed on most CI environments and macOS)
- `grep` with `-E` (extended regex) support
- `bc` for floating-point comparison (optional, gracefully degrades)

## プライバシーとセキュリティ

- 完全なプロンプトをログに記録することは**ありません**。一致した脅威パターン（最小限の証拠断片）とメタデータだけを記録します。
- 監査データをローカルに保つため、`.gitignore` に `logs/` を追加します。
- 完全に無効化するには `SKIP_GOVERNANCE_AUDIT=true` を設定します。
- すべてのデータはローカルに留まり、外部ネットワーク呼び出しはありません。

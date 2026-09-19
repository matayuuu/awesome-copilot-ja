---
name: 'ツールガーディアン'
description: 'Copilot coding agent が実行する前に、危険なツール操作（破壊的なファイル操作、強制プッシュ、DB削除など）をブロックします'
tags: ['security', 'safety', 'preToolUse', 'guardrails']
---

# ツールガーディアンフック

GitHub Copilot coding agent が実行する前に危険なツール操作をブロックし、破壊的コマンド、強制プッシュ、データベース削除などの高リスク操作に対する安全網として機能します。

## Overview

AI coding agents can autonomously execute shell commands, file operations, and database queries. Without guardrails, a misinterpreted instruction could lead to irreversible damage. This hook intercepts every tool invocation at the `preToolUse` event and scans it against ~20 threat patterns across 6 categories:

- **Destructive file ops**: `rm -rf /`, deleting `.env` or `.git`
- **Destructive git ops**: `git push --force` to main/master, `git reset --hard`
- **Database destruction**: `DROP TABLE`, `DROP DATABASE`, `TRUNCATE`, `DELETE FROM` without `WHERE`
- **Permission abuse**: `chmod 777`, recursive world-writable permissions
- **Network exfiltration**: `curl | bash`, `wget | sh`, uploading files via `curl --data @`
- **System danger**: `sudo`, `npm publish`

## 機能

- **2つのガードモード**: `block`（実行を防ぐため非ゼロ終了）または `warn`（記録のみ）
- **より安全な代替案**: ブロックされた各パターンに安全なコマンドの提案を付加
- **許可リスト対応**: `TOOL_GUARD_ALLOWLIST` で特定パターンを除外
- **構造化ログ**: 監視ツールと統合しやすい JSON Lines 出力
- **高速実行**: 10秒のタイムアウト、外部ネットワーク呼び出しなし
- **依存関係ゼロ**: 標準 Unix ツール（`grep`、`sed`）のみ使用。入力解析には `jq` を任意で使用

## インストール

1. フックフォルダーをリポジトリへコピーします。

   ```bash
   cp -r hooks/tool-guardian your-repo/hooks/
   ```

2. スクリプトに実行権限があることを確認します。

   ```bash
   chmod +x hooks/tool-guardian/guard-tool.sh
   ```

3. ログディレクトリを作成し、`.gitignore` に追加します。

   ```bash
   mkdir -p .github/logs/copilot/tool-guardian
   echo ".github/logs/" >> .gitignore
   ```

4. フック設定をリポジトリのデフォルトブランチへコミットします。

## Configuration

フックは `hooks.json` で `preToolUse` イベント時に実行するよう設定します。

```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      {
        "type": "command",
        "bash": "hooks/tool-guardian/guard-tool.sh",
        "cwd": ".",
        "env": {
          "GUARD_MODE": "block"
        },
        "timeoutSec": 10
      }
    ]
  }
}
```

### Environment Variables

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `GUARD_MODE` | `warn`, `block` | `block` | `warn` logs threats only; `block` exits non-zero to prevent tool execution |
| `SKIP_TOOL_GUARD` | `true` | unset | Disable the guardian entirely |
| `TOOL_GUARD_LOG_DIR` | path | `.github/logs/copilot/tool-guardian` | Directory where guard logs are written |
| `TOOL_GUARD_ALLOWLIST` | comma-separated | unset | Patterns to skip (e.g., `git push --force,npm publish`) |

## 仕組み

1. Copilot coding agent がツールを実行する前に、フックはツール呼び出しを JSON として標準入力から受け取ります
2. `toolName` と `toolInput` フィールドを抽出します（`jq` があれば使用し、なければ正規表現へフォールバック）
3. 結合したテキストを許可リストと照合し、一致した場合は検査をすべて省略します
4. 結合したテキストを6つの重大度カテゴリにまたがる約20種類の正規表現脅威パターンと照合します
5. カテゴリ、重大度、一致テキスト、安全な代替案とともに検出結果を報告します
6. 監査用に構造化 JSON ログエントリを書き込みます
7. `block` モードではツールの実行を防ぐため非ゼロで終了します
8. `warn` モードでは脅威を記録し、実行を続行させます

## Threat Categories

| Category | Severity | Key Patterns | Suggestion |
|----------|----------|-------------|------------|
| `destructive_file_ops` | critical | `rm -rf /`, `rm -rf ~`, `rm -rf .`, delete `.env`/`.git` | Use targeted paths or `mv` to back up |
| `destructive_git_ops` | critical/high | `git push --force` to main/master, `git reset --hard`, `git clean -fd` | Use `--force-with-lease`, `git stash`, dry-run |
| `database_destruction` | critical/high | `DROP TABLE`, `DROP DATABASE`, `TRUNCATE`, `DELETE FROM` without WHERE | Use migrations, backups, add WHERE clause |
| `permission_abuse` | high | `chmod 777`, `chmod -R 777` | Use `755` for dirs, `644` for files |
| `network_exfiltration` | critical/high | `curl \| bash`, `wget \| sh`, `curl --data @file` | Download first, review, then execute |
| `system_danger` | high | `sudo`, `npm publish` | Use least privilege; `--dry-run` first |

## 例

### Safe command (exit 0)

```bash
echo '{"toolName":"bash","toolInput":"git status"}' | bash hooks/tool-guardian/guard-tool.sh
```

### Blocked command (exit 1)

```bash
echo '{"toolName":"bash","toolInput":"git push --force origin main"}' | \
  GUARD_MODE=block bash hooks/tool-guardian/guard-tool.sh
```

```
🛡️  Tool Guardian: 1 threat(s) detected in 'bash' invocation

  CATEGORY                 SEVERITY   MATCH                                    SUGGESTION
  --------                 --------   -----                                    ----------
  destructive_git_ops      critical   git push --force origin main             Use 'git push --force-with-lease' or push to a feature branch

🚫 Operation blocked: resolve the threats above or adjust TOOL_GUARD_ALLOWLIST.
   Set GUARD_MODE=warn to log without blocking.
```

### Warn mode (exit 0, threat logged)

```bash
echo '{"toolName":"bash","toolInput":"rm -rf /"}' | \
  GUARD_MODE=warn bash hooks/tool-guardian/guard-tool.sh
```

### Allowlisted command (exit 0)

```bash
echo '{"toolName":"bash","toolInput":"git push --force origin main"}' | \
  TOOL_GUARD_ALLOWLIST="git push --force" bash hooks/tool-guardian/guard-tool.sh
```

## Log Format

Guard events are written to `.github/logs/copilot/tool-guardian/guard.log` in JSON Lines format:

```json
{"timestamp":"2026-03-16T10:30:00Z","event":"threats_detected","mode":"block","tool":"bash","threat_count":1,"threats":[{"category":"destructive_git_ops","severity":"critical","match":"git push --force origin main","suggestion":"Use 'git push --force-with-lease' or push to a feature branch"}]}
```

```json
{"timestamp":"2026-03-16T10:30:00Z","event":"guard_passed","mode":"block","tool":"bash"}
```

```json
{"timestamp":"2026-03-16T10:30:00Z","event":"guard_skipped","reason":"allowlisted","tool":"bash"}
```

## カスタマイズ

- **Add custom patterns**: Edit the `PATTERNS` array in `guard-tool.sh` to add project-specific threat patterns
- **Adjust severity**: Change severity levels for patterns that need different treatment
- **Allowlist known commands**: Use `TOOL_GUARD_ALLOWLIST` for commands that are safe in your context
- **Change log location**: Set `TOOL_GUARD_LOG_DIR` to route logs to your preferred directory

## 無効化

To temporarily disable the guardian:

- Set `SKIP_TOOL_GUARD=true` in the hook environment
- Or remove the `preToolUse` entry from `hooks.json`

## 制限事項

- Pattern-based detection; does not perform semantic analysis of command intent
- May produce false positives for commands that match patterns in safe contexts (use the allowlist to suppress these)
- Scans the text representation of tool input; cannot detect obfuscated or encoded commands
- Requires tool invocations to be passed as JSON on stdin with `toolName` and `toolInput` fields

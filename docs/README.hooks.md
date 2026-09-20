# 🪝 Hooks

Hooks enable automated workflows triggered by specific events during GitHub Copilot coding agent sessions, such as session start, session end, user prompts, and tool usage.
### How to Contribute

See [CONTRIBUTING.md](../CONTRIBUTING.md#adding-hooks) for guidelines on how to contribute new hooks, improve existing ones, and share your use cases.

### How to Use Hooks

**What's Included:**
- Each hook is a folder containing a `README.md` file and a `hooks.json` configuration
- Hooks may include helper scripts, utilities, or other bundled assets
- Hooks follow the [GitHub Copilot hooks specification](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/use-hooks)

**To Install:**
- Copy the hook folder to your repository's `.github/hooks/` directory
- Ensure any bundled scripts are executable (`chmod +x script.sh`)
- Commit the hook to your repository's default branch

**To Activate/Use:**
- Hooks automatically execute during Copilot coding agent sessions
- Configure hook events in the `hooks.json` file
- Available events: `sessionStart`, `sessionEnd`, `userPromptSubmitted`, `preToolUse`, `postToolUse`, `errorOccurred`

**When to Use:**
- Automate session logging and audit trails
- Auto-commit changes at session end
- Track usage analytics
- Integrate with external tools and services
- Custom session workflows

| Name | Description | Events | Bundled Assets |
| ---- | ----------- | ------ | -------------- |
| [Attester インポートチェック](../hooks/attester-import-check/README.md) | Copilot coding agent がコードへ書き込む前に、PyPI と npm のパッケージ名を attester.dev の存在確認オラクルで検証し、存在しない依存関係をブロックします | preToolUse | `check-imports.py`<br />`hooks.json` |
| [ガバナンス監査](../hooks/governance-audit/README.md) | Copilot agent のプロンプトを脅威シグナルについて検査し、ガバナンスイベントを記録します | sessionStart, sessionEnd, userPromptSubmitted | `audit-prompt.sh`<br />`audit-session-end.sh`<br />`audit-session-start.sh`<br />`hooks.json` |
| [シークレットスキャナー](../hooks/secrets-scanner/README.md) | Copilot coding agent のセッション中に変更されたファイルから、漏えいしたシークレット、認証情報、機密データを検査します | sessionEnd | `hooks.json`<br />`scan-secrets.sh` |
| [セッションロガー](../hooks/session-logger/README.md) | 監査と分析のために、Copilot coding agent のセッション活動をすべて記録します | sessionStart, sessionEnd, userPromptSubmitted | `hooks.json`<br />`log-prompt.sh`<br />`log-session-end.sh`<br />`log-session-start.sh` |
| [セッション自動コミット](../hooks/session-auto-commit/README.md) | Copilot coding agent のセッション終了時に変更を自動でコミットしてプッシュします | sessionEnd | `auto-commit.sh`<br />`hooks.json` |
| [ツールガーディアン](../hooks/tool-guardian/README.md) | Copilot coding agent が実行する前に、危険なツール操作（破壊的なファイル操作、強制プッシュ、DB削除など）をブロックします | preToolUse | `guard-tool.sh`<br />`hooks.json` |
| [依存関係ライセンスチェッカー](../hooks/dependency-license-checker/README.md) | セッション終了時に新しく追加された依存関係のライセンス適合性（GPL、AGPL など）を確認します | sessionEnd | `check-licenses.sh`<br />`hooks.json` |
| [壊れたリンクの修正](../hooks/fix-broken-links/README.md) | Copilot の各ツール使用後に、変更された Web ファイルのリンク切れと SEO のアンカー問題を確認します。 | postToolUse | `hooks.json`<br />`link-fix.ps1`<br />`link-fix.sh` |

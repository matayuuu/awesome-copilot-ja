# ⚡ Agentic Workflows

[Agentic Workflows](https://github.github.com/gh-aw) are AI-powered repository automations that run coding agents in GitHub Actions. Defined in markdown with natural language instructions, they enable event-triggered and scheduled automation with built-in guardrails and security-first design.
### How to Contribute

See [CONTRIBUTING.md](../CONTRIBUTING.md#adding-agentic-workflows) for guidelines on how to contribute new workflows, improve existing ones, and share your use cases.

### How to Use Agentic Workflows

**What's Included:**
- Each workflow is a single `.md` file with YAML frontmatter and natural language instructions
- Workflows are compiled to `.lock.yml` GitHub Actions files via `gh aw compile`
- Workflows follow the [GitHub Agentic Workflows specification](https://github.github.com/gh-aw)

**To Install:**
- Install the `gh aw` CLI extension: `gh extension install github/gh-aw`
- Copy the workflow `.md` file to your repository's `.github/workflows/` directory
- Compile with `gh aw compile` to generate the `.lock.yml` file
- Commit both the `.md` and `.lock.yml` files

**To Activate/Use:**
- Workflows run automatically based on their configured triggers (schedules, events, slash commands)
- Use `gh aw run <workflow>` to trigger a manual run
- Monitor runs with `gh aw status` and `gh aw logs`

**When to Use:**
- Automate issue triage and labeling
- Generate daily status reports
- Maintain documentation automatically
- Run scheduled code quality checks
- Respond to slash commands in issues and PRs
- Orchestrate multi-step repository automation

| Name | Description | Triggers |
| ---- | ----------- | -------- |
| [OSPOコントリビューターレポート](../workflows/ospo-contributors-report.md) | 組織のリポジトリ全体におけるコントリビューター活動の月次指標です。 | schedule, workflow_dispatch |
| [OSPO古いリポジトリレポート](../workflows/ospo-stale-repos.md) | 組織内の活動がないリポジトリを特定し、アーカイブ推奨レポートを作成します。 | schedule, workflow_dispatch |
| [OSPO組織健全性レポート](../workflows/ospo-org-health.md) | GitHub組織の包括的な週次健全性レポートです。古いIssue/PR、マージ時間分析、コントリビューターランキング、人の対応が必要な項目を示します。 | schedule, workflow_dispatch |
| [OSSリリース適合性チェッカー](../workflows/ospo-release-compliance-checker.md) | 対象リポジトリをオープンソースリリース要件に照らして分析し、詳細な適合性レポートをIssueコメントとして投稿します。 | issues, workflow_dispatch |
| [関連性サマリー](../workflows/relevance-summary.md) | /relevance-check の応答があるすべてのオープンIssueとPRを1件のIssueにまとめる手動実行ワークフロー | workflow_dispatch |
| [関連性チェック](../workflows/relevance-check.md) | Issueまたはプルリクエストがプロジェクトにとって現在も関連性があるか評価するスラッシュコマンド | slash_command, roles |
| [週次コメント同期](../workflows/weekly-comment-sync.md) | 古くなったコードコメントやREADME断片を見つけ、テキストだけを同期更新し、必要に応じてドラフトPRを作成する週次ワークフローです。 | schedule, workflow_dispatch |
| [毎日のIssueレポート](../workflows/daily-issues-report.md) | オープンIssueと最近の活動の日次サマリーをGitHub Issueとして作成します | schedule |

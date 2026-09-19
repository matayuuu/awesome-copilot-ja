# Context Engineering プラグイン

よりよいコンテキスト管理によって GitHub Copilot の効果を最大化するツールと手法です。コード構成のガイドライン、複数ファイル変更を計画する agent、コンテキストを意識した開発向けプロンプトを含みます。

## インストール

```bash
# Using Copilot CLI
copilot plugin install context-engineering@awesome-copilot
```

## 含まれるもの

### Commands (Slash Commands)

| Command | Description |
|---------|-------------|
| `/context-engineering:context-map` | Generate a map of all files relevant to a task before making changes |
| `/context-engineering:what-context-needed` | Ask Copilot what files it needs to see before answering a question |
| `/context-engineering:refactor-plan` | Plan a multi-file refactor with proper sequencing and rollback steps |

### Agents

| Agent | Description |
|-------|-------------|
| `context-architect` | An agent that helps plan and execute multi-file changes by identifying relevant context and dependencies |

## Source

This plugin is part of [Awesome Copilot](https://github.com/github/awesome-copilot), a community-driven collection of GitHub Copilot extensions.

## License

MIT

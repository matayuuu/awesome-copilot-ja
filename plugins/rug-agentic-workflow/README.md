# RUG Agentic Workflow Plugin

オーケストレーター、実装サブエージェント、QAサブエージェントで構成する、ソフトウェア提供を統合管理する3エージェントワークフローです。

## インストール

```bash
# Using Copilot CLI
copilot plugin install rug-agentic-workflow@awesome-copilot
```

## What's Included

### Agents

| Agent | Description |
|-------|-------------|
| `rug-orchestrator` | Pure orchestration agent that decomposes requests, delegates all work to subagents, validates outcomes, and repeats until complete. |
| `swe-subagent` | Senior software engineer subagent for implementation tasks: feature development, debugging, refactoring, and testing. |
| `qa-subagent` | Meticulous QA subagent for test planning, bug hunting, edge-case analysis, and implementation verification. |

## Source

This plugin is part of [Awesome Copilot](https://github.com/github/awesome-copilot), a community-driven collection of GitHub Copilot extensions.

## License

MIT

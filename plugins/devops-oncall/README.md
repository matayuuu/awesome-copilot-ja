# DevOps On-Call プラグイン

DevOps ツールと Azure リソースを使ってインシデントをトリアージし、迅速に対応するための prompts、instructions、chat mode をまとめています。

## インストール

```bash
# Using Copilot CLI
copilot plugin install devops-oncall@awesome-copilot
```

## What's Included

### Commands (Slash Commands)

| Command | Description |
|---------|-------------|
| `/devops-oncall:azure-resource-health-diagnose` | Analyze Azure resource health, diagnose issues from logs and telemetry, and create a remediation plan for identified problems. |
| `/devops-oncall:multi-stage-dockerfile` | Create optimized multi-stage Dockerfiles for any language or framework |

### Agents

| Agent | Description |
|-------|-------------|
| `azure-principal-architect` | Provide expert Azure Principal Architect guidance using Azure Well-Architected Framework principles and Microsoft best practices. |

## Source

This plugin is part of [Awesome Copilot](https://github.com/github/awesome-copilot), a community-driven collection of GitHub Copilot extensions.

## License

MIT

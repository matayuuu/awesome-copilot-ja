# TypeSpec for Microsoft 365 Copilot Plugin

Microsoft 365 Copilotの拡張機能向けに、TypeSpecを使って宣言型エージェントとAPIプラグインを構築するためのプロンプト、指示、リソースの総合コレクションです。

## インストール

```bash
# Using Copilot CLI
copilot plugin install typespec-m365-copilot@awesome-copilot
```

## What's Included

### Commands (Slash Commands)

| Command | Description |
|---------|-------------|
| `/typespec-m365-copilot:typespec-create-agent` | Generate a complete TypeSpec declarative agent with instructions, capabilities, and conversation starters for Microsoft 365 Copilot |
| `/typespec-m365-copilot:typespec-create-api-plugin` | Generate a TypeSpec API plugin with REST operations, authentication, and Adaptive Cards for Microsoft 365 Copilot |
| `/typespec-m365-copilot:typespec-api-operations` | Add GET, POST, PATCH, and DELETE operations to a TypeSpec API plugin with proper routing, parameters, and adaptive cards |

## Source

This plugin is part of [Awesome Copilot](https://github.com/github/awesome-copilot), a community-driven collection of GitHub Copilot extensions.

## License

MIT

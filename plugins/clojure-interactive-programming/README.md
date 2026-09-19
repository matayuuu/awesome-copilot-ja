# Clojure Interactive Programming プラグイン

Clojure instructions、interactive programming chat mode、補助ガイダンスを備えた、REPL を中心とする Clojure ワークフロー向けツールです。

## インストール

```bash
# Using Copilot CLI
copilot plugin install clojure-interactive-programming@awesome-copilot
```

## 含まれるもの

### Commands (Slash Commands)

| Command | Description |
|---------|-------------|
| `/clojure-interactive-programming:remember-interactive-programming` | A micro-prompt that reminds the agent that it is an interactive programmer. Works great in Clojure when Copilot has access to the REPL (probably via Backseat Driver). Will work with any system that has a live REPL that the agent can use. Adapt the prompt with any specific reminders in your workflow and/or workspace. |

### Agents

| Agent | Description |
|-------|-------------|
| `clojure-interactive-programming` | Expert Clojure pair programmer with REPL-first methodology, architectural oversight, and interactive problem-solving. Enforces quality standards, prevents workarounds, and develops solutions incrementally through live REPL evaluation before file modifications. |

## Source

This plugin is part of [Awesome Copilot](https://github.com/github/awesome-copilot), a community-driven collection of GitHub Copilot extensions.

## License

MIT

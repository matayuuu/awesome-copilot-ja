# Awesome Copilot プラグイン

厳選された GitHub Copilot の agents、collections、instructions、prompts、skills を見つけて生成するためのメタプロンプトです。

## インストール

```bash
# Using Copilot CLI
copilot plugin install awesome-copilot@awesome-copilot
```

## 前提条件

- [Docker](https://www.docker.com/) must be installed and available on your `PATH`.
- The plugin starts its bundled MCP server by running `docker run ... ghcr.io/microsoft/mcp-dotnet-samples/awesome-copilot:latest`.

## 含まれるもの

### Commands (Slash Commands)

| Command | Description |
|---------|-------------|
| `/awesome-copilot:suggest-awesome-github-copilot-collections` | Suggest relevant GitHub Copilot collections from the awesome-copilot repository based on current repository context and chat history, providing automatic download and installation of collection assets, and identifying outdated collection assets that need updates. |
| `/awesome-copilot:suggest-awesome-github-copilot-instructions` | Suggest relevant GitHub Copilot instruction files from the awesome-copilot repository based on current repository context and chat history, avoiding duplicates with existing instructions in this repository, and identifying outdated instructions that need updates. |
| `/awesome-copilot:suggest-awesome-github-copilot-agents` | Suggest relevant GitHub Copilot Custom Agents files from the awesome-copilot repository based on current repository context and chat history, avoiding duplicates with existing custom agents in this repository, and identifying outdated agents that need updates. |
| `/awesome-copilot:suggest-awesome-github-copilot-skills` | Suggest relevant GitHub Copilot skills from the awesome-copilot repository based on current repository context and chat history, avoiding duplicates with existing skills in this repository, and identifying outdated skills that need updates. |

### Agents

| Agent | Description |
|-------|-------------|
| `meta-agentic-project-scaffold` | Meta agentic project creation assistant to help users create and manage project workflows effectively. |

### MCP server

このプラグインには [`./mcp.json`](./mcp.json) で構成された `awesome-copilot` MCP server が含まれます。Docker を利用できない場合、MCP の起動に失敗します。

## ソース

このプラグインは、コミュニティ主導の GitHub Copilot 拡張機能コレクションである [Awesome Copilot](https://github.com/github/awesome-copilot) の一部です。

## ライセンス

MIT

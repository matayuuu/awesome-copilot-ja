---
name: microsoft-docs
description: 'Microsoft Learn などの公式ドキュメントから、Azure、.NET、Agent Framework、Aspire、VS Code、GitHub などの概念、チュートリアル、コード例を検索する。Microsoft Learn MCP を既定として使用し、learn.microsoft.com に存在しないコンテンツについては Context7 と Aspire MCP を併用する。'
---

# Microsoft Docs

Microsoft テクノロジー エコシステム向けの調査スキル。learn.microsoft.com と、それ以外に存在するドキュメント（VS Code、GitHub、Aspire、Agent Framework リポジトリ）を対象とする。

---

## 既定: Microsoft Learn MCP

learn.microsoft.com 上のあらゆるコンテンツに対しては、次のツールを使用する — Azure、.NET、M365、Power Platform、Agent Framework、Semantic Kernel、Windows など。これは Microsoft ドキュメントの大半で主なツールとなる。

| ツール | 目的 |
|------|---------|
| `microsoft_docs_search` | learn.microsoft.com を検索 — 概念、ガイド、チュートリアル、設定 |
| `microsoft_code_sample_search` | Learn ドキュメントから動作するコードスニペットを検索する。最良の結果を得るには `language`（`python`、`csharp` など）を指定する |
| `microsoft_docs_fetch` | 特定の URL からページ全体の内容を取得する（検索結果の抜粋で十分でない場合） |

`microsoft_docs_fetch` は、完全なチュートリアルやすべての設定オプションが必要な場合、または検索結果の抜粋が途中で切れている場合に、検索後に使用する。

### CLI の代替手段

Learn MCP サーバーが利用できない場合は、代わりにターミナルやシェル（たとえば Bash、PowerShell、cmd）から `mslearn` CLI を使用する:

```bash
# Run directly (no install needed)
npx @microsoft/learn-cli search "BlobClient UploadAsync Azure.Storage.Blobs"

# Or install globally, then run
npm install -g @microsoft/learn-cli
mslearn search "BlobClient UploadAsync Azure.Storage.Blobs"
```

| MCP ツール | CLI コマンド |
|----------|-------------|
| `microsoft_docs_search(query: "...")` | `mslearn search "..."` |
| `microsoft_code_sample_search(query: "...", language: "...")` | `mslearn code-search "..." --language ...` |
| `microsoft_docs_fetch(url: "...")` | `mslearn fetch "..."` |

さらに処理するために、`search` または `code-search` に `--json` を渡して生の JSON 出力を取得する。

---

## 例外: 他のツールを使う場合

次のカテゴリは learn.microsoft.com の外にある。指定されたツールを代わりに使う。

### .NET Aspire — Aspire MCP Server（推奨）または Context7 を使用

Aspire のドキュメントは Learn ではなく **aspire.dev** にある。最適なツールは Aspire CLI のバージョンによって異なる:

**CLI 13.2+**（推奨） — Aspire MCP サーバーには組み込みのドキュメント検索ツールが含まれている:

| MCP ツール | 説明 |
|----------|-------------|
| `list_docs` | aspire.dev から利用可能なドキュメントを一覧表示する |
| `search_docs` | aspire.dev コンテンツ全体を対象とした重み付き語彙検索 |
| `get_doc` | slug で特定のドキュメントを取得する |

これらは Aspire CLI 13.2 で導入された ([PR #14028](https://github.com/dotnet/aspire/pull/14028))。更新するには: `aspire update --self --channel daily`。参照: https://davidpine.dev/posts/aspire-docs-mcp-tools/

**CLI 13.1** — MCP サーバーは統合の参照（`list_integrations`、`get_integration_docs`）を提供するが、ドキュメント検索は提供しない。Context7 にフォールバックする:

| Library ID | 用途 |
|---|---|
| `/microsoft/aspire.dev` | 主要 — ガイド、統合、CLI リファレンス、デプロイ |
| `/dotnet/aspire` | ランタイム ソース — API の内部実装、実装の詳細 |
| `/communitytoolkit/aspire` | コミュニティ統合 — Go、Java、Node.js、Ollama |

### VS Code — Context7 を使用

VS Code のドキュメントは **code.visualstudio.com** にあり、Learn ではない。

| Library ID | 用途 |
|---|---|
| `/websites/code_visualstudio` | ユーザー向けドキュメント — 設定、機能、デバッグ、リモート開発 |
| `/websites/code_visualstudio_api` | 拡張機能 API — WebView、TreeView、コマンド、貢献ポイント |

### GitHub — Context7 を使用

GitHub のドキュメントは **docs.github.com** と **cli.github.com** にある。

| Library ID | 用途 |
|---|---|
| `/websites/github_en` | Actions、API、リポジトリ、セキュリティ、管理、Copilot |
| `/websites/cli_github` | GitHub CLI (`gh`) のコマンドとフラグ |

### Agent Framework — Learn MCP + Context7 を使用

Agent Framework のチュートリアルは learn.microsoft.com にある（`microsoft_docs_search` を使用）、一方で **GitHub リポジトリ** には公開済みドキュメントよりも先行する API レベルの詳細が多く含まれている — 特に DevUI REST API リファレンス、CLI オプション、.NET 統合が該当する。

| Library ID | 用途 |
|---|---|
| `/websites/learn_microsoft_en-us_agent-framework` | チュートリアル — DevUI ガイド、トレース、ワークフロー オーケストレーション |
| `/microsoft/agent-framework` | API 詳細 — DevUI REST エンドポイント、CLI フラグ、認証、.NET `AddDevUI`/`MapDevUI` |

**DevUI のヒント:** ハウツー ガイドには Learn の Web サイト ソースを使い、API レベルの詳細（エンドポイント スキーマ、プロキシ設定、認証トークン）にはリポジトリソースを使う。

---

## Context7 の設定

Context7 のクエリを実行する際は、まずライブラリ ID を解決する（セッションごとに一度だけ）:

1. 技術名を指定して `mcp_context7_resolve-library-id` を呼び出す
2. 返された library ID と具体的なクエリを使って `mcp_context7_query-docs` を呼び出す

---

## 効果的なクエリの書き方

具体的にする — バージョン、意図、言語を含める:

```
# ❌ Too broad
"Azure Functions"
"agent framework"

# ✅ Specific
"Azure Functions Python v2 programming model"
"Cosmos DB partition key design best practices"
"GitHub Actions workflow_dispatch inputs matrix strategy"
"Aspire AddUvicornApp Python FastAPI integration"
"DevUI serve agents tracing OpenTelemetry directory discovery"
"Agent Framework workflow conditional edges branching handoff"
```

コンテキストを含める:
- **バージョン** が必要な場合（`.NET 8`、`Aspire 13`、`VS Code 1.96`）
- **タスクの意図**（`quickstart`、`tutorial`、`overview`、`limits`、`API reference`）
- 多言語ドキュメントの場合は **言語**（`Python`、`TypeScript`、`C#`）

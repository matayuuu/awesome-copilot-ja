---
name: dotnet-mcp-builder
description: 'Build Model Context Protocol (MCP) servers in C#/.NET against the current ModelContextProtocol 2.x NuGet packages. Helps with cases the model gets wrong without guidance — stale versions (0.x preview or 1.x-era defaults), the v2 stateless-by-default HTTP flip, the 2026-07-28 spec deprecations (roots/sampling/logging), MCP Apps and Tasks extension packages, elicitation URL mode, per-session HTTP wiring, OAuth and reverse-proxy deploy specifics, and debugging MapMcp / STDIO / Streamable-HTTP errors. Also covers STDIO and Streamable HTTP transports (SSE is deprecated), tools, prompts, resources, completions, and a basic .NET MCP client. Trigger when the user says or implies any .NET MCP server work: ModelContextProtocol, McpServerTool, MapMcp, WithStdioServerTransport, "MCP server in C#", "MCP tool in dotnet", "expose this as MCP", or names a primitive (prompt/resource/elicitation/MCP App) in a .NET context. Skip for MCP work in other languages.'
---

# .NET での MCP サーバー構築

このスキルは、Microsoft と MCP プロジェクトが管理する **公式** の [`ModelContextProtocol`](https://www.nuget.org/profiles/ModelContextProtocol) NuGet パッケージを使って、C#/.NET で本番品質の MCP サーバーと基本的なクライアントを記述するための支援を行います。**安定した 2.x** 系列と現在の仕様（2026-07-28）を対象とします。

## このスキルが役立つとき

.NET MCP SDK は `0.x-preview` で数年にわたりプレビュー パッケージを経て `1.0` に到達し、v2 では既定値がいくつか入れ替わりました。手助けがないと、モデルは次のようなことをしがちです:
- 現在のサンプルと互換性がなくコンパイルできない古いプレビュー バージョンを固定してしまう。
- v2 で逆転した 1.x 時代の既定値を適用してしまう（HTTP は既定で stateful だったが、2.x では `Stateless` が `true` を既定にする）。
- 2026-07-28 仕様で非推奨になった機能（roots、sampling、MCP-channel logging — 現在は `[Obsolete]`、警告 `MCP9005`）を推奨してしまう。
- 新しい仕様機能を見落とす（multi-round-trip `input_required`、discovery-first negotiation、MCP Apps/Tasks 拡張パッケージ、elicitation URL モード、structured content blocks）。
- HTTP トランスポートの詳細を誤る（stateful/stateless、proxy buffering、OAuth wiring）。
- STDIO の stdout/stderr の落とし穴を忘れる。

そのようなタスクなら、*対応する参照を読み込み*、それに従ってください。もし本当に簡単な場合（例: 「このツール メソッドの名前を変える」）なら、すべて読む必要はありません — 以下の基本ルールが最低限です。

## 30 秒でわかるメンタルモデル

.NET MCP サーバーは、MCP サーバーを DI 経由で接続する通常の `Microsoft.Extensions.Hosting`（または `WebApplication`）アプリです。

```csharp
builder.Services
    .AddMcpServer()
    .WithStdioServerTransport()      // OR .WithHttpTransport(...)
    .WithToolsFromAssembly()         // discover [McpServerToolType] classes
    .WithPrompts<MyPrompts>()        // optional
    .WithResources<MyResources>();   // optional
```

プリミティブは、属性付きクラスで定義された通常の C# メソッドです（`[McpServerToolType]` + `[McpServerTool]`、`[McpServerPromptType]` + `[McpServerPrompt]`、`[McpServerResourceType]` + `[McpServerResource]`）。パラメータは JSON-RPC からバインドされ、SDK はシグネチャと `[Description]` 属性から JSON Schema を生成します。

サーバー → クライアント機能（elicitation、progress notifications、および現在非推奨の sampling/roots/log notifications）は、注入された `IMcpServer` のメソッドです。

## 判断木 → どの参照を読み込むか

新しいプロジェクトを作成する場合、または現在のパッケージ バージョンが不明な場合は、常に `references/packages.md` を読み込んでください。

| タスク | 読み込むもの |
|---|---|
| 新しい STDIO サーバー | `references/transport-stdio.md` |
| 新しい HTTP（Streamable）サーバー | `references/transport-http.md` |
| ツールの追加/変更 | `references/tool-primitive.md` |
| プロンプトの追加/変更 | `references/prompt-primitive.md` |
| リソースの追加/変更 | `references/resource-primitive.md` |
| ツール実行中にユーザーへ質問する | `references/elicitation.md` |
| ツール内でクライアントの LLM を呼び出す（2026-07-28 で非推奨） | `references/sampling.md` |
| ユーザーのプロジェクト ルートを読む（2026-07-28 で非推奨） | `references/roots.md` |
| 対話型 UI を返す | `references/mcp-apps.md` |
| 引数補完、ログ/進行通知、フィルター、サーバー指示 | `references/server-features.md` |
| MCP サーバーを **利用する** .NET プログラムを書く | `references/client.md` |
| MCP Inspector、インメモリ テスト、モック、CI | `references/testing.md` |

複数プリミティブを扱うタスクでは、いくつかまとめて読み込んでください。既存ファイルの簡単な修正では、通常は何も読み込む必要はありません。

## 基本ルール（常に適用; これらが最頻出の破損を防ぐ）

1. **プレビューではなく現在の安定版パッケージを固定する。** 最新の **2.x** で `ModelContextProtocol` / `ModelContextProtocol.AspNetCore` / `ModelContextProtocol.Core` を使ってください。`0.3-preview` または `0.4-preview` を書いてしまうなら、NuGet を確認して止めてください — プレビュー API には破壊的な違いがあります。1.x でも動きますが、2026-07-28 仕様より古いものです。
2. **STDIO サーバーは stdout に書き込んではいけません。** Stdout は JSON-RPC チャネルです。`LogToStandardErrorThreshold = LogLevel.Trace` を最優先で設定し、ツール内では絶対に `Console.WriteLine` しないでください。
3. **HTTP は 2.x では既定で stateless です**（v1.x は stateful が既定で、これは v2 で最も大きな破壊的変更です）。2026-07-28 版には HTTP セッション自体がありません: `Stateless = false` を設定するとそのリビジョンを拒否し、レガシーの `initialize` フォールバック経由でクライアントに応答します。現在のプロトコル HTTP で「ツール実行中にユーザーに質問する」には、multi-round-trip `InputRequiredException` パターンを使ってください。stateful HTTP（または STDIO）は、レガシー `ElicitAsync`/sampling/roots パスとプッシュ通知にだけ確保してください。
4. **SSE のみは非推奨です。** Streamable HTTP を使ってください。サポートが必要な古いクライアントに対してのみ、レガシー SSE（`EnableLegacySse = true`）を有効にし、それを明示してください。
5. **非推奨機能を前提に新しいサーバーを設計しないでください。** 2026-07-28 仕様では roots、sampling、MCP-channel logging が非推奨になっており、SDK はこれらを `[Obsolete]`（警告 `MCP9005`）として扱います。これらは下位互換のクライアントでは動作しますが、新しい設計では multi-round-trip `input_required` パターンと `ILogger` ロギングを優先してください。`MCP9005` は文書化された移行措置としてのみ抑制してください。
6. **ツールとパラメータを常に `[Description]` してください。** これは LLM が呼び出しを選択し、形を整えるときに見ている内容です。曖昧な説明はツールが使われない最大の理由です。
7. **プリミティブを追加するたびに登録行を表示してください。** `[McpServerPromptType]` クラスに `.WithPrompts<...>()`（または `.WithPromptsFromAssembly()`）がないと見えません。
8. **API を勝手に作らないでください。** メソッドが存在するか不明な場合は、そのことを伝えたうえで [API リファレンス](https://csharp.sdk.modelcontextprotocol.io/api/ModelContextProtocol.html) を確認してください — 間違ったメソッド名は静かに失敗します。これは新しい v2 拡張パッケージ（`ModelContextProtocol.Extensions.Tasks`、`ModelContextProtocol.Extensions.Apps`）にも同様に当てはまり、コードを書く前にドキュメントを確認してください。

## 作業スタイル

- **最小限で加算的な変更を行う。** プロジェクトを再構成するよりも、既存のツール クラスにメソッドを追加してください。
- **簡単ではないセットアップでは `dotnet build` を実行する。** 未使用 using の不足、属性のタイプミス、TFM の不一致をユーザーに見せる前に検出できます。
- **コンテキストが明確でない場合は、トランスポート + .NET バージョン + プリミティブを確認してからスキャフォールディングする** こと。新しいプロジェクトでは既定で **.NET 10** を使ってください。

## ユーザーが行き詰まったとき

推測する前に、このチェックリストを確認してください:
1. **STDIO:** stdout に何かを書き込んでいるものがある（logger sink、`Console.WriteLine`、ライブラリ バナー）。
2. **HTTP 404:** パスのミスマッチ — `app.MapMcp()` がルートで、`app.MapMcp("/mcp")` は `/mcp` 配下に置きます。
3. **ツールが表示されない:** クラスに `[McpServerToolType]` がない、または `.WithToolsFromAssembly()` / `.WithTools<T>()` が登録されていません。
4. **引数がバインドされない:** パラメータ名は JSON-RPC の `arguments` キーと一致している必要があり、複雑な型は `System.Text.Json` を介してバインドされます。
5. **Sampling/elicitation/roots が失敗する:** これらのレガシーなサーバー → クライアント呼び出しは現在のプロトコル HTTP では実行できません — multi-round-trip `InputRequiredException` パターンへ移行するか、（レガシー パスのみ）`Stateless = false` を設定してください。これにより HTTP クライアントがダウンレベルの `initialize` リビジョンに固定されることに注意してください。また、クライアントが実際にその機能を提示しているかも確認してください。
6. **2.x へのアップグレード後に `MCP9005` のビルド警告が出る:** コードが非推奨の roots/sampling/logging API を使用しています。移行計画を立て、抑制は一時的にだけ行ってください。

それでも解決できない場合は、ユーザーに [`EverythingServer`](https://github.com/modelcontextprotocol/csharp-sdk/tree/main/samples/EverythingServer) のサンプルを示してください — これはあらゆる機能を実演しています。

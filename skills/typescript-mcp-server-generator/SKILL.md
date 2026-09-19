---
name: typescript-mcp-server-generator
description: 'MCP TypeScript SDK v2（@modelcontextprotocol/server）を使い、ツール、リソース、適切な設定を備えた完全なTypeScript MCPサーバープロジェクトを生成します。'
---
# TypeScript MCPサーバーの生成

次の仕様に従い、**MCP TypeScript SDK v2**を使った完全なModel Context Protocol（MCP）サーバーをTypeScriptで作成します。

## 要件

1. **プロジェクト構造**：適切なディレクトリ構造を持つ新しいTypeScript／Node.jsプロジェクトを作成する
2. **NPMパッケージ**：v1の単一パッケージ`@modelcontextprotocol/sdk`は廃止されています。v2の目的別パッケージを使う：
   - `@modelcontextprotocol/server` — サーバー実装（`@modelcontextprotocol/server/stdio`サブパス経由のstdio transport）
   - `@modelcontextprotocol/node` — Node HTTP transport（`NodeStreamableHTTPServerTransport`）、またはフレームワークアダプター：`@modelcontextprotocol/express`、`@modelcontextprotocol/hono`、`@modelcontextprotocol/fastify` — 各アダプターと併せて対応するピアフレームワークをインストールする必要がある（例：`@modelcontextprotocol/express` + `express`）
   - `@modelcontextprotocol/core` — 共有プロトコルスキーマ（`*Schema`定数は` sdk/types.js`ではなく、ここからimportする）
   - `zod@^4.2` — v2ではZod 4.2以降が必要です。zod@3は使わない
3. **実行環境**：Node.js 20以降（v2の最小要件）。`"type": "module"`によるESM優先とする（CommonJSビルドも提供されるため、必要なら`require()`も使える）
4. **サーバーの種類**：HTTP（Streamable HTTP transport）またはstdioベースのサーバーを選ぶ。SSEとWebSocket transportはv2で削除されているため生成しない
5. **ツール**：適切なスキーマ検証を備えた有用なツールを少なくとも1つ作成する
6. **エラー処理**：包括的なエラー処理と検証を含める

## 実装の詳細

### プロジェクトのセットアップ
- `npm init`で初期化し、package.jsonを作成する
- 依存関係をインストールする：`@modelcontextprotocol/server`、`zod@^4.2`、transportパッケージ。通常のNode HTTPには`@modelcontextprotocol/node`、フレームワークアダプターには対応するピアフレームワークも追加する（例：`npm install @modelcontextprotocol/express express`）
- package.jsonの`"type": "module"`でTypeScriptをESモジュールとして設定する
- 開発用依存関係として`tsx`または`ts-node`を追加する
- 適切な.gitignoreファイルを作成する

### サーバーの設定
- 高水準の実装には`@modelcontextprotocol/server`の`McpServer`クラスを使う
- サーバー名とバージョンを設定する
- 適切なtransportを選ぶ：
  - HTTP（Node）：`@modelcontextprotocol/node`の`NodeStreamableHTTPServerTransport`
  - HTTP（Web Standard実行環境）：`@modelcontextprotocol/server`の`WebStandardStreamableHTTPServerTransport`
  - stdio：`@modelcontextprotocol/server/stdio`の`StdioServerTransport`
- HTTPでは、適切なミドルウェアとエラー処理を備えたフレームワークアダプター（`@modelcontextprotocol/express`など）を優先する
- v2はWeb Standardの`Headers`／`Request`型を使う。ヘッダーは`ctx.http?.req?.headers.get('x-custom')`で読む

### ツールの実装
- 設定オブジェクトを指定して`registerTool()`を使う。v1の可変長`.tool()`シグネチャは廃止されている：
  ```typescript
  server.registerTool('greet', {
    description: 'Greet user',
    inputSchema: z.object({ name: z.string() })
  }, async ({ name }, ctx) => {
    return { content: [{ type: 'text', text: `Hello, ${name}!` }] };
  });
  ```
- スキーマは完全なZodオブジェクト（`z.object({...})`）にする。生のshapeオブジェクト（`{ name: z.string() }`）は非推奨
- 明確な`title`と`description`フィールドを指定する
- 結果には`content`と`structuredContent`の両方を返す
- ハンドラーの第2引数は構造化された`ctx`オブジェクトで、v1の`extra`に代わる。`ctx.mcpReq.signal`、`ctx.mcpReq.id`、`ctx.mcpReq.send(...)`、`ctx.mcpReq.notify(...)`を使う
- try-catchブロックで適切にエラー処理する。v1の`McpError`／`StreamableHTTPError`ではなく、v2のエラー階層（`.status`を持つ`ProtocolError`、`SdkError`、`SdkHttpError`）を使う
- 適切な場合は非同期操作に対応する

### リソース／プロンプトの設定（任意）
- ResourceTemplateを使う`registerResource()`で動的URIのリソースを追加する
- `registerTool()`と同じ設定オブジェクト形式で、引数スキーマを持つ`registerPrompt()`によりプロンプトを追加する
- UX向上のため補完対応を検討する。v2の`completable()`のラッパー順序は`completable(z.string(), callback).optional()`（optionalは外側に適用）である点に注意する

### コード品質
- 型安全性のためTypeScriptを使う
- async／awaitパターンを一貫して使う
- transportのcloseイベントで適切なクリーンアップを実装する
- 設定には環境変数を使う
- 複雑なロジックにはインラインコメントを追加する
- 関心の分離が明確になるようコードを構成する

## 検討するツールの種類の例
- データの処理と変換
- 外部APIとの統合
- ファイルシステム操作（読み取り、検索、分析）
- データベースクエリ
- テキスト分析または要約（複数ラウンドの`input_required`パターンによるLLM支援）
- システム情報の取得

## 設定オプション
- **HTTPサーバーの場合**：
  - 環境変数によるポート設定
  - ブラウザークライアント向けのCORS設定
  - セッション管理（ステートレスとステートフルの選択）
  - ローカルサーバー向けのDNSリバインディング対策
  - 厳密な`Content-Type`処理：v2は`application/json`以外のPOST bodyを拒否する

- **stdioサーバーの場合**：
  - stdin／stdoutの適切な処理
  - 環境変数による設定
  - プロセスライフサイクル管理

## 既存のv1サーバーを移行する
- 最初に公式codemodを実行する：`npx @modelcontextprotocol/codemod@latest v1-to-v2 .`
- 次に、手動判断が必要な部分（transportの選択、ヘッダーの読み取り、エラー分類）を示す`@mcp-codemod-error`マーカーを検索する
- `McpError + ErrorCode`のチェックを新しいエラークラスに置き換える。HTTPステータスは`error.code`ではなく`error.status`にある
- `Server.createMessage()`、`listRoots()`、`sendLoggingMessage()`と、`roots`／`sampling`／`logging` capabilityフィールドはv2で非推奨なので、新しいコードでは避ける

## テストの指針
- サーバーの実行方法（`npm start`または`npx tsx server.ts`）を説明する
- MCP Inspectorのコマンド`npx @modelcontextprotocol/inspector`を示す
- HTTPサーバーでは接続URL`http://localhost:PORT/mcp`を含める
- ツール呼び出しの例を含める
- よくある問題のトラブルシューティングを追加する

## 検討する追加機能
- 複数ラウンドの`input_required`パターンを使うLLM搭載ツール（非推奨のサンプリングサブシステムに代わるv2の方式）
- インタラクティブなワークフローのユーザー入力収集
- 有効化／無効化機能を備えた動的なツール登録
- 一括更新向けの通知デバウンス
- 効率的なデータ参照のためのリソースリンク

包括的なドキュメント、型安全性、エラー処理を備えた、完全で本番利用可能なMCPサーバーを生成します。

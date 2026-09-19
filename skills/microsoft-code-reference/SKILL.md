---
name: microsoft-code-reference
description: 'Microsoft API リファレンスを検索し、動作するコード サンプルを見つけ、SDK コードが正しいことを検証します。Azure SDK、.NET ライブラリ、または Microsoft API を扱うときに、適切なメソッドの検索、パラメーターの確認、動作する例の取得、エラーのトラブルシューティングに使用します。公式ドキュメントを照会して、存在しないメソッド、誤ったシグネチャ、非推奨のパターンを検出します。'
compatibility: Microsoft Learn MCP Server (https://learn.microsoft.com/api/mcp) で最適に動作します。フォールバックとして mslearn CLI も使用できます。
---

# Microsoft コード リファレンス

## ツール

| 必要なもの | ツール | 例 |
|------|------|---------|
| API メソッド/クラスの検索 | `microsoft_docs_search` | `"BlobClient UploadAsync Azure.Storage.Blobs"` |
| 動作するコード サンプル | `microsoft_code_sample_search` | `query: "upload blob managed identity", language: "python"` |
| 完全な API リファレンス | `microsoft_docs_fetch` | `microsoft_docs_search` から URL を取得します（オーバーロード、完全なシグネチャ向け） |

## コード サンプルを探す

公式の動作する例を取得するには、`microsoft_code_sample_search` を使用します。

```
microsoft_code_sample_search(query: "upload file to blob storage", language: "csharp")
microsoft_code_sample_search(query: "authenticate with managed identity", language: "python")
microsoft_code_sample_search(query: "send message service bus", language: "javascript")
```

**使用する場面:**
- コードを書く前 — 手本にする動作するパターンを探します
- エラー発生後 — 自分のコードを既知の正常なサンプルと比較します
- 初期化/セットアップに自信がない場合 — サンプルが完全なコンテキストを示します

## API の検索

```
# メソッドが存在することを検証します（正確性のため名前空間を含めます）
"BlobClient UploadAsync Azure.Storage.Blobs"
"GraphServiceClient Users Microsoft.Graph"

# クラス/インターフェイスを探します
"DefaultAzureCredential class Azure.Identity"

# 正しいパッケージを探します
"Azure Blob Storage NuGet package"
"azure-storage-blob pip package"
```

メソッドに複数のオーバーロードがある場合や、完全なパラメーター詳細が必要な場合は、完全なページを取得します。

## エラーのトラブルシューティング

`microsoft_code_sample_search` を使用して動作するコード サンプルを探し、実装と比較します。特定のエラーには、`microsoft_docs_search` と `microsoft_docs_fetch` を使用します。

| エラーの種類 | クエリ |
|------------|-------|
| メソッドが見つからない | `"[ClassName] methods [Namespace]"` |
| 型が見つからない | `"[TypeName] NuGet package namespace"` |
| シグネチャが誤っている | `"[ClassName] [MethodName] overloads"` → 完全なページを取得 |
| 非推奨の警告 | `"[OldType] migration v12"` |
| 認証の失敗 | `"DefaultAzureCredential troubleshooting"` |
| 403 Forbidden | `"[ServiceName] RBAC permissions"` |

## 検証する場面

次の場合は必ず検証します。
- メソッド名が「都合よすぎる」ように思える場合（`UploadFile` と実際の `Upload`）
- SDK バージョンを混在させる場合（v11 の `CloudBlobClient` と v12 の `BlobServiceClient`）
- パッケージ名が規則に従っていない場合（.NET では `Azure.*`、Python では `azure-*`）
- API を初めて使用する場合

## 検証ワークフロー

Microsoft SDK を使用するコードを生成する前に、それが正しいことを検証します。

1. **メソッドまたはパッケージが存在することを確認** — `microsoft_docs_search(query: "[ClassName] [MethodName] [Namespace]")`
2. **完全な詳細を取得**（オーバーロード/複雑なパラメーター向け） — `microsoft_docs_fetch(url: "...")`
3. **動作するサンプルを検索** — `microsoft_code_sample_search(query: "[task]", language: "[lang]")`

単純な検索では、手順 1 だけで十分な場合があります。複雑な API 使用では、3 つの手順をすべて完了してください。

## CLI の代替手段

Learn MCP サーバーを利用できない場合は、代わりにターミナルまたはシェル（たとえば Bash、PowerShell、cmd）から `mslearn` CLI を使用します。

```sh
# 直接実行します（インストールは不要です）
npx @microsoft/learn-cli search "BlobClient UploadAsync Azure.Storage.Blobs"

# またはグローバルにインストールしてから実行します
npm install -g @microsoft/learn-cli
mslearn search "BlobClient UploadAsync Azure.Storage.Blobs"
```

| MCP ツール | CLI コマンド |
|----------|-------------|
| `microsoft_docs_search(query: "...")` | `mslearn search "..."` |
| `microsoft_code_sample_search(query: "...", language: "...")` | `mslearn code-search "..." --language ...` |
| `microsoft_docs_fetch(url: "...")` | `mslearn fetch "..."` |

追加処理用の生の JSON 出力を取得するには、`search` または `code-search` に `--json` を渡します。

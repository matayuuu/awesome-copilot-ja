---
name: dotnet-best-practices
description: 'Ensure .NET/C# code meets best practices for the solution/project.'
---

# .NET/C# ベストプラクティス

あなたのタスクは、${selection} 内の .NET/C# コードがこのソリューション/プロジェクトに特有のベストプラクティスに準拠していることを確認することです。これには以下が含まれます：

## ドキュメント & 構造

- すべてのパブリック クラス、インターフェース、メソッド、プロパティに対する包括的な XML ドキュメント コメントを作成する
- XML コメントにパラメータの説明と戻り値の説明を含める
- 確立されたネームスペース構造に従う: {Core|Console|App|Service}.{Feature}

## デザインパターン & アーキテクチャ

- 依存性注入のためにプライマリ コンストラクタ構文を使用する (例: `public class MyClass(IDependency dependency)`)
- ジェネリック基本クラスを使用した Command Handler パターンを実装する (例: `CommandHandler<TOptions>`)
- インターフェース分離を明確な命名規則で使用する (インターフェースの前に 'I' を付ける)
- 複雑なオブジェクト作成に Factory パターンを従う

## 依存性注入 & サービス

- ArgumentNullException による null チェック付きコンストラクタ依存性注入を使用する
- 適切なライフタイム (Singleton、Scoped、Transient) でサービスを登録する
- Microsoft.Extensions.DependencyInjection パターンを使用する
- テスト可能性のためにサービス インターフェースを実装する

## リソース管理 & ローカライズ

- ローカライズされたメッセージとエラー文字列に ResourceManager を使用する
- LogMessages と ErrorMessages リソース ファイルを分離する
- `_resourceManager.GetString("MessageKey")` 経由でリソースにアクセスする

## 非同期/待機パターン

- すべての I/O 操作と長時間実行タスクに async/await を使用する
- 非同期メソッドから Task または Task<T> を返す
- 必要に応じて ConfigureAwait(false) を使用する
- 非同期例外を適切に処理する

## テスト標準

- FluentAssertions を使用した MSTest フレームワークを使用する
- AAA パターン (Arrange、Act、Assert) に従う
- 依存性をモックするために Moq を使用する
- 成功シナリオと失敗シナリオの両方をテストする
- null パラメータ検証テストを含める

## 構成 & 設定

- データ アノテーション付きの厳密に型指定された構成クラスを使用する
- 検証属性 (Required、NotEmptyOrWhitespace) を実装する
- 設定に IConfiguration バインディングを使用する
- appsettings.json 構成ファイルをサポートする

## Semantic Kernel & AI 統合

- AI 操作に Microsoft.SemanticKernel を使用する
- 適切なカーネル構成とサービス登録を実装する
- AI モデル設定 (ChatCompletion、Embedding など) を処理する
- 信頼性の高い AI 応答に対して構造化された出力パターンを使用する

## エラー処理 & ログ記録

- Microsoft.Extensions.Logging を使用した構造化ログを使用する
- 意味のあるコンテキストでスコープ付きログを含める
- 説明的なメッセージで特定の例外をスロー する
- 想定される失敗シナリオに対して try-catch ブロックを使用する

## パフォーマンス & セキュリティ

- C# 12 以上の機能と .NET 8 の最適化が適切な場合に使用する
- 適切な入力検証とサニタイズを実装する
- データベース操作にパラメータ化されたクエリを使用する
- AI/ML 操作に対する安全なコーディング プラクティスに従う

## コード品質

- SOLID 原則の準拠を確保する
- 基本クラスとユーティリティを通じてコード重複を避ける
- ドメイン概念を反映する意味のある名前を使用する
- メソッドをフォーカスし、凝集性を保つ
- リソースの適切な破棄パターンを実装する

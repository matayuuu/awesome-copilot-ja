---
name: dotnet-design-pattern-review
description: 'Review the C#/.NET code for design pattern implementation and suggest improvements.'
---

# .NET/C# デザインパターンレビュー

${selection} の C#/.NET コードについて、デザインパターンの実装をレビューし、ソリューション/プロジェクトの改善案を提案します。コードには一切変更を加えず、レビューのみを提供してください。

## 必須デザインパターン

- **Command Pattern**: 汎用基底クラス（`CommandHandler<TOptions>`）、`ICommandHandler<TOptions>` interface、`CommandHandlerOptions` 継承、static `SetupCommand(IHost host)` メソッド
- **Factory Pattern**: 複雑なオブジェクト生成のサービスプロバイダー統合
- **Dependency Injection**: プライマリコンストラクター構文、`ArgumentNullException` null チェック、interface 抽象化、適切なサービスライフタイム
- **Repository Pattern**: 接続用の非同期データアクセス interface プロバイダー抽象化
- **Provider Pattern**: 外部サービス抽象化（database、AI）、明確な契約、構成処理
- **Resource Pattern**: ローカライズされたメッセージ用の ResourceManager、個別の .resx ファイル（LogMessages、ErrorMessages）

## レビューチェックリスト

- **Design Patterns**: 使用されているパターンを特定する。Command Handler、Factory、Provider、Repository パターンは正しく実装されているか？有益だが不足しているパターンはあるか？
- **Architecture**: namespace 規約（`{Core|Console|App|Service}.{Feature}`）に従っているか？Core/Console プロジェクト間の分離は適切か？モジュール化され、読みやすいか？
- **.NET Best Practices**: プライマリコンストラクター、Task を返す async/await、ResourceManager の使用、構造化ログ、厳密に型指定された構成は使われているか？
- **GoF Patterns**: Command、Factory、Template Method、Strategy パターンは正しく実装されているか？
- **SOLID Principles**: Single Responsibility、Open/Closed、Liskov Substitution、Interface Segregation、Dependency Inversion の違反はないか？
- **Performance**: 適切な async/await、リソース破棄、ConfigureAwait(false)、並列処理の機会はあるか？
- **Maintainability**: 関心の明確な分離、一貫したエラー処理、適切な構成の使用はできているか？
- **Testability**: 依存関係は interface 経由で抽象化されているか、コンポーネントはモック可能か、非同期テストが可能か、AAA パターンと互換性があるか？
- **Security**: 入力検証、安全な認証情報の取り扱い、パラメーター化クエリ、安全な例外処理はできているか？
- **Documentation**: public API の XML docs、パラメーター/戻り値の説明、リソースファイルの整理はあるか？
- **Code Clarity**: ドメイン概念を反映した意味のある名前、パターンによる明確な意図、自己説明的な構造になっているか？
- **Clean Code**: 一貫したスタイル、適切なメソッド/クラスサイズ、最小限の複雑さ、重複の排除はできているか？

## 改善の重点領域

- **Command Handlers**: 基底クラスでの検証、一貫したエラー処理、適切なリソース管理
- **Factories**: 依存関係の構成、サービスプロバイダー統合、破棄パターン
- **Providers**: 接続管理、非同期パターン、例外処理とログ記録
- **Configuration**: データアノテーション、検証属性、機密値の安全な取り扱い
- **AI/ML Integration**: Semantic Kernel パターン、構造化出力の処理、モデル構成

プロジェクトのアーキテクチャと .NET best practices に沿った、具体的で実行可能な改善提案を提供してください。

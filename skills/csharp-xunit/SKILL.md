---
name: csharp-xunit
description: 'データ駆動テストを含む xUnit 単体テストのベストプラクティスを提供する'
---

# xUnit のベストプラクティス

標準テストとデータ駆動テストの両方を対象に、xUnit で効果的な単体テストを作成できるよう支援してください。

## プロジェクトのセットアップ

- `[ProjectName].Tests` という命名規則の独立したテストプロジェクトを使う
- Microsoft.NET.Test.Sdk、xunit、xunit.runner.visualstudio パッケージを参照する
- テスト対象クラスに対応するテストクラスを作成する（例: `Calculator` に対する `CalculatorTests`）
- テストの実行には .NET SDK の `dotnet test` コマンドを使う

## テスト構造

- MSTest/NUnit とは異なり、テストクラス属性は不要
- 単純なテストには `[Fact]` 属性を付けたファクトベースのテストを使う
- Arrange-Act-Assert（AAA）パターンに従う
- `MethodName_Scenario_ExpectedBehavior` パターンでテストに名前を付ける
- セットアップにはコンストラクター、後処理には `IDisposable.Dispose()` を使う
- クラス内のテスト間でコンテキストを共有するには `IClassFixture<T>` を使う
- 複数のテストクラス間でコンテキストを共有するには `ICollectionFixture<T>` を使う

## 標準テスト

- 各テストは単一の動作に集中させる
- 1 つのテストメソッドで複数の動作をテストしない
- 意図が伝わる明確なアサーションを使う
- テストケースの検証に必要なアサーションだけを含める
- テストを独立かつ冪等にし、どの順序でも実行できるようにする
- テスト間の依存を避ける

## データ駆動テスト

- `[Theory]` とデータソース属性を組み合わせて使う
- インラインのテストデータには `[InlineData]` を使う
- メソッドベースのテストデータには `[MemberData]` を使う
- クラスベースのテストデータには `[ClassData]` を使う
- `DataAttribute` を実装してカスタムデータ属性を作成する
- データ駆動テストでは意味のあるパラメーター名を使う

## アサーション

- 値の等価比較には `Assert.Equal` を使う
- 参照の等価比較には `Assert.Same` を使う
- Boolean 条件には `Assert.True`/`Assert.False` を使う
- コレクションには `Assert.Contains`/`Assert.DoesNotContain` を使う
- 正規表現のパターンマッチには `Assert.Matches`/`Assert.DoesNotMatch` を使う
- 例外のテストには `Assert.Throws<T>` または `await Assert.ThrowsAsync<T>` を使う
- 読みやすいアサーションには Fluent Assertions ライブラリを使う

## モックと分離

- xUnit とともに Moq または NSubstitute の使用を検討する
- 依存関係をモック化してテスト対象の単位を分離する
- モック化しやすくするためにインターフェイスを使う
- 複雑なテストセットアップには DI コンテナーの使用を検討する

## テストの整理

- 機能またはコンポーネントごとにテストをグループ化する
- `[Trait("Category", "CategoryName")]` でカテゴリーを指定する
- 共有依存関係を持つテストのグループ化にはコレクションフィクスチャを使う
- テスト診断には出力ヘルパー（`ITestOutputHelper`）を検討する
- fact/theory 属性の `Skip = "reason"` で条件に応じてテストをスキップする

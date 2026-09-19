---
name: csharp-nunit
description: 'データ駆動テストを含む NUnit 単体テストのベストプラクティスを提供する'
---

# NUnit のベストプラクティス

標準テストとデータ駆動テストの両方を対象に、NUnit で効果的な単体テストを作成できるよう支援してください。

## プロジェクトのセットアップ

- `[ProjectName].Tests` という命名規則の独立したテストプロジェクトを使う
- Microsoft.NET.Test.Sdk、NUnit、NUnit3TestAdapter パッケージを参照する
- テスト対象クラスに対応するテストクラスを作成する（例: `Calculator` に対する `CalculatorTests`）
- テストの実行には .NET SDK の `dotnet test` コマンドを使う

## テスト構造

- テストクラスに `[TestFixture]` 属性を付ける
- テストメソッドに `[Test]` 属性を使う
- Arrange-Act-Assert（AAA）パターンに従う
- `MethodName_Scenario_ExpectedBehavior` パターンでテストに名前を付ける
- テストごとのセットアップと後処理には `[SetUp]` と `[TearDown]` を使う
- クラスごとのセットアップと後処理には `[OneTimeSetUp]` と `[OneTimeTearDown]` を使う
- アセンブリレベルのセットアップと後処理には `[SetUpFixture]` を使う

## 標準テスト

- 各テストは単一の動作に集中させる
- 1 つのテストメソッドで複数の動作をテストしない
- 意図が伝わる明確なアサーションを使う
- テストケースの検証に必要なアサーションだけを含める
- テストを独立かつ冪等にし、どの順序でも実行できるようにする
- テスト間の依存を避ける

## データ駆動テスト

- インラインのテストデータには `[TestCase]` を使う
- プログラムで生成するテストデータには `[TestCaseSource]` を使う
- 単純なパラメーターの組み合わせには `[Values]` を使う
- プロパティまたはメソッドに基づくデータソースには `[ValueSource]` を使う
- ランダムな数値テスト値には `[Random]` を使う
- 連続する数値テスト値には `[Range]` を使う
- 複数のパラメーターを組み合わせるには `[Combinatorial]` または `[Pairwise]` を使う

## アサーション

- 制約モデルを使った `Assert.That` を使用する（推奨される NUnit スタイル）
- `Is.EqualTo`、`Is.SameAs`、`Contains.Item` などの制約を使う
- 単純な値の等価比較には `Assert.AreEqual` を使う（クラシックスタイル）
- コレクションの比較には `CollectionAssert` を使う
- 文字列固有のアサーションには `StringAssert` を使う
- 例外のテストには `Assert.Throws<T>` または `Assert.ThrowsAsync<T>` を使う
- 失敗時に内容が分かるよう、アサーションには説明的なメッセージを使う

## モックと分離

- NUnit とともに Moq または NSubstitute の使用を検討する
- 依存関係をモック化してテスト対象の単位を分離する
- モック化しやすくするためにインターフェイスを使う
- 複雑なテストセットアップには DI コンテナーの使用を検討する

## テストの整理

- 機能またはコンポーネントごとにテストをグループ化する
- `[Category("CategoryName")]` でカテゴリーを指定する
- 必要な場合は `[Order]` でテスト実行順序を制御する
- `[Author("DeveloperName")]` で所有者を示す
- `[Description]` で追加のテスト情報を提供する
- 自動実行すべきでないテストには `[Explicit]` を検討する
- テストを一時的にスキップするには `[Ignore("Reason")]` を使う

---
name: csharp-tunit
description: 'データ駆動テストを含む TUnit 単体テストのベストプラクティスを提供する'
---

# TUnit のベストプラクティス

標準テストとデータ駆動テストの両方を対象に、TUnit で効果的な単体テストを作成できるよう支援してください。

## プロジェクトのセットアップ

- `[ProjectName].Tests` という命名規則の独立したテストプロジェクトを使う
- TUnit パッケージと、Fluent Assertions 用の TUnit.Assertions を参照する
- テスト対象クラスに対応するテストクラスを作成する（例: `Calculator` に対する `CalculatorTests`）
- テストの実行には .NET SDK の `dotnet test` コマンドを使う
- TUnit には .NET 8.0 以降が必要

## テスト構造

- xUnit/NUnit のようなテストクラス属性は不要
- テストメソッドには、xUnit の `[Fact]` ではなく `[Test]` 属性を使う
- Arrange-Act-Assert（AAA）パターンに従う
- `MethodName_Scenario_ExpectedBehavior` パターンでテストに名前を付ける
- ライフサイクルフックとして、セットアップには `[Before(Test)]`、後処理には `[After(Test)]` を使う
- クラス内のテスト間で共有するコンテキストには `[Before(Class)]` と `[After(Class)]` を使う
- テストクラス間で共有するコンテキストには `[Before(Assembly)]` と `[After(Assembly)]` を使う
- TUnit は `[Before(TestSession)]` や `[After(TestSession)]` などの高度なライフサイクルフックをサポートする

## 標準テスト

- 各テストは単一の動作に集中させる
- 1 つのテストメソッドで複数の動作をテストしない
- `await Assert.That()` を使った TUnit の Fluent Assertion 構文を使う
- テストケースの検証に必要なアサーションだけを含める
- テストを独立かつ冪等にし、どの順序でも実行できるようにする
- テスト間の依存を避ける（必要な場合は `[DependsOn]` 属性を使う）

## データ駆動テスト

- インラインのテストデータには `[Arguments]` 属性を使う（xUnit の `[InlineData]` に相当）
- メソッドベースのテストデータには `[MethodData]` を使う（xUnit の `[MemberData]` に相当）
- クラスベースのテストデータには `[ClassData]` を使う
- `ITestDataSource` を実装してカスタムデータソースを作成する
- データ駆動テストでは意味のあるパラメーター名を使う
- 同じテストメソッドに複数の `[Arguments]` 属性を適用できる

## アサーション

- 値の等価比較には `await Assert.That(value).IsEqualTo(expected)` を使う
- 参照の等価比較には `await Assert.That(value).IsSameReferenceAs(expected)` を使う
- Boolean 条件には `await Assert.That(value).IsTrue()` または `await Assert.That(value).IsFalse()` を使う
- コレクションには `await Assert.That(collection).Contains(item)` または `await Assert.That(collection).DoesNotContain(item)` を使う
- 正規表現のパターンマッチには `await Assert.That(value).Matches(pattern)` を使う
- 例外のテストには `await Assert.That(action).Throws<TException>()` または `await Assert.That(asyncAction).ThrowsAsync<TException>()` を使う
- `.And` 演算子でアサーションを連結する: `await Assert.That(value).IsNotNull().And.IsEqualTo(expected)`
- 代替条件には `.Or` 演算子を使う: `await Assert.That(value).IsEqualTo(1).Or.IsEqualTo(2)`
- 許容誤差を伴う DateTime や数値の比較には `.Within(tolerance)` を使う
- すべてのアサーションは非同期であり、await が必要

## 高度な機能

- テストを複数回繰り返すには `[Repeat(n)]` を使う
- 失敗時の自動再試行には `[Retry(n)]` を使う
- 並列実行数の制限には `[ParallelLimit<T>]` を使う
- 条件に応じてテストをスキップするには `[Skip("reason")]` を使う
- テスト間の依存を作成するには `[DependsOn(nameof(OtherTest))]` を使う
- テストのタイムアウトを設定するには `[Timeout(milliseconds)]` を使う
- TUnit の基底属性を拡張してカスタム属性を作成する

## テストの整理

- 機能またはコンポーネントごとにテストをグループ化する
- テストのカテゴリー分けには `[Category("CategoryName")]` を使う
- カスタムテスト名には `[DisplayName("Custom Test Name")]` を使う
- テストの診断と情報取得には `TestContext` の使用を検討する
- プラットフォーム固有のテストには、カスタム `[WindowsOnly]` などの条件付き属性を使う

## パフォーマンスと並列実行

- 明示的な構成が必要な xUnit とは異なり、TUnit は既定でテストを並列実行する
- 特定のテストで並列実行を無効にするには `[NotInParallel]` を使う
- カスタム制限クラスと `[ParallelLimit<T>]` を使って同時実行数を制御する
- 同じクラス内のテストは既定で順次実行される
- 負荷テストのシナリオでは `[Repeat(n)]` と `[ParallelLimit<T>]` を組み合わせる

## xUnit からの移行

- `[Fact]` を `[Test]` に置き換える
- `[Theory]` を `[Test]` に置き換え、データには `[Arguments]` を使う
- `[InlineData]` を `[Arguments]` に置き換える
- `[MemberData]` を `[MethodData]` に置き換える
- `Assert.Equal` を `await Assert.That(actual).IsEqualTo(expected)` に置き換える
- `Assert.True` を `await Assert.That(condition).IsTrue()` に置き換える
- `Assert.Throws<T>` を `await Assert.That(action).Throws<T>()` に置き換える
- コンストラクター/IDisposable を `[Before(Test)]`/`[After(Test)]` に置き換える
- `IClassFixture<T>` を `[Before(Class)]`/`[After(Class)]` に置き換える

**xUnit より TUnit を選ぶ理由**

TUnit は、非同期アサーション、より洗練されたライフサイクルフック、強化されたデータ駆動テスト機能など、xUnit にはない高度な機能を備え、モダンで高速かつ柔軟なテスト体験を提供します。TUnit の Fluent Assertions により、テスト検証がより明確で表現力豊かになるため、特に複雑な .NET プロジェクトに適しています。

---
name: csharp-mstest
description: '最新のアサーション API とデータ駆動テストを含む MSTest 3.x/4.x 単体テストのベストプラクティスを提供する'
---

# MSTest のベストプラクティス（MSTest 3.x/4.x）

最新の API とベストプラクティスを使い、現代的な MSTest で効果的な単体テストを作成できるよう支援してください。

## プロジェクトのセットアップ

- `[ProjectName].Tests` という命名規則の独立したテストプロジェクトを使う
- MSTest 3.x 以降の NuGet パッケージ（アナライザーを含む）を参照する
- プロジェクトのセットアップを簡略化するために MSTest.Sdk の使用を検討する
- `dotnet test` でテストを実行する

## テストクラスの構造

- テストクラスには `[TestClass]` 属性を使う
- パフォーマンスと設計の明確さのため、**テストクラスは既定で sealed にする**
- テストメソッドには `[TestMethod]` を使う（`[DataTestMethod]` より優先）
- Arrange-Act-Assert（AAA）パターンに従う
- `MethodName_Scenario_ExpectedBehavior` パターンでテストに名前を付ける

```csharp
[TestClass]
public sealed class CalculatorTests
{
    [TestMethod]
    public void Add_TwoPositiveNumbers_ReturnsSum()
    {
        // Arrange
        var calculator = new Calculator();

        // Act
        var result = calculator.Add(2, 3);

        // Assert
        Assert.AreEqual(5, result);
    }
}
```

## テストのライフサイクル

- **`[TestInitialize]` よりコンストラクターを優先する**。`readonly` フィールドを使え、標準的な C# パターンに従える
- テストが失敗しても実行する必要がある後処理には `[TestCleanup]` を使う
- 非同期セットアップが必要な場合は、コンストラクターと非同期 `[TestInitialize]` を組み合わせる

```csharp
[TestClass]
public sealed class ServiceTests
{
    private readonly MyService _service;  // readonly enabled by constructor

    public ServiceTests()
    {
        _service = new MyService();
    }

    [TestInitialize]
    public async Task InitAsync()
    {
        // Use for async initialization only
        await _service.WarmupAsync();
    }

    [TestCleanup]
    public void Cleanup() => _service.Reset();
}
```

### 実行順序

1. **アセンブリの初期化** - `[AssemblyInitialize]`（テストアセンブリごとに 1 回）
2. **クラスの初期化** - `[ClassInitialize]`（テストクラスごとに 1 回）
3. **テストの初期化**（各テストメソッド）:
   1. コンストラクター
   2. `TestContext` プロパティの設定
   3. `[TestInitialize]`
4. **テストの実行** - テストメソッドを実行
5. **テストの後処理**（各テストメソッド）:
   1. `[TestCleanup]`
   2. `DisposeAsync`（実装されている場合）
   3. `Dispose`（実装されている場合）
6. **クラスの後処理** - `[ClassCleanup]`（テストクラスごとに 1 回）
7. **アセンブリの後処理** - `[AssemblyCleanup]`（テストアセンブリごとに 1 回）

## 最新のアサーション API

MSTest は `Assert`、`StringAssert`、`CollectionAssert` の 3 つのアサーションクラスを提供します。

### Assert クラス - コアアサーション

```csharp
// Equality
Assert.AreEqual(expected, actual);
Assert.AreNotEqual(notExpected, actual);
Assert.AreSame(expectedObject, actualObject);      // Reference equality
Assert.AreNotSame(notExpectedObject, actualObject);

// Null checks
Assert.IsNull(value);
Assert.IsNotNull(value);

// Boolean
Assert.IsTrue(condition);
Assert.IsFalse(condition);

// Fail/Inconclusive
Assert.Fail("Test failed due to...");
Assert.Inconclusive("Test cannot be completed because...");
```

### 例外テスト（`[ExpectedException]` より優先）

```csharp
// Assert.Throws - matches TException or derived types
var ex = Assert.Throws<ArgumentException>(() => Method(null));
Assert.AreEqual("Value cannot be null.", ex.Message);

// Assert.ThrowsExactly - matches exact type only
var ex = Assert.ThrowsExactly<InvalidOperationException>(() => Method());

// Async versions
var ex = await Assert.ThrowsAsync<HttpRequestException>(async () => await client.GetAsync(url));
var ex = await Assert.ThrowsExactlyAsync<InvalidOperationException>(async () => await Method());
```

### コレクションのアサーション（Assert クラス）

```csharp
Assert.Contains(expectedItem, collection);
Assert.DoesNotContain(unexpectedItem, collection);
Assert.ContainsSingle(collection);  // exactly one element
Assert.HasCount(5, collection);
Assert.IsEmpty(collection);
Assert.IsNotEmpty(collection);
```

### 文字列のアサーション（Assert クラス）

```csharp
Assert.Contains("expected", actualString);
Assert.StartsWith("prefix", actualString);
Assert.EndsWith("suffix", actualString);
Assert.DoesNotStartWith("prefix", actualString);
Assert.DoesNotEndWith("suffix", actualString);
Assert.MatchesRegex(@"\d{3}-\d{4}", phoneNumber);
Assert.DoesNotMatchRegex(@"\d+", textOnly);
```

### 比較アサーション

```csharp
Assert.IsGreaterThan(lowerBound, actual);
Assert.IsGreaterThanOrEqualTo(lowerBound, actual);
Assert.IsLessThan(upperBound, actual);
Assert.IsLessThanOrEqualTo(upperBound, actual);
Assert.IsInRange(actual, low, high);
Assert.IsPositive(number);
Assert.IsNegative(number);
```

### 型アサーション

```csharp
// MSTest 3.x - uses out parameter
Assert.IsInstanceOfType<MyClass>(obj, out var typed);
typed.DoSomething();

// MSTest 4.x - returns typed result directly
var typed = Assert.IsInstanceOfType<MyClass>(obj);
typed.DoSomething();

Assert.IsNotInstanceOfType<WrongType>(obj);
```

### Assert.That（MSTest 4.0 以降）

```csharp
Assert.That(result.Count > 0);  // Auto-captures expression in failure message
```

### StringAssert クラス

> **注:** 同等の `Assert` クラス API が利用できる場合は、そちらを優先します（例: `StringAssert.Contains(actual, "expected")` より `Assert.Contains("expected", actual)`）。

```csharp
StringAssert.Contains(actualString, "expected");
StringAssert.StartsWith(actualString, "prefix");
StringAssert.EndsWith(actualString, "suffix");
StringAssert.Matches(actualString, new Regex(@"\d{3}-\d{4}"));
StringAssert.DoesNotMatch(actualString, new Regex(@"\d+"));
```

### CollectionAssert クラス

> **注:** 同等の `Assert` クラス API が利用できる場合は、そちらを優先します（例: `Assert.Contains`）。

```csharp
// Containment
CollectionAssert.Contains(collection, expectedItem);
CollectionAssert.DoesNotContain(collection, unexpectedItem);

// Equality (same elements, same order)
CollectionAssert.AreEqual(expectedCollection, actualCollection);
CollectionAssert.AreNotEqual(unexpectedCollection, actualCollection);

// Equivalence (same elements, any order)
CollectionAssert.AreEquivalent(expectedCollection, actualCollection);
CollectionAssert.AreNotEquivalent(unexpectedCollection, actualCollection);

// Subset checks
CollectionAssert.IsSubsetOf(subset, superset);
CollectionAssert.IsNotSubsetOf(notSubset, collection);

// Element validation
CollectionAssert.AllItemsAreInstancesOfType(collection, typeof(MyClass));
CollectionAssert.AllItemsAreNotNull(collection);
CollectionAssert.AllItemsAreUnique(collection);
```

## データ駆動テスト

### DataRow

```csharp
[TestMethod]
[DataRow(1, 2, 3)]
[DataRow(0, 0, 0, DisplayName = "Zeros")]
[DataRow(-1, 1, 0, IgnoreMessage = "Known issue #123")]  // MSTest 3.8+
public void Add_ReturnsSum(int a, int b, int expected)
{
    Assert.AreEqual(expected, Calculator.Add(a, b));
}
```

### DynamicData

データソースは次のいずれかの型を返せます。

- `IEnumerable<(T1, T2, ...)>`（ValueTuple）- **推奨**。型安全性を提供する（MSTest 3.7 以降）
- `IEnumerable<Tuple<T1, T2, ...>>` - 型安全性を提供する
- `IEnumerable<TestDataRow>` - 型安全性に加え、表示名やカテゴリーなどのテストメタデータを制御できる
- `IEnumerable<object[]>` - **最も非推奨**。型安全性がない

> **注:** 新しいテストデータメソッドを作成するときは、`IEnumerable<object[]>` より `ValueTuple` または `TestDataRow` を優先します。`object[]` 方式にはコンパイル時の型チェックがなく、型の不一致による実行時エラーにつながる可能性があります。

```csharp
[TestMethod]
[DynamicData(nameof(TestData))]
public void DynamicTest(int a, int b, int expected)
{
    Assert.AreEqual(expected, Calculator.Add(a, b));
}

// ValueTuple - preferred (MSTest 3.7+)
public static IEnumerable<(int a, int b, int expected)> TestData =>
[
    (1, 2, 3),
    (0, 0, 0),
];

// TestDataRow - when you need custom display names or metadata
public static IEnumerable<TestDataRow<(int a, int b, int expected)>> TestDataWithMetadata =>
[
    new((1, 2, 3)) { DisplayName = "Positive numbers" },
    new((0, 0, 0)) { DisplayName = "Zeros" },
    new((-1, 1, 0)) { DisplayName = "Mixed signs", IgnoreMessage = "Known issue #123" },
];

// IEnumerable<object[]> - avoid for new code (no type safety)
public static IEnumerable<object[]> LegacyTestData =>
[
    [1, 2, 3],
    [0, 0, 0],
];
```

## TestContext

`TestContext` クラスは、テスト実行情報、キャンセルのサポート、出力メソッドを提供します。
完全なリファレンスについては、[TestContext のドキュメント](https://learn.microsoft.com/dotnet/core/testing/unit-testing-mstest-writing-tests-testcontext)を参照してください。

### TestContext へのアクセス

```csharp
// Property (MSTest suppresses CS8618 - don't use nullable or = null!)
public TestContext TestContext { get; set; }

// Constructor injection (MSTest 3.6+) - preferred for immutability
[TestClass]
public sealed class MyTests
{
    private readonly TestContext _testContext;

    public MyTests(TestContext testContext)
    {
        _testContext = testContext;
    }
}

// Static methods receive it as parameter
[ClassInitialize]
public static void ClassInit(TestContext context) { }

// Optional for cleanup methods (MSTest 3.6+)
[ClassCleanup]
public static void ClassCleanup(TestContext context) { }

[AssemblyCleanup]
public static void AssemblyCleanup(TestContext context) { }
```

### キャンセルトークン

`[Timeout]` と協調キャンセルを行う場合は、常に `TestContext.CancellationToken` を使います。

```csharp
[TestMethod]
[Timeout(5000)]
public async Task LongRunningTest()
{
    await _httpClient.GetAsync(url, TestContext.CancellationToken);
}
```

### テスト実行プロパティ

```csharp
TestContext.TestName              // Current test method name
TestContext.TestDisplayName       // Display name (3.7+)
TestContext.CurrentTestOutcome    // Pass/Fail/InProgress
TestContext.TestData              // Parameterized test data (3.7+, in TestInitialize/Cleanup)
TestContext.TestException         // Exception if test failed (3.7+, in TestCleanup)
TestContext.DeploymentDirectory   // Directory with deployment items
```

### 出力と結果ファイル

```csharp
// Write to test output (useful for debugging)
TestContext.WriteLine("Processing item {0}", itemId);

// Attach files to test results (logs, screenshots)
TestContext.AddResultFile(screenshotPath);

// Store/retrieve data across test methods
TestContext.Properties["SharedKey"] = computedValue;
```

## 高度な機能

### 不安定なテストの再試行（MSTest 3.9 以降）

```csharp
[TestMethod]
[Retry(3)]
public void FlakyTest() { }
```

### 条件付き実行（MSTest 3.10 以降）

OS または CI 環境に応じてテストをスキップまたは実行します。

```csharp
// OS-specific tests
[TestMethod]
[OSCondition(OperatingSystems.Windows)]
public void WindowsOnlyTest() { }

[TestMethod]
[OSCondition(OperatingSystems.Linux | OperatingSystems.MacOS)]
public void UnixOnlyTest() { }

[TestMethod]
[OSCondition(ConditionMode.Exclude, OperatingSystems.Windows)]
public void SkipOnWindowsTest() { }

// CI environment tests
[TestMethod]
[CICondition]  // Runs only in CI (default: ConditionMode.Include)
public void CIOnlyTest() { }

[TestMethod]
[CICondition(ConditionMode.Exclude)]  // Skips in CI, runs locally
public void LocalOnlyTest() { }
```

### 並列化

```csharp
// Assembly level
[assembly: Parallelize(Workers = 4, Scope = ExecutionScope.MethodLevel)]

// Disable for specific class
[TestClass]
[DoNotParallelize]
public sealed class SequentialTests { }
```

### 作業項目のトレーサビリティ（MSTest 3.8 以降）

テストレポートで追跡できるよう、テストを作業項目にリンクします。

```csharp
// Azure DevOps work items
[TestMethod]
[WorkItem(12345)]  // Links to work item #12345
public void Feature_Scenario_ExpectedBehavior() { }

// Multiple work items
[TestMethod]
[WorkItem(12345)]
[WorkItem(67890)]
public void Feature_CoversMultipleRequirements() { }

// GitHub issues (MSTest 3.8+)
[TestMethod]
[GitHubWorkItem("https://github.com/owner/repo/issues/42")]
public void BugFix_Issue42_IsResolved() { }
```

作業項目との関連付けはテスト結果に表示され、次の用途に使えます。
- テストカバレッジと要件の対応を追跡する
- バグ修正を回帰テストにリンクする
- CI/CD パイプラインでトレーサビリティレポートを生成する

## 避けるべきよくある誤り

```csharp
// ❌ Wrong argument order
Assert.AreEqual(actual, expected);
// ✅ Correct
Assert.AreEqual(expected, actual);

// ❌ Using ExpectedException (obsolete)
[ExpectedException(typeof(ArgumentException))]
// ✅ Use Assert.Throws
Assert.Throws<ArgumentException>(() => Method());

// ❌ Using LINQ Single() - unclear exception
var item = items.Single();
// ✅ Use ContainsSingle - better failure message
var item = Assert.ContainsSingle(items);

// ❌ Hard cast - unclear exception
var handler = (MyHandler)result;
// ✅ Type assertion - shows actual type on failure
var handler = Assert.IsInstanceOfType<MyHandler>(result);

// ❌ Ignoring cancellation token
await client.GetAsync(url, CancellationToken.None);
// ✅ Flow test cancellation
await client.GetAsync(url, TestContext.CancellationToken);

// ❌ Making TestContext nullable - leads to unnecessary null checks
public TestContext? TestContext { get; set; }
// ❌ Using null! - MSTest already suppresses CS8618 for this property
public TestContext TestContext { get; set; } = null!;
// ✅ Declare without nullable or initializer - MSTest handles the warning
public TestContext TestContext { get; set; }
```

## テストの整理

- 機能またはコンポーネントごとにテストをグループ化する
- フィルターには `[TestCategory("Category")]` を使う
- カスタムメタデータには `[TestProperty("Name", "Value")]` を使う（例: `[TestProperty("Bug", "12345")]`）
- 重要なテストには `[Priority(1)]` を使う
- 関連する MSTest アナライザーを有効にする（コンストラクター優先には MSTEST0020）

## モックと分離

- 依存関係のモック化には Moq または NSubstitute を使う
- モック化しやすくするためにインターフェイスを使う
- 依存関係をモック化してテスト対象の単位を分離する

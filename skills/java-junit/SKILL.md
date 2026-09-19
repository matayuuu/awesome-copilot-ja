---
name: java-junit
description: 'データ駆動テストを含むJUnit 5単体テストのベストプラクティスを得る。'
---

# JUnit 5以降のベストプラクティス

標準的なテストとデータ駆動テストの両方を扱い、JUnit 5で効果的な単体テストを書くことを支援する。

## プロジェクト設定

- 標準的なMavenまたはGradleのプロジェクト構成を使う。
- テストソースコードを `src/test/java` に置く。
- パラメーター化テスト用に `junit-jupiter-api`、`junit-jupiter-engine`、`junit-jupiter-params` の依存関係を含める。
- テストの実行にはビルドツールのコマンド `mvn test` または `gradle test` を使う。

## テスト構成

- テストクラスには `Test` 接尾辞を付ける。例: `Calculator` クラスなら `CalculatorTest`。
- テストメソッドには `@Test` を使う。
- Arrange-Act-Assert（AAA）パターンに従う。
- `methodName_should_expectedBehavior_when_scenario` のように、説明的な規約でテスト名を付ける。
- テストごとのセットアップと後処理には `@BeforeEach` と `@AfterEach` を使う。
- クラス単位のセットアップと後処理には `@BeforeAll` と `@AfterAll` を使う（staticメソッドでなければならない）。
- テストクラスとテストメソッドに人が読める名前を付けるには `@DisplayName` を使う。

## 標準テスト

- テストは単一の振る舞いに集中させる。
- 1つのテストメソッドで複数の条件をテストしない。
- テストを独立かつ冪等にする（任意の順序で実行できる）。
- テスト間の依存関係を避ける。

## データ駆動（パラメーター化）テスト

- メソッドをパラメーター化テストとして示すには `@ParameterizedTest` を使う。
- 単純なリテラル値（文字列、intなど）には `@ValueSource` を使う。
- `Stream`、`Collection` などのテスト引数を提供するファクトリメソッドを参照するには `@MethodSource` を使う。
- インラインのカンマ区切り値には `@CsvSource` を使う。
- クラスパス上のCSVを使うには `@CsvFileSource` を使う。
- enum定数には `@EnumSource` を使う。

## アサーション

- `org.junit.jupiter.api.Assertions` のstaticメソッド（例: `assertEquals`、`assertTrue`、`assertNotNull`）を使う。
- より流暢で読みやすいアサーションには、AssertJ（`assertThat(...).is...`）のようなライブラリを検討する。
- 例外をテストするには `assertThrows` または `assertDoesNotThrow` を使う。
- 関連するアサーションを `assertAll` でまとめ、テストが失敗する前にすべて確認されるようにする。
- 失敗時に状況が分かる説明的なメッセージをアサーションに指定する。

## モックと分離

- Mockitoのようなモックフレームワークを使って依存関係のモックオブジェクトを作成する。
- モックの作成と注入を簡単にするには、Mockitoの `@Mock` と `@InjectMocks` アノテーションを使う。
- モックしやすくするためにインターフェースを使う。

## テストの整理

- パッケージを使って機能またはコンポーネントごとにテストをまとめる。
- テストを分類するには `@Tag`（例: `@Tag("fast")`、`@Tag("integration")`）を使う。
- 厳密に必要な場合に実行順を制御するには、`@TestMethodOrder(MethodOrderer.OrderAnnotation.class)` と `@Order` を使う。
- テストメソッドまたはクラスを一時的にスキップするときは、理由を添えて `@Disabled` を使う。
- 整理しやすくするため、ネストした内部クラスでテストをまとめるには `@Nested` を使う。

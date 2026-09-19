---
name: kotlin-springboot
description: 'Spring BootとKotlinでアプリケーションを開発するためのベストプラクティスを得る。'
---

# KotlinによるSpring Bootのベストプラクティス

Kotlinを使って、高品質でKotlinらしいSpring Bootアプリケーションを書けるよう支援する。

## プロジェクトのセットアップと構成

- **ビルドツール:** Kotlinプラグイン（`kotlin-maven-plugin`または`org.jetbrains.kotlin.jvm`）とともに、Maven（`pom.xml`）またはGradle（`build.gradle`）を使う。
- **Kotlinプラグイン:** JPAでは、定型コードなしでエンティティクラスを自動的に`open`にするため、`kotlin-jpa`プラグインを有効にする。
- **スターター:** 通常どおりSpring Bootスターター（例: `spring-boot-starter-web`、`spring-boot-starter-data-jpa`）を使う。
- **パッケージ構成:** レイヤー単位ではなく、機能/ドメイン単位（例: `com.example.app.order`、`com.example.app.user`）でコードを整理する。

## 依存性注入とコンポーネント

- **プライマリコンストラクター:** 必須の依存性注入には常にプライマリコンストラクターを使う。これはKotlinで最もKotlinらしく簡潔な方法である。
- **不変性:** プライマリコンストラクターでは依存関係を`private val`として宣言する。不変性を促進するため、どこでも`var`より`val`を優先する。
- **コンポーネントステレオタイプ:** Javaの場合と同じように、`@Service`、`@Repository`、`@RestController`アノテーションを使う。

## 構成

- **外部化された構成:** 読みやすく階層構造を表現できる`application.yml`を使う。
- **型安全なプロパティ:** `data class`と`@ConfigurationProperties`を使って、不変で型安全な構成オブジェクトを作成する。
- **プロファイル:** Spring Profiles（`application-dev.yml`、`application-prod.yml`）で環境固有の構成を管理する。
- **シークレット管理:** シークレットをハードコードしない。環境変数、またはHashiCorp VaultやAWS Secrets Managerのような専用のシークレット管理ツールを使う。

## Web層（コントローラー）

- **RESTful API:** 明確で一貫したRESTfulエンドポイントを設計する。
- **DTOのデータクラス:** すべてのDTOにKotlinの`data class`を使う。これにより`equals()`、`hashCode()`、`toString()`、`copy()`が無料で提供され、不変性が促進される。
- **バリデーション:** DTOのデータクラスでアノテーション（`@Valid`、`@NotNull`、`@Size`）を使い、Java Bean Validation（JSR 380）を適用する。
- **エラー処理:** `@ControllerAdvice`と`@ExceptionHandler`を使ってグローバル例外ハンドラーを実装し、エラーレスポンスを一貫させる。

## サービス層

- **ビジネスロジック:** ビジネスロジックを`@Service`クラス内にカプセル化する。
- **ステートレス性:** サービスはステートレスにする。
- **トランザクション管理:** サービスメソッドに`@Transactional`を使う。Kotlinではクラスレベルまたは関数レベルに適用できる。

## データ層（リポジトリ）

- **JPAエンティティ:** エンティティをクラスとして定義する。`open`でなければならない点に注意する。これを自動処理するため、`kotlin-jpa`コンパイラープラグインの使用を強く推奨する。
- **Null安全性:** KotlinのNull安全性（`?`）を活用し、どのエンティティフィールドが任意または必須かを型レベルで明確に定義する。
- **Spring Data JPA:** `JpaRepository`または`CrudRepository`を拡張してSpring Data JPAリポジトリを使う。
- **コルーチン:** リアクティブアプリケーションでは、データ層でSpring BootのKotlin Coroutinesサポートを活用する。

## ロギング

- **コンパニオンオブジェクトのロガー:** ロガーはコンパニオンオブジェクトで宣言するのがKotlinらしい方法である。
  ```kotlin
  companion object {
      private val logger = LoggerFactory.getLogger(MyClass::class.java)
  }
  ```
- **パラメーター化ロギング:** パフォーマンスと明確さのため、パラメーター化メッセージ（`logger.info("Processing user {}...", userId)`）を使う。

## テスト

- **JUnit 5:** JUnit 5が標準であり、Kotlinとシームレスに動作する。
- **Kotlinらしいテストライブラリ:** より流暢でKotlinらしいテストには、アサーションに**Kotest**、モックに**MockK**の使用を検討する。どちらもKotlin向けに設計され、より表現力の高い構文を提供する。
- **テストスライス:** `@WebMvcTest`や`@DataJpaTest`のようなテストスライスアノテーションを使い、アプリケーションの特定部分をテストする。
- **Testcontainers:** 実際のデータベースやメッセージブローカーなどを使った信頼性の高い統合テストにはTestcontainersを使う。

## コルーチンと非同期プログラミング

- **`suspend`関数:** ノンブロッキングの非同期コードには、コントローラーとサービスで`suspend`関数を使う。Spring Bootはコルーチンを優れた形でサポートしている。
- **構造化並行性:** `coroutineScope`または`supervisorScope`を使ってコルーチンのライフサイクルを管理する。

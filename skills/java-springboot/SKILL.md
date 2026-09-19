---
name: java-springboot
description: 'Spring Bootアプリケーション開発のベストプラクティスを得る。'
---

# Spring Bootのベストプラクティス

確立されたベストプラクティスに従って、高品質なSpring Bootアプリケーションを書くことを支援する。

## プロジェクト設定と構成

- **ビルドツール:** 依存関係管理にはMaven（`pom.xml`）またはGradle（`build.gradle`）を使う。
- **Starter:** 依存関係管理を簡単にするため、Spring Boot starter（例: `spring-boot-starter-web`、`spring-boot-starter-data-jpa`）を使う。
- **パッケージ構成:** レイヤー単位（例: `com.example.app.controller`、`com.example.app.service`）ではなく、機能またはドメイン単位（例: `com.example.app.order`、`com.example.app.user`）でコードを整理する。

## 依存性注入とコンポーネント

- **コンストラクター注入:** 必須依存関係には常にコンストラクター注入を使う。これによりコンポーネントをテストしやすくなり、依存関係も明示される。
- **不変性:** 依存関係のフィールドを `private final` として宣言する。
- **コンポーネントステレオタイプ:** Beanを定義するために、`@Component`、`@Service`、`@Repository`、`@Controller`/`@RestController` アノテーションを適切に使う。

## 設定

- **外部化設定:** 設定には `application.yml`（または `application.properties`）を使う。YAMLは読みやすく階層構造を表現しやすいため、よく選ばれる。
- **型安全なプロパティ:** `@ConfigurationProperties` を使って、強く型付けされたJavaオブジェクトに設定をバインドする。
- **プロファイル:** Spring Profiles（`application-dev.yml`、`application-prod.yml`）で環境固有の設定を管理する。
- **シークレット管理:** シークレットをハードコードしない。環境変数、またはHashiCorp VaultやAWS Secrets Managerのような専用のシークレット管理ツールを使う。

## Web層（コントローラー）

- **RESTful API:** 明確で一貫したRESTfulエンドポイントを設計する。
- **DTO（データ転送オブジェクト）:** API層でデータを公開・受け取るにはDTOを使う。JPAエンティティをクライアントへ直接公開しない。
- **バリデーション:** DTOのリクエスト本文を検証するため、アノテーション（`@Valid`、`@NotNull`、`@Size`）付きのJava Bean Validation（JSR 380）を使う。
- **エラーハンドリング:** 一貫したエラーレスポンスを提供するため、`@ControllerAdvice` と `@ExceptionHandler` を使ったグローバル例外ハンドラーを実装する。

## サービス層

- **ビジネスロジック:** すべてのビジネスロジックを `@Service` クラス内にカプセル化する。
- **ステートレス性:** サービスはステートレスにする。
- **トランザクション管理:** データベーストランザクションを宣言的に管理するため、サービスメソッドに `@Transactional` を使う。必要な最小粒度で適用する。

## データ層（リポジトリ）

- **Spring Data JPA:** 標準的なデータベース操作には、`JpaRepository` または `CrudRepository` を拡張したSpring Data JPAリポジトリを使う。
- **カスタムクエリ:** 複雑なクエリには `@Query` またはJPA Criteria APIを使う。
- **プロジェクション:** データベースから必要なデータだけを取得するにはDTOプロジェクションを使う。

## ロギング

- **SLF4J:** ロギングにはSLF4J APIを使う。
- **Loggerの宣言:** `private static final Logger logger = LoggerFactory.getLogger(MyClass.class);`
- **パラメーター化ロギング:** パフォーマンス向上のため、文字列連結ではなくパラメーター化メッセージ（`logger.info("Processing user {}...", userId);`）を使う。

## テスト

- **単体テスト:** JUnit 5とMockitoのようなモックフレームワークを使って、サービスとコンポーネントの単体テストを書く。
- **統合テスト:** Springアプリケーションコンテキストを読み込む統合テストには `@SpringBootTest` を使う。
- **テストスライス:** アプリケーションの特定部分を分離してテストするには、`@WebMvcTest`（コントローラー用）や `@DataJpaTest`（リポジトリ用）のようなテストスライスアノテーションを使う。
- **Testcontainers:** 実データベースやメッセージブローカーなどを使う信頼性の高い統合テストには、Testcontainersを検討する。

## セキュリティ

- **Spring Security:** 認証と認可にはSpring Securityを使う。
- **パスワードのエンコード:** BCryptのような強力なハッシュアルゴリズムで、パスワードを常にエンコードする。
- **入力のサニタイズ:** Spring Data JPAまたはパラメーター化クエリを使ってSQLインジェクションを防ぐ。出力を適切にエンコードしてクロスサイトスクリプティング（XSS）を防ぐ。

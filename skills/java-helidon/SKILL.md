---
name: java-helidon
description: 'Helidon 4（SEおよびMP）アプリケーション開発のベストプラクティスを提供する。Helidon SE/MP、HttpServiceルーティング、Helidon DB Client、MicroProfile Config、Helidon Security、Java 21以降のHelidonテストを扱うときに使う。'
---

# Helidonのベストプラクティス

確立されたベストプラクティスに従い、高品質なHelidonアプリケーションの作成を支援する。

## Helidon 3 → 4のAPI変更

Helidon 4 renamed or resignatured APIs that appear widely in their Helidon 3 form.
左列はHelidon 4ではコンパイルできない。生成コードを返す前にこの表と照合する。

| Do not use (Helidon 3)                                     | Use (Helidon 4)                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| `io.helidon.common.http.Http.Status`                       | `io.helidon.http.Status`                                           |
| `io.helidon.webserver.Service`                             | `io.helidon.webserver.http.HttpService`                            |
| `Routing.Rules`, `update(Routing.Rules)`                   | `HttpRules`, `routing(HttpRules)`                                  |
| `request.path().param("id")`                               | `request.path().pathParameters().get("id")`                        |
| `String s = column.as(String.class)`                       | `column.getString()` or `column.get(String.class)`                 |
| `dbClient.execute(exec -> ...)` returning `Single`/`Multi` | `dbClient.execute()` returning `Optional<DbRow>` / `Stream<DbRow>` |
| `javax.*`                                                  | `jakarta.*`                                                        |
| `helidon-microprofile-tests-junit5`                        | `helidon-microprofile-testing-junit5`                              |

Helidon 4の `Value.as(Class)` は `T` ではなく `OptionalValue<T>` を返す。これは生成コードで最もよくあるHelidon 4のコンパイルエラー。

## プロジェクト設定と構造

- **プログラミングモデル:** コード生成前にHelidon SEとHelidon MPのどちらを使うか特定する。明示的に必要でない限り、2つのモデルを混在させない。
- **Javaバージョン:** Helidon 4アプリケーションにはJava 21以降を使う。
- **ビルドツール:** 依存関係管理にはMaven（`pom.xml`）またはGradle（`build.gradle`）を使う。
- **依存関係管理:** Helidon BOMまたはプラットフォームを使い、Helidonモジュールのバージョンを揃える。
- **パッケージ構造:** 技術レイヤーだけでなく、`com.example.app.order` や `com.example.app.customer` のように機能またはドメイン単位でコードを整理する。

## Helidon SE

- **明示的な構成:** アプリケーションのブートストラップ層でサービスと依存関係を明示的に構築する。
- **コンストラクターインジェクション:** 必要な依存関係をコンストラクターで渡し、依存フィールドを `private final` と宣言する。
- **HTTPサービス:** 関連するルートを目的に沿った `HttpService` 実装へまとめる。
- **ビジネスロジック:** ビジネスロジックをルートハンドラーの外に置く。
- **仮想スレッド:** Helidon 4の仮想スレッドベースのリクエスト処理では、単純なブロッキングコードを優先する。明確な理由なくリアクティブな複雑性を導入しない。Helidon 4はリアクティブではないため、`Single`、`Multi`、`CompletionStage` のチェーンを生成しない。

## Helidon MP

- **Jakarta and MicroProfile:** Prefer standard Jakarta EE and Eclipse MicroProfile APIs when available.
- **Dependency Injection:** Use CDI with constructor injection for required dependencies.
- **Bean Scopes:** Use CDI scopes such as `@ApplicationScoped` and `@RequestScoped` intentionally.
- **Normal-Scoped Beans:** Add a non-private no-argument constructor to normal-scoped beans that use constructor injection, so the CDI client proxy can be created portably.
- **Business Logic:** Keep Jakarta REST resource classes thin and delegate business operations to service classes.
- **Portability:** Prefer portable Jakarta and MicroProfile APIs over Helidon-specific APIs when portability is important.

## 構成

- **Externalized Configuration:** Store non-secret configuration in `application.yaml` or `application.properties`.
- **Helidon SE Configuration:** Use Helidon Config and pass configuration values or typed configuration objects to components.
- **Helidon MP Configuration:** Use MicroProfile Config for injected application settings.
- **Environment Overrides:** Use environment variables or deployment-specific configuration sources for environment-dependent values.
- **Secrets Management:** Never hardcode credentials, API keys, tokens, or private certificates.

## Web層

- **DTOs:** Use dedicated request and response models. Do not expose persistence entities directly through APIs.
- **Validation:** Validate path parameters, query parameters, headers, and request bodies before invoking business logic.
- **Status Codes:** Return appropriate HTTP status codes for successful, invalid, unauthorized, forbidden, missing, and failed requests. On `PUT` and `DELETE`, return 404 when the target does not exist rather than succeeding unconditionally.
- **Error Handling:** Use centralized error handling in Helidon SE and Jakarta REST `ExceptionMapper` implementations in Helidon MP.
- **Sensitive Information:** Do not expose stack traces, database details, filesystem paths, or internal exception messages to clients.

### Helidon SEの例

Use an `HttpService` to register routes programmatically. Keep request handlers small and delegate business logic to a service.

```java
import io.helidon.http.Status;
import io.helidon.webserver.http.HttpRules;
import io.helidon.webserver.http.HttpService;
import io.helidon.webserver.http.ServerRequest;
import io.helidon.webserver.http.ServerResponse;

public final class CustomerHttpService implements HttpService {

    private final CustomerService customerService;

    public CustomerHttpService(CustomerService customerService) {
        this.customerService = customerService;
    }

    @Override
    public void routing(HttpRules rules) {
        rules.get("/{id}", this::findById);
    }

    private void findById(ServerRequest request, ServerResponse response) {
        var id = request.path().pathParameters().get("id");

        customerService.findById(id)
                .ifPresentOrElse(
                        response::send,
                        () -> response.status(Status.NOT_FOUND_404).send()
                );
    }
}
```

Register the HTTP service when constructing the server:

```java
import io.helidon.webserver.WebServer;

WebServer server = WebServer.builder()
        .routing(routing -> routing.register("/customers", customerHttpService))
        .build()
        .start();
```

### Helidon MPの例

Use Jakarta REST annotations for endpoints and CDI for dependency injection.

```java
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/customers")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class CustomerResource {

    private final CustomerService customerService;

    protected CustomerResource() {
        this.customerService = null;
    }

    @Inject
    public CustomerResource(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") String id) {
        return customerService.findById(id)
                .map(customer -> Response.ok(customer).build())
                .orElseGet(() -> Response.status(Response.Status.NOT_FOUND).build());
    }
}
```

## サービス層

- **Transactions:** Define transaction boundaries around complete business operations.
- **Entity Mapping:** Map persistence entities to API models at the service boundary so that service method signatures expose only API models. A service returning `Optional<CustomerEntity>` where the caller expects `Optional<Customer>` is a common generated-code compile error.
- **Concurrency:** Avoid mutable shared state in application-scoped components unless access is properly coordinated.

### Helidon SE Example

Helidon SE services are normally plain Java classes with explicitly supplied dependencies.

```java
public final class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Optional<Customer> findById(String id) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Customer ID is required");
        }

        return customerRepository.findById(id);
    }

    public Customer create(CreateCustomerRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Customer name is required");
        }

        var customer = new Customer(request.id(), request.name().trim());

        customerRepository.save(customer);
        return customer;
    }
}
```

Construct the dependency graph explicitly:

```java
var repository = new DbCustomerRepository(dbClient);
var service = new CustomerService(repository);
var httpService = new CustomerHttpService(service);
```

### Helidon MP Example

Use CDI scopes and constructor injection. Apply transactions at the service layer when a business operation changes persistent state. Map the persistence entity to the API model here, so the service never leaks `CustomerEntity` to callers.

```java
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class CustomerService {

    private final JpaCustomerRepository customerRepository;

    protected CustomerService() {
        this.customerRepository = null;
    }

    @Inject
    public CustomerService(JpaCustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Optional<Customer> findById(String id) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Customer ID is required");
        }

        return customerRepository.findById(id)
                .map(Customer::fromEntity);
    }

    @Transactional
    public Customer create(CreateCustomerRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Customer name is required");
        }

        var entity = new CustomerEntity(request.id(), request.name().trim());

        customerRepository.save(entity);
        return Customer.fromEntity(entity);
    }
}
```

## データ層

- **Database Access:** Use Helidon DB Client, Jakarta Persistence, or another persistence mechanism already established by the project.
- **Parameterized Queries:** Always use parameter binding or prepared statements. Never concatenate untrusted input into SQL.
- **Column Accessors:** Read a typed column value with `column("name").getString()` (or `getInt()`, `getLong()`, and so on) or with `column("name").get(String.class)`. `DbColumn.as(String.class)` returns an `OptionalValue<String>` in Helidon 4, not a `String`.
- **Nullable Columns:** Read nullable columns through `asOptional()` or another optional-aware accessor. Direct `getString()` and similar accessors throw when the column value is null.
- **Row Mapping:** For whole-row mapping, `DbRow.as(Customer.class)` returns the mapped instance directly, but requires a `DbMapper` registered through a `DbMapperProvider` service-loader entry. Prefer explicit column reads for a small number of simple repositories, and introduce a `DbMapper` when the same row shape is mapped in several places.
- **Migrations:** Use a database migration tool for schema changes rather than automatic destructive schema updates.
- **Entity Separation:** Do not expose database entities directly as API contracts.

### Helidon SE Example

Use Helidon DB Client with parameterized statements. Map database rows into application models inside the repository.

```java
import io.helidon.dbclient.DbClient;

public final class DbCustomerRepository implements CustomerRepository {

    private static final String FIND_BY_ID =
            "SELECT id, name FROM customers WHERE id = :id";

    private static final String INSERT =
            "INSERT INTO customers (id, name) VALUES (:id, :name)";

    private final DbClient dbClient;

    public DbCustomerRepository(DbClient dbClient) {
        this.dbClient = dbClient;
    }

    @Override
    public Optional<Customer> findById(String id) {
        return dbClient.execute()
                .createGet(FIND_BY_ID)
                .addParam("id", id)
                .execute()
                .map(row -> new Customer(
                        row.column("id").getString(),
                        row.column("name").getString()
                ));
    }

    @Override
    public void save(Customer customer) {
        dbClient.execute()
                .createInsert(INSERT)
                .addParam("id", customer.id())
                .addParam("name", customer.name())
                .execute();
    }
}
```

Named statements can also be stored in configuration instead of embedding SQL in Java:

```yaml
db:
  source: "jdbc"
  connection:
    url: "jdbc:postgresql://localhost:5432/customers"
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  statements:
    find-customer-by-id: >
      SELECT id, name
      FROM customers
      WHERE id = :id
```

Reference the named statement by name instead of passing SQL text:

```java
return dbClient.execute()
        .createNamedGet("find-customer-by-id")
        .addParam("id", id)
        .execute()
        .map(row -> new Customer(
                row.column("id").getString(),
                row.column("name").getString()
        ));
```

### Helidon MP Example

Use Jakarta Persistence in a CDI-managed repository. Keep transaction boundaries in the service layer. The repository works in entities; the service maps them to API models.

```java
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@ApplicationScoped
public class JpaCustomerRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public Optional<CustomerEntity> findById(String id) {
        return Optional.ofNullable(entityManager.find(CustomerEntity.class, id));
    }

    public void save(CustomerEntity customer) {
        entityManager.persist(customer);
    }
}
```

Define the persistence entity separately from the public API model:

```java
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "customers")
public class CustomerEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    protected CustomerEntity() {
    }

    public CustomerEntity(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String id() {
        return id;
    }

    public String name() {
        return name;
    }
}
```

The API model stays free of persistence annotations and owns the mapping:

```java
public record Customer(String id, String name) {

    public static Customer fromEntity(CustomerEntity entity) {
        return new Customer(entity.id(), entity.name());
    }
}
```

## 可観測性

- **Health:** Use Helidon Health in SE or MicroProfile Health in MP for liveness and readiness checks.
- **Metrics:** Use Helidon Metrics or MicroProfile Metrics for operational and business measurements.
- **Tracing:** Propagate tracing context across inbound and outbound service calls.
- **Cardinality:** Avoid user IDs, request IDs, email addresses, and raw URLs as metric tags.

## ロギング

- **Logging API:** Use the logging API and implementation configured by the project.
- **Sensitive Information:** Never log passwords, access tokens, authorization headers, cookies, or complete sensitive request bodies. Do not place secrets or personal information in metrics or trace attributes either.

## テスト

- **Unit Tests:** Write unit tests for business services using JUnit 5.
- **Helidon SE Tests:** Use `helidon-webserver-testing-junit5` with `@ServerTest` for full server tests and `@RoutingTest` for routing-only tests. These start the server on a dynamically selected port and inject a `Http1Client` bound to it. Never hardcode a port.
- **Helidon MP Tests:** Use `helidon-microprofile-testing-junit5` with `@HelidonTest`, which starts the CDI container and server for the test class. Confirm the artifact coordinates against the Helidon version in use, since this module was renamed across 4.x releases.
- **Testcontainers:** Consider Testcontainers for integration tests using real databases, message brokers, or other infrastructure.
- **Failure Paths:** Test validation failures, missing resources, external-service failures, and authorization failures.

## セキュリティ

- **Helidon Security:** Use Helidon Security or supported Jakarta and MicroProfile security APIs for authentication and authorization.
- **Authorization:** Enforce permissions at a clear application boundary and deny protected operations by default.
- **JWT and OIDC:** Validate token signatures, issuers, audiences, and expiration times.
- **TLS:** Use TLS for production traffic and verify certificates for outbound connections.
- **CORS:** Configure allowed origins explicitly. Do not combine wildcard origins with credentials.
- **Secrets:** Store secrets in protected environment configuration or a dedicated secret-management system.
- **Outbound Requests:** Validate outbound destinations to reduce server-side request forgery risks.

---
name: create-spring-boot-kotlin-project
description: 'Spring Boot Kotlinプロジェクトのひな形を作成する。'
---

# Spring Boot Kotlinプロジェクト作成プロンプト

- 次のソフトウェアがシステムにインストールされていることを確認する。

  - Java 21
  - Docker
  - Docker Compose

- プロジェクト名をカスタマイズする場合は、[Spring Bootプロジェクトテンプレートのダウンロード](#download-spring-boot-project-template)にある `artifactId` と `packageName` を変更する。

- Spring Bootのバージョンを更新する場合は、[Spring Bootプロジェクトテンプレートのダウンロード](#download-spring-boot-project-template)にある `bootVersion` を変更する。

## Javaバージョンの確認

- ターミナルで次のコマンドを実行し、Javaのバージョンを確認する。

```shell
java -version
```

## Spring Bootプロジェクトテンプレートのダウンロード

- ターミナルで次のコマンドを実行し、Spring Bootプロジェクトテンプレートをダウンロードする。

```shell
curl https://start.spring.io/starter.zip \
  -d artifactId=${input:projectName:demo-kotlin} \
  -d bootVersion=3.4.5 \
  -d dependencies=configuration-processor,webflux,data-r2dbc,postgresql,data-redis-reactive,data-mongodb-reactive,validation,cache,testcontainers \
  -d javaVersion=21 \
  -d language=kotlin \
  -d packageName=com.example \
  -d packaging=jar \
  -d type=gradle-project-kotlin \
  -o starter.zip
```

## ダウンロードしたファイルの展開

- ターミナルで次のコマンドを実行し、ダウンロードしたファイルを展開する。

```shell
unzip starter.zip -d ./${input:projectName:demo-kotlin}
```

## ダウンロードしたZIPファイルの削除

- ターミナルで次のコマンドを実行し、ダウンロードしたZIPファイルを削除する。

```shell
rm -f starter.zip
```

## ダウンロードしたファイルの展開

- ターミナルで次のコマンドを実行し、ダウンロードしたファイルを展開する。

```shell
unzip starter.zip -d ./${input:projectName:demo-kotlin}
```

## 追加の依存関係

- `build.gradle.kts` ファイルに `springdoc-openapi-starter-webmvc-ui` と `archunit-junit5` の依存関係を追加する。

```gradle.kts
dependencies {
  implementation("org.springdoc:springdoc-openapi-starter-webflux-ui:2.8.6")
  testImplementation("com.tngtech.archunit:archunit-junit5:1.2.1")
}
```

- `application.properties` ファイルにSpringDocの構成を追加する。

```properties
# SpringDoc configurations
springdoc.swagger-ui.doc-expansion=none
springdoc.swagger-ui.operations-sorter=alpha
springdoc.swagger-ui.tags-sorter=alpha
```

- `application.properties` ファイルにRedisの構成を追加する。

```properties
# Redis configurations
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.password=rootroot
```

- `application.properties` ファイルにR2DBCの構成を追加する。

```properties
# R2DBC configurations
spring.r2dbc.url=r2dbc:postgresql://localhost:5432/postgres
spring.r2dbc.username=postgres
spring.r2dbc.password=rootroot

spring.sql.init.mode=always
spring.sql.init.platform=postgres
spring.sql.init.continue-on-error=true
```

- `application.properties` ファイルにMongoDBの構成を追加する。

```properties
# MongoDB configurations
spring.data.mongodb.host=localhost
spring.data.mongodb.port=27017
spring.data.mongodb.authentication-database=admin
spring.data.mongodb.username=root
spring.data.mongodb.password=rootroot
spring.data.mongodb.database=test
```

- プロジェクトルートに `docker-compose.yaml` を作成し、`redis:6`、`postgresql:17`、`mongo:8` の各サービスを追加する。

  - redisサービスには次を設定する
    - パスワード `rootroot`
    - ポート6379を6379へマッピング
    - ボリューム `./redis_data` を `/data` へマウント
  - postgresqlサービスには次を設定する
    - パスワード `rootroot`
    - ポート5432を5432へマッピング
    - ボリューム `./postgres_data` を `/var/lib/postgresql/data` へマウント
  - mongoサービスには次を設定する
    - initdbのrootユーザー名 `root`
    - initdbのrootパスワード `rootroot`
    - ポート27017を27017へマッピング
    - ボリューム `./mongo_data` を `/data/db` へマウント

- `.gitignore` ファイルに `redis_data`、`postgres_data`、`mongo_data` ディレクトリを追加する。

- Gradleのclean testコマンドを実行し、プロジェクトが動作することを確認する。

```shell
./gradlew clean test
```

- （任意）`docker-compose up -d` でサービスを起動し、`./gradlew spring-boot:run` でSpring Bootプロジェクトを実行し、`docker-compose rm -sf` でサービスを停止する。

1ステップずつ進める。

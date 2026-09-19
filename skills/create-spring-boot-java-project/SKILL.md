---
name: create-spring-boot-java-project
description: 'Spring Boot Javaプロジェクトのひな形を作成する。'
---

# Spring Boot Javaプロジェクト作成プロンプト

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
  -d artifactId=${input:projectName:demo-java} \
  -d bootVersion=3.4.5 \
  -d dependencies=lombok,configuration-processor,web,data-jpa,postgresql,data-redis,data-mongodb,validation,cache,testcontainers \
  -d javaVersion=21 \
  -d packageName=com.example \
  -d packaging=jar \
  -d type=maven-project \
  -o starter.zip
```

## ダウンロードしたファイルの展開

- ターミナルで次のコマンドを実行し、ダウンロードしたファイルを展開する。

```shell
unzip starter.zip -d ./${input:projectName:demo-java}
```

## ダウンロードしたZIPファイルの削除

- ターミナルで次のコマンドを実行し、ダウンロードしたZIPファイルを削除する。

```shell
rm -f starter.zip
```

## プロジェクトルートへの移動

- ターミナルで次のコマンドを実行し、プロジェクトルートへ移動する。

```shell
cd ${input:projectName:demo-java}
```

## 追加の依存関係

- `pom.xml` ファイルに `springdoc-openapi-starter-webmvc-ui` と `archunit-junit5` の依存関係を追加する。

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>2.8.6</version>
</dependency>
<dependency>
  <groupId>com.tngtech.archunit</groupId>
  <artifactId>archunit-junit5</artifactId>
  <version>1.2.1</version>
  <scope>test</scope>
</dependency>
```

## SpringDoc、Redis、JPA、MongoDBの構成追加

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

- `application.properties` ファイルにJPAの構成を追加する。

```properties
# JPA configurations
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=rootroot
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
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

## Redis、PostgreSQL、MongoDBサービスを含む `docker-compose.yaml` の追加

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

## `.gitignore` ファイルへの追加

- `.gitignore` ファイルに `redis_data`、`postgres_data`、`mongo_data` ディレクトリを追加する。

## Mavenテストコマンドの実行

- Mavenのclean testコマンドを実行し、プロジェクトが動作することを確認する。

```shell
./mvnw clean test
```

## Maven実行コマンド（任意）

- （任意）`docker-compose up -d` でサービスを起動し、`./mvnw spring-boot:run` でSpring Bootプロジェクトを実行し、`docker-compose rm -sf` でサービスを停止する。

## 1ステップずつ進める

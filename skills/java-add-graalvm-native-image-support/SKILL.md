---
name: java-add-graalvm-native-image-support
description: 'JavaアプリケーションにGraalVM Native Image対応を追加し、プロジェクトをビルドしてビルドエラーを分析・修正し、Oracleのベストプラクティスに従ってコンパイル成功まで反復する専門Skill。'
---

# GraalVM Native Image Agent

JavaアプリケーションにGraalVM Native Image対応を追加する専門家として、次を行う。

1. プロジェクト構造を分析し、ビルドツール（MavenまたはGradle）を特定する
2. フレームワーク（Spring Boot、Quarkus、Micronaut、または一般的なJava）を検出する
3. 適切なGraalVM Native Image構成を追加する
4. Native Imageをビルドする
5. ビルドエラーや警告を分析する
6. ビルドが成功するまで修正を反復する

## アプローチ

GraalVM Native ImageについてOracleのベストプラクティスに従い、問題を解決するため反復的に進める。

### 手順1: プロジェクトを分析する

- `pom.xml`（Maven）または `build.gradle`/`build.gradle.kts`（Gradle）が存在するか確認する
- 依存関係を確認してフレームワークを特定する。
  - Spring Boot: `spring-boot-starter` dependencies
  - Quarkus: `quarkus-` dependencies
  - Micronaut: `micronaut-` dependencies
- 既存のGraalVM構成を確認する

### 手順2: Native Image対応を追加する

#### Mavenプロジェクトの場合

Add the GraalVM Native Build Tools plugin within a `native` profile in `pom.xml`:

```xml
<profiles>
  <profile>
    <id>native</id>
    <build>
      <plugins>
        <plugin>
          <groupId>org.graalvm.buildtools</groupId>
          <artifactId>native-maven-plugin</artifactId>
          <version>[latest-version]</version>
          <extensions>true</extensions>
          <executions>
            <execution>
              <id>build-native</id>
              <goals>
                <goal>compile-no-fork</goal>
              </goals>
              <phase>package</phase>
            </execution>
          </executions>
          <configuration>
            <imageName>${project.artifactId}</imageName>
            <mainClass>${main.class}</mainClass>
            <buildArgs>
              <buildArg>--no-fallback</buildArg>
            </buildArgs>
          </configuration>
        </plugin>
      </plugins>
    </build>
  </profile>
</profiles>
```

Spring Bootプロジェクトでは、メインのbuildセクションにSpring Boot Mavenプラグインがあることを確認する。

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
    </plugin>
  </plugins>
</build>
```

#### Gradleプロジェクトの場合

Add the GraalVM Native Build Tools plugin to `build.gradle`:

```groovy
plugins {
  id 'org.graalvm.buildtools.native' version '[latest-version]'
}

graalvmNative {
  binaries {
    main {
      imageName = project.name
      mainClass = application.mainClass.get()
      buildArgs.add('--no-fallback')
    }
  }
}
```

Or for Kotlin DSL (`build.gradle.kts`):

```kotlin
plugins {
  id("org.graalvm.buildtools.native") version "[latest-version]"
}

graalvmNative {
  binaries {
    named("main") {
      imageName.set(project.name)
      mainClass.set(application.mainClass.get())
      buildArgs.add("--no-fallback")
    }
  }
}
```

### 手順3: Native Imageをビルドする

適切なビルドコマンドを実行する。

**Maven:**
```sh
mvn -Pnative native:compile
```

**Gradle:**
```sh
./gradlew nativeCompile
```

**Spring Boot (Maven):**
```sh
mvn -Pnative spring-boot:build-image
```

**Quarkus (Maven):**
```sh
./mvnw package -Pnative
```

**Micronaut (Maven):**
```sh
./mvnw package -Dpackaging=native-image
```

### 手順4: ビルドエラーを分析する

よくある問題と解決策:

#### リフレクションの問題
If you see errors about missing reflection configuration, create or update `src/main/resources/META-INF/native-image/reflect-config.json`:

```json
[
  {
    "name": "com.example.YourClass",
    "allDeclaredConstructors": true,
    "allDeclaredMethods": true,
    "allDeclaredFields": true
  }
]
```

#### リソースアクセスの問題
For missing resources, create `src/main/resources/META-INF/native-image/resource-config.json`:

```json
{
  "resources": {
    "includes": [
      {"pattern": "application.properties"},
      {"pattern": ".*\\.yml"},
      {"pattern": ".*\\.yaml"}
    ]
  }
}
```

#### JNIの問題
For JNI-related errors, create `src/main/resources/META-INF/native-image/jni-config.json`:

```json
[
  {
    "name": "com.example.NativeClass",
    "methods": [
      {"name": "nativeMethod", "parameterTypes": ["java.lang.String"]}
    ]
  }
]
```

#### 動的プロキシの問題
For dynamic proxy errors, create `src/main/resources/META-INF/native-image/proxy-config.json`:

```json
[
  ["com.example.Interface1", "com.example.Interface2"]
]
```

### 手順5: 成功するまで反復する

- 修正するたびにNative Imageを再ビルドする
- 新しいエラーを分析して適切な修正を適用する
- GraalVM tracing agentを使って構成を自動生成する。
  ```sh
  java -agentlib:native-image-agent=config-output-dir=src/main/resources/META-INF/native-image -jar target/app.jar
  ```
- エラーなしでビルドが成功するまで続ける

### 手順6: Native Imageを検証する

ビルドが成功したら:
- Native実行ファイルが正常に動くことをテストする
- 起動時間の改善を確認する
- メモリ使用量を確認する
- 重要なアプリケーションパスをすべてテストする

## フレームワーク固有の考慮事項

### Spring Boot
- Spring Boot 3.0+ has excellent native image support
- Ensure you're using compatible Spring Boot version (3.0+)
- Most Spring libraries provide GraalVM hints automatically
- Test with Spring AOT processing enabled

**When to Add Custom RuntimeHints:**

Create a `RuntimeHintsRegistrar` implementation only if you need to register custom hints:

```java
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;

public class MyRuntimeHints implements RuntimeHintsRegistrar {
    @Override
    public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
        // Register reflection hints
        hints.reflection().registerType(
            MyClass.class,
            hint -> hint.withMembers(MemberCategory.INVOKE_DECLARED_CONSTRUCTORS,
                                     MemberCategory.INVOKE_DECLARED_METHODS)
        );

        // Register resource hints
        hints.resources().registerPattern("custom-config/*.properties");

        // Register serialization hints
        hints.serialization().registerType(MySerializableClass.class);
    }
}
```

Register it in your main application class:

```java
@SpringBootApplication
@ImportRuntimeHints(MyRuntimeHints.class)
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**Common Spring Boot Native Image Issues:**

1. **Logback Configuration**: Add to `application.properties`:
   ```properties
   # Disable Logback's shutdown hook in native images
   logging.register-shutdown-hook=false
   ```

   If using custom Logback configuration, ensure `logback-spring.xml` is in resources and add to `RuntimeHints`:
   ```java
   hints.resources().registerPattern("logback-spring.xml");
   hints.resources().registerPattern("org/springframework/boot/logging/logback/*.xml");
   ```

2. **Jackson Serialization**: For custom Jackson modules or types, register them:
   ```java
   hints.serialization().registerType(MyDto.class);
   hints.reflection().registerType(
       MyDto.class,
       hint -> hint.withMembers(
           MemberCategory.DECLARED_FIELDS,
           MemberCategory.INVOKE_DECLARED_CONSTRUCTORS
       )
   );
   ```

   Add Jackson mix-ins to reflection hints if used:
   ```java
   hints.reflection().registerType(MyMixIn.class);
   ```

3. **Jackson Modules**: Ensure Jackson modules are on the classpath:
   ```xml
   <dependency>
       <groupId>com.fasterxml.jackson.datatype</groupId>
       <artifactId>jackson-datatype-jsr310</artifactId>
   </dependency>
   ```

### Quarkus
- Quarkus is designed for native images with zero configuration in most cases
- Use `@RegisterForReflection` annotation for reflection needs
- Quarkus extensions handle GraalVM configuration automatically

**Common Quarkus Native Image Tips:**

1. **Reflection Registration**: Use annotations instead of manual configuration:
   ```java
   @RegisterForReflection(targets = {MyClass.class, MyDto.class})
   public class ReflectionConfiguration {
   }
   ```

   Or register entire packages:
   ```java
   @RegisterForReflection(classNames = {"com.example.package.*"})
   ```

2. **Resource Inclusion**: Add to `application.properties`:
   ```properties
   quarkus.native.resources.includes=config/*.json,templates/**
   quarkus.native.additional-build-args=--initialize-at-run-time=com.example.RuntimeClass
   ```

3. **Database Drivers**: Ensure you're using Quarkus-supported JDBC extensions:
   ```xml
   <dependency>
       <groupId>io.quarkus</groupId>
       <artifactId>quarkus-jdbc-postgresql</artifactId>
   </dependency>
   ```

4. **Build-Time vs Runtime Initialization**: Control initialization with:
   ```properties
   quarkus.native.additional-build-args=--initialize-at-build-time=com.example.BuildTimeClass
   quarkus.native.additional-build-args=--initialize-at-run-time=com.example.RuntimeClass
   ```

5. **Container Image Build**: Use Quarkus container-image extensions:
   ```properties
   quarkus.native.container-build=true
   quarkus.native.builder-image=mandrel
   ```

### Micronaut
- Micronaut has built-in GraalVM support with minimal configuration
- Use `@ReflectionConfig` and `@Introspected` annotations as needed
- Micronaut's ahead-of-time compilation reduces reflection requirements

**Common Micronaut Native Image Tips:**

1. **Bean Introspection**: Use `@Introspected` for POJOs to avoid reflection:
   ```java
   @Introspected
   public class MyDto {
       private String name;
       private int value;
       // getters and setters
   }
   ```

   Or enable package-wide introspection in `application.yml`:
   ```yaml
   micronaut:
     introspection:
       packages:
         - com.example.dto
   ```

2. **Reflection Configuration**: Use declarative annotations:
   ```java
   @ReflectionConfig(
       type = MyClass.class,
       accessType = ReflectionConfig.AccessType.ALL_DECLARED_CONSTRUCTORS
   )
   public class MyConfiguration {
   }
   ```

3. **Resource Configuration**: Add resources to native image:
   ```java
   @ResourceConfig(
       includes = {"application.yml", "logback.xml"}
   )
   public class ResourceConfiguration {
   }
   ```

4. **Native Image Configuration**: In `build.gradle`:
   ```groovy
   graalvmNative {
       binaries {
           main {
               buildArgs.add("--initialize-at-build-time=io.micronaut")
               buildArgs.add("--initialize-at-run-time=io.netty")
               buildArgs.add("--report-unsupported-elements-at-runtime")
           }
       }
   }
   ```

5. **HTTP Client Configuration**: For Micronaut HTTP clients, ensure netty is properly configured:
   ```yaml
   micronaut:
     http:
       client:
         read-timeout: 30s
   netty:
     default:
       allocator:
         max-order: 3
   ```

## ベストプラクティス

- **単純に始める**: すべてのNative Image問題を検出するため `--no-fallback` でビルドする
- **Tracing Agentを使う**: GraalVM tracing agentでアプリケーションを実行し、リフレクション、リソース、JNI要件を自動検出する
- **十分にテストする**: Native ImageはJVMアプリケーションとは異なる動作をする
- **リフレクションを最小化する**: 実行時リフレクションよりコンパイル時コード生成を優先する
- **メモリをプロファイルする**: Native Imageは異なるメモリ特性を持つ
- **CI/CDに統合する**: CI/CDパイプラインにNative Imageビルドを追加する
- **依存関係を最新に保つ**: GraalVM互換性向上のため最新バージョンを使う

## トラブルシューティングのヒント

1. **Build Fails with Reflection Errors**: Use the tracing agent or add manual reflection configuration
2. **Missing Resources**: Ensure resource patterns are correctly specified in `resource-config.json`
3. **ClassNotFoundException at Runtime**: Add the class to reflection configuration
4. **Slow Build Times**: Consider using build caching and incremental builds
5. **Large Image Size**: Use `--gc=serial` (default) or `--gc=epsilon` (no-op GC for testing) and analyze dependencies

## 参考資料

- [GraalVM Native Image Documentation](https://www.graalvm.org/latest/reference-manual/native-image/)
- [Spring Boot Native Image Guide](https://docs.spring.io/spring-boot/docs/current/reference/html/native-image.html)
- [Quarkus Building Native Images](https://quarkus.io/guides/building-native-image)
- [Micronaut GraalVM Support](https://docs.micronaut.io/latest/guide/index.html#graal)
- [GraalVM Reachability Metadata](https://github.com/oracle/graalvm-reachability-metadata)
- [Native Build Tools](https://graalvm.github.io/native-build-tools/latest/index.html)

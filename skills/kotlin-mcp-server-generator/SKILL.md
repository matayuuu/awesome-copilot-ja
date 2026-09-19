---
name: kotlin-mcp-server-generator
description: '公式のio.modelcontextprotocol:kotlin-sdkライブラリを使い、適切な構成、依存関係、実装を備えた完全なKotlin MCPサーバープロジェクトを生成する。'
---

# Kotlin MCPサーバープロジェクトジェネレーター

完全で本番利用可能なModel Context Protocol（MCP）サーバープロジェクトをKotlinで生成する。

## プロジェクト要件

次の要素を備えたKotlin MCPサーバーを作成する。

1. **プロジェクト構成**: GradleベースのKotlinプロジェクトレイアウト
2. **依存関係**: 公式MCP SDK、Ktor、kotlinxライブラリ
3. **サーバーセットアップ**: トランスポートを設定したMCPサーバー
4. **ツール**: 型付きの入力/出力を持つ、少なくとも2〜3個の有用なツール
5. **エラー処理**: 適切な例外処理とバリデーション
6. **ドキュメント**: セットアップと使用方法を説明するREADME
7. **テスト**: コルーチンを使った基本的なテスト構成

## Template Structure

```
myserver/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle.properties
├── src/
│   ├── main/
│   │   └── kotlin/
│   │       └── com/example/myserver/
│   │           ├── Main.kt
│   │           ├── Server.kt
│   │           ├── config/
│   │           │   └── Config.kt
│   │           └── tools/
│   │               ├── Tool1.kt
│   │               └── Tool2.kt
│   └── test/
│       └── kotlin/
│           └── com/example/myserver/
│               └── ServerTest.kt
└── README.md
```

## build.gradle.ktsのテンプレート

```kotlin
plugins {
    kotlin("jvm") version "2.1.0"
    kotlin("plugin.serialization") version "2.1.0"
    application
}

group = "com.example"
version = "1.0.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation("io.modelcontextprotocol:kotlin-sdk:0.7.2")
    
    // Ktor for transports
    implementation("io.ktor:ktor-server-netty:3.0.0")
    implementation("io.ktor:ktor-client-cio:3.0.0")
    
    // Serialization
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.9.0")
    
    // Logging
    implementation("io.github.oshai:kotlin-logging-jvm:7.0.0")
    implementation("ch.qos.logback:logback-classic:1.5.12")
    
    // Testing
    testImplementation(kotlin("test"))
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.9.0")
}

application {
    mainClass.set("com.example.myserver.MainKt")
}

tasks.test {
    useJUnitPlatform()
}

kotlin {
    jvmToolchain(17)
}
```

## settings.gradle.ktsのテンプレート

```kotlin
rootProject.name = "{{PROJECT_NAME}}"
```

## Main.ktのテンプレート

```kotlin
package com.example.myserver

import io.modelcontextprotocol.kotlin.sdk.server.StdioServerTransport
import kotlinx.coroutines.runBlocking
import io.github.oshai.kotlinlogging.KotlinLogging

private val logger = KotlinLogging.logger {}

fun main() = runBlocking {
    logger.info { "Starting MCP server..." }
    
    val config = loadConfig()
    val server = createServer(config)
    
    // Use stdio transport
    val transport = StdioServerTransport()
    
    logger.info { "Server '${config.name}' v${config.version} ready" }
    server.connect(transport)
}
```

## Server.ktのテンプレート

```kotlin
package com.example.myserver

import io.modelcontextprotocol.kotlin.sdk.server.Server
import io.modelcontextprotocol.kotlin.sdk.server.ServerOptions
import io.modelcontextprotocol.kotlin.sdk.Implementation
import io.modelcontextprotocol.kotlin.sdk.ServerCapabilities
import com.example.myserver.tools.registerTools

fun createServer(config: Config): Server {
    val server = Server(
        serverInfo = Implementation(
            name = config.name,
            version = config.version
        ),
        options = ServerOptions(
            capabilities = ServerCapabilities(
                tools = ServerCapabilities.Tools(),
                resources = ServerCapabilities.Resources(
                    subscribe = true,
                    listChanged = true
                ),
                prompts = ServerCapabilities.Prompts(listChanged = true)
            )
        )
    ) {
        config.description
    }
    
    // Register all tools
    server.registerTools()
    
    return server
}
```

## Config.ktのテンプレート

```kotlin
package com.example.myserver.config

import kotlinx.serialization.Serializable

@Serializable
data class Config(
    val name: String = "{{PROJECT_NAME}}",
    val version: String = "1.0.0",
    val description: String = "{{PROJECT_DESCRIPTION}}"
)

fun loadConfig(): Config {
    return Config(
        name = System.getenv("SERVER_NAME") ?: "{{PROJECT_NAME}}",
        version = System.getenv("VERSION") ?: "1.0.0",
        description = System.getenv("DESCRIPTION") ?: "{{PROJECT_DESCRIPTION}}"
    )
}
```

## Tool1.ktのテンプレート

```kotlin
package com.example.myserver.tools

import io.modelcontextprotocol.kotlin.sdk.server.Server
import io.modelcontextprotocol.kotlin.sdk.CallToolRequest
import io.modelcontextprotocol.kotlin.sdk.CallToolResult
import io.modelcontextprotocol.kotlin.sdk.TextContent
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonObject
import kotlinx.serialization.json.putJsonArray

fun Server.registerTool1() {
    addTool(
        name = "tool1",
        description = "Description of what tool1 does",
        inputSchema = buildJsonObject {
            put("type", "object")
            putJsonObject("properties") {
                putJsonObject("param1") {
                    put("type", "string")
                    put("description", "First parameter")
                }
                putJsonObject("param2") {
                    put("type", "integer")
                    put("description", "Optional second parameter")
                }
            }
            putJsonArray("required") {
                add("param1")
            }
        }
    ) { request: CallToolRequest ->
        // Extract and validate parameters
        val param1 = request.params.arguments["param1"] as? String
            ?: throw IllegalArgumentException("param1 is required")
        val param2 = (request.params.arguments["param2"] as? Number)?.toInt() ?: 0
        
        // Perform tool logic
        val result = performTool1Logic(param1, param2)
        
        CallToolResult(
            content = listOf(
                TextContent(text = result)
            )
        )
    }
}

private fun performTool1Logic(param1: String, param2: Int): String {
    // Implement tool logic here
    return "Processed: $param1 with value $param2"
}
```

## tools/ToolRegistry.ktのテンプレート

```kotlin
package com.example.myserver.tools

import io.modelcontextprotocol.kotlin.sdk.server.Server

fun Server.registerTools() {
    registerTool1()
    registerTool2()
    // Register additional tools here
}
```

## ServerTest.ktのテンプレート

```kotlin
package com.example.myserver

import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse

class ServerTest {
    
    @Test
    fun `test server creation`() = runTest {
        val config = Config(
            name = "test-server",
            version = "1.0.0",
            description = "Test server"
        )
        
        val server = createServer(config)
        
        assertEquals("test-server", server.serverInfo.name)
        assertEquals("1.0.0", server.serverInfo.version)
    }
    
    @Test
    fun `test tool1 execution`() = runTest {
        val config = Config()
        val server = createServer(config)
        
        // Test tool execution
        // Note: You'll need to implement proper testing utilities
        // for calling tools in the server
    }
}
```

## README.mdのテンプレート

```markdown
# {{PROJECT_NAME}}

A Model Context Protocol (MCP) server built with Kotlin.

## Description

{{PROJECT_DESCRIPTION}}

## Requirements

- Java 17 or higher
- Kotlin 2.1.0

## Installation

Build the project:

\`\`\`bash
./gradlew build
\`\`\`

## Usage

Run the server with stdio transport:

\`\`\`bash
./gradlew run
\`\`\`

Or build and run the jar:

\`\`\`bash
./gradlew installDist
./build/install/{{PROJECT_NAME}}/bin/{{PROJECT_NAME}}
\`\`\`

## Configuration

Configure via environment variables:

- `SERVER_NAME`: Server name (default: "{{PROJECT_NAME}}")
- `VERSION`: Server version (default: "1.0.0")
- `DESCRIPTION`: Server description

## Available Tools

### tool1
{{TOOL1_DESCRIPTION}}

**Input:**
- `param1` (string, required): First parameter
- `param2` (integer, optional): Second parameter

**Output:**
- Text result of the operation

## Development

Run tests:

\`\`\`bash
./gradlew test
\`\`\`

Build:

\`\`\`bash
./gradlew build
\`\`\`

Run with auto-reload (development):

\`\`\`bash
./gradlew run --continuous
\`\`\`

## Multiplatform

This project uses Kotlin Multiplatform and can target JVM, Wasm, and iOS.
See `build.gradle.kts` for platform configuration.

## License

MIT
```

## 生成手順

Kotlin MCPサーバーを生成するときは、次の手順に従う。

1. **Gradleのセットアップ**: すべての依存関係を含む適切な`build.gradle.kts`を作成する
2. **パッケージ構成**: Kotlinのパッケージ規約に従う
3. **型安全性**: data classとkotlinx.serializationを使う
4. **コルーチン**: すべての操作をサスペンド関数にする
5. **エラー処理**: Kotlinの例外とバリデーションを使う
6. **JSONスキーマ**: ツールスキーマには`buildJsonObject`を使う
7. **テスト**: コルーチン用テストユーティリティを含める
8. **ロギング**: 構造化ロギングにはkotlin-loggingを使う
9. **構成**: データクラスと環境変数を使う
10. **ドキュメント**: 公開APIにはKDocコメントを付ける

## ベストプラクティス

- すべての非同期操作にサスペンド関数を使う
- KotlinのNull安全性と型システムを活用する
- 構造化データにはデータクラスを使う
- JSON処理にはkotlinx.serializationを適用する
- 結果の型にはsealed classを使う
- Result/Eitherパターンで適切なエラー処理を実装する
- kotlinx-coroutines-testを使ってテストを書く
- テスト容易性のために依存性注入を使う
- Kotlinのコーディング規約に従う
- 意味のある名前とKDocコメントを使う

## トランスポートの選択肢

### Stdioトランスポート
```kotlin
val transport = StdioServerTransport()
server.connect(transport)
```

### SSEトランスポート（Ktor）
```kotlin
embeddedServer(Netty, port = 8080) {
    mcp {
        Server(/*...*/) { "Description" }
    }
}.start(wait = true)
```

## マルチプラットフォーム構成

マルチプラットフォームプロジェクトでは、`build.gradle.kts`に次を追加する。

```kotlin
kotlin {
    jvm()
    js(IR) { nodejs() }
    wasmJs()
    
    sourceSets {
        commonMain.dependencies {
            implementation("io.modelcontextprotocol:kotlin-sdk:0.7.2")
        }
    }
}
```

---
name: copilot-sdk
description: 'GitHub Copilot SDKでエージェント型アプリケーションを構築する。アプリへのAIエージェント組み込み、カスタムツール作成、ストリーミング応答の実装、セッション管理、MCP serverへの接続、カスタムエージェント作成に使用する。Copilot SDK、GitHub SDK、エージェント型アプリ、Copilot組み込み、プログラマブルエージェント、MCP server、カスタムエージェントに関する依頼で起動する。'
---

# GitHub Copilot SDK

Python、TypeScript、Go、.NETを使って、Copilotのエージェント型Workflowを任意のアプリケーションへ組み込む。

## 概要

GitHub Copilot SDKは、Copilot CLIの基盤と同じエンジンを、プログラムから呼び出せる本番検証済みのエージェントランタイムとして公開する。独自のオーケストレーションを構築する必要はない。エージェントの動作を定義すれば、計画、ツール呼び出し、ファイル編集などをCopilotが処理する。

## 前提条件

1. **GitHub Copilotへのアクセス**と認証済み環境
2. **言語ランタイム**: Node.js ^20.19.0または>=22.12.0、Python 3.11以降、Go 1.24以降、または.NET Standard 2.0互換実装
3. **Go**: GitHub Copilot CLIがインストール済みかつ認証済みであること（[インストールガイド](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)）

TypeScript、Python、.NETのpackageは既定で同梱のCopilot runtimeを使うため、CLIを別途インストールする必要はない。

## インストール

### Node.js/TypeScript
```bash
mkdir copilot-demo && cd copilot-demo
npm init -y --init-type module
npm install @github/copilot-sdk tsx
```

### Python
```bash
pip install github-copilot-sdk

# Optional: pre-download the bundled runtime instead of downloading it on first use
python -m copilot download-runtime
```

公開されているPython wheelには、固定されたruntimeバージョンが含まれる。事前downloadコマンドはそのruntimeをローカルへcacheする。省略した場合、SDKは初回利用時に自動downloadを試みる。

### Go
```bash
mkdir copilot-demo && cd copilot-demo
go mod init copilot-demo
go get github.com/github/copilot-sdk/go
```

### .NET
```bash
dotnet new console -n CopilotDemo && cd CopilotDemo
dotnet add package GitHub.Copilot.SDK
```

## クイックスタート

### TypeScript
```typescript
import { CopilotClient, approveAll } from "@github/copilot-sdk";

const client = new CopilotClient();
const session = await client.createSession({
    onPermissionRequest: approveAll,
    model: "gpt-4.1",
});

const response = await session.sendAndWait({ prompt: "What is 2 + 2?" });
console.log(response?.data.content);

await client.stop();
process.exit(0);
```

実行: `npx tsx index.ts`

### Python
```python
import asyncio
from copilot import CopilotClient, PermissionHandler

async def main():
    async with CopilotClient() as client:
        async with await client.create_session(
            on_permission_request=PermissionHandler.approve_all,
            model="gpt-4.1",
        ) as session:
            response = await session.send_and_wait("What is 2 + 2?")
            print(response.data.content)

asyncio.run(main())
```

### Go
```go
package main

import (
    "fmt"
    "log"
    "os"
    copilot "github.com/github/copilot-sdk/go"
)

func main() {
    client := copilot.NewClient(nil)
    if err := client.Start(); err != nil {
        log.Fatal(err)
    }
    defer client.Stop()

    session, err := client.CreateSession(&copilot.SessionConfig{
        OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
        Model:               "gpt-4.1",
    })
    if err != nil {
        log.Fatal(err)
    }

    response, err := session.SendAndWait(copilot.MessageOptions{Prompt: "What is 2 + 2?"}, 0)
    if err != nil {
        log.Fatal(err)
    }

    fmt.Println(*response.Data.Content)
    os.Exit(0)
}
```

### .NET (C#)
```csharp
using GitHub.Copilot.SDK;

await using var client = new CopilotClient();
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    OnPermissionRequest = PermissionHandler.ApproveAll,
    Model = "gpt-4.1",
});

var response = await session.SendAndWaitAsync(new MessageOptions { Prompt = "What is 2 + 2?" });
Console.WriteLine(response?.Data.Content);
```

実行: `dotnet run`

## ストリーミング応答

より良いUXのため、リアルタイム出力を有効にする。

### TypeScript
```typescript
import { CopilotClient, approveAll, SessionEvent } from "@github/copilot-sdk";

const client = new CopilotClient();
const session = await client.createSession({
    onPermissionRequest: approveAll,
    model: "gpt-4.1",
    streaming: true,
});

session.on((event: SessionEvent) => {
    if (event.type === "assistant.message_delta") {
        process.stdout.write(event.data.deltaContent);
    }
    if (event.type === "session.idle") {
        console.log(); // New line when done
    }
});

await session.sendAndWait({ prompt: "Tell me a short joke" });

await client.stop();
process.exit(0);
```

### Python
```python
import asyncio
import sys
from copilot import CopilotClient, PermissionHandler
from copilot.generated.session_events import SessionEventType

async def main():
    async with CopilotClient() as client:
        async with await client.create_session(
            on_permission_request=PermissionHandler.approve_all,
            model="gpt-4.1",
            streaming=True,
        ) as session:
            def handle_event(event):
                if event.type == SessionEventType.ASSISTANT_MESSAGE_DELTA:
                    sys.stdout.write(event.data.delta_content)
                    sys.stdout.flush()
                if event.type == SessionEventType.SESSION_IDLE:
                    print()

            session.on(handle_event)
            await session.send_and_wait("Tell me a short joke")

asyncio.run(main())
```

### Go
```go
session, err := client.CreateSession(&copilot.SessionConfig{
	OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
    Model:     "gpt-4.1",
    Streaming: true,
})

session.On(func(event copilot.SessionEvent) {
    if event.Type == "assistant.message_delta" {
        fmt.Print(*event.Data.DeltaContent)
    }
    if event.Type == "session.idle" {
        fmt.Println()
    }
})

_, err = session.SendAndWait(copilot.MessageOptions{Prompt: "Tell me a short joke"}, 0)
```

### .NET
```csharp
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    OnPermissionRequest = PermissionHandler.ApproveAll,
    Model = "gpt-4.1",
    Streaming = true,
});

session.On(ev =>
{
    if (ev is AssistantMessageDeltaEvent deltaEvent)
        Console.Write(deltaEvent.Data.DeltaContent);
    if (ev is SessionIdleEvent)
        Console.WriteLine();
});

await session.SendAndWaitAsync(new MessageOptions { Prompt = "Tell me a short joke" });
```

## カスタムツール

Copilotが推論中に呼び出せるツールを定義する。ツールを定義するときは、Copilotへ次を伝える。
1. **ツールが何をするか**（description）
2. **必要なパラメーター**（schema）
3. **実行するコード**（handler）

### TypeScript (JSON Schema)
```typescript
import { CopilotClient, approveAll, defineTool, SessionEvent } from "@github/copilot-sdk";

const getWeather = defineTool("get_weather", {
    description: "Get the current weather for a city",
    parameters: {
        type: "object",
        properties: {
            city: { type: "string", description: "The city name" },
        },
        required: ["city"],
    },
    handler: async (args: { city: string }) => {
        const { city } = args;
        // In a real app, call a weather API here
        const conditions = ["sunny", "cloudy", "rainy", "partly cloudy"];
        const temp = Math.floor(Math.random() * 30) + 50;
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        return { city, temperature: `${temp}°F`, condition };
    },
});

const client = new CopilotClient();
const session = await client.createSession({
    onPermissionRequest: approveAll,
    model: "gpt-4.1",
    streaming: true,
    tools: [getWeather],
});

session.on((event: SessionEvent) => {
    if (event.type === "assistant.message_delta") {
        process.stdout.write(event.data.deltaContent);
    }
});

await session.sendAndWait({
    prompt: "What's the weather like in Seattle and Tokyo?",
});

await client.stop();
process.exit(0);
```

### Python (Pydantic)
```python
import asyncio
import random
import sys
from copilot import CopilotClient, PermissionHandler
from copilot.tools import define_tool
from copilot.generated.session_events import SessionEventType
from pydantic import BaseModel, Field

class GetWeatherParams(BaseModel):
    city: str = Field(description="The name of the city to get weather for")

@define_tool(description="Get the current weather for a city")
async def get_weather(params: GetWeatherParams) -> dict:
    city = params.city
    conditions = ["sunny", "cloudy", "rainy", "partly cloudy"]
    temp = random.randint(50, 80)
    condition = random.choice(conditions)
    return {"city": city, "temperature": f"{temp}°F", "condition": condition}

async def main():
    async with CopilotClient() as client:
        async with await client.create_session(
            on_permission_request=PermissionHandler.approve_all,
            model="gpt-4.1",
            streaming=True,
            tools=[get_weather],
        ) as session:
            def handle_event(event):
                if event.type == SessionEventType.ASSISTANT_MESSAGE_DELTA:
                    sys.stdout.write(event.data.delta_content)
                    sys.stdout.flush()

            session.on(handle_event)
            await session.send_and_wait(
                "What's the weather like in Seattle and Tokyo?"
            )

asyncio.run(main())
```

### Go
```go
type WeatherParams struct {
    City string `json:"city" jsonschema:"The city name"`
}

type WeatherResult struct {
    City        string `json:"city"`
    Temperature string `json:"temperature"`
    Condition   string `json:"condition"`
}

getWeather := copilot.DefineTool(
    "get_weather",
    "Get the current weather for a city",
    func(params WeatherParams, inv copilot.ToolInvocation) (WeatherResult, error) {
        conditions := []string{"sunny", "cloudy", "rainy", "partly cloudy"}
        temp := rand.Intn(30) + 50
        condition := conditions[rand.Intn(len(conditions))]
        return WeatherResult{
            City:        params.City,
            Temperature: fmt.Sprintf("%d°F", temp),
            Condition:   condition,
        }, nil
    },
)

session, _ := client.CreateSession(&copilot.SessionConfig{
	OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
    Model:     "gpt-4.1",
    Streaming: true,
    Tools:     []copilot.Tool{getWeather},
})
```

### .NET (Microsoft.Extensions.AI)
```csharp
using GitHub.Copilot.SDK;
using Microsoft.Extensions.AI;
using System.ComponentModel;

var getWeather = AIFunctionFactory.Create(
    ([Description("The city name")] string city) =>
    {
        var conditions = new[] { "sunny", "cloudy", "rainy", "partly cloudy" };
        var temp = Random.Shared.Next(50, 80);
        var condition = conditions[Random.Shared.Next(conditions.Length)];
        return new { city, temperature = $"{temp}°F", condition };
    },
    "get_weather",
    "Get the current weather for a city"
);

await using var session = await client.CreateSessionAsync(new SessionConfig
{
    OnPermissionRequest = PermissionHandler.ApproveAll,
    Model = "gpt-4.1",
    Streaming = true,
    Tools = [getWeather],
});
```

## ツールの仕組み

Copilotがツールの呼び出しを決定すると、次の処理が行われる。
1. Copilotがパラメーターを含むツール呼び出し要求を送る
2. SDKがhandler関数を実行する
3. 結果がCopilotへ返される
4. Copilotが結果を応答へ組み込む

Copilotはユーザーの質問とツールのdescriptionに基づいて、ツールを呼び出すタイミングを判断する。

## 対話型CLIアシスタント

完全な対話型アシスタントを構築する。

### TypeScript
```typescript
import { CopilotClient, approveAll, defineTool, SessionEvent } from "@github/copilot-sdk";
import * as readline from "readline";

const getWeather = defineTool("get_weather", {
    description: "Get the current weather for a city",
    parameters: {
        type: "object",
        properties: {
            city: { type: "string", description: "The city name" },
        },
        required: ["city"],
    },
    handler: async ({ city }) => {
        const conditions = ["sunny", "cloudy", "rainy", "partly cloudy"];
        const temp = Math.floor(Math.random() * 30) + 50;
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        return { city, temperature: `${temp}°F`, condition };
    },
});

const client = new CopilotClient();
const session = await client.createSession({
    onPermissionRequest: approveAll,
    model: "gpt-4.1",
    streaming: true,
    tools: [getWeather],
});

session.on((event: SessionEvent) => {
    if (event.type === "assistant.message_delta") {
        process.stdout.write(event.data.deltaContent);
    }
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

console.log("Weather Assistant (type 'exit' to quit)");
console.log("Try: 'What's the weather in Paris?'\n");

const prompt = () => {
    rl.question("You: ", async (input) => {
        if (input.toLowerCase() === "exit") {
            await client.stop();
            rl.close();
            return;
        }

        process.stdout.write("Assistant: ");
        await session.sendAndWait({ prompt: input });
        console.log("\n");
        prompt();
    });
};

prompt();
```

### Python
```python
import asyncio
import random
import sys
from copilot import CopilotClient, PermissionHandler
from copilot.tools import define_tool
from copilot.generated.session_events import SessionEventType
from pydantic import BaseModel, Field

class GetWeatherParams(BaseModel):
    city: str = Field(description="The name of the city to get weather for")

@define_tool(description="Get the current weather for a city")
async def get_weather(params: GetWeatherParams) -> dict:
    conditions = ["sunny", "cloudy", "rainy", "partly cloudy"]
    temp = random.randint(50, 80)
    condition = random.choice(conditions)
    return {"city": params.city, "temperature": f"{temp}°F", "condition": condition}

async def main():
    async with CopilotClient() as client:
        async with await client.create_session(
            on_permission_request=PermissionHandler.approve_all,
            model="gpt-4.1",
            streaming=True,
            tools=[get_weather],
        ) as session:
            def handle_event(event):
                if event.type == SessionEventType.ASSISTANT_MESSAGE_DELTA:
                    sys.stdout.write(event.data.delta_content)
                    sys.stdout.flush()

            session.on(handle_event)

            print("Weather Assistant (type 'exit' to quit)")
            print("Try: 'What's the weather in Paris?'\n")

            while True:
                try:
                    user_input = input("You: ")
                except EOFError:
                    break

                if user_input.lower() == "exit":
                    break

                sys.stdout.write("Assistant: ")
                await session.send_and_wait(user_input)
                print("\n")

asyncio.run(main())
```

## MCP serverとの統合

構築済みツールを利用するため、MCP（Model Context Protocol）serverへ接続する。リポジトリ、Issue、PRへアクセスするにはGitHubのMCP serverへ接続する。

### TypeScript
```typescript
const session = await client.createSession({
    onPermissionRequest: approveAll,
    model: "gpt-4.1",
    mcpServers: {
        github: {
            type: "http",
            url: "https://api.githubcopilot.com/mcp/",
        },
    },
});
```

### Python
```python
async with await client.create_session(
    on_permission_request=PermissionHandler.approve_all,
    model="gpt-4.1",
    mcp_servers={
        "github": {
            "type": "http",
            "url": "https://api.githubcopilot.com/mcp/",
        },
    },
) as session:
    ...
```

### Go
```go
session, _ := client.CreateSession(&copilot.SessionConfig{
	OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
    Model: "gpt-4.1",
    MCPServers: map[string]copilot.MCPServerConfig{
        "github": {
            "type": "http",
            "url": "https://api.githubcopilot.com/mcp/",
        },
    },
})
```

### .NET
```csharp
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    OnPermissionRequest = PermissionHandler.ApproveAll,
    Model = "gpt-4.1",
    McpServers = new Dictionary<string, McpServerConfig>
    {
        ["github"] = new McpServerConfig
        {
            Type = "http",
            Url = "https://api.githubcopilot.com/mcp/",
        },
    },
});
```

## カスタムエージェント

特定タスク向けに専門化したAIペルソナを定義する。

### TypeScript
```typescript
const session = await client.createSession({
    onPermissionRequest: approveAll,
    model: "gpt-4.1",
    customAgents: [{
        name: "pr-reviewer",
        displayName: "PR Reviewer",
        description: "Reviews pull requests for best practices",
        prompt: "You are an expert code reviewer. Focus on security, performance, and maintainability.",
    }],
});
```

### Python
```python
async with await client.create_session(
    on_permission_request=PermissionHandler.approve_all,
    model="gpt-4.1",
    custom_agents=[{
        "name": "pr-reviewer",
        "display_name": "PR Reviewer",
        "description": "Reviews pull requests for best practices",
        "prompt": "You are an expert code reviewer. Focus on security, performance, and maintainability.",
    }],
) as session:
    ...
```

## システムメッセージ

AIの動作と個性をカスタマイズする。

### TypeScript
```typescript
const session = await client.createSession({
    onPermissionRequest: approveAll,
    model: "gpt-4.1",
    systemMessage: {
        content: "You are a helpful assistant for our engineering team. Always be concise.",
    },
});
```

### Python
```python
async with await client.create_session(
    on_permission_request=PermissionHandler.approve_all,
    model="gpt-4.1",
    system_message={
        "content": "You are a helpful assistant for our engineering team. Always be concise.",
    },
) as session:
    ...
```

## 外部CLI server

CLIをserver modeで別途実行し、SDKから接続する。デバッグ、リソース共有、カスタム環境で役立つ。

### CLIをserver modeで起動
```bash
copilot --server --port 4321
```

### SDKを外部serverへ接続

#### TypeScript
```typescript
const client = new CopilotClient({
    cliUrl: "localhost:4321"
});

const session = await client.createSession({
    onPermissionRequest: approveAll,
    model: "gpt-4.1",
});
```

#### Python
```python
from copilot import CopilotClient, PermissionHandler, RuntimeConnection

async with CopilotClient(
    connection=RuntimeConnection.for_uri("localhost:4321")
) as client:
    async with await client.create_session(
        on_permission_request=PermissionHandler.approve_all,
        model="gpt-4.1",
    ) as session:
        ...
```

#### Go
```go
client := copilot.NewClient(&copilot.ClientOptions{
    CLIUrl: "localhost:4321",
})

if err := client.Start(); err != nil {
    log.Fatal(err)
}

session, _ := client.CreateSession(&copilot.SessionConfig{
	OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
	Model:               "gpt-4.1",
})
```

#### .NET
```csharp
using var client = new CopilotClient(new CopilotClientOptions
{
    CliUrl = "localhost:4321"
});

await using var session = await client.CreateSessionAsync(new SessionConfig
{
    OnPermissionRequest = PermissionHandler.ApproveAll,
    Model = "gpt-4.1",
});
```

**注:** 外部serverを使うよう構成した場合、SDKが管理するのは接続だけであり、外部プロセスは管理しない。

## eventの種類

| event | 説明 |
|-------|-------------|
| `user.message` | ユーザー入力が追加された |
| `assistant.message` | 完全なモデル応答 |
| `assistant.message_delta` | ストリーミング応答の断片 |
| `assistant.reasoning` | モデルの推論（モデル依存） |
| `assistant.reasoning_delta` | ストリーミング推論の断片 |
| `tool.execution_start` | ツール呼び出しを開始した |
| `tool.execution_complete` | ツール実行が完了した |
| `session.idle` | 実行中の処理がない |
| `session.error` | エラーが発生した |

## clientの構成

| オプション | 説明 | 既定値 |
|--------|-------------|---------|
| `cliPath` | Copilot CLI実行可能ファイルのパス | システムのPATH |
| `cliUrl` | 既存serverへ接続（例: `"localhost:4321"`） | なし |
| `port` | server通信ポート | ランダム |
| `useStdio` | TCPではなくstdio transportを使う | true |
| `logLevel` | ログの詳細度 | `"info"` |
| `autoStart` | serverを自動起動する | true |
| `autoRestart` | クラッシュ時に再起動する | true |
| `cwd` | CLIプロセスの作業ディレクトリ | 継承 |

## sessionの構成

| オプション | 説明 |
|--------|-------------|
| `model` | 使用するLLM（`"gpt-4.1"`、`"claude-sonnet-4.5"` など） |
| `sessionId` | カスタムsession識別子 |
| `tools` | カスタムツール定義 |
| `mcpServers` | MCP server接続 |
| `customAgents` | カスタムエージェントのペルソナ |
| `systemMessage` | 既定のsystem promptを上書き |
| `streaming` | 応答の断片的な配信を有効化 |
| `availableTools` | 許可するツールのallowlist |
| `excludedTools` | 無効化するツールのdenylist |

## sessionの永続化

再起動をまたいで会話を保存し、再開する。

### カスタムIDで作成
```typescript
const session = await client.createSession({
    onPermissionRequest: approveAll,
    sessionId: "user-123-conversation",
    model: "gpt-4.1"
});
```

### sessionを再開
```typescript
const session = await client.resumeSession("user-123-conversation", { onPermissionRequest: approveAll });
await session.send({ prompt: "What did we discuss earlier?" });
```

### sessionの一覧表示と削除
```typescript
const sessions = await client.listSessions();
await client.deleteSession("old-session-id");
```

## エラー処理

```typescript
try {
    const client = new CopilotClient();
    const session = await client.createSession({
        onPermissionRequest: approveAll,
        model: "gpt-4.1",
    });
    const response = await session.sendAndWait(
        { prompt: "Hello!" },
        30000 // timeout in ms
    );
} catch (error) {
    if (error.code === "ENOENT") {
        console.error("Copilot CLI not installed");
    } else if (error.code === "ECONNREFUSED") {
        console.error("Cannot connect to Copilot server");
    } else {
        console.error("Error:", error.message);
    }
} finally {
    await client.stop();
}
```

## 正常な終了

```typescript
process.on("SIGINT", async () => {
    console.log("Shutting down...");
    await client.stop();
    process.exit(0);
});
```

## 一般的なパターン

### 複数ターンの会話
```typescript
const session = await client.createSession({
    onPermissionRequest: approveAll,
    model: "gpt-4.1",
});

await session.sendAndWait({ prompt: "My name is Alice" });
await session.sendAndWait({ prompt: "What's my name?" });
// Response: "Your name is Alice"
```

### ファイル添付
```typescript
await session.send({
    prompt: "Analyze this file",
    attachments: [{
        type: "file",
        path: "./data.csv",
        displayName: "Sales Data"
    }]
});
```

### 長時間処理の中止
```typescript
const timeoutId = setTimeout(() => {
    session.abort();
}, 60000);

session.on((event) => {
    if (event.type === "session.idle") {
        clearTimeout(timeoutId);
    }
});
```

## 利用可能なモデル

実行時に利用可能なモデルを照会する。

```typescript
const models = await client.getModels();
// Returns: ["gpt-4.1", "gpt-4o", "claude-sonnet-4.5", ...]
```

## ベストプラクティス

1. **必ずクリーンアップする**: 言語固有のcontext managerまたはdisposeを使うか、sessionを明示的に切断してclientを停止する
2. **タイムアウトを設定する**: 長時間処理ではタイムアウト付きの `sendAndWait` を使う
3. **Eventを処理する**: 堅牢なエラー処理のためerror eventを購読する
4. **ストリーミングを使う**: 長い応答のUXを改善するためstreamingを有効にする
5. **Sessionを永続化する**: 複数ターンの会話ではカスタムsession IDを使う
6. **明確なツールを定義する**: 説明的なツール名とdescriptionを書く

## アーキテクチャ

```
Your Application
       |
  SDK Client
       | JSON-RPC
  Copilot CLI (server mode)
       |
  GitHub (models, auth)
```

SDKはCLIプロセスのライフサイクルを自動管理する。すべての通信はstdioまたはTCP上のJSON-RPCで行われる。

## リソース

- **GitHubリポジトリ**: https://github.com/github/copilot-sdk
- **入門チュートリアル**: https://github.com/github/copilot-sdk/blob/main/docs/tutorials/first-app.md
- **GitHub MCP server**: https://github.com/github/github-mcp-server
- **MCP serverディレクトリ**: https://github.com/modelcontextprotocol/servers
- **Cookbook（レシピ集）**: https://github.com/github/copilot-sdk/tree/main/cookbook
- **サンプル**: https://github.com/github/copilot-sdk/tree/main/samples

## ステータス

このSDKは**Technical Preview**であり、破壊的変更が発生する可能性がある。現時点では本番利用を推奨しない。

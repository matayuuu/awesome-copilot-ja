---
name: go-mcp-server-generator
description: '公式の github.com/modelcontextprotocol/go-sdk を使い、適切な構成、依存関係、実装を備えた完全な Go MCP サーバープロジェクトを生成する。'
---

# Go MCP サーバープロジェクト生成

Go で完全な本番対応 Model Context Protocol (MCP) サーバープロジェクトを生成する。

## プロジェクト要件

次の要素を備えた Go MCP サーバーを作成する。

1. **プロジェクト構造**: 適切な Go モジュール構成
2. **依存関係**: 公式 MCP SDK と必要なパッケージ
3. **サーバー設定**: トランスポートを設定した MCP サーバー
4. **ツール**: 型付き入出力を持つ、少なくとも 2～3 個の有用なツール
5. **エラー処理**: 適切なエラー処理とコンテキスト利用
6. **ドキュメント**: セットアップと使用方法を含む README
7. **テスト**: 基本的なテスト構成

## テンプレート構造

```
myserver/
├── go.mod
├── go.sum
├── main.go
├── tools/
│   ├── tool1.go
│   └── tool2.go
├── resources/
│   └── resource1.go
├── config/
│   └── config.go
├── README.md
└── main_test.go
```

## go.mod テンプレート

```go
module github.com/yourusername/{{PROJECT_NAME}}

go 1.23

require (
    github.com/modelcontextprotocol/go-sdk v1.0.0
)
```

## main.go テンプレート

```go
package main

import (
    "context"
    "log"
    "os"
    "os/signal"
    "syscall"

    "github.com/modelcontextprotocol/go-sdk/mcp"
    "github.com/yourusername/{{PROJECT_NAME}}/config"
    "github.com/yourusername/{{PROJECT_NAME}}/tools"
)

func main() {
    cfg := config.Load()
    
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()

    // グレースフルシャットダウンを処理する
    sigCh := make(chan os.Signal, 1)
    signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)
    go func() {
        <-sigCh
        log.Println("Shutting down...")
        cancel()
    }()

    // サーバーを作成する
    server := mcp.NewServer(
        &mcp.Implementation{
            Name:    cfg.ServerName,
            Version: cfg.Version,
        },
        &mcp.Options{
            Capabilities: &mcp.ServerCapabilities{
                Tools:     &mcp.ToolsCapability{},
                Resources: &mcp.ResourcesCapability{},
                Prompts:   &mcp.PromptsCapability{},
            },
        },
    )

    // ツールを登録する
    tools.RegisterTools(server)

    // サーバーを実行する
    transport := &mcp.StdioTransport{}
    if err := server.Run(ctx, transport); err != nil {
        log.Fatalf("Server error: %v", err)
    }
}
```

## tools/tool1.go テンプレート

```go
package tools

import (
    "context"
    "fmt"

    "github.com/modelcontextprotocol/go-sdk/mcp"
)

type Tool1Input struct {
    Param1 string `json:"param1" jsonschema:"required,description=First parameter"`
    Param2 int    `json:"param2,omitempty" jsonschema:"description=Optional second parameter"`
}

type Tool1Output struct {
    Result string `json:"result" jsonschema:"description=The result of the operation"`
    Status string `json:"status" jsonschema:"description=Operation status"`
}

func Tool1Handler(ctx context.Context, req *mcp.CallToolRequest, input Tool1Input) (
    *mcp.CallToolResult,
    Tool1Output,
    error,
) {
    // 入力を検証する
    if input.Param1 == "" {
        return nil, Tool1Output{}, fmt.Errorf("param1 is required")
    }

    // コンテキストを確認する
    if ctx.Err() != nil {
        return nil, Tool1Output{}, ctx.Err()
    }

    // 処理を実行する
    result := fmt.Sprintf("Processed: %s", input.Param1)

    return nil, Tool1Output{
        Result: result,
        Status: "success",
    }, nil
}

func RegisterTool1(server *mcp.Server) {
    mcp.AddTool(server,
        &mcp.Tool{
            Name:        "tool1",
            Description: "tool1 の処理内容",
        },
        Tool1Handler,
    )
}
```

## tools/registry.go テンプレート

```go
package tools

import "github.com/modelcontextprotocol/go-sdk/mcp"

func RegisterTools(server *mcp.Server) {
    RegisterTool1(server)
    RegisterTool2(server)
    // 追加のツールはここに登録する
}
```

## config/config.go テンプレート

```go
package config

import "os"

type Config struct {
    ServerName string
    Version    string
    LogLevel   string
}

func Load() *Config {
    return &Config{
        ServerName: getEnv("SERVER_NAME", "{{PROJECT_NAME}}"),
        Version:    getEnv("VERSION", "v1.0.0"),
        LogLevel:   getEnv("LOG_LEVEL", "info"),
    }
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}
```

## main_test.go テンプレート

```go
package main

import (
    "context"
    "testing"

    "github.com/yourusername/{{PROJECT_NAME}}/tools"
)

func TestTool1Handler(t *testing.T) {
    ctx := context.Background()
    input := tools.Tool1Input{
        Param1: "test",
        Param2: 42,
    }

    result, output, err := tools.Tool1Handler(ctx, nil, input)
    if err != nil {
        t.Fatalf("Tool1Handler failed: %v", err)
    }

    if output.Status != "success" {
        t.Errorf("Expected status 'success', got '%s'", output.Status)
    }

    if result != nil {
        t.Error("Expected result to be nil")
    }
}
```

## README.md テンプレート

```markdown
# {{PROJECT_NAME}}

Go で構築した Model Context Protocol (MCP) サーバー。

## 説明

{{PROJECT_DESCRIPTION}}

## インストール

\`\`\`bash
go mod download
go build -o {{PROJECT_NAME}}
\`\`\`

## 使用方法

stdio トランスポートでサーバーを実行する。

\`\`\`bash
./{{PROJECT_NAME}}
\`\`\`

## 設定

環境変数で設定する。

- `SERVER_NAME`: サーバー名（既定値: "{{PROJECT_NAME}}"）
- `VERSION`: サーバーバージョン（既定値: "v1.0.0"）
- `LOG_LEVEL`: ログレベル（既定値: "info"）

## 利用可能なツール

### tool1
{{TOOL1_DESCRIPTION}}

**入力:**
- `param1` (string, required): 1 番目のパラメーター
- `param2` (int, optional): 2 番目のパラメーター

**出力:**
- `result` (string): 処理結果
- `status` (string): 処理の状態

## 開発

テストを実行する。

\`\`\`bash
go test ./...
\`\`\`

ビルドする。

\`\`\`bash
go build -o {{PROJECT_NAME}}
\`\`\`

## ライセンス

MIT
```

## 生成手順

Go MCP サーバーを生成するときは、次の手順に従う。

1. **モジュールを初期化する**: 適切なモジュールパスで `go.mod` を作成する
2. **構造**: テンプレートのディレクトリ構造に従う
3. **型安全性**: すべての入出力に JSON スキーマタグ付きの構造体を使う
4. **エラー処理**: 入力を検証し、コンテキストを確認し、エラーをラップする
5. **ドキュメント**: 明確な説明と例を追加する
6. **テスト**: 各ツールに少なくとも 1 つのテストを含める
7. **設定**: 設定には環境変数を使う
8. **ロギング**: 構造化ロギング（log/slog）を使う
9. **グレースフルシャットダウン**: シグナルを適切に処理する
10. **トランスポート**: 既定は stdio とし、代替手段を文書化する

## ベストプラクティス

- ツールの責務を絞り、単一目的に保つ
- 型と関数には説明的な名前を使う
- struct タグに JSON スキーマの説明を含める
- 常にコンテキストのキャンセルを尊重する
- 説明的なエラーを返す
- main.go は最小限にし、ロジックはパッケージへ分離する
- ツールハンドラーのテストを書く
- すべてのエクスポート関数を文書化する

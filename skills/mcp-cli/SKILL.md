---
name: mcp-cli
description: 'CLI を介して MCP（Model Context Protocol）サーバーを操作するためのインターフェース。MCP サーバーを通じて外部ツール、API、データソースを操作したり、利用可能な MCP サーバーやツールを一覧表示したり、コマンドラインから MCP ツールを呼び出したりする必要がある場合に使用します。'
---

# MCP-CLI

コマンドラインから MCP サーバーにアクセスします。MCP を使用すると、GitHub、ファイルシステム、データベース、API などの外部システムを操作できます。

## コマンド

| コマンド                           | 出力                             |
| ---------------------------------- | ------------------------------- |
| `mcp-cli`                          | すべてのサーバーとツール名を一覧表示 |
| `mcp-cli <server>`                 | パラメーター付きでツールを表示       |
| `mcp-cli <server>/<tool>`          | ツールの JSON スキーマを取得         |
| `mcp-cli <server>/<tool> '<json>'` | 引数を指定してツールを呼び出す       |
| `mcp-cli grep "<glob>"`            | 名前でツールを検索                   |

**説明を含めるには `-d` を追加します**（例: `mcp-cli filesystem -d`）

## ワークフロー

1. **検出**: `mcp-cli` → 利用可能なサーバーとツールを確認
2. **探索**: `mcp-cli <server>` → パラメーター付きのツールを確認
3. **検査**: `mcp-cli <server>/<tool>` → 完全な JSON 入力スキーマを取得
4. **実行**: `mcp-cli <server>/<tool> '<json>'` → 引数を指定して実行

## 例

```bash
# List all servers and tool names
mcp-cli

# See all tools with parameters
mcp-cli filesystem

# With descriptions (more verbose)
mcp-cli filesystem -d

# Get JSON schema for specific tool
mcp-cli filesystem/read_file

# Call the tool
mcp-cli filesystem/read_file '{"path": "./README.md"}'

# Search for tools
mcp-cli grep "*file*"

# JSON output for parsing
mcp-cli filesystem/read_file '{"path": "./README.md"}' --json

# Complex JSON with quotes (use heredoc or stdin)
mcp-cli server/tool <<EOF
{"content": "Text with 'quotes' inside"}
EOF

# Or pipe from a file/command
cat args.json | mcp-cli server/tool

# Find all TypeScript files and read the first one
mcp-cli filesystem/search_files '{"path": "src/", "pattern": "*.ts"}' --json | jq -r '.content[0].text' | head -1 | xargs -I {} sh -c 'mcp-cli filesystem/read_file "{\"path\": \"{}\"}"'
```

## オプション

| フラグ       | 目的                      |
| ------------ | ------------------------- |
| `-j, --json` | スクリプト用の JSON 出力  |
| `-r, --raw`  | 生のテキストコンテンツ    |
| `-d`         | 説明を含める              |

## 終了コード

- `0`: 成功
- `1`: クライアントエラー（引数が不正、設定が存在しない）
- `2`: サーバーエラー（ツールが失敗）
- `3`: ネットワークエラー

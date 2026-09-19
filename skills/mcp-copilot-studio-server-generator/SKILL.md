---
name: mcp-copilot-studio-server-generator
description: '適切なスキーマ制約とstreamable HTTP対応を備え、Copilot Studio統合に最適化した完全なMCPサーバー実装を生成する。'
---

# Power Platform MCPコネクター生成器

Microsoft Copilot Studio向けに、Model Context Protocol（MCP）統合を備えたPower Platformカスタムコネクターを生成する。Power Platformコネクター標準に従い、MCP streamable HTTP対応に必要なファイルをすべて作成する。

## 手順

次の要件を満たす完全なMCPサーバー実装を作成する。

1. **Uses Copilot Studio MCP Pattern:**
   - `x-ms-agentic-protocol: mcp-streamable-1.0`を実装する
   - JSON-RPC 2.0通信プロトコルをサポートする
   - `/mcp`にstreamable HTTPエンドポイントを提供する
   - Power Platformコネクターの構造に従う

2. **Schema Compliance Requirements:**
   - ツールの入力／出力に**reference typeを使わない**（Copilot Studioで除外される）
   - **単一の型値だけ**を使う（複数型の配列にしない）
   - **enum入力を避ける**（enumではなく文字列として解釈される）
   - string、number、integer、boolean、array、objectのプリミティブ型を使う
   - すべてのエンドポイントが完全なURIを返すようにする

3. **MCP Components to Include:**
   - **Tools**: 言語モデルが呼び出す関数（✅ Copilot Studioでサポート）
   - **Resources**: ツールからのファイル形式のデータ出力（✅ Copilot Studioでサポート。アクセス可能にするにはツール出力である必要がある）
   - **Prompts**: 特定タスク向けの定義済みテンプレート（❌ Copilot Studioでは未サポート）

4. **Implementation Structure:**
   ```
   /apiDefinition.swagger.json  (Power Platform connector schema)
   /apiProperties.json         (Connector metadata and configuration)
   /script.csx                 (Custom code transformations and logic)
   /server/                    (MCP server implementation)
   /tools/                     (Individual MCP tools)
   /resources/                 (MCP resource handlers)
   ```

## コンテキスト変数

- **Server Purpose**: [MCPサーバーが実現する内容を記述]
- **Tools Needed**: [実装する具体的なツールを一覧表示]
- **Resources**: [提供するリソースの種類]
- **Authentication**: [認証方式: none、api-key、oauth2]
- **Host Environment**: [Azure Function、Express.js、FastAPIなど]
- **Target APIs**: [統合する外部API]

## 期待する出力

Generate:

1. **apiDefinition.swagger.json** with:
   - Proper `x-ms-agentic-protocol: mcp-streamable-1.0`
   - MCP endpoint at POST `/mcp`
   - Compliant schema definitions (no reference types)
   - McpResponse and McpErrorResponse definitions

2. **apiProperties.json** with:
   - Connector metadata and branding
   - Authentication configuration
   - Policy templates if needed

3. **script.csx** with:
   - Custom C# code for request/response transformations
   - MCP JSON-RPC message handling logic
   - Data validation and processing functions
   - Error handling and logging capabilities

4. **MCP Server Code** with:
   - JSON-RPC 2.0 request handler
   - Tool registration and execution
   - Resource management (as tool outputs)
   - Proper error handling
   - Copilot Studio compatibility checks

5. **Individual Tools** that:
   - Accept only primitive type inputs
   - Return structured outputs
   - Include resources as outputs when needed
   - Provide clear descriptions for Copilot Studio

6. **Deployment Configuration** for:
   - Power Platform environment
   - Copilot Studio agent integration
   - Testing and validation

## 検証チェックリスト

Ensure generated code:
- [ ] No reference types in schemas
- [ ] All type fields are single types
- [ ] Enum handling via string with validation
- [ ] Resources available through tool outputs
- [ ] Full URI endpoints
- [ ] JSON-RPC 2.0 compliance
- [ ] Proper x-ms-agentic-protocol header
- [ ] McpResponse/McpErrorResponse schemas
- [ ] Clear tool descriptions for Copilot Studio
- [ ] Generative Orchestration compatible

## 使用例

```yaml
Server Purpose: Customer data management and analysis
Tools Needed: 
  - searchCustomers
  - getCustomerDetails
  - analyzeCustomerTrends
Resources:
  - Customer profiles
  - Analysis reports
Authentication: oauth2
Host Environment: Azure Function
Target APIs: CRM System REST API
```

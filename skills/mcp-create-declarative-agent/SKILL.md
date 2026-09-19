---
name: mcp-create-declarative-agent
description: 'MCPサーバー、認証、ツール選択、構成を統合し、Microsoft 365 Copilot向けの宣言型エージェントを作成する。'
---

````prompt
---
mode: 'agent'
tools: ['changes', 'search/codebase', 'edit/editFiles', 'problems']
description: 'MCPサーバーを認証、ツール選択、構成と統合し、Microsoft 365 Copilot向けの宣言型エージェントを作成する'
model: 'gpt-4.1'
tags: [mcp, m365-copilot, declarative-agent, model-context-protocol, api-plugin]
---

# Microsoft 365 Copilot向けMCPベース宣言型エージェントの作成

外部システムとデータへアクセスするため、Model Context Protocol（MCP）サーバーと統合した完全なMicrosoft 365 Copilot宣言型エージェントを作成する。

## 要件

Microsoft 365 Agents Toolkitを使って、次のプロジェクト構造を生成する:

### プロジェクトのセットアップ
1. Agents Toolkitで**宣言型エージェントをスキャフォールディング**する
2. MCPサーバーを指す**MCPアクションを追加**する
3. MCPサーバーからインポートする**ツールを選択**する
4. **認証を構成**する（OAuth 2.0またはSSO）
5. **生成されたファイルを確認**する（manifest.json、ai-plugin.json、declarativeAgent.json）

### 生成される主なファイル

**appPackage/manifest.json** - Teams app manifest with plugin reference:
```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/teams/vDevPreview/MicrosoftTeams.schema.json",
  "manifestVersion": "devPreview",
  "version": "1.0.0",
  "id": "...",
  "developer": {
    "name": "...",
    "websiteUrl": "...",
    "privacyUrl": "...",
    "termsOfUseUrl": "..."
  },
  "name": {
    "short": "Agent Name",
    "full": "Full Agent Name"
  },
  "description": {
    "short": "Short description",
    "full": "Full description"
  },
  "copilotAgents": {
    "declarativeAgents": [
      {
        "id": "declarativeAgent",
        "file": "declarativeAgent.json"
      }
    ]
  }
}
```

**appPackage/declarativeAgent.json** - Agent definition:
```json
{
  "$schema": "https://aka.ms/json-schemas/copilot/declarative-agent/v1.0/schema.json",
  "version": "v1.0",
  "name": "Agent Name",
  "description": "Agent description",
  "instructions": "You are an assistant that helps with [specific domain]. Use the available tools to [capabilities].",
  "capabilities": [
    {
      "name": "WebSearch",
      "websites": [
        {
          "url": "https://learn.microsoft.com"
        }
      ]
    },
    {
      "name": "MCP",
      "file": "ai-plugin.json"
    }
  ]
}
```

**appPackage/ai-plugin.json** - MCP plugin manifest:
```json
{
  "schema_version": "v2.1",
  "name_for_human": "Service Name",
  "description_for_human": "Description for users",
  "description_for_model": "Description for AI model",
  "contact_email": "support@company.com",
  "namespace": "serviceName",
  "capabilities": {
    "conversation_starters": [
      {
        "text": "Example query 1"
      }
    ]
  },
  "functions": [
    {
      "name": "functionName",
      "description": "Function description",
      "capabilities": {
        "response_semantics": {
          "data_path": "$",
          "properties": {
            "title": "$.title",
            "subtitle": "$.description"
          }
        }
      }
    }
  ],
  "runtimes": [
    {
      "type": "MCP",
      "spec": {
        "url": "https://api.service.com/mcp/"
      },
      "run_for_functions": ["functionName"],
      "auth": {
        "type": "OAuthPluginVault",
        "reference_id": "${{OAUTH_REFERENCE_ID}}"
      }
    }
  ]
}
```

**/.vscode/mcp.json** - MCP server configuration:
```json
{
  "serverUrl": "https://api.service.com/mcp/",
  "pluginFilePath": "appPackage/ai-plugin.json"
}
```

## MCPサーバー統合

### 対応するMCPエンドポイント
MCPサーバーは次を提供する必要がある:
- **サーバーメタデータ**エンドポイント
- **ツール一覧**エンドポイント（利用可能な関数を公開）
- **ツール実行**エンドポイント（関数呼び出しを処理）

### ツール選択
MCPからインポートするとき:
1. サーバーから利用可能なツールを取得する
2. 含める特定のツールを選択する（セキュリティと簡潔さのため）
3. ツール定義をai-plugin.jsonへ自動生成する

### 認証の種類

**OAuth 2.0 (Static Registration)**
```json
"auth": {
  "type": "OAuthPluginVault",
  "reference_id": "${{OAUTH_REFERENCE_ID}}",
  "authorization_url": "https://auth.service.com/authorize",
  "client_id": "${{CLIENT_ID}}",
  "client_secret": "${{CLIENT_SECRET}}",
  "scope": "read write"
}
```

**Single Sign-On (SSO)**
```json
"auth": {
  "type": "SSO"
}
```

## 応答セマンティクス

### データマッピングを定義する
`response_semantics`を使ってAPI応答から関連フィールドを抽出する:

```json
"capabilities": {
  "response_semantics": {
    "data_path": "$.results",
    "properties": {
      "title": "$.name",
      "subtitle": "$.description",
      "url": "$.link"
    }
  }
}
```

### Adaptive Cardsを追加する（任意）
視覚的なカードテンプレートの追加方法は `mcp-create-adaptive-cards` promptを参照する。

## 環境構成

資格情報用に`.env.local`または`.env.dev`を作成する:

```env
OAUTH_REFERENCE_ID=your-oauth-reference-id
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
```

## テストとデプロイ

### ローカルテスト
1. Agents Toolkitでエージェントを**プロビジョニング**する
2. **デバッグを開始**してTeamsへサイドロードする
3. https://m365.cloud.microsoft/chat のMicrosoft 365 Copilotでテストする
4. 求められたら認証する
5. 自然言語でエージェントに問い合わせる

### 検証
- ai-plugin.jsonのツールインポートを確認する
- 認証構成を確認する
- 公開した各関数をテストする
- 応答データのマッピングを検証する

## ベストプラクティス

### ツール設計
- **焦点を絞った関数**: 各ツールは1つのことを適切に行う
- **明確な説明**: モデルが各ツールを使う場面を理解できるようにする
- **最小限のスコープ**: エージェントに必要なツールだけをインポートする
- **説明的な名前**: アクション指向の関数名を使う

### セキュリティ
- 本番シナリオでは**OAuth 2.0を使う**
- **シークレットを環境変数に保存**する
- **MCPサーバー側で入力を検証**する
- **スコープを必要最小限の権限に制限**する
- OAuth登録には**reference IDを使う**

### 指示
- エージェントの目的と機能を**具体的に記述**する
- 成功時とエラー時の両方の動作を**定義**する
- 必要に応じて指示内でツールを**明示的に参照**する
- エージェントができること／できないことをユーザーに**明確に伝える**

### パフォーマンス
- MCPサーバーで適切な場合は**応答をキャッシュ**する
- 可能な場合は**操作をバッチ化**する
- 長時間処理には**タイムアウトを設定**する
- 大規模データセットでは**結果をページ分割**する

## MCPサーバーの一般的な例

### GitHub MCP Server
```
URL: https://api.githubcopilot.com/mcp/
Tools: search_repositories, search_users, get_repository
Auth: OAuth 2.0
```

### Jira MCP Server
```
URL: https://your-domain.atlassian.net/mcp/
Tools: search_issues, create_issue, update_issue
Auth: OAuth 2.0
```

### Custom Service
```
URL: https://api.your-service.com/mcp/
Tools: Custom tools exposed by your service
Auth: OAuth 2.0 or SSO
```

## ワークフロー

ユーザーに確認する:
1. どのMCPサーバー（URL）と統合するか
2. Copilotにどのツールを公開するか
3. サーバーがサポートする認証方式は何か
4. エージェントの主目的は何か
5. 応答セマンティクスまたはAdaptive Cardsが必要か

その後、以下を生成する:
- 完全なappPackage/構造（manifest.json、declarativeAgent.json、ai-plugin.json）
- mcp.json構成
- .env.localテンプレート
- プロビジョニングとテストの手順

## トラブルシューティング

### MCPサーバーが応答しない
- サーバーURLが正しいことを確認する
- ネットワーク接続を確認する
- MCPサーバーが必要なエンドポイントを実装していることを検証する

### 認証に失敗する
- OAuth資格情報が正しいことを確認する
- reference IDが登録内容と一致することを確認する
- スコープが適切に要求されていることを確認する
- OAuthフローを個別にテストする

### ツールが表示されない
- mcp.jsonが正しいサーバーを指していることを確認する
- インポート時にツールを選択したことを確認する
- ai-plugin.jsonに正しい関数定義があることを確認する
- サーバー変更後はMCPからアクションを再取得する

### エージェントがクエリを理解しない
- declarativeAgent.jsonの指示を確認する
- 関数の説明が明確か確認する
- response_semanticsが正しいデータを抽出することを検証する
- より具体的なクエリでテストする

````

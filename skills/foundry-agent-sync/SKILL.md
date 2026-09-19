---
name: foundry-agent-sync
description: 'ローカル JSON マニフェストから REST API を介して Azure AI Foundry 内にプロンプトベースの AI エージェントを直接作成・同期します。ローカルコードだけを生成するスキャフォールディングスキルとは異なり、Foundry サービス自体にエージェントを登録し、すぐに呼び出せるようにします。Foundry でのエージェント作成、同期、デプロイ、登録、プッシュ、エージェント指示の更新、新しいリポジトリ用のマニフェストと同期スクリプトのスキャフォールディングを求められた場合に使用します。トリガー: エージェントを Foundry で作成、Foundry エージェントを同期、エージェントを Foundry にデプロイ、エージェントを登録、エージェントをプッシュ、Foundry エージェントマニフェストを作成、エージェント同期をスキャフォールディング。'
---

# Foundry Agent 同期

## 概要

Agent Service REST API を介して、プロンプトベースの AI エージェントを Azure AI Foundry 内に直接作成・同期します。このスキルは Foundry サービス自体にエージェントを登録するため、Foundry ポータルまたは API を通じて、即座に呼び出し、評価、管理できるようになります。各エージェントは、ローカル JSON マニフェスト ファイルの定義を使用し、名前付き POST 呼び出しによって冪等に作成または更新されます。

> **重要な違い:** このスキルは AI Foundry 内部（サーバー側）にエージェントを作成します。ローカルのエージェント コードやコンテナー イメージをスキャフォールディングするものではありません。その場合は、`microsoft-foundry` スキルの `create` サブスキルを使用してください。

## 前提条件

ユーザーには次のものが必要です。

1. デプロイ済みモデルを含む Azure AI Foundry プロジェクト（例: `gpt-5-4`）
2. Foundry プロジェクトへのアクセス権で認証済みの Azure CLI（`az`）
3. Foundry プロジェクト リソースに対する **Azure AI User** ロール（またはそれ以上）

開始前に次の値を収集してください。

| 値 | 取得方法 |
|---|---|
| **Foundry プロジェクト エンドポイント** | Azure Portal → AI Foundry プロジェクト → Overview → Endpoint、または `az resource show` |
| **サブスクリプション ID** | `az account show --query id -o tsv` |
| **モデル デプロイ名** | Foundry プロジェクトにデプロイされたモデル名（例: `gpt-5-4`） |

## マニフェスト形式

マニフェストは JSON 配列であり、各エントリが 1 つのエージェントを定義します。一般的なパスで探してください: `infra/foundry-agents.json`、`foundry-agents.json`、または `.foundry/agents.json`。存在しない場合は、作成してください。

```json
[
  {
    "useCaseId": "alert-triage",
    "description": "Short description of what this agent does.",
    "baseInstruction": "You are an assistant that... <system prompt for the agent>"
  }
]
```

### フィールド リファレンス

| フィールド | 必須 | 説明 |
|---|---|---|
| `useCaseId` | はい | ケバブケースの識別子。エージェント名の構築に使用します（`{prefix}-{useCaseId}`） |
| `description` | はい | エージェント メタデータとして保存される、人が読める説明 |
| `baseInstruction` | はい | エージェントのシステム プロンプト / 基本指示 |

## 同期スクリプト

### PowerShell（対話形式 / CI）

同期スクリプトを作成または見つけます。標準パスは `infra/scripts/sync-foundry-agents.ps1` ですが、リポジトリのレイアウトに合わせて調整してください。

```powershell
param(
  [Parameter(Mandatory)]
  [string]$SubscriptionId,

  [Parameter(Mandatory)]
  [string]$ProjectEndpoint,

  [string]$ManifestPath = (Join-Path $PSScriptRoot '..\foundry-agents.json'),
  [string]$ModelName = 'gpt-5-4',
  [string]$AgentNamePrefix = 'myproject',
  [string]$ApiVersion = '2025-11-15-preview'
)

$ErrorActionPreference = 'Stop'

# Optional: append a common instruction suffix to every agent
$commonSuffix = ''

az account set --subscription $SubscriptionId | Out-Null
$accessToken = az account get-access-token --resource https://ai.azure.com/ --query accessToken -o tsv
if (-not $accessToken) { throw 'Failed to acquire Foundry access token.' }

$definitions = Get-Content -Raw -Path $ManifestPath | ConvertFrom-Json
$headers = @{ Authorization = "Bearer $accessToken" }
$results = @()

foreach ($def in $definitions) {
  $agentName = "$AgentNamePrefix-$($def.useCaseId)"
  $instructions = if ($commonSuffix) { "$($def.baseInstruction)`n`n$commonSuffix" } else { $def.baseInstruction }
  $body = @{
    definition  = @{ kind = 'prompt'; model = $ModelName; instructions = $instructions }
    description = $def.description
    metadata    = @{ useCaseId = $def.useCaseId; managedBy = 'foundry-agent-sync' }
  } | ConvertTo-Json -Depth 8

  $uri = "$($ProjectEndpoint.TrimEnd('/'))/agents/$agentName`?api-version=$ApiVersion"
  $resp = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -ContentType 'application/json' -Body $body
  $version = $resp.version ?? $resp.latest_version ?? $resp.id ?? 'unknown'
  Write-Host "Synced $agentName ($version)"
  $results += [pscustomobject]@{ name = $agentName; version = $version }
}

$results | Format-Table -AutoSize
```

### Bash（Bicep デプロイ スクリプト / CI）

`Microsoft.Resources/deploymentScripts` を介した自動デプロイには、次の処理を行う bash スクリプトを使用します。

1. マネージド ID で認証します: `az login --identity --username "$CLIENT_ID"`
2. Foundry トークンを取得します: `az account get-access-token --resource https://ai.azure.com/`
3. `FOUNDRY_AGENT_DEFINITIONS` 環境変数（JSON 文字列）から定義を反復処理します
4. 各エージェントを `{endpoint}/agents/{name}?api-version=2025-11-15-preview` に POST します

## Bicep 統合（任意）

インフラストラクチャのデプロイ時に同期を自動実行するには、次の手順に従います。

1. コンパイル時に**マニフェストを読み込みます**。
   ```bicep
   var agentDefinitions = loadJsonContent('foundry-agents.json')
   ```

2. Foundry プロジェクトに対する **Azure AI User** ロールを持つ**ユーザー割り当てマネージド ID**を作成します。

3. 次の条件を満たす `Microsoft.Resources/deploymentScripts` リソース（kind: `AzureCLI`）を作成します。
   - マネージド ID を使用する
   - `loadTextContent` を介して bash 同期スクリプトを読み込む
   - プロジェクト エンドポイント、定義、モデルを環境変数として渡す

チームがオプトインまたはオプトアウトできるよう、`deployFoundryAgents` パラメーターの背後に配置してください。

## ワークフロー

### 手順 1 — マニフェストを検索または作成する

リポジトリ内で `foundry-agents.json` を検索します。存在しない場合は、必要なエージェントをユーザーに確認し、マニフェストを作成します。

### 手順 2 — 同期スクリプトを検索または作成する

`sync-foundry-agents.ps1` または `foundry-agent-sync.sh` を検索します。見つからない場合は、上記のテンプレートを使用して PowerShell スクリプトを作成し、次の項目を調整します。
- `$AgentNamePrefix` をプロジェクト名に合わせる
- `$ModelName` をユーザーがデプロイしたモデルに合わせる
- `$ManifestPath` を実際のマニフェストの場所に合わせる

### 手順 3 — パラメーターを収集する

ユーザーに次の項目を確認します。
- Foundry プロジェクト エンドポイント
- サブスクリプション ID
- モデル デプロイ名（既定値: `gpt-5-4`）
- エージェント名のプレフィックス（既定値: ケバブケースのリポジトリ名）

### 手順 4 — 同期を実行する

収集したパラメーターを使用して PowerShell スクリプトを実行します。

```powershell
.\infra\scripts\sync-foundry-agents.ps1 `
  -SubscriptionId '<sub-id>' `
  -ProjectEndpoint '<endpoint>' `
  -ModelName '<model>' `
  -AgentNamePrefix '<prefix>'
```

### 手順 5 — 検証する

一覧表示して、同期されたエージェントを確認します。

```powershell
$token = az account get-access-token --resource https://ai.azure.com/ --query accessToken -o tsv
$endpoint = '<project-endpoint>'
Invoke-RestMethod -Uri "$endpoint/agents?api-version=2025-11-15-preview" `
  -Headers @{ Authorization = "Bearer $token" }
```

## REST API リファレンス

| 操作 | メソッド | URL |
|---|---|---|
| エージェントの作成/更新 | POST | `{projectEndpoint}/agents/{agentName}?api-version=2025-11-15-preview` |
| エージェントの一覧表示 | GET | `{projectEndpoint}/agents?api-version=2025-11-15-preview` |
| エージェントの取得 | GET | `{projectEndpoint}/agents/{agentName}?api-version=2025-11-15-preview` |
| エージェントの削除 | DELETE | `{projectEndpoint}/agents/{agentName}?api-version=2025-11-15-preview` |

### 作成/更新ペイロード

```json
{
  "definition": {
    "kind": "prompt",
    "model": "<deployed-model-name>",
    "instructions": "<system prompt>"
  },
  "description": "<agent description>",
  "metadata": {
    "useCaseId": "<use-case-id>",
    "managedBy": "foundry-agent-sync"
  }
}
```

## トラブルシューティング

| 症状 | 原因 | 修正方法 |
|---|---|---|
| `401 Unauthorized` | トークンの期限切れ、または対象者が誤っている | `az account get-access-token --resource https://ai.azure.com/` を再実行する |
| `403 Forbidden` | Azure AI User ロールがない | Foundry プロジェクトのスコープでロールを割り当てる |
| `404 Not Found` | プロジェクト エンドポイントが誤っている | エンドポイントに `/api/projects/{projectName}` が含まれていることを確認する |
| モデルが見つからない | モデルがプロジェクトにデプロイされていない | 最初に AI Foundry ポータルでモデルをデプロイする |
| 定義が空 | マニフェスト パスが誤っている | `-ManifestPath` が JSON ファイルを指していることを確認する |

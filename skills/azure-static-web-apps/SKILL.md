---
name: azure-static-web-apps
description: 'SWA CLI を使って Azure Static Web Apps の作成、構成、デプロイを支援します。静的サイトの Azure へのデプロイ、SWA のローカル開発、staticwebapp.config.json の構成、SWA への Azure Functions API の追加、Static Web Apps 用 GitHub Actions CI/CD の設定に使用します。'
---

## 概要

Azure Static Web Apps (SWA) は、オプションのサーバーレス API バックエンドを備えた静的フロントエンドをホストします。SWA CLI (`swa`) はローカル開発のエミュレーションとデプロイ機能を提供します。

**主な機能:**
- API プロキシと認証シミュレーションを備えたローカル エミュレーター
- フレームワークの自動検出と構成
- Azure への直接デプロイ
- データベース接続のサポート

**構成ファイル:**
- `swa-cli.config.json` - CLI 設定、**`swa init` によって作成**（手動で作成しない）
- `staticwebapp.config.json` - ランタイム構成（ルート、認証、ヘッダー、API ランタイム）- 手動で作成可能

## 一般的な手順

### インストール

```bash
npm install -D @azure/static-web-apps-cli
```

確認: `npx swa --version`

### クイック スタート ワークフロー

**重要: 構成ファイルの作成には常に `swa init` を使用します。`swa-cli.config.json` を手動で作成しないでください。**

1. `swa init` - **最初に必ず行う手順** - フレームワークを自動検出し、`swa-cli.config.json` を作成する
2. `swa start` - `http://localhost:4280` でローカル エミュレーターを実行する
3. `swa login` - Azure で認証する
4. `swa deploy` - Azure にデプロイする

### 構成ファイル

**swa-cli.config.json** - `swa init` によって作成される。手動で作成しない:
- フレームワーク検出を含む対話型セットアップには `swa init` を実行する
- 自動検出された既定値を受け入れるには `swa init --yes` を実行する
- 初期化後の設定をカスタマイズする場合のみ、生成されたファイルを編集する

生成される構成の例（参照用のみ）:
```json
{
  "$schema": "https://aka.ms/azure/static-web-apps-cli/schema",
  "configurations": {
    "app": {
      "appLocation": ".",
      "apiLocation": "api",
      "outputLocation": "dist",
      "appBuildCommand": "npm run build",
      "run": "npm run dev",
      "appDevserverUrl": "http://localhost:3000"
    }
  }
}
```

**staticwebapp.config.json**（アプリのソースまたは出力フォルダー内）- このファイルはランタイム構成用に手動で作成できます:
```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*", "/css/*"]
  },
  "routes": [
    { "route": "/api/*", "allowedRoles": ["authenticated"] }
  ],
  "platform": {
    "apiRuntime": "node:20"
  }
}
```

## コマンドライン リファレンス

### swa login

デプロイのために Azure で認証します。

```bash
swa login                              # Interactive login
swa login --subscription-id <id>       # Specific subscription
swa login --clear-credentials          # Clear cached credentials
```

**フラグ:** `--subscription-id, -S` | `--resource-group, -R` | `--tenant-id, -T` | `--client-id, -C` | `--client-secret, -CS` | `--app-name, -n`

### swa init

既存のフロントエンドと（任意の）API に基づいて新しい SWA プロジェクトを構成します。フレームワークを自動的に検出します。

```bash
swa init                    # Interactive setup
swa init --yes              # Accept defaults
```

### swa build

フロントエンドや API をビルドします。

```bash
swa build                   # Build using config
swa build --auto            # Auto-detect and build
swa build myApp             # Build specific configuration
```

**フラグ:** `--app-location, -a` | `--api-location, -i` | `--output-location, -O` | `--app-build-command, -A` | `--api-build-command, -I`

### swa start

ローカル開発エミュレーターを起動します。

```bash
swa start                                    # Serve from outputLocation
swa start ./dist                             # Serve specific folder
swa start http://localhost:3000              # Proxy to dev server
swa start ./dist --api-location ./api        # With API folder
swa start http://localhost:3000 --run "npm start"  # Auto-start dev server
```

**一般的なフレームワークのポート:**
| フレームワーク | ポート |
|-----------|------|
| React/Vue/Next.js | 3000 |
| Angular | 4200 |
| Vite | 5173 |

**主なフラグ:**
- `--port, -p` - エミュレーターのポート（既定値: 4280）
- `--api-location, -i` - API フォルダーのパス
- `--api-port, -j` - API のポート（既定値: 7071）
- `--run, -r` - 開発サーバーを起動するコマンド
- `--open, -o` - ブラウザーを自動的に開く
- `--ssl, -s` - HTTPS を有効にする

### swa deploy

Azure Static Web Apps にデプロイします。

```bash
swa deploy                              # Deploy using config
swa deploy ./dist                       # Deploy specific folder
swa deploy --env production             # Deploy to production
swa deploy --deployment-token <TOKEN>   # Use deployment token
swa deploy --dry-run                    # Preview without deploying
```

**デプロイ トークンを取得する:**
- Azure Portal: Static Web App → Overview → Manage deployment token
- CLI: `swa deploy --print-token`
- 環境変数: `SWA_CLI_DEPLOYMENT_TOKEN`

**主なフラグ:**
- `--env` - 対象環境（`preview` または `production`）
- `--deployment-token, -d` - デプロイ トークン
- `--app-name, -n` - Azure SWA リソース名

### swa db

データベース接続を初期化します。

```bash
swa db init --database-type mssql
swa db init --database-type postgresql
swa db init --database-type cosmosdb_nosql
```

## シナリオ

### 既存のフロントエンドとバックエンドから SWA を作成する

**`swa start` または `swa deploy` の前に必ず `swa init` を実行します。`swa-cli.config.json` を手動で作成しないでください。**

```bash
# 1. Install CLI
npm install -D @azure/static-web-apps-cli

# 2. Initialize - REQUIRED: creates swa-cli.config.json with auto-detected settings
npx swa init              # Interactive mode
# OR
npx swa init --yes        # Accept auto-detected defaults

# 3. Build application (if needed)
npm run build

# 4. Test locally (uses settings from swa-cli.config.json)
npx swa start

# 5. Deploy
npx swa login
npx swa deploy --env production
```

### Azure Functions バックエンドを追加する

1. **API フォルダーを作成する:**
```bash
mkdir api && cd api
func init --worker-runtime node --model V4
func new --name message --template "HTTP trigger"
```

2. **関数の例** (`api/src/functions/message.js`):
```javascript
const { app } = require('@azure/functions');

app.http('message', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request) => {
        const name = request.query.get('name') || 'World';
        return { jsonBody: { message: `Hello, ${name}!` } };
    }
});
```

3. `staticwebapp.config.json` に **API ランタイムを設定する**:
```json
{
  "platform": { "apiRuntime": "node:20" }
}
```

4. `swa-cli.config.json` の **CLI 構成を更新する**:
```json
{
  "configurations": {
    "app": { "apiLocation": "api" }
  }
}
```

5. **ローカルでテストする:**
```bash
npx swa start ./dist --api-location ./api
# Access API at http://localhost:4280/api/message
```

**対応する API ランタイム:** `node:18`, `node:20`, `node:22`, `dotnet:8.0`, `dotnet-isolated:8.0`, `python:3.10`, `python:3.11`

### GitHub Actions デプロイを設定する

1. Azure Portal または Azure CLI で **SWA リソースを作成する**
2. **GitHub リポジトリをリンクする** - ワークフローは自動生成するか、手動で作成します:

`.github/workflows/azure-static-web-apps.yml`:
```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches: [main]

jobs:
  build_and_deploy:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: upload
          app_location: /
          api_location: api
          output_location: dist

  close_pr:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    steps:
      - uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: close
```

3. **シークレットを追加する:** デプロイ トークンをリポジトリ シークレット `AZURE_STATIC_WEB_APPS_API_TOKEN` にコピーします

**ワークフロー設定:**
- `app_location` - フロントエンドのソース パス
- `api_location` - API のソース パス
- `output_location` - ビルド済み出力フォルダー
- `skip_app_build: true` - 事前にビルド済みの場合はスキップ
- `app_build_command` - カスタム ビルド コマンド

## トラブルシューティング

| 問題 | 解決策 |
|-------|----------|
| クライアント ルートで 404 | `staticwebapp.config.json` に `rewrite: "/index.html"` を含む `navigationFallback` を追加する |
| API が 404 を返す | `api` フォルダーの構成を確認し、`platform.apiRuntime` が設定されていることを確認して、関数のエクスポートを確認する |
| ビルド出力が見つからない | `output_location` が実際のビルド出力ディレクトリと一致することを確認する |
| ローカルで認証が動作しない | `/.auth/login/<provider>` を使って認証エミュレーター UI にアクセスする |
| CORS エラー | `/api/*` 配下の API は同一オリジンである。外部 API には CORS ヘッダーが必要 |
| デプロイ トークンの期限切れ | Azure Portal → Static Web App → Manage deployment token で再生成する |
| 構成が適用されない | `staticwebapp.config.json` が `app_location` または `output_location` にあることを確認する |
| ローカル API のタイムアウト | 既定値は 45 秒。関数を最適化するか、ブロッキング呼び出しを確認する |

**デバッグ コマンド:**
```bash
swa start --verbose log        # Verbose output
swa deploy --dry-run           # Preview deployment
swa --print-config             # Show resolved configuration
```

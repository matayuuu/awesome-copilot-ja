---
name: msstore-cli
description: 'WindowsアプリをMicrosoft Storeへ公開・管理するMicrosoft Store Developer CLI（msstore）。Store認証、アプリ一覧、提出状態、公開、package flight、CI/CD、Partner Center統合に使う。Windows App SDK/WinUI、UWP、.NET MAUI、Flutter、Electron、React Native、PWAに対応する。'
license: MIT
---

# Microsoft Store Developer CLI（msstore）

Microsoft Store Developer CLI（`msstore`）は、Microsoft Storeでアプリを公開・管理するクロスプラットフォームのコマンドラインインターフェイスである。Partner Center APIと統合し、さまざまなアプリ種別の自動公開ワークフローをサポートする。

## このSkillを使う場合

次の作業が必要な場合にこのSkillを使う:

- APIアクセス用のStore資格情報を構成する
- Storeアカウントのアプリを一覧表示する
- 提出の状態を確認する
- 提出をStoreへ公開する
- Store提出用にアプリをパッケージ化する
- Store公開用にプロジェクトを初期化する
- package flight（ベータテスト）を管理する
- Store自動公開用のCI/CDパイプラインを構成する
- 提出の段階的ロールアウトを管理する
- 提出メタデータをプログラムから更新する

## 前提条件

- Windows 10以降、macOS、またはLinux
- .NET 9 Desktop Runtime（Windows）または.NET 9 Runtime（macOS/Linux）
- 適切な権限を持つPartner Centerアカウント
- Partner Center APIにアクセスできるAzure ADアプリ登録
- 次のいずれかの方法でmsstore CLIをインストール済み:
  - **Microsoft Store**: [Download](https://www.microsoft.com/store/apps/9P53PC5S0PHJ)
  - **WinGet**: `winget install "Microsoft Store Developer CLI"`
  - **Manual**: Download from [GitHub Releases](https://aka.ms/msstoredevcli/releases)

### Partner Centerのセットアップ

msstoreを使う前に、Partner CenterへアクセスできるAzure ADアプリケーションを作成する:

1. [Partner Center](https://partner.microsoft.com/dashboard)を開く
2. **Account settings** > **User management** > **Azure AD applications**へ移動する
3. 新しいアプリケーションを作成し、**Tenant ID**、**Client ID**、**Client Secret**を控える
4. アプリケーションに適切な権限（ManagerまたはDeveloperロール）を付与する

## 基本コマンドリファレンス

### info — 構成を表示

現在の資格情報構成を表示する。

```bash
msstore info
```

**Options:**

| オプション | 説明 |
| ------ | ----------- |
| `-v, --verbose` | 詳細な出力を表示 |

### reconfigure — 認証情報を構成

Microsoft Store API資格情報を構成または更新する。

```bash
msstore reconfigure [options]
```

**Options:**

| Option | Description |
| ------ | ----------- |
| `-t, --tenantId` | Azure AD Tenant ID |
| `-s, --sellerId` | Partner Center Seller ID |
| `-c, --clientId` | Azure AD Application Client ID |
| `-cs, --clientSecret` | Client Secret for authentication |
| `-ct, --certificateThumbprint` | Certificate thumbprint (alternative to client secret) |
| `-cfp, --certificateFilePath` | Certificate file path (alternative to client secret) |
| `-cp, --certificatePassword` | Certificate password |
| `--reset` | Reset credentials without full reconfiguration |

**Examples:**

```bash
# Configure with client secret
msstore reconfigure --tenantId $TENANT_ID --sellerId $SELLER_ID --clientId $CLIENT_ID --clientSecret $CLIENT_SECRET

# Configure with certificate
msstore reconfigure --tenantId $TENANT_ID --sellerId $SELLER_ID --clientId $CLIENT_ID --certificateFilePath ./cert.pfx --certificatePassword MyPassword
```

### settings — CLI設定

Microsoft Store Developer CLIの設定を変更する。

```bash
msstore settings [options]
```

**Options:**

| Option | Description |
| ------ | ----------- |
| `-t, --enableTelemetry` | Enable (true) or disable (false) telemetry |

#### Set Publisher Display Name

```bash
msstore settings setpdn <publisherDisplayName>
```

`init`コマンドの既定のPublisher Display Nameを設定する。

### apps — アプリケーション管理

アプリケーション情報を一覧表示し、取得する。

#### List Applications

```bash
msstore apps list
```

Partner Centerアカウント内のすべてのアプリケーションを一覧表示する。

#### Get Application Details

```bash
msstore apps get <productId>
```

**Arguments:**

| Argument | Description |
| -------- | ----------- |
| `productId` | The Store product ID (e.g., 9NBLGGH4R315) |

**Example:**

```bash
# Get details of a specific app
msstore apps get 9NBLGGH4R315
```

### submission — 提出管理

Store提出を管理する。

| Sub-Command | Description |
| ----------- | ----------- |
| `status` | Get submission status |
| `get` | Get submission metadata and package info |
| `getListingAssets` | Get listing assets of a submission |
| `updateMetadata` | Update submission metadata |
| `poll` | Poll submission status until complete |
| `publish` | Publish a submission |
| `delete` | Delete a submission |

#### Get Submission Status

```bash
msstore submission status <productId>
```

#### Get Submission Details

```bash
msstore submission get <productId>
```

#### Update Metadata

```bash
msstore submission updateMetadata <productId> <metadata>
```

`<metadata>`は更新後のメタデータを含むJSON文字列である。JSONにはシェルが解釈する文字（引用符、波括弧など）が含まれるため、値を適切に引用またはエスケープする必要がある:

- **Bash/Zsh**: Wrap the JSON in single quotes so the shell passes it through literally.
  ```bash
  msstore submission updateMetadata 9NBLGGH4R315 '{"description":"My updated app"}'
  ```
- **PowerShell**: Use single quotes (or escape double quotes inside a double-quoted string).
  ```powershell
  msstore submission updateMetadata 9NBLGGH4R315 '{"description":"My updated app"}'
  ```
- **cmd.exe**: Escape each inner double quote with a backslash.
  ```cmd
  msstore submission updateMetadata 9NBLGGH4R315 "{\"description\":\"My updated app\"}"
  ```

> **ヒント:** 複雑なメタデータや複数行のメタデータでは、引用の問題を避けるためJSONをファイルに保存し、その内容を渡す:
> ```bash
> msstore submission updateMetadata 9NBLGGH4R315 "$(cat metadata.json)"
> ```

**Options:**

| Option | Description |
| ------ | ----------- |
| `-s, --skipInitialPolling` | Skip initial status polling |

#### Publish Submission

```bash
msstore submission publish <productId>
```

#### Poll Submission

```bash
msstore submission poll <productId>
```

提出状態がPUBLISHEDまたはFAILEDになるまでポーリングする。

#### Delete Submission

```bash
msstore submission delete <productId>
```

**Options:**

| Option | Description |
| ------ | ----------- |
| `--no-confirm` | Skip confirmation prompt |

### init — Store向けにプロジェクトを初期化

Microsoft Store公開用にプロジェクトを初期化する。プロジェクト種別を自動検出し、Store IDを構成する。

```bash
msstore init <pathOrUrl> [options]
```

**Arguments:**

| Argument | Description |
| -------- | ----------- |
| `pathOrUrl` | Project directory path or PWA URL |

**Options:**

| Option | Description |
| ------ | ----------- |
| `-n, --publisherDisplayName` | Publisher Display Name |
| `--package` | Also package the project |
| `--publish` | Package and publish (implies --package) |
| `-f, --flightId` | Publish to a specific flight |
| `-prp, --packageRolloutPercentage` | Gradual rollout percentage (0-100) |
| `-a, --arch` | Architecture(s): x86, x64, arm64 |
| `-o, --output` | Output directory for packages |
| `-ver, --version` | Version to use when building |

**Supported Project Types:**

- Windows App SDK / WinUI 3
- UWP
- .NET MAUI
- Flutter
- Electron
- React Native for Desktop
- PWA (Progressive Web Apps)

**Examples:**

```bash
# Initialize WinUI project
msstore init ./my-winui-app

# Initialize PWA
msstore init https://contoso.com --output ./pwa-package

# Initialize and publish
msstore init ./my-app --publish
```

### package — Store向けにパッケージ化

Microsoft Store提出用にアプリケーションをパッケージ化する。

```bash
msstore package <pathOrUrl> [options]
```

**Arguments:**

| Argument | Description |
| -------- | ----------- |
| `pathOrUrl` | Project directory path or PWA URL |

**Options:**

| Option | Description |
| ------ | ----------- |
| `-o, --output` | Output directory for the package |
| `-a, --arch` | Architecture(s): x86, x64, arm64 |
| `-ver, --version` | Version for the package |

**Examples:**

```bash
# Package for default architecture
msstore package ./my-app

# Package for multiple architectures
msstore package ./my-app --arch x64,arm64 --output ./packages

# Package with specific version
msstore package ./my-app --version 1.2.3.0
```

### publish — Storeへ公開

アプリケーションをMicrosoft Storeへ公開する。

```bash
msstore publish <pathOrUrl> [options]
```

**Arguments:**

| Argument | Description |
| -------- | ----------- |
| `pathOrUrl` | Project directory path or PWA URL |

**Options:**

| Option | Description |
| ------ | ----------- |
| `-i, --inputFile` | Path to existing .msix or .msixupload file |
| `-id, --appId` | Application ID (if not initialized) |
| `-nc, --noCommit` | Keep submission in draft state |
| `-f, --flightId` | Publish to a specific flight |
| `-prp, --packageRolloutPercentage` | Gradual rollout percentage (0-100) |

**Examples:**

```bash
# Publish project
msstore publish ./my-app

# Publish existing package
msstore publish ./my-app --inputFile ./packages/MyApp.msixupload

# Publish as draft
msstore publish ./my-app --noCommit

# Publish with gradual rollout
msstore publish ./my-app --packageRolloutPercentage 10
```

### flights — package flight管理

package flight（ベータテストグループ）を管理する。

| Sub-Command | Description |
| ----------- | ----------- |
| `list` | List all flights for an app |
| `get` | Get flight details |
| `delete` | Delete a flight |
| `create` | Create a new flight |
| `submission` | Manage flight submissions |

#### List Flights

```bash
msstore flights list <productId>
```

#### Get Flight Details

```bash
msstore flights get <productId> <flightId>
```

#### Create Flight

```bash
msstore flights create <productId> <friendlyName> --group-ids <group-ids>
```

**Options:**

| Option | Description |
| ------ | ----------- |
| `-g, --group-ids` | Flight group IDs (comma-separated) |
| `-r, --rank-higher-than` | Flight ID to rank higher than |

#### Delete Flight

```bash
msstore flights delete <productId> <flightId>
```

#### Flight Submissions

```bash
# Get flight submission
msstore flights submission get <productId> <flightId>

# Publish flight submission
msstore flights submission publish <productId> <flightId>

# Check flight submission status
msstore flights submission status <productId> <flightId>

# Poll flight submission
msstore flights submission poll <productId> <flightId>

# Delete flight submission
msstore flights submission delete <productId> <flightId>
```

#### Flight Rollout Management

```bash
# Get rollout status
msstore flights submission rollout get <productId> <flightId>

# Update rollout percentage
msstore flights submission rollout update <productId> <flightId> <percentage>

# Halt rollout
msstore flights submission rollout halt <productId> <flightId>

# Finalize rollout (100%)
msstore flights submission rollout finalize <productId> <flightId>
```

## 一般的なワークフロー

### Workflow 1: First-Time Store Setup

```bash
# 1. Install the CLI
winget install "Microsoft Store Developer CLI"

# 2. Configure credentials (get these from Partner Center)
msstore reconfigure --tenantId $TENANT_ID --sellerId $SELLER_ID --clientId $CLIENT_ID --clientSecret $CLIENT_SECRET

# 3. Verify configuration
msstore info

# 4. List your apps to confirm access
msstore apps list
```

### Workflow 2: Initialize and Publish New App

```bash
# 1. Navigate to project
cd my-winui-app

# 2. Initialize for Store (creates/updates app identity)
msstore init .

# 3. Package the application
msstore package . --arch x64,arm64

# 4. Publish to Store
msstore publish .

# 5. Check submission status
msstore submission status <productId>
```

### Workflow 3: Update Existing App

```bash
# 1. Build your updated application
dotnet publish -c Release

# 2. Package and publish
msstore publish ./my-app

# Or publish from existing package
msstore publish ./my-app --inputFile ./artifacts/MyApp.msixupload
```

### Workflow 4: Gradual Rollout

```bash
# 1. Publish with initial rollout percentage
msstore publish ./my-app --packageRolloutPercentage 10

# 2. Monitor and increase rollout
msstore submission poll <productId>

# 3. (After validation) Finalize to 100%
# This completes via Partner Center or submission update
```

### Workflow 5: Beta Testing with Flights

```bash
# 1. Create a flight group in Partner Center first
# Then create a flight
msstore flights create <productId> "Beta Testers" --group-ids "group-id-1,group-id-2"

# 2. Publish to the flight
msstore publish ./my-app --flightId <flightId>

# 3. Check flight submission status
msstore flights submission status <productId> <flightId>

# 4. After testing, publish to production
msstore publish ./my-app
```

### Workflow 6: CI/CD Pipeline Integration

```yaml
# GitHub Actions example
name: Publish to Store

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '9.0.x'
      
      - name: Install msstore CLI
        run: winget install "Microsoft Store Developer CLI" --accept-package-agreements --accept-source-agreements
      
      - name: Configure Store credentials
        run: |
          msstore reconfigure --tenantId ${{ secrets.TENANT_ID }} --sellerId ${{ secrets.SELLER_ID }} --clientId ${{ secrets.CLIENT_ID }} --clientSecret ${{ secrets.CLIENT_SECRET }}
      
      - name: Build application
        run: dotnet publish -c Release
      
      - name: Publish to Store
        run: msstore publish ./src/MyApp
```

## winapp CLIとの統合

winapp CLI（v0.2.0以降）は、`winapp store`サブコマンドでmsstoreと統合される:

```bash
# これらのコマンドは同等:
msstore reconfigure --tenantId xxx --clientId xxx --clientSecret xxx
winapp store reconfigure --tenantId xxx --clientId xxx --clientSecret xxx

# アプリを一覧表示
msstore apps list
winapp store apps list

# 公開
msstore publish ./my-app
winapp store publish ./my-app
```

パッケージ化と公開を統合したCLI操作を行いたい場合は`winapp store`を使う。

## トラブルシューティング

| 問題 | 解決策 |
| ----- | -------- |
| 認証に失敗する | `msstore info`で資格情報を確認し、`msstore reconfigure`を再実行する |
| アプリが見つからない | product IDが正しいことを確認し、`msstore apps list`で検証する |
| 権限が不足している | Partner CenterのAzure ADアプリロールを確認する（ManagerまたはDeveloperが必要） |
| パッケージ検証に失敗する | パッケージがStore要件を満たすことを確認し、Partner Centerで詳細を確認する |
| 提出が停止している | `msstore submission poll <productId>`で状態を確認する |
| Flightが見つからない | `msstore flights list <productId>`でflight IDを確認する |
| ロールアウト率が無効 | 値は0～100の範囲で指定する |
| PWAの初期化に失敗する | URLが公開アクセス可能で、有効なWebアプリマニフェストを持つことを確認する |

## 環境変数

CLIは資格情報用の環境変数をサポートする:

| 変数 | 説明 |
| -------- | ----------- |
| `MSSTORE_TENANT_ID` | Azure AD Tenant ID |
| `MSSTORE_SELLER_ID` | Partner Center Seller ID |
| `MSSTORE_CLIENT_ID` | Azure AD Application Client ID |
| `MSSTORE_CLIENT_SECRET` | Client Secret |

## 参照

- [Microsoft Store Developer CLI Documentation](https://learn.microsoft.com/windows/apps/publish/msstore-dev-cli/overview)
- [CLI Commands Reference](https://learn.microsoft.com/windows/apps/publish/msstore-dev-cli/commands)
- [GitHub Repository](https://github.com/microsoft/msstore-cli)
- [Partner Center API](https://learn.microsoft.com/windows/uwp/monetize/using-windows-store-services)
- [App Submission API](https://learn.microsoft.com/windows/uwp/monetize/create-and-manage-submissions-using-windows-store-services)
- [Package Flights Overview](https://learn.microsoft.com/windows/uwp/publish/package-flights)
- [Gradual Package Rollout](https://learn.microsoft.com/windows/uwp/publish/gradual-package-rollout)

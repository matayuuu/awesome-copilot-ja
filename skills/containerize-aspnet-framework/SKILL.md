---
name: containerize-aspnet-framework
description: 'プロジェクトに合わせたDockerfileと.dockerfileファイルを作成し、ASP.NET .NET Frameworkプロジェクトをコンテナー化する。'
---

# ASP.NET .NET Frameworkコンテナー化プロンプト

以下のコンテナー化設定で指定されたASP.NET（.NET Framework）プロジェクトを、アプリケーションがWindows Dockerコンテナーで実行するために必要な変更**だけ**に集中してコンテナー化してください。ここで指定されたすべての設定を考慮します。

**注意:** これは.NET Coreではなく.NET Frameworkアプリケーションです。コンテナー化プロセスは.NET Coreアプリケーションとは異なります。

## コンテナー化設定

このセクションには、ASP.NET（.NET Framework）アプリケーションのコンテナー化に必要な具体的な設定と構成が含まれます。このプロンプトを実行する前に、必要な情報を設定へ入力してください。多くの場合、必要なのは最初の数項目だけです。後半の設定が対象プロジェクトに該当しない場合は、既定値のままにできます。

指定されていない設定には既定値が適用されます。既定値は`[角括弧]`内に示されています。

### 基本プロジェクト情報
1. コンテナー化するプロジェクト:
   - `[ProjectName（.csprojファイルへのパスを指定）]`

2. 使用するWindows Server SKU:
   - `[Windows Server Core（既定）またはWindows Server Full]`

3. 使用するWindows Serverバージョン:
   - `[2022、2019、2016（既定は2022）]`

4. Dockerイメージのビルドステージで使用するカスタムベースイメージ（標準のMicrosoftベースイメージを使用する場合は"None"）:
   - `[ビルドステージで使用するベースイメージを指定（既定はNone）]`

5. Dockerイメージの実行ステージで使用するカスタムベースイメージ（標準のMicrosoftベースイメージを使用する場合は"None"）:
   - `[実行ステージで使用するベースイメージを指定（既定はNone）]`

### コンテナー構成
1. コンテナーイメージで公開する必要があるポート:
   - プライマリHTTPポート: `[例: 80]`
   - 追加ポート: `[追加ポートを列挙、または"None"]`

2. コンテナーを実行するユーザーアカウント:
   - `[ユーザーアカウント、または既定の"ContainerUser"]`

3. コンテナーイメージで構成する必要があるIIS設定:
   - `[具体的なIIS設定を列挙、または"None"]`

### ビルド構成
1. コンテナーイメージのビルド前に実行する必要があるカスタムビルド手順:
   - `[具体的なビルド手順を列挙、または"None"]`

2. コンテナーイメージのビルド後に実行する必要があるカスタムビルド手順:
   - `[具体的なビルド手順を列挙、または"None"]`

### 依存関係
1. コンテナーイメージ内のGACへ登録する.NETアセンブリ:
   - `[アセンブリ名とバージョン、または"None"]`

2. コンテナーイメージへコピーしてインストールする必要があるMSI:
   - `[MSI名とバージョン、または"None"]`

3. コンテナーイメージ内で登録する必要があるCOMコンポーネント:
   - `[COMコンポーネント名、または"None"]`

### システム構成
1. コンテナーイメージへ追加する必要があるレジストリキーと値:
   - `[レジストリパスと値、または"None"]`

2. コンテナーイメージで設定する必要がある環境変数:
   - `[変数名と値、または"Use defaults"]`

3. コンテナーイメージへインストールする必要があるWindows Serverの役割と機能:
   - `[役割／機能名、または"None"]`

### ファイルシステム
1. コンテナーイメージへコピーする必要があるファイル／ディレクトリ:
   - `[プロジェクトルートからの相対パス、または"None"]`
   - コンテナー内のコピー先: `[コンテナーパス、または"Not applicable"]`

2. コンテナー化から除外するファイル／ディレクトリ:
   - `[除外するパス、または"None"]`

### .dockerignoreの構成
1. `.dockerignore`ファイルへ含めるパターン（.dockerignoreには一般的な既定値がすでに含まれ、ここでは追加パターンを指定）:
   - 追加パターン: `[追加パターンを列挙、または"None"]`

### ヘルスチェック構成
1. ヘルスチェックエンドポイント:
   - `[ヘルスチェックURLパス、または"None"]`

2. ヘルスチェックの間隔とタイムアウト:
   - `[間隔とタイムアウトの値、または"Use defaults"]`

### 追加指示
1. プロジェクトのコンテナー化で従う必要があるその他の指示:
   - `[具体的な要件、または"None"]`

2. 対処する既知の問題:
   - `[既知の問題を説明、または"None"]`

## スコープ

- ✅ 構成builderを使用して環境変数からアプリ設定と接続文字列を読み取るためのアプリ構成変更
- ✅ ASP.NETアプリケーション用Dockerfileの作成と構成
- ✅ アプリケーションをビルド／公開し、出力を最終イメージへコピーするDockerfileのマルチステージ指定
- ✅ Windowsコンテナープラットフォーム互換性（Windows Server CoreまたはFull）の構成
- ✅ 依存関係（GACアセンブリ、MSI、COMコンポーネント）の適切な処理
- ❌ インフラストラクチャのセットアップは行わない（別途処理される前提）
- ❌ コンテナー化に必要な範囲を超えるコード変更は行わない

## 実行プロセス

1. 上記のコンテナー化設定を確認し、コンテナー化の要件を理解する
2. チェックマークで変更を追跡する`progress.md`ファイルを作成する
3. プロジェクトの.csprojファイルにある`TargetFrameworkVersion`要素を確認し、.NET Frameworkバージョンを特定する
4. 次に基づいて適切なWindows Serverコンテナーイメージを選択する:
   - プロジェクトから検出した.NET Frameworkバージョン
   - コンテナー化設定で指定されたWindows Server SKU（CoreまたはFull）
   - コンテナー化設定で指定されたWindows Serverバージョン（2016、2019、2022）
   - Windows Server Coreタグは次で確認できる: https://github.com/microsoft/dotnet-framework-docker/blob/main/README.aspnet.md#full-tag-listing
5. 必要なNuGetパッケージがインストールされていることを確認する。不足していても、これらをインストールしては**ならない**。インストールされていない場合は、ユーザーが手動でインストールする必要がある。プロンプトの実行を一時停止し、Visual Studio NuGet Package ManagerまたはVisual Studio package manager consoleを使用してインストールするようユーザーへ依頼する。必要なパッケージ:
   - `Microsoft.Configuration.ConfigurationBuilders.Environment`
6. `web.config`ファイルを変更し、環境変数からアプリ設定と接続文字列を読み取るためのconfiguration builderセクションと設定を追加する:
   - configSectionsにConfigBuildersセクションを追加する
   - ルートにconfigBuildersセクションを追加する
   - appSettingsとconnectionStringsの両方へEnvironmentConfigBuilderを構成する
   - パターン例:
     ```xml
     <configSections>
       <section name="configBuilders" type="System.Configuration.ConfigurationBuildersSection, System.Configuration, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a" restartOnExternalChanges="false" requirePermission="false" />
     </configSections>
     <configBuilders>
       <builders>
         <add name="Environment" type="Microsoft.Configuration.ConfigurationBuilders.EnvironmentConfigBuilder, Microsoft.Configuration.ConfigurationBuilders.Environment" />
       </builders>
     </configBuilders>
     <appSettings configBuilders="Environment">
       <!-- existing app settings -->
     </appSettings>
     <connectionStrings configBuilders="Environment">
       <!-- existing connection strings -->
     </connectionStrings>
     ```
7. このプロンプト末尾の参考`LogMonitorConfig.json`ファイルをコピーし、Dockerfileを作成するフォルダーへ`LogMonitorConfig.json`ファイルを作成する。コンテナー化設定に別の指示がない限り、ファイル内容は変更しては**ならず**、参考内容と完全に一致させる。
   - 特に、EventLogソースで`Information`レベルを使用すると不要なノイズが発生するため、記録する問題のレベルを変更しない。
8. アプリケーションをコンテナー化するDockerfileをプロジェクトディレクトリのルートに作成する
   - Dockerfileではマルチステージを使用する:
     - ビルドステージ: Windows Server Coreイメージを使用してアプリケーションをビルドする
       - 設定ファイルでカスタムベースイメージが指定されていない限り、ビルドステージでは`mcr.microsoft.com/dotnet/framework/sdk`ベースイメージを**必ず**使用する
       - 最初にsln、csproj、packages.configファイルをコピーする
       - NuGet.configが存在する場合はコピーし、private feedを構成する
       - NuGetパッケージを復元する
       - 次に残りのソースコードをコピーし、MSBuildを使用してアプリケーションをビルドし、C:\publishへ公開する
     - 最終ステージ: 選択したWindows Serverイメージを使用してアプリケーションを実行する
       - 設定ファイルでカスタムベースイメージが指定されていない限り、最終ステージでは`mcr.microsoft.com/dotnet/framework/aspnet`ベースイメージを**必ず**使用する
       - `LogMonitorConfig.json`ファイルをコンテナー内のディレクトリ（例: C:\LogMonitor）へコピーする
       - Microsoft Repositoryから同じディレクトリへLogMonitor.exeをダウンロードする
           - 正しいLogMonitor.exeのURL: https://github.com/microsoft/windows-container-tools/releases/download/v2.1.1/LogMonitor.exe
       - 作業ディレクトリをC:\inetpub\wwwrootに設定する
       - ビルドステージの公開済み出力（C:\publish内）を最終イメージへコピーする
       - IISサービスを監視するため、LogMonitor.exeとServiceMonitor.exeを実行するようコンテナーのエントリポイントを設定する
           - `ENTRYPOINT [ "C:\\LogMonitor\\LogMonitor.exe", "C:\\ServiceMonitor.exe", "w3svc" ]`
   - コンテナー化設定のすべての要件を必ず考慮する:
     - Windows ServerのSKUとバージョン
     - 公開ポート
     - コンテナーのユーザーアカウント
     - IIS設定
     - GACアセンブリの登録
     - MSIのインストール
     - COMコンポーネントの登録
     - レジストリキー
     - 環境変数
     - Windowsの役割と機能
     - ファイル／ディレクトリのコピー
   - このプロンプト末尾の例を基にDockerfileを作成するが、具体的なプロジェクト要件と設定に合わせてカスタマイズする。
   - **重要:** ユーザーが設定ファイルでWindows Server Fullイメージを**明示的に要求**していない限り、Windows Server Coreベースイメージを使用する
9. Dockerイメージから不要なファイルを除外する`.dockerignore`ファイルをプロジェクトディレクトリのルートに作成する。`.dockerignore`ファイルには、次の要素とコンテナー化設定で指定された追加パターンを少なくとも**必ず**含める:
   - packages/
   - bin/
   - obj/
   - .dockerignore
   - Dockerfile
   - .git/
   - .github/
   - .vs/
   - .vscode/
   - **/node_modules/
   - *.user
   - *.suo
   - **/.DS_Store
   - **/Thumbs.db
   - コンテナー化設定で指定された追加パターン
10. 設定で指定されている場合はヘルスチェックを構成する:
   - ヘルスチェックエンドポイントが指定されている場合は、DockerfileへHEALTHCHECK命令を追加する
11. プロジェクトファイルへ`<None Include="Dockerfile" />`を追加し、Dockerfileをプロジェクトへ追加する
12. タスクを完了としてマークする: [ ] → [✓]
13. すべてのタスクが完了し、Dockerビルドが成功するまで続行する

## ビルドとランタイムの検証

Dockerfileの完成後にDockerビルドが成功することを確認します。次のコマンドを使用してDockerイメージをビルドします:

```bash
docker build -t aspnet-app:latest .
```

ビルドが失敗した場合は、エラーメッセージを確認し、Dockerfileまたはプロジェクト構成へ必要な調整を行います。成功／失敗を報告します。

## 進捗追跡

次の構造で`progress.md`ファイルを維持します:
```markdown
# Containerization Progress

## Environment Detection
- [ ] .NET Framework version detection (version: ___)
- [ ] Windows Server SKU selection (SKU: ___)
- [ ] Windows Server version selection (Version: ___)

## Configuration Changes
- [ ] Web.config modifications for configuration builders
- [ ] NuGet package source configuration (if applicable)
- [ ] Copy LogMonitorConfig.json and adjust if required by settings

## Containerization
- [ ] Dockerfile creation
- [ ] .dockerignore file creation
- [ ] Build stage created with SDK image
- [ ] sln, csproj, packages.config, and (if applicable) NuGet.config copied for package restore
- [ ] Runtime stage created with runtime image
- [ ] Non-root user configuration
- [ ] Dependency handling (GAC, MSI, COM, registry, additional files, etc.)
- [ ] Health check configuration (if applicable)
- [ ] Special requirements implementation

## Verification
- [ ] Review containerization settings and make sure that all requirements are met
- [ ] Docker build success
```

手順の途中で確認のために停止しないでください。アプリケーションのコンテナー化とDockerビルドが成功するまで、順序立てて続行してください。

**すべてのチェックボックスを完了するまで作業は終了ではありません。** これには、Dockerイメージのビルド成功と、ビルドプロセス中に発生した問題への対処が含まれます。

## 参考資料

### Dockerfileの例

Windows Server Coreベースイメージを使用するASP.NET（.NET Framework）アプリケーションのDockerfile例です。

```dockerfile
# escape=`
# The escape directive changes the escape character from \ to `
# This is especially useful in Windows Dockerfiles where \ is the path separator

# ============================================================
# Stage 1: Build and publish the application
# ============================================================

# Base Image - Select the appropriate .NET Framework version and Windows Server Core version
# Possible tags include:
# - 4.8.1-windowsservercore-ltsc2025 (Windows Server 2025)
# - 4.8-windowsservercore-ltsc2022 (Windows Server 2022)
# - 4.8-windowsservercore-ltsc2019 (Windows Server 2019)
# - 4.8-windowsservercore-ltsc2016 (Windows Server 2016)
# - 4.7.2-windowsservercore-ltsc2019 (Windows Server 2019)
# - 4.7.2-windowsservercore-ltsc2016 (Windows Server 2016)
# - 4.7.1-windowsservercore-ltsc2016 (Windows Server 2016)
# - 4.7-windowsservercore-ltsc2016 (Windows Server 2016)
# - 4.6.2-windowsservercore-ltsc2016 (Windows Server 2016)
# - 3.5-windowsservercore-ltsc2025 (Windows Server 2025)
# - 3.5-windowsservercore-ltsc2022 (Windows Server 2022)
# - 3.5-windowsservercore-ltsc2019 (Windows Server 2019)
# - 3.5-windowsservercore-ltsc2019 (Windows Server 2016)
# Uses the .NET Framework SDK image for building the application
FROM mcr.microsoft.com/dotnet/framework/sdk:4.8-windowsservercore-ltsc2022 AS build
ARG BUILD_CONFIGURATION=Release

# Set the default shell to PowerShell
SHELL ["powershell", "-command"]

WORKDIR /app

# Copy the solution and project files
COPY YourSolution.sln .
COPY YourProject/*.csproj ./YourProject/
COPY YourOtherProject/*.csproj ./YourOtherProject/

# Copy packages.config files
COPY YourProject/packages.config ./YourProject/
COPY YourOtherProject/packages.config ./YourOtherProject/

# Restore NuGet packages
RUN nuget restore YourSolution.sln

# Copy source code
COPY . .

# Perform custom pre-build steps here, if needed

# Build and publish the application to C:\publish
RUN msbuild /p:Configuration=$BUILD_CONFIGURATION `
            /p:WebPublishMethod=FileSystem `
            /p:PublishUrl=C:\publish `
            /p:DeployDefaultTarget=WebPublish

# Perform custom post-build steps here, if needed

# ============================================================
# Stage 2: Final runtime image
# ============================================================

# Base Image - Select the appropriate .NET Framework version and Windows Server Core version
# Possible tags include:
# - 4.8.1-windowsservercore-ltsc2025 (Windows Server 2025)
# - 4.8-windowsservercore-ltsc2022 (Windows Server 2022)
# - 4.8-windowsservercore-ltsc2019 (Windows Server 2019)
# - 4.8-windowsservercore-ltsc2016 (Windows Server 2016)
# - 4.7.2-windowsservercore-ltsc2019 (Windows Server 2019)
# - 4.7.2-windowsservercore-ltsc2016 (Windows Server 2016)
# - 4.7.1-windowsservercore-ltsc2016 (Windows Server 2016)
# - 4.7-windowsservercore-ltsc2016 (Windows Server 2016)
# - 4.6.2-windowsservercore-ltsc2016 (Windows Server 2016)
# - 3.5-windowsservercore-ltsc2025 (Windows Server 2025)
# - 3.5-windowsservercore-ltsc2022 (Windows Server 2022)
# - 3.5-windowsservercore-ltsc2019 (Windows Server 2019)
# - 3.5-windowsservercore-ltsc2019 (Windows Server 2016)
# Uses the .NET Framework ASP.NET image for running the application
FROM mcr.microsoft.com/dotnet/framework/aspnet:4.8-windowsservercore-ltsc2022

# Set the default shell to PowerShell
SHELL ["powershell", "-command"]

WORKDIR /inetpub/wwwroot

# Copy from build stage
COPY --from=build /publish .

# Add any additional environment variables needed for your application (uncomment and modify as needed)
# ENV KEY=VALUE

# Install MSI packages (uncomment and modify as needed)
# COPY ./msi-installers C:/Installers
# RUN Start-Process -Wait -FilePath 'msiexec.exe' -ArgumentList '/i', 'C:\Installers\your-package.msi', '/quiet', '/norestart'

# Install custom Windows Server roles and features (uncomment and modify as needed)
# RUN dism /Online /Enable-Feature /FeatureName:YOUR-FEATURE-NAME

# Add additional Windows features (uncomment and modify as needed)
# RUN Add-WindowsFeature Some-Windows-Feature; `
#    Add-WindowsFeature Another-Windows-Feature

# Install MSI packages if needed (uncomment and modify as needed)
# COPY ./msi-installers C:/Installers
# RUN Start-Process -Wait -FilePath 'msiexec.exe' -ArgumentList '/i', 'C:\Installers\your-package.msi', '/quiet', '/norestart'

# Register assemblies in GAC if needed (uncomment and modify as needed)
# COPY ./assemblies C:/Assemblies
# RUN C:\Windows\Microsoft.NET\Framework64\v4.0.30319\gacutil -i C:/Assemblies/YourAssembly.dll

# Register COM components if needed (uncomment and modify as needed)
# COPY ./com-components C:/Components
# RUN regsvr32 /s C:/Components/YourComponent.dll

# Add registry keys if needed (uncomment and modify as needed)
# RUN New-Item -Path 'HKLM:\Software\YourApp' -Force; `
#     Set-ItemProperty -Path 'HKLM:\Software\YourApp' -Name 'Setting' -Value 'Value'

# Configure IIS settings if needed (uncomment and modify as needed)
# RUN Import-Module WebAdministration; `
#     Set-ItemProperty 'IIS:\AppPools\DefaultAppPool' -Name somePropertyName -Value 'SomePropertyValue'; `
#     Set-ItemProperty 'IIS:\Sites\Default Web Site' -Name anotherPropertyName -Value 'AnotherPropertyValue'

# Expose necessary ports - By default, IIS uses port 80
EXPOSE 80
# EXPOSE 443  # Uncomment if using HTTPS

# Copy LogMonitor from the microsoft/windows-container-tools repository
WORKDIR /LogMonitor
RUN curl -fSLo LogMonitor.exe https://github.com/microsoft/windows-container-tools/releases/download/v2.1.1/LogMonitor.exe

# Copy LogMonitorConfig.json from local files
COPY LogMonitorConfig.json .

# Set non-administrator user
USER ContainerUser

# Override the container's default entry point to take advantage of the LogMonitor
ENTRYPOINT [ "C:\\LogMonitor\\LogMonitor.exe", "C:\\ServiceMonitor.exe", "w3svc" ]
```

## この例の調整

**注記:** コンテナー化設定の具体的な要件に基づいて、このテンプレートをカスタマイズしてください。

このDockerfile例を調整するときは:

1. `YourSolution.sln`、`YourProject.csproj`などを実際のファイル名へ置き換える
2. 必要に応じてWindows Serverと.NET Frameworkのバージョンを調整する
3. 要件に基づいて依存関係のインストール手順を変更し、不要な手順を削除する
4. 具体的なワークフローに応じてステージを追加または削除する

## ステージ命名に関する注記

- `AS stage-name`構文は各ステージに名前を付ける
- 前のステージからファイルをコピーするには`--from=stage-name`を使用する
- 最終イメージで使用しない中間ステージを複数作成できる

### LogMonitorConfig.json

LogMonitorConfig.jsonファイルはプロジェクトディレクトリのルートに作成します。コンテナー内のログを監視するLogMonitor Toolの構成に使用されます。適切なログ機能を確保するため、ファイルの内容は次と完全に一致させます:
```json
{
  "LogConfig": {
    "sources": [
      {
        "type": "EventLog",
        "startAtOldestRecord": true,
        "eventFormatMultiLine": false,
        "channels": [
          {
            "name": "system",
            "level": "Warning"
          },
          {
            "name": "application",
            "level": "Error"
          }
        ]
      },
      {
        "type": "File",
        "directory": "c:\\inetpub\\logs",
        "filter": "*.log",
        "includeSubdirectories": true,
        "includeFileNames": false
      },
      {
        "type": "ETW",
        "eventFormatMultiLine": false,
        "providers": [
          {
            "providerName": "IIS: WWW Server",
            "providerGuid": "3A2A4E84-4C21-4981-AE10-3FDA0D9B0F83",
            "level": "Information"
          },
          {
            "providerName": "Microsoft-Windows-IIS-Logging",
            "providerGuid": "7E8AD27F-B271-4EA2-A783-A47BDE29143B",
            "level": "Information"
          }
        ]
      }
    ]
  }
}
```

---
name: containerize-aspnetcore
description: 'プロジェクトに合わせたDockerfileと.dockerfileファイルを作成し、ASP.NET Coreプロジェクトをコンテナー化する。'
---

# ASP.NET Core Dockerコンテナー化プロンプト

## コンテナー化の依頼

以下の設定で指定されたASP.NET Core（.NET）プロジェクトを、アプリケーションがLinux Dockerコンテナーで実行するために必要な変更**だけ**に集中してコンテナー化してください。ここで指定されたすべての設定を考慮します。

.NET Coreアプリケーションのコンテナー化に関するベストプラクティスに従い、パフォーマンス、セキュリティ、保守性についてコンテナーを最適化します。

## コンテナー化設定

このセクションには、ASP.NET Coreアプリケーションのコンテナー化に必要な具体的な設定と構成が含まれます。このプロンプトを実行する前に、必要な情報を設定へ入力してください。多くの場合、必要なのは最初の数項目だけです。後半の設定が対象プロジェクトに該当しない場合は、既定値のままにできます。

指定されていない設定には既定値が適用されます。既定値は`[角括弧]`内に示されています。

### 基本プロジェクト情報
1. コンテナー化するプロジェクト:
   - `[ProjectName（.csprojファイルへのパスを指定）]`

2. 使用する.NETバージョン:
   - `[8.0または9.0（既定は8.0）]`

3. 使用するLinuxディストリビューション:
   - `[debian、alpine、ubuntu、chiseled、Azure Linux（mariner）のいずれか（既定はdebian）]`

4. Dockerイメージのビルドステージで使用するカスタムベースイメージ（標準のMicrosoftベースイメージを使用する場合は「なし」）:
   - `[ビルドステージで使用するベースイメージを指定（既定は「なし」）]`

5. Dockerイメージの実行ステージで使用するカスタムベースイメージ（標準のMicrosoftベースイメージを使用する場合は「なし」）:
   - `[実行ステージで使用するベースイメージを指定（既定は「なし」）]`

### コンテナー構成
1. コンテナーイメージで公開する必要があるポート:
   - プライマリHTTPポート: `[例: 8080]`
   - 追加ポート: `[追加ポートを列挙、または「なし」]`

2. コンテナーを実行するユーザーアカウント:
   - `[ユーザーアカウント、または既定の"$APP_UID"]`

3. アプリケーションURLの構成:
   - `[ASPNETCORE_URLSを指定、または既定の"http://+:8080"]`

### ビルド構成
1. コンテナーイメージのビルド前に実行する必要があるカスタムビルド手順:
   - `[具体的なビルド手順を列挙、または「なし」]`

2. コンテナーイメージのビルド後に実行する必要があるカスタムビルド手順:
   - `[具体的なビルド手順を列挙、または「なし」]`

3. 構成する必要があるNuGetパッケージソース:
   - `[認証情報を含むプライベートNuGetフィードを列挙、または「なし」]`

### 依存関係
1. コンテナーイメージへインストールする必要があるシステムパッケージ:
   - `[選択したLinuxディストリビューション用のパッケージ名、または「なし」]`

2. コンテナーイメージへコピーする必要があるネイティブライブラリ:
   - `[ライブラリ名とパス、または「なし」]`

3. インストールする必要がある追加の.NET Tool:
   - `[Tool名とバージョン、または「なし」]`

### システム構成
1. コンテナーイメージで設定する必要がある環境変数:
   - `[変数名と値、または「既定値を使用」]`

### ファイルシステム
1. コンテナーイメージへコピーする必要があるファイル／ディレクトリ:
   - `[プロジェクトルートからの相対パス、または「なし」]`
   - コンテナー内のコピー先: `[コンテナーパス、または「該当なし」]`

2. コンテナー化から除外するファイル／ディレクトリ:
   - `[除外するパス、または「なし」]`

3. 構成するボリュームマウントポイント:
   - `[永続データ用のボリュームパス、または「なし」]`

### .dockerignoreの構成
1. `.dockerignore`ファイルへ含めるパターン（.dockerignoreには一般的な既定値がすでに含まれ、ここでは追加パターンを指定）:
   - 追加パターン: `[追加パターンを列挙、または「なし」]`

### ヘルスチェック構成
1. ヘルスチェックエンドポイント:
   - `[ヘルスチェックURLパス、または「なし」]`

2. ヘルスチェックの間隔とタイムアウト:
   - `[間隔とタイムアウトの値、または「既定値を使用」]`

### 追加指示
1. プロジェクトのコンテナー化で従う必要があるその他の指示:
   - `[具体的な要件、または「なし」]`

2. 対処する既知の問題:
   - `[既知の問題を説明、または「なし」]`

## スコープ

- ✅ 環境変数からアプリケーション設定と接続文字列を読み取れるようにするアプリ構成変更
- ✅ ASP.NET Coreアプリケーション用Dockerfileの作成と構成
- ✅ アプリケーションをビルド／公開し、出力を最終イメージへコピーするDockerfileのマルチステージ指定
- ✅ Linuxコンテナープラットフォーム互換性（Alpine、Ubuntu、Chiseled、Azure Linux（Mariner））の構成
- ✅ 依存関係（システムパッケージ、ネイティブライブラリ、追加Tool）の適切な処理
- ❌ インフラストラクチャのセットアップは行わない（別途処理される前提）
- ❌ コンテナー化に必要な範囲を超えるコード変更は行わない

## 実行プロセス

1. 上記のコンテナー化設定を確認し、コンテナー化の要件を理解する
2. チェックマークで変更を追跡する`progress.md`ファイルを作成する
3. プロジェクトの.csprojファイルにある`TargetFramework`要素を確認し、.NETバージョンを特定する
4. 次に基づいて適切なLinuxコンテナーイメージを選択する:
   - プロジェクトから検出した.NETバージョン
   - コンテナー化設定で指定されたLinuxディストリビューション（Alpine、Ubuntu、Chiseled、Azure Linux（Mariner））
   - ユーザーがコンテナー化設定で特定のベースイメージを要求していない場合、ベースイメージは、以下のDockerfile例またはドキュメントに示されるタグを持つ有効なmcr.microsoft.com/dotnetイメージで**なければならない**
   - ビルドステージとランタイムステージ用のMicrosoft公式.NETイメージ:
      - SDKイメージタグ（ビルドステージ用）: https://github.com/dotnet/dotnet-docker/blob/main/README.sdk.md
      - ASP.NET Coreランタイムイメージタグ: https://github.com/dotnet/dotnet-docker/blob/main/README.aspnet.md
      - .NETランタイムイメージタグ: https://github.com/dotnet/dotnet-docker/blob/main/README.runtime.md
5. アプリケーションをコンテナー化するDockerfileをプロジェクトディレクトリのルートに作成する
   - Dockerfileではマルチステージを使用する:
     - ビルドステージ: .NET SDKイメージを使用してアプリケーションをビルドする
       - 最初にcsprojファイルをコピーする
       - NuGet.configが存在する場合はコピーし、private feedを構成する
       - NuGetパッケージを復元する
       - 次に残りのソースコードをコピーし、アプリケーションをビルドして/app/publishへ公開する
     - 最終ステージ: 選択した.NETランタイムイメージを使用してアプリケーションを実行する
       - 作業ディレクトリを/appに設定する
       - 指示されたユーザーを設定する（既定では非rootユーザー、例: `$APP_UID`）
         - コンテナー化設定で別の指示がない限り、新しいユーザーを作成する必要は*ない*。ユーザーアカウントの指定には`$APP_UID`変数を使用する。
       - ビルドステージから公開済み出力を最終イメージへコピーする
   - コンテナー化設定のすべての要件を必ず考慮する:
     - .NETバージョンとLinuxディストリビューション
     - 公開ポート
     - コンテナーのユーザーアカウント
     - ASPNETCORE_URLSの構成
     - システムパッケージのインストール
     - ネイティブライブラリの依存関係
     - 追加の.NET Tool
     - 環境変数
     - ファイル／ディレクトリのコピー
     - ボリュームマウントポイント
     - ヘルスチェック構成
6. Dockerイメージから不要なファイルを除外する`.dockerignore`ファイルをプロジェクトディレクトリのルートに作成する。`.dockerignore`ファイルには、次の要素とコンテナー化設定で指定された追加パターンを少なくとも**必ず**含める:
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
7. コンテナー化設定で指定されている場合はヘルスチェックを構成する:
   - ヘルスチェックエンドポイントが指定されている場合は、DockerfileへHEALTHCHECK命令を追加する
   - curlまたはwgetを使用してヘルスエンドポイントを確認する
8. タスクを完了としてマークする: [ ] → [✓]
9. すべてのタスクが完了し、Dockerビルドが成功するまで続行する

## ビルドとランタイムの検証

Dockerfileの完成後にDockerビルドが成功することを確認します。次のコマンドを使用してDockerイメージをビルドします:

```bash
docker build -t aspnetcore-app:latest .
```

ビルドが失敗した場合は、エラーメッセージを確認し、Dockerfileまたはプロジェクト構成へ必要な調整を行います。成功／失敗を報告します。

## 進捗追跡

次の構造で`progress.md`ファイルを維持します:
```markdown
# Containerization Progress

## Environment Detection
- [ ] .NET version detection (version: ___)
- [ ] Linux distribution selection (distribution: ___)

## Configuration Changes
- [ ] Application configuration verification for environment variable support
- [ ] NuGet package source configuration (if applicable)

## Containerization
- [ ] Dockerfile creation
- [ ] .dockerignore file creation
- [ ] Build stage created with SDK image
- [ ] csproj file(s) copied for package restore
- [ ] NuGet.config copied if applicable
- [ ] Runtime stage created with runtime image
- [ ] Non-root user configuration
- [ ] Dependency handling (system packages, native libraries, tools, etc.)
- [ ] Health check configuration (if applicable)
- [ ] Special requirements implementation

## Verification
- [ ] Review containerization settings and make sure that all requirements are met
- [ ] Docker build success
```

手順の途中で確認のために停止しないでください。アプリケーションのコンテナー化とDockerビルドが成功するまで、順序立てて続行してください。

**すべてのチェックボックスを完了するまで作業は終了ではありません。** これには、Dockerイメージのビルド成功と、ビルドプロセス中に発生した問題への対処が含まれます。

## Dockerfileの例

Linuxベースイメージを使用するASP.NET Core（.NET）アプリケーションのDockerfile例です。

```dockerfile
# ============================================================
# Stage 1: Build and publish the application
# ============================================================

# Base Image - Select the appropriate .NET SDK version and Linux distribution
# Possible tags include:
# - 8.0-bookworm-slim (Debian 12)
# - 8.0-noble (Ubuntu 24.04)
# - 8.0-alpine (Alpine Linux)
# - 9.0-bookworm-slim (Debian 12)
# - 9.0-noble (Ubuntu 24.04)
# - 9.0-alpine (Alpine Linux)
# Uses the .NET SDK image for building the application
FROM mcr.microsoft.com/dotnet/sdk:8.0-bookworm-slim AS build
ARG BUILD_CONFIGURATION=Release

WORKDIR /src

# Copy project files first for better caching
COPY ["YourProject/YourProject.csproj", "YourProject/"]
COPY ["YourOtherProject/YourOtherProject.csproj", "YourOtherProject/"]

# Copy NuGet configuration if it exists
COPY ["NuGet.config", "."]

# Restore NuGet packages
RUN dotnet restore "YourProject/YourProject.csproj"

# Copy source code
COPY . .

# Perform custom pre-build steps here, if needed
# RUN echo "Running pre-build steps..."

# Build and publish the application
WORKDIR "/src/YourProject"
RUN dotnet build "YourProject.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish the application
RUN dotnet publish "YourProject.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Perform custom post-build steps here, if needed
# RUN echo "Running post-build steps..."

# ============================================================
# Stage 2: Final runtime image
# ============================================================

# Base Image - Select the appropriate .NET runtime version and Linux distribution
# Possible tags include:
# - 8.0-bookworm-slim (Debian 12)
# - 8.0-noble (Ubuntu 24.04)
# - 8.0-alpine (Alpine Linux)
# - 8.0-noble-chiseled (Ubuntu 24.04 Chiseled)
# - 8.0-azurelinux3.0 (Azure Linux)
# - 9.0-bookworm-slim (Debian 12)
# - 9.0-noble (Ubuntu 24.04)
# - 9.0-alpine (Alpine Linux)
# - 9.0-noble-chiseled (Ubuntu 24.04 Chiseled)
# - 9.0-azurelinux3.0 (Azure Linux)
# Uses the .NET runtime image for running the application
FROM mcr.microsoft.com/dotnet/aspnet:8.0-bookworm-slim AS final

# Install system packages if needed (uncomment and modify as needed)
# RUN apt-get update && apt-get install -y \
#     curl \
#     wget \
#     ca-certificates \
#     libgdiplus \
#     && rm -rf /var/lib/apt/lists/*

# Install additional .NET tools if needed (uncomment and modify as needed)
# RUN dotnet tool install --global dotnet-ef --version 8.0.0
# ENV PATH="$PATH:/root/.dotnet/tools"

WORKDIR /app

# Copy published application from build stage
COPY --from=build /app/publish .

# Copy additional files if needed (uncomment and modify as needed)
# COPY ./config/appsettings.Production.json .
# COPY ./certificates/ ./certificates/

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

# Add custom environment variables if needed (uncomment and modify as needed)
# ENV CONNECTIONSTRINGS__DEFAULTCONNECTION="your-connection-string"
# ENV FEATURE_FLAG_ENABLED=true

# Configure SSL/TLS certificates if needed (uncomment and modify as needed)
# ENV ASPNETCORE_Kestrel__Certificates__Default__Path=/app/certificates/app.pfx
# ENV ASPNETCORE_Kestrel__Certificates__Default__Password=your_password

# Expose the port the application listens on
EXPOSE 8080
# EXPOSE 8081  # Uncomment if using HTTPS

# Install curl for health checks if not already present
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Configure health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Create volumes for persistent data if needed (uncomment and modify as needed)
# VOLUME ["/app/data", "/app/logs"]

# Switch to non-root user for security
USER $APP_UID

# Set the entry point for the application
ENTRYPOINT ["dotnet", "YourProject.dll"]
```

## この例の調整

**注記:** コンテナー化設定の具体的な要件に基づいて、このテンプレートをカスタマイズしてください。

このDockerfile例を調整するときは:

1. `YourProject.csproj`、`YourProject.dll`などを実際のプロジェクト名へ置き換える
2. 必要に応じて.NETバージョンとLinuxディストリビューションを調整する
3. 要件に基づいて依存関係のインストール手順を変更し、不要な手順を削除する
4. アプリケーション固有の環境変数を構成する
5. 具体的なワークフローに応じてステージを追加または削除する
6. アプリケーションのヘルスチェックルートに合わせてヘルスチェックエンドポイントを更新する

## Linuxディストリビューション別の差異

### Alpine Linux
イメージサイズを小さくするには、Alpine Linuxを使用できます:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
# ... build steps ...

FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS final
# Install packages using apk
RUN apk update && apk add --no-cache curl ca-certificates
```

### Ubuntu Chiseled
攻撃対象領域を最小限にするには、chiseledイメージの使用を検討します:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0-jammy-chiseled AS final
# Note: Chiseled images have minimal packages, so you may need to use a different base for additional dependencies
```

### Azure Linux（Mariner）
Azure向けに最適化されたコンテナーには:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0-azurelinux3.0 AS final
# Install packages using tdnf
RUN tdnf update -y && tdnf install -y curl ca-certificates && tdnf clean all
```

## ステージ命名に関する注記

- `AS stage-name`構文は各ステージに名前を付ける
- 前のステージからファイルをコピーするには`--from=stage-name`を使用する
- 最終イメージで使用しない中間ステージを複数作成できる
- `final`ステージが最終コンテナーイメージになる

## セキュリティのベストプラクティス

- 本番環境では常に非rootユーザーで実行する
- `latest`ではなく具体的なイメージタグを使用する
- インストールするパッケージ数を最小限にする
- ベースイメージを最新に保つ
- マルチステージビルドを使用して、最終イメージからビルド依存関係を除外する

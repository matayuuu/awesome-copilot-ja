---
name: codeql
description: 'GitHub ActionsワークフローとCodeQL CLIを使用してCodeQLコードスキャンをセットアップ、構成するための包括的なガイド。コードスキャン構成、CodeQLワークフローファイル、CodeQL CLIコマンド、SARIF出力、セキュリティ分析のセットアップ、CodeQL分析のトラブルシューティングを支援するときに使用する。'
---

# CodeQLコードスキャン

このSkillは、GitHub ActionsワークフローとスタンドアロンのCodeQL CLIの両方を使用して、CodeQLコードスキャンを構成、実行する手順を案内します。

## このSkillを使用する場面

次の依頼でこのSkillを使用します:

- `codeql.yml` GitHub Actionsワークフローの作成またはカスタマイズ
- コードスキャンのdefault setupとadvanced setupの選択
- CodeQLの言語マトリックス、build mode、query suiteの構成
- CodeQL CLIのローカル実行（`codeql database create`、`database analyze`、`github upload-results`）
- CodeQLのSARIF出力の理解または解釈
- CodeQL分析失敗のトラブルシューティング（build mode、コンパイル言語、runner要件）
- コンポーネントごとにスキャンするmonorepo向けCodeQLのセットアップ
- 依存関係キャッシュ、カスタムquery pack、model packの構成

## 対応言語

CodeQLは次の言語識別子に対応しています:

| 言語 | 識別子 | 代替 |
|---|---|---|
| C/C++ | `c-cpp` | `c`, `cpp` |
| C# | `csharp` | — |
| Go | `go` | — |
| Java/Kotlin | `java-kotlin` | `java`, `kotlin` |
| JavaScript/TypeScript | `javascript-typescript` | `javascript`, `typescript` |
| Python | `python` | — |
| Ruby | `ruby` | — |
| Rust | `rust` | — |
| Swift | `swift` | — |
| GitHub Actions | `actions` | — |

> 代替識別子は標準識別子と同等です（例: `javascript`を指定してもTypeScriptの分析は除外されません）。

## 基本ワークフロー — GitHub Actions

### ステップ1: セットアップの種類を選ぶ

- **Default setup** — RepositoryのSettings → Advanced Security → CodeQL analysisから有効にします。すぐに始める場合に最適です。多くの言語で`none` build modeを使用します。
- **Advanced setup** — `.github/workflows/codeql.yml`ファイルを作成し、トリガー、build mode、query suite、マトリックス戦略を完全に制御します。

defaultからadvancedへ切り替えるには、最初にdefault setupを無効化してから、ワークフローファイルをコミットします。

### ステップ2: ワークフローのトリガーを構成する

スキャンを実行するタイミングを定義します:

```yaml
on:
  push:
    branches: [main, protected]
  pull_request:
    branches: [main]
  schedule:
    - cron: '30 6 * * 1'  # Weekly Monday 6:30 UTC
```

- `push` — 指定したブランチへのpushごとにスキャンし、結果はSecurityタブに表示される
- `pull_request` — PRのマージコミットをスキャンし、結果はPRチェックのannotationとして表示される
- `schedule` — default branchを定期的にスキャンする（cronはdefault branchに存在する必要がある）
- `merge_group` — Repositoryでmerge queueを使用する場合に追加する

ドキュメントだけを変更するPRのスキャンを省略するには:

```yaml
on:
  pull_request:
    paths-ignore:
      - '**/*.md'
      - '**/*.txt'
```

> `paths-ignore`はワークフローを実行するかどうかを制御するもので、分析するファイルを制御するものではありません。

### ステップ3: 権限を構成する

最小権限を設定します:

```yaml
permissions:
  security-events: write   # Required to upload SARIF results
  contents: read            # Required to checkout code
  actions: read             # Required for private repos using codeql-action
```

### ステップ4: 言語マトリックスを構成する

マトリックス戦略を使用して各言語を並列に分析します:

```yaml
jobs:
  analyze:
    name: Analyze (${{ matrix.language }})
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        include:
          - language: javascript-typescript
            build-mode: none
          - language: python
            build-mode: none
```

コンパイル言語では、適切な`build-mode`を設定します:
- `none` — ビルド不要（C/C++、C#、Java、Rustに対応）
- `autobuild` — ビルドを自動検出
- `manual` — カスタムビルドコマンド（advanced setupのみ）

> 言語ごとのautobuildの詳細動作とrunner要件については、`references/compiled-languages.md`を検索してください。

### ステップ5: CodeQLの初期化と分析を構成する

```yaml
steps:
  - name: Checkout repository
    uses: actions/checkout@v4

  - name: Initialize CodeQL
    uses: github/codeql-action/init@v4
    with:
      languages: ${{ matrix.language }}
      build-mode: ${{ matrix.build-mode }}
      queries: security-extended
      dependency-caching: true

  - name: Perform CodeQL Analysis
    uses: github/codeql-action/analyze@v4
    with:
      category: "/language:${{ matrix.language }}"
```

**Query suiteの選択肢:**
- `security-extended` — 既定のセキュリティクエリと追加のカバレッジ
- `security-and-quality` — セキュリティクエリとコード品質クエリ
- `packs:`入力によるカスタムquery pack（例: `codeql/javascript-queries:AlertSuppression.ql`）

**依存関係のキャッシュ:** 復元した依存関係を実行間でキャッシュするには、`init`アクションに`dependency-caching: true`を設定します。

**分析カテゴリ:** monorepoのSARIF結果を区別するには`category`を使用します（例: 言語別、コンポーネント別）。

### ステップ6: Monorepoの構成

複数のコンポーネントを持つmonorepoでは、`category`パラメーターを使用してSARIF結果を分離します:

```yaml
category: "/language:${{ matrix.language }}/component:frontend"
```

分析を特定のディレクトリに限定するには、CodeQL構成ファイル（`.github/codeql/codeql-config.yml`）を使用します:

```yaml
paths:
  - apps/
  - services/
paths-ignore:
  - node_modules/
  - '**/test/**'
```

ワークフローから参照します:

```yaml
- uses: github/codeql-action/init@v4
  with:
    config-file: .github/codeql/codeql-config.yml
```

### ステップ7: 手動ビルド手順（コンパイル言語）

`autobuild`が失敗する場合、またはカスタムビルドコマンドが必要な場合:

```yaml
- language: c-cpp
  build-mode: manual
```

次に、`init`と`analyze`の間へ明示的なビルド手順を追加します:

```yaml
- if: matrix.build-mode == 'manual'
  name: Build
  run: |
    make bootstrap
    make release
```

## 基本ワークフロー — CodeQL CLI

### ステップ1: CodeQL CLIをインストールする

CodeQL bundle（CLIと事前コンパイル済みクエリを含む）をダウンロードします:

```bash
# Download from https://github.com/github/codeql-action/releases
# Extract and add to PATH
export PATH="$HOME/codeql:$PATH"

# Verify installation
codeql resolve packs
codeql resolve languages
```

> スタンドアロンのCLIダウンロードではなく、常にCodeQL bundleを使用してください。bundleはクエリの互換性を保証し、パフォーマンス向上のための事前コンパイル済みクエリを提供します。

### ステップ2: CodeQLデータベースを作成する

```bash
# Single language
codeql database create codeql-db \
  --language=javascript-typescript \
  --source-root=src

# Multiple languages (cluster mode)
codeql database create codeql-dbs \
  --db-cluster \
  --language=java,python \
  --command=./build.sh \
  --source-root=src
```

コンパイル言語では、`--command`でビルドコマンドを指定します。

### ステップ3: データベースを分析する

```bash
codeql database analyze codeql-db \
  javascript-code-scanning.qls \
  --format=sarif-latest \
  --sarif-category=javascript \
  --output=results.sarif
```

一般的なquery suite: `<language>-code-scanning.qls`、`<language>-security-extended.qls`、`<language>-security-and-quality.qls`。

### ステップ4: 結果をGitHubへアップロードする

```bash
codeql github upload-results \
  --repository=owner/repo \
  --ref=refs/heads/main \
  --commit=<commit-sha> \
  --sarif=results.sarif
```

`security-events: write`権限を持つ`GITHUB_TOKEN`環境変数が必要です。

### CLI Serverモード

複数のコマンドを実行するときにJVMの初期化が繰り返されるのを避けるには:

```bash
codeql execute cli-server
```

> CLIコマンドの詳細なリファレンスについては、`references/cli-commands.md`を検索してください。

## アラート管理

### 重大度レベル

アラートには2種類の重大度があります:
- **標準の重大度:** `Error`、`Warning`、`Note`
- **セキュリティ重大度:** `Critical`、`High`、`Medium`、`Low`（CVSSスコアから算出され、表示上はこちらが優先される）

### Copilot Autofix

GitHub Copilot Autofixは、Pull Request内のCodeQLアラートに対する修正候補を自動生成します。Copilotサブスクリプションは不要です。コミット前に候補を慎重にレビューしてください。

### PRでのアラートトリアージ

- アラートは変更行のチェックannotationとして表示される
- 重大度が`error`／`critical`／`high`のアラートでは、既定でチェックが失敗する
- しきい値をカスタマイズするには、merge protection rulesetを構成する
- 誤検知を却下する場合は、監査証跡のため理由を記録する

> アラート管理の詳しいガイダンスについては、`references/alert-management.md`を検索してください。

## カスタムクエリとPack

### カスタムQuery Packを使用する

```yaml
- uses: github/codeql-action/init@v4
  with:
    packs: |
      my-org/my-security-queries@1.0.0
      codeql/javascript-queries:AlertSuppression.ql
```

### カスタムQuery Packを作成する

CodeQL CLIを使用してPackを作成、公開します:

```bash
# Initialize a new pack
codeql pack init my-org/my-queries

# Install dependencies
codeql pack install

# Publish to GitHub Container Registry
codeql pack publish
```

### CodeQL構成ファイル

高度なクエリとパスの構成には、`.github/codeql/codeql-config.yml`を作成します:

```yaml
paths:
  - apps/
  - services/
paths-ignore:
  - '**/test/**'
  - node_modules/
queries:
  - uses: security-extended
packs:
  javascript-typescript:
    - my-org/my-custom-queries
```

## コードスキャンのログ

### 概要メトリクス

ワークフローログには主要なメトリクスが含まれます:
- **コードベースのコード行数** — 抽出前の基準値
- **抽出された行数** — 外部ライブラリと自動生成ファイルを含む
- **抽出エラー／警告** — 抽出に失敗した、または警告が発生したファイル

### デバッグログ

詳細な診断を有効にするには:
- **GitHub Actions:** "Enable debug logging"を選択してワークフローを再実行する
- **CodeQL CLI:** `--verbosity=progress++`と`--logdir=codeql-logs`を使用する

## トラブルシューティング

### 一般的な問題

| 問題 | 解決策 |
|---|---|
| ワークフローが起動しない | `on:`トリガーがイベントと一致することを確認し、`paths`／`branches`フィルターを調べ、ワークフローが対象ブランチに存在することを確認する |
| `Resource not accessible`エラー | `security-events: write`と`contents: read`権限を追加する |
| Autobuildの失敗 | `build-mode: manual`へ切り替え、明示的なビルドコマンドを追加する |
| ソースコードが認識されない | `--source-root`、ビルドコマンド、言語識別子を確認する |
| C#コンパイラの失敗 | `/p:EmitCompilerGeneratedFiles=true`と`.sqlproj`またはレガシープロジェクトの競合を確認する |
| スキャン行数が予想より少ない | `none`から`autobuild`／`manual`へ切り替え、ビルドですべてのソースがコンパイルされることを確認する |
| Kotlinがno-build modeになっている | default setupを無効化して再度有効化し、`autobuild`へ切り替える |
| 毎回キャッシュミスになる | `init`アクションの`dependency-caching: true`を確認する |
| ディスク／メモリ不足 | より大きなrunnerを使用し、`paths`構成で分析範囲を減らし、`build-mode: none`を使用する |
| SARIFアップロードの失敗 | tokenに`security-events: write`があることを確認し、10 MBのファイルサイズ上限を確認する |
| SARIF結果が上限を超える | 異なる`--sarif-category`で複数のアップロードへ分割し、クエリ範囲を減らす |
| CodeQLワークフローが2つある | advanced setupを使用する場合はdefault setupを無効化するか、古いワークフローファイルを削除する |
| 分析が遅い | 依存関係キャッシュを有効化し、`--threads=0`を使用し、query suiteの範囲を減らす |

> 詳細な解決策を含む包括的なトラブルシューティングについては、`references/troubleshooting.md`を検索してください。

### ハードウェア要件（Self-hosted runner）

| コードベースの規模 | RAM | CPU |
|---|---|---|
| 小（100K LOC未満） | 8 GB以上 | 2コア |
| 中（100K～1M LOC） | 16 GB以上 | 4～8コア |
| 大（1M LOC超） | 64 GB以上 | 8コア |

すべての規模: 空きディスク容量14 GB以上のSSD。

### Actionのバージョン管理

CodeQL actionを特定のmajor versionに固定します:

```yaml
uses: github/codeql-action/init@v4      # Recommended
uses: github/codeql-action/autobuild@v4
uses: github/codeql-action/analyze@v4
```

最大限のセキュリティを確保するには、version tagではなく完全なcommit SHAへ固定します。

## 参考ファイル

詳しいドキュメントが必要な場合は、次の参考ファイルを読み込みます:

- `references/workflow-configuration.md` — ワークフローのトリガー、runner、構成オプションの完全な説明
  - 検索パターン: `trigger`、`schedule`、`paths-ignore`、`db-location`、`model packs`、`alert severity`、`merge protection`、`concurrency`、`config file`
- `references/cli-commands.md` — 完全なCodeQL CLIコマンドリファレンス
  - 検索パターン: `database create`、`database analyze`、`upload-results`、`resolve packs`、`cli-server`、`installation`、`CI integration`
- `references/sarif-output.md` — SARIF v2.1.0のオブジェクトモデル、アップロード上限、第三者対応
  - 検索パターン: `sarifLog`、`result`、`location`、`region`、`codeFlow`、`fingerprint`、`suppression`、`upload limits`、`third-party`、`precision`、`security-severity`
- `references/compiled-languages.md` — 言語ごとのbuild modeとautobuild動作
  - 検索パターン: `C/C++`、`C#`、`Java`、`Go`、`Rust`、`Swift`、`autobuild`、`build-mode`、`hardware`、`dependency caching`
- `references/troubleshooting.md` — 包括的なエラー診断と解決策
  - 検索パターン: `no source code`、`out of disk`、`out of memory`、`403`、`C# compiler`、`analysis too long`、`fewer lines`、`Kotlin`、`extraction errors`、`debug logging`、`SARIF upload`、`SARIF limits`
- `references/alert-management.md` — アラートの重大度、トリアージ、Copilot Autofix、却下
  - 検索パターン: `severity`、`security severity`、`CVSS`、`Copilot Autofix`、`dismiss`、`triage`、`PR alerts`、`data flow`、`merge protection`、`REST API`

---
name: dependabot
description: 'GitHub Dependabot の構成と管理に関する包括的なガイド。dependabot.yml の作成や最適化、Dependabot pull request の管理、依存関係更新戦略、グループ更新、monorepo パターン、multi-ecosystem group、セキュリティ更新、auto-triage rule、Dependabot に関連する GitHub Advanced Security（GHAS）のサプライチェーンセキュリティについて質問された場合に使用する。GitHub MCP Server を使って AI coding agent がコミット前に依存関係の脆弱性を走査する場合は、Advanced Security plugin（advanced-security@copilot-plugins）を参照する。'
---

# Dependabot の構成と管理

## 概要

Dependabot は GitHub 組み込みの依存関係管理ツールで、3 つの主要機能があります。

1. **Dependabot Alerts** — 既知の脆弱性（CVE）がある依存関係を通知する
2. **Dependabot Security Updates** — 脆弱な依存関係を修正する PR を自動作成する
3. **Dependabot Version Updates** — 依存関係を最新に保つ PR を自動作成する

すべての構成は、既定ブランチの **1 つのファイル** `.github/dependabot.yml` に置きます。GitHub はリポジトリごとに複数の `dependabot.yml` をサポートしません。

## 構成ワークフロー

`dependabot.yml` を作成または最適化するときは、次の手順に従います。

### ステップ 1: すべての ecosystem を検出する

依存関係 manifest をリポジトリ全体から探します。

| ecosystem | YAML 値 | manifest ファイル |
|---|---|---|
| npm/pnpm/yarn | `npm` | `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` |
| pip/pipenv/poetry | `pip` | `requirements.txt`, `Pipfile`, `pyproject.toml`, `setup.py` |
| uv | `uv` | `pyproject.toml`, `uv.lock` |
| Docker | `docker` | `Dockerfile` |
| Docker Compose | `docker-compose` | `docker-compose.yml` |
| GitHub Actions | `github-actions` | `.github/workflows/*.yml` |
| Go modules | `gomod` | `go.mod` |
| Bundler (Ruby) | `bundler` | `Gemfile` |
| Cargo (Rust) | `cargo` | `Cargo.toml` |
| Composer (PHP) | `composer` | `composer.json` |
| NuGet (.NET) | `nuget` | `*.csproj`, `packages.config` |
| .NET SDK | `dotnet-sdk` | `global.json` |
| Maven (Java) | `maven` | `pom.xml` |
| Gradle (Java) | `gradle` | `build.gradle` |
| Terraform | `terraform` | `*.tf` |
| OpenTofu | `opentofu` | `*.tf` |
| Helm | `helm` | `Chart.yaml` |
| Hex (Elixir) | `mix` | `mix.exs` |
| Swift | `swift` | `Package.swift` |
| Pub (Dart) | `pub` | `pubspec.yaml` |
| Bun | `bun` | `bun.lockb` |
| Dev Containers | `devcontainers` | `devcontainer.json` |
| Git Submodules | `gitsubmodule` | `.gitmodules` |
| Pre-commit | `pre-commit` | `.pre-commit-config.yaml` |

注:
- pnpm と yarn はどちらも `npm` ecosystem 値を使う。
- `uv.lock` がある場合は `uv` を優先し、それ以外は `pip` を使う。

### ステップ 2: ディレクトリ位置を対応付ける

各 ecosystem の manifest がある場所を特定します。monorepo では glob pattern と `directories`（複数形）を使います。

```yaml
directories:
  - "/"
  - "/apps/*"
  - "/packages/*"
  - "/lib-*"
  - "**/*"
```

重要: `directory`（単数形）は glob をサポートしません。wildcard には `directories`（複数形）を使います。

### ステップ 3: 各 ecosystem entry を構成する

各 entry には最低限、次が必要です。

```yaml
- package-ecosystem: "npm"
  directory: "/"
  schedule:
    interval: "weekly"
```

### ステップ 4: group、label、schedule で最適化する

以下の各セクションに従って最適化します。

## Monorepo 戦略

### workspace を網羅する glob pattern

多数の package がある場合は、各 directory を列挙せず glob pattern を使います。

```yaml
- package-ecosystem: "npm"
  directories:
    - "/"
    - "/apps/*"
    - "/packages/*"
    - "/services/*"
  schedule:
    interval: "weekly"
```

### ディレクトリをまたぐグループ化

複数ディレクトリで同じ依存関係を更新するとき、`group-by: dependency-name` で 1 つの PR にまとめます。

```yaml
groups:
  monorepo-deps:
    group-by: dependency-name
```

これにより CI コストとレビュー負荷を減らせます。制約:
- すべての directory が同じ package ecosystem を使う必要がある
- version update にだけ適用される
- 互換性のない version constraint は別 PR になる

workspace 外で独自の lockfile を持つ package（例: `.github/` の script）には、独立した ecosystem entry を作ります。

## 依存関係のグループ化

関連する依存関係を 1 つの PR にまとめ、PR のノイズを減らします。

```yaml
groups:
  dev-dependencies:
    dependency-type: "development"
    update-types: ["minor", "patch"]
  production-dependencies:
    dependency-type: "production"
    update-types: ["minor", "patch"]
```

名前パターンや security update によるグループ化も可能です。

```yaml
groups:
  angular:
    patterns: ["@angular*"]
    update-types: ["minor", "patch"]
  security-patches:
    applies-to: security-updates
    patterns: ["*"]
    update-types: ["patch", "minor"]
```

- 複数 group に一致する依存関係は、最初に一致した group に入る
- `applies-to` の既定値は `version-updates`
- group に含まれない依存関係は個別 PR になる

## 複数ecosystemのグループ化（Multi-Ecosystem Groups）

異なる package ecosystem の更新を 1 つの PR にまとめます。

```yaml
version: 2

multi-ecosystem-groups:
  infrastructure:
    schedule:
      interval: "weekly"
    labels: ["infrastructure", "dependencies"]

updates:
  - package-ecosystem: "docker"
    directory: "/"
    patterns: ["nginx", "redis"]
    multi-ecosystem-group: "infrastructure"

  - package-ecosystem: "terraform"
    directory: "/"
    patterns: ["aws*"]
    multi-ecosystem-group: "infrastructure"
```

`multi-ecosystem-group` を使う場合、`patterns` key は必須です。

## PR のカスタマイズ

`labels`、`commit-message`、`assignees`、`milestone`、`pull-request-branch-name`、`target-branch` を利用できます。

```yaml
labels:
  - "dependencies"
  - "npm"
commit-message:
  prefix: "deps"
  prefix-development: "deps-dev"
  include: "scope"
pull-request-branch-name:
  separator: "-"
target-branch: "develop"
```

`labels: []` で既定 label を含むすべての label を無効にできます。リポジトリに存在する SemVer label（`major`、`minor`、`patch`）は常に適用されます。`target-branch` を設定しても、security update は既定ブランチを対象とし、この ecosystem 構成は version update にだけ適用されます。

## schedule の最適化

対応 interval: `daily`、`weekly`、`monthly`、`quarterly`、`semiannually`、`yearly`、`cron`

```yaml
schedule:
  interval: "weekly"
  day: "monday"
  time: "09:00"
  timezone: "America/New_York"
```

`cron` の場合:

```yaml
schedule:
  interval: "cron"
  cronjob: "0 9 * * 1"
```

新しい version の公開直後を避けるには cooldown を使います。

```yaml
cooldown:
  default-days: 5
  semver-major-days: 30
  semver-minor-days: 7
  semver-patch-days: 3
  include: ["*"]
  exclude: ["critical-lib"]
```

cooldown は version update にだけ適用され、security update には適用されません。

## Security Updates の構成

Repository Settings → Advanced Security で Dependabot alerts、security updates、grouped security updates を有効にします。YAML では `applies-to: security-updates` を使って group 化できます。version update を無効にして security update だけにするには、`open-pull-requests-limit: 0` を使います。

GitHub の preset は、development dependency の影響が低い alert を自動で dismiss できます。カスタム rule は severity、package name、CWE などで絞り込めます。

## PR コメントコマンド

Dependabot PR では `@dependabot` コメントを使います。

> **注:** 2026 年 1 月時点で merge/close/reopen command は非推奨です。GitHub の標準 UI、CLI（`gh pr merge`）、または auto-merge を使ってください。

| コマンド | 効果 |
|---|---|
| `@dependabot rebase` | PR を rebase する |
| `@dependabot recreate` | PR を最初から作り直す |
| `@dependabot ignore this dependency` | 閉じて、この依存関係を今後更新しない |
| `@dependabot ignore this major version` | この major version を無視する |
| `@dependabot ignore this minor version` | この minor version を無視する |
| `@dependabot ignore this patch version` | この patch version を無視する |

grouped PR では、`@dependabot ignore DEPENDENCY_NAME`、`@dependabot unignore DEPENDENCY_NAME`、`@dependabot unignore *`、`@dependabot show DEPENDENCY_NAME ignore conditions` も使えます。完全な一覧は `references/pr-commands.md` を参照してください。

## ignore と allow の規則

```yaml
ignore:
  - dependency-name: "lodash"
  - dependency-name: "@types/node"
    update-types: ["version-update:semver-patch"]
  - dependency-name: "express"
    versions: ["5.x"]

allow:
  - dependency-type: "production"
  - dependency-name: "express"
```

依存関係が `allow` と `ignore` の両方に一致する場合は、**無視されます**。`exclude-paths` で対象外パスも指定できます。

## 高度なオプション

### バージョン管理戦略（versioning strategy）

| 値 | 動作 |
|---|---|
| `auto` | 既定。application では引き上げ、library では範囲を広げる |
| `increase` | 最小 version を常に引き上げる |
| `increase-if-necessary` | 現在の範囲が新 version を含まない場合だけ変更する |
| `lockfile-only` | manifest を変更せず lockfile だけ更新する |
| `widen` | 旧 version と新 version の両方を含むよう範囲を広げる |

`rebase-strategy: "disabled"` で自動 rebase を停止できます。commit message に `[dependabot skip]` を含めると、追加 commit がある状態での rebase を許可します。`open-pull-requests-limit` の既定値は version update が 5、security update が 10 です。

private registry はトップレベルの `registries` と、各 update entry の `registries` で参照します。token は `${{secrets.NPM_TOKEN}}` のように secret から取得します。

## よくある質問（FAQ）

**複数の `dependabot.yml` を置けますか？**
いいえ。GitHub がサポートするのは `.github/dependabot.yml` 1 ファイルだけです。ecosystem や directory ごとに複数の `updates` entry を使います。

**Dependabot は pnpm をサポートしますか？**
はい。`package-ecosystem: "npm"` を使うと、`pnpm-lock.yaml` が自動検出されます。

**monorepo の PR ノイズを減らすには？**
`groups` で更新をまとめ、glob 付きの `directories` で範囲を指定し、`group-by: dependency-name` でディレクトリをまたいでまとめます。優先度の低い ecosystem には `monthly` または `quarterly` も検討します。

**workspace 外の依存関係を扱うには？**
対象の場所を `directory` に指定した独立 ecosystem entry を作ります。

## AI Coding Agent によるコミット前の依存関係走査

AI coding agent 内でコミット前に脆弱な依存関係を確認する場合、GitHub MCP Server の `dependabot` toolset は、追加された依存関係を GitHub Advisory Database と照合し、該当 package、severity、推奨修正版を構造化して返せます。より詳細なコミット後確認では、Dependabot CLI をローカル実行し、変更前後の dependency graph を比較できます。

専用ツールと `/dependency-scanning` Skill を提供する **Advanced Security plugin** をインストールします。

**GitHub Copilot CLI（shell）:**
```bash
copilot --add-github-mcp-toolset dependabot
```

**GitHub Copilot CLI（`copilot` 内）:**
```text
> /plugin install advanced-security@copilot-plugins
```

**Visual Studio Code:**
- GitHub MCP Server の header に `"X-MCP-Toolsets": "dependabot"` を追加するか、Copilot Chat の toolset selector で **Dependabot** を選ぶ
- `advanced-security` plugin をインストールし、Copilot Chat で `/dependency-scanning` を使う

**プロンプト例:**
> このブランチで追加した依存関係を既知の脆弱性について走査し、コミット前にどの version へ更新すべきか教えてください。

参照: [Advanced Security Plugin — Dependency Scanning Skill](https://github.com/github/copilot-plugins/blob/main/plugins/advanced-security/skills/dependency-scanning/SKILL.md)

> [Dependency scanning with GitHub MCP Server is in public preview](https://github.blog/changelog/2026-05-05-dependency-scanning-with-github-mcp-server-is-in-public-preview/) で発表（2026 年 5 月）

## リソース

- `references/dependabot-yml-reference.md` — YAML option の完全なリファレンス
- `references/pr-commands.md` — PR コメントコマンドの完全なリファレンス
- `references/example-configs.md` — 実用的な構成例

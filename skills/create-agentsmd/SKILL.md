---
name: create-agentsmd
description: 'リポジトリ用のAGENTS.mdファイルを生成するプロンプト。'
---

# 高品質なAGENTS.mdファイルの作成

あなたはコーディングエージェントである。https://agents.md/ の公開指針に従い、このリポジトリのルートへ完全で正確なAGENTS.mdを作成する。

AGENTS.mdは、コーディングエージェントがプロジェクトで効果的に作業するために必要なコンテキストと指示を提供するオープン形式である。

## AGENTS.mdとは

AGENTS.mdは「エージェント向けREADME」として機能するMarkdownファイルであり、AIコーディングエージェントがプロジェクトで作業するためのコンテキストと指示を、専用の予測可能な場所で提供する。人向けREADMEでは煩雑になり得る、コーディングエージェントに必要な詳細な技術コンテキストを含めることでREADME.mdを補完する。

## 主な原則

- **エージェント重視**: 自動化ツール向けの詳細な技術指示を含める
- **README.mdを補完**: 人向け文書を置き換えず、エージェント固有のコンテキストを追加する
- **標準化された配置**: リポジトリルート、またはmonorepoのサブプロジェクトルートに置く
- **オープン形式**: 柔軟な構造の標準Markdownを使う
- **エコシステム互換性**: 20種類以上のAIコーディングツールおよびエージェントで機能する

## ファイル構造と内容の指針

### 1. 必須の設定

- リポジトリルートに `AGENTS.md` としてファイルを作成する
- 標準のMarkdown書式を使う
- 必須フィールドはなく、プロジェクトのニーズに応じた柔軟な構造にする

### 2. 含めるべき必須セクション

#### プロジェクト概要

- プロジェクトの機能に関する簡潔な説明
- 複雑な場合はアーキテクチャ概要
- 使用する主要な技術とフレームワーク

#### セットアップコマンド

- インストール手順
- 環境セットアップ手順
- 依存関係管理コマンド
- 該当する場合はデータベースのセットアップ

#### 開発Workflow

- 開発サーバーの起動方法
- ビルドコマンド
- watch/hot-reloadの設定
- package manager固有の情報（npm、pnpm、yarnなど）

#### テスト手順

- テスト（unit、integration、e2e）の実行方法
- テストファイルの配置と命名規則
- カバレッジ要件
- 使用する特定のテストパターンまたはフレームワーク
- テストの一部だけを実行する方法や特定領域へ絞る方法

#### コードスタイルの指針

- 言語固有の規約
- lintとformatの規則
- ファイル構成パターン
- 命名規則
- import/exportパターン

#### ビルドとデプロイ

- ビルドコマンドと出力
- 環境構成
- デプロイ手順と要件
- CI/CDパイプライン情報

### 3. 任意だが推奨するセクション

#### セキュリティ上の考慮事項

- セキュリティテストの要件
- シークレット管理
- 認証パターン
- 権限モデル

#### Monorepoの手順（該当する場合）

- 複数packageを扱う方法
- package間の依存関係
- 選択的なbuild/test
- package固有のコマンド

#### Pull Requestの指針

- タイトル書式の要件
- 提出前に必要なチェック
- レビュープロセス
- コミットメッセージの規約

#### デバッグとトラブルシューティング

- 一般的な問題と解決策
- ログ記録のパターン
- デバッグ構成
- パフォーマンス上の考慮事項

## テンプレート例

これを出発点として、対象プロジェクトに合わせてカスタマイズする。

```markdown
# AGENTS.md

## Project Overview

[Brief description of the project, its purpose, and key technologies]

## Setup Commands

- Install dependencies: `[package manager] install`
- Start development server: `[command]`
- Build for production: `[command]`

## Development Workflow

- [Development server startup instructions]
- [Hot reload/watch mode information]
- [Environment variable setup]

## Testing Instructions

- Run all tests: `[command]`
- Run unit tests: `[command]`
- Run integration tests: `[command]`
- Test coverage: `[command]`
- [Specific testing patterns or requirements]

## Code Style

- [Language and framework conventions]
- [Linting rules and commands]
- [Formatting requirements]
- [File organization patterns]

## Build and Deployment

- [Build process details]
- [Output directories]
- [Environment-specific builds]
- [Deployment commands]

## Pull Request Guidelines

- Title format: [component] Brief description
- Required checks: `[lint command]`, `[test command]`
- [Review requirements]

## Additional Notes

- [Any project-specific context]
- [Common gotchas or troubleshooting tips]
- [Performance considerations]
```

## agents.mdの実例

次はagents.mdのWebサイトにある実例である。

```markdown
# Sample AGENTS.md file

## Dev environment tips

- Use `pnpm dlx turbo run where <project_name>` to jump to a package instead of scanning with `ls`.
- Run `pnpm install --filter <project_name>` to add the package to your workspace so Vite, ESLint, and TypeScript can see it.
- Use `pnpm create vite@latest <project_name> -- --template react-ts` to spin up a new React + Vite package with TypeScript checks ready.
- Check the name field inside each package's package.json to confirm the right name—skip the top-level one.

## Testing instructions

- Find the CI plan in the .github/workflows folder.
- Run `pnpm turbo run test --filter <project_name>` to run every check defined for that package.
- From the package root you can just call `pnpm test`. The commit should pass all tests before you merge.
- To focus on one step, add the Vitest pattern: `pnpm vitest run -t "<test name>"`.
- Fix any test or type errors until the whole suite is green.
- After moving files or changing imports, run `pnpm lint --filter <project_name>` to be sure ESLint and TypeScript rules still pass.
- Add or update tests for the code you change, even if nobody asked.

## PR instructions

- Title format: [<project_name>] <Title>
- Always run `pnpm lint` and `pnpm test` before committing.
```

## 実装手順

1. 次を理解するため、**プロジェクト構造を分析する**。

   - 使用しているプログラミング言語とframework
   - package managerとbuild tool
   - テストframework
   - プロジェクトのアーキテクチャ（monorepo、単一packageなど）

2. 次を調べて**主要なWorkflowを特定する**。

   - package.jsonのscript
   - Makefileまたはその他のbuild file
   - CI/CD構成ファイル
   - 文書ファイル

3. 次を網羅する**包括的なセクションを作成する**。

   - 必須のセットアップコマンドと開発コマンド
   - テスト戦略とコマンド
   - コードスタイルと規約
   - buildとdeployのプロセス

4. エージェントが直接実行できる**具体的で実行可能なコマンドを含める**

5. すべてのコマンドが文書どおり動作することを確認して、**手順をテストする**

6. 一般的なプロジェクト情報ではなく、エージェントが知るべき内容へ**焦点を絞る**

## ベストプラクティス

- **具体的にする**: 曖昧な説明ではなく正確なコマンドを含める
- **コードブロックを使う**: 明確にするためコマンドをバッククォートで囲む
- **コンテキストを含める**: 特定の手順が必要な理由を説明する
- **最新に保つ**: プロジェクトの進化に合わせて更新する
- **コマンドをテストする**: 記載したすべてのコマンドが実際に動作することを確認する
- **ネストしたファイルを考慮する**: monorepoでは必要に応じてサブプロジェクトにAGENTS.mdを作成する

## Monorepoの考慮事項

大規模なmonorepoでは次に従う。

- リポジトリルートにメインのAGENTS.mdを置く
- サブプロジェクトのディレクトリに追加のAGENTS.mdを作成する
- 各場所では最も近いAGENTS.mdを優先する
- packageまたはproject間を移動するためのヒントを含める

## 最終的な注意事項

- AGENTS.mdはCursor、Aider、Gemini CLIなど20種類以上のAIコーディングツールで機能する
- この形式は意図的に柔軟であり、プロジェクトのニーズに合わせる
- エージェントがコードベースを理解して作業するための、実行可能な指示に焦点を当てる
- これは継続的に更新する文書であり、プロジェクトの進化に合わせて更新する

AGENTS.mdを作成するときは、明確さ、完全性、実行可能性を優先する。追加の人による案内なしで、どのコーディングエージェントでもプロジェクトへ効果的に貢献できる十分なコンテキストを提供することが目標である。

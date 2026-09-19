---
name: github-copilot-starter
description: '技術スタックに基づいて、新しいプロジェクト向けの完全なGitHub Copilot設定を構成します。'
---

GitHub Copilot設定のセットアップ専門家である。指定された技術スタックに基づき、新しいプロジェクト向けに本番利用可能な完全なGitHub Copilot設定を作成する。

## 必要なプロジェクト情報

次の情報が提供されていない場合は、ユーザーに尋ねる。

1. **主要言語／フレームワーク**：（例：JavaScript/React、Python/Django、Java/Spring Bootなど）
2. **プロジェクト種別**：（例：Webアプリ、API、モバイルアプリ、デスクトップアプリ、ライブラリなど）
3. **追加技術**：（例：データベース、クラウドプロバイダー、テストフレームワークなど）
4. **開発スタイル**：（厳格な標準、柔軟、特定のパターン）
5. **GitHub Actions / Coding Agent**：プロジェクトでGitHub Actionsを使用するか（yes/no — `copilot-setup-steps.yml`を生成するかどうかを決める）

## 作成する設定ファイル

指定されたスタックに基づいて、適切なディレクトリに次のファイルを作成する。

### 1. `.github/copilot-instructions.md`

すべてのCopilot対話に適用される、リポジトリの主要な指示。これは最も重要なファイルであり、Copilotはリポジトリ内のすべての対話でこのファイルを読む。

次の構造を使用する。
```md
# {Project Name} — Copilot Instructions

## Project Overview
Brief description of what this project does and its primary purpose.

## Tech Stack
List the primary language, frameworks, and key dependencies.

## Conventions
- Naming: describe naming conventions for files, functions, variables
- Structure: describe how the codebase is organized
- Error handling: describe the project's approach to errors and exceptions

## Workflow
- Describe PR conventions, branch naming, and commit style
- Reference specific instruction files for detailed standards:
  - Language guidelines: `.github/instructions/{language}.instructions.md`
  - Testing: `.github/instructions/testing.instructions.md`
  - Security: `.github/instructions/security.instructions.md`
  - Documentation: `.github/instructions/documentation.instructions.md`
  - Performance: `.github/instructions/performance.instructions.md`
  - Code review: `.github/instructions/code-review.instructions.md`
```

### 2. `.github/instructions/`ディレクトリ

具体的な指示ファイルを作成する。
- `{primaryLanguage}.instructions.md` - 言語固有の指針
- `testing.instructions.md` - テスト標準と実践
- `documentation.instructions.md` - ドキュメント要件
- `security.instructions.md` - セキュリティのベストプラクティス
- `performance.instructions.md` - パフォーマンス最適化の指針
- `code-review.instructions.md` - コードレビュー標準とGitHubレビューの指針

### 3. `.github/skills/`ディレクトリ

自己完結したフォルダーとして、再利用可能なSkillを作成する。
- `setup-component/SKILL.md` - コンポーネント／モジュール作成
- `write-tests/SKILL.md` - テスト生成
- `code-review/SKILL.md` - コードレビュー支援
- `refactor-code/SKILL.md` - コードリファクタリング
- `generate-docs/SKILL.md` - ドキュメント生成
- `debug-issue/SKILL.md` - 問題のデバッグ支援

### 4. `.github/agents/`ディレクトリ

常に次の4つのAgentを作成する。
- `software-engineer.agent.md`
- `architect.agent.md`
- `reviewer.agent.md`
- `debugger.agent.md`

各Agentについて、awesome-copilotのAgentから最も具体的に一致するものを取得する。一致するものがない場合は、汎用テンプレートを使用する。

**Agentの帰属表示：** awesome-copilotのAgentの内容を使用する場合は、帰属コメントを追加する。
```markdown
<!-- Based on/Inspired by: https://github.com/github/awesome-copilot/blob/main/agents/[filename].agent.md -->
```

### 5. `.github/workflows/`ディレクトリ（ユーザーがGitHub Actionsを使用する場合のみ）

ユーザーが「no」と回答した場合は、このセクションを完全に省略する。

Coding Agentのワークフローファイルを作成する。
- `copilot-setup-steps.yml` - Coding Agent環境セットアップ用のGitHub Actionsワークフローファイル

**重要：** ワークフローは次の構造に厳密に従う。
- ジョブ名は必ず`copilot-setup-steps`とする
- 適切なトリガー（workflow_dispatch、ワークフローファイルに対するpush、pull_request）を含める
- 必要最小限の権限を設定する
- 提供された技術スタックに合わせてステップをカスタマイズする

## 内容に関する指針

各ファイルでは、次の原則に従う。

**必須の最初の手順：** 内容を作成する前に、既存パターンを調査するため必ずfetchツールを使用する。
1. **awesome-copilotの具体的な指示を取得する：** https://github.com/github/awesome-copilot/blob/main/docs/README.instructions.md
2. **awesome-copilotの具体的なAgentを取得する：** https://github.com/github/awesome-copilot/blob/main/docs/README.agents.md
3. **awesome-copilotの具体的なSkillを取得する：** https://github.com/github/awesome-copilot/blob/main/docs/README.skills.md
4. **技術スタックに一致する既存パターンを確認する**

**基本方針：** awesome-copilotリポジトリの既存指示を参照し、適応する。
- 利用可能な既存の内容を使用する — 一から作り直さない
- 実績のあるパターンをプロジェクト固有の文脈へ適応する
- スタックに複数の要素が必要な場合は、複数の例を組み合わせる
- awesome-copilotの内容を使用した場合は、**必ず帰属表示コメントを追加する**

**帰属表示の形式：** awesome-copilotの内容を使用する場合は、ファイルの先頭に次のコメントを追加する。
```md
<!-- Based on/Inspired by: https://github.com/github/awesome-copilot/blob/main/instructions/[filename].instructions.md -->
```

**例：**
```md
<!-- Based on: https://github.com/github/awesome-copilot/blob/main/instructions/react.instructions.md -->
---
applyTo: "**/*.jsx,**/*.tsx"
description: "React development best practices"
---
# React Development Guidelines
...
```

```md
<!-- Inspired by: https://github.com/github/awesome-copilot/blob/main/instructions/java.instructions.md -->
<!-- and: https://github.com/github/awesome-copilot/blob/main/instructions/spring-boot.instructions.md -->
---
applyTo: "**/*.java"
description: "Java Spring Boot development standards"
---
# Java Spring Boot Guidelines
...
```

**補助方針：** 適切なawesome-copilot指示がない場合は、**簡潔な指針のみ**を作成する。
- 高レベルの原則とベストプラクティス（各2〜3文）
- アーキテクチャパターン（実装ではなくパターンを記載）
- コードスタイルの好み（命名規則、構造の好み）
- テスト戦略（テストコードではなく方針）
- ドキュメント標準（形式、要件）

`.instructions.md`ファイルでは、次を**厳禁**とする。
- ❌ 実際のコード例またはスニペット
- ❌ 詳細な実装手順
- ❌ テストケースまたは具体的なテストコード
- ❌ ボイラープレートまたはテンプレートコード
- ❌ 関数シグネチャまたはクラス定義
- ❌ import文または依存関係一覧

`.instructions.md`に適した内容：
- ✅ 「説明的な変数名を使用し、camelCaseに従う」
- ✅ 「継承よりもコンポジションを優先する」
- ✅ 「すべてのpublicメソッドに単体テストを書く」
- ✅ 「型安全性を高めるためTypeScriptのstrictモードを使用する」
- ✅ 「リポジトリで確立されたエラー処理パターンに従う」

**fetchツールを使った調査戦略：**
1. **まずawesome-copilotを確認する** — すべてのファイル種別で必ずここから開始する
2. **技術スタックに完全一致するものを探す**（例：React、Node.js、Spring Boot）
3. **一般的な一致を探す**（例：フロントエンドAgent、テストSkill、レビュー用ワークフロー）
4. **docsと関連ディレクトリを直接確認する**
5. **作り出した形式より、リポジトリ固有の例を優先する**
6. **関連するものがない場合だけカスタム内容を作成する**

**取得するawesome-copilotディレクトリ：**
- **Instructions**: https://github.com/github/awesome-copilot/tree/main/instructions
- **Agents**: https://github.com/github/awesome-copilot/tree/main/agents
- **Skills**: https://github.com/github/awesome-copilot/tree/main/skills

**確認するawesome-copilotの領域：**
- **フロントエンドWeb開発：** React、Angular、Vue、TypeScript、CSSフレームワーク
- **C# .NET開発：** テスト、ドキュメント、ベストプラクティス
- **Java開発：** Spring Boot、Quarkus、テスト、ドキュメント
- **データベース開発：** PostgreSQL、SQL Server、一般的なデータベースのベストプラクティス
- **Azure開発：** Infrastructure as Code、サーバーレス関数
- **セキュリティとパフォーマンス：** セキュリティフレームワーク、アクセシビリティ、パフォーマンス最適化

## ファイル構造の標準

すべてのファイルが次の規約に従うことを確認する。

```
project-root/
├── .github/
│   ├── copilot-instructions.md
│   ├── instructions/
│   │   ├── [language].instructions.md
│   │   ├── testing.instructions.md
│   │   ├── documentation.instructions.md
│   │   ├── security.instructions.md
│   │   ├── performance.instructions.md
│   │   └── code-review.instructions.md
│   ├── skills/
│   │   ├── setup-component/
│   │   │   └── SKILL.md
│   │   ├── write-tests/
│   │   │   └── SKILL.md
│   │   ├── code-review/
│   │   │   └── SKILL.md
│   │   ├── refactor-code/
│   │   │   └── SKILL.md
│   │   ├── generate-docs/
│   │   │   └── SKILL.md
│   │   └── debug-issue/
│   │       └── SKILL.md
│   ├── agents/
│   │   ├── software-engineer.agent.md
│   │   ├── architect.agent.md
│   │   ├── reviewer.agent.md
│   │   └── debugger.agent.md
│   └── workflows/                        # only if GitHub Actions is used
│       └── copilot-setup-steps.yml
```

## YAML Frontmatterテンプレート

すべてのファイルで次の構造を使用する。

**Instructions (.instructions.md):**
```md
---
applyTo: "**/*.{lang-ext}"
description: "Development standards for {Language}"
---
# {Language} coding standards

Apply the repository-wide guidance from `../copilot-instructions.md` to all code.

## General Guidelines
- Follow the project's established conventions and patterns
- Prefer clear, readable code over clever abstractions
- Use the language's idiomatic style and recommended practices
- Keep modules focused and appropriately sized

<!-- Adapt the sections below to match the project's specific technology choices and preferences -->
```

**Skills (SKILL.md):**
```md
---
name: {skill-name}
description: {Brief description of what this skill does}
---

# {Skill Name}

{One sentence describing what this skill does. Always follow the repository's established patterns.}

Ask for {required inputs} if not provided.

## Requirements
- Use the existing design system and repository conventions
- Follow the project's established patterns and style
- Adapt to the specific technology choices of this stack
- Reuse existing validation and documentation patterns
```

**Agents (.agent.md):**
```md
---
description: Generate an implementation plan for new features or refactoring existing code.
tools: ['codebase', 'web/fetch', 'findTestFiles', 'githubRepo', 'search', 'usages']
model: Claude Sonnet 4
---
# Planning mode instructions
You are in planning mode. Your task is to generate an implementation plan for a new feature or for refactoring existing code.
Don't make any code edits, just generate a plan.

The plan consists of a Markdown document that describes the implementation plan, including the following sections:

* Overview: A brief description of the feature or refactoring task.
* Requirements: A list of requirements for the feature or refactoring task.
* Implementation Steps: A detailed list of steps to implement the feature or refactoring task.
* Testing: A list of tests that need to be implemented to verify the feature or refactoring task.
```

## 実行手順

1. **プロジェクト情報を収集する** - 技術スタック、プロジェクト種別、開発スタイルが提供されていない場合はユーザーに尋ねる
2. **awesome-copilotのパターンを調査する**：
   - fetchツールを使ってawesome-copilotのディレクトリを調査する
   - instructionsを確認する：https://github.com/github/awesome-copilot/tree/main/instructions
   - agentsを確認する：https://github.com/github/awesome-copilot/tree/main/agents（特に一致する専門Agent）
   - skillsを確認する：https://github.com/github/awesome-copilot/tree/main/skills
3. **ディレクトリ構造を作成する**
4. **プロジェクト全体の標準を含む主要なcopilot-instructions.mdを生成する**
5. **言語固有のinstructionファイルを、awesome-copilotの参照を使って作成する（帰属表示を追加する）**
6. **プロジェクトに合わせた再利用可能なSkillを生成する**
7. **専門Agentを設定する**。該当する場合は技術スタックに合う専門Agentをawesome-copilotから取得する
8. **Coding Agent用のGitHub Actionsワークフロー（`copilot-setup-steps.yml`）を作成する** — ユーザーがGitHub Actionsを使わない場合は省略する
9. **検証する** - すべてのファイルが適切な形式と必要なfrontmatterに従っていることを確認する

## セットアップ後の指示

完了後、ユーザーに次を提供する。

1. **VS Codeセットアップ手順** - ファイルを有効化・設定する方法
2. **使用例** - 各SkillとAgentの使用方法
3. **カスタマイズのヒント** - 特定の要件に合わせてファイルを変更する方法
4. **テストの推奨事項** - セットアップが正しく機能することを確認する方法

## 品質チェックリスト

完了前に、次を確認する。
- [ ] 作成したすべてのCopilot Markdownファイルに、必要な場合は適切なYAML frontmatterがある
- [ ] 言語固有のベストプラクティスが含まれている
- [ ] ファイルがMarkdownリンクで適切に相互参照されている
- [ ] SkillとAgentに関連する説明がある。MCP／ツール関連のメタデータは、対象のCopilot環境が実際にサポートまたは要求する場合だけ含める
- [ ] 指示が包括的だが過度に複雑ではない
- [ ] セキュリティとパフォーマンスの考慮事項が扱われている
- [ ] テストの指針が含まれている
- [ ] ドキュメント標準が明確である
- [ ] コードレビュー標準が定義されている

## ワークフローテンプレート構造（GitHub Actionsを使用する場合のみ）

`copilot-setup-steps.yml`ワークフローは、必ず次の形式に従い、**シンプルに保つ**。

```yaml
name: "Copilot Setup Steps"
on:
  workflow_dispatch:
  push:
    paths:
      - .github/workflows/copilot-setup-steps.yml
  pull_request:
    paths:
      - .github/workflows/copilot-setup-steps.yml
jobs:
  # The job MUST be called `copilot-setup-steps` or it will not be picked up by Copilot.
  copilot-setup-steps:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout code
        uses: actions/checkout@v5
      # Add ONLY basic technology-specific setup steps here
```

**ワークフローはシンプルに保つ** - 必須のステップだけを含める。

**Node.js/JavaScript:**
```yaml
- name: Set up Node.js
  uses: actions/setup-node@v4
  with:
    node-version: "20"
    cache: "npm"
- name: Install dependencies
  run: npm ci
- name: Run linter
  run: npm run lint
- name: Run tests
  run: npm test
```

**Python:**
```yaml
- name: Set up Python
  uses: actions/setup-python@v4
  with:
    python-version: "3.11"
- name: Install dependencies
  run: pip install -r requirements.txt
- name: Run linter
  run: flake8 .
- name: Run tests
  run: pytest
```

**Java:**
```yaml
- name: Set up JDK
  uses: actions/setup-java@v4
  with:
    java-version: "17"
    distribution: "temurin"
- name: Build with Maven
  run: mvn compile
- name: Run tests
  run: mvn test
```

**ワークフローで避けるもの：**
- ❌ 複雑な設定
- ❌ 複数の環境設定
- ❌ 高度なツール設定
- ❌ カスタムスクリプトまたは複雑なロジック
- ❌ 複数のパッケージマネージャー
- ❌ データベース設定または外部サービス

**含めるもの：**
- ✅ 言語／ランタイムのセットアップ
- ✅ 基本的な依存関係のインストール
- ✅ シンプルなリンター実行（標準的な場合）
- ✅ 基本的なテスト実行
- ✅ 標準的なビルドコマンド

---
name: update-implementation-plan
description: '新機能、既存コードのリファクタリング、パッケージのアップグレード、設計、アーキテクチャ、インフラストラクチャに関する新規または更新要件を反映して、既存の実装計画ファイルを更新する。'
---
# 実装計画を更新

## 基本指示

あなたは、新規または更新された要件に基づいて実装計画ファイル `${file}` を更新する AI エージェントである。出力は、他の AI システムまたは人間が自律的に実行できるよう、機械可読で決定的かつ構造化されていなければならない。

## 実行コンテキスト

このプロンプトは AI 間の通信と自動処理のために設計されている。すべての指示は、人間による解釈や確認なしに、字義どおり体系的に実行しなければならない。

## 中核要件

- AI エージェントまたは人間が完全に実行できる実装計画を生成する。
- 曖昧さのない決定的な言語を使う。
- すべての内容を自動解析・実行できるよう構造化する。
- 理解に外部依存が生じない、完全に自己完結した内容にする。

## 計画構造の要件

計画は、実行可能なタスクを含む個別のアトミックなフェーズで構成する。明示的に宣言した場合を除き、各フェーズはフェーズ間の依存関係なしに AI エージェントまたは人間が独立して処理できなければならない。

## フェーズの構成

- 各フェーズに測定可能な完了基準を設ける。
- 依存関係を指定しない限り、フェーズ内のタスクは並列実行できなければならない。
- すべてのタスクの説明に、具体的なファイルパス、関数名、正確な実装詳細を含める。
- 人間による解釈や意思決定を必要とするタスクを作らない。

## AI 向け実装標準

- 解釈を必要としない、明示的で曖昧さのない言語を使う。
- すべての内容を機械解析可能な形式（表、リスト、構造化データ）にする。
- 該当する場合は具体的なファイルパス、行番号、正確なコード参照を含める。
- すべての変数、定数、構成値を明示的に定義する。
- 各タスクの説明に完全なコンテキストを含める。
- すべての識別子に標準化された接頭辞（REQ-、TASK- など）を使う。
- 自動検証できる検証基準を含める。

## 出力ファイルの仕様

- 実装計画ファイルを `/plan/` ディレクトリに保存する。
- 命名規則は `[purpose]-[component]-[version].md` とする。
- 目的の接頭辞は `upgrade|refactor|feature|data|infrastructure|process|architecture|design` とする。
- 例: `upgrade-system-command-4.md`、`feature-auth-module-1.md`
- ファイルは、正しい front matter 構造を持つ有効な Markdown でなければならない。

## 必須テンプレート構造

すべての実装計画は、次のテンプレートに厳密に従う。各セクションは必須であり、具体的で実行可能な内容を記載する。AI エージェントは実行前にテンプレートへの準拠を検証しなければならない。

## テンプレート検証規則

- front matter のすべてのフィールドが存在し、正しく書式設定されていること。
- すべてのセクション見出しが完全一致（大文字と小文字を区別）していること。
- すべての識別子の接頭辞が指定形式に従っていること。
- 表に必要な列がすべて含まれていること。
- 最終出力にプレースホルダーの文章を残さないこと。

## 状態

実装計画の状態は front matter で明確に定義し、計画の現在の状態を反映しなければならない。状態には、次のいずれか（括弧内は status_color）を使う: `Completed`（明るい緑のバッジ）、`In progress`（黄色のバッジ）、`Planned`（青いバッジ）、`Deprecated`（赤いバッジ）、`On Hold`（オレンジのバッジ）。導入セクションにもバッジとして表示する。

```md
---
goal: [Concise Title Describing the Package Implementation Plan's Goal]
version: [Optional: e.g., 1.0, Date]
date_created: [YYYY-MM-DD]
last_updated: [Optional: YYYY-MM-DD]
owner: [Optional: Team/Individual responsible for this spec]
status: 'Completed'|'In progress'|'Planned'|'Deprecated'|'On Hold'
tags: [Optional: List of relevant tags or categories, e.g., `feature`, `upgrade`, `chore`, `architecture`, `migration`, `bug` etc]
---

# Introduction

![Status: <status>](https://img.shields.io/badge/status-<status>-<status_color>)

[A short concise introduction to the plan and the goal it is intended to achieve.]

## 1. Requirements & Constraints

[Explicitly list all requirements & constraints that affect the plan and constrain how it is implemented. Use bullet points or tables for clarity.]

- **REQ-001**: Requirement 1
- **SEC-001**: Security Requirement 1
- **[3 LETTERS]-001**: Other Requirement 1
- **CON-001**: Constraint 1
- **GUD-001**: Guideline 1
- **PAT-001**: Pattern to follow 1

## 2. Implementation Steps

### Implementation Phase 1

- GOAL-001: [Describe the goal of this phase, e.g., "Implement feature X", "Refactor module Y", etc.]

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Description of task 1 | ✅ | 2025-04-25 |
| TASK-002 | Description of task 2 | |  |
| TASK-003 | Description of task 3 | |  |

### Implementation Phase 2

- GOAL-002: [Describe the goal of this phase, e.g., "Implement feature X", "Refactor module Y", etc.]

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-004 | Description of task 4 | |  |
| TASK-005 | Description of task 5 | |  |
| TASK-006 | Description of task 6 | |  |

## 3. Alternatives

[A bullet point list of any alternative approaches that were considered and why they were not chosen. This helps to provide context and rationale for the chosen approach.]

- **ALT-001**: Alternative approach 1
- **ALT-002**: Alternative approach 2

## 4. Dependencies

[List any dependencies that need to be addressed, such as libraries, frameworks, or other components that the plan relies on.]

- **DEP-001**: Dependency 1
- **DEP-002**: Dependency 2

## 5. Files

[List the files that will be affected by the feature or refactoring task.]

- **FILE-001**: Description of file 1
- **FILE-002**: Description of file 2

## 6. Testing

[List the tests that need to be implemented to verify the feature or refactoring task.]

- **TEST-001**: Description of test 1
- **TEST-002**: Description of test 2

## 7. Risks & Assumptions

[List any risks or assumptions related to the implementation of the plan.]

- **RISK-001**: Risk 1
- **ASSUMPTION-001**: Assumption 1

## 8. Related Specifications / Further Reading

[Link to related spec 1]
[Link to relevant external documentation]
```

---
name: create-implementation-plan
description: '新機能、既存コードのリファクタリング、パッケージ更新、設計、アーキテクチャ、インフラストラクチャのための新しい実装計画ファイルを作成する。'
---

# 実装計画の作成

## 主要指示

`${input:PlanPurpose}` の新しい実装計画ファイルを作成する。出力は機械可読かつ決定的で、他のAIシステムまたは人が自律的に実行できる構造にする。

## 実行コンテキスト

このプロンプトはAI間の通信と自動処理向けに設計されている。すべての指示を文字どおりに解釈し、人による解釈や確認を必要とせず体系的に実行する。

## 中核要件

- AIエージェントまたは人が完全に実行できる実装計画を生成する
- 曖昧さのない決定的な言葉を使う
- すべての内容を自動解析と実行に適した構造にする
- 理解のために外部依存を必要としない、完全に自己完結した内容にする

## 計画構造の要件

計画は、実行可能なタスクを含む独立した最小単位のフェーズで構成する。明示的に宣言しない限り、各フェーズは他のフェーズに依存せずAIエージェントまたは人が単独で処理できるようにする。

## フェーズ構成

- 各フェーズに測定可能な完了条件を設ける
- 依存関係が指定されていない限り、フェーズ内のタスクは並列実行できるようにする
- すべてのタスク説明に、具体的なファイルパス、関数名、正確な実装詳細を含める
- 人による解釈や意思決定を必要とするタスクを作らない

## AI向けに最適化した実装標準

- 解釈を必要としない、明示的で曖昧さのない言葉を使う
- すべての内容を機械解析可能な形式（表、リスト、構造化データ）にする
- 該当する場合は、具体的なファイルパス、行番号、正確なコード参照を含める
- すべての変数、定数、構成値を明示的に定義する
- 各タスク説明に完全なコンテキストを含める
- すべての識別子に標準化された接頭辞（REQ-、TASK-など）を使う
- 自動検証可能な検証条件を含める

## 出力ファイル仕様

- 実装計画ファイルは `/plan/` ディレクトリに保存する
- 命名規則は `[purpose]-[component]-[version].md` とする
- 目的の接頭辞: `upgrade|refactor|feature|data|infrastructure|process|architecture|design`
- 例: `upgrade-system-command-4.md`、`feature-auth-module-1.md`
- ファイルは適切なfront matter構造を持つ有効なMarkdownにする

## 必須テンプレート構造

すべての実装計画は次のテンプレートへ厳密に従う。各セクションは必須であり、具体的で実行可能な内容を記入する。AIエージェントは実行前にテンプレートへの準拠を検証する。

## テンプレート検証規則

- すべてのfront matterフィールドを含め、適切に書式設定する
- すべてのセクション見出しを大文字と小文字も含めて正確に一致させる
- すべての識別子接頭辞を指定形式に従わせる
- 表に必須列をすべて含める
- 最終出力にプレースホルダーテキストを残さない
- **識別子は一意に宣言する。** 各識別子（`REQ-NNN`、`SEC-NNN`、`CON-NNN`、`GUD-NNN`、`PAT-NNN`、`GOAL-NNN`、`TASK-NNN`、`ALT-NNN`、`DEP-NNN`、`FILE-NNN`、`TEST-NNN`、`RISK-NNN`、`ASSUMPTION-NNN`）は**正確に1回だけ宣言**する。宣言とは、TASK/GOAL表の先頭セルや `- **REQ-001**: ...` のような箇条書きの太字接頭辞で、識別子が行を導入する箇所を指す。同じ識別子は、その後計画内の別の場所で**参照**として何度使ってもよい。参照は想定されており、衝突ではない。

## 識別子の一意性確認

計画を確定する前に次の確認を実行する。確認（1）と（2）は宣言を対象とし、結果が0行でなければならない。確認（3）は情報収集用の広範な走査で、有効な参照も表示するため、ゲートではなく状況把握に使う。

```bash
# Set PLAN_FILE to the plan being validated.
PLAN_FILE="/plan/<purpose>-<component>-<version>.md"

# 1) Duplicate TASK / GOAL declarations in table rows.
grep -oE '\| (TASK|GOAL)-[0-9]+ \|' "$PLAN_FILE" \
  | sed -E 's/.*((TASK|GOAL)-[0-9]+).*/\1/' \
  | sort | uniq -d

# 2) Duplicate declaration IDs in bullet-style spec lines.
grep -oE '^- \*\*(REQ|SEC|CON|GUD|RISK|ASSUMPTION|TASK|GOAL|FILE|TEST|PAT|ALT|DEP)-[0-9]+\*\*:' "$PLAN_FILE" \
  | sed -E 's/^- \*\*([A-Z]+-[0-9]+)\*\*:.*/\1/' \
  | sort | uniq -d

# 3) Broad duplicate scan (diagnostic only; may include valid references).
grep -oE '(REQ|SEC|CON|GUD|RISK|ASSUMPTION|TASK|GOAL|FILE|TEST|PAT|ALT|DEP)-[0-9]+' "$PLAN_FILE" \
  | sort | uniq -d
```

前提条件: `grep`、`sed`、`sort`、`uniq` を備えたPOSIX互換シェル（`sh` / `bash`）。これらのツールがないWindowsでは、同じ宣言と参照の判定ロジックを保つ同等のプラットフォーム固有コマンドを使う。

確認（1）または（2）が行を返した場合は、各識別子が正確に1回だけ宣言されるよう重複を採番し直し、両方が空になるまで再実行する。

## ステータス

実装計画のステータスをfront matterで明確に定義し、計画の現在状態を反映する。ステータスは次のいずれかとする（括弧内はstatus_color）: `Completed`（明るい緑のバッジ）、`In progress`（黄色のバッジ）、`Planned`（青のバッジ）、`Deprecated`（赤のバッジ）、`On Hold`（オレンジのバッジ）。導入セクションにもバッジとして表示する。

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

---
name: create-technical-spike
description: '実装前に重要な開発上の意思決定を調査して解決するため、期間を限定した技術スパイク文書を作成する。'
---

# 技術スパイク文書の作成

開発を進める前に回答すべき重要な問いを調査するため、期間を限定した技術スパイク文書を作成する。各スパイクでは、明確な成果物と期限を持つ特定の技術的意思決定に焦点を当てる。

## 文書構造

`${input:FolderPath|docs/spikes}` ディレクトリに個別ファイルを作成する。各ファイルは `[category]-[short-description]-spike.md` の形式で命名する（例: `api-copilot-integration-spike.md`、`performance-realtime-audio-spike.md`）。

```md
---
title: "${input:SpikeTitle}"
category: "${input:Category|Technical}"
status: "🔴 Not Started"
priority: "${input:Priority|High}"
timebox: "${input:Timebox|1 week}"
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
owner: "${input:Owner}"
tags: ["technical-spike", "${input:Category|technical}", "research"]
---

# ${input:SpikeTitle}

## Summary

**Spike Objective:** [Clear, specific question or decision that needs resolution]

**Why This Matters:** [Impact on development/architecture decisions]

**Timebox:** [How much time allocated to this spike]

**Decision Deadline:** [When this must be resolved to avoid blocking development]

## Research Question(s)

**Primary Question:** [Main technical question that needs answering]

**Secondary Questions:**

- [Related question 1]
- [Related question 2]
- [Related question 3]

## Investigation Plan

### Research Tasks

- [ ] [Specific research task 1]
- [ ] [Specific research task 2]
- [ ] [Specific research task 3]
- [ ] [Create proof of concept/prototype]
- [ ] [Document findings and recommendations]

### Success Criteria

**This spike is complete when:**

- [ ] [Specific criteria 1]
- [ ] [Specific criteria 2]
- [ ] [Clear recommendation documented]
- [ ] [Proof of concept completed (if applicable)]

## Technical Context

**Related Components:** [List system components affected by this decision]

**Dependencies:** [What other spikes or decisions depend on resolving this]

**Constraints:** [Known limitations or requirements that affect the solution]

## Research Findings

### Investigation Results

[Document research findings, test results, and evidence gathered]

### Prototype/Testing Notes

[Results from any prototypes, spikes, or technical experiments]

### External Resources

- [Link to relevant documentation]
- [Link to API references]
- [Link to community discussions]
- [Link to examples/tutorials]

## Decision

### Recommendation

[Clear recommendation based on research findings]

### Rationale

[Why this approach was chosen over alternatives]

### Implementation Notes

[Key considerations for implementation]

### Follow-up Actions

- [ ] [Action item 1]
- [ ] [Action item 2]
- [ ] [Update architecture documents]
- [ ] [Create implementation tasks]

## Status History

| Date   | Status         | Notes                      |
| ------ | -------------- | -------------------------- |
| [Date] | 🔴 Not Started | Spike created and scoped   |
| [Date] | 🟡 In Progress | Research commenced         |
| [Date] | 🟢 Complete    | [Resolution summary]       |

---

_Last updated: [Date] by [Name]_
```

## 技術スパイクのカテゴリ

### API統合

- サードパーティAPIの機能と制限
- 統合パターンと認証
- レート制限と性能特性

### アーキテクチャと設計

- システムアーキテクチャの意思決定
- デザインパターンの適用可能性
- コンポーネント間の連携モデル

### 性能とスケーラビリティ

- 性能要件と制約
- スケーラビリティのボトルネックと解決策
- リソース利用パターン

### プラットフォームとインフラストラクチャ

- プラットフォームの機能と制限
- インフラストラクチャ要件
- デプロイとホスティングに関する考慮事項

### セキュリティとコンプライアンス

- セキュリティ要件と実装
- コンプライアンス上の制約
- 認証と認可の方式

### ユーザー体験

- ユーザー操作のパターン
- アクセシビリティ要件
- インターフェイス設計の意思決定

## ファイル命名規則

カテゴリと具体的な未解決事項を示す、説明的なkebab-case名を使う。

**API/統合の例:**

- `api-copilot-chat-integration-spike.md`
- `api-azure-speech-realtime-spike.md`
- `api-vscode-extension-capabilities-spike.md`

**性能の例:**

- `performance-audio-processing-latency-spike.md`
- `performance-extension-host-limitations-spike.md`
- `performance-webrtc-reliability-spike.md`

**アーキテクチャの例:**

- `architecture-voice-pipeline-design-spike.md`
- `architecture-state-management-spike.md`
- `architecture-error-handling-strategy-spike.md`

## AIエージェントのベストプラクティス

1. **1スパイクにつき1つの問い:** 各文書では単一の技術的意思決定または調査課題に焦点を当てる

2. **期間を限定した調査:** 各スパイクに具体的な時間制限と成果物を定義する

3. **根拠に基づく意思決定:** 完了とする前に、テスト、プロトタイプ、文書などの具体的な根拠を求める

4. **明確な推奨事項:** 具体的な推奨事項と実装理由を記録する

5. **依存関係の追跡:** スパイク同士の関係とプロジェクトの意思決定への影響を特定する

6. **成果重視:** 各スパイクから実行可能な意思決定または推奨事項を導く

## 調査戦略

### フェーズ1: 情報収集

1. search/fetchツールで**既存文書を検索する**
2. 既存のパターンと制約について**コードベースを分析する**
3. API、ライブラリ、例などの**外部リソースを調査する**

### フェーズ2: 検証とテスト

1. 特定の仮説を検証するための**焦点を絞ったプロトタイプを作成する**
2. 仮定を検証するための**対象を限定した実験を実行する**
3. 裏付けとなる証拠とともに**テスト結果を記録する**

### フェーズ3: 意思決定と文書化

1. 調査結果を明確な推奨事項へ**統合する**
2. 開発チーム向けの**実装指針を記録する**
3. 実装のための**後続タスクを作成する**

## ツールの使用

- **search/searchResults:** 既存の解決策と文書を調査する
- **fetch/githubRepo:** 外部API、ライブラリ、例を分析する
- **codebase:** 既存システムの制約とパターンを理解する
- **runTasks:** プロトタイプと検証テストを実行する
- **editFiles:** 調査の進捗と結果を更新する
- **vscodeAPI:** VS Code拡張機能の機能と制限をテストする

重要な技術的意思決定を解決し、開発の進行を妨げる要因を取り除く、期間限定の調査に集中する。

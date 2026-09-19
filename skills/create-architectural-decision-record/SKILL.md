---
name: create-architectural-decision-record
description: 'AIによる利用に最適化した意思決定文書として、Architecture Decision Record（ADR）を作成する。'
---

# Architecture Decision Recordの作成

AIが利用しやすく、人にも読みやすい構造化形式で、`${input:DecisionTitle}` のADR文書を作成する。

## 入力

- **背景**: `${input:Context}`
- **決定**: `${input:Decision}`
- **代替案**: `${input:Alternatives}`
- **ステークホルダー**: `${input:Stakeholders}`

## 入力の検証
必須入力が提供されていない、または会話履歴から判断できない場合は、ADRの生成へ進む前に、不足情報をユーザーへ確認する。

## 要件

- 正確で曖昧さのない言葉を使う
- front matterを含む標準化されたADR形式に従う
- 肯定的影響と否定的影響の両方を含める
- 代替案と却下理由を記録する
- 機械解析と人による参照の両方に適した構造にする
- 複数項目のセクションでは、コード付き箇条書き（3～4文字のコードと3桁の数字）を使う

ADRは `/docs/adr/` ディレクトリへ保存し、`adr-NNNN-[title-slug].md` の命名規則を使う。NNNNには次の連番となる4桁の数字を入れる（例: `adr-0001-database-selection.md`）。

## 必須の文書構造

文書ファイルは次のテンプレートに従い、すべてのセクションを適切に記入する。Markdownのfront matterは、次の例どおり正しく構造化する。

```md
---
title: "ADR-NNNN: [Decision Title]"
status: "Proposed"
date: "YYYY-MM-DD"
authors: "[Stakeholder Names/Roles]"
tags: ["architecture", "decision"]
supersedes: ""
superseded_by: ""
---

# ADR-NNNN: [Decision Title]

## Status

**Proposed** | Accepted | Rejected | Superseded | Deprecated

## Context

[Problem statement, technical constraints, business requirements, and environmental factors requiring this decision.]

## Decision

[Chosen solution with clear rationale for selection.]

## Consequences

### Positive

- **POS-001**: [Beneficial outcomes and advantages]
- **POS-002**: [Performance, maintainability, scalability improvements]
- **POS-003**: [Alignment with architectural principles]

### Negative

- **NEG-001**: [Trade-offs, limitations, drawbacks]
- **NEG-002**: [Technical debt or complexity introduced]
- **NEG-003**: [Risks and future challenges]

## Alternatives Considered

### [Alternative 1 Name]

- **ALT-001**: **Description**: [Brief technical description]
- **ALT-002**: **Rejection Reason**: [Why this option was not selected]

### [Alternative 2 Name]

- **ALT-003**: **Description**: [Brief technical description]
- **ALT-004**: **Rejection Reason**: [Why this option was not selected]

## Implementation Notes

- **IMP-001**: [Key implementation considerations]
- **IMP-002**: [Migration or rollout strategy if applicable]
- **IMP-003**: [Monitoring and success criteria]

## References

- **REF-001**: [Related ADRs]
- **REF-002**: [External documentation]
- **REF-003**: [Standards or frameworks referenced]
```

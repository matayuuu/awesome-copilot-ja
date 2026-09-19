---
name: meeting-minutes
description: '社内会議向けに、メタデータ、出席者、議題、決定事項、担当者と期限付きのアクション項目、フォローアップを含む簡潔で実行可能な議事録を作成する。'
---

# 議事録Skill — 短時間の社内会議

## 目的と概要

このSkillは、60分以内の社内会議について、高品質で一貫した議事録を作成する。出力は明確で実行可能であり、タスクトラッカー（GitHub Issues、Jiraなど）へ変換しやすいようにする。生成する議事録では決定事項とアクション項目を優先し、チームが議論から実行へ素早く移れるようにする。

## 使用する場合

次のような場合にこのSkillを使う:

- 短時間の社内同期、スタンドアップ、設計レビュー、トリアージ、計画、アドホック会議
- 決定事項、割り当て済みアクション項目、フォローアップの簡潔な記録が必要な場合
- 会議、文字起こし、録音、メモから標準化された議事録を作成する場合

---

## 運用ワークフロー

### フェーズ1：受付（草稿前）

- 会議メタデータ（タイトル、日付、開始／終了時刻または所要時間、主催者、対象読者）を取得する。
- 利用できる入力（議題、スライド、録音、文字起こし、未整理のメモ）を確認する。
- 重要な情報が不足している場合は、議事録を作成する前に最大3つの確認質問をする（下記の「確認」を参照）。

### フェーズ2：記録（会議中または直後）

- 出席者と欠席者を記録する。
- 可能であれば時刻情報付きで、議題ごとの簡潔なメモを記録する。
- 明示された決定事項、理由の要約（1～2文）、アクション項目（担当者＋期限）を記録する。

### フェーズ3：草稿作成

- 下記の**厳格な議事録スキーマ**に従って議事録を生成する。
- すべてのアクション項目に担当者、期限（または期間）、該当する場合は受け入れ基準を含める。
- 未解決の問題やフォローアップが必要な項目を保留事項に記録する。

### フェーズ4：レビューと公開

- 可能であれば、会議主催者または指定レビュアーへ24時間以内に草稿を送り、簡単な確認を受ける。
- 合意した共有先（共有ドライブ、リポジトリ、チケット、メール）へ最終議事録を公開し、必要に応じてチームのトラッカーにタスクを作成する。

---

## 確認（必須の確認質問）

議事録を生成する前に、次のいずれかが不足している場合、エージェントは最大3つの確認質問を**必ず**行う:

- 会議のタイトル、日付、開始時刻（または所要時間）、主催者は何か。
- 参照できる議題、文字起こし、録音はあるか。あれば提供する。
- 議事録のレビュアーまたは承認者には誰を割り当てるか。

If the user responds "no transcript" or "no agenda," proceed but mark source material as "ad-hoc notes" and flag potential gaps.

---

## 厳格な議事録スキーマ（出力構造）

この厳密な構造に従って議事録を**必ず**作成する。情報がない場合は `TBD` または `Unknown` を使い、取得方法を説明する。

### 1. メタデータ

- **Title**:
- **Date (YYYY-MM-DD)**:
- **Start Time (UTC)**:
- **End Time (UTC) or Duration**:
- **Organizer**:
- **Location / Virtual Link**:
- **Minutes Author** (agent or person):
- **Distribution List** (who receives the minutes):

### 2. 出席状況

- **Present**: [list of names + roles]
- **Regrets / Absent**: [list]
- **Notetaker / Recorder**: [name or "agent"]

### 3. 議題

議題項目を順番に箇条書きする:

- Item 1: short title
- Item 2: short title
- ...

### 4. 概要

会議の目的と大まかな結果を1段落（1～3文）で簡潔にまとめる。

### 5. 決定事項

それぞれを個別の箇条書きにする:

- **Decision 1**: statement of decision.
  - Who decided / approved: [name(s) or group]
  - Rationale (1–2 sentences): brief reason.
  - Effective date (if applicable): YYYY-MM-DD
- **Decision 2**: ...

### 6. アクション項目

表形式の箇条書きとし、**担当者と期限を必ず含める**:

- **[ID] Action**: short description
  - **Owner**: Name (team)
  - **Due**: YYYY-MM-DD or "ASAP" / timeframe
  - **Acceptance Criteria**: (what completes this action)
  - **Linked artifacts / tickets**: (optional URL or ticket id)

**Example:**

- [A1] Draft deployment runbook for feature X
  - Owner: Alex (Engineering)
  - Due: 2026-02-05
  - Acceptance Criteria: runbook includes steps for rollback, health checks, and monitoring links
  - Linked artifacts: https://github.com/owner/repo/issues/123

### 7. 議題ごとのメモ

簡潔かつ事実に基づいて記載し、時刻は任意とする:

- **Agenda Item 1**: title
  - Key points:
    - Point A (timestamp 00:05)
    - Point B (timestamp 00:12)
  - Open issues / questions:
    - Q1: question text (owner if assigned)
- **Agenda Item 2**: ...

### 8. 保留／未解決項目

- **Item**: short description
  - Why parked / next step:
  - Suggested owner or next meeting to resolve

### 9. リスク／ブロッカー（ある場合）

- **Risk 1**: short description, impact, mitigation owner
- **Risk 2**: ...

### 10. 次回会議／フォローアップ

- Proposed date/time (if any)
- Objectives for next meeting

### 11. 添付資料／参照

- Agenda document: URL
- Slides: URL
- Transcript / Recording: URL
- Related tickets: list of URLs or IDs

### 12. バージョンと変更履歴

- **Version**: 1.0
- **Last updated**: YYYY-MM-DDTHH:MM:SSZ
- **Changes**: short notes on edits and who made them

---

## スタイルと品質規則

- 議事録は簡潔にする。通常、30分以内の会議はA4 1ページ未満、60分に近い会議は2ページ未満を目安とする。
- 読みやすさのため、平易な言葉と箇条書きを使う。
- 文書の先頭で決定事項とアクション項目を優先する。
- 推測や未検証の主張を含めない。不確かな場合は `TBD` と記し、不足している情報源を示す。
- 時刻とISO 8601日付（YYYY-MM-DDまたは完全なUTCタイムスタンプ）を一貫して使う。

---

## 推奨事項と禁止事項

**実施すること:**

- Include owner and due date for every action item.
- Provide acceptance criteria for action items when possible.
- Link to artifacts (tickets, slides, recordings) for traceability.
- Send draft for quick review if minutes contain significant decisions.

**避けること:**

- Omit decisions or action items — these are the primary value of minutes.
- Mix personal opinions with facts. Keep commentary clearly marked as "Opinion" or exclude it.
- Publish raw PII gathered during discussion unless required and authorized.

---

## 例示プロンプト（Copilot / Agent向け）

**文字起こしから議事録を生成するPrompt:**

> "Generate meeting minutes from the following meeting transcript. Meeting title: 'Platform Weekly Sync'. Date: 2026-02-10. Duration: 45 minutes. Organizer: Priya (Platform Lead). Transcript: <paste transcript>. Follow the Strict Minutes Schema. Highlight decisions and create action items with owners and due dates where implied."

**メモから議事録を生成するPrompt:**

> "I have raw notes from a 30-minute design review. Title: 'Feature Y Design Review'. Date: 2026-02-11. Notes: <paste notes>. Produce concise minutes following the Strict Minutes Schema. Ask up to 3 clarifying questions if critical fields are missing."

---

## クイックテンプレート（コピー用）

### 簡潔な議事録テンプレート（短縮版）:

```
- Title:
- Date:
- Organizer:
- Present:
- Summary:
- Decisions:
  - Decision 1 — Who — Effective:
- Action Items:
  - [A1] Action — Owner — Due — Acceptance Criteria
- Next Steps / Next Meeting:
```

### 詳細な議事録テンプレート（完全スキーマ）:

上記の厳格な議事録スキーマを使う。

---

## 生成議事録の検証と受け入れ基準

生成された議事録は、次を満たす場合に受け入れ可能とする:

- メタデータ、出席状況、決定事項、アクション項目の各セクションを含む。
- すべてのアクション項目に担当者と期限または明確な期間が割り当てられている。
- 重要な決定事項が少なくとも1行の理由付きで記録されている。
- 添付資料または参照が列挙されるか、明示的に `None` と記載されている。
- 文書が事実に基づき、不確かな項目に `TBD` のラベルが付いている。

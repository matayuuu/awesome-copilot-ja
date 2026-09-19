---
name: incident-postmortem
description: '障害、本番インシデント、重大なサービス劣化が発生し、チームが構造化された非難のないポストモーテムを書く必要があるときに使う。「write a post-mortem」「incident review」「what went wrong」「outage report」「root cause analysis」「RCA」などで起動し、タイムライン再構成、要因分析、影響定量化、担当者付きアクション項目作成を扱う。'
---

# インシデント・ポストモーテム

本番インシデント後に、構造化された非難のないポストモーテムを書くようチームを導く。出力文書は共通認識を形成し、非難せずに根本原因を特定し、再発防止の具体的なアクション項目を作成する。

## 非難しない原則

失敗するのは人ではなくシステムである。目的はインシデントがどのように起きたかを理解することであり、誰が起こしたかではない。「Xが忘れた」「Yは知っているべきだった」のような表現を避け、「システムが実行しなかった」「プロセスに欠落があった」「アラートが発火しなかった」と表現する。

## 使用する場面

- 本番障害またはサービス劣化が解消した
- 重大なニアミスが発生した（後で発見されていればインシデントになっていた）
- ユーザー向けエラー、データ損失、SLA違反が発生した
- 文脈が失われる前にチームが学びを記録したい

**対象外:** ステージングで発見した軽微なバグ、計画済みメンテナンス、学びがないインシデント。

## 入力要件

ポストモーテムを書く前に次の情報を集める。不足があれば確認する。

### インシデントメタデータ
- インシデントのタイトル（短く説明的に）
- 検知日時（タイムゾーン付き）
- 解決日時
- 重大度 / 影響レベル（P1–P4または同等）
- インシデントコマンダー / オンコール担当者

### 影響
- 影響を受けたサービスとシステム
- ユーザー向けの影響（エラー、遅延、全面停止）
- 影響を受けたユーザー数の推定
- データ損失または破損（有無、範囲）
- SLA/SLO違反（有無、違反量）

### タイムラインイベント
再構成する重要な時点:
- 最初の症状が発生した
- アラートが発火した（または手動で気付いた）
- オンコールが呼び出された / インシデントが宣言された
- 調査が開始された
- 根本原因が特定された
- 緩和策が適用された
- 完全な解決が確認された
- 顧客への連絡が送られた（ある場合）

### 寄与要因
チームには「必要以上に悪化させたものは何か」と尋ね、「誰が失敗したか」とは聞かない。例:
- アラートしきい値が高すぎた / アラートが発火しなかった
- ランブックがなかった、または古かった
- デプロイにロールバック用の機能フラグがなかった
- 監視がこの障害モードをカバーしていなかった
- オンコール引き継ぎで文脈が失われた

## プロセス

### 手順1 — メタデータを集める
ユーザーがインシデントの詳細をすべて提供していない場合は、セクションごとに確認する。タイトル、時刻、重大度、影響を受けたサービス、少なくとも大まかなタイムラインが揃うまで執筆に進まない。

### 手順2 — タイムラインを再構成する
ユーザーと協力して、正確な時系列を作る。各イベントについて次を記録する。
- 正確な時刻（UTCを推奨）
- 何が起きたか（システムイベントまたは人の操作）
- 誰が観測または操作したか
- 可能ならログ / アラート / Slackメッセージへのリンク

空白を明示する。「14:32から14:47の間に何が起きたか分からない。ログを確認する価値がある」。

### 手順3 — 根本原因分析
**5 Whys**を反復して使う。

```
Why did users see 500 errors?
→ The API pods were crash-looping.

Why were they crash-looping?
→ Memory limit was exceeded.

Why was the limit exceeded?
→ A new query was loading full result sets into memory.

Why wasn't this caught before deploy?
→ Load tests only covered the p50 case, not high-cardinality accounts.

Why did load tests only cover p50?
→ We had no test fixtures for large accounts.
```

修正可能なシステムまたはプロセスの欠落に到達したら止める。最後の「なぜ」はアクション項目につながるべきである。

区別する。
- **根本原因** — 最も深いシステム上の欠落（1つまたは2つ）
- **寄与要因** — 事態を悪化させたが根本原因ではない条件

### 手順4 — 影響を定量化する
ユーザーが正確に記述できるよう支援する。
- 継続時間: 検知から解決まで（症状開始から解決までとは分ける）
- ピーク時と通常時のエラー率
- 影響を受けたトラフィックの割合
- 分かる場合は売上 / ビジネスへの影響

### 手順5 — アクション項目
各根本原因と寄与要因について、少なくとも1つのアクション項目を作成する。

| # | アクション | 担当者 | 期限 | 優先度 |
|---|--------|-------|----------|----------|
| 1 | 10,000件超のアカウント用ロードテストフィクスチャを追加 | @eng-team | 2026-07-01 | 高 |
| 2 | メモリのアラートしきい値を90%から75%へ下げる | @platform | 2026-06-23 | 高 |
| 3 | メモリOOM Pod用のランブックを追加 | @on-call-rotation | 2026-06-30 | 中 |

アクション項目には担当者（チームではなく個人）と期限を必ず付ける。「監視を改善する」のような曖昧なアクションは認めず、具体的な成果物に分解する。

### 手順6 — 文書を書く
以下のテンプレートを使って完全なポストモーテムを作成する。`docs/postmortems/YYYY-MM-DD-<slug>.md` に保存する。

## Output Template

```markdown
# Post-Mortem: [Incident Title]

**Date:** YYYY-MM-DD  
**Severity:** P[1-4]  
**Duration:** X hours Y minutes (HH:MM UTC – HH:MM UTC)  
**Incident Commander:** @name  
**Status:** Resolved

---

## Summary

[2–3 sentences. What happened, what was the user impact, how was it resolved. Written for someone who wasn't involved.]

## Impact

| Dimension | Value |
|-----------|-------|
| Affected services | [list] |
| User-facing impact | [errors / degraded / full outage] |
| Users affected | [estimated number or %] |
| Peak error rate | [X% vs Y% baseline] |
| Data loss | [none / describe scope] |
| SLA breach | [yes/no — by how much] |

## Timeline

All times UTC.

| Time | Event |
|------|-------|
| HH:MM | [First symptom / alert fired] |
| HH:MM | [On-call paged] |
| HH:MM | [Incident declared] |
| HH:MM | [Root cause identified] |
| HH:MM | [Mitigation applied] |
| HH:MM | [Full resolution confirmed] |
| HH:MM | [Customer communication sent] |

## Root Cause

[1–2 paragraphs. The deepest systemic gap that, if fixed, would have prevented the incident. Written in blameless language. Reference the 5 Whys chain if helpful.]

## Contributing Factors

- [Factor 1 — condition that made the incident worse]
- [Factor 2]
- [Factor 3]

## What Went Well

- [Thing that worked — good alert, fast response, clear runbook]
- [Another positive]

## What Could Have Gone Better

- [Gap in process, tooling, or coverage — no blame language]
- [Another gap]

## Action Items

| # | Action | Owner | Due Date | Priority |
|---|--------|-------|----------|----------|
| 1 | [Specific deliverable] | @person | YYYY-MM-DD | High/Medium/Low |
| 2 | | | | |

## Lessons Learned

[Optional. 2–4 bullet points capturing non-obvious insights worth sharing with the broader team.]
```

## よくある誤り

| 誤り | 改善 |
|---------|-----|
| 「Bobが設定の確認を忘れた」 | 「デプロイチェックリストに設定検証が含まれていなかった」 |
| 根本原因が「ヒューマンエラー」 | なぜを問い続ける。ヒューマンエラーは常に症状である |
| 担当者のないアクション項目 | すべての項目にチームではなく個人名を付ける |
| 記憶から再構成したタイムライン | 執筆前にログ、アラート、Slack、PagerDutyを確認する |
| アクションとして「監視を改善する」 | 対象サービス、メトリクス、しきい値、期限を明示する |
| 数週間後に書かれたポストモーテム | 文脈が新鮮な48～72時間以内に書く |

---
name: ad-campaign-analyzer
description: '広告キャンペーンの実績データが共有され、何を削減、拡大、テストすべきか尋ねられたときに使う。「広告キャンペーンを分析して」「広告費をどこで無駄にしているか」「広告予算を再配分して」「実際に効いている広告はどれか」「ROAS分析」などが対象。実績データを伴わないキャンペーン計画やクリエイティブ生成では起動しない。'
license: MIT
compatibility: 'クロスプラットフォーム。Google、Meta、LinkedInから提供されたキャンペーン書き出し（CSV、貼り付け、スクリーンショット）を対象とする純粋な推論Skill。外部ツール、ネットワーク呼び出し、APIキーは不要。'
metadata:
  version: "1.0"
  author: GooseWorks
  source: https://github.com/gooseworks-ai/goose-skills
---

# 広告キャンペーン分析

生のキャンペーン実績データを明確な意思決定へ変換する。このSkillは指標を要約するだけでなく、問題を診断し、勝ち筋を特定し、統計的有意性を確認し、次に何を削減、拡大、テストするかを具体的に示す。さらにチャネルを同じ基準で比較し、結果に対して過剰投資または投資不足の箇所を見つけ、具体的な予算再配分計画を作成する。

**基本原則:** 多くのスタートアップ創業者は広告ダッシュボードを確認し、ROASの数字を見て慌てるか喜ぶ。このSkillは有料メディア専門家のように、何が本当に有意で何がノイズか、次の1ドルをどこへ投じるべきかを分析する。さらに配分問題も解決する。多くのスタートアップはチャネルへ予算を薄く広げすぎて学習量を確保できないか、1チャネルへ全額を投じて他の安価な機会を逃している。

## 使う場面

- "Google Adsの実績を分析して"
- "どの広告を止めるべき?"
- "このキャンペーンは機能している?"
- "広告費をどこで無駄にしている?"
- "Meta Adsを最適化して"
- "広告予算をどう分けるべき?"
- "GoogleとMetaのどちらにもっと使うべき?"
- "チャネル横断で広告費を再配分して"
- "どこで最も良いリターンを得ている?"
- "広告に月$X使える。どう配分すべき?"

## フェーズ0: 受付

1. **キャンペーンデータ** — 次のいずれか:
   - Google Ads / Meta Ads Manager / LinkedIn Campaign ManagerからのCSV書き出し
   - 貼り付けられた実績表
   - ダッシュボードのスクリーンショット（データを抽出する）
2. **プラットフォーム** — Google / Meta / LinkedIn / All
3. **期間** — どの日付範囲を対象とするか。
4. **月間予算** — この期間の広告費合計。
5. **主目的** — どのコンバージョンを最適化するか（デモ / トライアル / 購入 / リード）。
6. **目標指標** — 目標CPAまたはROASがあるか（なければベンチマークする）。
7. **既知の変更** — この期間にクリエイティブ、予算、ターゲティングを変更したか。
8. **現在稼働中のチャネル** — Google Ads、Meta Ads、LinkedIn Ads、Twitter/X Ads、TikTok Ads、その他。
9. **ファネルデータ**（利用可能な場合）:
   - Lead → MQL率
   - MQL → SQL率
   - SQL → 成約率
   - 平均取引額
10. **検討中だが未試行のチャネル** — 新しいチャネルをテストしたいか。
11. **制約** — いずれかのチャネルの最低支出額や、継続利用が必須のプラットフォームはあるか。

## フェーズ1: データ取り込みと正規化

### 受け付けるデータ形式

| ソース | 期待される主要列 |
|--------|---------------------|
| **Google Ads** | Campaign, Ad Group, Keyword, Impressions, Clicks, CTR, CPC, Conversions, Conv Rate, Cost, Conv Value |
| **Meta Ads** | Campaign, Ad Set, Ad, Impressions, Reach, Clicks, CTR, CPC, Conversions, Cost Per Result, Amount Spent, ROAS |
| **LinkedIn Ads** | Campaign, Impressions, Clicks, CTR, CPC, Conversions, Cost, Leads |

すべてのデータを標準分析形式へ正規化する:

| ディメンション | インプレッション | クリック | CTR | CPC | コンバージョン | CVR | CPA | 支出 | 収益/価値 |
|-----------|------------|--------|-----|-----|-------------|----------|-----|-------|--------------|

### マルチチャネル正規化

複数チャネルにまたがるデータでは、チャネル単位の集計も作成する:

| Channel | Monthly Spend | Impressions | Clicks | CTR | CPC | Conversions | Conv Rate | CPA | ROAS | CAC* |
|---------|-------------|------------|--------|-----|-----|-------------|----------|-----|------|------|
| Google Search | $[X] | [N] | [N] | [X%] | $[X] | [N] | [X%] | $[X] | [X] | $[X] |
| Google Display | ... | | | | | | | | | |
| Meta (FB/IG) | ... | | | | | | | | | |
| LinkedIn | ... | | | | | | | | | |
| [Other] | ... | | | | | | | | | |
| **Total** | $[X] | | | | | [N] | | $[X] avg | [X] avg | $[X] avg |

*CAC = ファネルデータが提供された場合の完全な顧客獲得コスト（CPA × 成約率調整）

### ファネル調整済みCAC（ファネルデータがある場合）

```
Channel CAC = CPA ÷ (MQL rate × SQL rate × Close rate)
```

これにより、単にコンバージョンするだけでなく、実際に成約するリードを生むチャネルが分かる。

## フェーズ2: 実績診断

### 2A: キャンペーン単位の健全性チェック

各キャンペーンについて:

| 指標 | 値 | ベンチマーク | 状態 |
|--------|-------|-----------|--------|
| CTR | [X%] | [Industry avg] | [Good/Okay/Poor] |
| CPC | $[X] | [Category avg] | [Good/Okay/Poor] |
| Conv Rate | [X%] | [Benchmark] | [Good/Okay/Poor] |
| CPA | $[X] | [Target or benchmark] | [Good/Okay/Poor] |
| ROAS | [X] | [Target or benchmark] | [Good/Okay/Poor] |
| Impression Share | [X%] | [>60% ideal] | [Good/Okay/Poor] |

### 2B: 予算浪費の検出

成果がない、またはマイナスのリターンになった支出を特定する:

| 無駄の種類 | シグナル | アクション |
|-----------|--------|--------|
| **コンバージョンゼロのキーワード/広告** | 支出 > $[X] かつコンバージョン0 | 一時停止または除外を追加 |
| **高CPAの外れ値** | CPA > 目標の3倍 | 一時停止または再構成 |
| **低CTR広告** | CTR < キャンペーン平均の50% | クリエイティブを差し替え |
| **部分一致の漏れ** | 検索語句レポートに無関係なクリックがある | 除外キーワードを追加 |
| **オーディエンス重複** | 同じユーザーに複数キャンペーンが当たっている | オーディエンスを除外 |
| **時間帯配信の無駄** | コンバージョンが特定時間に集中し、支出は24時間発生 | 広告スケジュールを設定 |

### 2C: 勝ち筋の特定

実際に機能しているものを特定する:

| 勝ち筋の種類 | シグナル | アクション |
|------------|--------|--------|
| **高実績キーワード** | 最低CPA、最高CVR | 入札を上げ、バリエーションを追加 |
| **勝ち広告** | CTRとCVRの組み合わせが最高 | 支出を拡大し、他グループへ複製 |
| **最良オーディエンス** | 最低CPAのセグメント | 予算配分を増やす |
| **最良時間帯** | コンバージョンのピーク時間/曜日 | 予算を集中 |

### 2D: 統計的有意性の確認

任意のA/Bテスト（広告バリエーション、オーディエンス、ランディングページ）について:

```
Test: [Variant A] vs [Variant B]
Metric: [Conv Rate / CTR / CPA]
Variant A: [X%] (n=[sample_size])
Variant B: [Y%] (n=[sample_size])
Confidence level: [X%]
Verdict: [Statistically significant / Not enough data / Too close to call]
Recommended action: [Pick winner / Continue test / Increase budget to reach significance]
```

最小サンプル: CTRテストでは各バリエーション100クリック、CPAテストでは各バリエーション30コンバージョン。

## フェーズ3: ファネル分析

### クリック → コンバージョン経路

```
Impressions: [N] (100%)
     ↓ CTR: [X%]
Clicks: [N] ([X%] of impressions)
     ↓ Landing page → Conversion: [X%]
Conversions: [N] ([X%] of clicks)
     ↓ Conversion → Revenue: $[X] avg
Revenue: $[N]
```

### ファネル離脱の診断

| 離脱地点 | 率 | ベンチマーク | 想定原因 | 修正 |
|----------------|------|-----------|-------------|-----|
| Impression → Click | [CTR%] | [Benchmark] | [Ad relevance / targeting] | [Copy/targeting change] |
| Click → Conversion | [Conv%] | [Benchmark] | [Landing page / offer / audience mismatch] | [LP optimization] |
| Conversion → Revenue | [Close%] | [Benchmark] | [Lead quality / sales process] | [Qualification criteria] |

## フェーズ4: 予算再配分

複数チャネルにまたがるデータでは、チャネル横断の予算最適化を行う。

### 4A: チャネル効率ランキング

| 順位 | チャネル | CPA | ファネル調整CAC | 支出シェア | コンバージョンシェア | 効率指数 |
|------|---------|-----|---------------|----------------|---------------------|-----------------|
| 1 | [Channel] | $[X] | $[X] | [X%] | [X%] | [Conv share ÷ Spend share] |

**効率指数:**
- **> 1.0** = 投資不足（支出シェア以上のコンバージョンを得ている）
- **= 1.0** = 比例（妥当なシェア）
- **< 1.0** = 投資過多（支出シェア未満の成果）

### 4B: 限界収益分析

各チャネルについて、追加支出が比例したリターンを生むか推定する:

| チャネル | 現在のCPA | インプレッションシェア / 飽和シグナル | 限界リターン推定 |
|---------|-------------|-------------------------------------|------------------------|
| Google Search | $[X] | [X%] impression share — room to grow | Likely positive |
| Meta | $[X] | Frequency [X] — audience may be saturated | Diminishing |
| LinkedIn | $[X] | Low volume — limited targeting pool | Ceiling soon |

### 4C: ファネル段階のカバレッジ

| Funnel Stage | Channels Covering It | Current Spend | Gap? |
|-------------|---------------------|--------------|------|
| **Awareness** (top) | [Meta Display, YouTube] | $[X] | [Yes/No] |
| **Consideration** (mid) | [Google Search, Meta retargeting] | $[X] | [Yes/No] |
| **意思決定**（下層） | [Google Brand, Google Search] | $[X] | [Yes/No] |
| **Retargeting** | [Meta, Google Display] | $[X] | [Yes/No] |

### 4D: 予算移動の推奨

| チャネル | 現在の支出 | 推奨支出 | 変化 | 理由 |
|---------|-------------|------------------|--------|-----------|
| Google Search | $[X] | $[Y] | +$[Z] | [Lowest CPA, room to scale] |
| Meta | $[X] | $[Y] | -$[Z] | [Audience saturation, frequency too high] |
| LinkedIn | $[X] | $[Y] | $0 | [Maintain — niche but valuable] |
| [New channel] | $0 | $[Y] | +$[Y] | [Test budget — competitors succeeding here] |
| **Total** | $[X] | $[X] | $0 | Budget-neutral reallocation |

### 4E: シナリオモデリング

**Scenario 1: Conservative shift (+/- 20%)**
- Expected conversions: [N] (currently [N]) = [X%] improvement
- Expected blended CPA: $[X] (currently $[X])
- Risk: Low

**Scenario 2: Aggressive shift (+/- 40%)**
- Expected conversions: [N] = [X%] improvement
- Expected blended CPA: $[X]
- Risk: Medium — less data on scaled channels

**Scenario 3: Budget increase to $[Y]/mo**
- Recommended allocation: [table]
- Expected conversions: [N]
- New channels to test: [list]

## フェーズ5: 出力形式

```markdown
# Ad Campaign Analysis — [Product/Client] — [DATE]

Period: [Date range]
Total spend: $[X]
Platform(s): [Google / Meta / LinkedIn]
Primary goal: [Conversions / Revenue / Leads]

---

## Executive Summary

[3-5 sentences: Overall performance verdict, biggest win, biggest problem, top recommendation including any reallocation moves]

---

## Performance Dashboard

| Campaign | Spend | Impressions | Clicks | CTR | CPC | Conversions | CPA | ROAS | Verdict |
|----------|-------|------------|--------|-----|-----|-------------|-----|------|---------|
| [Name] | $[X] | [N] | [N] | [X%] | $[X] | [N] | $[X] | [X] | [Scale/Optimize/Pause] |

---

## Budget Waste Report

**Total estimated waste: $[X] ([X%] of total spend)**

### Wasted on zero-conversion items: $[X]
[List of keywords/ads/audiences with spend but no conversions]

### Wasted on high-CPA items: $[X]
[List of items with CPA > 3x target]

### Recommended saves: $[X]/month
[Specific items to pause]

---

## Winners to Scale

### Top Keywords/Audiences
| Item | CPA | Conv Rate | Current Spend | Recommended Spend |
|------|-----|----------|--------------|-------------------|

### Top Ads
| Ad | CTR | Conv Rate | Why It Works |
|----|-----|----------|-------------|

---

## A/B Test Results

### [Test Name]
- Variant A: [Metric] (n=[N])
- Variant B: [Metric] (n=[N])
- Confidence: [X%]
- **Verdict:** [Winner / Continue / Inconclusive]

---

## Budget Reallocation

### Current vs Recommended Allocation

| Channel | Current | Recommended | Change | Why |
|---------|---------|------------|--------|-----|
| [Channel] | $[X] | $[Y] | [+/-$Z] | [1-line reason] |

**Projected impact:**
- Conversions: [N] → [N] (+[X%])
- Blended CPA: $[X] → $[Y] (-[X%])

### Funnel Stage Coverage
[Coverage map with gaps identified]

### New Channel Recommendations

#### [Channel Name]
- **Why test:** [Reasoning]
- **Recommended test budget:** $[X]/mo for [X weeks]
- **Success criteria:** CPA < $[X]
- **Competitors using it:** [Yes/No — who]

---

## Action Plan

### Immediate (This Week)
- [ ] **Pause:** [Specific items — keywords, ads, audiences]
- [ ] **Scale:** [Specific items — increase budget/bids]
- [ ] **Add negatives:** [Specific keywords from search terms]
- [ ] **Reallocate:** [Specific dollar shifts between channels]

### This Month
- [ ] **Test:** [New ad angles / audiences / landing pages]
- [ ] **Restructure:** [Ad groups that need splitting or merging]
- [ ] **Optimize:** [Bid strategy changes]
- [ ] **Monitor reallocation:** Track CPA shifts on scaled channels, watch for diminishing returns

### Next Month
- [ ] **Expand:** [New campaigns / channels to test]
- [ ] **Re-evaluate:** [Run this analysis again with new data, adjust allocations based on actual results]
```

現在の作業ディレクトリ（またはユーザー指定パス）に `campaign-analysis-[YYYY-MM-DD].md` として保存する。

## コスト

| Component | Cost |
|-----------|------|
| Data analysis | Free (LLM reasoning) |
| Statistical calculations | Free |
| **Total** | **Free** |

## 必要なツール

- No external tools needed — pure reasoning skill
- User provides campaign data as CSV, paste, or screenshot

## 起動フレーズ

- "広告キャンペーンの実績を分析して"
- "どの広告を一時停止すべき?"
- "広告予算をどこで無駄にしている?"
- "Google Adsキャンペーンは機能している?"
- "Meta Adsの支出を最適化して"
- "広告予算をどう配分すべき?"
- "GoogleとMetaのどちらにもっと使うべき?"
- "広告費を再配分して"
- "どこで最も良いROASを得ている?"
- "マルチチャネル広告予算を最適化して"

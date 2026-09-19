---
name: competitor-ad-intelligence
description: '競合他社の有料広告の分析、分解、リバースエンジニアリングを依頼されたときに使用する。「[競合]はどんな広告を出しているか」「広告戦略を分解して」「競合広告分析」「まだ試していない広告の切り口を探して」「有料ファネルをリバースエンジニアリングして」などの依頼で起動する。オーガニック／SEOの競合調査やWebサイトのポジショニング分析では使用しない。'
license: MIT
compatibility: 'クロスプラットフォーム対応。Web検索と公開広告ライブラリ（Meta Ad Library、Google Ads Transparency Center）のみを使用し、APIキーや認証情報は不要。'
metadata:
  version: "1.0"
  author: GooseWorks
  source: https://github.com/gooseworks-ai/goose-skills
---

# 競合広告インテリジェンス

MetaとGoogleから競合広告を収集し、クリエイティブのパターンを分析し、ランディングページのファネルをリバースエンジニアリングして、フック、形式、ポジショニング上の狙い、弱点、対抗策を含む完全な戦略分析を作成します。

**中核原則:** 競合他社の広告ポートフォリオは、その成長戦略を映す窓です。長期間掲載されている広告は成果が出ているものを、新しい広告はテスト中のものを示します。ランディングページからはポジショニング上の狙いが分かります。優れた広告クリエイティブチームは、すでに機能しているものの証拠から出発し、そのうえで差別化します。

## 使用する場面

- 「競合他社はどんな広告を出していますか？」
- 「[競合]の広告戦略を分解してください」
- 「有料キャンペーン向けの新しいクリエイティブの切り口を探してください」
- 「[競合]の有料ファネルをリバースエンジニアリングしてください」
- 「[市場]ではどんなフックが機能していますか？」
- 「ローンチ前に広告市場を監査してください」
- 「[競合]の広告戦略の弱点を探してください」
- 「私たちのカテゴリでは動画、画像、カルーセルのどの形式が主流ですか？」

## フェーズ0: ヒアリング

ユーザーから次を収集します:

1. **競合名とドメイン**（例: `apollo.io`、`clay.run`）
2. **自社製品／ドメイン** — 比較の枠組みに使用
3. **チャネル:** Metaのみ、Googleのみ、または両方（既定: 両方）
4. **分析の深さ:**
   - **標準:** 広告収集 + クリエイティブ分析 + ランディングページ分析
   - **詳細:** 標準 + 過去との比較 + ファネル再構築 + 対抗策
5. **製品カテゴリ** — 分析の枠組みに使用
6. **既知の競合ランディングページ** — 広告ですでに見つけたURL

## フェーズ1: Meta広告を収集する

競合ドメインごとに、Meta Ad Libraryから広告を収集します。

`web_search`を使用してMeta Ad Library内の競合広告を検索します（一般公開されており、APIキーは不要）:

```
web_search: site:facebook.com/ads/library "[competitor_name]"
web_search: "[competitor_name]" Meta Ad Library active ads
web_search: "[competitor_name]" facebook ads examples
```

Meta Ad Libraryへ直接アクセスすることもできます: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=<competitor_name>`

Agentが対応している場合は、Ad LibraryのURLに`fetch_webpage`を使用して広告の詳細を抽出します。

> **注記:** Meta Ad Libraryを収集するApify actorは存在しますが、Metaのスクレイピング対策により、2026年4月時点では信頼性が低くなっています。主要な方法として`web_search`を使用してください。

**広告ごとに収集する項目:**
- 広告コピー（見出し + メインテキスト）
- ビジュアルの種類（画像／動画／カルーセル）
- CTAボタンのテキスト
- ランディングページURL
- 掲載期間（初回確認日、掲載中または停止）
- プラットフォーム（Facebook、Instagram、Audience Network）
- 広告バリエーション（A/Bテスト — 同じランディングページで異なるクリエイティブ）

## フェーズ2: Google広告を収集する

競合ドメインごとに、Google Ads Transparency Centerから広告を収集します。

`web_search`を使用してGoogle Ads Transparency Center内の競合広告を検索します（一般公開）:

```
web_search: site:adstransparency.google.com "[competitor_name]"
web_search: "[competitor_name]" Google Ads transparency
web_search: "[competitor_name]" google search ads examples
```

直接アクセスすることもできます: `https://adstransparency.google.com/?search_text=<competitor_name>`

Agentが対応している場合は、Transparency CenterのURLに`fetch_webpage`を使用して広告の詳細を抽出します。

**広告ごとに収集する項目:**
- 見出しのバリエーション（最大3件）
- 説明文
- 広告の種類（検索／ディスプレイ／YouTube／ショッピング）
- ランディングページURL
- 地域ターゲティング（表示される場合）

## フェーズ3: クリエイティブパターンを分析する

すべての広告を収集した後、構造化された分析を行います。

### フックパターンのクラスタリング

すべての広告見出し／冒頭文をフックの種類ごとに分類します:

| フックの種類 | パターン | 例 |
|-----------|---------|---------|
| **恐怖／損失** | 機会損失や遅れへの不安 | 「競合他社はすでにAI SDRを使っています」 |
| **成果** | 直接的な成果を約束 | 「30日でパイプラインを10倍に」 |
| **質問** | 現在の前提に疑問を投げかける | 「まだアウトバウンドを手作業で行っていますか？」 |
| **社会的証明** | 顧客名や数値を示す | 「[製品]を利用する500以上のB2Bチームに加わりましょう」 |
| **逆張り** | 常識に異議を唱える | 「コールドメールは終わっていません。問題はコピーです。」 |
| **共感** | 相手の苦痛を認める | 「SDRの立ち上がりが大変なのは分かっています」 |
| **製品主導** | 機能をフックにする | 「[機能]を公開しました — 新機能をご覧ください」 |

競合ごとに各フックを使用する広告数を数えます。これにより、主要なメッセージ戦略が明らかになります。

### 形式の分布

| 形式 | Meta | Google |
|--------|------|--------|
| 静止画像 | [N] | N/A |
| 動画 | [N] | [N] |
| カルーセル | [N] | N/A |
| 検索テキスト | N/A | [N] |
| ディスプレイバナー | N/A | [N] |

### CTAの分類

見つかった一意のCTAをすべて列挙します。一般的なパターン:
- **緊急性:** 「無料で始める」「今すぐ試す」「今日から始める」
- **低いハードル:** 「仕組みを見る」「デモを見る」「詳しく見る」
- **成果:** 「デモを予約」「無料監査を受ける」「ROIを計算する」

## フェーズ4: ランディングページとファネルの分析

広告で見つかった一意のランディングページURLごとに、取得して分析します:

```
fetch_webpage: [landing_page_url]
```

`fetch_webpage`を利用できない場合は`curl`を使用します。

**ランディングページごとに抽出する項目:**
- **ヒーロー見出し** — 広告の約束と一致しているか？
- **サブ見出し** — 価値提案の展開
- **主要CTA** — どの行動を促しているか？（デモ／無料トライアル／登録／ダウンロード）
- **社会的証明** — ロゴ、顧客の声、事例の指標
- **価格の表示** — 価格を表示しているか、隠しているか？
- **フォームフィールド** — どれだけの情報を求めているか？
- **ページの種類** — 一般的なホームページ／専用LP／機能ページ／ユースケースページ
- **メッセージ一致スコア** — LPが広告の約束をどの程度実現しているか？（1～10）

### キャンペーンのクラスタリング

すべての広告を次の基準で論理的なキャンペーンへ分類します:
- **ランディングページの遷移先** — 同じURLを指す広告 = 同じキャンペーン
- **メッセージのテーマ** — 似たコピーの切り口 = 同じ戦略上の狙い
- **オーディエンスのシグナル** — ペルソナごとに異なるコピー

### キャンペーンごとのファネル分析

各キャンペーンクラスターについて:

| 観点 | 分析 |
|-----------|----------|
| **戦略的意図** | このキャンペーンは何を達成しようとしているか？（認知／リード獲得／無料トライアル／競合からの乗り換え） |
| **対象ペルソナ** | この広告は誰に語りかけているか？（役割、課題、段階） |
| **ポジショニング上の狙い** | どの市場ポジションを主張しているか？ |
| **フック戦略** | 恐怖／成果／社会的証明／逆張り／製品主導 |
| **コンバージョン経路** | 広告 → LP → CTA → [デモ通話／無料トライアル／コンテンツダウンロード] |
| **継続期間のシグナル** | どのくらい掲載されているか？（長いほど成果が出ている可能性が高い） |
| **検出したA/Bテスト** | 同じLPへ複数のクリエイティブ = テスト実施中 |

### 予算配分の推定

広告量とプラットフォーム分布に基づき、支出を集中している場所を推定します:

| プラットフォーム | 広告数 | 全体に占める割合 | 推定される注力領域 |
|----------|----------|-----------|-----------------|
| Meta（Facebook） | [N] | [X%] | [認知／リターゲティング] |
| Meta（Instagram） | [N] | [X%] | [ビジュアル／若年層] |
| Google Search | [N] | [X%] | [ファネル下部の獲得] |
| Google Display | [N] | [X%] | [認知／リターゲティング] |
| YouTube | [N] | [X%] | [教育／認知] |

## フェーズ5: 戦略分析

### クリエイティブのギャップ分析

すべての競合を横断して次を特定します:

1. **誰も使っていない切り口** — 競合広告にないフックの種類 = 空白領域
2. **混雑した切り口** — 全社が「時間を節約」で始めるなら、避けるか、より具体的にする
3. **形式の機会** — 市場で誰も動画を使っていなければ、目立つ可能性がある
4. **十分に使われていない証拠** — 競合が避けており、自社が所有できる具体的な証拠はあるか？
5. **テストするCTAパターン** — 最も長く掲載されている広告はどのCTAを使用しているか？

### 弱点分析

各競合の広告戦略の弱点を特定します:

| 弱点の種類 | 説明 |
|-------------------|-------------|
| **メッセージとLPの不一致** | 広告が約束したものとLPが提供するものが異なる |
| **単一ペルソナへの依存** | すべての広告が同じペルソナを対象とし、未対応のセグメントがある |
| **プラットフォームの集中** | 1つのプラットフォームに偏り、他では掲載していない |
| **社会的証明の不足** | 広告またはLPに信頼性を示す要素がない |
| **弱いCTA** | 価値を示す前にデモを求めるなど、早すぎる段階で多くを求めている |
| **一般的なポジショニング** | 誰でも言える主張で、差別化されていない |
| **古くなったクリエイティブ** | 同じ広告を数か月変更せず掲載し、疲弊のリスクがある |

### 過去との比較（詳細モード）

ランディングページのWeb Archiveデータがある場合:
- 過去6～12か月でポジショニングが変化したか？
- どのキャンペーンを終了したか？（成果が出なかった可能性）
- どのキャンペーンを拡大したか？（成果が出た可能性）

## フェーズ6: 出力

```markdown
# Competitor Ad Intelligence Report — [DATE]

## Coverage
- Competitors analyzed: [list]
- Meta ads collected: [N]
- Google ads collected: [N]
- Unique landing pages analyzed: [N]
- Estimated active campaigns: [N]

---

## Executive Summary

[3-5 sentence summary: What is the competitive ad landscape? What's working? Where are the gaps and vulnerabilities?]

---

## Meta Ad Analysis

### Hook Distribution
| Hook Type | [Comp1] | [Comp2] | [Comp3] |
|-----------|---------|---------|---------|
| Fear/Loss | 40% | 10% | 0% |
| Outcome | 30% | 50% | 60% |
...

### Top Performing Ads (Longest Running)
**[Competitor] — [Ad Title/Hook]**
> [Ad copy excerpt]
- Format: [type]
- CTA: [text]
- Running since: [date]
- Why it likely works: [analysis]

---

## Google Ad Analysis

### Headline Patterns
[Top headline structures with examples]

### Most Common CTAs
[ranked list]

---

## Campaign Breakdown

### Campaign 1: [Inferred Campaign Name]
- **Competitor:** [name]
- **Ads in cluster:** [N]
- **Platform(s):** [Meta / Google / Both]
- **Strategic intent:** [Awareness / Lead gen / Competitive displacement / etc.]
- **Target persona:** [Description]
- **Hook strategy:** [Type]
- **Landing page:** [URL]
  - Hero: "[Headline text]"
  - CTA: "[Button text]"
  - Message match: [Score/10]
- **Longevity:** [First seen date → status]
- **A/B tests detected:** [Yes/No — what they're testing]

**Sample ad:**
> **Headline:** [text]
> **Body:** [text]
> **CTA:** [button]
> **Format:** [Image/Video/Carousel]

**Assessment:** [1-2 sentences — is this working? Why/why not?]

### Campaign 2: ...

---

## Funnel Map

```
[Ad: Hook/Angle] → [LP: /landing-page-url] → [CTA: Book Demo]
                                               ↓
[Ad: Different angle] → [LP: /same-or-different] → [CTA: Free Trial]
```

---

## Budget Allocation Estimate

| Platform | Share | Focus Area |
|----------|-------|-----------|
| [Platform] | [X%] | [Intent] |

---

## Creative Gap Analysis

### Angles Nobody Is Running
1. [Angle] — Why it could work for you: [reasoning]
2. [Angle] — ...

### Overcrowded Angles (Avoid or Differentiate)
- [Angle] — [N] of [N] competitors use this

### Format White Space
- [Format] is not being used by competitors on [platform]

---

## Vulnerability Report

### 1. [Vulnerability]
**Competitor:** [name]
**Evidence:** [What we observed]
**Your opportunity:** [How to exploit this gap]

### 2. ...

---

## Recommended Counter-Plays

### Counter-Play 1: [Name]
- **Target their weakness:** [Which vulnerability]
- **Your ad angle:** [Hook]
- **Platform:** [Where to run]
- **Proposed headline:** "[headline]"
- **Proposed body:** "[copy]"
- **LP strategy:** [What your landing page should emphasize]
- **Why test this:** [rationale]

### Counter-Play 2: ...
```

## コスト

| 項目 | コスト |
|-----------|------|
| 広告ライブラリ調査（web_search） | 無料 |
| ランディングページの取得 | 無料 |
| Web Archive検索（詳細モード） | 無料 |
| 分析 | 無料（LLMによる推論） |
| **合計** | **無料** |

## 環境変数

- APIキーは不要です。このSkillは一般公開されている広告ライブラリとWeb検索を使用します。

## 使用するTool

- **`web_search`** — Meta Ad LibraryとGoogle Ads Transparency Centerを検索する
- **`fetch_webpage`**または**`curl`** — ランディングページを取得、分析する

## トリガーフレーズ

- 「[競合]はどんな広告を出していますか？」
- 「[競合]の広告戦略を分解してください」
- 「[製品カテゴリ]の広告市場を監査してください」
- 「[競合]の広告インテリジェンスを実行してください」
- 「まだ試していない有料広告の新しい切り口を探してください」
- 「[競合]の有料ファネルをリバースエンジニアリングしてください」
- 「[競合]の広告戦略の弱点を探してください」
- 「[競合]について詳細な競合広告分析をしてください」

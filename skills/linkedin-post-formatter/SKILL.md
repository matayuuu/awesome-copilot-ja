---
name: linkedin-post-formatter
description: 'Unicodeの太字/斜体、視覚的な区切り、構造化されたセクション、エンゲージメントに最適化したパターンを使い、魅力的なLinkedIn投稿を整形・下書きする。LinkedIn投稿の下書き、LinkedIn向けのテキスト整形、ソーシャルメディア投稿の作成、ソートリーダーシップ投稿、LinkedIn形式への変換、LinkedInカルーセル文、Unicodeの太字斜体整形に使う。'
---

# LinkedIn投稿フォーマッター

Unicodeタイポグラフィと実績のある構成パターンを使い、素材のコンテンツ、アイデア、技術資料を洗練されたエンゲージメント最適化済みのLinkedIn投稿に変換する。

## 概要

LinkedInはプレーンテキストのみをサポートし、Markdownのレンダリングやリッチフォーマットには対応しない。このSkillはUnicode Mathematical Alphanumeric Symbolsを使い、外部ツールなしでLinkedInエディターにネイティブ表示される太字、斜体、太字斜体のテキストを再現する。

## Unicodeタイポグラフィリファレンス

プレーンテキストをUnicodeスタイルのLinkedInテキストへ変換するときは、まず`references/unicode-charmap.md`を文字マッピングの正本として読み込み、使う。

次の文字マッピングをプレーンテキストに適用して、視覚的な強調を作る。

### 太字（Mathematical Sans-Serif Bold）

重要なフレーズ、セクション見出し、強調語に太字を使う。

| Plain | Unicode Bold |
|-------|-------------|
| A-Z   | 𝗔-𝗭         |
| a-z   | 𝗮-𝘇         |
| 0-9   | 𝟬-𝟵         |

### 斜体（Mathematical Sans-Serif Italic）

控えめな強調、技術用語、引用に斜体を使う。

| Plain | Unicode Italic |
|-------|---------------|
| A-Z   | 𝘈-𝘡           |
| a-z   | 𝘢-𝘻           |

### 太字斜体（Mathematical Sans-Serif Bold Italic）

最大限の強調が必要な場合に、控えめに使う。

| Plain | Unicode Bold-Italic |
|-------|-------------------|
| A-Z   | 𝘼-𝙕               |
| a-z   | 𝙖-𝙯               |

## 視覚的な区切り

次の文字を使って視覚的な構造を作る。

- **セクション区切り**: `━━━━━━━━━━━━━━━━━━━━━━`（太い罫線）
- **箇条書き**: `◈`（点付きひし形）または`◎`（二重丸）
- **矢印の流れ**: 縦方向の流れには`↓`、横方向の継続には`→`
- **サブ項目**: インデントした項目には`↳`
- **番号付き項目**: 太字のUnicode数字`𝟭. 𝟮. 𝟯.`などを使う。

## 投稿構成のパターン

### パターン1: フック → 内容 → CTA（汎用）

```
[Bold hook line — provocative statement or question]

[1-2 lines of context setting the stage]

━━━━━━━━━━━━━━━━━━━━━━

[Main content with bold section headers]
[Bullet points using ◈ or numbered with bold digits]

━━━━━━━━━━━━━━━━━━━━━━

[Bold takeaway or summary]

[Call to action — repost, comment, or grab resource]

#Hashtags
```

### パターン2: リスト形式（番号付きの洞察）

```
[Bold opening line with a strong claim]

[Setup line explaining what follows]

𝟭. [Bold item title]
   [Supporting detail]

𝟮. [Bold item title]
   [Supporting detail]

...

𝗧𝗵𝗲 𝗸𝗲𝘆 𝘁𝗮𝗸𝗲𝗮𝘄𝗮𝘆: [Summary in italic]

#Hashtags
```

### パターン3: ストーリー → 学び（ソートリーダーシップ）

```
[Italic opening with a personal or observed moment]

[2-3 short paragraphs telling the story]

━━━━━━━━━━━━━━━━━━━━━━

𝗧𝗵𝗲 𝗹𝗲𝘀𝘀𝗼𝗻:

[Bold lesson or principle extracted from the story]

[CTA]

#Hashtags
```

### パターン4: リソース共有（チートシート/ガイド/ツール）

```
[Hook: "If you do X, you cannot miss this..."]

[Brief description of what the resource covers]

━━━━━━━━━━━━━━━━━━━━━━

[Bold section count]. [Bold section titles as numbered list]

━━━━━━━━━━━━━━━━━━━━━━

𝗧𝗵𝗲 𝗿𝗲𝗮𝗹 𝘁𝗮𝗸𝗲𝗮𝘄𝗮𝘆:

[Why this resource matters — bold key phrase]

[Grab it / Share it CTA]

♻️ 𝗥𝗲𝗽𝗼𝘀𝘁 if this is useful to your network.

#Hashtags
```

## 整形ルール

1. **改行が重要:** LinkedInは複数の空行をまとめる。段落間には空行を1つだけ使う。
2. **ファーストビューにフック:** 最初の2〜3行で読者が「さらに表示」をクリックしたくなるようにする。価値を前方に置く。
3. **短い段落:** 1段落は最大1〜3文。文章の壁はエンゲージメントを失わせる。
4. **太字は控えめに:** 段落全体ではなく、重要なフレーズと見出しを太字にする。
5. **ニュアンスには斜体:** 技術用語、内心、控えめな強調に斜体を使う。
6. **ハッシュタグは末尾:** 最終行に関連するハッシュタグを5〜8個置く。投稿途中には置かない。
7. **本文に絵文字を入れない:** ユーザーが明示的に求めた場合を除く。例外として、CTAには戦略的な絵文字を1つ使える（再投稿を示す♻️）。
8. **文字数制限:** LinkedIn投稿は最大3000文字。最適なエンゲージメントのため1500〜2500文字を目指す。
9. **本文にURLを入れない:** LinkedInはリンクを含む投稿のリーチを抑制する。代わりにコメントへリンクを追加する。「コメントにリンク」や「下から取得」をCTAで伝える。

## エンゲージメントの最適化

- **効果的な冒頭フック:** 質問、強い主張、「Xをするなら…」、逆張りの見解、意外な統計。
- **効果的な締めのCTA:** 「♻️ 𝗥𝗲𝗽𝗼𝘀𝘁 if...」、「後で見るために保存」、「必要な人をタグ付け」、「あなたはどう思う？ 👇」
- **余白を味方にする:** 密集した文章は読み飛ばされる。余裕があり、ざっと読めるレイアウトが効果的である。
- **「さらに表示」フック:** LinkedInはデスクトップで約210文字を超えると投稿を省略する。最初の2行でクリックしたくなる十分な好奇心を生む。

## プロセス

1. 元のコンテンツ（テキスト、HTML、画像、アイデア）を分析する。
2. 最適な投稿構成パターン（フック→内容→CTA、リスト形式、ストーリー→学び、リソース共有）を特定する。
3. 中核メッセージと3〜5個の重要ポイントを抽出する。
4. `references/unicode-charmap.md`を使い、見出しと強調語にUnicodeの太字/斜体整形を適用する。
5. セクション間に視覚的な区切りを追加する。
6. 冒頭に魅力的なフックを書く。
7. 末尾にCTAとハッシュタグを追加する。
8. 投稿がLinkedInにコピー＆ペーストできる状態であることを確認する。

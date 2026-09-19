---
name: eyeball
description: 'ソースのスクリーンショットをインラインで含む文書分析を行います。Copilot に文書分析を依頼すると、Eyeball はすべての事実に基づく主張へソース資料の強調表示付きスクリーンショットを含めた Word 文書を生成し、自分の目で検証できるようにします。'
---

# Eyeball

文書を視覚的な根拠付きで分析します。起動すると、Eyeball はユーザーのデスクトップに Word 文書を生成し、各事実的な主張にはソース資料からのインラインスクリーンショットが付き、引用テキストが黄色で強調表示されます。

## 起動

ユーザーがこのスキルを呼び出したとき（例: "use eyeball"、"run eyeball on this"、"eyeball this document"）には、次のように応答します:

> **Eyeball はアクティブです。** 文書を分析し、各主張を自分の目で確認できるように、ソースのスクリーンショットがインラインで含まれた Word 文書を作成します。

その後、以下のワークフローに従います。

## 対応ソース

- **ローカルファイル:** Word 文書 (.docx, .doc), PDF (.pdf), RTF ファイル
- **Web URL:** 公開アクセス可能な任意の Web ページ

## ツールの配置

Eyeball Python ユーティリティは次の場所にあります:
```
<plugin_dir>/skills/eyeball/tools/eyeball.py
```

実際のパスを確認するには、次を実行します:
```bash
find ~/.copilot/installed-plugins -name "eyeball.py" -path "*/eyeball/*" 2>/dev/null
```

そこに見つからない場合は、プロジェクト ディレクトリまたはユーザーのホーム ディレクトリで eyeball リポジトリを確認します。

## 初回セットアップ

初回使用の前に、依存関係がインストールされていることを確認します:

```bash
python3 <path-to>/eyeball.py setup-check
```

何か不足している場合は、必要な依存関係をインストールします:
```bash
pip3 install pymupdf pillow python-docx playwright
python3 -m playwright install chromium
```

Windows では、Word 自動化のために pywin32 もインストールします:
```bash
pip install pywin32
```

## ワークフロー

以下の手順を正確に実行してください。順番が重要です。

### Step 1: ソース テキストを読み取る

分析を書き始める前に、ソース文書の全文を抽出して読みます:

```bash
python3 <path-to>/eyeball.py extract-text --source "<path-or-url>"
```

出力を注意深く確認してください。実際のセクション番号、見出し、ページ番号、主要な表現を特定します。

**重要:** この手順をスキップしないでください。文書の構成を推測して分析を書いてはいけません。実際のテキストを読みます。

### Step 2: 正確な引用を付けて分析を書く

分析の各ポイントについて、次を満たす必要があります:

1. **文書に記載されている正しいセクション番号を参照する**（例: 「Section 8」ではなく「Section 9」など、番号を推測してはいけません）
2. **そのセクションが抽出テキスト内で記載されている正しいページ番号を参照する**
3. **主張を直接裏付けるソースの逐語的なフレーズをアンカーとして選ぶ**

### Step 3: アンカーを正しく選ぶ

これは最も重要なステップです。アンカーはスクリーンショットでハイライトされる内容を決定します。

**実行すべきこと:**
- 主張を直接裏付けるソース テキストの逐語的なフレーズを使う
- 読者に見せるべきテキストの範囲全体をカバーする複数のアンカーを使う
- 意図した箇所にのみ現れる、具体的で珍しいフレーズを使う

**避けるべきこと:**
- 文書全体に繰り返し出てくる一般的なトピック ラベル（例: "Confidentiality"）
- 以前のページにある相互参照として登場するセクション タイトルだけを使う
- 多くの箇所で一致する単一の一般的な語を使う

**例:**

誤り -- 一般的なトピック ラベルを使っており、どこでも一致してしまう:
```json
{"anchors": ["User-Generated Content"], "target_page": 8}
```

正しい -- 主張を裏付ける具体的な表現を使っている:
```json
{"anchors": ["retain ownership", "Ownership of Content, Right to Post"], "target_page": 8}
```

誤り -- セクション タイトルが前のページにある相互参照として登場している:
```json
{"anchors": ["LIMITATION OF LIABILITY"]}
```

正しい -- セクション番号を含めて正確にし、正しいページを対象にしている:
```json
{"anchors": ["12. LIMITATION OF LIABILITY", "INDIRECT", "CONSEQUENTIAL"], "target_page": 13}
```

### Step 4: 分析ドキュメントを作成する

セクションの JSON 配列を構築し、ビルド コマンドを呼び出します:

```bash
python3 <path-to>/eyeball.py build \
  --source "<path-or-url>" \
  --output ~/Desktop/<title>.docx \
  --title "Analysis Title" \
  --subtitle "Source description" \
  --sections '[
    {
      "heading": "1. Section Title",
      "analysis": "Your analysis text here. Reference Section X on page Y...",
      "anchors": ["verbatim phrase 1", "verbatim phrase 2"],
      "target_page": 5,
      "context_padding": 40
    },
    {
      "heading": "2. Another Section",
      "analysis": "More analysis...",
      "anchors": ["exact quote from source"],
      "target_pages": [10, 11],
      "context_padding": 50
    }
  ]'
```

セクション オブジェクトのフィールド:
- `heading` （必須）: 出力文書のセクション見出し
- `analysis` （必須）: 分析テキスト
- `anchors` （必須）: ソースから検索して強調表示する逐語的なフレーズの一覧
- `target_page` （任意）: 検索対象の単一ページ番号（1 始まり）
- `target_pages` （任意）: 検索対象の複数ページ番号の一覧（スクリーンショットを縦方向に連結）
- `context_padding` （任意）: アンカー領域の上下の余白（PDF ポイント、既定値: 40）。より多くの文脈を見せたい場合は増やす。

### Step 5: 出力を提供する

出力をユーザーのデスクトップに保存し、ファイル名を伝え、強調表示されたソース スクリーンショットと照らし合わせて各主張を確認できることを案内します。

## 配達前のセルフチェック

最終文書を保存する前に、頭の中で次を確認します:

1. 各セクションの分析テキストが、ソースからの正しいセクション番号を参照しているか?
2. アンカーが対象ページに実際に存在する逐語的なフレーズになっているか?
3. 各アンカーが、分析で述べている内容を直接支えるもので、同じ話題に関連しているだけではないか?
4. スクリーンショットが分析と一致しない場合、分析が間違っているのか、アンカーが間違っているのか? どちらかが誤りなら修正する。

## 注記

- 出力文書には、動的にサイズが決まるハイライト付きスクリーンショットが含まれます。複数のアンカーを指定すると、スクリーンショットはそれらをすべて含むように広がります。
- 検索語が見つからない場合、出力文書にはその旨が記載されます。これが起きた場合、アンカーが逐語的でなかった可能性が高いです。調整して再構築してください。
- Web ページの場合、Playwright がまずページを PDF にレンダリングします。その結果、ブラウザーで見えているページ番号と異なる場合があります。正しいページ番号を判断するには、抽出テキスト出力（Step 1）を使用してください。
- すでにソース テキストがユーザーから与えられている、または現在の会話ですでに読み取った場合は、Step 1 を省略できます。ただし、分析を書く前に、セクション番号とページ参照が実際のテキストと一致していることを必ず確認してください。

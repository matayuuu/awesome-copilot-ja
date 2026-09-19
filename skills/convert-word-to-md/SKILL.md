---
name: convert-word-to-md
description: 'Word（.docx）文書をMarkdownへ変換し、内容を正確に分析、要約、検索、抽出できるようにする。ユーザーが.docxファイルを共有、参照、または質問した場合は、「変換」や「Markdown」と明示していなくても必ず使用する。Word文書、履歴書、レポート、契約書、提案書の読み取り、要約、レビュー、データ抽出、比較、分析の依頼を含む。まず同梱の変換スクリプトでMarkdownを生成し、.docxを直接解析したり、その場限りの変換コードを書いたりしない。Word文書を含むフォルダー全体の一括処理にも使用する。重要: 複数のファイル形式（.pdf、.docx、.xlsx）を含むフォルダーや文書群が参照された場合は、どの形式も見落とさないよう、convert-pdf-to-md、convert-word-to-md、convert-excel-to-mdの3つすべてを呼び出す。'
---

# WordをMarkdownへ変換

## このSkillを使う場面

理解または処理が必要な `.docx` ファイルがある場合は、常にこのSkillを起動する。
たとえば、ユーザーがWord文書を添付して質問する、要約を求める、特定のデータの抽出を
求める、フォルダー内の複数のWord文書をまとめて処理したい場合が該当する。Word固有の
`.docx` 形式はZIP化されたXMLの集合であり、プレーンテキストとして確実に読み取れない。
ファイルを直接開いたり解析したりせず、必ずこのSkillのスクリプトで先にMarkdownへ変換する。

このSkillが対応するのは `.docx` のみである。従来形式の `.doc` の変換を依頼された
場合は、未対応であることを伝え、先に `.docx` として保存し直すよう依頼する
（Word: File > Save As > Word Document (.docx)）。

**複数のファイル形式:** ユーザーが対応形式（`.pdf`、`.docx`、`.xlsx`）を複数含む
フォルダーや文書群を参照した場合、このSkillが処理するのは `.docx` ファイルだけである。
エージェントは、次の兄弟Skillも並列で必ず呼び出す。
- `.pdf` ファイルには `convert-pdf-to-md`
- `.xlsx` ファイルには `convert-excel-to-md`

フォルダーを処理するとき、対応形式を黙って除外してはならない。複数形式が含まれる
場合は、3つのSkillをすべて同時に呼び出す。

## セットアップ（環境ごとに1回）

各環境で初めて変換する前に、[`references/setup.md`](references/setup.md) の手順に従い、
Python、pip、`markitdown` パッケージがインストール済みであることを確認する。
環境の準備状況を推測せず、先回りして確認する。`markitdown` が不足していれば、
スクリプト自体もこのファイルを案内する明確なエラーで失敗するため、セットアップ済み
だと十分確信できる場合は、先に変換を試してもよい。

## 使用方法

変換スクリプトは `scripts/convert_word_to_md.py` にある。

**出力構造:** MarkItDownは画像を、実際の画像データではなく、途中で省略された
`data:image/png;base64...` URIプレースホルダーとして埋め込む。そのためスクリプトは
`.docx` から実際の画像を直接抽出し、単独の `.md` ファイルではなく、文書ごとに
自己完結したフォルダーへ書き出す。

```
<name>/
    img/
        img001.<ext>
        img002.<ext>
        ...
    <name>.md          (image references are relative: img/imgNNN.ext)
```

文書に埋め込み画像がなければ、`img/` フォルダーは作成しない。

**単一ファイル:**

```powershell
# Windows
python scripts\convert_word_to_md.py "C:\path\to\document.docx"
```

```bash
# macOS / Linux
python scripts/convert_word_to_md.py "/path/to/document.docx"
```

これにより、元ファイルの隣に `document\` フォルダーが作成される
（`document.md` と、存在する場合は `document\img\` を含む）。出力先フォルダーを
明示的に指定する場合:

```powershell
python scripts\convert_word_to_md.py "C:\path\to\document.docx" -o "C:\path\to\output_folder"
```

**Word文書のフォルダー（一括モード）:**

```powershell
python scripts\convert_word_to_md.py "C:\path\to\folder"
```

サブフォルダーも含めるには `--recursive` を追加する。

```powershell
python scripts\convert_word_to_md.py "C:\path\to\folder" --recursive
```

既定では、見つかった各 `.docx` の隣に、それぞれの `<name>\` 出力フォルダーが
作成される。生成したすべての `<name>\` フォルダーを別の親ディレクトリ配下へ
まとめるには、`-o "C:\path\to\output_parent"` を指定する
（`--recursive` と組み合わせた場合もサブフォルダー構造は保持される）。

変換後、生成された `.md` ファイルを読み、ユーザーが依頼した実際の分析を行う。
スクリプトの役割は正確なMarkdown（および画像）を生成することだけであり、
内容の解釈ではない。

## 出力先の決定

**既定では必ず元ファイルの隣へ出力する。** `<name>/` フォルダーは元の `.docx` と
同じディレクトリに作成する。これはすべての場合に必須の既定動作である。
ユーザーが別の場所を明示的に求めない限り、変更してはならない。

**`-o` を使うのは、** ユーザーが出力パスを明示した場合だけである
（例: 「出力を `C:\output` に保存して」「結果を `D:\work` に置いて」）。
エージェントの現在の作業ディレクトリ、セッション状態フォルダー、暗黙の場所を
根拠に `-o` を渡してはならない。

**元ファイルのパスを完全に解決できない場合**（たとえば、ユーザーがディレクトリ
なしのファイル名だけを示した場合や、パスが曖昧な場合）は、変換前に `ask_user` で
完全な絶対パスを確認する。ディレクトリを推測したり決めつけたりしてはならない。

## トラブルシューティング

| 症状 | 考えられる原因 | 対処 |
|---|---|---|
| `ModuleNotFoundError: No module named 'markitdown'` / exit code 2 | MarkItDownが未インストール | `references/setup.md` に従う |
| `ERROR: Unsupported file type '.doc'` / exit code 3 | `.docx` ではなく従来形式の `.doc` | `.docx` として保存し直すようユーザーへ依頼する |
| `ERROR: Input path not found` / exit code 3 | パスが誤っているか、ファイルが移動された | 正しいパスをユーザーに確認する |
| 一括出力の `FAILED <file> -> ...` | 該当ファイルが破損、パスワード保護、またはその他の理由で読み取れない | 失敗したファイルを報告する。一括処理内の他のファイルは引き続き成功する |
| `NOTE: skipped N non-.docx file(s)` | フォルダーにWord以外のファイルが含まれる | 想定どおり。これらのファイルは意図的に無視される |
| `WARNING: found N image placeholder(s) ... but extracted M image file(s)` | MarkItDownのプレースホルダー数と `word/media/` で見つかった画像数が一致しない（通常でない、または不正なdocx） | 誤った画像へ置換する危険を避け、プレースホルダーは未置換のままにする。画像が必要な場合は元ファイルのメディアを手動で確認する |

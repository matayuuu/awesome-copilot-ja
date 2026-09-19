---
name: convert-excel-to-md
description: 'Excel（.xlsx）ワークブックをMarkdownへ変換し、内容を正確に分析、要約、検索、抽出できるようにする。ユーザーが.xlsxファイルを共有、参照、または質問した場合は、「変換」や「Markdown」と明示していなくても必ず使用する。スプレッドシート、ワークブック、予算表、データ出力、トラッカーの読み取り、要約、レビュー、データ抽出、比較、グラフ化、分析の依頼を含む。まず同梱の変換スクリプトでMarkdownを生成し、.xlsxを直接解析したり、その場限りの抽出コードを書いたりしない。Excelワークブックを含むフォルダー全体の一括処理にも使用する。重要: 複数のファイル形式（.pdf、.docx、.xlsx）を含むフォルダーや文書群が参照された場合は、どの形式も見落とさないよう、convert-pdf-to-md、convert-word-to-md、convert-excel-to-mdの3つすべてを呼び出す。'
---

# ExcelをMarkdownへ変換

## このSkillを使う場面

理解または処理が必要な `.xlsx` ファイルがある場合は、常にこのSkillを起動する。
たとえば、ユーザーがスプレッドシートを添付して質問する、データの要約を求める、
特定の行や値の抽出を求める、フォルダー内の複数のワークブックをまとめて処理したい
場合が該当する。Excel固有の `.xlsx` 形式はZIP化されたXMLの集合であり、
プレーンテキストとして確実に読み取れないため、ファイルを直接開いたり解析したり
せず、必ずこのSkillのスクリプトで先にMarkdownへ変換する。

このSkillが対応するのは `.xlsx` のみである。従来形式の `.xls` の変換を依頼された
場合は、未対応であることを伝え、先に `.xlsx` として保存し直すよう依頼する
（Excel: File > Save As > Excel Workbook (.xlsx)）。

**複数のファイル形式:** ユーザーが対応形式（`.pdf`、`.docx`、`.xlsx`）を複数含む
フォルダーや文書群を参照した場合、このSkillが処理するのは `.xlsx` ファイルだけである。
エージェントは、次の兄弟Skillも並列で必ず呼び出す。
- `.pdf` ファイルには `convert-pdf-to-md`
- `.docx` ファイルには `convert-word-to-md`

フォルダーを処理するとき、対応形式を黙って除外してはならない。複数形式が含まれる
場合は、3つのSkillをすべて同時に呼び出す。

## セットアップ（環境ごとに1回）

各環境で初めて変換する前に、[`references/setup.md`](references/setup.md) の手順に従い、
Python、pip、`markitdown` パッケージがインストール済みであることを確認する。
環境の準備状況を推測せず、先回りして確認する。`markitdown` が不足していれば、
スクリプト自体もこのファイルを案内する明確なエラーで失敗するため、セットアップ済み
だと十分確信できる場合は、先に変換を試してもよい。

## 使用方法

変換スクリプトは `scripts/convert_excel_to_md.py` にある。

**出力構造:** MarkItDownのXLSXコンバーターは、各シートを個別の
`## <SheetName>` Markdownテーブルとして出力し、埋め込み画像には対応しない。
このスクリプトは、実際の埋め込み画像（グラフではなくラスター画像）を別途抽出し、
所属するシートへ対応付けて、文書ごとに自己完結したフォルダーへ書き出す。

```
<name>/
    img/
        sheet001_<sheetname>_img001.<ext>
        sheet002_<sheetname>_img001.<ext>
        ...
    <name>.md          (each sheet's images appear right after its table,
                         under a "#### Images in this sheet" heading)
```

配置単位はシートであり、正確なセル位置ではない。これはMarkItDownの安定した出力
アンカー（`## <SheetName>` 見出し）で扱える最小単位である。埋め込み画像がない
ワークブックでは、`img/` フォルダーも画像セクションも作成しない。Excel固有の
**グラフ**は画像として抽出しない（対象は実際に埋め込まれた画像だけである。
グラフの画像化にはExcelまたはLibreOfficeによるレンダリングが必要だが、
この軽量なSkillでは行わない）。

**単一ファイル:**

```powershell
python scripts\convert_excel_to_md.py "C:\path\to\workbook.xlsx"
```

これにより、元ファイルの隣に `workbook\` フォルダーが作成される
（`workbook.md` と、存在する場合は `workbook\img\` を含む）。出力先フォルダーを
明示的に指定する場合:

```powershell
python scripts\convert_excel_to_md.py "C:\path\to\workbook.xlsx" -o "C:\path\to\output_folder"
```

**ワークブックのフォルダー（一括モード）:**

```powershell
python scripts\convert_excel_to_md.py "C:\path\to\folder"
```

サブフォルダーも含めるには `--recursive` を追加する。

```powershell
python scripts\convert_excel_to_md.py "C:\path\to\folder" --recursive
```

既定では、見つかった各 `.xlsx` の隣に、それぞれの `<name>\` 出力フォルダーが
作成される。生成したすべての `<name>\` フォルダーを別の親ディレクトリ配下へ
まとめるには、`-o "C:\path\to\output_parent"` を指定する
（`--recursive` と組み合わせた場合もサブフォルダー構造は保持される）。

変換後、生成された `.md` ファイルを読み、ユーザーが依頼した実際の分析を行う。
スクリプトの役割は正確なMarkdown（および画像）を生成することだけであり、
内容の解釈ではない。

## 出力先の決定

**既定では必ず元ファイルの隣へ出力する。** `<name>/` フォルダーは元の `.xlsx` と
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
| `ERROR: Unsupported file type '.xls'` / exit code 3 | `.xlsx` ではなく従来形式の `.xls` | `.xlsx` として保存し直すようユーザーへ依頼する |
| `ERROR: Input path not found` / exit code 3 | パスが誤っているか、ファイルが移動された | 正しいパスをユーザーに確認する |
| 一括出力の `FAILED <file> -> ...` | 該当ファイルが破損、パスワード保護、またはその他の理由で読み取れない | 失敗したファイルを報告する。一括処理内の他のファイルは引き続き成功する |
| `NOTE: skipped N non-.xlsx file(s)` | フォルダーにExcel以外のファイルが含まれる | 想定どおり。これらのファイルは意図的に無視される |
| シートのグラフが画像として表示されない | グラフは埋め込み画像ではなくグラフオブジェクトであり、このSkillが抽出するのは実際に埋め込まれたラスター画像だけである | 想定どおり。ユーザーがグラフ画像を特に必要としている場合は、この制限を伝える |

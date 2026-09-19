---
name: convert-plaintext-to-md
description: 'プロンプトの指示に従ってテキストベースの文書をMarkdownへ変換する。文書化されたオプションが渡された場合は、そのオプションの手順に従う。'
---

# プレーンテキスト文書をMarkdownへ変換

## 現在の役割

あなたは、プレーンテキストまたは一般的なテキストベースの文書ファイルを、適切に
書式設定されたMarkdownへ変換する技術文書の専門家である。

## 変換方法

次の3つの方法のいずれかで変換できる。

1. **明示的な指示から**: 依頼とともに提供された具体的な変換指示に従う
2. **文書化されたオプションから**: 文書化されたオプションまたは手順が渡された場合は、確立された変換規則に従う
3. **参照ファイルから**: 以前にテキスト形式から変換された別のMarkdownファイルを、類似文書を変換するためのテンプレートおよび指針として使う

## 参照ファイルを使う場合

変換済みのMarkdownファイルが指針として提供された場合:

- 同じ書式パターン、構造、規約を適用する
- 参照ファイルと比べて現在のファイルで除外する内容や異なる扱いを指定する追加指示に従う
- 変換対象ファイルの具体的な内容に合わせながら、参照ファイルとの一貫性を保つ

## 使用方法

このプロンプトでは複数のパラメーターとオプションを使用できる。渡された場合は、
現在のプロンプトへの指示として合理的かつ統一的に適用する。現在の変換用の指示または
スクリプトを組み立てる際にパラメーターやオプションが不明確な場合は、#tool:fetchを使い、
**参照**セクションのURLを取得する。

```bash
/convert-plaintext-to-md <#file:{{file}}> [finalize] [guide #file:{{reference-file}}] [instructions] [platform={{name}}] [options] [pre=<name>]
```

### パラメーター

- **#file:{{file}}**（必須）- Markdownへ変換するプレーンテキストまたは一般的なテキスト文書ファイル。
対応する `{{file}}.md` がすでに**存在する**場合は、**既存**ファイルの内容を変換対象の
プレーンテキスト文書データとして扱う。**存在しない**場合は、元のプレーンテキスト文書と
同じディレクトリで `copy FILE FILE.md` を実行して、**新しいMarkdownを作成する**。
- **finalize** - 指定された場合（または同様の表現が使われた場合）、文書全体を走査し、
変換後に空白文字、インデント、その他の乱れた書式を整える。
- **guide #file:{{reference-file}}** - 以前に変換したMarkdownファイルを、書式パターン、
構造、規約のテンプレートとして使う。
- **instructions** - 追加指示としてプロンプトへ渡すテキストデータ。
- **platform={{name}}** - 互換性を確保するため、Markdownを表示する対象プラットフォームを指定する。
  - **GitHub**（既定）- 表、タスクリスト、取り消し線、アラートに対応するGitHub Flavored Markdown（GFM）
  - **StackOverflow** - StackOverflow固有の拡張を備えたCommonMark
  - **VS Code** - VS CodeのMarkdownプレビュー表示向けに最適化
  - **GitLab** - プラットフォーム固有機能を備えたGitLab Flavored Markdown
  - **CommonMark** - 標準のCommonMark仕様

### オプション

- **--header [1-4]** - 文書へMarkdown見出しを追加する。
  - **[1-4]** - 追加する見出しレベル（#から####）を指定する
  - **#selection** - 次の目的で使うデータ。
    - 更新を適用するセクションを特定する
    - 他のセクションまたは文書全体へ見出しを適用するための指針にする
  - **自動適用**（指定がない場合）- 内容の構造に基づいて見出しを追加する
- **-p, --pattern** - 次の情報にある既存パターンに従う。
  - **#selection** - ファイルまたはその一部を更新するときに従う、選択されたパターン
    - **重要**: `{{[-p, --pattern]}}` へ渡された選択範囲だけを編集してはならない
    - **注**: 選択範囲は**作業範囲ではない**
    - 選択範囲からパターンを特定する
    - **停止位置**:
      - `{{[-s, --stop]}} eof` が渡された場合、または明確な終点が指定されていない場合は、ファイル末尾まで変換する
      - `-s [0-9]+` が渡された場合は、正規表現 `[0-9]+` で指定された行番号まで変換する
  - **プロンプトの指示** - プロンプトとともに渡される指示データ
  - **自動検出**（指定がない場合）- 次の方法でファイル内の既存パターンを特定する。
    - パターンが現れる位置を分析する
    - パターンに一致しないデータを特定する
    - あるセクションのパターンを、対応するパターンが欠けているセクションへ適用する
- **-s, --stop <[0-9]+ | eof>**
  - **[0-9]+** - **現在の**Markdown変換を停止する行番号
  - **eof** - 指定された場合、またはその他のテキストで明確に**ファイル末尾**が示された場合、ファイル末尾まで変換する

### 定義済みの指示

定義済みの指示が引数として渡された場合は展開し、プロンプト指示への**追加**入力として
使う。定義済みの指示だけが渡され、追加入力がない場合は、それを現在のプロンプトへの
指示として使う。

#### 構文

```bash
/convert-plaintext-to-md pre=<name>
```

#### 定義済み

- **rm-head-digits** - プレーンテキストをMarkdownへ更新または変換するとき、見出しの先頭に付いた数字を削除する。
- **mv-head-level(x, y)** - プレーンテキストをMarkdownへ更新または変換するとき、見出しレベルを
`x` から `y` へ変更する。
- **rm-indent(x)** - プレーンテキストをMarkdownへ更新または変換するとき、ファイル内の段落または
生テキスト部分のインデントを `x` だけ減らす。

> [!NOTE]
> 一致する**定義済み指示**がない場合、現在のプロンプトでは `pre=name` を無視する。

### 使用例

#### 基本的な使用

**User**

```bash
/convert-plaintext-to-md #file
```

**エージェント**

```
I see there is no corresponding `file.md`. Let me copy the plaintext document:

    ```bash
    cp file file.md
    ```

Now I'll apply markdown best practices to convert the plaintext documentation to a markdown document.
```

#### 指針を使ったMarkdownへの変換

**User**

```bash
/convert-plaintext-to-md #file.md --guide #CODE.md
```

**エージェント**

```
I see that both the file and CODE markdown files have corresponding plaintext documentation. Let me
check CODE and compare it to CODE.md, and identify patterns to help with conversion.

    CODE
    ```text
    Title

    Text in opening.

    1. Section
      1.1 Section Item

    =============================================

    1. Section
      1.1
      Full details of section item.
    ```

And looking at CODE.md:

    CODE.md
    ```markdown
    # Title

    Text in opening.

    ### [Section](#1-section)

    - [1.1](#11) Section Item but Only Numbers in Sub-heading

    ***

    ## 1. Section

    ### 1.1

    Full details of section item.
    ```

I see file.md exists and matches the text in file.

I'll convert file.md similarly. Let's look at the file text documentation:

    file
    ```text
    Title

    1. Command
      1.10.0 Options

    ---------------------------------------------

    Command
      1.10.0
      Info on the commands' options.
    ```

OK, after analyzing the guide file, I've updated file.md to:

    file.md
    ```markdown
    # Title

    ### [1. Command](#command)
    - [1.10.0](#1100-option-with-text-subheading) Option With Text Subheading

    ***

    ## Command

    ### 1.10.0 Option With Text Subheading
    Info on the commands' options.
    ```
```

#### finalizeが明確に指定された場合

**User**

```bash
/convert-plaintext-to-md #file.md polish the converted markdown file
```

**注** - 自然言語による表現の違いを許容する。このため「変換済みMarkdownファイルを整えて」のような表現も対象になる。

**エージェント**

```
I'll finalize file.md. I see the current converted markdown file has:

    ```markdown
    # Title

    Some paragraph with space character at start of line. This <html> should be escaped.

    -  Some list item with extra space character.
    -  Nested list but only one nesting space character, and extra space after dash.
      if (a == 1) {
        return "Indented code block without enough space characters.";
      } else {
        return "Passing `finalize` or similar should resolve this.";
      }

    But when `python` is used, syntax will be like:
    ```

    ```
    import math
    radius = float(input("This is clearly python, but let's do math."))
    area = math.pi * radius**2
    circumference = 2 * math.pi * radius
    print(f"Area: {area:.2f}, Circumference: {circumference:.2f}")
    ```

Let me trim a few things:

    ```markdown
    # Title

    Some paragraph with space character at start of line. This \<html\> should be escaped.

    - Some list item with extra space character.
      - Nested list but only one space character.

        if (a == 1) {
          return "Indented code block without enough space characters.";
        } else {
          return "Passing `finalize` or similar should resolve this.";
        }

    But when `python` is used, syntax will be like:

    ```python
    import math
    radius = float(input("This is clearly python, but let's do math."))
    area = math.pi * radius**2
    circumference = 2 * math.pi * radius
    print(f"Area: {area:.2f}, Circumference: {circumference:.2f}")
    ```
```

#### 既存Markdownファイルがなく、インラインの短縮指示がある場合

**User**

```bash
/convert-plaintext-to-md #BUGS --p "regex()=> ^ {1,}([0-9]+\.[0-9]+\.[0-9]+) to ^### $1"
```

**エージェント**

```
I see that there is no `BUGS.md` file. Let me copy the current plaintext BUGS documentation:

    ```bash
    copy BUGS BUGS.md
    ```

次に、コピーした BUGS.md を適切な Markdown に変換して更新します。
現在の内容を確認します。

    ```markdown
    1 Section
      1.1 Section Item
      1.2 Section Item
      ...
      1.12 Section Item
    ```

短縮正規表現パターンに一致させ、BUGS.md を次のように更新しました。

    ```markdown
    1 Section
    ### 1.1 Section Item
    ### 1.2 Section Item
    ### ...
    ### 1.12 Section Item
    ```
```

## 考慮事項

### パターン

- 行のインデント
- インデントされたコードブロックの識別
- fenced code blockの識別
  - コードブロックのプログラミング言語の識別
- `exit()` やタスク終了に関する手順が文書化されていても、変換処理を停止しない
  - 例:
    - `exit` or `exit()`
    - `kill` or `killall`
    - `quit` or `quit()`
    - `sleep` or `sleep()`
    - その他の類似するコマンド、関数、手順

> [!NOTE]
> 判断に迷う場合は、常にMarkdownのベストプラクティスを使い、[参照](#reference)のURLを情報源とする。

## 目標

- すべての技術的内容を正確に保持する
- 適切なMarkdown構文と書式を維持する（以下の参照を確認）
- 見出し、リスト、コードブロック、その他の要素を正しく構造化する
- 文書を読みやすく整理された状態に保つ
- 提供されたすべてのパラメーターとオプションを使い、テキストをMarkdownへ変換する統一的な指示またはスクリプトを組み立てる

### 参照

- #fetch → https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax
- #fetch → https://www.markdownguide.org/extended-syntax/
- #fetch → https://learn.microsoft.com/en-us/azure/devops/project/wiki/markdown-guidance?view=azure-devops

> [!IMPORTANT]
> プロンプトの指示で明確かつ疑いなく指定されていない限り、データを変更しない。

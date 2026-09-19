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

- **#file:{{file}}** (required) - The plain or generic text documentation file to convert to markdown.
If a corresponding `{{file}}.md` already **EXISTS**, the **EXISTING** file's content will be treated
as the plain text documentation data to be converted. If one **DOES NOT EXIST**, **CREATE NEW MARKDOWN**
by copying the original plaintext documentation file as `copy FILE FILE.md` in the same directory as
the plain text documentation file.
- **finalize** - When passed (or similar language is used), scan through the entire document and
trim space characters, indentation, and/or any additional sloppy formatting after the conversion.
- **guide #file:{{reference-file}}** - Use a previously converted markdown file as a template for
formatting patterns, structure, and conventions.
- **instructions** - Text data passed to the prompt providing additional instructions.
- **platform={{name}}** - Specify the target platform for markdown rendering to ensure compatibility:
  - **GitHub** (default) - GitHub-flavored markdown (GFM) with tables, task lists, strikethrough,
  and alerts
  - **StackOverflow** - CommonMark with StackOverflow-specific extensions
  - **VS Code** - Optimized for VS Code's markdown preview renderer
  - **GitLab** - GitLab-flavored markdown with platform-specific features
  - **CommonMark** - Standard CommonMark specification

### オプション

- **--header [1-4]** - Add markdown header tags to the document:
  - **[1-4]** - Specifies the header level to add (# through ####)
  - **#selection** - Data used to:
    - Identify sections where updates should be applied
    - Serve as a guide for applying headers to other sections or the entire document
  - **Auto-apply** (if none provided) - Add headers based on content structure
- **-p, --pattern** - Follow an existing pattern from:
  - **#selection** - A selected pattern to follow when updating the file or a portion of it
    - **IMPORTANT**: DO NOT only edit the selection when passed to `{{[-p, --pattern]}}`
    - **NOTE**: The selection is **NOT** the **WORKING RANGE**
    - Identify pattern(s) from the selection
    - **Stopping Points**:
      - If `{{[-s, --stop]}} eof` is passed or no clear endpoint is specified, convert to end of file
      - If `-s [0-9]+` is passed, convert to the line number specified in the regex `[0-9]+`
  - **Prompt instructions** - Instructional data passed with the prompt
  - **Auto-detect** (if none provided) - Identify existing patterns in the file by:
    - Analyzing where patterns occur
    - Identifying data that does not match the pattern
    - Applying patterns from one section to corresponding sections where the pattern is missing
- **-s, --stop <[0-9]+ | eof>**
  - **[0-9]+** - Line number to stop the **current** markdown conversion at
  - **eof** - If passed, or any other text clearly indicating **end of file**, convert to end of file

### 定義済みの指示

定義済みの指示が引数として渡された場合は展開し、プロンプト指示への**追加**入力として
使う。定義済みの指示だけが渡され、追加入力がない場合は、それを現在のプロンプトへの
指示として使う。

#### 構文

```bash
/convert-plaintext-to-md pre=<name>
```

#### 定義済み

- **rm-head-digits** - Remove any prepending numbers from the headers when updating or converting the
plaintext to markdown.
- **mv-head-level(x, y)** - Change the heading level from level `x` header to a level `y` header when
updating or converting plaintext to markdown.
- **rm-indent(x)** - Decrease the indentation of paragraphs or raw text data portions of the file by
`x` when updating or converting plaintext to markdown.

> [!NOTE]
> 一致する**定義済み指示**がない場合、現在のプロンプトでは `pre=name` を無視する。

### 使用例

#### 基本的な使用

**User**

```bash
/convert-plaintext-to-md #file
```

**Agent**

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

**Agent**

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

**Agent**

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

**Agent**

```
I see that there is no `BUGS.md` file. Let me copy the current plaintext BUGS documentation:

    ```bash
    copy BUGS BUGS.md
    ```

Now I'll update the copied file BUGS.md, converting it to proper markdown.
Let me read the current contents:

    ```markdown
    1 Section
      1.1 Section Item
      1.2 Section Item
      ...
      1.12 Section Item
    ```

OK, I've matched the shorthand regular expression pattern and updated the BUGS.md to:

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

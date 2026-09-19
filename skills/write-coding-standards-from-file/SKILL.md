---
name: write-coding-standards-from-file
description: 'プロンプトの引数で渡されたファイルまたはフォルダーのコーディングスタイルを使い、プロジェクトのコーディング標準ドキュメントを書く。'
---
# ファイルからコーディング標準を書く

ファイルの既存構文を使い、プロジェクトの標準とスタイルガイドを定める。複数のファイルまたはフォルダーが渡された場合は、各ファイルまたはフォルダー内のファイルを順に処理し、データを一時メモリまたはファイルへ追記する。完了後は一時データを単一の入力として使い、そのファイル名を基に標準とスタイルガイドを作成する。

## ルールと構成

以下は準設定用の `boolean` および `string[]` 変数である。各変数の `true` やその他の値を処理する条件は、レベル 2 見出し `## Variable and Parameter Configuration Conditions` の下に記載する。

プロンプト パラメーターにはテキスト定義がある。必須パラメーターは **`${fileName}`** の 1 つで、任意パラメーターとして **`${folderName}`**、**`${instructions}`**、および任意の **`[configVariableAsParameter]`** がある。

### 構成変数

* addStandardsTest = false;
* addToREADME = false;
* addToREADMEInsertions = ["atBegin", "middle", "beforeEnd", "bestFitUsingContext"];
  - 既定値は **beforeEnd**。
* createNewFile = true;
* fetchStyleURL = true;
* findInconsistencies = true;
* fixInconsistencies = true;
* newFileName = ["CONTRIBUTING.md", "STYLE.md", "CODE_OF_CONDUCT.md", "CODING_STANDARDS.md", "DEVELOPING.md", "CONTRIBUTION_GUIDE.md", "GUIDELINES.md", "PROJECT_STANDARDS.md", "BEST_PRACTICES.md", "HACKING.md"];
  - `${newFileName}` の各ファイルについて、存在しなければそのファイル名を使って `break` し、存在すれば `${newFileName}` の次のファイル名へ進む。
* outputSpecToPrompt = false;
* useTemplate = "verbose"; // or "v"
  - 使用可能な値は `[["v", "verbose"], ["m", "minimal"], ["b", "best fit"], ["custom"]]`。
  - プロンプト ファイル末尾のレベル 2 見出し `## Coding Standards Templates` にある 2 つの例から 1 つを選ぶか、より適した構成を使う。
  - **custom** の場合は依頼に従って適用する。

### プロンプトパラメーターとしての構成変数

変数名がそのまま、または明らかに関連する同等のテキスト値としてプロンプトに渡された場合は、渡された値で既定値を上書きする。

### プロンプトパラメーター

* **fileName** = インデント、変数名、コメント、条件処理、関数処理、その他の構文関連データを、ファイルのプログラミング言語について分析する対象ファイル名。
* folderName = 複数ファイルからデータを抽出して 1 つの集約データセットにし、ファイルのプログラミング言語についてインデント、変数名、コメント、条件処理、関数処理、その他の構文関連データを分析する対象フォルダー名。
* instructions = 特殊なケースに適用する追加の指示、規則、手順。
* [configVariableAsParameter] = 渡された場合に構成変数の既定状態を上書きする。例:
  - useTemplate = 渡された場合に構成 `${useTemplate}` の既定値を上書きする。値は `[["v", "verbose"], ["m", "minimal"], ["b", "best fit"]]`。

#### 必須パラメーターと任意パラメーター

* **fileName** - required
* folderName - *optional*
* instructions - *optional*
* [configVariableAsParameter] - *optional*

## 変数とパラメーターの構成条件

### `${fileName}.length > 1 || ${folderName} != undefined`

* true の場合は `${fixInconsistencies}` を false に切り替える。

### `${addToREADME} == true`

* コーディング標準をプロンプトへ出力したり新規ファイルを作成したりせず、`README.md` に挿入する。
* true の場合は `${createNewFile}` と `${outputSpecToPrompt}` の両方を false に切り替える。

### `${addToREADMEInsertions} == "atBegin"`

* `${addToREADME}` が true の場合、`README.md` のタイトルの後、**先頭**にコーディング標準データを挿入する。

### `${addToREADMEInsertions} == "middle"`

* `${addToREADME}` が true の場合、`README.md` の**中央**にコーディング標準データを挿入し、標準のタイトル見出しを `README.md` の構成に合わせて変更する。

### `${addToREADMEInsertions} == "beforeEnd"`

* `${addToREADME}` が true の場合、`README.md` の**末尾**に、最後の文字の後で改行してコーディング標準データを挿入する。

### `${addToREADMEInsertions} == "bestFitUsingContext"`

* `${addToREADME}` が true の場合、`README.md` の構成と情報の流れに最も適した行へコーディング標準データを挿入する。

### `${addStandardsTest} == true`

* コーディング標準ファイルの完成後、渡されたファイルまたはファイル群が標準に従っていることを確認するテスト ファイルを書く。

### `${createNewFile} == true`

* `${newFileName}` の値または使用可能な値のいずれかで新しいファイルを作成する。
* true の場合は `${outputSpecToPrompt}` と `${addToREADME}` の両方を false に切り替える。

### `${fetchStyleURL} == true`

* レベル 3 見出し `### Fetch Links` の下にあるリンクから取得したデータも、新規ファイル、プロンプト、`README.md` の標準、仕様、スタイル情報を作成するコンテキストとして使う。
* `### Fetch Links` の関連項目ごとに `#fetch ${item}` を実行する。

### `${findInconsistencies} == true`

* インデント、改行、コメント、条件と関数のネスト、文字列の引用符（`'` または `"`）などの構文を評価し、分類する。
* 各分類の件数を数え、1 つの項目が多数派と一致しない場合は一時メモリに記録する。
* `${fixInconsistencies}` の状態に応じて、少数派の分類を多数派に合わせて編集・修正するか、一時メモリに保存した不一致をプロンプトへ出力する。

### `${fixInconsistencies} == true`

* 一時メモリに保存した不一致を使い、構文データの少数派分類を対応する多数派の構文データに合わせて編集・修正する。

### `typeof ${newFileName} == "string"`

* `string` として明示的に定義されている場合は、`${newFileName}` の値で新しいファイルを作成する。

### `typeof ${newFileName} != "string"`

* `string` として明示的に定義されておらず、`object` または配列の場合は、次の規則で `${newFileName}` の値を使って新しいファイルを作成する:
  - `${newFileName}` の各ファイル名について、存在しなければその名前を使って `break` し、存在すれば次へ進む。

### `${outputSpecToPrompt} == true`

* ファイルを作成したり README に追加したりせず、コーディング標準をプロンプトへ出力する。
* true の場合は `${createNewFile}` と `${addToREADME}` の両方を false に切り替える。

### `${useTemplate} == "v" || ${useTemplate} == "verbose"`

* コーディング標準データを構成する際の指針として、レベル 3 見出し `### "v", "verbose"` の下のデータを使う。

### `${useTemplate} == "m" || ${useTemplate} == "minimal"`

* コーディング標準データを構成する際の指針として、レベル 3 見出し `### "m", "minimal"` の下のデータを使う。

### `${useTemplate} == "b" || ${useTemplate} == "best"`

* `${fileName}` から抽出したデータに応じてレベル 3 見出し `### "v", "verbose"` または `### "m", "minimal"` のデータを使い、最適なものをコーディング標準データの構成指針にする。

### `${useTemplate} == "custom" || ${useTemplate} == "<ANY_NAME>"`

* 渡されたカスタム プロンプト、指示、テンプレート、その他のデータをコーディング標準データの構成指針にする。

## **if** `${fetchStyleURL} == true`

プログラミング言語に応じて、`${fileName} == [<Language> Style Guide]` の場合は、以下の各リンクに対して `#fetch (URL)` を実行する。

### 取得するリンク

- [C スタイル ガイド](https://users.ece.cmu.edu/~eno/coding/CCodingStandard.html)
- [C# スタイル ガイド](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions)
- [C++ スタイル ガイド](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines)
- [Go スタイル ガイド](https://github.com/golang-standards/project-layout)
- [Java スタイル ガイド](https://coderanch.com/wiki/718799/Style)
- [AngularJS アプリ スタイル ガイド](https://github.com/mgechev/angularjs-style-guide)
- [jQuery スタイル ガイド](https://contribute.jquery.org/style-guide/js/)
- [JavaScript スタイル ガイド](https://www.w3schools.com/js/js_conventions.asp)
- [JSON スタイル ガイド](https://google.github.io/styleguide/jsoncstyleguide.xml)
- [Kotlin スタイル ガイド](https://kotlinlang.org/docs/coding-conventions.html)
- [Markdown スタイル ガイド](https://cirosantilli.com/markdown-style-guide/)
- [Perl スタイル ガイド](https://perldoc.perl.org/perlstyle)
- [PHP スタイル ガイド](https://phptherightway.com/)
- [Python スタイル ガイド](https://peps.python.org/pep-0008/)
- [Ruby スタイル ガイド](https://rubystyle.guide/)
- [Rust スタイル ガイド](https://github.com/rust-lang/rust/tree/HEAD/src/doc/style-guide/src)
- [Swift スタイル ガイド](https://www.swift.org/documentation/api-design-guidelines/)
- [TypeScript スタイル ガイド](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Visual Basic スタイル ガイド](https://en.wikibooks.org/wiki/Visual_Basic/Coding_Standards)
- [シェル スクリプト スタイル ガイド](https://google.github.io/styleguide/shellguide.html)
- [Git 使用スタイル ガイド](https://github.com/agis/git-style-guide)
- [PowerShell スタイル ガイド](https://github.com/PoshCode/PowerShellPracticeAndStyle)
- [CSS スタイル ガイド](https://cssguidelin.es/)
- [Sass スタイル ガイド](https://sass-guidelin.es/)
- [HTML スタイル ガイド](https://github.com/marcobiedermann/html-style-guide)
- [Linux カーネル スタイル ガイド](https://www.kernel.org/doc/html/latest/process/coding-style.html)
- [Node.js スタイル ガイド](https://github.com/felixge/node-style-guide)
- [SQL スタイル ガイド](https://www.sqlstyle.guide/)
- [Angular スタイル ガイド](https://angular.dev/style-guide)
- [Vue スタイル ガイド](https://vuejs.org/style-guide/rules-strongly-recommended.html)
- [Django スタイル ガイド](https://docs.djangoproject.com/en/dev/internals/contributing/writing-code/coding-style/)
- [SystemVerilog スタイル ガイド](https://github.com/lowRISC/style-guides/blob/master/VerilogCodingStyle.md)

## コーディング標準のテンプレート

### `"m", "minimal"`

```text
    ```markdown
    ## 1. Introduction
    *   **Purpose:** Briefly explain why the coding standards are being established (e.g., to improve code quality, maintainability, and team collaboration).
    *   **Scope:** Define which languages, projects, or modules this specification applies to.

    ## 2. Naming Conventions
    *   **Variables:** `camelCase`
    *   **Functions/Methods:** `PascalCase` or `camelCase`.
    *   **Classes/Structs:** `PascalCase`.
    *   **Constants:** `UPPER_SNAKE_CASE`.

    ## 3. Formatting and Style
    *   **Indentation:** Use 4 spaces per indent (or tabs).
    *   **Line Length:** Limit lines to a maximum of 80 or 120 characters.
    *   **Braces:** Use the "K&R" style (opening brace on the same line) or the "Allman" style (opening brace on a new line).
    *   **Blank Lines:** Specify how many blank lines to use for separating logical blocks of code.

    ## 4. Commenting
    *   **Docstrings/Function Comments:** Describe the function's purpose, parameters, and return values.
    *   **Inline Comments:** Explain complex or non-obvious logic.
    *   **File Headers:** Specify what information should be included in a file header, such as author, date, and file description.

    ## 5. Error Handling
    *   **General:** How to handle and log errors.
    *   **Specifics:** Which exception types to use, and what information to include in error messages.

    ## 6. Best Practices and Anti-Patterns
    *   **General:** List common anti-patterns to avoid (e.g., global variables, magic numbers).
    *   **Language-specific:** Specific recommendations based on the project's programming language.

    ## 7. Examples
    *   Provide a small code example demonstrating the correct application of the rules.
    *   Provide a small code example of an incorrect implementation and how to fix it.

    ## 8. Contribution and Enforcement
    *   Explain how the standards are to be enforced (e.g., via code reviews).
    *   Provide a guide for contributing to the standards document itself.
    ```
```

### `"v", verbose"`

```text
    ```markdown

    # Style Guide

    This document defines the style and conventions used in this project.
    All contributions should follow these rules unless otherwise noted.

    ## 1. General Code Style

    - Favor clarity over brevity.
    - Keep functions and methods small and focused.
    - Avoid repeating logic; prefer shared helpers/utilities.
    - Remove unused variables, imports, code paths, and files.

    ## 2. Naming Conventions

    Use descriptive names. Avoid abbreviations unless well-known.

    | Item            | Convention           | Example            |
    |-----------------|----------------------|--------------------|
    | Variables       | `lower_snake_case`   | `buffer_size`      |
    | Functions       | `lower_snake_case()` | `read_file()`      |
    | Constants       | `UPPER_SNAKE_CASE`   | `MAX_RETRIES`      |
    | Types/Structs   | `PascalCase`         | `FileHeader`       |
    | File Names      | `lower_snake_case`   | `file_reader.c`    |

    ## 3. Formatting Rules

    - Indentation: **4 spaces**
    - Line length: **max 100 characters**
    - Encoding: **UTF-8**, no BOM
    - End files with a newline

    ### Braces (example in C, adjust for your language)

        ```c
        if (condition) {
            do_something();
        } else {
            do_something_else();
        }
        ```

    ### Spacing

    - One space after keywords: `if (x)`, not `if(x)`
    - One blank line between top-level functions

    ## 4. Comments & Documentation

    - Explain *why*, not *what*, unless intent is unclear.
    - Keep comments up-to-date as code changes.
    - Public functions should include a short description of purpose and parameters.

    Recommended tags:

        ```text
        TODO: follow-up work
        FIXME: known incorrect behavior
        NOTE: non-obvious design decision
        ```

    ## 5. Error Handling

    - Handle error conditions explicitly.
    - Avoid silent failures; either return errors or log them appropriately.
    - Clean up resources (files, memory, handles) before returning on failure.

    ## 6. Commit & Review Practices

    ### Commits
    - One logical change per commit.
    - Write clear commit messages:

        ```text
        Short summary (max ~50 chars)
        Optional longer explanation of context and rationale.
        ```

    ### Reviews
    - Keep pull requests reasonably small.
    - Be respectful and constructive in review discussions.
    - Address requested changes or explain if you disagree.

    ## 7. Tests

    - Write tests for new functionality.
    - Tests should be deterministic (no randomness without seeding).
    - Prefer readable test cases over complex test abstraction.

    ## 8. Changes to This Guide

    Style evolves.
    Propose improvements by opening an issue or sending a patch updating this document.
    ```
```

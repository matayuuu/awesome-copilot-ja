---
name: create-tldr-page
description: '文書URLとコマンド例からtldrページを作成する。URLとコマンド名の両方を必須とする。'
---

# TLDRページの作成

## 概要

あなたはtldr-pagesプロジェクトの標準に従い、簡潔で実用的な `tldr` ページを作成する
技術文書の専門家である。詳細な文書を、明確で例を中心としたコマンドリファレンスへ
変換する。

## 目的

1. **URLとコマンドの両方を必須にする** - どちらかがない場合は、入手方法を分かりやすく案内する
2. **主要な例を抽出する** - 最も一般的で有用なコマンドパターンを特定する
3. **tldr形式を厳守する** - 適切なMarkdown書式でテンプレート構造を使う
4. **文書の情報源を検証する** - URLが信頼できる上流の文書を指していることを確認する

## プロンプトパラメーター

### 必須

* **コマンド** - コマンドまたはツールの名前（例: `git`、`nmcli`、`distrobox-create`）
* **URL** - 信頼できる上流文書へのリンク
  - `#fetch` を前置きせず1つ以上のURLが渡された場合は、最初のURLに #tool:fetch を適用する
  - URLの代わりに ${file} が渡され、${file} に**コマンド**と関連するURLがある場合は、
  URLから取得した場合と同様にファイル内のデータを使う。`tldr` ページの作成時には
  ファイルから抽出したURLを使う
    - ファイル内に複数のURLがある場合は、`tldr` ページに使うURLを確認する

### 任意

* **コンテキストファイル** - 追加の文書または例
* **検索データ** - 文書検索の結果
* **テキストデータ** - マニュアルページまたはヘルプ出力の生テキスト
* **ヘルプ出力** - `-h`、`--help`、`/?`、`--tldr`、`--man` などに対応する生データ

> [!IMPORTANT]
> `--help` や `--tldr` などのヘルプ引数が渡された場合は、このプロンプトの要約を、
tldrテンプレート形式のMarkdownとして出力する。そのコマンド用の新しいtldrページは
作成しない。

## 使用方法

### 構文

```bash
/create-tldr-page #fetch <URL> <command> [text data] [context file]
```

### エラー処理

#### コマンドがない場合

**User**

```bash
/create-tldr-page https://some-command.io/docs/manual.html
```

**Agent**

```text
I'll fetch the URL and analyze the documentation.
From the data extracted, I assume the command is `some-command`. Is this correct? (yes/no)
```

#### URLがない場合

**User**

```bash
/create-tldr-page some-command
```

**Agent**

```text
A URL to authoritative documentation is required for tldr pages. Here are some acceptable URL
patterns:

1. https://gnu.org/software/manual/html_node/some-command.html
2. https://some.org/serve/some.man.html#some-command
3. https://some-command.io/docs/cli/latest/manual
4. https://some-command.io/docs/quickstart

Please provide the documentation URL for `some-command`.
```

## テンプレート

tldrページを作成するときは、次のテンプレート構造を使う。

```markdown
# command

> Short, snappy description.
> Some subcommands such as `subcommand1` have their own usage documentation.
> More information: <https://url-to-upstream.tld>.

- View documentation for creating something:

`tldr command-subcommand1`

- View documentation for managing something:

`tldr command-subcommand2`
```

### テンプレートの指針

- **タイトル**: 正確なコマンド名を小文字で使う
- **説明**: コマンドの機能を1行で要約する
- **サブコマンドの注記**: 関連する場合だけ含める
- **詳細情報**: 信頼できる上流文書へのリンク（必須）
- **例**: 最も一般的なユースケースを利用頻度順に5～8件示す
- **プレースホルダー**: ユーザーが指定する値には `{{placeholder}}` 構文を使う

## 例

### 参考例

適切な形式とスタイルを理解するため、次のtldrページ例を取得してもよい。

* [git](https://raw.githubusercontent.com/jhauga/tldr/refs/heads/main/pages/common/git.md)
* [distrobox-create](https://raw.githubusercontent.com/jhauga/tldr/refs/heads/main/pages/linux/distrobox-create.md)
* [nmcli](https://raw.githubusercontent.com/jhauga/tldr/refs/heads/main/pages/linux/nmcli.md)

### 例を使った期待出力

**User**

```bash
/create-tldr-page #fetch https://git-scm.com/docs/git git
```

**Agent**

````markdown
# git

> Distributed version control system.
> Some subcommands such as `commit`, `add`, `branch`, `switch`, `push`, etc. have their own usage documentation.
> More information: <https://git-scm.com/docs/git>.

- Create an empty Git repository:

`git init`

- Clone a remote Git repository from the internet:

`git clone {{https://example.com/repo.git}}`

- View the status of the local repository:

`git status`

- Stage all changes for a commit:

`git add {{[-A|--all]}}`

- Commit changes to version history:

`git commit {{[-m|--message]}} {{message_text}}`

- Push local commits to a remote repository:

`git push`

- Pull any changes made to a remote:

`git pull`

- Reset everything the way it was in the latest commit:

`git reset --hard; git clean {{[-f|--force]}}`
````

### 出力書式の規則

次のプレースホルダー規則に必ず従う。

- **引数を取るオプション**: オプションと引数の両方を別々に囲む
  - 例: `minipro {{[-p|--device]}} {{chip_name}}`
  - 例: `git commit {{[-m|--message]}} {{message_text}}`
  - `minipro -p {{chip_name}}` のように組み合わせてはならない（誤り）

- **引数を取らないオプション**: 引数を取らない単独のオプション（フラグ）を囲む
  - 例: `minipro {{[-E|--erase]}}`
  - 例: `git add {{[-A|--all]}}`

- **単独の短縮オプション**: 長い形式なしで単独使用する短縮オプションは囲まない
  - 例: `ls -l`（囲まない）
  - 例: `minipro -L`（囲まない）
  - ただし短縮形式と長い形式の両方がある場合は囲む: `{{[-l|--list]}}`

- **サブコマンド**: ユーザーが指定する変数でない限り、通常は囲まない
  - 例: `git init`（囲まない）
  - 例: `tldr {{command}}`（変数なので囲む）

- **引数とオペランド**: ユーザーが指定する値は常に囲む
  - 例: `{{device_name}}`、`{{chip_name}}`、`{{repository_url}}`
  - ファイルパスの例: `{{path/to/file}}`
  - URLの例: `{{https://example.com}}`

- **コマンド構造**: プレースホルダー構文では、オプションを引数より前に置く
  - 正しい: `command {{[-o|--option]}} {{value}}`
  - 誤り: `command -o {{value}}`

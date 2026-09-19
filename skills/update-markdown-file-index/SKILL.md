---
name: update-markdown-file-index
description: '指定フォルダー内のファイル一覧をインデックスまたは表としてMarkdownファイルのセクションに反映します。'
---
# Markdownファイルインデックスの更新

`${input:folder}` フォルダー内のファイル一覧をインデックスまたは表としてMarkdownファイル `${file}` に反映します。

## プロセス

1. **スキャン**: 対象Markdownファイル `${file}` を読み、既存の構造を理解する
2. **検出**: 指定フォルダー `${input:folder}` でパターン `${input:pattern}` に一致するすべてのファイルを一覧化する
3. **分析**: 更新対象の既存の表/インデックスセクションを特定するか、新しい構造を作る
4. **構成**: ファイル種別と既存内容に基づき、適切な表またはリスト形式を生成する
5. **更新**: 既存セクションを置き換えるか、ファイルインデックスを含む新しいセクションを追加する
6. **検証**: Markdown構文が有効で、書式が一貫していることを確認する

## ファイル分析

検出した各ファイルから次の情報を抽出します。

- **Name**: 状況に応じた拡張子付きまたは拡張子なしのファイル名
- **Type**: ファイル拡張子とカテゴリ（例: `.md`、`.js`、`.py`）
- **Description**: 1行目のコメント、ヘッダー、または推定した用途
- **Size**: 参照用のファイルサイズ（任意）
- **Modified**: 最終更新日時（任意）

## Table Structure Options

Choose format based on file types and existing content:

### Option 1: Simple List

```markdown
## Files in ${folder}

- [filename.ext](path/to/filename.ext) - Description
- [filename2.ext](path/to/filename2.ext) - Description
```

### Option 2: Detailed Table

```markdown
| File | Type | Description |
|------|------|-------------|
| [filename.ext](path/to/filename.ext) | Extension | Description |
| [filename2.ext](path/to/filename2.ext) | Extension | Description |
```

### Option 3: Categorized Sections

Group files by type/category with separate sections or sub-tables.

## 更新戦略

- 🔄 **既存を更新**: 表/インデックスセクションがあれば、構造を保ったまま内容を置き換える
- ➕ **新規追加**: 既存セクションがなければ、最適な形式で新しいセクションを作る
- 📋 **保持**: 既存のMarkdown書式、見出しレベル、文書の流れを維持する
- 🔗 **リンク**: リポジトリ内のファイルリンクには相対パスを使う

## セクションの識別

次のパターンに該当する既存セクションを探します。

- "index"、"files"、"contents"、"directory"、"list" を含む見出し
- ファイル関連の列を持つ表
- ファイルリンクを含むリスト
- ファイルインデックスセクションを示すHTMLコメント

## 要件

- 既存のMarkdown構造と書式を保持する
- ファイルリンクには相対パスを使う
- 取得できる場合はファイルの説明を含める
- 既定ではファイルをアルファベット順に並べる
- ファイル名の特殊文字を処理する
- 生成したすべてのMarkdown構文を検証する

---
name: git-commit
description: 'Conventional Commitメッセージの分析、インテリジェントなステージング、メッセージ生成を行ってgit commitを実行します。ユーザーが変更のコミット、git commitの作成、または「/commit」に言及した場合に使用します。次をサポートします: (1) 変更からのtypeとscopeの自動検出、(2) 差分からのConventional Commitメッセージ生成、(3) type/scope/descriptionを任意に上書きできる対話的コミット、(4) 論理的なグループ化のためのインテリジェントなファイルステージング'
license: MIT
allowed-tools: Bash
---

# Conventional CommitsによるGitコミット

## 概要

Conventional Commits仕様に従って、標準化された意味のあるgitコミットを作成します。実際の差分を分析し、適切なtype、scope、メッセージを決定します。

## Conventional Commit Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## コミット種別

| 種別       | 目的                           |
| ---------- | ------------------------------ |
| `feat`     | 新機能                         |
| `fix`      | バグ修正                       |
| `docs`     | ドキュメントのみ               |
| `style`    | フォーマット／スタイル（ロジック変更なし） |
| `refactor` | コードリファクタリング（機能追加・修正なし） |
| `perf`     | パフォーマンス改善             |
| `test`     | テストの追加／更新             |
| `build`    | ビルドシステム／依存関係        |
| `ci`       | CI／設定変更                   |
| `chore`    | 保守／その他                   |
| `revert`   | コミットの取り消し             |

## Breaking Changes

```
# Exclamation mark after type/scope
feat!: remove deprecated endpoint

# BREAKING CHANGE footer
feat: allow config to extend other configs

BREAKING CHANGE: `extends` key behavior changed
```

## ワークフロー

### 1. 差分を分析する

```bash
# If files are staged, use staged diff
git diff --staged

# If nothing staged, use working tree diff
git diff

# Also check status
git status --porcelain
```

### 2. ファイルをステージする（必要な場合）

何もステージされていない場合、または変更を別の方法でグループ化したい場合:

```bash
# Stage specific files
git add path/to/file1 path/to/file2

# Stage by pattern
git add *.test.*
git add src/components/*

# Interactive staging
git add -p
```

**秘密情報（.env、credentials.json、秘密鍵）は絶対にコミットしないでください。**

### 3. コミットメッセージを生成する

差分を分析して、次を決定します:

- **Type**: どのような変更か
- **Scope**: どの領域／モジュールが影響を受けるか
- **Description**: 変更内容の1行要約（現在形、命令形、72文字未満）

### 4. コミットを実行する

```bash
# Single line
git commit -m "<type>[scope]: <description>"

# Multi-line with body/footer
git commit -m "$(cat <<'EOF'
<type>[scope]: <description>

<optional body>

<optional footer>
EOF
)"
```

## ベストプラクティス

- 1つのコミットには1つの論理的な変更を含める
- 現在形を使う: "added" ではなく "add"
- 命令形を使う: "fixes bug" ではなく "fix bug"
- Issueを参照する: `Closes #123`、`Refs #456`
- descriptionは72文字未満にする

## Gitの安全プロトコル

- git configは絶対に更新しない
- 明示的な依頼なしに破壊的なコマンド（--force、hard reset）を絶対に実行しない
- ユーザーが依頼しない限りフック（--no-verify）を絶対にスキップしない
- main/masterへ絶対にforce pushしない
- フックが原因でコミットに失敗した場合は、修正して新しいコミットを作成する（amendしない）

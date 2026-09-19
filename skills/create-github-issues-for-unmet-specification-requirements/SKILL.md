---
name: create-github-issues-for-unmet-specification-requirements
description: '仕様ファイル内の未実装要件についてfeature_request.ymlテンプレートを使ってGitHub Issueを作成する。'
---

# 未達の仕様要件からGitHub Issueを作成

`${file}` にある仕様の未実装要件についてGitHub Issueを作成する。

## 手順

1. 仕様ファイルを分析してすべての要件を抽出する
2. 各要件についてコードベースの実装状況を確認する
3. 重複を避けるため `search_issues` で既存Issueを検索する
4. 未実装要件ごとに `create_issue` で新しいIssueを作成する
5. `feature_request.yml` テンプレートを使う（利用できない場合は既定を使う）

## 要件

- 仕様内の未実装要件ごとに1件のIssueを作成する
- 要件IDと説明の対応を明確にする
- 実装指針と受け入れ条件を含める
- 作成前に既存Issueと照合する

## Issueの内容

- タイトル: 要件IDと簡潔な説明
- 説明: 詳細な要件、実装方法、背景
- ラベル: 必要に応じてfeature、enhancement

## 実装状況の確認

- 関連するコードパターンをコードベースで検索する
- `/spec/` ディレクトリ内の関連仕様ファイルを確認する
- 要件が部分的に実装済みでないことを確認する

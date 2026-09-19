---
name: create-github-issue-feature-from-specification
description: '仕様ファイルからfeature_request.ymlテンプレートを使って機能要求のGitHub Issueを作成する。'
---

# 仕様からGitHub Issueを作成

`${file}` にある仕様のGitHub Issueを作成する。

## 手順

1. 仕様ファイルを分析して要件を抽出する
2. `search_issues` で既存Issueを確認する
3. `create_issue` で新しいIssueを作成するか、`update_issue` で既存Issueを更新する
4. `feature_request.yml` テンプレートを使う（利用できない場合は既定を使う）

## 要件

- 仕様全体につき1件のIssueとする
- 仕様を識別できる明確なタイトルを付ける
- 仕様で必要とされる変更だけを含める
- 作成前に既存Issueと照合する

## Issueの内容

- タイトル: 仕様に記載された機能名
- 説明: 問題提起、提案する解決策、背景
- ラベル: 必要に応じてfeature、enhancement

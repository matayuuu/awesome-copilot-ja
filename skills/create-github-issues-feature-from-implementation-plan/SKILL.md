---
name: create-github-issues-feature-from-implementation-plan
description: '実装計画の各フェーズからfeature_request.ymlまたはchore_request.ymlテンプレートを使ってGitHub Issueを作成する。'
---

# 実装計画からGitHub Issueを作成

`${file}` にある実装計画のGitHub Issueを作成する。

## 手順

1. 計画ファイルを分析してフェーズを特定する
2. `search_issues` で既存Issueを確認する
3. フェーズごとに `create_issue` で新しいIssueを作成するか、`update_issue` で既存Issueを更新する
4. `feature_request.yml` または `chore_request.yml` テンプレートを使う（利用できない場合は既定を使う）

## 要件

- 実装フェーズごとに1件のIssueを作成する
- 明確で構造化されたタイトルと説明を付ける
- 計画で必要とされる変更だけを含める
- 作成前に既存Issueと照合する

## Issueの内容

- タイトル: 実装計画のフェーズ名
- 説明: フェーズの詳細、要件、背景
- ラベル: Issue種別に適したもの（feature/chore）

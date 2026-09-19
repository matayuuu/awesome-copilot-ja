---
name: ai-ready
description: '任意のリポジトリをAI対応にします。コードベースを分析し、AGENTS.md、copilot-instructions.md、CIワークフロー、Issueテンプレートなどを生成します。PRレビューの傾向を分析してスタックに合ったファイルを作成します。ユーザーが「make this repo ai-ready」、「set up AI config」、「prepare this repo for AI contributions」と依頼したときに使用してください。'
---

# AI対応

このスキルは、[John Papa](https://github.com/johnpapa) による最新の [ai-ready](https://github.com/johnpapa/ai-ready) スキルをユーザーがインストールできるよう支援します。

*理由*: 完全な ai-ready スキルには頻繁に更新される約600行の詳細な指示があります。このラッパーによりここで発見できる状態を保ちつつ、常に最新である [johnpapa/ai-ready](https://github.com/johnpapa/ai-ready) を正本として扱えます。

## 手順

1. Copilot CLI 内で次のコマンドを実行してスキルを追加するよう、ユーザーに伝えます。

   ```
   /skills add johnpapa/ai-ready
   ```

   これにより、スキルの最新バージョンがユーザーの個人スキルディレクトリへダウンロードされます。コマンドを再実行すると最新バージョンへ更新されます。

2. 読み込む前にスキルを確認するよう、ユーザーに促します。次のコマンドで内容を確認できます。
   ```bash
   head -20 ~/.copilot/skills/ai-ready/SKILL.md
   ```
3. ユーザーが確認とインストールを終えたら、`/skills reload` でスキルを再読み込みしてから `make this repo ai-ready` と指示するよう伝えます。
4. ユーザーの代わりにコマンドを実行しては**いけません**。ユーザー自身が実行する必要があります。

---
name: suggest-awesome-github-copilot-skills
description: '現在のリポジトリのコンテキストとチャット履歴に基づき、awesome-copilot リポジトリから関連する GitHub Copilot Skill を提案する。現在のリポジトリにある既存の Skill との重複を避け、更新が必要な古い Skill を特定する。'
---
# Awesome GitHub Copilot Skills を提案する

現在のリポジトリのコンテキストを分析し、[GitHub awesome-copilot repository](https://github.com/github/awesome-copilot/blob/main/docs/README.skills.md) から、このリポジトリにまだない関連する Agent Skill を提案します。Agent Skill は awesome-copilot の [skills](https://github.com/github/awesome-copilot/tree/main/skills) フォルダーにある自己完結型フォルダーで、それぞれ `SKILL.md` と任意の同梱アセットを含みます。

## 手順

1. **利用可能な Skill を取得**: [awesome-copilot README.skills.md](https://github.com/github/awesome-copilot/blob/main/docs/README.skills.md) から一覧と説明を抽出する。`#fetch` tool を必ず使う。
2. **ローカル Skill を調査**: `.github/skills/` フォルダーにある既存の Skill フォルダーを見つける
3. **説明を抽出**: ローカルの `SKILL.md` ファイルから front matter を読み、`name` と `description` を取得する
4. **リモート版を取得**: 各ローカル Skill について、raw GitHub URL（例: `https://raw.githubusercontent.com/github/awesome-copilot/main/skills/<skill-name>/SKILL.md`）で対応する `SKILL.md` を取得する
5. **版を比較**: ローカル Skill とリモート版を比較し、次を特定する:
   - 最新版と一致する Skill
   - 内容が異なる古い Skill
   - 古い Skill の主な差分（説明、指示、同梱アセット）
6. **コンテキストを分析**: チャット履歴、リポジトリファイル、現在のプロジェクト要件を確認する
7. **既存と比較**: このリポジトリで利用可能な Skill と比較する
8. **関連性を判定**: 利用可能な Skill を、特定したパターンと要件に照らして比較する
9. **選択肢を提示**: 古い Skill を含め、関連する Skill を説明、理由、利用状況とともに示す
10. **検証**: 提案する Skill が既存のものでは提供されない価値を加えることを確認する
11. **出力**: 提案、説明、awesome-copilot の Skill と類似するローカル Skill へのリンクを構造化された表で示す
    **待機**: 特定の Skill のインストールまたは更新をユーザーが依頼するまで待つ。明示的な依頼なしにインストールまたは更新してはならない。
12. **アセットをダウンロードまたは更新**: 要求された Skill について、次を自動的に行う:
    - フォルダー構成を維持したまま、新しい Skill を `.github/skills/` フォルダーへダウンロードする
    - 古い Skill を awesome-copilot の最新版に置き換えて更新する
    - `SKILL.md` と同梱アセット（スクリプト、テンプレート、データファイル）をすべてダウンロードする
    - ファイルの内容を調整してはならない
    - アセットのダウンロードには `#fetch` tool を使う。ただし、内容を確実に取得するため `#runInTerminal` tool で `curl` を使ってもよい
    - 進捗を追跡するには `#todos` tool を使う

## コンテキスト分析の基準

🔍 **リポジトリのパターン**:
- 使用言語（.cs、.js、.py、.ts など）
- フレームワークの手がかり（ASP.NET、React、Azure、Next.js など）
- プロジェクト種別（Web アプリ、API、ライブラリ、ツール、インフラ）
- 開発ワークフローの要件（テスト、CI/CD、デプロイ）
- インフラとクラウドプロバイダー（Azure、AWS、GCP）

🗨️ **チャット履歴のコンテキスト**:
- 最近の議論と課題
- 機能依頼または実装要件
- コードレビューパターン
- 開発ワークフローの要件
- 特殊な作業要件（図解、評価、デプロイ）

## 出力形式

awesome-copilot の Skill と既存のリポジトリ Skill を比較する構造化された表で分析結果を表示します。

| Awesome-Copilot Skill | 説明 | 同梱アセット | インストール済み | 類似するローカル Skill | 提案理由 |
|-----------------------|-------------|----------------|-------------------|---------------------|---------------------|
| [gh-cli](https://github.com/github/awesome-copilot/tree/main/skills/gh-cli) | リポジトリとワークフローを管理する GitHub CLI Skill | なし | ❌ なし | なし | GitHub ワークフローの自動化機能を強化できる |
| [aspire](https://github.com/github/awesome-copilot/tree/main/skills/aspire) | 分散アプリケーション開発向け Aspire Skill | 9 個の参照ファイル | ✅ あり | aspire | 既存の Aspire Skill で対応済み |
| [terraform-azurerm-set-diff-analyzer](https://github.com/github/awesome-copilot/tree/main/skills/terraform-azurerm-set-diff-analyzer) | Terraform AzureRM プロバイダーの変更を分析する Skill | 参照ファイル | ⚠️ 古い | terraform-azurerm-set-diff-analyzer | 新しい検証パターンに更新されているため、更新を推奨 |

## ローカル Skill の検出手順

1. `.github/skills/` ディレクトリのフォルダーをすべて一覧する
2. 各フォルダーの `SKILL.md` front matter を読み、`name` と `description` を抽出する
3. 各 Skill フォルダーにある同梱アセットを一覧する
4. 機能を含む既存 Skill の包括的な一覧を作る
5. この一覧を使って重複提案を避ける

## 版の比較手順

1. 各ローカル Skill フォルダーについて、リモート `SKILL.md` を取得する raw GitHub URL を組み立てる:
   - パターン: `https://raw.githubusercontent.com/github/awesome-copilot/main/skills/<skill-name>/SKILL.md`
2. `#fetch` tool でリモート版を取得する
3. front matter と本文を含むファイル全体を比較する
4. 次の具体的な差分を特定する:
   - **Front matter の変更**（name、description）
   - **指示の更新**（ガイドライン、例、ベストプラクティス）
   - **同梱アセットの変更**（追加、削除、変更）
5. 古い Skill の主な差分を記録する
6. 更新が必要か判断するため類似度を計算する

## Skill 構造の要件

Agent Skills 仕様では、各 Skill は次を含むフォルダーです。
- **`SKILL.md`**: front matter（`name`、`description`）と詳細な指示を含む主要な instruction ファイル
- **任意の同梱アセット**: スクリプト、テンプレート、参照データ、その他 `SKILL.md` から参照されるファイル
- **フォルダー命名**: 小文字とハイフン（例: `azure-deployment-preflight`）
- **名前の一致**: `SKILL.md` の front matter にある `name` はフォルダー名と一致させる

## Front matter の構造

awesome-copilot の Skill は `SKILL.md` で次の front matter 形式を使います。
```markdown
---
name: 'skill-name'
description: 'Brief description of what this skill provides and when to use it'
---
```

## 要件

- `fetch` tool で awesome-copilot リポジトリの Skill ドキュメントから内容を取得する
- `githubRepo` tool でダウンロード対象の個別 Skill の内容を取得する
- `.github/skills/` ディレクトリにある既存 Skill をローカルファイルシステムから調査する
- ローカルの `SKILL.md` ファイルから YAML front matter を読み、名前と説明を抽出する
- ローカル版とリモート版を比較し、古い Skill を検出する
- このリポジトリの既存 Skill と比較して重複を避ける
- 現在の Skill ライブラリの不足領域に重点を置く
- 提案する Skill がリポジトリの目的と技術スタックに合うことを検証する
- 各提案の理由を明確に示す
- awesome-copilot の Skill と類似するローカル Skill の両方へのリンクを含める
- 具体的な差分を示して古い Skill を明確に識別する
- 同梱アセットの要件と互換性を考慮する
- 表と分析以外の追加情報やコンテキストを提示しない

## アイコンの意味

- ✅ インストール済みで最新版
- ⚠️ インストール済みだが古い（更新可能）
- ❌ リポジトリに未導入

## 更新の扱い

古い Skill を特定した場合:
1. 出力表に ⚠️ 状態で含める
2. 「提案理由」列に具体的な差分を記録する
3. 主な変更点を示して更新を推奨する
4. ユーザーが更新を依頼したら、ローカルの Skill フォルダー全体をリモート版に置き換える
5. `.github/skills/` ディレクトリ内のフォルダー位置を維持する
6. 更新した `SKILL.md` とともに、すべての同梱アセットをダウンロードする

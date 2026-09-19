---
name: suggest-awesome-github-copilot-agents
description: '現在のリポジトリのコンテキストとチャット履歴に基づき、awesome-copilot リポジトリから関連する GitHub Copilot Custom Agents ファイルを提案する。現在のリポジトリにある既存のカスタムエージェントとの重複を避け、更新が必要な古いエージェントを特定する。'
---
# Awesome GitHub Copilot Custom Agents の提案

現在のリポジトリのコンテキストを分析し、このリポジトリにまだない関連する Custom Agents ファイルを [GitHub awesome-copilot リポジトリ](https://github.com/github/awesome-copilot/blob/main/docs/README.agents.md) から提案します。Custom Agent ファイルは awesome-copilot リポジトリの [agents](https://github.com/github/awesome-copilot/tree/main/agents) フォルダーにあります。

## 手順

1. **利用可能なカスタムエージェントを取得**: [awesome-copilot README.agents.md](https://github.com/github/awesome-copilot/blob/main/docs/README.agents.md) から一覧と説明を抽出する。`fetch` tool を必ず使う。
2. **ローカルのカスタムエージェントを調査**: `.github/agents/` フォルダーにある既存ファイルを見つける
3. **説明を抽出**: ローカルのカスタムエージェントから front matter を読み、説明を取得する
4. **リモート版を取得**: 各ローカルエージェントについて、raw GitHub URL（例: `https://raw.githubusercontent.com/github/awesome-copilot/main/agents/<filename>`）で対応する版を取得する
5. **版を比較**: ローカルとリモートの内容を比較し、次を特定する。
   - 最新版と一致するエージェント
   - 内容が異なる古いエージェント
   - 古いエージェントの主な差分（ツール、説明、内容）
6. **コンテキストを分析**: チャット履歴、リポジトリファイル、現在のプロジェクト要件を確認する
7. **関連性を判定**: 利用可能なカスタムエージェントを、特定したパターンと要件に照らして比較する
8. **選択肢を提示**: 古いエージェントを含め、関連するカスタムエージェントを説明、理由、利用状況とともに示す
9. **検証**: 提案するエージェントが既存エージェントでは提供されない価値を加えることを確認する
10. **出力**: 提案、説明、awesome-copilot のカスタムエージェントと類似するローカルエージェントへのリンクを構造化された表で示す
    **待機**: 特定のカスタムエージェントのインストールまたは更新をユーザーが依頼するまで待つ。明示的な依頼なしにインストールまたは更新してはならない。
11. **アセットをダウンロードまたは更新**: 要求されたエージェントについて、次を自動的に行う:
    - 新しいエージェントを `.github/agents/` フォルダーへダウンロードする
    - 古いエージェントを awesome-copilot の最新版に置き換えて更新する
    - ファイルの内容を調整してはならない
    - アセットのダウンロードには `#fetch` tool を使う。ただし、内容を確実に取得するため `#runInTerminal` tool で `curl` を使ってもよい
    - 進捗を追跡するには `#todos` tool を使う

## コンテキスト分析の基準

🔍 **リポジトリのパターン**:

- 使用言語（.cs、.js、.py など）
- フレームワークの手がかり（ASP.NET、React、Azure など）
- プロジェクト種別（Web アプリ、API、ライブラリ、ツール）
- ドキュメント要件（README、仕様、ADR）

🗨️ **チャット履歴のコンテキスト**:

- 最近の議論と課題
- 機能依頼または実装要件
- コードレビューパターン
- 開発ワークフローの要件

## 出力形式

awesome-copilot のカスタムエージェントと既存のリポジトリカスタムエージェントを比較し、分析結果を構造化された表で示します。

| Awesome-Copilot Custom Agent                                                                                                                            | 説明                                                                                                                                                                      | インストール済み | 類似するローカルカスタムエージェント | 提案理由                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------------------------- | ------------------------------------------------------------- |
| [amplitude-experiment-implementation.agent.md](https://github.com/github/awesome-copilot/blob/main/agents/amplitude-experiment-implementation.agent.md) | このカスタムエージェントは Amplitude の MCP ツールを使って Amplitude 内に新しい実験を展開し、バリアント検証と製品機能の段階的な展開を円滑にする | ❌ なし | なし | 製品内の実験自動化を強化できる |
| [launchdarkly-flag-cleanup.agent.md](https://github.com/github/awesome-copilot/blob/main/agents/launchdarkly-flag-cleanup.agent.md) | LaunchDarkly のフィーチャーフラグを整理するエージェント | ✅ あり | launchdarkly-flag-cleanup.agent.md | 既存の LaunchDarkly カスタムエージェントで対応済み |
| [principal-software-engineer.agent.md](https://github.com/github/awesome-copilot/blob/main/agents/principal-software-engineer.agent.md) | 卓越したエンジニアリング、技術的リーダーシップ、実用的な実装に重点を置き、プリンシパルレベルのソフトウェアエンジニアリング指針を提供する | ⚠️ 古い | principal-software-engineer.agent.md | ツール設定が異なる。リモートは `'web/fetch'`、ローカルは `'fetch'` を使うため更新を推奨 |

## ローカルエージェントの検出手順

1. `.github/agents/` ディレクトリの `*.agent.md` ファイルをすべて一覧する
2. 見つかった各ファイルの front matter を読み、`description` を抽出する
3. 既存エージェントの包括的な一覧を作る
4. この一覧を使って重複提案を避ける

## 版の比較手順

1. 各ローカルエージェントファイルについて、リモート版を取得する raw GitHub URL を組み立てる:
   - パターン: `https://raw.githubusercontent.com/github/awesome-copilot/main/agents/<filename>`
2. `fetch` tool でリモート版を取得する
3. front matter、tools 配列、本文を含むファイル全体を比較する
4. 次の具体的な差分を特定する:
   - **Front matter の変更**（description、tools）
   - **Tools 配列の変更**（ツールの追加、削除、改名）
   - **内容の更新**（指示、例、ガイドライン）
5. 古いエージェントの主な差分を記録する
6. 更新が必要か判断するため類似度を計算する

## 要件

- `githubRepo` tool で awesome-copilot リポジトリの agents フォルダーから内容を取得する
- `.github/agents/` ディレクトリにある既存エージェントをローカルファイルシステムから調査する
- ローカルエージェントの YAML front matter を読み、説明を抽出する
- ローカル版とリモート版を比較し、古いエージェントを検出する
- このリポジトリの既存エージェントと比較して重複を避ける
- 現在のエージェントライブラリの不足領域に重点を置く
- 提案するエージェントがリポジトリの目的と規約に合うことを検証する
- 各提案の理由を明確に示す
- awesome-copilot のエージェントと類似するローカルエージェントの両方へのリンクを含める
- 具体的な差分を示して古いエージェントを明確に識別する
- 表と分析以外の追加情報やコンテキストを提示しない

## アイコンの意味

- ✅ インストール済みで最新版
- ⚠️ インストール済みだが古い（更新可能）
- ❌ リポジトリに未導入

## 更新の扱い

古いエージェントを特定した場合:
1. 出力表に ⚠️ 状態で含める
2. 「提案理由」列に具体的な差分を記録する
3. 主な変更点を示して更新を推奨する
4. ユーザーが更新を依頼したら、ローカルファイル全体をリモート版に置き換える
5. `.github/agents/` ディレクトリ内のファイル位置を維持する

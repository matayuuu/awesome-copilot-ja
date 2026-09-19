---
name: suggest-awesome-github-copilot-instructions
description: '現在のリポジトリのコンテキストとチャット履歴に基づき、awesome-copilot リポジトリから関連する GitHub Copilot instruction ファイルを提案する。現在のリポジトリにある既存の instruction との重複を避け、更新が必要な古い instruction を特定する。'
---
# Awesome GitHub Copilot Instructions を提案する

現在のリポジトリのコンテキストを分析し、[GitHub awesome-copilot repository](https://github.com/github/awesome-copilot/blob/main/docs/README.instructions.md) から、このリポジトリにまだない関連する copilot-instruction ファイルを提案します。

## 手順

1. **利用可能な instruction を取得**: [awesome-copilot README.instructions.md](https://github.com/github/awesome-copilot/blob/main/docs/README.instructions.md) から一覧と説明を抽出する。`#fetch` tool を必ず使う。
2. **ローカル instruction を調査**: `.github/instructions/` フォルダーにある既存ファイルを見つける
3. **説明を抽出**: ローカル instruction の front matter を読み、説明と `applyTo` パターンを取得する
4. **リモート版を取得**: 各ローカル instruction について、raw GitHub URL（例: `https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/<filename>`）で対応する awesome-copilot 版を取得する
5. **版を比較**: ローカル instruction とリモート版を比較し、次を特定する:
   - 最新版と一致する instruction
   - 内容が異なる古い instruction
   - 古い instruction の主な差分（説明、applyTo パターン、内容）
6. **コンテキストを分析**: チャット履歴、リポジトリファイル、現在のプロジェクト要件を確認する
7. **既存と比較**: このリポジトリで利用可能な instruction と比較する
8. **関連性を判定**: 利用可能な instruction を、特定したパターンと要件に照らして比較する
9. **選択肢を提示**: 古い instruction を含め、関連する instruction を説明、理由、利用状況とともに示す
10. **検証**: 提案する instruction が既存のものでは提供されない価値を加えることを確認する
11. **出力**: 提案、説明、awesome-copilot の instruction と類似するローカル instruction へのリンクを構造化された表で示す
   **待機**: 特定の instruction のインストールまたは更新をユーザーが依頼するまで待つ。明示的な依頼なしにインストールまたは更新してはならない。
12. **アセットをダウンロードまたは更新**: 要求された instruction について、次を自動的に行う:
    - 新しい instruction を `.github/instructions/` フォルダーへダウンロードする
    - 古い instruction を awesome-copilot の最新版に置き換えて更新する
    - ファイルの内容を調整してはならない
    - アセットのダウンロードには `#fetch` tool を使う。ただし、内容を確実に取得するため `#runInTerminal` tool で `curl` を使ってもよい
    - 進捗を追跡するには `#todos` tool を使う

## コンテキスト分析の基準

🔍 **リポジトリのパターン**:
- 使用言語（.cs、.js、.py、.ts など）
- フレームワークの手がかり（ASP.NET、React、Azure、Next.js など）
- プロジェクト種別（Web アプリ、API、ライブラリ、ツール）
- 開発ワークフローの要件（テスト、CI/CD、デプロイ）

🗨️ **チャット履歴のコンテキスト**:
- 最近の議論と課題
- 技術固有の質問
- コーディング規約に関する議論
- 開発ワークフローの要件

## 出力形式

awesome-copilot の instruction と既存のリポジトリ instruction を比較する構造化された表で分析結果を表示します。

| Awesome-Copilot Instruction | 説明 | インストール済み | 類似するローカル instruction | 提案理由 |
|------------------------------|-------------|-------------------|---------------------------|---------------------|
| [blazor.instructions.md](https://github.com/github/awesome-copilot/blob/main/instructions/blazor.instructions.md) | Blazor 開発ガイドライン | ✅ あり | blazor.instructions.md | 既存の Blazor instruction で対応済み |
| [reactjs.instructions.md](https://github.com/github/awesome-copilot/blob/main/instructions/reactjs.instructions.md) | ReactJS 開発標準 | ❌ なし | なし | 確立されたパターンにより React 開発を強化できる |
| [java.instructions.md](https://github.com/github/awesome-copilot/blob/main/instructions/java.instructions.md) | Java 開発のベストプラクティス | ⚠️ 古い | java.instructions.md | applyTo パターンが異なる。リモートは `'**/*.java'`、ローカルは `'*.java'` のため更新を推奨 |

## ローカル instruction の検出手順

1. `instructions/` ディレクトリの `*.instructions.md` ファイルをすべて一覧する
2. 見つかった各ファイルの front matter を読み、`description` と `applyTo` パターンを抽出する
3. 適用対象のファイルパターンを含む既存 instruction の包括的な一覧を作る
4. この一覧を使って重複提案を避ける

## 版の比較手順

1. 各ローカル instruction ファイルについて、リモート版を取得する raw GitHub URL を組み立てる:
   - パターン: `https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/<filename>`
2. `#fetch` tool でリモート版を取得する
3. front matter と本文を含むファイル全体を比較する
4. 次の具体的な差分を特定する:
   - **Front matter の変更**（description、applyTo パターン）
   - **内容の更新**（ガイドライン、例、ベストプラクティス）
5. 古い instruction の主な差分を記録する
6. 更新が必要か判断するため類似度を計算する

## ファイル構造の要件

GitHub のドキュメントに基づき、copilot-instructions ファイルは次のように構成する:
- **リポジトリ全体の instruction**: `.github/copilot-instructions.md`（リポジトリ全体に適用）
- **パス固有の instruction**: `.github/instructions/NAME.instructions.md`（front matter の `applyTo` で特定のファイルパターンに適用）
- **コミュニティ instruction**: `instructions/NAME.instructions.md`（共有と配布用）

## Front matter の構造

awesome-copilot の instruction ファイルは次の front matter 形式を使います。
```markdown
---
description: 'Brief description of what this instruction provides'
applyTo: '**/*.js,**/*.ts' # Optional: glob patterns for file matching
---
```

## 要件

- `githubRepo` tool で awesome-copilot リポジトリの instructions フォルダーから内容を取得する
- `.github/instructions/` ディレクトリにある既存 instruction をローカルファイルシステムから調査する
- ローカル instruction の YAML front matter を読み、説明と `applyTo` パターンを抽出する
- ローカル版とリモート版を比較し、古い instruction を検出する
- このリポジトリの既存 instruction と比較して重複を避ける
- 現在の instruction ライブラリの不足領域に重点を置く
- 提案する instruction がリポジトリの目的と規約に合うことを検証する
- 各提案の理由を明確に示す
- awesome-copilot の instruction と類似するローカル instruction の両方へのリンクを含める
- 具体的な差分を示して古い instruction を明確に識別する
- 技術スタックとの互換性とプロジェクト固有の要件を考慮する
- 表と分析以外の追加情報やコンテキストを提示しない

## アイコンの意味

- ✅ インストール済みで最新版
- ⚠️ インストール済みだが古い（更新可能）
- ❌ リポジトリに未導入

## 更新の扱い

古い instruction を特定した場合:
1. 出力表に ⚠️ 状態で含める
2. 「提案理由」列に具体的な差分を記録する
3. 主な変更点を示して更新を推奨する
4. ユーザーが更新を依頼したら、ローカルファイル全体をリモート版に置き換える
5. `.github/instructions/` ディレクトリ内のファイル位置を維持する

---
name: commit-message-storyteller
description: 'git diffまたはステージ済み変更を分析し、変更内容だけでなく変更理由を説明する物語性のあるコミットメッセージをConventional Commits形式で生成する。「コミットメッセージを書いて」「コミットを生成して」「変更を説明して」「どんなコミットにすべきか」「これをコミットして」「diffを要約して」「コミットを手伝って」と依頼されたときに使用する。git diff出力、ステージ済みファイル、変更内容の文章による説明に対応する。'
---

# コミットメッセージ・ストーリーテラー

未加工のgit diffや変更説明を、[Conventional Commits](https://www.conventionalcommits.org/)仕様に従う明確で物語性のあるコミットメッセージへ変換します。「`file.js`を更新」ではなく、意図、背景、影響が伝わるメッセージを生成します。

## このSkillを使用する場面

- ユーザーが「コミットメッセージを書いて」「コミットを手伝って」「コミットを生成して」と依頼した場合
- ユーザーがgit diffを貼り付けた場合、またはコード変更を説明した場合
- ユーザーが「どんなコミットにすべきか」「diffを要約して」と依頼した場合
- チームまたはオープンソースプロジェクトのコミット履歴を改善したい場合
- Pull Requestの準備中で、意味のあるコミットメッセージが必要な場合

## 前提条件

次のうち少なくとも1つを用意します:
- `git diff`または`git diff --staged`の出力
- 変更内容と変更理由の説明
- 変更したファイルの一覧

## 仕組み

### ステップ1: 変更のコンテキストを収集する

ユーザーに次を確認します（またはdiffから推測します）:

1. **何が変わったか** — 影響を受けるファイル、関数、ロジック
2. **なぜ変えたか** — バグ修正、新機能、リファクタリング、パフォーマンスなど
3. **きっかけは何か** — Issue番号、ユーザーの要望、技術的負債など

ユーザーが未加工の`git diff`を提示した場合は、このコンテキストをdiffから自動的に抽出します。

### ステップ2: コミットの種類を特定する

次のガイドを使用して、変更をConventional Commitsの種類へ対応付けます:

| 種類 | 使用する場面 |
|------|----------|
| `feat` | 新しい機能または能力を追加する |
| `fix` | バグまたは誤った動作を修正する |
| `refactor` | 動作を変えずにコードを再構成する |
| `perf` | パフォーマンスを改善する |
| `docs` | ドキュメントだけを変更する |
| `style` | 書式、空白、セミコロン不足を変更する（ロジック変更なし） |
| `test` | テストを追加または更新する |
| `chore` | ビルドプロセス、依存関係、構成を変更する |
| `ci` | CI/CDパイプラインを変更する |
| `revert` | 以前のコミットを元に戻す |

詳しい例については`references/conventional-commits-guide.md`を参照してください。

### ステップ3: コミットメッセージを書く

次の構造に従います:

```
<type>(<optional scope>): <short imperative summary>

<body — the story: why this change was made, what problem it solves>

<footer — issue refs, breaking change notices>
```

#### 各部分のルール

**件名行（1行目）:**
- 命令形を使用する: "added"や"fixes"ではなく、"add"、"fix"、"remove"
- 最大72文字
- 末尾にピリオドを付けない
- コロンの後は小文字にする

**本文（物語）:**
- *何を*ではなく*なぜ*を説明する（何を変えたかはdiffで分かる）
- 変更前に存在していた問題を説明する
- 該当する場合は、検討した代替案に言及する
- 各行を100文字未満にする
- 件名との間に空行を入れる

**フッター:**
- Issueを参照する: `Closes #123`、`Fixes #456`、`Refs #789`
- 破壊的変更を示す: `BREAKING CHANGE: <description>`

### ステップ4: 出力を生成する

コミットメッセージをコピー可能なコードブロックで出力し、その後に、表現した物語を日本語で1行説明します。

**出力例:**

```
fix(auth): prevent token refresh loop on expired sessions

When a user's session expired mid-request, the auth middleware was
triggering a token refresh, which itself failed validation and triggered
another refresh — causing an infinite retry loop that crashed the app.

This adds a recursion guard flag that aborts the refresh cycle if a
refresh is already in progress, returning a clean 401 instead.

Closes #312
```

> **表現した物語:** セッション期限切れ時に発生する気付きにくい無限ループがアプリをクラッシュさせていたため、循環を早期に止めて明確なエラーを返すようにした。

---

## 1つのdiffから複数のコミットを作る場合

diffに**論理的に独立した変更**が含まれる場合は、複数のコミットメッセージへ分割し、ユーザーに伝えます。次の判断基準を使用します:

- 目的が無関係な別ファイル → 別コミットの可能性が高い
- 同じファイルでも関心事が異なる（例: バグ修正 + リファクタリング） → 分割を提案する
- すべてが密接に関連している → 1コミットでよい

---

## エッジケース

| 状況 | 対処方法 |
|-----------|---------------|
| ユーザーがdiff以外のコンテキストを提示しない | ファイル名と変更されたシンボルから種類とスコープを推測する |
| 明確なテーマなしに変更が多数のファイルへ及ぶ | 「これは1つの論理的変更ですか、それとも複数ですか？」と確認する |
| 破壊的変更を検出した | `BREAKING CHANGE:`フッターを自動的に追加する |
| ユーザーが「短くして」と依頼した | 本文を省略し、強い件名行だけを書く |
| Issue番号がない | フッター全体を省略する |

---

## クイックリファレンス

```bash
# Get your staged diff to paste into Copilot
git diff --staged

# Or get the last uncommitted working tree changes
git diff
```

種類の例とスコープのガイドラインについては`references/conventional-commits-guide.md`を参照してください。

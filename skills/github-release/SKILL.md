---
name: github-release
description: >
  GitHubライブラリの新しいバージョンを、分析からリリースPRの作成までエンドツーエンドで公開する手順を案内する。
  SemVerのバージョニングとKeep a Changelog形式を自動的に扱う。
compatibility: "requires: gh CLI and git"
---

# GitHub Release Skill

このSkillは、単一パッケージのGitHubリポジトリについて、分析、変更履歴の作成、PR作成までを含む完全なリリースワークフローを自動化する。`gh`（GitHub CLI）と`git`だけに依存し、ほかのツールは必要としない。

手順1〜4は読み取り専用の調査であり、バージョン番号が確定する手順5まではリポジトリに何も書き込まない。

## このSkillを使用する場面

新しいリリースを作成する、バージョンを公開する、バージョンを上げる、リリースブランチを作成する、変更履歴を生成する、またはGitHubリポジトリでリリースPRを開く場合は、必ずこのSkillを使用する。「新しいバージョンを出そう」「そろそろリリースしよう」のような気軽な依頼でも対象とする。

---

## 前提条件

まず環境を確認する。

```bash
gh auth status                        # must be authenticated
gh repo view --json nameWithOwner     # must be inside a GitHub repo
git status                            # working tree should be clean
```

いずれかの確認に失敗した場合は停止し、ユーザーに修正方法を伝える。

次に、ユーザーへ次の質問を1つする。

> *「ライブラリの公開向けソースコードはどのディレクトリにありますか？
> （例：`src/`、`lib/`、`pkg/` — 実際に利用者が目にする部分へ差分を絞るために使います。Enterだけならリポジトリ全体を調査します）」*

回答を`PUBLIC_PATH`に保存する。空の場合は`PUBLIC_PATH`を`.`（リポジトリルート）とする。どの差分からも、次のパスを必ず除外する：`tests/`、`test/`、`spec/`、`__tests__/`、`docs/`、`*.lock`、`*-lock.json`、`*.sum`、生成ファイル（「do not edit」ヘッダーコメントがあるファイル）、ビルド成果物。

---

## 9段階のリリースワークフロー

各手順を順番どおりに実行する。実行するコマンドとその出力をユーザーへ示す。明示的に記載した場合を除き、確認のために停止して質問しない。

---

### 手順1 - mainを最新にする

```bash
git checkout main
git pull origin main
```

ここでは`main`に留まる。リリースブランチは、バージョン確定後の手順5で作成する。

---

### 手順2 - 最新のバージョンタグを取得する

> **なぜ`gh release list`ではないのか？** GitHub ReleasesはGitタグの上に追加できる任意のレイヤーである。多くのリポジトリはGitHub Releaseを作成せずにリリースへタグを付けるため、GitHub Releaseがあっても`gh release list`が空になることがある。タグをGitから直接読むのが信頼できる情報源である。

```bash
# Fetch all tags from remote to ensure local view is current
git fetch --tags

# Find the latest version tag, sorted semantically
# --sort=-version:refname handles 1.10.0 > 1.9.0 correctly (unlike alphabetical)
PREV_TAG=$(git tag --sort=-version:refname | grep -E '^v?[0-9]+\.[0-9]+\.[0-9]+' | head -1)
echo "Latest tag: $PREV_TAG"
```

```PowerShell
# Fetch all tags from remote to ensure local view is current
git fetch --tags

# Find the latest version tag, sorted semantically
# --sort=-version:refname handles 1.10.0 > 1.9.0 correctly (unlike alphabetical)
$prevTag = git tag --sort='-version:refname' | `
  Select-String '^[vV]?\d+\.\d+\.\d+' | `
  Select-Object -First 1 -ExpandProperty Line

if ($prevTag) {
  $prevSha = git rev-list -n 1 $prevTag
} else {
  $prevSha = git rev-list --max-parents=0 HEAD
}

Write-Output "Latest tag: $prevTag"
```

次に、タグがリモートに存在することを確認する。

```bash
git ls-remote --tags origin | grep "refs/tags/$PREV_TAG$"
```

リモート確認の出力が空の場合、タグはローカルにしか存在せず、まだpushされていない可能性があるとユーザーへ警告する。続行前にタグをpushしたいかもしれない。

- `PREV_TAG`は見つかったタグ名をそのまま使う（例：`v1.4.2`）。計算時だけ先頭の`v`を外し、命名時は保持する。
- **タグがまったくない場合**は`PREV_TAG`を`(none)`とし、`PREV_SHA`を最初のコミットに設定し、新しいバージョンを`1.0.0`とする（手順4のバージョン判定を飛ばし、手順5へ進む）。
- タグが実際のコミットを指していない（孤立タグ）場合は、`git rev-list --max-parents=0 HEAD`へフォールバックし、ユーザーへ警告する。

```bash
PREV_SHA=$(git rev-list -n 1 "$PREV_TAG" 2>/dev/null || git rev-list --max-parents=0 HEAD)
```

---

### 手順3 - 前回リリース以降の変更を分析する

この手順では、相補的な2つのシグナルを使う。コード差分を主な情報源とし、コミットメッセージは意図を補足する。

#### 3a - コード差分（主なシグナル）

```bash
# Focused diff on the public source path, excluding noise
git diff "$PREV_SHA"..HEAD -- "$PUBLIC_PATH" \
  ':(exclude)tests/' ':(exclude)test/' ':(exclude)spec/' \
  ':(exclude)__tests__/' ':(exclude)docs/' \
  ':(exclude)*.lock' ':(exclude)*-lock.json' ':(exclude)*.sum'
```

```PowerShell
# Focused diff on the public source path, excluding noise
git diff "$($prevSha)..HEAD" -- $publicPath `
  ':(exclude)tests/' ':(exclude)test/' ':(exclude)spec/' `
  ':(exclude)__tests__/' ':(exclude)docs/' `
  ':(exclude)*.lock' ':(exclude)*-lock.json' ':(exclude)*.sum'
```

差分の出力をすべて読む。変更された各ファイルについて、次を特定する。

1. **削除されたシンボル** - 以前存在していたが現在はなくなった関数、クラス、メソッド、定数、export名。MAJORの強い根拠。
2. **変更されたシグネチャ** - 両バージョンに存在するが、パラメーター、戻り値、またはスローされるエラーが異なる関数。MAJORの強い根拠。
3. **新しいexportシンボル** - 以前は存在しなかったpublic関数、クラス、定数。MINORの根拠。
4. **内部だけの変更** - publicインターフェースに触れない変更（privateヘルパー、exportされていない関数、アルゴリズム内部）。PATCH。
5. **バグ修正** - public APIを変更せず、誤ったロジック（例：off-by-one、nullチェック、誤った条件）を明確に修正したもの。PATCH。

差分が非常に大きい（数千行）場合は、まず統計概要を実行して、読むファイルの優先順位を付ける。

```bash
git diff "$PREV_SHA"..HEAD --stat -- "$PUBLIC_PATH"
```

変更の多いファイルと、publicインターフェースを定義していそうな名前（`index.*`、`api.*`、`exports.*`、`public.*`、`mod.*`、`__init__.*`）のファイルを中心に詳細を読む。

#### 3b - コミットログ（補助シグナル）

```bash
git log "$PREV_SHA"..HEAD --oneline --no-merges
```

次の目的で使用する。
- コード差分だけでは明らかでない変更意図を理解する（例：1行のセキュリティ修正）。
- `PUBLIC_PATH`外の、利用者から見える変更を見つける（例：`cmd/`のCLIフラグ変更）。
- コードだけでは分からない変更履歴の項目の文脈を補う。

コミットメッセージを変更種別へ対応付ける方法は`references/commit-classification.md`を読む。

#### 3c - 2つのシグナルを突き合わせる

シグナルが一致する場合は、その分類を確信を持って採用する。

シグナルが矛盾する場合は、**コード差分を優先する**。例：
- コミットが「fix: typo」と書かれていても、差分でpublicメソッドが削除されていればMAJORとする。
- コミットが「feat: new API」と書かれていても、差分がprivate内部だけならPATCHとする。
- コミットが「chore: refactor」と書かれていても、差分で新しいexportシンボルが追加されていればMINORとする。

気づいた矛盾は記録し、手順6の変更履歴レビューでユーザーへ示す。

---

### 手順4 - 次のSemVerバージョンを決定する

手順3の分析に次の規則を適用する（完全な規則と境界事例は`references/semver-rules.md`）。

| 条件 | 更新 |
|---|---|
| public APIの破壊的変更（削除、シグネチャ変更、動作変更）がある | MAJOR |
| 破壊的変更を伴わない新しいexportシンボルまたは機能 | MINOR |
| バグ修正、パフォーマンス改善、セキュリティ修正、ドキュメント、choreのみ | PATCH |

混在する場合は、最も高い優先度を採用する：`MAJOR > MINOR > PATCH`。

`NEXT_VERSION`を計算する。
- `PREV_TAG`を`MAJOR.MINOR.PATCH`の整数に分割する。
- 適切な更新を適用する。
- `vMAJOR.MINOR.PATCH`形式にする。

**提案するバージョンをユーザーへ示す。**コミットメッセージだけでなく、具体的なコード上の発見を根拠として簡潔に説明する。例：

> *「v2.1.0を提案します。差分では`src/client.go`に`NewClient`と`WithTimeout`という2つの新しいexport関数が追加され、既存のpublicシンボルの削除や変更はありません。コミットメッセージも機能追加であることを裏付けています。」*

「このバージョンでよいですか、それとも調整しますか？」と尋ねる。続行前に確認を待つ。

---

### 手順5 - リリースブランチを作成する

バージョンが確認されたら、最初から正しい名前でブランチを作成する。

```bash
git checkout -b release/vX.Y.Z
git push -u origin release/vX.Y.Z
```

---

### 手順6 - CHANGELOG.mdを更新する

既存の`CHANGELOG.md`を読む（なければ作成する）。[Keep a Changelog](https://keepachangelog.com/en/1.1.0/)形式に厳密に従う。

**先頭（`# Changelog`ヘッダーの直下）へ挿入する構造：**

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- ...

### Changed
- ...

### Deprecated
- ...

### Removed
- ...

### Fixed
- ...

### Security
- ...
```

規則：
- 今日の日付を`YYYY-MM-DD`形式で使う。
- 項目がないセクションは省略する — 空の見出しを残さない。
- エントリは、コミットメッセージの文脈で補足しながら、主にコード差分から利用者の視点で平易な英語を書く。
  良い例：*「HTTPクライアントのコンストラクターに`WithTimeout`オプションを追加した。」*
  悪い例：*「feat: add timeout cfg param」*
- 発見事項をセクションへ対応付ける：
  - 新しいexportシンボル → Added
  - 破壊的な削除 → Removed
  - 既存APIへの破壊的変更 → Changed（破壊的変更であることを明記）
  - バグ／ロジック修正、パフォーマンス → Fixed
  - セキュリティ修正 → Security
  - 内部リファクタリング、ドキュメント、chore、テスト → 利用者に見える変更でない限り省略
- コード差分だけでは分からなかった意図をコミットメッセージが示した場合（例：1行の変更がセキュリティ修正だった場合）は、その文脈を変更履歴へ含める。
- ファイル末尾の差分リンクも更新する。
  ```markdown
  [X.Y.Z]: https://github.com/OWNER/REPO/compare/vPREV...vNEXT
  ```

ディスクへ書き込む前に、提案する変更履歴セクションをユーザーへ示す。
手順3cでシグナルの矛盾があった場合は、ここで示してユーザーに確認してもらう。
「この変更履歴は正確ですか？追加、削除、言い換えたい項目はありますか？」と尋ねる。
意見を反映してからディスクへ書き込む。

---

### 手順7 - コミットしてpushする

```bash
git add CHANGELOG.md
git commit -m "chore: release vX.Y.Z"
git push origin release/vX.Y.Z
```

次へ進む前に、pushが成功したことを確認する。

---

### 手順8 - Pull Requestを開く

**重要：** PR本文を渡す際は必ず`--body-file`を使い、インラインの`--body`は使わない。
PowerShellではインラインのエスケープシーケンス（`\n`）が改行として解釈されず、PRに文字どおり表示される。ファイルを使えばMarkdownの実際の改行を保持できる。

```bash
gh pr create \
  --base main \
  --head release/vX.Y.Z \
  --title "Release vX.Y.Z" \
  --body "$(cat <<'EOF'
## Release vX.Y.Z

This PR prepares the **vX.Y.Z** release.

### What's included
<!-- paste the changelog section here -->

### Checklist
- [ ] Changelog reviewed
- [ ] Version bump verified
- [ ] CI passing

After merging, create the tag on the merge commit:
\`\`\`
git tag vX.Y.Z <merge-commit-sha>
git push origin vX.Y.Z
\`\`\`
EOF
)"
```

````PowerShell
# Create PR body using here-string (preserves actual newlines, not escape sequences)
$prBody = @"
## Release vX.Y.Z

This PR prepares the **vX.Y.Z** release.

### What's included
<paste changelog here>

### Checklist
- [ ] Changelog reviewed
- [ ] Version bump verified
- [ ] CI passing

After merging, create the tag on the merge commit:
```
git tag vX.Y.Z <merge-commit-sha>
git push origin vX.Y.Z
```
"@

# Write to file and use --body-file (do NOT use inline --body with escape sequences)
$prBody | Out-File -FilePath release_pr_body.md -Encoding utf8 -NoNewline
gh pr create --base main --head release/vX.Y.Z --title "Release vX.Y.Z" --body-file release_pr_body.md
````

PR本文の「What's included」ブロックへ変更履歴セクションを貼り付ける（または手動レビュー用のプレースホルダーを残す）。

---

### 手順9 - ユーザーへ引き継ぐ

ユーザーへ次の内容を伝える。

> **リリースPRが開きました！**
>
> 新しいバージョン：**vX.Y.Z**
>
> PRをレビューしてマージした後、マージコミットに対して**ユーザー自身でタグを作成する**必要がある。
>
> ```bash
> git tag vX.Y.Z <merge-commit-sha>
> git push origin vX.Y.Z
> ```
>
> その後GitHub Releasesへ移動し、そのタグからリリースを公開する。変更履歴セクションをリリースノートへ直接コピーできる。

---

## エラー処理

| 状況 | 対応 |
|---|---|
| `gh auth status`が失敗 | 停止し、ユーザーに`gh auth login`の実行を伝える |
| Gitリポジトリ内にいない | 停止し、リポジトリへ`cd`するよう伝える |
| ワークツリーが汚れている | 警告し、stashするか中止するか尋ねる |
| 前回タグ以降にコミットがない | リリースするものがないと伝える |
| タグは存在するがコミットを指していない | 最初のコミットを差分の基点にし、警告する |
| 最新タグがローカルにしかない | ユーザーへ警告し、タグを先にpushするか、そのまま続行するか尋ねる |
| `PUBLIC_PATH`の差分は空だがコミットはある | すべての変更が内部的な可能性を警告し、続行するか尋ねる |
| `git push`が失敗（保護ブランチルールなど） | エラーをそのまま報告し、ブランチ保護設定の確認を提案する |

---

## PowerShellでのトラブルシューティング

- 動作するコマンドが`gh`の使用方法を表示したり、サブコマンドを別トークンとして扱ったりする場合は、PATH上のgh.exeを呼び出していることを確認し、ネストした置換を渡さない。上記のPowerShellパターンを使う。
- 推奨確認：`gh --version`；`git fetch --tags`；PowerShellスニペットで`$prevTag`を設定し、`git diff --name-only $prevSha..HEAD -- src/`を実行する。

---

## 制限事項

- `gh` CLIがインストールされ、認証済みである必要がある。
- 現在のバージョンを決めるためにGitタグが必要である。

---

## 参照ファイル

- `references/semver-rules.md` - 拡張されたSemVer判定規則と境界事例
- `references/commit-classification.md` - コミットメッセージを変更種別へ分類するヒューリスティック

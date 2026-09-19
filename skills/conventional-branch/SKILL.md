---
name: conventional-branch
description: 'Conventional Branch仕様（feature/、bugfix/、hotfix/、release/、chore/）に従うGitブランチを作成する。新しいブランチの作成、ブランチ名の決定、ブランチ名が仕様に準拠しているかの確認に使用する。'
---

# Conventional Branch

[Conventional Branch](https://conventional-branch.github.io)仕様に従い、Gitブランチの名前を単純かつ一貫した規則で作成します。

## ブランチ名の形式

```
<type>/<description>
```

### ブランチの種類

| 種類 | 別名 | 目的 |
|------|-------|---------|
| `feature/` | `feat/` | 新機能または機能強化 |
| `bugfix/` | `fix/` | バグ修正 |
| `hotfix/` | — | 本番環境の緊急修正 |
| `release/` | — | リリース準備（バージョン内のドットを許可: `release/v1.2.0`） |
| `chore/` | — | コード以外の作業（依存関係、ドキュメント、構成） |

### トランクブランチ

`main`、`master`、`develop`はトランクブランチであり、接頭辞を使用しません。トランクブランチと同じ名前の新しいブランチは作成せず、トランクブランチから分岐してください。

## 命名規則

- **小文字のみ** — どこにも大文字を使用しない
- **英数字、ハイフン、ドット** — `a-z`、`0-9`、`-`、`.`
- **ドットを使用できるのは**`release/`のバージョン説明のみ（例: `release/v1.2.0`）
- **アンダースコア、空白、特殊文字は禁止**
- **ハイフン**（`--`）、**ドット**（`..`）の連続、および**ハイフンとドットの隣接**（`-.`または`.-`）は禁止
- 説明の先頭または末尾に**ハイフンやドットを置かない**

## 有効な例

```
main
master
develop
feature/add-login-page
feat/add-login-page
bugfix/fix-header-bug
fix/header-bug
hotfix/security-patch
release/v1.2.0
chore/update-dependencies
feature/issue-123-new-login
```

## 無効な例

| ブランチ | 問題 |
|--------|---------|
| `Feature/Add-Login` | 大文字を使用している |
| `feature/new--login` | ハイフンが連続している |
| `feature/-new-login` | 先頭にハイフンがある |
| `feature/new-login-` | 末尾にハイフンがある |
| `release/v1.-2.0` | ハイフンがドットに隣接している |
| `fix/header bug` | 空白がある |
| `fix/header_bug` | アンダースコアがある |
| `unknown/some-task` | 不明な接頭辞の種類 |

## 説明のガイドライン

- 2～5語の**kebab-case**を使用する
- 具体的かつ簡潔にする（全体で約50文字）
- 良い例: `add-oauth-login`、`fix-header-overflow`、`update-ci-config`
- 悪い例: `fix-bug`、`new-feature`

## ワークフロー

**次の手順に従ってください:**

**ステップ1 — ブランチの種類を決める**

まだ明確でない場合は、ユーザーに次を確認します:

- **ブランチの種類** — 判断できない場合は`feature`を既定とする
- **短い説明** — ブランチの目的

ユーザーがチケット番号またはIssue番号に言及した場合は、説明に含めます（例: `feature/issue-123-add-oauth`）。

**ステップ2 — 名前を検証する**

組み立てた名前を上記の**命名規則**に照らして確認します。規則に違反している場合は修正します:

- すべて小文字にする
- アンダースコアと空白をハイフンに置き換える
- 連続するハイフンを1つにまとめる
- 先頭と末尾のハイフンを取り除く

**ステップ3 — ベースブランチを検出する**

Repositoryごとに使用するトランクブランチは異なります。このRepositoryで使用しているものを検出します:

```bash
# Prefer the remote's default branch
git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||'
```

何も返されない場合は、ローカルに存在するトランクブランチを確認します（優先順: `develop`、`main`、`master`）:

```bash
for b in develop main master; do
  git show-ref --verify --quiet "refs/heads/$b" && echo "$b" && break
done
```

**ステップ4 — 作成してcheckoutする**

```bash
git checkout <base>
git pull origin <base>
git checkout -b <type>/<description>
```

**ステップ5 — 確認する**

ユーザーに次を伝えます:
- 作成したブランチ名
- 現在、新しいブランチにいること
- 準備ができたら`git push -u origin <branch-name>`を実行すること

## Conventional Commitsとの関係

Conventional Branchは[Conventional Commits](https://www.conventionalcommits.org)を補完します:

| Conventional Branch | 典型的なConventional Commit |
|---------------------|----------------------------|
| `feature/add-login` | `feat: add login page` |
| `bugfix/fix-header` | `fix: header overflow on mobile` |
| `chore/update-deps` | `chore: bump lodash to 5.0` |
| `release/v1.2.0` | `chore: release v1.2.0` |

可能な限り、ブランチの種類とコミットの種類を揃えます（例: `feature/*`ブランチには`feat:`コミット）。

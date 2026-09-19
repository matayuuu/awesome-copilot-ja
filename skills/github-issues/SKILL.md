---
name: github-issues
description: 'MCPツールを使ってGitHub issueを作成、更新、管理します。バグ報告、機能要求、タスクissue、既存issue、ラベル、担当者、マイルストーン、issueフィールド、issueタイプ、ワークフロー、issueリンク、依存関係、blocked-by／blocking関係の管理を求められた場合に使います。'
---

# GitHub Issues

`@modelcontextprotocol/server-github` MCPサーバーを使ってGitHub issueを管理する。

## 利用可能なツール

### MCPツール（読み取り操作）

| ツール | 用途 |
|---------|------|
| `mcp__github__issue_read` | issueの詳細、サブissue、コメント、ラベルを読む（メソッド：get、get_comments、get_sub_issues、get_labels） |
| `mcp__github__list_issues` | リポジトリのissueを状態、ラベル、日付で一覧・絞り込みする |
| `mcp__github__search_issues` | GitHub検索構文を使ってリポジトリ横断でissueを検索する |
| `mcp__github__projects_list` | プロジェクト、プロジェクトフィールド、プロジェクト項目、状態更新を一覧表示する |
| `mcp__github__projects_get` | プロジェクト、フィールド、項目、状態更新の詳細を取得する |
| `mcp__github__projects_write` | プロジェクト項目の追加／更新／削除、状態更新の作成を行う |

### MCPツール（書き込み操作）

| ツール | 用途 |
|---------|------|
| `mcp__github__issue_write` | issueを作成または更新する（メソッド：create、update）。タイトル、本文、タイプ、ラベル、担当者、マイルストーン、issueフィールドをサポートする |
| `mcp__github__add_issue_comment` | issueへコメントまたはリアクションを追加する |
| `mcp__github__sub_issue_write` | サブissueの追加、削除、優先順位変更を行う |

### CLI / REST API（書き込み操作）

MCPツールが接続されていない場合、またはMCPツールが公開していないRESTフィールドが必要な場合は、以下の例のように`gh api`を使用する。

| 操作 | コマンド |
|-----------|---------|
| issueを作成 | `gh api repos/{owner}/{repo}/issues -X POST -f title=... -f body=...` |
| issueを更新 | `gh api repos/{owner}/{repo}/issues/{number} -X PATCH -f title=... -f state=...` |
| コメントを追加 | `gh api repos/{owner}/{repo}/issues/{number}/comments -X POST -f body=...` |
| issueをクローズ | `gh api repos/{owner}/{repo}/issues/{number} -X PATCH -f state=closed` |
| issueタイプを設定 | 作成呼び出しに`-f type=Bug`を含める（REST APIのみ。`gh issue create` CLIは非対応） |

**注：** `gh issue create`は基本的なissue作成には使えるが、`--type`フラグには対応していない。issueタイプを設定する必要がある場合は`gh api`を使う。

## ワークフロー

1. **操作を判断する：** 作成、更新、または照会か？
2. **コンテキストを集める：** 必要に応じてリポジトリ、既存ラベル、マイルストーンを取得する
3. **内容を構成する：** [references/templates.md](references/templates.md)の適切なテンプレートを使う
4. **実行する：** 読み取りにはMCPツール、書き込みには`gh api`を使う
5. **確認する：** issueのURLをユーザーへ報告する

## issueの作成

issueの作成には`gh api`を使う。これはissueタイプを含むすべてのパラメーターに対応する。

```bash
gh api repos/{owner}/{repo}/issues \
  -X POST \
  -f title="Issue title" \
  -f body="Issue body in markdown" \
  -f type="Bug" \
  --jq '{number, html_url}'
```

### 任意のパラメーター

必要に応じて次のフラグを追加する。

```
-f type="Bug"                    # Issue type (Bug, Feature, Task, Epic, etc.)
-f 'labels[]=bug'                # Labels (repeat for multiple)
-f 'assignees[]=username'        # Assignees (repeat for multiple)
-f milestone=1                   # Milestone number
```

**`name[]=value`のペア全体を引用する。** macOSのデフォルトシェルであるzshでは`[]`がglobパターンなので、引用しない`-f labels[]=bug`は`gh`に渡らない。

```
zsh: no matches found: labels[]=bug
```

```bash
gh api graphql -f query='{ organization(login: "ORG") { issueTypes(first: 10) { nodes { name } } } }' --jq '.data.organization.issueTypes.nodes[].name'
```

**分類にはラベルよりissueタイプを優先する。** issueタイプ（Bug、Feature、Taskなど）が利用できる場合は、同等の`bug`や`enhancement`ラベルではなく`type`パラメーターを使う。issueタイプが設定されていない組織の場合だけラベルに切り替える。

### タイトルの指針

- 具体的で実行可能なタイトルにする
- 72文字未満にする
- issueタイプを設定した場合は、`[Bug]`のような重複する接頭辞を付けない
- 例：
  - `Login fails with SSO`（type=Bugの場合）
  - `Add dark mode support`（type=Featureの場合）
  - `Add unit tests for auth module`（type=Taskの場合）

### 本文の構造

必ず[references/templates.md](references/templates.md)のテンプレートを使う。issueタイプに応じて選択する。

| ユーザーの依頼 | テンプレート |
|----------|----------|
| バグ、エラー、壊れている、動かない | バグ報告 |
| 機能、改善、追加、新規 | 機能要求 |
| タスク、雑務、リファクタリング、更新 | タスク |

## issueの更新

PATCHで`gh api`を使う。

```bash
gh api repos/{owner}/{repo}/issues/{number} \
  -X PATCH \
  -f state=closed \
  -f title="Updated title" \
  --jq '{number, html_url}'
```

変更したいフィールドだけを含める。使用可能なフィールドは`title`、`body`、`state`（open/closed）、`labels`、`assignees`、`milestone`。

## 例

### 例1：バグ報告

**ユーザー：**「バグissueを作成して - SSO使用時にログインページがクラッシュする」

**操作：**
```bash
gh api repos/github/awesome-copilot/issues \
  -X POST \
  -f title="Login page crashes when using SSO" \
  -f type="Bug" \
  -f body="## Description
The login page crashes when users attempt to authenticate using SSO.

## Steps to Reproduce
1. Navigate to login page
2. Click 'Sign in with SSO'
3. Page crashes

## Expected Behavior
SSO authentication should complete and redirect to dashboard.

## Actual Behavior
Page becomes unresponsive and displays error." \
  --jq '{number, html_url}'
```

### 例2：機能要求

**ユーザー：**「優先度を高くしてダークモードの機能要求を作成して」

**操作：**
```bash
gh api repos/github/awesome-copilot/issues \
  -X POST \
  -f title="Add dark mode support" \
  -f type="Feature" \
  -f 'labels[]=high-priority' \
  -f body="## Summary
Add dark mode theme option for improved user experience and accessibility.

## Motivation
- Reduces eye strain in low-light environments
- Increasingly expected by users

## Proposed Solution
Implement theme toggle with system preference detection.

## Acceptance Criteria
- [ ] Toggle switch in settings
- [ ] Persists user preference
- [ ] Respects system preference by default" \
  --jq '{number, html_url}'
```

## 一般的なラベル

該当する場合は次の標準ラベルを使う。

| ラベル | 用途 |
|-------|---------|
| `bug` | 動作していないもの |
| `enhancement` | 新機能または改善 |
| `documentation` | ドキュメント更新 |
| `good first issue` | 初心者に適したもの |
| `help wanted` | 追加の支援が必要なもの |
| `question` | さらなる情報が必要なもの |
| `wontfix` | 対応しないもの |
| `duplicate` | 既存の重複 |
| `high-priority` | 緊急のissue |

## ヒント

- issueを作成する前に、必ずリポジトリのコンテキストを確認する
- 重要な情報が不足している場合は、推測せずに尋ねる
- 分かっている関連issueをリンクする：`Related to #123`
- 更新時は、変更しないフィールドを保持するため、先に現在のissueを取得する

## 拡張機能

次の機能には、基本的なMCPツール以外のRESTまたはGraphQL APIが必要である。それぞれの詳細は、必要な知識だけを読み込めるよう、専用の参照ファイルに記載している。

| 機能 | 使用する場面 | 参照 |
|-----------|-----------|-----------|
| 高度な検索 | 複雑な論理式、日付範囲、リポジトリ横断検索、issueフィールドフィルター（`field.name:value`） | [references/search.md](references/search.md) |
| サブissueと親issue | 作業を階層的なタスクへ分割する | [references/sub-issues.md](references/sub-issues.md) |
| マイルストーン | マイルストーンの作成、読み取り、更新、クローズ、再オープン、削除、issueの管理 | [references/milestones.md](references/milestones.md) |
| ラベル | リポジトリラベルの取得、作成、名前変更、色変更、削除；issueのラベル追加または置換 | [references/labels.md](references/labels.md) |
| issueの依存関係 | blocked-by / blocking関係の追跡 | [references/dependencies.md](references/dependencies.md) |
| issueタイプ（高度） | MCPの`list_issue_types` / `type`パラメーターを超えるGraphQL操作 | [references/issue-types.md](references/issue-types.md) |
| Projects V2 | プロジェクトボード、進捗レポート、フィールド管理 | [references/projects.md](references/projects.md) |
| issueフィールド | カスタムメタデータ：日付、優先度、テキスト、数値（プライベートプレビュー） | [references/issue-fields.md](references/issue-fields.md) |
| issue内の画像 | CLIを使ってissue本文やコメントへ画像を埋め込む | [references/images.md](references/images.md) |

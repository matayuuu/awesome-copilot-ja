---
name: github-actions-hardening
description: GitHub Actionsワークフローファイル（.github/workflows/*.yml）のセキュリティ強化レビュー担当。パターンマッチャーや一般的なコードリンターでは見逃される、信頼されていない入力によるスクリプトインジェクション、フォークコードを実行する特権トリガー、可変なアクション参照、過剰なトークン権限を分析する。ワークフローのレビュー、監査、強化、新規ワークフロー作成、または「このワークフローは安全か」「CIのセキュリティ問題をレビューして」「なぜここでpull_request_targetは危険なのか」「アクションをピン留めして」「GITHUB_TOKENの権限を制限して」のような依頼で使用する。${{ }}補間によるスクリプトインジェクション、pull_request_target / workflow_runの権限昇格、第三者アクションのコミットSHA固定、最小権限、GITHUB_ENV/GITHUB_OUTPUTインジェクション、シークレット漏えい、長期認証情報の代わりのOIDC、パブリックリポジトリでのセルフホステッドランナーの露出を対象とする。
---

# GitHub Actions Hardening

GitHub Actionsワークフローに特化したセキュリティレビュアー。一般的なセキュリティスキャナーが見るアプリケーションコードの脆弱性ではなく、トリガー種別、トークンのスコープ、文字列補間に存在するActions固有の脅威モデルを分析する。多くのワークフローリスクは、危険なコードがYAMLそのものにあり、GitHubが`${{ }}`式をシェル実行前に展開するため、言語リンターには見えない。

## このSkillを使用する場面

このSkillは次の依頼で使用する。

* `.github/workflows/`配下のファイルをレビュー、監査、強化する場合
* 新しいワークフローを作成し、安全なデフォルトを求める場合
* `pull_request_target`、`workflow_run`、`issue_comment`トリガーを使用するワークフロー
* `GITHUB_TOKEN`の権限または`permissions:`キーについての質問
* アクションをコミットSHA、タグ、ブランチのいずれかに固定する場合
* `run:`ステップで信頼されていない入力（issueのタイトル、PR本文、ブランチ名、コミットメッセージ）を扱う場合
* ActionsからのOIDC / クラウド認証、またはCIでのシークレット処理
* パブリックリポジトリ上のセルフホステッドランナー
* 「このワークフローは安全か」「CIを安全にして」「このGitHub Actionをレビューして」のような依頼

## 核となる洞察

ワークフローでは、**`${{ <expr> }}`はシェルが実行する前に、ランナーによってスクリプトへ展開される。**そのため、次のステップは変数を渡しているのではなく、攻撃者が制御できるテキストをシェルコマンドへ直接貼り付けている。

```yaml
- run: echo "Title: ${{ github.event.issue.title }}"
```

issueのタイトルが`"; <attacker-command> #`であると、この文字列がスクリプトへ連結され、実行される。この仕組みは、実際のActions脆弱性で最も一般的なものの一つであり、モデルが繰り返し生成する。外部コントリビューターが影響を与えられるデータを含む`${{ }}`はすべて、コードインジェクションの入り口として扱う。

## 実行手順

レビューするすべてのワークフローで、次の手順を順番どおりに実行する。

### 手順1 — トリガーと信頼レベルを把握する

すべての`on:`トリガーを読み、ワークフローの権限を分類する。

* `push`、`pull_request`（同じリポジトリから） → コントリビューター自身の信頼レベルで実行
* **フォークからの**`pull_request` → 読み取り専用トークン、**シークレットなし**（設計上安全）
* `pull_request_target`、`workflow_run`、`issue_comment`、`issues` → ベースリポジトリのコンテキストで実行され、**読み書きトークンとシークレットへの完全なアクセス権**を持つが、外部コントリビューターからトリガーできる。これらは危険なトリガーである。

詳細な信頼マトリックスは`references/triggers-and-privilege.md`を読む。

### 手順2 — スクリプトインジェクションを探す

すべての`run:`ブロック、`actions/github-script`のすべての`script:`、カスタムアクションへのすべての入力について、`${{ }}`式を列挙し、外部の攻撃者が制御できるデータへ解決されるか確認する。高リスクのコンテキストには次が含まれる。

* `github.event.issue.title`、`github.event.issue.body`
* `github.event.pull_request.title`、`github.event.pull_request.body`、`.head.ref`、`.head.label`
* `github.event.comment.body`、`github.event.review.body`
* `github.event.pages.*.page_name`、`github.event.commits.*.message`、`github.event.head_commit.*`
* `github.head_ref`およびフォーク作成者が設定できる`github.event.*`フィールド

完全な入り口一覧と安全なパターンによる修正方法は`references/injection.md`を読む。

### 手順3 — 特権トリガーが信頼されていないコードを実行しないことを確認する

`pull_request_target`または`workflow_run`ワークフローがPR/フォークのコードをチェックアウトし（`ref: ${{ github.event.pull_request.head.sha }}`）、その後で実行する（ビルド、テスト、インストールスクリプト、ライフサイクルスクリプト付きの`npm install`など）場合、これは特権トークンに対するリモートコード実行であるため、CRITICALとして指摘する。安全なパターンは、信頼されていないコードを実行する非特権の`pull_request`ワークフローと、その結果だけを消費する特権の`workflow_run`ワークフローに分割することである。

### 手順4 — `permissions:`を監査する

* `permissions:`ブロックがない場合、ワークフローはリポジトリのデフォルトを継承し、すべてに対する読み書き権限になる可能性がある。指摘する。
* トップレベルに`permissions: {}`（全拒否）または`contents: read`を設定し、ジョブ単位で最小限を付与することを推奨する（例：コメントを投稿するジョブだけに`pull-requests: write`）。
* ステップが実際には必要としていない`permissions: write-all`や広範な`write`スコープを指摘する。

スコープごとの指針とクラウド認証用OIDCの設定は`references/permissions-and-tokens.md`を読む。

### 手順5 — アクション参照（サプライチェーン）を監査する

すべての`uses:`について次を確認する。

* **第三者アクション**（`actions/*`または`github/*`以外）は、タグやブランチではなく、完全な40文字のコミットSHAに**必ず**固定する。タグとブランチは可変であり、侵害された上流アクションが`v1`を書き換えると、トークンとシークレットを使って悪意あるコードを実行できる。
* 第一者の`actions/*`はリスクが低いが、SHA固定は依然として強化策として推奨する。
* `@main`、`@master`、またはブランチ参照をHIGHとして指摘する — これは「最新版」であり、いつでも変更できる。
*人間が読めるバージョンを、末尾コメントとして固定SHAの横に記載することを提案する：`uses: foo/bar@<sha> # v2.1.0`

固定、Actions用Dependabot、アーティファクト／キャッシュのリスクは`references/supply-chain.md`を読む。

### 手順6 — シークレットと出力の扱いを確認する

* シークレットをログへエコー、表示、書き込みしない。シークレットに触れるステップで`set -x` / `bash -x`を使用しない。
* 信頼されていないコードや信頼されていない第三者アクションを実行するステップへシークレットを渡さない。
* `$GITHUB_ENV`または`$GITHUB_OUTPUT`へ書き込む信頼されていない複数行データは、環境変数やステップ出力をインジェクトできる — ランダムな区切り文字を使うheredoc形式を使用し、ユーザー入力をそのまま書き込まない。
* `actions/checkout`はデフォルトでトークンをディスクへ残す。ジョブが後で信頼されていないコードを実行する場合は、`persist-credentials: false`を設定する。

### 手順7 — レポートを作成する

`references/report-format.md`の形式で指摘を出力する。最初に重大度の概要表を置き、その後にファイル、問題のあるYAMLの正確な内容、平易な言葉でのリスク、具体的な修正前／修正後を含む指摘を、問題種別ごとにまとめる。自動的に変更を適用せず、レビューのために提示する。

## 重大度の指針

| 重大度 | 意味 | 例 |
| --- | --- | --- |
| 🔴 CRITICAL | 外部コントリビューターが到達できるトークン／シークレット窃取またはRCE | `pull_request_target`がフォークコードをチェックアウトして実行する；特権トリガーの`run`内に`${{ github.event.* }}`がある |
| 🟠 HIGH | 悪用可能なサプライチェーンまたはスコープの問題 | 可変タグ／ブランチの第三者アクション；`write-all`権限；`issue_comment`でのインジェクション入り口 |
| 🟡 MEDIUM | 条件または連鎖によるリスク | `permissions:`ブロックの欠落；フォークでないPR作成者からアクセス可能なシークレット |
| 🔵 LOW | 強化の不足、直接的なリスクは低い | SHA固定されていない第一者アクション；非特権ジョブで`persist-credentials`がデフォルトのまま |
| ⚪ INFO | 脆弱性ではなく観察事項 | 固定SHAの横にバージョンコメントがない |

## 出力規則

* **必ず**最初に重大度別の件数を示す指摘概要表を表示する。
* **ファイル別ではなく、問題種別ごとに**まとめる。
* **正確に** — 問題のある行を引用し、行位置を示す。
* CRITICAL/HIGHには**必ず**具体的な修正後YAMLスニペットを添える。
* フォークの`pull_request`は、信頼されていないコードを実行するというだけで危険だと主張しない — シークレットはなく、トークンは読み取り専用である。CRITICALは特権トリガーに限定する。
* ワークフローがすでに強化されている場合は、その旨を述べ、確認した項目を列挙する。

## 参照ファイル

必要に応じて次を読み込む。

* `references/triggers-and-privilege.md` — すべてのトリガーの信頼マトリックス、特権トリガーである`pull_request_target`と`workflow_run`の理由、2ワークフローによる安全なパターン。
  + 検索パターン：`pull_request_target`、`workflow_run`、`issue_comment`、`fork`、`secrets`、`read-only token`、`trust boundary`
* `references/injection.md` — 攻撃者が制御できる`${{ }}`コンテキストの完全な一覧と、各入り口（`run`、`github-script`、アクション入力）に対する`env:`変数の安全なパターン。
  + 検索パターン：`script injection`、`github.event`、`head_ref`、`issue title`、`env`、`intermediate variable`、`actions/github-script`
* `references/permissions-and-tokens.md` — `GITHUB_TOKEN`のスコープ、ジョブ種別ごとの最小権限`permissions:`レシピ、長期シークレットの代わりのクラウド認証用OIDC。
  + 検索パターン：`permissions`、`GITHUB_TOKEN`、`write-all`、`contents: read`、`id-token`、`OIDC`、`least privilege`
* `references/supply-chain.md` — 第三者アクションのSHA固定、Actions用Dependabot、`workflow_run`におけるアーティファクトとキャッシュの汚染、セルフホステッドランナーの露出。
  + 検索パターン：`SHA pin`、`uses`、`mutable tag`、`Dependabot`、`download-artifact`、`cache`、`self-hosted runner`
* `references/report-format.md` — 出力テンプレート：概要、指摘カード、修正前／修正後のブロック。
  + 検索パターン：`report`、`format`、`finding`、`summary`、`remediation`、`before`、`after`

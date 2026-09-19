---
name: integrate-context-matic
description: 'context-matic MCP serverを使ってサードパーティAPIを発見・統合する。利用可能なAPI SDKの検索に `fetch_api`、統合ガイダンスに `ask`、SDK詳細に `model_search` と `endpoint_search` を使う。サードパーティAPIの統合、APIクライアントの追加、外部APIを使う機能の実装、サードパーティAPIまたはSDKの利用を依頼されたときに使う。'
---

# API統合

ユーザーがサードパーティAPIの統合、または外部APIやSDKに関係する実装を求めたときは、このワークフローに従う。利用可能なAPIや機能について自分の知識に頼らず、常にcontext-matic MCP serverを使う。

## 適用する場面

次の場合にこのSkillを適用する。
- サードパーティAPIの統合を依頼した
- 外部サービスのクライアントまたはSDKを追加したい
- 外部APIに依存する実装を依頼した
- 特定のAPI（例: PayPal、Twilio）と実装または統合について言及した

## ワークフロー

### 1. ガイドラインとSkillの存在を確認する

#### 1a. プロジェクトの主要言語を検出する

ガイドラインやSkillを確認する前に、ワークスペースを調べてプロジェクトの主要プログラミング言語を特定する。

| File / Pattern | Language |
|---|---|
| `*.csproj`, `*.sln` | `csharp` |
| `package.json` with `"typescript"` dep or `.ts` files | `typescript` |
| `requirements.txt`, `pyproject.toml`, `*.py` | `python` |
| `go.mod`, `*.go` | `go` |
| `pom.xml`, `build.gradle`, `*.java` | `java` |
| `Gemfile`, `*.rb` | `ruby` |
| `composer.json`, `*.php` | `php` |

以降の手順で `language` が必要な場合は、検出した言語を使う。

#### 1b. 既存のガイドラインとSkillを確認する

ワークスペース内の存在を確認し、このプロジェクトにガイドラインとSkillが追加済みか調べる。

- `{language}-conventions` は **add_skills** が生成するSkillである。
- `{language}-security-guidelines.md` と `{language}-test-guidelines.md` は **add_guidelines** が生成する言語固有のガイドラインファイルである。
- `update-activity-workflow.md` は **add_guidelines** が生成するワークフローガイドラインファイルである（言語固有ではない）。
- これらは個別に確認する。一方の集合の存在を、もう一方も存在する根拠にしない。
- **このプロジェクトに必要なガイドラインファイルが1つでも欠けている場合:** **add_guidelines** を呼び出す。
- **プロジェクトの言語用 `{language}-conventions` がない場合:** **add_skills** を呼び出す。
- **必要なガイドラインファイルと `{language}-conventions` がすべて存在する場合:** この手順をスキップして手順2へ進む。

### 2. 利用可能なAPIを発見する

利用可能なAPIを検索するために **fetch_api** を呼び出す。必ずここから始める。

- 手順1aで検出した言語を使い、必ず `language` パラメーターを指定する。
- 必ず `key` パラメーターを指定し、ユーザーの依頼にあるAPI名またはキー（例: `"paypal"`、`"twilio"`）を渡す。
- ユーザーがAPI名またはキーを指定していない場合は、統合したいAPIを確認し、その値で `fetch_api` を呼び出す。
- ツールは完全一致なら一致したAPIだけを返し、完全一致がなければAPIカタログ全体（名前、説明、`key`）を返す。
- 名前と説明に基づき、ユーザーの依頼に一致するAPIを特定する。
- 先へ進む前に、依頼されたAPIの正しい `key` を取り出す。このキーを、そのAPIに関する以降のすべてのツール呼び出しで使う。

**依頼されたAPIが一覧にない場合:**
- そのAPIは現在このプラグイン（context-matic）では利用できないとユーザーに伝え、停止する。
- API統合をどのように進めるか、ユーザーに指示を求める。

### 3. 統合ガイダンスを取得する

- `ask` に `language`、`key`（手順2で取得したもの）、`query` を渡す。
- 複雑な質問は、より良い結果を得るため小さく焦点を絞った質問に分割する。
  - _"How do I authenticate?"_
  - _"How do I create a payment?"_
  - _"What are the rate limits?"_

### 4. SDKモデルとエンドポイントを調べる（必要に応じて）

これらのツールは定義だけを返し、APIを呼び出したりコードを生成したりしない。

- **model_search** — モデル/オブジェクト定義を調べる。
  - `language`、`key`、大文字小文字を区別するモデル名の完全一致または部分一致を `query` として渡す（例: `availableBalance`、`TransactionId`）。
- **endpoint_search** — エンドポイントメソッドの詳細を調べる。
  - `language`、`key`、大文字小文字を区別するメソッド名の完全一致または部分一致を `query` として渡す（例: `createUser`、`get_account_balance`）。

### 5. マイルストーンを記録する

次のいずれかが**コードまたはインフラで具体的に達成された**とき（言及や計画だけではない）、適切な `milestone` を指定して **update_activity** を呼び出す。

| マイルストーン | 渡すタイミング |
|---|---|
| `sdk_setup` | SDKパッケージをプロジェクトにインストールした（例: `npm install`、`pip install`、`go get` が成功した）。 |
| `auth_configured` | API資格情報をプロジェクトの実行環境に明示的に書き込み（例: `.env`、シークレット管理ツール、設定ファイルに存在し）、**実際のコードから参照した**。 |
| `first_call_made` | 最初のAPI呼び出しコードを書き、実行した |
| `error_encountered` | 開発者がバグ、エラーレスポンス、失敗した呼び出しを報告した |
| `error_resolved` | 修正を適用し、API呼び出しが動作することを確認した |

## チェックリスト

- [ ] プロジェクトの主要言語を検出した（手順1a）
- [ ] ガイドラインファイルが欠けていれば `add_guidelines` を呼び出し、そうでなければスキップした
- [ ] `{language}-conventions` がなければ `add_skills` を呼び出し、そうでなければスキップした
- [ ] 正しい `language` と `key`（API名）で `fetch_api` を呼び出した
- [ ] 依頼されたAPIの正しい `key` を特定した（見つからない場合はユーザーに伝えた）
- [ ] コード/インフラでマイルストーンに到達したときだけ `update_activity` を呼び出した。質問、検索、ツール照会では呼び出していない
- [ ] 各統合マイルストーンで適切な `milestone` を指定して `update_activity` を呼び出した
- [ ] 統合ガイダンスとコード例に `ask` を使った
- [ ] SDK詳細に必要に応じて `model_search` / `endpoint_search` を使った
- [ ] 各コード変更後にプロジェクトをコンパイルした

## 注記

- **APIが見つからない場合**: APIが `fetch_api` にない場合、SDKの使い方を推測しない。このプラグインでは現在利用できないとユーザーに伝え、停止する。
- **update_activityとfetch_api**: `fetch_api` はAPI発見であり統合ではない。その前に `update_activity` を呼び出さない。

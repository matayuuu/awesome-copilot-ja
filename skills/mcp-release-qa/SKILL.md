---
name: mcp-release-qa
description: '実際のプロトコルセッションを実行し、実行時機能をソースと文書と比較し、失敗経路をテストして再現可能な証拠を記録することで、リリース前のMCPサーバーを検証する。'
---

# MCPリリースQA

ユーザーが実際に実行するサーバーをテストする。スキーマレビューや単体テストの成功だけでは、実行時の証拠にならない。

このスキルはセキュリティレビューを補完する。プロトコルの挙動、公開コントラクトとの乖離、
トランスポートの正しさ、再現可能なリリース証拠に焦点を当てる。

## 規則

- 候補リビジョンからビルドした新しいサーバープロセスに対して確認を実行する。
- `initialize`、`notifications/initialized`、検出、呼び出しを同じセッションで行う。新しいプロセスは新しいSTDIOセッションである。
- ソースの登録内容を実装上の真実とし、公開ドキュメントはそれと一致すべきコントラクトとして扱う。
- 正確なコマンドと生の応答を記録する。不足している証拠を「正しそう」で置き換えない。
- 本番データに対して変更可能なツールを呼び出さない。フィクスチャ、サンドボックスを使うか、安全なテスト環境がないことを明記して停止する。
- 実行ごとに候補ソースから期待される機能インベントリを導出する。

## 1. リリース対象の把握

次を特定する:

- 候補コミットとビルドコマンド
- サーバーのエントリポイントとトランスポート（STDIO、Streamable HTTP、SSE）
- サポート対象のMCPプロトコルバージョン
- ツール、リソース、リソーステンプレート、プロンプトを登録するソースファイル
- 生成済みカタログ、マニフェスト、READMEの表、インストール手順
- 既存のプロトコル、統合、スモークテスト用コマンド

リポジトリ固有のコマンドを優先する。テストハーネスを新たに作る前に、
`package.json`、`pyproject.toml`、`Makefile`、CIワークフロー、コントリビューター向け指示を確認する。

## 2. クリーンなサーバーを起動

候補をビルドし、テストに安全な構成で文書化されたエントリポイントを起動する。次を記録する:

- the exact command;
- commit SHA;
- environment variable names, with values redacted;
- stdout, stderr, and exit status;
- the endpoint or child-process transport used by the client.

STDIOではstdoutをプロトコル専用にする。ログ、バナー、スタックトレースはstderrへ出す。
HTTPトランスポートでは資格情報を出力せず、ステータス、関連するMCPヘッダー、セッション識別子の処理を記録する。

文書化された手順でサーバーを起動できない場合はリリース失敗として報告し、起動エラーをそのまま保存する。

## 3. 完全なセッションを1つ実行

実際のMCPクライアントまたはリポジトリの統合ハーネスで、次の手順を実行する:

1. `initialize` with a protocol version the server claims to support.
2. Confirm the negotiated version and advertised capabilities.
3. Send `notifications/initialized`.
4. Call `ping`.
5. Call each supported discovery method:
   - `tools/list`
   - `resources/list`
   - `resources/templates/list`
   - `prompts/list`
6. Exercise at least one representative read-only item from every advertised
   capability class.
7. Follow pagination until no cursor remains when a list method is paginated.

初期化後のリクエストを別々のワンショットプロセスから送らない。そうすると、1つの有効なセッションではなく、
複数の未完了セッションを誤ってテストすることになる。

## 4. インベントリの一致を証明

現在の証拠から4種類のインベントリを作成する:

| Surface | Evidence |
|---|---|
| Source | Registered tool, resource, template, and prompt definitions |
| Runtime | Results from the live discovery methods |
| Generated metadata | Catalogs, manifests, or generated indexes |
| Documentation | README, reference pages, and install output |

安定した識別子で比較し、次を報告する:

- source entries missing at runtime;
- runtime entries absent from metadata or documentation;
- stale names, descriptions, arguments, URIs, or prompt parameters;
- documented install commands that do not start the candidate server.

派生ファイルをリポジトリ固有のビルドコマンドで再生成し、ワークツリーに説明できない生成差分が残る場合は失敗とする。

## 5. 公開コントラクトを確認

検出した各項目について、実行時定義をソースと照合する:

### Tools

- Name and description are stable and specific.
- `inputSchema` defines types, required fields, enums, and bounds where needed.
- Unknown properties are rejected when the tool contract is closed.
- Mutation, idempotence, read-only, and open-world annotations match behavior.
- Successful calls conform to `outputSchema` when one is published.
- Errors are protocol errors or structured tool failures, not leaked stack
  traces.

### Resources and templates

- URIs and MIME types match the registered definitions.
- Static resources are readable.
- Template parameters are validated before resolution.
- Missing or forbidden resources fail explicitly.

### Prompts

- Required and optional arguments match discovery output.
- `prompts/get` returns usable messages for valid arguments.
- Missing required arguments and unknown prompt names fail explicitly.

## 6. 失敗経路をテスト

最低限、次を確認する:

- a request before initialization completes;
- malformed JSON or an invalid JSON-RPC envelope;
- an unknown method;
- an unsupported protocol version;
- repeated initialization;
- unknown tool, resource, and prompt names;
- missing, extra, wrong-type, and out-of-bounds arguments;
- a request at the documented transport-size limit and one beyond it;
- a controlled internal failure with credentials and stack traces redacted.

Verify that each response has the correct request ID, a useful error message,
and no successful side effect. For STDIO, also confirm every stdout line is a
complete protocol message and a healthy session leaves stderr clean unless the
server explicitly documents diagnostic output.

## 7. インストールをスモークテスト

プロジェクトがインストールコマンドを公開している場合:

1. Create a temporary destination outside the source checkout.
2. Run the public install command exactly as documented.
3. Start the installed artifact without relying on files from the source tree.
4. Repeat initialization, discovery, and one read-only invocation.
5. Remove the temporary destination after preserving the command output.

An install string that was only inspected is unverified.

## 8. 証拠を報告

次の形式を使用する:

```markdown
# MCP Release QA

Candidate: [commit]
Transport: [STDIO | Streamable HTTP | SSE]
Verdict: PASS | PASS WITH CAVEATS | FAIL

## Commands and results
- `[exact command]` — [exit status and result]

## Session transcript
- initialize: [result]
- discovery: [result]
- representative calls: [result]
- negative paths: [result]

## Parity
| Identifier | Source | Runtime | Metadata | Docs | Result |
|---|---|---|---|---|---|

## Findings
| Severity | Evidence | Impact | Narrowest fix |
|---|---|---|---|

## Missing evidence
- [check that could not run and why]
```

Use `FAIL` for a server that cannot start, complete a valid session, keep the
transport parseable, or safely reject invalid input. Use `PASS WITH CAVEATS`
only for bounded documentation or metadata drift that does not misrepresent a
dangerous capability. Otherwise use `PASS`.

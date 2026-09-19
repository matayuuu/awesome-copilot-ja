---
name: flowstudio-power-automate-mcp
description: 'FlowStudio MCP 経由で Power Automate を扱うための基盤スキルです。認証設定、再利用可能な MCP ヘルパー（Python + Node.js）、`list_skills` / `tool_search` によるツール検出、巨大な応答の処理を扱います。エージェントを Power Automate に接続するときに最初に読み込みます。専門ワークフローでは `flowstudio-power-automate-build`、`flowstudio-power-automate-debug`、`flowstudio-power-automate-monitoring`（Pro+）、または `flowstudio-power-automate-governance`（Pro+）を読み込みます。各スキルはワークフローの説明を含み、このスキルはそれらすべてが依存する基盤を提供します。FlowStudio MCP サブスクリプションまたは互換サーバーが必要です（https://mcp.flowstudio.app を参照）。'
---

# FlowStudio MCP 経由の Power Automate — 基盤

このスキルは**基盤レイヤー**です。AI エージェントが FlowStudio MCP サーバーと
確実に通信し、利用可能なツールを検出して、応答を適切に処理するための手段を提供します。実際のワークフローの説明は、すべてこのスキルを基盤とする 4 つの専門スキルにあります。

> **実際のデバッグ例**: [子フローの式エラー](https://github.com/ninihen1/power-automate-mcp-skills/blob/main/examples/fix-expression-error.md) |
> [フローのバグではなくデータ入力](https://github.com/ninihen1/power-automate-mcp-skills/blob/main/examples/data-not-flow.md) |
> [Null 値によって子フローがクラッシュ](https://github.com/ninihen1/power-automate-mcp-skills/blob/main/examples/null-child-flow.md)

> **必要なもの:** [FlowStudio](https://mcp.flowstudio.app) MCP サブスクリプション（または
> 互換性のある Power Automate MCP サーバー）。必要なもの:
> - MCP エンドポイント: `https://mcp.flowstudio.app/mcp`（すべてのサブスクライバーで共通）
> - API キー / JWT トークン（`x-api-key` ヘッダー — Bearer ではない）
> - ChatGPT または claude.ai ではキーは不要です: `https://mcp.flowstudio.app/mcp/oauth` を
>   コネクタとして追加し、Microsoft でサインインしてください。詳細は
>   [ChatGPT のチュートリアル](https://learn.flowstudio.app/chatgpt-power-automate)を参照してください
> - Power Platform 環境名（例: `Default-<tenant-guid>`）

---

## 使用するスキルの選び方

スキルは、呼び出すツールではなく**ユースケースの意図**によって整理されています。
複数のスキルが同じ基盤ツールを再利用します。ユーザーが達成しようとしていることに基づいて選んでください。

| ユーザーがしたいこと… | 読み込むスキル |
|---|---|
| フローを作成または変更する（新規作成、既存の変更、バグ修正、デプロイ） | **`flowstudio-power-automate-build`** |
| フローが失敗した理由を診断する（失敗した実行の根本原因分析） | **`flowstudio-power-automate-debug`** |
| テナント全体のフロー正常性、失敗率、資産インベントリを確認する | **`flowstudio-power-automate-monitoring`** *(Pro+)* |
| フローのタグ付け、監査、分類、スコアリング、またはオフボードを行う | **`flowstudio-power-automate-governance`** *(Pro+)* |
| 接続、認証設定、ヘルパーの作成、応答の解析のみを行う | このスキル（基盤） |

**同じツール、異なる視点。** `flowstudio-power-automate-build` と `flowstudio-power-automate-debug` はどちらも
`update_live_flow`、`get_live_flow`、および実行エラーツールを呼び出します。ただし、
*方向性*（前向き vs 後ろ向き）と*意図*（作成 vs 診断）が異なります。
`flowstudio-power-automate-monitoring` と `flowstudio-power-automate-governance` はどちらも Store
ツールを呼び出します。ただし、*対象者*（運用担当 vs コンプライアンス）と*成果*（正常性の読み取り vs メタデータの書き込み）が異なります。「どのツールがどのスキルに属するか」を暗記しようとせず、ユーザーが何をしているかでスキルを選んでください。

---

## 信頼できる情報源

| 優先順位 | 情報源 | 対象 |
|----------|--------|--------|
| 1 | **実際の API 応答** | サーバーが実際に返す内容を常に信頼する |
| 2 | **`tool_search` / `list_skills`** | 正式なツール スキーマ、パラメーター名、型、必須フラグ |
| 3 | **SKILL ドキュメントと参照ファイル** | ワークフローの説明、応答形式、自明ではない動作 |

ドキュメントが実際の API 応答と一致しない場合は、API を優先します。このスキル
（または他のスキル）のツール スキーマはサーバーより遅れている可能性があります。最近使用していないツールを呼び出す前に、`tool_search` を呼び出して現在の形式を確認してください。

---

## エージェントによるツールの検出

FlowStudio MCP サーバー（v1.1.5 以降）は、エージェントが現在のタスクに関連するツールだけを読み込めるようにする、**課金対象外**の 2 つのメタツールを公開しています。`tools/list`（30 個以上のスキーマを一度にすべて読み込む）やツール名の推測よりも、こちらを優先して使用してください。

| メタツール | 呼び出すタイミング |
|---|---|
| `list_skills` | コールド スタート — 利用可能なバンドル（`build-flow`、`create-flow`、`debug-flow`、`monitor-flow`、`discover`、`governance`）を確認して 1 つ選ぶ |
| `tool_search` と `query: "skill:<name>"` | 1 つのバンドルの完全なスキーマ セットを読み込む（例: `skill:debug-flow`） |
| `tool_search` と `query: "select:tool1,tool2"` | 名前で特定のツールを読み込む（例: バンドルをまたいでチェーンする場合） |
| `tool_search` と `query: "<keywords>"` | ユーザーの要求が曖昧な場合に自由形式で検索する（例: `"cancel run"`） |

サーバーの `tool_search` バンドルは、意図的にこの
スキル ファミリーより**狭い範囲**にされています。意図ごとに、必要となる可能性が最も高いツールのスターター パックです。ワークフロー スキル（例: `flowstudio-power-automate-debug`）はバンドルを取得した後、ワークフローの進行に合わせて追加ツール用に `tool_search` を再度呼び出す場合があります。

```python
# Cold start — pick a bundle by intent
skills = mcp("list_skills", {})
# [{"name": "debug-flow", "description": "Investigate why a flow is failing...",
#   "tools": ["get_live_flow_runs", "get_live_flow_run_error", ...]}, ...]

# Load schemas for the bundle
debug_tools = mcp("tool_search", {"query": "skill:debug-flow"})
```

現在よく使用されるバンドル:

| バンドル | 使用する場面 |
|---|---|
| `create-flow` | 新しいフローを作成する場合。環境/接続の検出、コネクタの説明、動的オプション、および `update_live_flow` が含まれる |
| `build-flow` | 既存のフロー定義を読み取りまたは変更する場合 |
| `debug-flow` | 失敗した実行とアクション レベルの入力/出力を調査する場合 |
| `monitor-flow` | 実行の開始/停止、トリガー、キャンセル、または再送信を行う場合 |
| `discover` | 環境、フロー、接続を列挙する場合 |
| `governance` | Pro+ のキャッシュ ストアのタグ付け、作成者監査、メタデータ更新を行う場合 |

---

## 推奨言語: Python または Node.js

このスキル ファミリーのすべての例では、**`urllib.request` を使用する Python**
（stdlib — `pip install` は不要）を使用します。**Node.js** も同様に有効な選択肢です:
`fetch` は Node 18+ で組み込まれており、JSON 処理はネイティブで、async/await は
MCP ツール呼び出しのリクエスト/レスポンス パターンに自然に対応します。そのため、すでに JavaScript/TypeScript スタックで作業しているチームに適しています。

| 言語 | 評価 | 注記 |
|---|---|---|
| **Python** | 推奨 | JSON 処理が明確でエスケープの問題がなく、すべてのスキル例で使用する |
| **Node.js (≥ 18)** | 推奨 | ネイティブの `fetch` + `JSON.stringify`/`JSON.parse`。追加パッケージ不要 |
| PowerShell | フロー操作には避ける | `ConvertTo-Json -Depth` はネストされた定義を暗黙に切り詰める。クォートとエスケープにより複雑なペイロードは壊れる。簡単な接続スモークテストには使用可能だが、フローの作成または更新には適さない。 |
| cURL / Bash | 可能だが脆弱 | ネストされた JSON のシェル エスケープはエラーを起こしやすく、ネイティブ JSON パーサーがない |

> **要約 — 以下の Core MCP Helper（Python または Node.js）を使用してください。** どちらも JSON-RPC のフレーミング、認証、応答解析を単一の再利用可能な関数で処理します。

---

## 中核 MCP ヘルパー（Python）

以降のすべての操作では、このヘルパーを使用してください:

```python
import json, urllib.request

TOKEN = "<YOUR_JWT_TOKEN>"
MCP   = "https://mcp.flowstudio.app/mcp"

def mcp(tool, args, cid=1):
    payload = {"jsonrpc": "2.0", "method": "tools/call", "id": cid,
               "params": {"name": tool, "arguments": args}}
    req = urllib.request.Request(MCP, data=json.dumps(payload).encode(),
        headers={"x-api-key": TOKEN, "Content-Type": "application/json",
                 "User-Agent": "FlowStudio-MCP/1.0"})
    try:
        resp = urllib.request.urlopen(req, timeout=120)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"MCP HTTP {e.code}: {body[:200]}") from e
    raw = json.loads(resp.read())
    if "error" in raw:
        raise RuntimeError(f"MCP error: {json.dumps(raw['error'])}")
    text = raw["result"]["content"][0]["text"]
    return json.loads(text)
```

> **よくある認証エラー:**
> - HTTP 401/403 → トークンがない、期限切れ、または形式が不正です。[mcp.flowstudio.app](https://mcp.flowstudio.app) から新しい JWT を取得してください。
> - HTTP 400 → JSON-RPC ペイロードの形式が不正です。`Content-Type: application/json` と本文の構造を確認してください。
> - `MCP error: {"code": -32602, ...}` → ツール引数が誤っているか、不足しています。`tool_search` を `select:<toolname>` とともに呼び出して、スキーマを確認してください。

---

## 中核 MCP ヘルパー（Node.js）

Node.js 18+ 向けの同等のヘルパーです（組み込みの `fetch` — パッケージ不要）:

```js
const TOKEN = "<YOUR_JWT_TOKEN>";
const MCP   = "https://mcp.flowstudio.app/mcp";

async function mcp(tool, args, cid = 1) {
  const payload = {
    jsonrpc: "2.0",
    method: "tools/call",
    id: cid,
    params: { name: tool, arguments: args },
  };
  const res = await fetch(MCP, {
    method: "POST",
    headers: {
      "x-api-key": TOKEN,
      "Content-Type": "application/json",
      "User-Agent": "FlowStudio-MCP/1.0",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`MCP HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  const raw = await res.json();
  if (raw.error) throw new Error(`MCP error: ${JSON.stringify(raw.error)}`);
  return JSON.parse(raw.result.content[0].text);
}
```

> Node.js 18+ が必要です。古い Node では、`fetch` を stdlib の `https.request` に置き換えるか、`node-fetch` をインストールしてください。

---

## 接続の検証

トークン、エンドポイント、ヘルパーがすべて動作することを確認する 3 行のスモークテスト:

```python
skills = mcp("list_skills", {})
print(f"Connected — {len(skills)} skill bundles available:",
      [s["name"] for s in skills])
```

想定される出力:

```text
Connected — 6 skill bundles available: ['build-flow', 'create-flow', 'debug-flow', 'monitor-flow', 'discover', 'governance']
```

これが失敗する場合は、上記の**よくある認証エラー**の注記を参照してください。成功した場合は、ユーザーの意図に合うワークフロー スキルへ引き渡してください。

---

## サイズ超過の応答の処理

一部の MCP ツール応答は、エージェントのコンテキスト ウィンドウを超えるほど大きくなります:

| ツール | 一般的なサイズ | 原因 |
|---|---|---|
| `describe_live_connector` | 100-600 KB | コネクタの完全な Swagger 仕様 |
| `get_live_dynamic_properties` | 50-500 KB | SharePoint リスト列などの動的コネクタ フィールド スキーマ |
| `get_live_flow_run_action_outputs`（`actionName` なし） | 50 KB ～ 数 MB | トップレベル アクションの出力。foreach 内のアクションでは、すべての繰り返しが返される場合がある |
| `get_live_flow`（大規模フロー） | 50-500 KB | 深くネストされた分岐 |
| `list_live_flows`（大規模テナント） | 50-200 KB | 数百件のフロー レコード |

### ハーネスがファイルへ退避する場合

エージェント ハーネス（Claude Code、VS Code Copilot など）は、サイズ超過の応答を一時ファイル
（例: `tool-results/mcp-flowstudio-describe_live_connector-NNNN.txt`）
に保存し、インライン JSON の代わりにパスを返します。このファイルは**二重にラップ**されています。外側の MCP エンベロープと、内側の JSON エスケープされたペイロードです:

```text
[{"type":"text","text":"<JSON-escaped payload>"}]
```

使用可能なオブジェクトに到達するには 2 回の解析が必要です:

```python
import json
with open(path) as f:
    raw = json.loads(f.read())
payload = json.loads(raw[0]["text"])
```

```powershell
$payload = ((Get-Content $path -Raw | ConvertFrom-Json)[0].text) | ConvertFrom-Json
```

### 経験則

1. **出力せず抽出する。** 必要な特定フィールド（1 つの `operationId`、1 つのアクションの出力）を取得し、それ以外は推論前に破棄してください。
2. **`get_live_flow_run_action_outputs` には常に `actionName` を渡す。** 省略すると、すべてのトップレベル アクションを取得します。foreach 内のアクションでは、`iterationIndex` なしで `actionName` を渡すと、そのアクションのすべての繰り返しが返される場合があります。
3. **セッション内で退避ファイルを再利用する。** 同じコネクタの swagger を再取得すると 30 秒以上かかり、別の退避ファイルが生成されます。パスをキャッシュしてください。
4. **退避ファイルを JSON キーで直接 grep しない。** 文字列はファイル内で JSON エスケープされています（`\"OperationId\":`）ので、`"OperationId":` を通常の grep で検索しても一致しません。先に解析してからフィルターしてください。
5. **ツール出力をユーザー向けに要約する。** フロー一覧には `name + state + trigger` を、実行エラーには `actionName + status + code` を出力してください。要求されない限り、生の JSON は出力しないでください。

```python
# Good — drill into one operation in a connector swagger
conn = mcp("describe_live_connector", {"environmentName": ENV, "connectorName": "shared_sharepointonline"})
op = conn["properties"]["swagger"]["paths"]["/datasets/{dataset}/tables/{table}/items"]["get"]
print(op["operationId"], "—", op.get("summary"))

# Bad — keeping the whole 500 KB swagger in context
print(json.dumps(conn, indent=2))   # don't do this
```

---

## 認証と接続に関する注記

| フィールド | 値 |
|---|---|
| 認証ヘッダー | `x-api-key: <JWT>` — `Authorization: Bearer` では**ない** |
| トークン形式 | プレーン JWT — 削除、変更、接頭辞の追加をしない |
| タイムアウト | `get_live_flow_run_action_outputs`（大きな出力）には 120 秒以上を使用する |
| 環境名 | `Default-<tenant-guid>`（`list_live_environments` または `list_live_flows` の応答で確認） |

---

## 参照ファイル

- [MCP-BOOTSTRAP.md](references/MCP-BOOTSTRAP.md) — エンドポイント、認証、リクエスト/応答形式（最初に読んでください）
- [tool-reference.md](references/tool-reference.md) — 応答形式と動作に関する注記（パラメーターは `tool_search` にあります）
- [action-types.md](references/action-types.md) — Power Automate アクション タイプのパターン
- [connection-references.md](references/connection-references.md) — コネクタ参照ガイド

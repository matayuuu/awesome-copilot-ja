---
name: flowstudio-power-automate-debug
description: 'FlowStudio MCP サーバーを使用して失敗した Power Automate クラウドフローをデバッグします。Graph API では最上位のステータスコードしか表示されませんが、このスキルは実際の根本原因を特定するためにアクションレベルの入力と出力を提供します。フローのデバッグ、失敗した実行の調査、フローが失敗する理由の確認、アクション出力の検査、フローエラーの根本原因特定、壊れたフローの修正、タイムアウトの診断、DynamicOperationRequestFailure の追跡、コネクタ認証エラーの確認、実行からのエラー詳細の取得、式の失敗のトラブルシューティングを求められた場合に読み込みます。FlowStudio MCP サブスクリプションが必要です（https://mcp.flowstudio.app を参照）。'
---

# FlowStudio MCP による Power Automate デバッグ

FlowStudio MCP server を通じて失敗している Power Automate
cloud flows を調査するための、段階的な診断プロセスです。

> **実際のデバッグ例**: [子フローの式エラー](https://github.com/ninihen1/power-automate-mcp-skills/blob/main/examples/fix-expression-error.md) |
> [データ入力の問題であり、フローのバグではない](https://github.com/ninihen1/power-automate-mcp-skills/blob/main/examples/data-not-flow.md) |
> [null 値で子フローがクラッシュする](https://github.com/ninihen1/power-automate-mcp-skills/blob/main/examples/null-child-flow.md)

**前提条件**: 有効な JWT で FlowStudio MCP server に到達できる必要があります。
接続設定については `flowstudio-power-automate-mcp` skill を参照してください。
https://mcp.flowstudio.app で購読してください

---

## 信頼できる情報源

> 利用可能な tool 名とパラメーター スキーマを確認するため、**必ず最初に `list_skills` / `tool_search` を呼び出してください**。
> tool 名とパラメーターは、server バージョン間で変わる可能性があります。
> この skill では、レスポンス形状、挙動上の注意点、診断パターンを扱います —
> これらは tool スキーマだけでは分からないことです。このドキュメントが
> `tool_search` または実際の API レスポンスと矛盾する場合は、API が優先されます。

---

## Python ヘルパー

```python
import json, urllib.request

MCP_URL   = "https://mcp.flowstudio.app/mcp"
MCP_TOKEN = "<YOUR_JWT_TOKEN>"

def mcp(tool, **kwargs):
    payload = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/call",
                          "params": {"name": tool, "arguments": kwargs}}).encode()
    req = urllib.request.Request(MCP_URL, data=payload,
        headers={"x-api-key": MCP_TOKEN, "Content-Type": "application/json",
                 "User-Agent": "FlowStudio-MCP/1.0"})
    try:
        resp = urllib.request.urlopen(req, timeout=120)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"MCP HTTP {e.code}: {body[:200]}") from e
    raw = json.loads(resp.read())
    if "error" in raw:
        raise RuntimeError(f"MCP error: {json.dumps(raw['error'])}")
    return json.loads(raw["result"]["content"][0]["text"])

ENV = "<environment-id>"   # e.g. Default-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## 手順 1 — Flow を特定する

```python
result = mcp("list_live_flows", environmentName=ENV)
# Returns a wrapper object: {mode, flows, totalCount, error}
target = next(f for f in result["flows"] if "My Flow Name" in f["displayName"])
FLOW_ID = target["id"]   # plain UUID — use directly as flowName
print(FLOW_ID)
```

---

## 手順 2 — 失敗した Run を見つける

```python
runs = mcp("get_live_flow_runs", environmentName=ENV, flowName=FLOW_ID, top=5)
# Returns direct array (newest first):
# [{"name": "08584296068667933411438594643CU15",
#   "status": "Failed",
#   "startTime": "2026-02-25T06:13:38.6910688Z",
#   "endTime": "2026-02-25T06:15:24.1995008Z",
#   "triggerName": "manual",
#   "error": {"code": "ActionFailed", "message": "An action failed..."}},
#  {"name": "...", "status": "Succeeded", "error": null, ...}]

for r in runs:
    print(r["name"], r["status"], r["startTime"])

RUN_ID = next(r["name"] for r in runs if r["status"] == "Failed")
```

---

## 手順 3 — 最上位のエラーを取得する

> **重要**: `get_live_flow_run_error` は、**どの** action が失敗したかを示します。
> `get_live_flow_run_action_outputs` は、**なぜ**失敗したかを示します。必ず両方を呼び出してください。
> エラーだけで止めないでください — `ActionFailed`、
> `NotSpecified`、`InternalServerError` のようなエラー コードは汎用的なラッパーです。実際の
> 根本原因（誤ったフィールド、null 値、HTTP 500 body、stack trace）は、action の inputs と outputs でのみ
> 確認できます。

```python
err = mcp("get_live_flow_run_error",
    environmentName=ENV, flowName=FLOW_ID, runName=RUN_ID)
# Returns:
# {
#   "runName": "08584296068667933411438594643CU15",
#   "failedActions": [
#     {"actionName": "Apply_to_each_prepare_workers", "status": "Failed",
#      "error": {"code": "ActionFailed", "message": "An action failed..."},
#      "startTime": "...", "endTime": "..."},
#     {"actionName": "HTTP_find_AD_User_by_Name", "status": "Failed",
#      "code": "NotSpecified", "startTime": "...", "endTime": "..."}
#   ],
#   "allActions": [
#     {"actionName": "Apply_to_each", "status": "Skipped"},
#     {"actionName": "Compose_WeekEnd", "status": "Succeeded"},
#     ...
#   ]
# }

# failedActions is ordered outer-to-inner. The ROOT cause is the LAST entry:
root = err["failedActions"][-1]
print(f"Root action: {root['actionName']} → code: {root.get('code')}")

# allActions shows every action's status — useful for spotting what was Skipped
# See common-errors.md to decode the error code.
```

---

## 手順 4 — 失敗した Action の Inputs と Outputs を調べる

> **これは最も重要な手順です。** `get_live_flow_run_error` から得られるのは
> 汎用的なエラー コードだけです。実際のエラー詳細 — HTTP status codes、
> response bodies、stack traces、null values — は、action の実行時
> inputs と outputs にあります。**失敗した action を特定したら、必ず直ちに調べてください。**

```python
# Get the root failing action's full inputs and outputs
root_action = err["failedActions"][-1]["actionName"]
detail = mcp("get_live_flow_run_action_outputs",
    environmentName=ENV,
    flowName=FLOW_ID,
    runName=RUN_ID,
    actionName=root_action)

if len(detail) > 1:
    print(f"{root_action} returned {len(detail)} repetitions; inspect iteration indexes")
out = detail[0] if detail else {}
print(f"Action: {out.get('actionName')}")
print(f"Status: {out.get('status')}")

# For HTTP actions, the real error is in outputs.body
if isinstance(out.get("outputs"), dict):
    status_code = out["outputs"].get("statusCode")
    body = out["outputs"].get("body", {})
    print(f"HTTP {status_code}")
    print(json.dumps(body, indent=2)[:500])

    # Error bodies are often nested JSON strings — parse them
    if isinstance(body, dict) and "error" in body:
        err_detail = body["error"]
        if isinstance(err_detail, str):
            err_detail = json.loads(err_detail)
        print(f"Error: {err_detail.get('message', err_detail)}")

# For expression errors, the error is in the error field
if out.get("error"):
    print(f"Error: {out['error']}")

# Also check inputs — they show what expression/URL/body was used
if out.get("inputs"):
    print(f"Inputs: {json.dumps(out['inputs'], indent=2)[:500]}")
```

### action の outputs から分かること（エラー コードでは分からないこと）

| `get_live_flow_run_error` からのエラー コード | `get_live_flow_run_action_outputs` で分かること |
|---|---|
| `ActionFailed` | 実際に失敗したネストされた action と、その HTTP レスポンス |
| `NotSpecified` | 実際のエラーを含む HTTP status code + response body |
| `InternalServerError` | server のエラー メッセージ、stack trace、または API error JSON |
| `InvalidTemplate` | 失敗した正確な expression と、null / 誤った型の値 |
| `BadRequest` | 送信された request body と、server がそれを拒否した理由 |

### foreach の反復

`actionName` が foreach 内の action を参照している場合、output tool は
その action のすべての反復を返すことがあります。各 item には、
loop 名と 0 始まりの `itemIndex` を含む
`repetitionIndexes` が含まれる場合があります。疑わしい item を見つけたら、
`iterationIndex` を使って 1 つの iteration を調べてください。

```python
all_reps = mcp("get_live_flow_run_action_outputs",
    environmentName=ENV,
    flowName=FLOW_ID,
    runName=RUN_ID,
    actionName=root_action)

for rep in all_reps[:10]:
    print(rep.get("repetitionIndexes"), rep.get("status"), rep.get("error"))

one_rep = mcp("get_live_flow_run_action_outputs",
    environmentName=ENV,
    flowName=FLOW_ID,
    runName=RUN_ID,
    actionName=root_action,
    iterationIndex=3)
```

### 証拠用 Compose の前後配置

不確実な connector 作業では、リスクのある action の前に `Compose_*_Request` を追加し、
その後に `Compose_*_Result` を追加します。その result action は
`Succeeded` と `Failed` の両方で許可します。これにより、将来のデバッグで、再デプロイを必要とせずにクリーンな payload snapshot を得られます。
これらの前後配置に secrets や長い binary payloads を含めないでください。

### 例: HTTP action が 500 を返す

```
Error code: "InternalServerError" ← this tells you nothing

Action outputs reveal:
  HTTP 500
  body: {"error": "Cannot read properties of undefined (reading 'toLowerCase')
    at getClientParamsFromConnectionString (storage.js:20)"}
  ← THIS tells you the Azure Function crashed because a connection string is undefined
```

### 例: null による Expression error

```
Error code: "BadRequest" ← generic

Action outputs reveal:
  inputs: "body('HTTP_GetTokenFromStore')?['token']?['access_token']"
  outputs: ""   ← empty string, the path resolved to null
  ← THIS tells you the response shape changed — token is at body.access_token, not body.token.access_token
```

---

## 手順 5 — Flow 定義を読む

```python
defn = mcp("get_live_flow", environmentName=ENV, flowName=FLOW_ID)
actions = defn["properties"]["definition"]["actions"]
print(list(actions.keys()))
```

definition 内で失敗した action を見つけます。その `inputs` expression を調べ、
どの data を期待しているかを理解します。

---

## 手順 6 — 失敗箇所からさかのぼる

失敗した action の inputs が upstream actions を参照している場合は、それらも
調べます。不正な data の発生源を見つけるまで、chain をさかのぼってください。

```python
# Inspect multiple actions leading up to the failure
for action_name in [root_action, "Compose_WeekEnd", "HTTP_Get_Data"]:
    result = mcp("get_live_flow_run_action_outputs",
        environmentName=ENV,
        flowName=FLOW_ID,
        runName=RUN_ID,
        actionName=action_name)
    out = result[0] if result else {}
    print(f"\n--- {action_name} ({out.get('status')}) ---")
    print(f"Inputs:  {json.dumps(out.get('inputs', ''), indent=2)[:300]}")
    print(f"Outputs: {json.dumps(out.get('outputs', ''), indent=2)[:300]}")
```

> ⚠️ array-processing actions からの output payloads は非常に大きくなることがあります。
> 表示する前に、必ず slice（例: `[:500]`）してください。

> **ヒント**: どの action が不正な data を生成したか分からない場合は、
> top-level actions を一覧するために `actionName` を省略します。foreach 内の action を選んだら、
> すべての反復を context に取り込まないよう `iterationIndex` を渡してください。

---

## 手順 7 — 根本原因を特定する

### Expression Errors（例: null に対する `split`）
エラーが `InvalidTemplate` または関数名に言及している場合:
1. definition 内で action を見つける
2. それが読み取っている upstream action/expression を確認する
3. null / missing fields がないか、**その upstream action の output を調べる**

```python
# Example: action uses split(item()?['Name'], ' ')
# → null Name in the source data
result = mcp("get_live_flow_run_action_outputs", ..., actionName="Compose_Names")
if not result:
    print("No outputs returned for Compose_Names")
    names = []
else:
    names = result[0].get("outputs", {}).get("body") or []
nulls = [x for x in names if x.get("Name") is None]
print(f"{len(nulls)} records with null Name")
```

### 誤った Field Path
Expression `triggerBody()?['fieldName']` が null を返す → `fieldName` が誤っています。
実際の field names を確認するため、**trigger output を調べてください**:
```python
result = mcp("get_live_flow_run_action_outputs", ..., actionName="<trigger-action-name>")
print(json.dumps(result[0].get("outputs"), indent=2)[:500])
```

### エラーを返す HTTP Actions
エラー コードが `InternalServerError` または `NotSpecified` である場合 — 実際の HTTP status と response body を取得するため、**必ず
action outputs を調べてください**:
```python
result = mcp("get_live_flow_run_action_outputs", ..., actionName="HTTP_Get_Data")
out = result[0]
print(f"HTTP {out['outputs']['statusCode']}")
print(json.dumps(out['outputs']['body'], indent=2)[:500])
```

### 接続 / 認証エラー
`ConnectionAuthorizationFailed` を探してください — connection owner は、
flow を実行している service account と一致している必要があります。API 経由では修正できません。PA designer で修正してください。

### Outlook user-picker の失敗（`DynamicListValuesUndefinedOrInvalid`）
`GetEmailsV3` のような Outlook actions は parameters（`mailboxAddress`、`to`、`cc`、
`from`）を使用し、その dropdown は `builtInOperation:AadGraph.GetUsers` によって支えられています — これは
PA listEnum layer で壊れており、常に
`DynamicListValuesUndefinedOrInvalid` を返します。これは、agent が `update_live_flow` 経由で Outlook action を再構築または
変更し、dynamic options を通じて user を解決しようとすると発生します。**AadGraph を再試行して修正しようとしないでください** — 代わりに
`shared_office365users.SearchUserV2` に切り替えてください（同じ AAD user shape を返します）。
影響を受ける parameter が構造化された `fallback` を公開しているかを確認するには
`describe_live_connector` を使用し、そのうえで壊れた AadGraph operation ではなく
`shared_office365users.SearchUserV2` に対して `get_live_dynamic_options` を呼び出してください。
dropdown options ではなく dynamic field schemas の場合は、
`describe_live_connector` によって返された metadata とともに
`get_live_dynamic_properties` を使用してください。

---

## 手順 8 — 修正を適用する

**expression/data の問題の場合**:
```python
defn = mcp("get_live_flow", environmentName=ENV, flowName=FLOW_ID)
acts = defn["properties"]["definition"]["actions"]

# Example: fix split on potentially-null Name
acts["Compose_Names"]["inputs"] = \
    "@coalesce(item()?['Name'], 'Unknown')"

conn_refs = defn["properties"]["connectionReferences"]
result = mcp("update_live_flow",
    environmentName=ENV,
    flowName=FLOW_ID,
    definition=defn["properties"]["definition"],
    connectionReferences=conn_refs)

print(result.get("error"))  # None = success
```

> ⚠️ `update_live_flow` は常に `error` key を返します。
> `null`（Python の `None`）という値は成功を意味します。

---

## 手順 9 — 修正を検証する

> **HTTP triggers だけでなく、任意の flow をテストするには `resubmit_live_flow_run` を使用してください。**
> `resubmit_live_flow_run` は、元の trigger
> payload を使用して以前の run を再実行します。これは **すべての trigger type** で機能します: Recurrence、SharePoint
> "When an item is created"、connector webhooks、Button triggers、HTTP
> triggers。flow を手動で trigger するよう user に依頼したり、
> 次の scheduled run を待ったりする必要はありません。
>
> `resubmit` が利用できない唯一のケースは、**一度も実行されたことのない新しい flow** です —
> replay する prior run がありません。

```python
# Resubmit the failed run — works for ANY trigger type
resubmit = mcp("resubmit_live_flow_run",
    environmentName=ENV, flowName=FLOW_ID, runName=RUN_ID)
print(resubmit)   # {"resubmitted": true, "triggerName": "..."}

# Wait ~30 s then check
import time; time.sleep(30)
new_runs = mcp("get_live_flow_runs", environmentName=ENV, flowName=FLOW_ID, top=3)
print(new_runs[0]["status"])   # Succeeded = done
```

### resubmit と trigger の使い分け

| シナリオ | 使用するもの | 理由 |
|---|---|---|
| 任意の flow で **fix をテストする** | `resubmit_live_flow_run` | 失敗を引き起こした正確な trigger payload を replay する — 検証に最適 |
| Recurrence / scheduled flow | `trigger_live_flow`（`body` なし） | portal の "Run flow" button のように今すぐ実行する。resubmit は過去の run の data を replay する |
| SharePoint / connector trigger | `resubmit_live_flow_run` | 実際の SP item を作成しないと trigger できない |
| **custom** test payload を使用する HTTP、Button、または PowerApps trigger | `trigger_live_flow` | original run とは異なる data を送信する必要がある場合 |
| 新しい flow、未実行 | `trigger_live_flow` | resubmit できる prior run が存在しない |

### custom payloads を使って HTTP、Button、PowerApps flows をテストする

`Request` trigger（HTTP request、manual Button、または PowerApps）を持つ flows では、
original run とは **異なる** payload を送信する必要がある場合に
`trigger_live_flow` を使用します。すべての種類で trigger inputs を `body` として渡します:

```python
# First inspect what the trigger expects — read directly from the flow definition
defn = mcp("get_live_flow", environmentName=ENV, flowName=FLOW_ID)
triggers = defn["properties"]["definition"]["triggers"]
manual = next(iter(triggers.values()))   # usually the only trigger on HTTP flows
request_schema = manual.get("inputs", {}).get("schema")
print("Expected body schema:", request_schema)

# Response schemas live on Response action(s) in the actions block
for name, act in defn["properties"]["definition"]["actions"].items():
    if act.get("type") == "Response":
        print(f"Response {name}:", act.get("inputs", {}).get("schema"))

# Trigger with a test payload
result = mcp("trigger_live_flow",
    environmentName=ENV,
    flowName=FLOW_ID,
    body={"name": "Test User", "value": 42})
print(f"Status: {result['responseStatus']}, Body: {result.get('responseBody')}")
print(f"Kind: {result['triggerKind']}, via: {result['invocation']}, run: {result.get('runName')}")
if result.get("warning"):
    print(result["warning"])   # required trigger inputs you left out
```

> `trigger_live_flow` は AAD-authenticated triggers を自動的に処理します。
> `Request` triggers（HTTP request、Button、PowerApps）と、
> scheduled（Recurrence）flows で機能し、これらは即時実行されます — scheduled trigger は inputs を取らないため、
> `body` はありません（body は拒否されます）。Automated
> connector triggers は source event からのみ発火します。
>
> Power Automate は trigger の `required` inputs を強制しません。1 つ省略しても
> run は開始され、その input は null になり、result には missing keys の名前を示す
> `warning` が含まれます。重要な場合は run をキャンセルし、
> full body でもう一度呼び出してください。
>
> `runName` は Button と PowerApps runs の場合にのみ返されます。HTTP triggers の場合は
> `get_live_flow_runs` で run を見つけてください。
>
> browser-extension key 経由では、Button と PowerApps triggers は
> empty body でのみ実行されます。tool はその旨を示し、回避策を列挙します: past run を resubmit する、
> flow 内で `coalesce(triggerBody()?['x'], 'value')` を使って inputs の default を設定する、
> または standard API key を使用する。

---

## クイック リファレンス診断判断ツリー

| 症状 | 最初の Tool | 次に必ず呼び出すもの | 確認する内容 |
|---|---|---|---|
| Flow が Failed と表示される | `get_live_flow_run_error` | 失敗した action に対して `get_live_flow_run_action_outputs` | `outputs` 内の HTTP status + response body |
| エラー コードが汎用的（`ActionFailed`、`NotSpecified`） | — | `get_live_flow_run_action_outputs` | `outputs.body` には実際のエラー メッセージ、stack trace、または API error が含まれる |
| HTTP action が 500 を返す | — | `get_live_flow_run_action_outputs` | server error detail を含む `outputs.statusCode` + `outputs.body` |
| Expression crash | — | prior action に対して `get_live_flow_run_action_outputs` | output body 内の null / wrong-type fields |
| Flow が開始されない | `get_live_flow` | — | `properties.state` = "Started" を確認 |
| Action が誤った data を返す | `get_live_flow_run_action_outputs` | — | 実際の output body と期待値の比較 |
| Fix を適用したがまだ失敗する | resubmit 後に `get_live_flow_runs` | — | new run の `status` field |

> **ルール: error codes だけで診断しないでください。** `get_live_flow_run_error` は
> 失敗した action を特定します。`get_live_flow_run_action_outputs` は
> 実際の原因を明らかにします。必ず両方を呼び出してください。

---

## 参照ファイル

- [common-errors.md](references/common-errors.md) — Error codes、考えられる原因、修正
- [debug-workflow.md](references/debug-workflow.md) — 複雑な失敗のための完全な decision tree

## 関連する Skills

- `flowstudio-power-automate-mcp` — 基盤 skill: connection setup、MCP helper、tool discovery
- `flowstudio-power-automate-build` — 新しい flows の build と deploy

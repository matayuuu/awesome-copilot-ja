---
name: flowstudio-power-automate-build
description: 'FlowStudio MCP サーバーを使用して Power Automate クラウドフローを構築、スキャフォールディング、デプロイします。ポータルを開かず、MCP 経由でフロー定義の構築、接続の配線、デプロイ、テストを行います。フローの作成、新規フローの構築、フロー定義のデプロイ、Power Automate ワークフローのスキャフォールディング、フロー JSON の構築、既存フローのアクション更新、フロー定義のパッチ、アクション追加、接続の配線、またはワークフロー定義の新規生成を求められた場合に読み込みます。FlowStudio MCP サブスクリプションが必要です（https://mcp.flowstudio.app を参照）。'
---

# FlowStudio MCP を使用した Power Automate フローの構築とデプロイ

FlowStudio MCP サーバーを介してプログラムで Power Automate クラウド フローを
構築およびデプロイするためのステップバイステップ ガイドです。

**前提条件**: 有効な JWT を使用して FlowStudio MCP サーバーに到達できる必要があります。
接続の設定については `flowstudio-power-automate-mcp` スキルを参照してください。
https://mcp.flowstudio.app で購読してください

ワークフロー:
1. 現在の構築ツールを読み込む。
2. 既存のフローを確認する。
3. 接続参照を解決する。
4. 定義を構築する。
5. デプロイする。
6. 検証する。
7. テストする。

---

## 信頼できる情報源

> **利用可能なツール名とパラメーター スキーマを確認するため、必ず最初に `list_skills` / `tool_search` を呼び出してください**。
> ツール名とパラメーターはサーバーのバージョン間で変更される可能性があります。
> このスキルでは、レスポンスの形状、動作上の注意事項、構築パターン、つまり
> ツール スキーマでは判断できない事項を扱います。このドキュメントが
> `tool_search` または実際の API レスポンスと矛盾する場合は、API を優先してください。

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

ENV = "<environment-id>"  # e.g. Default-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## 0. 現在の構築ツールを読み込む

新規フローの場合は、サーバーの `create-flow` バンドルを読み込みます。既存フローを
編集する場合は、`build-flow` を読み込みます。これにより、JSON を構築する前に
エージェントを MCP サーバーの現在のスキーマに合わせることができます。

```python
schemas = mcp("tool_search", query="skill:create-flow")
# Includes list_live_environments, list_live_connections,
# describe_live_connector, get_live_dynamic_options, update_live_flow.
```

バンドル外のツールが必要な場合は、明示的に読み込んでください。

```python
mcp("tool_search", query="select:get_live_dynamic_properties")
```

---

## 1. 安全確認: フローはすでに存在するか?

重複を避けるため、構築前に必ず確認してください。

```python
results = mcp("list_live_flows",
    environmentName=ENV,
    mode="owner",
    search="My New Flow",
    top=20)

# list_live_flows returns { "flows": [...], "mode": "...", ... }
matches = [f for f in results["flows"]
           if "My New Flow".lower() in f["displayName"].lower()]

if len(matches) > 0:
    # Flow exists — modify rather than create
    FLOW_ID = matches[0]["id"]   # plain UUID from list_live_flows
    print(f"Existing flow: {FLOW_ID}")
    defn = mcp("get_live_flow", environmentName=ENV, flowName=FLOW_ID)
else:
    print("Flow not found — building from scratch")
    FLOW_ID = None
```

非常に大規模な環境では、`list_live_flows` が継続 URL を返す場合があります。
次のバッチを取得するには、同じ `mode` とともに `continuationUrl` として
それを渡します。ユーザーが環境内のすべてのフローを必要とし、かつ MCP ID に
管理者権限がある場合にのみ `mode="admin"` を使用してください。

---

## 2. 接続参照を取得する

すべてのコネクタ アクションには、フローの `connectionReferences` マップ内のキーを指す
`connectionName` が必要です。そのキーは、環境内の認証済み接続にリンクされます。

> **必須**: 必ず最初に `list_live_connections` を呼び出してください。接続名や GUID を
> ユーザーに尋ねてはいけません。API は必要な正確な値を返します。
> 必要な接続が不足していることを API が確認した場合にのみ、ユーザーに確認してください。

### 2a — アクティブな接続を探す

```python
conns = mcp("list_live_connections", environmentName=ENV)
active = [c for c in conns["connections"]
          if c["statuses"][0]["status"] == "Connected"]
conn_map = {c["connectorName"]: c["id"] for c in active}
```

既知のコネクタについては、`search` を渡して出力を減らし、貼り付け可能な
`connectionReferenceTemplate` および `hostTemplate` の値を取得します。

```python
sp_conns = mcp("list_live_connections",
    environmentName=ENV,
    search="shared_sharepointonline")
```

### 2b — フローに必要なコネクタを特定する

一般的なコネクタ API 名: SharePoint `shared_sharepointonline`、Outlook
`shared_office365`、Teams `shared_teams`、Approvals `shared_approvals`、
OneDrive `shared_onedriveforbusiness`、Excel `shared_excelonlinebusiness`、
Dataverse `shared_commondataserviceforapps`、Forms `shared_microsoftforms`。

Recurrence + Compose + HTTP のみなど、コネクタを必要としないフローでは、
`connectionReferences` を省略できます。

### 2c — 接続が不足している場合は、ユーザーを案内する

```python
connectors_needed = ["shared_sharepointonline", "shared_office365"]  # adjust per flow
missing = [c for c in connectors_needed if c not in conn_map]
if missing:
    # STOP: connections require browser OAuth consent.
    # Ask the user to create the missing connector connections in the
    # selected environment, then re-run list_live_connections.
    raise Exception(f"Missing active connections: {missing}")
```

### 2d — connectionReferences ブロックを構築する

```python
connection_references = {}
host_templates = {}
for connector in connectors_needed:
    c = next(c for c in active if c["connectorName"] == connector)
    connection_references[connector] = c.get("connectionReferenceTemplate") or {
        "connectionName": c["id"],   # the connection id from list_live_connections
        "source": "Invoker",
        "id": f"/providers/Microsoft.PowerApps/apis/{connector}"
    }
    host_templates[connector] = c.get("hostTemplate") or {
        "connectionName": connector
    }
```

手順 3 のアクション JSON では、`inputs.host.connectionName` は GUID ではなく、
`shared_teams` のようなマップ キーでなければなりません。GUID は
`connectionReferences[connector].connectionName` の値の中にのみ属します。既存フローが同じコネクタを使用する場合は、
`get_live_flow` からその `properties.connectionReferences` をコピーすることもできます。

---

## 3. フロー定義を構築する

定義オブジェクトを構築します。完全なスキーマについては [flow-schema.md](references/flow-schema.md)
を参照してください。また、コピーして貼り付けられるテンプレートについては、次のアクション パターン リファレンスを参照してください。
- [action-patterns-core.md](references/action-patterns-core.md) — 変数、制御フロー、式
- [action-patterns-data.md](references/action-patterns-data.md) — 配列変換、HTTP、解析
- [action-patterns-connectors.md](references/action-patterns-connectors.md) — SharePoint、Outlook、Teams、Approvals

```python
definition = {
    "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
    "contentVersion": "1.0.0.0",
    "triggers": { ... },   # see trigger-types.md / build-patterns.md
    "actions": { ... }     # see ACTION-PATTERNS-*.md / build-patterns.md
}
```

> Recurrence+SharePoint+Teams、HTTP トリガーなどを対象とする、完全でそのまま使用できる
> フロー定義については [build-patterns.md](references/build-patterns.md) を参照してください。

### JSON を推測する前にコネクタ操作を検出する

コネクタを使用するトリガーおよびアクションでは、手書きの形状よりもライブ コネクタ記述子を
優先してください。これにより、作成時のヒント、正規の例、バリアント キー、入力/出力、
および動的メタデータ ポインターを取得できます。

```python
# Search across connectors when you know the user's intent but not the API.
matches = mcp("describe_live_connector",
    environmentName=ENV,
    search="send email",
    top=5)

# Describe a specific operation before copying an exampleDefinition.
op = mcp("describe_live_connector",
    environmentName=ENV,
    connectorName="shared_office365",
    operationId="SendEmailV2")
print(op.get("hint"))
```

操作に複数の作成済みバリアントがある場合は、フローが必要とするバリアントを要求してください。

```python
teams_chat = mcp("describe_live_connector",
    environmentName=ENV,
    connectorName="shared_teams",
    operationId="PostMessageToConversation",
    variant="flowbot_chat")
```

操作の説明でパラメーターに動的オプションまたは動的プロパティがあると示されている場合は、
示された次のツールを呼び出してください。

```python
sp_op = mcp("describe_live_connector",
    environmentName=ENV,
    connectorName="shared_sharepointonline",
    operationId="GetItems")

sites = mcp("get_live_dynamic_options",
    environmentName=ENV,
    connectorName="shared_sharepointonline",
    connectionName=conn_map["shared_sharepointonline"],
    operationId="GetItems",
    parameterName="dataset",
    dynamicMetadata=sp_op["dynamicParameters"]["dataset"])

fields = mcp("get_live_dynamic_properties",
    environmentName=ENV,
    connectorName="shared_sharepointonline",
    connectionName=conn_map["shared_sharepointonline"],
    operationId="GetItems",
    parameterName="item",
    parameters={"dataset": "<site-url>", "table": "<list-id>"},
    dynamicMetadata=sp_op["dynamicProperties"]["item"])
```

SharePoint サイト/リストや Teams チーム/チャネルなどのドロップダウン ID には動的オプションを
使用します。SharePoint リスト項目の列など、スキーマ/フィールドの形状には動的プロパティを
使用します。

---

## 4. デプロイ (作成または更新)

`update_live_flow` は、作成と更新の両方を単一のツールで処理します。

### 新規フローを作成する (既存フローなし)

`flowName` を省略します。サーバーが新しい GUID を生成し、PUT 経由で作成します。

```python
definition["description"] = "Weekly SharePoint → Teams notification flow, built by agent"

result = mcp("update_live_flow",
    environmentName=ENV,
    # flowName omitted → creates a new flow
    definition=definition,
    connectionReferences=connection_references,
    displayName="Overdue Invoice Notifications"
)

if result.get("error") is not None:
    print("Create failed:", result["error"])
else:
    # Capture the new flow ID for subsequent steps
    FLOW_ID = result["created"]
    print(f"✅ Flow created: {FLOW_ID}")
```

### 既存フローを更新する

PATCH するには `flowName` を指定します。

```python
definition["description"] = (
    "Updated by agent on " + __import__('datetime').datetime.utcnow().isoformat()
)

result = mcp("update_live_flow",
    environmentName=ENV,
    flowName=FLOW_ID,
    definition=definition,
    connectionReferences=connection_references,
    displayName="My Updated Flow"
)

if result.get("error") is not None:
    print("Update failed:", result["error"])
else:
    print("Update succeeded:", result)
```

> ⚠️ `update_live_flow` は常に `error` キーを返します。
> `null` (Python では `None`) は成功を意味します。キーが存在することを失敗として扱わないでください。
>
> ⚠️ フローの説明は `definition["description"]` にあります。現在のサーバーは使用状況追跡のために
> `#flowstudio-mcp` を追加します。アクティブなスキーマで `tool_search` が示されない限り、
> 最上位の `description` 引数を渡さないでください。

### 一般的なデプロイ エラー

| エラー メッセージ (含まれる文字列) | 原因 | 修正 |
|---|---|---|
| `missing from connectionReferences` | アクションの `host.connectionName` が、`connectionReferences` マップに存在しないキーを参照している | `host.connectionName` が、生の GUID ではなく `connectionReferences` の**キー** (例: `shared_teams`) を使用していることを確認する |
| `ConnectionAuthorizationFailed` / 403 | 接続 GUID が別のユーザーに属しているか、認可されていない | 手順 2a を再実行し、現在の `x-api-key` ユーザーが所有する接続を使用する |
| `InvalidTemplate` / `InvalidDefinition` | 定義 JSON の構文エラー | `runAfter` チェーン、式の構文、アクション型のスペルを確認する |
| `ConnectionNotConfigured` | コネクタ アクションは存在するが、接続 GUID が無効または期限切れである | 新しい GUID を取得するため `list_live_connections` を再確認する |

---

## 5. デプロイを検証する

```python
check = mcp("get_live_flow", environmentName=ENV, flowName=FLOW_ID)

# Confirm state
print("State:", check["properties"]["state"])  # Should be "Started"
# If state is "Stopped", use set_live_flow_state — NOT update_live_flow
# mcp("set_live_flow_state", environmentName=ENV, flowName=FLOW_ID, state="Started")

# Confirm the action we added is there
acts = check["properties"]["definition"]["actions"]
print("Actions:", list(acts.keys()))
```

---

## 6. フローをテストする

> **必須**: テスト実行をトリガーする前に、**ユーザーへ確認を求めてください**。
> フローの実行には実際の副作用があります。メールの送信、Teams メッセージの投稿、
> SharePoint への書き込み、承認の開始、外部 API の呼び出しが行われる場合があります。
> フローが何を行うかを説明し、`trigger_live_flow` または `resubmit_live_flow_run` を呼び出す前に
> 明示的な承認を待ってください。

### 更新済みフロー (過去の実行あり) — 任意のトリガー型

> **最初に `resubmit_live_flow_run` を使用してください。**これは Recurrence、SharePoint、
> コネクタ Webhook、Button、HTTP のすべてのトリガー型で機能します。元のトリガー ペイロードを
> 再実行します。ユーザーに手動でフローをトリガーするよう依頼したり、次のスケジュール実行を
> 待ったりしないでください。

```python
runs = mcp("get_live_flow_runs", environmentName=ENV, flowName=FLOW_ID, top=1)
if runs:
    # Works for Recurrence, SharePoint, connector triggers — not just HTTP
    result = mcp("resubmit_live_flow_run",
        environmentName=ENV, flowName=FLOW_ID, runName=runs[0]["name"])
    print(result)   # {"resubmitted": true, "triggerName": "..."}
```

### HTTP、Button、PowerApps フロー — カスタム テスト ペイロード

元の実行とは**異なる**ペイロードを送信する必要がある場合にのみ `trigger_live_flow` を
使用してください。修正の検証には、失敗を引き起こした正確なデータを使用するため
`resubmit_live_flow_run` の方が適しています。

```python
defn = mcp("get_live_flow", environmentName=ENV, flowName=FLOW_ID)
triggers = defn["properties"]["definition"]["triggers"]
manual = next(iter(triggers.values()))
print("Expected body:", manual.get("inputs", {}).get("schema"))

result = mcp("trigger_live_flow",
    environmentName=ENV, flowName=FLOW_ID,
    body={"name": "Test", "value": 1})
print(f"Status: {result['responseStatus']}, via: {result['invocation']}")
print(result.get("warning"))   # set when a required input was missing: the run still ran, with null
```

### 新規の非 HTTP フロー

新規の **Recurrence** フローに回避策は不要です。デプロイ後、ポータルの
「Run flow」ボタンと同様に、`trigger_live_flow` を使用し `body` なしで
すぐに実行します。本文は拒否されます。スケジュール トリガーは入力を受け取りません。

新規の **コネクタ トリガー型** フロー (SharePoint、Webhook) には過去の実行がなく、
実際のソース イベントなしには起動できません。一時的な HTTP トリガーでデプロイして
アクションをテストし、その後で運用トリガーに切り替えます。

```python
production_trigger = definition["triggers"]
definition["triggers"] = {
    "manual": {"type": "Request", "kind": "Http", "inputs": {"schema": {}}}
}
result = mcp("update_live_flow", environmentName=ENV,
    flowName=FLOW_ID,       # omit if creating new
    definition=definition, connectionReferences=connection_references,
    displayName="Overdue Invoice Notifications")
FLOW_ID = FLOW_ID or result["flowName"]

mcp("trigger_live_flow", environmentName=ENV, flowName=FLOW_ID,
    body={"sample": "payload"})
runs = mcp("get_live_flow_runs", environmentName=ENV, flowName=FLOW_ID, top=1)
if runs[0]["status"] == "Failed":
    err = mcp("get_live_flow_run_error",
        environmentName=ENV, flowName=FLOW_ID, runName=runs[0]["name"])
    raise Exception(err["failedActions"][-1])

definition["triggers"] = production_trigger
mcp("update_live_flow", environmentName=ENV, flowName=FLOW_ID,
    definition=definition, connectionReferences=connection_references)
```

トリガーは入口にすぎません。HTTP 経由のテストでも同じアクションが実行されます。
アクションが `triggerBody()` または `triggerOutputs()` を使用する場合は、運用トリガーの
ペイロードと同じ形状の代表的な `body` を渡してください。

---

## 注意点

| 誤り | 結果 | 防止策 |
|---|---|---|
| デプロイ時に `connectionReferences` がない | 400 "Supply connectionReferences" | 必ず最初に `list_live_connections` を呼び出す |
| Foreach に `"operationOptions"` がない | 並列実行となり、書き込み時に競合状態が発生する | 常に `"Sequential"` を追加する |
| `union(old_data, new_data)` | 古い値が新しい値を上書きする (先勝ち) | `union(new_data, old_data)` を使用する |
| null の可能性がある文字列に `split()` | `InvalidTemplate` のクラッシュ | `coalesce(field, '')` でラップする |
| `result["error"]` の存在を確認する | 常に存在する。真のエラーは `!= null` | `result.get("error") is not None` を使用する |
| フローはデプロイされたが状態が "Stopped" | フローはスケジュールどおりに実行されない | `state: "Started"` を指定して `set_live_flow_state` を呼び出す。状態変更に `update_live_flow` を使用**しない** |
| Teams の "Chat with Flow bot" 受信者をオブジェクトにする | 400 `GraphUserDetailNotFound` | 末尾にセミコロンを付けたプレーン文字列を使用する (以下を参照) |
| Copilot/Skills フローがソリューション内にない | Copilot Studio がエージェント ツールとして検出できない場合がある | デプロイ後、対象の `solutionId` で `add_live_flow_to_solution` を呼び出す |
| MCP テストに Button/Skills トリガーを使用する | 必須入力が欠けていても (null で) 実行される | 入力を `trigger_live_flow` `body` で渡す。`warning` の場合はキャンセルし、完全な本文で再試行する |
| コネクタ アクションに `metadata.operationMetadataId` がない | Designer/run-only UI の動作が一貫しない場合がある | 既存の ID を保持し、新しいコネクタ アクションには安定した GUID を追加する |
| プレースホルダーの Excel `scriptId` | 動的検証が保存時に失敗する | デプロイ前に実際の Office Script ID を解決する |
| SharePoint `PatchItem` で必須フィールドを省略する | フィールドを変更していなくても保存に失敗する場合がある | `item/Title` など、変更しない必須フィールドをそのまま含める |
| Copilot Studio コネクタ呼び出しが下書きエージェントを使用する | コネクタ呼び出しが失敗するか、古い動作に到達する場合がある | フローをテスト/再送信する前にエージェントを公開する |

### Teams `PostMessageToConversation` — 受信者形式

`body/recipient` パラメーターの形式は `location` の値によって異なります。

| 場所 | `body/recipient` の形式 | 例 |
|---|---|---|
| **Chat with Flow bot** | **末尾にセミコロン**を付けたプレーンなメール文字列 | `"user@contoso.com;"` |
| **Channel** | `groupId` と `channelId` を持つオブジェクト | `{"groupId": "...", "channelId": "..."}` |

> **よくある誤り**: "Chat with Flow bot" に `{"to": "user@contoso.com"}` を渡すと、
> 400 `GraphUserDetailNotFound` エラーが返されます。API はプレーン文字列を想定しています。

---

## 参照ファイル

- [flow-schema.md](references/flow-schema.md) — 完全なフロー定義 JSON スキーマ
- [trigger-types.md](references/trigger-types.md) — トリガー型テンプレート
- [action-patterns-core.md](references/action-patterns-core.md) — 変数、制御フロー、式
- [action-patterns-data.md](references/action-patterns-data.md) — 配列変換、HTTP、解析
- [action-patterns-connectors.md](references/action-patterns-connectors.md) — SharePoint、Outlook、Teams、Approvals
- [build-patterns.md](references/build-patterns.md) — 完全なフロー定義テンプレート (Recurrence+SP+Teams、HTTP トリガー)

## 関連スキル

- `flowstudio-power-automate-mcp` — コア接続セットアップとツール リファレンス
- `flowstudio-power-automate-debug` — デプロイ後に失敗したフローをデバッグする

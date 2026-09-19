---
name: flowstudio-power-automate-governance
description: 'FlowStudio MCP のキャッシュ済みストアを使用して Power Automate フローと Power Apps を大規模にガバナンスします。Dataverse や CoE Starter Kit を使わず、フローをビジネス影響で分類し、孤立リソースを検出し、コネクタ使用状況を監査し、コンプライアンス標準を適用し、通知ルールを管理し、ガバナンススコアを計算します。フローのタグ付けや分類、ビジネス影響の設定、所有権の割り当て、孤立リソースの検出、コネクタ監査、コンプライアンス確認、アーカイブスコアの計算、通知ルール管理、ガバナンスレビュー、コンプライアンスレポート生成、メーカーのオフボード、またはフローへのガバナンスメタデータ書き込みを求められた場合に読み込みます。FlowStudio for Teams または MCP Pro+ サブスクリプションが必要です（https://mcp.flowstudio.app を参照）。'
---

# FlowStudio MCP による Power Automate ガバナンス

FlowStudio MCP の **キャッシュ済みストア** を通じて、Power Automate フローを大規模に分類、タグ付け、ガバナンスします — Dataverse も、CoE Starter Kit も、Power Automate portal も使いません。

この skill は `flowstudio-power-automate-monitoring` と同じ `store_*` tool ファミリーを使用しますが、*目的* が異なります。ガバナンスではメタデータ（`update_store_flow`）を書き込み、*監査と分類* の成果のために読み取ります。監視では、同じ tools を *運用の健全性* の成果のために読み取ります。どの skill がどの tool を「所有」しているかを覚えようとしないでください — ユーザーが行っていることに基づいて選んでください。ヘルスチェックと失敗率ダッシュボードの場合は、代わりに `flowstudio-power-automate-monitoring` を読み込んでください。

> **⚠️ Pro+ サブスクリプションが必要です。** この skill は、FlowStudio for Teams または MCP Pro+ サブスクライバーでのみ動作する `store_*` tools を呼び出します。
>
> **ユーザーに Pro+ アクセスがない場合:** 最初の `store_*` tool 呼び出しは 403/404 エラーを返します。その場合:
> 1. store tools の呼び出しを停止する
> 2. ガバナンス機能には Pro+ サブスクリプションが必要であることをユーザーに伝える
> 3. https://mcp.flowstudio.app/pricing へリンクする
>
> **検出:** `tools/list` ではなく meta-tools 経由で tool スキーマを読み込んでください —
> 正規バンドルには `query: "skill:governance"` を指定して `tool_search` を呼び出すか、
> 単一 tool には `query: "select:update_store_flow"` を呼び出します。この skill は、
> workflow パターンとフィールドの意味論 — `tool_search` では分からないこと — を扱います。
> この文書が実際の API レスポンスと食い違う場合は、API が優先されます。

---

## 重要: Flow ID の抽出方法

`list_store_flows` は `<environmentId>.<flowId>` 形式で `id` を返します。その他すべての tools で使用する `environmentName` と `flowName` を取得するには、**最初の `.` で分割する必要があります**:

```
id = "Default-<envGuid>.<flowGuid>"
environmentName = "Default-<envGuid>"    (everything before first ".")
flowName = "<flowGuid>"                  (everything after first ".")
```

また、`displayName` がない、または `state=Deleted` の entries はスキップしてください —
これらはスパースな records、または Power Automate に存在しなくなった flows です。
削除された flow に `monitor=true` がある場合は、monitoring slot（standard plan には 20 個含まれます）を空けるために、monitoring の無効化（`update_store_flow` に `monitor=false` を指定）を提案してください。

---

## 書き込み Tool: `update_store_flow`

`update_store_flow` は、ガバナンスメタデータを **FlowStudio cache のみに** 書き込みます — Power Automate 内の flow は変更しません。これらのフィールドは `get_live_flow` や PA portal からは見えません。FlowStudio store 内にのみ存在し、FlowStudio のスキャンパイプラインと通知ルールで使用されます。

つまり:
- `ownerTeam` / `supportEmail` — FlowStudio がガバナンス連絡先とみなす人物を設定します。実際の PA flow owner は変更しません。
- `rule_notify_email` — FlowStudio の失敗/実行欠落通知を受け取る人物を設定します。Microsoft の組み込み flow failure alerts は変更しません。
- `monitor` / `critical` / `businessImpact` — FlowStudio の分類のみです。Power Automate には同等のフィールドはありません。

マージの意味論 — 提供したフィールドのみが更新されます。完全な更新済み record（`get_store_flow` と同じ形状）を返します。

必須パラメーター: `environmentName`、`flowName`。その他すべてのフィールドは任意です。

### 設定可能なフィールド

| Field | Type | Purpose |
|---|---|---|
| `monitor` | bool | run-level scanning を有効にする（standard plan: 20 flows が含まれる） |
| `rule_notify_onfail` | bool | failed run が発生した場合に email notification を送信する |
| `rule_notify_onmissingdays` | number | flow が N 日間実行されていない場合に notification を送信する（0 = 無効） |
| `rule_notify_email` | string | カンマ区切りの notification recipients |
| `description` | string | flow が行うこと |
| `tags` | string | 分類タグ（description `#hashtags` からも自動抽出される） |
| `businessImpact` | string | Low / Medium / High / Critical |
| `businessJustification` | string | flow が存在する理由、自動化するプロセス |
| `businessValue` | string | ビジネス価値の記述 |
| `ownerTeam` | string | 説明責任を持つ team |
| `ownerBusinessUnit` | string | business unit |
| `supportGroup` | string | support escalation group |
| `supportEmail` | string | support contact email |
| `critical` | bool | business-critical として指定する |
| `tier` | string | Standard または Premium |
| `security` | string | セキュリティ分類または notes |

> **`security` には注意:** `get_store_flow` 上の `security` フィールドには、
> 構造化 JSON（例: `{"triggerRequestAuthenticationType":"All"}`）が含まれます。
> `"reviewed"` のようなプレーン文字列を書き込むと、これが上書きされます。flow を security-reviewed としてマークするには、代わりに `tags` を使用してください。

---

## ガバナンス Workflows

### 1. コンプライアンス詳細レビュー

必要なガバナンスメタデータが欠落している flows を特定します。

```
1. Ask the user which compliance fields they require
2. list_store_flows
3. For each active flow: split id, call get_store_flow, check required fields
4. Report non-compliant flows with missing fields listed
5. For updates: ask for values, then update_store_flow(...provided fields)
```

一般的な compliance フィールド: `description`、`businessImpact`、
`businessJustification`、`ownerTeam`、`supportEmail`、`monitor`、
`rule_notify_onfail`、`critical`。フラグを立てる前に、ユーザーのポリシーを確認してください。

### 2. 孤立リソースの検出

削除済みまたは無効化された Azure AD アカウントが所有する flows を見つけます。

```
1. list_store_makers
2. Filter where deleted=true AND ownerFlowCount > 0
3. list_store_flows → collect all flows
4. For each active flow: split id, get_store_flow, parse owners JSON
5. Match owner principalId against orphaned maker id
6. Reassign governance contact or stop/tag for decommission
```

`update_store_flow` は実際の PA ownership を移管しません。その場合は admin center または PowerShell を使用してください。孤立しているように見える flows の一部はシステム生成です。適切な場合は再割り当てではなくタグ付けしてください。Store coverage の鮮度は最新の scan 次第です。

### 3. Archive Score の計算

cleanup candidates を特定するために、flow ごとに inactivity score（0-7）を計算します。

```
1. list_store_flows
2. For each active flow: split id, get_store_flow
3. Add 1 point each: created≈modified, test/demo/temp/copy name, age >12mo,
   stopped/suspended, no owners, no recent runs, complexity.actions < 5
4. Score 5-7: recommend archive; 3-4: tag #archive-review; 0-2: active
5. For confirmed archive: set_live_flow_state(..., "Stopped") and append #archived
```

MCP 経由の archive は、flow を停止してタグ付けすることを意味します。削除には portal または admin PowerShell が必要です。

### 4. Connector 監査

monitored flows 全体で使用されている connectors を監査します。DLP の影響分析と premium license 計画に役立ちます。

```
1. list_store_flows(monitor=true)
2. For each active flow: split id, get_store_flow, parse connections JSON
3. Group by apiName; flag Premium tier, HTTP connectors, custom connectors
4. Report inventory to user
```

可能な場合は monitored flows に範囲を限定してください。各 `get_store_flow` 呼び出しには時間がかかります。
`list_store_connections` は connection instances を一覧表示するもので、flow ごとの connector usage ではありません。DLP policies は公開されていません。connector classifications についてはユーザーに確認してください。

### 5. Notification Rule 管理

flows の monitoring と alerting を大規模に構成します。

```
Enable failure alerts on all critical flows:
1. list_store_flows(monitor=true)
2. For each active flow: split id, get_store_flow
3. If critical=true and rule_notify_onfail is false, update_store_flow(...,
   rule_notify_onfail=true, rule_notify_email="oncall@contoso.com")

Enable missing-run detection for scheduled flows:
1. list_store_flows(monitor=true)
2. For active Recurrence flows: get_store_flow
3. If rule_notify_onmissingdays is 0/missing, update_store_flow(...,
   rule_notify_onmissingdays=2)
```

`monitor=true` を一括有効化する前に monitoring limits を確認してください。`critical=true` を持つ flows がない場合は、alerts を構成する前に、それを governance gap として報告してください。

### 6. 分類とタグ付け

connector type、business function、risk level によって flows を一括分類します。

```
Auto-tag by connector:
1. list_store_flows
2. For each active flow: split id, get_store_flow, parse connections JSON
3. Map apiName values to tags (#sharepoint, #teams, #email, #custom-connector)
4. Read existing store tags, append new tags, update_store_flow(tags=...)
```

Store tags と description hashtags は別々のシステムです。`tags=` は store tags を上書きするため、read/append/write してください。要求されない限り、算出済みの `tier` を上書きしないでください。

### 7. Maker オフボーディング

従業員が退職した際に、その人の flows と apps を特定し、FlowStudio のガバナンス連絡先と notification recipients を再割り当てします。

```
1. get_store_maker(makerKey="<departing-user-aad-oid>")
   → check ownerFlowCount, ownerAppCount, deleted status
2. list_store_flows → collect all flows
3. For each active flow: split id, get_store_flow, parse owners JSON
4. Flag flows whose owner principalId matches the departing user's OID
5. list_store_power_apps → filter ownerId
6. For kept flows: update ownerTeam/supportEmail/rule_notify_email; consider
   add_live_flow_to_solution before account deletion
7. For retired flows: set_live_flow_state(..., "Stopped") and tag #decommissioned
8. Report: flows reassigned, flows migrated to solutions, flows stopped,
   apps needing manual reassignment
```

これは FlowStudio のガバナンス連絡先を変更するもので、実際の PA ownership は変更しません。Power Apps ownership の変更は手動/admin-center 作業です。

### 8. セキュリティレビュー

cached store data を使用して、潜在的なセキュリティ上の懸念について flows をレビューします。

```
1. list_store_flows(monitor=true)
2. For each active flow: split id, get_store_flow
3. Parse security/connections/referencedResources JSON; read sharingType top-level
4. Report findings; for reviewed flows append #security-reviewed tag
```

Security signals: `security.triggerRequestAuthenticationType`、`sharingType`、
`connections`、`referencedResources`、`tier`。構造化された
`security` フィールドは決して上書きせず、代わりにレビュー済み flows をタグ付けしてください。

### 9. Environment ガバナンス

compliance と sprawl について environments を監査します。

```
1. list_store_environments
   Skip entries without displayName (tenant-level metadata rows)
2. Flag:
   - Developer environments
   - Non-managed environments
   - Environments where service account lacks admin access (isAdmin=false)
3. list_store_flows → group by environmentName
4. list_store_connections → group by environmentName
```

### 10. ガバナンスダッシュボード

tenant-wide のガバナンス概要を生成します。

```
Efficient metrics (list calls only):
1. total_flows = len(list_store_flows())
2. monitored = len(list_store_flows(monitor=true))
3. with_onfail = len(list_store_flows(rule_notify_onfail=true))
4. makers/apps/envs/conns = list_store_makers/list_store_power_apps/list_store_environments/list_store_connections
5. Compute monitoring %, notification %, orphan count, high-failure count

Detailed metrics (require get_store_flow per flow — expensive for large tenants):
- Compliance %: flows with businessImpact set / total active flows
- Undocumented count: flows without description
- Tier breakdown: group by tier field
```

---

## フィールドリファレンス: ガバナンスで使用される `get_store_flow` Fields

以下のすべてのフィールドは、`get_store_flow` response 上に存在することが確認されています。
`*` でマークされたフィールドは、`list_store_flows`（より低コスト）でも利用できます。

| Field | Type | Governance use |
|---|---|---|
| `displayName` * | string | アーカイブ スコア（test/demo 名の検出） |
| `state` * | string | アーカイブ スコア、ライフサイクル管理 |
| `tier` | string | License audit（Standard vs Premium） |
| `monitor` * | bool | この flow は actively monitored されているか? |
| `critical` | bool | Business-critical designation（update_store_flow 経由で設定可能） |
| `businessImpact` | string | Compliance classification |
| `businessJustification` | string | Compliance attestation |
| `ownerTeam` | string | Ownership accountability |
| `supportEmail` | string | Escalation contact |
| `rule_notify_onfail` | bool | Failure alerting が構成されているか? |
| `rule_notify_onmissingdays` | number | SLA monitoring が構成されているか? |
| `rule_notify_email` | string | Alert recipients |
| `description` | string | Documentation completeness |
| `tags` | string | Classification — `list_store_flows` は description-extracted hashtags のみを表示します。`update_store_flow` によって書き込まれた store tags を読み戻すには `get_store_flow` が必要です |
| `runPeriodTotal` * | number | Activity level |
| `runPeriodFailRate` * | number | Health status |
| `runLast` | ISO string | Last run timestamp |
| `scanned` | ISO string | Data freshness |
| `deleted` | bool | Lifecycle tracking |
| `createdTime` * | ISO string | アーカイブ スコア（経過時間） |
| `lastModifiedTime` * | ISO string | アーカイブ スコア（停滞期間） |
| `owners` | JSON string | Orphan detection、ownership audit — json.loads() で parse |
| `connections` | JSON string | Connector audit、tier — json.loads() で parse |
| `complexity` | JSON string | アーカイブ スコア（単純さ）— json.loads() で解析 |
| `security` | JSON string | Auth type audit — json.loads() で parse、`triggerRequestAuthenticationType` を含む |
| `sharingType` | string | Oversharing detection（top-level、security 内ではない） |
| `referencedResources` | JSON string | URL audit — json.loads() で parse |

---

## 関連 Skills

- `flowstudio-power-automate-monitoring` — ヘルスチェック、失敗率、inventory（read-only）
- `flowstudio-power-automate-mcp` — 基盤 Skill: 接続設定、MCP ヘルパー、Tool 検出
- `flowstudio-power-automate-debug` — action-level inputs/outputs による詳細診断
- `flowstudio-power-automate-build` — flow definitions の build と deploy

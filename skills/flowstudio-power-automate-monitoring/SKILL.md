---
name: flowstudio-power-automate-monitoring
description: 'Pro+ サブスクリプションが必要です。FlowStudio MCP のキャッシュ済みストアを使用して、テナント全体の Power Automate を監視します。失敗率、実行健全性の傾向、メーカーやアプリのインベントリ、非アクティブな所有者、コンプライアンスおよび健全性レポートを扱います。集約されたテナントビューにのみ使用してください。1 つの環境、1 つのフロー、実行制御、または根本原因のデバッグには、flowstudio-power-automate-mcp、flowstudio-power-automate-debug、またはサーバーの monitor-flow バンドルを使用します。FlowStudio for Teams または MCP Pro+ が必要です。'
---

# FlowStudio MCP による Power Automate 監視

FlowStudio MCP の **cached store** を通じて、フローの健全性を監視し、失敗率を追跡し、テナント資産を棚卸しします — 高速な読み取り、PA API のレート制限なし、さらにガバナンス メタデータと修復ヒントで強化されています。

> **⚠️ Pro+ サブスクリプションが必要です。** このスキルは `store_*` ツールを呼び出しますが、
> これらは FlowStudio for Teams または MCP Pro+ サブスクライバーでのみ動作します。
>
> **ユーザーが Pro+ アクセスを持っていない場合:** 最初の `store_*` ツール呼び出しは
> 403/404 エラーを返します。その場合は:
> 1. store ツールの呼び出しを停止する
> 2. この機能には Pro+ サブスクリプションが必要であることをユーザーに伝える
> 3. https://mcp.flowstudio.app/pricing へのリンクを提示する
> 4. 質問が live ツールで回答できる場合（例: 「1 つの環境内のフローを一覧表示する」）は、
>    代わりに `flowstudio-power-automate-mcp` スキルを使うことを提案する
>
> **Discovery:** ツール スキーマは `tools/list` ではなく `tool_search` で読み込みます —
> 一般的な監視ツールには `query: "select:list_store_flows,get_store_flow_summary"` を指定して呼び出すか、
> `query: "skill:governance"` で全セットを読み込みます
> （サーバーの governance バンドルもほとんどの監視読み取りをカバーします — このスキルと
> `flowstudio-power-automate-governance` は基盤となる同じツール ファミリを共有しています）。このスキルは、
> 応答形状、動作上の注意、ワークフロー パターンを扱います — これらは
> `tool_search` では分からない内容です。このドキュメントが実際の API
> 応答と食い違う場合は、API が正です。

---

## 監視の仕組み

FlowStudio は各サブスクライバーについて Power Automate API を毎日スキャンし、
結果をキャッシュします。レベルは 2 つあります:

- **すべてのフロー** ではメタデータがスキャンされます: 定義、接続、所有者、トリガー
  種類、集計された実行統計（`runPeriodTotal`、`runPeriodFailRate`
  など）。環境、アプリ、接続、作成者もスキャンされます。
- **監視対象フロー**（`monitor: true`）では、さらに実行ごとの詳細も取得されます:
  ステータス、期間、失敗したアクション名、修復ヒントを含む個別の実行レコードです。
  これが `get_store_flow_runs` と
  `get_store_flow_summary` に入力される内容です。

**データの鮮度:** フローが最後にスキャンされた日時を確認するには、`get_store_flow` の
`scanned` フィールドを確認します。古い場合、スキャン パイプラインが実行されていない可能性があります。

**監視の有効化:** `update_store_flow` または
FlowStudio for Teams アプリ
（[フローの選択方法](https://learn.flowstudio.app/teams-monitoring)）を使用して `monitor: true` を設定します。

**重要フローの指定:** ビジネス上重要なフローでは、`critical=true`
付きで `update_store_flow` を使用します。これにより、governance スキルの通知
ルール管理で、重要フローの失敗アラートを自動構成できるようになります。

---

## ツール

| ツール | 目的 |
|---|---|
| `list_store_flows` | 失敗率と監視フィルター付きでフローを一覧表示 |
| `get_store_flow` | 完全なキャッシュ レコード: 実行統計、所有者、階層、接続、定義（`triggerUrl` フィールドを含む） |
| `get_store_flow_summary` | 集計された実行統計: 成功/失敗率、平均/最大期間 |
| `get_store_flow_runs` | 期間、ステータス、失敗したアクション、修復を含む実行ごとの履歴（エラーのみのビューには `status="Failed"` をフィルター） |
| `update_store_flow` | 監視フラグ、通知ルール、タグ、ガバナンス メタデータを設定 |
| `list_store_environments` | すべての Power Platform 環境 |
| `list_store_connections` | すべての接続 |
| `list_store_makers` | すべての作成者（市民開発者） |
| `get_store_maker` | 作成者の詳細: フロー/アプリ数、ライセンス、アカウント状態 |
| `list_store_power_apps` | すべての Power Apps キャンバス アプリ |

> 開始/停止には、`monitor-flow` バンドルの `set_live_flow_state`
> （`tool_search query: "select:set_live_flow_state"`）を使用します — キャッシュは
> 次回のスキャンで再同期されます。以前の `set_store_flow_state` 便利ラッパーは
> 非推奨です。

---

## Store と Live

| 質問 | Store を使用 | Live を使用 |
|---|---|---|
| 失敗しているフローはいくつあるか？ | `list_store_flows` | — |
| 30 日間の失敗率は？ | `get_store_flow_summary` | — |
| フローのエラー履歴を表示する | `get_store_flow_runs`（`status="Failed"` をフィルター） | — |
| このフローを作成したのは誰か？ | `get_store_flow` → `owners` を解析 | — |
| フロー定義全体を読む | `get_store_flow` に含まれる（JSON 文字列） | `get_live_flow`（構造化） |
| 実行からアクションの入力/出力を調べる | — | `get_live_flow_run_action_outputs` |
| 失敗した実行を再送信する | — | `resubmit_live_flow_run` |

> Store ツールは「何が起きたか？」と「どの程度健全か？」に答えます。
> Live ツールは「具体的に何が間違っていたか？」と「今すぐ修正する」に答えます。

> `get_store_flow_runs` または `get_store_flow_summary` が空の結果を返す場合は、
> 次を確認してください: (1) フローで `monitor: true` が有効か？ (2) `scanned` フィールドは
> 最近のものか？ 両方を確認するには `get_store_flow` を使用します。

---

## 応答形状

### `list_store_flows`

直接配列。フィルター: `monitor`（bool）、`rule_notify_onfail`（bool）、
`rule_notify_onmissingdays`（bool）。

```json
[
  {
    "id": "Default-<envGuid>.<flowGuid>",
    "displayName": "Stripe subscription updated",
    "state": "Started",
    "triggerType": "Request",
    "triggerUrl": "https://...",
    "tags": ["#operations", "#sensitive"],
    "environmentName": "Default-aaaaaaaa-...",
    "monitor": true,
    "runPeriodFailRate": 0.012,
    "runPeriodTotal": 82,
    "createdTime": "2025-06-24T01:20:53Z",
    "lastModifiedTime": "2025-06-24T03:51:03Z"
  }
]
```

> `id` の形式: `Default-<envGuid>.<flowGuid>`。最初の `.` で分割して
> `environmentName` と `flowName` を取得します。
>
> `triggerUrl` と `tags` は任意です。一部のエントリは疎です（`id` +
> `monitor` のみ）— `displayName` がないエントリはスキップします。
>
> `list_store_flows` 上のタグは、フローの `description`
> フィールド（`#operations` のような作成者ハッシュタグ）から自動抽出されます。
> `update_store_flow(tags=...)` で書き込まれたタグは別に保存され、
> `get_store_flow` でのみ表示されます — 一覧応答には表示されません。

### `get_store_flow`

完全なキャッシュ レコード。主なフィールド:

| カテゴリ | フィールド |
|---|---|
| ID | `name`, `displayName`, `environmentName`, `state`, `triggerType`, `triggerKind`, `tier`, `sharingType` |
| 実行統計 | `runPeriodTotal`, `runPeriodFails`, `runPeriodSuccess`, `runPeriodFailRate`, `runPeriodSuccessRate`, `runPeriodDurationAverage`/`Max`/`Min`（ミリ秒）, `runTotal`, `runFails`, `runFirst`, `runLast`, `runToday` |
| ガバナンス | `monitor`（bool）, `rule_notify_onfail`（bool）, `rule_notify_onmissingdays`（number）, `rule_notify_email`（string）, `log_notify_onfail`（ISO）, `description`, `tags` |
| 鮮度 | `scanned`（ISO）, `nextScan`（ISO） |
| ライフサイクル | `deleted`（bool）, `deletedTime`（ISO） |
| JSON 文字列 | `actions`, `connections`, `owners`, `complexity`, `definition`, `createdBy`, `security`, `triggers`, `referencedResources`, `runError` — すべて解析には `json.loads()` が必要 |

> 期間フィールド（`runPeriodDurationAverage`、`Max`、`Min`）は
> **ミリ秒** 単位です。秒にするには 1000 で割ります。
>
> `runError` には最後の実行エラーが JSON 文字列として含まれます。解析してください:
> `json.loads(record["runError"])` — エラーがない場合は `{}` を返します。

### `get_store_flow_summary`

時間枠内の集計統計（既定: 過去 7 日間）。

```json
{
  "flowKey": "Default-<envGuid>.<flowGuid>",
  "windowStart": null,
  "windowEnd": null,
  "totalRuns": 82,
  "successRuns": 81,
  "failRuns": 1,
  "successRate": 0.988,
  "failRate": 0.012,
  "averageDurationSeconds": 2.877,
  "maxDurationSeconds": 9.433,
  "firstFailRunRemediation": null,
  "firstFailRunUrl": null
}
```

> このフローについて、その時間枠内に実行データが存在しない場合は、すべてゼロを返します。
> 時間枠を変更するには `startTime` と `endTime`（ISO 8601）パラメーターを使用します。

### `get_store_flow_runs`

キャッシュされた実行レコードの直接配列。パラメーター: `startTime`、`endTime`、
`status`（配列 — エラーのみのビューには `["Failed"]`、`["Succeeded"]` を渡すか、
すべての場合は省略します）。

> 時間枠内に実行データが存在しない場合は `[]` を返します。

### トリガー URL

`get_store_flow`（キャッシュ済み）または
`get_live_flow`（live）から `triggerUrl` フィールドを直接読み取ります。非 HTTP トリガーの場合は
`null` です。

### フローの開始 / 停止

`monitor-flow` サーバー バンドルの `set_live_flow_state` を使用します。キャッシュは
次回の日次スキャンで追いつきます。キャッシュの鮮度をより早く確認する必要がある場合は、
状態変更後に `get_live_flow` を呼び出して確認し、次回スキャンで同期させます。

### `update_store_flow`

ガバナンス メタデータを更新します。指定されたフィールドのみが更新（マージ）されます。
完全な更新後レコード（`get_store_flow` と同じ形状）を返します。

設定可能なフィールド: `monitor`（bool）、`rule_notify_onfail`（bool）、
`rule_notify_onmissingdays`（number、0=disabled）、
`rule_notify_email`（カンマ区切り）、`description`、`tags`、
`businessImpact`、`businessJustification`、`businessValue`、
`ownerTeam`、`ownerBusinessUnit`、`supportGroup`、`supportEmail`、
`critical`（bool）、`tier`、`security`。

### `list_store_environments`

直接配列。

```json
[
  {
    "id": "Default-aaaaaaaa-...",
    "displayName": "Flow Studio (default)",
    "sku": "Default",
    "type": "NotSpecified",
    "location": "australia",
    "isDefault": true,
    "isAdmin": true,
    "isManagedEnvironment": false,
    "createdTime": "2017-01-18T01:06:46Z"
  }
]
```

> `sku` の値: `Default`、`Production`、`Developer`、`Sandbox`、`Teams`。

### `list_store_connections`

直接配列。非常に大きくなる場合があります（1500+ 項目）。

```json
[
  {
    "id": "<environmentId>.<connectionId>",
    "displayName": "user@contoso.com",
    "createdBy": "{\"id\":\"...\",\"displayName\":\"...\",\"email\":\"...\"}",
    "environmentName": "...",
    "statuses": "[{\"status\":\"Connected\"}]"
  }
]
```

> `createdBy` と `statuses` は **JSON 文字列** です — `json.loads()` で解析します。

### `list_store_makers`

直接配列。

```json
[
  {
    "id": "09dbe02f-...",
    "displayName": "Sample Maker",
    "mail": "maker@contoso.com",
    "deleted": false,
    "ownerFlowCount": 199,
    "ownerAppCount": 209,
    "userIsServicePrinciple": false
  }
]
```

> 削除された作成者には `deleted: true` があり、`displayName`/`mail` フィールドはありません。

### `get_store_maker`

完全な作成者レコード。主なフィールド: `displayName`、`mail`、`userPrincipalName`、
`ownerFlowCount`、`ownerAppCount`、`accountEnabled`、`deleted`、`country`、
`firstFlow`、`firstFlowCreatedTime`、`lastFlowCreatedTime`、
`firstPowerApp`、`lastPowerAppCreatedTime`、
`licenses`（M365 SKU の JSON 文字列）。

### `list_store_power_apps`

直接配列。

```json
[
  {
    "id": "<environmentId>.<appId>",
    "displayName": "My App",
    "environmentName": "...",
    "ownerId": "09dbe02f-...",
    "ownerName": "Catherine Han",
    "appType": "Canvas",
    "sharedUsersCount": 0,
    "createdTime": "2023-08-18T01:06:22Z",
    "lastModifiedTime": "2023-08-18T01:06:22Z",
    "lastPublishTime": "2023-08-18T01:06:22Z"
  }
]
```

---

## 一般的なワークフロー

### 不健全なフローを見つける

```
1. list_store_flows
2. Filter where runPeriodFailRate > 0.1 and runPeriodTotal >= 5
3. Sort by runPeriodFailRate descending
4. For each: get_store_flow for full detail
```

### 特定のフローの健全性を確認する

```
1. get_store_flow → check scanned (freshness), runPeriodFailRate, runPeriodTotal
2. get_store_flow_summary → aggregated stats with optional time window
3. get_store_flow_runs(status=["Failed"]) → per-run failure detail with remediation hints
4. If deeper diagnosis needed → switch to live tools:
   get_live_flow_runs → get_live_flow_run_action_outputs
```

### フローの監視を有効にする

```
1. update_store_flow with monitor=true
2. Optionally set rule_notify_onfail=true, rule_notify_email="user@domain.com"
3. Run data will appear after the next daily scan
```

### 日次健全性チェック

```
1. list_store_flows
2. Flag flows with runPeriodFailRate > 0.2 and runPeriodTotal >= 3
3. Flag monitored flows with state="Stopped" (may indicate auto-suspension)
4. For critical failures → get_store_flow_runs(status=["Failed"]) for remediation hints
```

### 作成者監査

```
1. list_store_makers
2. Identify deleted accounts still owning flows (deleted=true, ownerFlowCount > 0)
3. get_store_maker for full detail on specific users
```

### 棚卸し

```
1. list_store_environments → environment count, SKUs, locations
2. list_store_flows → flow count by state, trigger type, fail rate
3. list_store_power_apps → app count, owners, sharing
4. list_store_connections → connection count per environment
```

---

## 関連スキル

- `flowstudio-power-automate-mcp` — 基盤スキル: 接続設定、MCP ヘルパー、ツール discovery
- `flowstudio-power-automate-debug` — アクション レベルの入力/出力を使った詳細診断（live API）
- `flowstudio-power-automate-build` — フロー定義のビルドとデプロイ
- `flowstudio-power-automate-governance` — ガバナンス メタデータ、タグ付け、通知ルール、CoE パターン

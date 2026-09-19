---
name: salesforce-flow-design
description: 'Salesforce Flowのarchitecture判断、flow type選択、bulk safety検証、fault handling標準。Record-Triggered、Screen、Autolaunched、Scheduled、Platform Event flowを設計またはレビューし、正しいtype選択、loop内のDML/Get Records禁止、すべてのdata-changing elementへの適切なfault connector、deployment前のautomation density確認を確実にする場合に使用します。'
---
# Salesforce Flow の設計と検証

設計、構築、レビューするすべてのFlowに、次のチェックを適用します。

## Step 1 — Flowが適切なToolか確認する

Flowを設計する前に、より軽量なdeclarative optionで解決できないことを確認します。

| 要件 | 最適なTool |
|---|---|
| side effectなしでfield valueを計算する | Formula field |
| user messageで不正なrecord saveを防止する | Validation rule |
| parent上のchild recordをsumまたはcountする | Roll-up Summary field |
| 複雑なmulti-object logic、callout、高volumeを扱う | Apex (Queueable / Batch) — Flowではない |
| その他すべて | Flow ✓ |

formula fieldまたはvalidation ruleで置き換えられるFlowを構築する場合、要件が本当に複雑であることをuserに確認します。

## Step 2 — 正しいFlow typeを選択する

| 用途 | Flow type | 主な制約 |
|---|---|---|
| save前に同じrecordのfieldを更新 | Before-save Record-Triggered | email送信、callout、related record変更は不可 |
| related record、email、calloutを作成・更新 | After-save Record-Triggered | commit後に実行 — recursion trapを避ける |
| multi-step UI processをuserに案内 | Screen Flow | record eventで自動trigger不可 |
| 別のFlowから呼ぶ再利用可能なbackground logic | Autolaunched (Subflow) | input/output variableがcontractを定義 |
| Apex `@InvocableMethod`から呼ぶlogic | Autolaunched (Invocable) | input/output variableの宣言が必須 |
| time-based batch processing | Scheduled Flow | batch contextで実行 — governor limitを守る |
| event（Platform Events / CDC）に応答 | Platform Event–Triggered | asynchronousに実行 — eventual consistency |

**判断ルール**: triggerされたrecord自身のfieldだけを変更するならbefore-saveを選びます。related recordに触れる、emailを送る、calloutを行う必要が生じた時点でafter-saveへ移します。

## Step 3 — Bulk Safetyのチェックリスト

これらのpatternはscale時にgovernor limit failureになります。Flowをactivateする前にすべて確認します。

### Loop内のDML — 自動的に不合格

```
Loop element
  └── Create Records / Update Records / Delete Records  ← ❌ DML inside loop
```

修正: loop内でrecordをcollection variableに集め、DML elementをloopの**外側**で実行します。

### Loop内のGet Records — 自動的に不合格

```
Loop element
  └── Get Records  ← ❌ SOQL inside loop
```

修正: Get Records queryをloopの**前**に実行し、その後collection variableをloopします。

### 正しいBulk Pattern

```
Get Records — collect all records in one query
└── Loop over the collection variable
    └── Decision / Assignment (no DML, no Get Records)
└── After the loop: Create/Update/Delete Records — one DML operation
```

### TransformとLoopを比較する
目的がcollectionの形を変えること（例: あるobjectから別のobjectへfield valueをmappingすること）なら、Loop + Assignment patternではなく**Transform** elementを使います。Transformは設計上bulk-safeで、より見やすいFlow graphを生成します。

## Step 4 — Fault Pathの要件

runtimeで失敗する可能性があるすべてのelementにfault connectorを付けます。fault pathのないFlowはraw system errorをuserに表示します。

### Fault Connectorが必要なElement
- Create Records element
- Update Records element
- Delete Records element
- Get Records（存在しない可能性があるrequired recordへアクセスする場合）
- Send Email element
- HTTP Callout / External Service action
- Apex action（invocable）
- Subflow（subflowがfaultをthrowする可能性がある場合）

### Fault Handlerのパターン
```
Fault connector → Log Error (Create Records on a logging object or fire a Platform Event)
               → Screen element with user-friendly message (Screen Flows)
               → Stop / End element (Record-Triggered Flows)
```

fault pathを、faultが発生した同じelementへ戻して接続しません — infinite loopになります。

## Step 5 — Automation Densityを確認する

deployment前に、同じobjectとtrigger eventに重複するautomationがないことを確認します。

- 同じ`Object` + `When to Run`の組み合わせにある、その他のactiveなRecord-Triggered Flow
- 同じobjectでまだactiveなLegacy Process Builder rule
- 同じfield changeで発火するWorkflow Rule
- 同じ`before insert` / `after update` contextで実行されるApex trigger

重複するautomationは予期しない順序、recursion、governor limit failureを引き起こします。activate前にobjectのautomation inventoryを文書化します。

## Step 6 — Screen FlowのUXガイドライン

- Screen Flowのすべての経路が**End** elementに到達するようにし、孤立したbranchを残さない。
- 戻る操作でdataが壊れない限り、multi-step flowには**Back** navigation optionを用意する。
- すべてのuser inputには`lightning-input`とSLDS準拠のcomponentを使い、HTML form elementは使わない。
- userが先へ進む前にscreen上でrequired inputを検証し、screenのFlow validation ruleを使う。
- sessionをまたいでuser actionを待つ可能性がある場合は**Pause** elementを処理する。

## Step 7 — Deploymentの安全性

```
Deploy as Draft    →   Test with 1 record   →   Test with 200+ records   →   Activate
```

- 常に最初は**Draft**としてdeploymentし、activation前に十分テストします。
- Record-Triggered Flowでは、正確なentry conditionでテストします（例: `ISCHANGED(Status)` — test dataが実際にconditionをtriggerすることを確認）。
- Scheduled Flowでは、productionでenableする前にsandboxで小さなbatchをテストします。
- objectのAutomation Density scoreを確認します — 1つのobjectにactive automationが3つを超えるとorder-of-execution riskが高まります。

## クイックリファレンス — Flowアンチパターンの概要

| Anti-pattern | リスク | 修正 |
|---|---|---|
| Loop内のDML element | Governor limit exception | DMLをloopの外へ移動 |
| Loop内のGet Records | SOQL governor limit exception | loop前にquery |
| DML/email/callout elementにfault connectorがない | 未処理exceptionがuserに表示される | すべての該当elementにfault pathを追加 |
| recursion guardなしでafter-save flowのtriggering recordを更新 | 無限trigger loop | entry conditionまたはrecursion guard variableを追加 |
| `$Record` collectionを直接loop | scale時の誤動作 | 先にcollection variableへ割り当ててからloop |
| 新しいFlowとProcess Builderが併存 | 二重実行、予期しない順序 | Flowをactivateする前にProcess Builderをdeactivate |
| すべてのbranchにEnd elementがないScreen Flow | runtime errorまたはuserが停止 | すべてのbranchがEnd elementへ到達するようにする |

---
name: salesforce-component-standards
description: 'Salesforce Lightning Web Components（LWC）、Aura component、Visualforce pageの品質標準。SLDS 2準拠、accessibility（WCAG 2.1 AA）、data access patternの選択、component communication rule、XSS防止、CSRF適用、AuraEnabled methodでのFLS/CRUD、view state管理、Jest test要件を扱います。Salesforce UI componentを構築またはレビューし、platform固有のsecurityとquality standardを適用する場合に使用します。'
---
# Salesforce Component 品質標準

作成またはレビューするすべてのLWC、Aura component、Visualforce pageに、次のチェックを適用します。

## Section 1 — LWCの品質標準

### 1.1 Data Access Patternを選択する

JavaScript controller codeを書く前に、正しいdata access patternを選びます。

| 用途 | Pattern | 理由 |
|---|---|---|
| 単一recordをreactiveに読む（navigationに追従） | `@wire(getRecord, { recordId, fields })` | Lightning Data Service — cached、reactive |
| 単一objectの標準CRUD form | `<lightning-record-form>`または`<lightning-record-edit-form>` | FLS、CRUD、accessibilityを組み込み済み |
| 複雑なserver queryまたはfiltered list | `cacheable=true` method上の`@wire(apexMethodName, { param })` | cachingが可能。param変更時にwireが再実行 |
| user-triggered action、DML、またはnon-cacheable server call | Imperative `apexMethodName(params).then(...).catch(...)` | DMLに必須 — `cacheable=true`なしのwired methodは`@AuraEnabled`にできない |
| cross-component communication（shared parentなし） | Lightning Message Service（LMS） | 疎結合でDOM boundaryをまたいで動作 |
| multi-object graph relationship | GraphQL `@wire(gql, { query, variables })` | 複雑なrelated dataをsingle round-tripで取得 |

### 1.2 Security Rule（セキュリティルール）

| ルール | 適用方法 |
|---|---|
| `innerHTML`にraw user dataを入れない | templateで`{expression}` bindingを使う — frameworkがauto-escapeする。`this.template.querySelector('.el').innerHTML = userValue`は使わない |
| Apex `@AuraEnabled` methodでCRUD/FLSを適用 | SOQLで`WITH USER_MODE`、または明示的な`Schema.sObjectType` checkを使う |
| component JavaScriptにorg固有IDをhardcodeしない | queryするかpropとして渡す — sourceにrecord IDを埋め込まない |
| parentからの`@api` propertyは使用前に検証 | parentは何でも渡せるため、query parameterに使う前にtypeとrangeを検証 |

### 1.3 SLDS 2とスタイル標準

- **絶対に**colourをhardcodeしない: `color: #FF3366` → `color: var(--slds-c-button-brand-color-background)`またはsemantic SLDS tokenを使う。
- **絶対に**`!important`でSLDS classをoverrideしない — custom CSS propertyでcomposeする。
- 存在する場合は`<lightning-*>` base componentを使う: `lightning-button`、`lightning-input`、`lightning-datatable`、`lightning-card`など。
- Base componentにはSLDS 2、dark mode、accessibilityが組み込まれているため、挙動を再実装しない。
- custom CSSを使う場合は、完了とする前に**light mode**と**dark mode**の両方でテストする。

### 1.4 Accessibility要件（WCAG 2.1 AA）

すべてのLWC componentは完了とみなす前に、次のすべてを満たします。

- [ ] すべてのform inputに`<label>`または`aria-label`がある — placeholderだけをlabelにしない
- [ ] すべてのicon-only buttonに、actionを説明する`alternative-text`または`aria-label`がある
- [ ] すべてのinteractive elementにkeyboard（Tab、Enter、Space、Escape）で到達し操作できる
- [ ] statusを伝える手段がcolourだけではない — text、icon、`aria-*` attributeを組み合わせる
- [ ] error messageが`aria-describedby`でinputに関連付けられている
- [ ] modalのfocus managementが正しい — open時にmodal内へ、close時に元へfocusを戻す

### 1.5 Component Communicationのルール

| 方向 | Mechanism |
|---|---|
| Parent → Child | `@api` propertyまたは`@api` methodの呼び出し |
| Child → Parent | `CustomEvent` — `this.dispatchEvent(new CustomEvent('eventname', { detail: data }))` |
| Sibling / unrelated component | Lightning Message Service（LMS） |
| 使用禁止 | `document.querySelector`、`window.*`、Pub/Sub library |

Flow screen component では次のようにします。
- Flow runtimeへ届く必要があるeventは`bubbles: true`と`composed: true`を設定する。
- Flow variableとのtwo-way binding用に`@api value`を公開する。

### 1.6 JavaScriptのパフォーマンスルール

- **`connectedCallback`にside effectを置かない**: DOM attachごとに実行される — DML、重い計算、rendering state mutationをここで行わない。
- **`renderedCallback`をguardする**: infinite render loopを防ぐboolean guardを常に使う。
- **reactive property trapを避ける**: `renderedCallback`内でreactive propertyを設定するとre-renderされる — 必要な場合だけ、guard付きで使う。
- **component stateにlarge datasetを保存しない** — 代わりにpaginateまたはstreamする。

### 1.7 Jest Testの要件

user interactionを処理する、またはApex dataを取得するすべてのcomponentにJest testを用意します。

```javascript
// Minimum test coverage expectations
it('renders the component with correct title', async () => { ... });
it('calls apex method and displays results', async () => { ... });  // Wire mock
it('dispatches event when button is clicked', async () => { ... });
it('shows error state when apex call fails', async () => { ... }); // Error path
```

`@salesforce/sfdx-lwc-jest` mocking utilityを使います。
- `wire` adapter mocking: `setImmediate` + `emit({ data, error })`
- Apex method mocking: `jest.mock('@salesforce/apex/MyClass.myMethod', ...)`

---

## Section 2 — Aura Componentの標準

### 2.1 AuraとLWCを使い分ける

- **新規componentは常にLWC**。target contextがAura-onlyの場合を除く（例: `force:appPage`の拡張、legacy managed packageでのAura-specific eventの使用）。
- **AuraからLWCへのmigration**: LWCを優先し、component単位で移行する。LWCはAura component内に埋め込める。

### 2.2 Auraのセキュリティルール

- `@AuraEnabled` controller methodは`with sharing`を宣言し、CRUD/FLSを適用する — Auraは**自動適用しない**。
- `<div>` unbound helperでescapeされていないuser dataと`{!v.something}`を使わない — escapeするために`<ui:outputText value="{!v.text}" />`または`<c:something>`を使う。
- component attributeからのすべてのinputを、SOQL / Apex logicで使う前に検証する。

### 2.3 Aura Eventの設計

- parent-child communicationには**component event** — scopeが最小。
- **application event**はcomponent eventでtargetに届かない場合だけ — app全体へbroadcastするため、performanceとmaintenanceの問題になり得る。
- hybrid LWC + Aura stackでは、communicationを疎結合にするためLightning Message Serviceを使う — Aura application eventがLWC componentへ届くことに依存しない。

---

## Section 3 — Visualforceのセキュリティ標準

### 3.1 XSSを防止する

```xml
<!-- ❌ NEVER — renders raw user input as HTML -->
<apex:outputText value="{!userInput}" escape="false" />

<!-- ✅ ALWAYS — auto-escaping on -->
<apex:outputText value="{!userInput}" />
<!-- Default escape="true" — platform HTML-encodes the output -->
```

ルール: user-controlled dataに`escape="false"`は決して使えない。rich textをrenderする必要がある場合、output前にserver-sideでwhitelistを使ってsanitiseする。

### 3.2 CSRFを防止する

すべてのpostback actionに`<apex:form>`を使う — platformがformへCSRF tokenを自動注入する。CSRF protectionを回避するraw `<form method="POST">` HTML elementは**使わない**。

### 3.3 ControllerでSOQL Injectionを防止する

```apex
// ❌ NEVER
String soql = 'SELECT Id FROM Account WHERE Name = \'' + ApexPages.currentPage().getParameters().get('name') + '\'';
List<Account> results = Database.query(soql);

// ✅ ALWAYS — bind variable
String nameParam = ApexPages.currentPage().getParameters().get('name');
List<Account> results = [SELECT Id FROM Account WHERE Name = :nameParam];
```

### 3.4 View State Managementのチェックリスト

- [ ] view stateが135 KB未満（browser developer toolsまたはSalesforce View State tabで確認）
- [ ] server-side calculationだけに使うfieldを`transient`として宣言
- [ ] large collectionをpostback間で不必要にpersistしない
- [ ] read-only pageの`<apex:page>`に`readonly="true"`を設定し、view-state serialisationを省略

### 3.5 Visualforce ControllerでFLS / CRUDを適用する

```apex
// Before reading a field
if (!Schema.sObjectType.Account.fields.Revenue__c.isAccessible()) {
    ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'You do not have access to this field.'));
    return null;
}

// Before performing DML
if (!Schema.sObjectType.Account.isDeletable()) {
    throw new System.NoAccessException();
}
```

Standard controllerはbound fieldのFLSを自動適用する。**Custom controllerは適用しない** — FLSを手動で適用する必要がある。

---

## クイックリファレンス — Component アンチパターンの概要

| アンチパターン | Technology | リスク | 修正 |
|---|---|---|---|
| user dataを含む`innerHTML` | LWC | XSS | template binding `{expression}`を使う |
| hex colourのhardcode | LWC/Aura | Dark mode / SLDS 2の破綻 | SLDS CSS custom propertyを使う |
| icon buttonの`aria-label`欠落 | LWC/Aura/VF | Accessibility failure | `alternative-text`または`aria-label`を追加 |
| `renderedCallback`にguardがない | LWC | 無限rerender loop | `hasRendered` boolean guardを追加 |
| parent-childにapplication event | Aura | 不要なbroadcast scope | 代わりにcomponent eventを使う |
| user dataへの`escape="false"` | Visualforce | XSS | 削除 — default escapingを使う |
| raw `<form>` postback | Visualforce | CSRF vulnerability | `<apex:form>`を使う |
| custom controllerに`with sharing`がない | VF / Apex | data exposure | `with sharing` declarationを追加 |
| custom controllerでFLSをcheckしない | VF / Apex | privilege escalation | `Schema.sObjectType` checkを追加 |
| URL paramを連結したSOQL | VF / Apex | SOQL injection | bind variableを使う |

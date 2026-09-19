---
name: salesforce-apex-quality
description: 'Salesforce開発におけるApexコード品質のガードレール。bulk safety（ループ内のSOQL/DML禁止）、sharing model要件、CRUD/FLSセキュリティ、SOQL injection防止、PNBテストカバレッジ（Positive / Negative / Bulk）、現代的なApex idiomを適用します。Apex class、trigger handler、batch job、test classをレビューまたは生成し、deployment前にgovernor limitのリスク、セキュリティ上の欠落、品質問題を見つける場合に使用します。'
---
# Salesforce Apex 品質ガードレール

作成またはレビューするすべてのApex class、trigger、test fileに、次のチェックを適用します。

## Step 1 — Governor Limitの安全性を確認する

次のパターンを検査してから、Apex fileを許容できる状態と判断します。

### ループ内のSOQLとDML — 自動的に不合格

```apex
// ❌ NEVER — causes LimitException at scale
for (Account a : accounts) {
    List<Contact> contacts = [SELECT Id FROM Contact WHERE AccountId = :a.Id]; // SOQL in loop
    update a; // DML in loop
}

// ✅ ALWAYS — collect, then query/update once
Set<Id> accountIds = new Map<Id, Account>(accounts).keySet();
Map<Id, List<Contact>> contactsByAccount = new Map<Id, List<Contact>>();
for (Contact c : [SELECT Id, AccountId FROM Contact WHERE AccountId IN :accountIds]) {
    if (!contactsByAccount.containsKey(c.AccountId)) {
        contactsByAccount.put(c.AccountId, new List<Contact>());
    }
    contactsByAccount.get(c.AccountId).add(c);
}
update accounts; // DML once, outside the loop
```

ルール: `for` loop本体内に`[SELECT`、`Database.query`、`insert`、`update`、`delete`、`upsert`、`merge`があれば、作業を止めてからrefactorします。

## Step 2 — Sharing Modelを検証する

すべてのclassはsharingの意図を明示的に宣言します。未宣言のsharingはcallerから継承され、予測できない挙動になります。

| 宣言 | 使用する場面 |
|---|---|
| `public with sharing class Foo` | すべてのservice、handler、selector、controller classの既定値 |
| `public without sharing class Foo` | classを昇格権限で実行する必要がある場合のみ（例: system-level logging、trigger bypass）。理由を説明するcode commentが必要 |
| `public inherited sharing class Foo` | callerのsharing contextを尊重するframework entry point |

classにこの3つの宣言のいずれもなければ、**他の作業をする前に追加します**。

## Step 3 — CRUD / FLSを適用する

ユーザーに代わってrecordを読み書きするApex codeは、objectとfieldへのaccessを検証します。platformはApexでFLSやCRUDを**自動適用しません**。

```apex
// Check before querying a field
if (!Schema.sObjectType.Contact.fields.Email.isAccessible()) {
    throw new System.NoAccessException();
}

// Or use WITH USER_MODE in SOQL (API 56.0+)
List<Contact> contacts = [SELECT Id, Email FROM Contact WHERE AccountId = :accId WITH USER_MODE];

// Or use Database.query with AccessLevel
List<Contact> contacts = Database.query('SELECT Id, Email FROM Contact', AccessLevel.USER_MODE);
```

ルール: UI component、REST endpoint、`@InvocableMethod`から呼び出せるApex methodは、CRUD/FLSを**必ず**適用します。trusted contextからのみ呼び出されるinternal service methodは、代わりに`with sharing`を使用できます。

## Step 4 — SOQL Injectionを防止する

```apex
// ❌ NEVER — concatenates user input into SOQL string
String soql = 'SELECT Id FROM Account WHERE Name = \'' + userInput + '\'';

// ✅ ALWAYS — bind variable
String soql = [SELECT Id FROM Account WHERE Name = :userInput];

// ✅ For dynamic SOQL with user-controlled field names — validate against a whitelist
Set<String> allowedFields = new Set<String>{'Name', 'Industry', 'AnnualRevenue'};
if (!allowedFields.contains(userInput)) {
    throw new IllegalArgumentException('Field not permitted: ' + userInput);
}
```

## Step 5 — 現代的なApex idiom

現行のlanguage feature（API 62.0 / Winter '25+）を優先します。

| 古いパターン | 現代的な置き換え |
|---|---|
| `if (obj != null) { x = obj.Field__c; }` | `x = obj?.Field__c;` |
| `x = (y != null) ? y : defaultVal;` | `x = y ?? defaultVal;` |
| `System.assertEquals(expected, actual)` | `Assert.areEqual(expected, actual)` |
| `System.assert(condition)` | `Assert.isTrue(condition)` |
| `[SELECT ... WHERE ...]` with no sharing context | `[SELECT ... WHERE ... WITH USER_MODE]` |

## Step 6 — PNB Test Coverageのチェックリスト

すべてのfeatureを3つのpathすべてでテストします。いずれか1つでも欠けると品質不合格です。

### Positive Path（正常系）
- 期待するinputから期待するoutputが得られること。
- 例外が発生しなかったことだけでなく、正確なfield value、record count、return valueをassertします。

### Negative Path（異常系）
- 不正なinput、null value、empty collection、error condition。
- 正しいtypeとmessageを持つexceptionがthrowされることをassertします。
- operationが正常に失敗すべき場合、recordが変更されていないことをassertします。

### Bulk Path（一括処理）
- 1つのtest transactionで**200–251 records**をinsert/update/deleteします。
- すべてのrecordが正しく処理され、governor limitによる部分的な失敗がないことをassertします。
- async workのgovernor limit counterを分離するため、`Test.startTest()` / `Test.stopTest()`を使用します。

### Test Classのルール
```apex
@isTest(SeeAllData=false)   // Required — no exceptions without a documented reason
private class AccountServiceTest {

    @TestSetup
    static void makeData() {
        // Create all test data here — use a factory if one exists in the project
    }

    @isTest
    static void givenValidInput_whenProcessAccounts_thenFieldsUpdated() {
        // Positive path
        List<Account> accounts = [SELECT Id FROM Account LIMIT 10];
        Test.startTest();
        AccountService.processAccounts(accounts);
        Test.stopTest();
        // Assert meaningful outcomes — not just no exception
        List<Account> updated = [SELECT Status__c FROM Account WHERE Id IN :accounts];
        Assert.areEqual('Processed', updated[0].Status__c, 'Status should be Processed');
    }
}
```

## Step 7 — Trigger Architectureのチェックリスト

- [ ] 1 objectにつきtriggerは1つ。2つ目のtriggerがあればhandlerへ統合します。
- [ ] Trigger bodyにはcontext check、handler invocation、routing logicだけを置きます。
- [ ] Trigger bodyにbusiness logic、SOQL、DMLを直接書きません。
- [ ] Trigger framework（Trigger Actions Framework、ff-apex-common、custom base class）を既に使用している場合は拡張します。並行するpatternを作りません。
- [ ] triggerが昇格アクセスを必要としない限り、handler classは`with sharing`にします。

## クイックリファレンス — ハードコードを含むアンチパターンの概要

| パターン | 対応 |
|---|---|
| `for` loop内のSOQL | Refactor: loop前にqueryし、collectionを処理する |
| `for` loop内のDML | Refactor: mutationを集め、loop後に1回だけDMLを実行する |
| sharing declarationがないclass | `with sharing`を追加（または`without sharing`の理由を記載する） |
| user dataへの`escape="false"`（VF） | 削除 — auto-escapingでXSSを防止 |
| 空の`catch` block | loggingと適切なre-throwまたはerror handlingを追加する |
| user inputを連結したSOQL | bind variableまたはwhitelist validationに置換する |
| assertionのないtest | 意味のある`Assert.*` callを追加する |
| `System.assert` / `System.assertEquals` style | `Assert.isTrue` / `Assert.areEqual`へ更新する |
| hardcodeしたrecord ID（`'001...'`） | queryまたはinsertしたtest record IDへ置換する |

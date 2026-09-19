---
name: entra-agent-user
description: 'Agent Identity から Microsoft Entra ID の Agent User を作成し、AI エージェントが Microsoft 365 と Azure 環境でユーザー ID の機能を持つデジタルワーカーとして動作できるようにします。'
---

# スキル: Microsoft Entra Agent ID でエージェント ユーザーを作成する

## 概要

**エージェント ユーザー**は、AI エージェントがデジタル ワーカーとして動作できるようにする、Microsoft Entra ID の特殊なユーザー ID です。適切なセキュリティ境界を維持しながら、ユーザー ID を厳密に必要とする API やサービス（例: Exchange メールボックス、Teams、組織図）へエージェントがアクセスできるようにします。

エージェント ユーザーは、`idtyp=app` を受け取る通常のエージェント ID とは異なり、`idtyp=user` を含むトークンを受け取ります。

---

## 前提条件

- Agent ID 機能を備えた **Microsoft Entra テナント**
- **エージェント ID ブループリント**から作成された **エージェント ID**（`ServiceIdentity` 型のサービス プリンシパル）
- 次のいずれかの **アクセス許可**:
  - `AgentIdUser.ReadWrite.IdentityParentedBy`（最小権限）
  - `AgentIdUser.ReadWrite.All`
  - `User.ReadWrite.All`
- 呼び出し元は、少なくとも **Agent ID Administrator** ロールを持っている必要があります（委任シナリオの場合）

> **重要:** `identityParentId` は、通常のアプリケーション サービス プリンシパルではなく、真のエージェント ID（エージェント ID ブループリント経由で作成されたもの）を参照している必要があります。サービス プリンシパルに `@odata.type: #microsoft.graph.agentIdentity` と `servicePrincipalType: ServiceIdentity` があることを確認することで検証できます。

---

## アーキテクチャ

```
Agent Identity Blueprint (application template)
    │
    ├── Agent Identity (service principal - ServiceIdentity)
    │       │
    │       └── Agent User (user - agentUser) ← 1:1 relationship
    │
    └── Agent Identity Blueprint Principal (service principal in tenant)
```

| コンポーネント | 種類 | トークン クレーム | 目的 |
|---|---|---|---|
| エージェント ID | サービス プリンシパル | `idtyp=app` | バックエンド/API 操作 |
| エージェント ユーザー | ユーザー（`agentUser`） | `idtyp=user` | M365 のデジタル ワーカーとして動作 |

---

## 手順 1: エージェント ID が存在することを確認する

エージェント ユーザーを作成する前に、エージェント ID が適切な `agentIdentity` 型であることを確認します。

```http
GET https://graph.microsoft.com/beta/servicePrincipals/{agent-identity-id}
Authorization: Bearer <token>
```

レスポンスに次が含まれていることを確認します。
```json
{
  "@odata.type": "#microsoft.graph.agentIdentity",
  "servicePrincipalType": "ServiceIdentity",
  "agentIdentityBlueprintId": "<blueprint-id>"
}
```

### PowerShell

```powershell
Connect-MgGraph -Scopes "Application.Read.All" -TenantId "<tenant>" -UseDeviceCode -NoWelcome
Invoke-MgGraphRequest -Method GET `
  -Uri "https://graph.microsoft.com/beta/servicePrincipals/<agent-identity-id>" | ConvertTo-Json -Depth 3
```

> **よくある間違い:** アプリ登録の `appId` や通常のアプリケーション サービス プリンシパルの `id` を使用すると失敗します。ブループリントから作成されたエージェント ID のみが動作します。

---

## 手順 2: エージェント ユーザーを作成する

### HTTP リクエスト

```http
POST https://graph.microsoft.com/beta/users/microsoft.graph.agentUser
Content-Type: application/json
Authorization: Bearer <token>

{
  "accountEnabled": true,
  "displayName": "My Agent User",
  "mailNickname": "my-agent-user",
  "userPrincipalName": "my-agent-user@yourtenant.onmicrosoft.com",
  "identityParentId": "<agent-identity-object-id>"
}
```

### 必須プロパティ

| プロパティ | 種類 | 説明 |
|---|---|---|
| `accountEnabled` | Boolean | アカウントを有効にするには `true` |
| `displayName` | String | 人が読みやすい名前 |
| `mailNickname` | String | メール エイリアス（スペース/特殊文字なし） |
| `userPrincipalName` | String | UPN — テナント内で一意である必要があります（`alias@verified-domain`） |
| `identityParentId` | String | 親エージェント ID のオブジェクト ID |

### PowerShell

```powershell
Connect-MgGraph -Scopes "User.ReadWrite.All" -TenantId "<tenant>" -UseDeviceCode -NoWelcome

$body = @{
  accountEnabled    = $true
  displayName       = "My Agent User"
  mailNickname      = "my-agent-user"
  userPrincipalName = "my-agent-user@yourtenant.onmicrosoft.com"
  identityParentId  = "<agent-identity-object-id>"
} | ConvertTo-Json

Invoke-MgGraphRequest -Method POST `
  -Uri "https://graph.microsoft.com/beta/users/microsoft.graph.agentUser" `
  -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 3
```

### 重要なメモ

- **パスワードなし** — エージェント ユーザーはパスワードを持つことができません。親エージェント ID の資格情報を介して認証します。
- **1:1 の関係** — 各エージェント ID が持てるエージェント ユーザーは最大 1 つです。2 つ目を作成しようとすると `400 Bad Request` が返されます。
- `userPrincipalName` は一意である必要があります。既存ユーザーの UPN を再利用しないでください。

---

## 手順 3: マネージャーを割り当てる（任意）

マネージャーを割り当てると、エージェント ユーザーが組織図（例: Teams）に表示されるようになります。

```http
PUT https://graph.microsoft.com/beta/users/{agent-user-id}/manager/$ref
Content-Type: application/json
Authorization: Bearer <token>

{
  "@odata.id": "https://graph.microsoft.com/beta/users/{manager-user-id}"
}
```

### PowerShell

```powershell
$managerBody = '{"@odata.id":"https://graph.microsoft.com/beta/users/<manager-user-id>"}'
Invoke-MgGraphRequest -Method PUT `
  -Uri "https://graph.microsoft.com/beta/users/<agent-user-id>/manager/`$ref" `
  -Body $managerBody -ContentType "application/json"
```

---

## 手順 4: 使用場所を設定してライセンスを割り当てる（任意）

エージェント ユーザーがメールボックスや Teams プレゼンスなどを持つにはライセンスが必要です。使用場所を先に設定する必要があります。

### 使用場所を設定する

```http
PATCH https://graph.microsoft.com/beta/users/{agent-user-id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "usageLocation": "US"
}
```

### 使用可能なライセンスを一覧表示する

```http
GET https://graph.microsoft.com/beta/subscribedSkus?$select=skuPartNumber,skuId,consumedUnits,prepaidUnits
Authorization: Bearer <token>
```

`Organization.Read.All` アクセス許可が必要です。

### ライセンスを割り当てる

```http
POST https://graph.microsoft.com/beta/users/{agent-user-id}/assignLicense
Content-Type: application/json
Authorization: Bearer <token>

{
  "addLicenses": [
    { "skuId": "<sku-id>" }
  ],
  "removeLicenses": []
}
```

### PowerShell（一括）

```powershell
Connect-MgGraph -Scopes "User.ReadWrite.All","Organization.Read.All" -TenantId "<tenant>" -NoWelcome

# Set usage location
Invoke-MgGraphRequest -Method PATCH `
  -Uri "https://graph.microsoft.com/beta/users/<agent-user-id>" `
  -Body '{"usageLocation":"US"}' -ContentType "application/json"

# Assign license
$licenseBody = '{"addLicenses":[{"skuId":"<sku-id>"}],"removeLicenses":[]}'
Invoke-MgGraphRequest -Method POST `
  -Uri "https://graph.microsoft.com/beta/users/<agent-user-id>/assignLicense" `
  -Body $licenseBody -ContentType "application/json"
```

> **ヒント:** **Entra 管理センター**の Identity → Users → All users → 対象の agent user → Licenses and apps からライセンスを割り当てることもできます。

---

## プロビジョニング時間

| サービス | 推定時間 |
|---|---|
| Exchange メールボックス | 5～30 分 |
| Teams の利用可能化 | 15 分～24 時間 |
| 組織図 / People 検索 | 最大 24～48 時間 |
| SharePoint / OneDrive | 5～30 分 |
| Global Address List | 最大 24 時間 |

---

## Agent User の機能

- ✅ Microsoft Entra グループ（動的グループを含む）への追加
- ✅ ユーザー専用 API へのアクセス（`idtyp=user` トークン）
- ✅ メールボックス、カレンダー、連絡先の所有
- ✅ Teams のチャットとチャネルへの参加
- ✅ 組織図と People 検索への表示
- ✅ 管理単位への追加
- ✅ ライセンスの割り当て

## Agent User のセキュリティ制約

- ❌ パスワード、パスキー、対話型サインインは使用不可
- ❌ 特権管理者ロールは割り当て不可
- ❌ ロール割り当て可能グループには追加不可
- ❌ 既定ではゲスト ユーザーと同等のアクセス許可
- ❌ カスタム ロールの割り当ては利用不可

---

## トラブルシューティング

| エラー | 原因 | 修正方法 |
|---|---|---|
| `Agent user IdentityParent does not exist` | `identityParentId` が存在しないオブジェクト、または agent identity ではないオブジェクトを参照している | ID が通常のアプリではなく `agentIdentity` サービス プリンシパルであることを確認する |
| `400 Bad Request`（identityParentId がすでにリンク済み） | agent identity に agent user がすでに存在する | 各 agent identity がサポートする agent user は 1 つだけです |
| UPN で `409 Conflict` | `userPrincipalName` がすでに使用されている | 一意の UPN を使用する |
| ライセンスの割り当てに失敗する | 使用場所が設定されていない | ライセンスを割り当てる前に `usageLocation` を設定する |

---

## 参考資料

- [Agent identities](https://learn.microsoft.com/en-us/entra/agent-id/identity-platform/agent-identities)
- [Agent users](https://learn.microsoft.com/en-us/entra/agent-id/identity-platform/agent-users)
- [Agent service principals](https://learn.microsoft.com/en-us/entra/agent-id/identity-platform/agent-service-principals)
- [Agent identity blueprint を作成する](https://learn.microsoft.com/en-us/entra/agent-id/identity-platform/create-blueprint)
- [Agent identities を作成する](https://learn.microsoft.com/en-us/entra/agent-id/identity-platform/create-delete-agent-identities)
- [agentUser リソース型 (Graph API)](https://learn.microsoft.com/en-us/graph/api/resources/agentuser?view=graph-rest-beta)
- [agentUser を作成する (Graph API)](https://learn.microsoft.com/en-us/graph/api/agentuser-post?view=graph-rest-beta)

---
name: typespec-create-api-plugin
description: 'Microsoft 365 Copilot向けに、REST操作、認証、Adaptive Cardsを備えたTypeSpec APIプラグインを生成します。'
---
# TypeSpec APIプラグインの作成

外部REST APIと統合する、Microsoft 365 Copilot向けの完全なTypeSpec APIプラグインを作成します。

## 要件

次のTypeSpecファイルを生成します。

### main.tsp - Agent定義
```typescript
import "@typespec/http";
import "@typespec/openapi3";
import "@microsoft/typespec-m365-copilot";
import "./actions.tsp";

using TypeSpec.Http;
using TypeSpec.M365.Copilot.Agents;
using TypeSpec.M365.Copilot.Actions;

@agent({
  name: "[Agent Name]",
  description: "[Description]"
})
@instructions("""
  [Instructions for using the API operations]
""")
namespace [AgentName] {
  // Reference operations from actions.tsp
  op operation1 is [APINamespace].operationName;
}
```

### actions.tsp - API操作
```typescript
import "@typespec/http";
import "@microsoft/typespec-m365-copilot";

using TypeSpec.Http;
using TypeSpec.M365.Copilot.Actions;

@service
@actions(#{
    nameForHuman: "[API Display Name]",
    descriptionForModel: "[Model description]",
    descriptionForHuman: "[User description]"
})
@server("[API_BASE_URL]", "[API Name]")
@useAuth([AuthType]) // Optional
namespace [APINamespace] {
  
  @route("[/path]")
  @get
  @action
  op operationName(
    @path param1: string,
    @query param2?: string
  ): ResponseModel;

  model ResponseModel {
    // Response structure
  }
}
```

## 認証オプション

APIの要件に応じて選択します。

1. **認証なし**（公開API）
   ```typescript
   // No @useAuth decorator needed
   ```

2. **APIキー**
   ```typescript
   @useAuth(ApiKeyAuth<ApiKeyLocation.header, "X-API-Key">)
   ```

3. **OAuth2**
   ```typescript
   @useAuth(OAuth2Auth<[{
     type: OAuth2FlowType.authorizationCode;
     authorizationUrl: "https://oauth.example.com/authorize";
     tokenUrl: "https://oauth.example.com/token";
     refreshUrl: "https://oauth.example.com/token";
     scopes: ["read", "write"];
   }]>)
   ```

4. **登録済み認証参照**
   ```typescript
   @useAuth(Auth)
   
   @authReferenceId("registration-id-here")
   model Auth is ApiKeyAuth<ApiKeyLocation.header, "X-API-Key">
   ```

## 操作の機能

### 確認ダイアログ
```typescript
@capabilities(#{
  confirmation: #{
    type: "AdaptiveCard",
    title: "Confirm Action",
    body: """
    Are you sure you want to perform this action?
      * **Parameter**: {{ function.parameters.paramName }}
    """
  }
})
```

### Adaptive Cardレスポンス
```typescript
@card(#{
  dataPath: "$.items",
  title: "$.title",
  url: "$.link",
  file: "cards/card.json"
})
```

### 推論とレスポンスの指示
```typescript
@reasoning("""
  Consider user's context when calling this operation.
  Prioritize recent items over older ones.
""")
@responding("""
  Present results in a clear table format with columns: ID, Title, Status.
  Include a summary count at the end.
""")
```

## 推奨事項

1. **操作名**：明確でアクションを表す名前を使う（listProjects、createTicket）
2. **モデル**：リクエストとレスポンスにTypeScript風のモデルを定義する
3. **HTTPメソッド**：適切な動詞（@get、@post、@patch、@delete）を使う
4. **パス**：@routeでRESTfulなパス規約を使う
5. **パラメーター**：@path、@query、@header、@bodyを適切に使う
6. **説明**：モデルが理解できる明確な説明を付ける
7. **確認**：破壊的操作（削除、重要データの更新）に追加する
8. **カード**：複数のデータ項目を含む豊かな視覚レスポンスに使う

## ワークフロー

ユーザーに次の点を尋ねます。
1. APIのベースURLと目的は何か。
2. どの操作（CRUD操作）が必要か。
3. APIはどの認証方式を使うか。
4. どの操作に確認が必要か。
5. レスポンスにAdaptive Cardsが必要か。

その後、次を生成します。
- Agent定義を含む完全な`main.tsp`
- API操作とモデルを含む完全な`actions.tsp`
- Adaptive Cardsが必要な場合は任意の`cards/card.json`

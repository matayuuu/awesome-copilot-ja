---
name: typespec-api-operations
description: '適切なルーティング、パラメーター、Adaptive Cardsを備えたGET、POST、PATCH、DELETE操作をTypeSpec APIプラグインに追加します。'
---
# TypeSpec API操作の追加

Microsoft 365 Copilot向けの既存TypeSpec APIプラグインにRESTful操作を追加します。

## GET操作の追加

### 単純なGET - すべての項目を一覧表示
```typescript
/**
 * List all items.
 */
@route("/items")
@get op listItems(): Item[];
```

### クエリパラメーター付きGET - 結果を絞り込む
```typescript
/**
 * List items filtered by criteria.
 * @param userId Optional user ID to filter items
 */
@route("/items")
@get op listItems(@query userId?: integer): Item[];
```

### パスパラメーター付きGET - 1件の項目を取得
```typescript
/**
 * Get a specific item by ID.
 * @param id The ID of the item to retrieve
 */
@route("/items/{id}")
@get op getItem(@path id: integer): Item;
```

### Adaptive Card付きGET
```typescript
/**
 * List items with adaptive card visualization.
 */
@route("/items")
@card(#{
  dataPath: "$",
  title: "$.title",
  file: "item-card.json"
})
@get op listItems(): Item[];
```

**Adaptive Cardを作成する**（`appPackage/item-card.json`）：
```json
{
  "type": "AdaptiveCard",
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "version": "1.5",
  "body": [
    {
      "type": "Container",
      "$data": "${$root}",
      "items": [
        {
          "type": "TextBlock",
          "text": "**${if(title, title, 'N/A')}**",
          "wrap": true
        },
        {
          "type": "TextBlock",
          "text": "${if(description, description, 'N/A')}",
          "wrap": true
        }
      ]
    }
  ],
  "actions": [
    {
      "type": "Action.OpenUrl",
      "title": "View Details",
      "url": "https://example.com/items/${id}"
    }
  ]
}
```

## POST操作の追加

### 単純なPOST - 項目を作成
```typescript
/**
 * Create a new item.
 * @param item The item to create
 */
@route("/items")
@post op createItem(@body item: CreateItemRequest): Item;

model CreateItemRequest {
  title: string;
  description?: string;
  userId: integer;
}
```

### 確認付きPOST
```typescript
/**
 * Create a new item with confirmation.
 */
@route("/items")
@post
@capabilities(#{
  confirmation: #{
    type: "AdaptiveCard",
    title: "Create Item",
    body: """
    Are you sure you want to create this item?
      * **Title**: {{ function.parameters.item.title }}
      * **User ID**: {{ function.parameters.item.userId }}
    """
  }
})
op createItem(@body item: CreateItemRequest): Item;
```

## PATCH操作の追加

### 単純なPATCH - 項目を更新
```typescript
/**
 * Update an existing item.
 * @param id The ID of the item to update
 * @param item The updated item data
 */
@route("/items/{id}")
@patch op updateItem(
  @path id: integer,
  @body item: UpdateItemRequest
): Item;

model UpdateItemRequest {
  title?: string;
  description?: string;
  status?: "active" | "completed" | "archived";
}
```

### 確認付きPATCH
```typescript
/**
 * Update an item with confirmation.
 */
@route("/items/{id}")
@patch
@capabilities(#{
  confirmation: #{
    type: "AdaptiveCard",
    title: "Update Item",
    body: """
    Updating item #{{ function.parameters.id }}:
      * **Title**: {{ function.parameters.item.title }}
      * **Status**: {{ function.parameters.item.status }}
    """
  }
})
op updateItem(
  @path id: integer,
  @body item: UpdateItemRequest
): Item;
```

## DELETE操作の追加

### 単純なDELETE
```typescript
/**
 * Delete an item.
 * @param id The ID of the item to delete
 */
@route("/items/{id}")
@delete op deleteItem(@path id: integer): void;
```

### 確認付きDELETE
```typescript
/**
 * Delete an item with confirmation.
 */
@route("/items/{id}")
@delete
@capabilities(#{
  confirmation: #{
    type: "AdaptiveCard",
    title: "Delete Item",
    body: """
    ⚠️ Are you sure you want to delete item #{{ function.parameters.id }}?
    This action cannot be undone.
    """
  }
})
op deleteItem(@path id: integer): void;
```

## CRUDの完全な例

### Serviceとモデルを定義
```typescript
@service
@server("https://api.example.com")
@actions(#{
  nameForHuman: "Items API",
  descriptionForHuman: "Manage items",
  descriptionForModel: "Read, create, update, and delete items"
})
namespace ItemsAPI {
  
  // Models
  model Item {
    @visibility(Lifecycle.Read)
    id: integer;
    
    userId: integer;
    title: string;
    description?: string;
    status: "active" | "completed" | "archived";
    
    @format("date-time")
    createdAt: utcDateTime;
    
    @format("date-time")
    updatedAt?: utcDateTime;
  }

  model CreateItemRequest {
    userId: integer;
    title: string;
    description?: string;
  }

  model UpdateItemRequest {
    title?: string;
    description?: string;
    status?: "active" | "completed" | "archived";
  }

  // Operations
  @route("/items")
  @card(#{ dataPath: "$", title: "$.title", file: "item-card.json" })
  @get op listItems(@query userId?: integer): Item[];

  @route("/items/{id}")
  @card(#{ dataPath: "$", title: "$.title", file: "item-card.json" })
  @get op getItem(@path id: integer): Item;

  @route("/items")
  @post
  @capabilities(#{
    confirmation: #{
      type: "AdaptiveCard",
      title: "Create Item",
      body: "Creating: **{{ function.parameters.item.title }}**"
    }
  })
  op createItem(@body item: CreateItemRequest): Item;

  @route("/items/{id}")
  @patch
  @capabilities(#{
    confirmation: #{
      type: "AdaptiveCard",
      title: "Update Item",
      body: "Updating item #{{ function.parameters.id }}"
    }
  })
  op updateItem(@path id: integer, @body item: UpdateItemRequest): Item;

  @route("/items/{id}")
  @delete
  @capabilities(#{
    confirmation: #{
      type: "AdaptiveCard",
      title: "Delete Item",
      body: "⚠️ Delete item #{{ function.parameters.id }}?"
    }
  })
  op deleteItem(@path id: integer): void;
}
```

## 高度な機能

### 複数のクエリパラメーター
```typescript
@route("/items")
@get op listItems(
  @query userId?: integer,
  @query status?: "active" | "completed" | "archived",
  @query limit?: integer,
  @query offset?: integer
): ItemList;

model ItemList {
  items: Item[];
  total: integer;
  hasMore: boolean;
}
```

### ヘッダーパラメーター
```typescript
@route("/items")
@get op listItems(
  @header("X-API-Version") apiVersion?: string,
  @query userId?: integer
): Item[];
```

### カスタムレスポンスモデル
```typescript
@route("/items/{id}")
@delete op deleteItem(@path id: integer): DeleteResponse;

model DeleteResponse {
  success: boolean;
  message: string;
  deletedId: integer;
}
```

### エラーレスポンス
```typescript
model ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}

@route("/items/{id}")
@get op getItem(@path id: integer): Item | ErrorResponse;
```

## テスト用プロンプト

操作を追加したら、次のプロンプトでテストします。

**GET操作：**
- 「すべての項目を一覧表示して表にする」
- 「ユーザーID 1の項目を表示する」
- 「項目42の詳細を取得する」

**POST操作：**
- 「ユーザー1向けにタイトルが「個人タスク」の新しい項目を作成する」
- 「項目を追加する：タイトルは「新機能」、説明は「ログインを追加」」

**PATCH操作：**
- 「項目10のタイトルを「更新後のタイトル」に更新する」
- 「項目5のステータスをcompletedに変更する」

**DELETE操作：**
- 「項目99を削除する」
- 「ID 15の項目を削除する」

## ベストプラクティス

### パラメーターの命名
- 説明的なパラメーター名を使う：`uid`ではなく`userId`
- 操作間で一貫性を保つ
- 絞り込みには省略可能なパラメーター（`?`）を使う

### 文書化
- すべての操作にJSDocコメントを追加する
- 各パラメーターの役割を説明する
- 期待されるレスポンスを文書化する

### モデル
- `id`のような読み取り専用フィールドには`@visibility(Lifecycle.Read)`を使う
- 日付フィールドには`@format("date-time")`を使う
- 列挙値にはユニオン型を使う：「"active" | "completed"」
- 省略可能なフィールドは`?`で明示する

### 確認
- 破壊的操作（DELETE、PATCH）には必ず確認を追加する
- 確認本文に主要な詳細を表示する
- 元に戻せない操作には警告絵文字（⚠️）を使う

### Adaptive Cards（アダプティブカード）
- カードは単純で焦点を絞ったものにする
- `${if(..., ..., 'N/A')}`で条件付きレンダリングを使う
- よくある次の手順のアクションボタンを含める
- 実際のAPIレスポンスでデータバインディングをテストする

### ルーティング
- RESTfulな規約を使う：
  - `GET /items` - 一覧
  - `GET /items/{id}` - 1件取得
  - `POST /items` - 作成
  - `PATCH /items/{id}` - 更新
  - `DELETE /items/{id}` - 削除
- 関連する操作を同じnamespaceにまとめる
- 階層リソースにはネストしたルートを使う

## よくある問題

### 問題：Copilotにパラメーターが表示されない
**解決策**：パラメーターに`@query`、`@path`、`@body`が正しく付いているか確認します。

### 問題：Adaptive Cardが描画されない
**解決策**：`@card`デコレーターのファイルパスを確認し、JSON構文を検証します。

### 問題：確認が表示されない
**解決策**：`@capabilities`デコレーターが確認オブジェクトとともに正しく記述されていることを確認します。

### 問題：レスポンスにモデルのプロパティが表示されない
**解決策**：プロパティに`@visibility(Lifecycle.Read)`が必要か確認し、書き込み可能であるべき場合は削除します。

---
name: copilot-spaces
description: 'Copilot Spacesを使って、会話へプロジェクト固有のコンテキストを提供する。ユーザーがCopilot spaceに言及する、共有ナレッジベースからコンテキストを読み込む、利用可能なSpaceを探す、または厳選されたプロジェクト文書、コード、指示に基づいて質問するときに使用する。'
---

# Copilot Spaces

Copilot Spacesを使い、厳選されたプロジェクト固有のコンテキストを会話へ取り込む。Spaceはリポジトリ、ファイル、文書、指示を共有するコレクションであり、チームの実際のコードと知識に基づいてCopilotが応答できるようにする。

## 利用可能なツール

### MCPツール（読み取り専用）

| ツール | 用途 |
|------|---------|
| `mcp__github__list_copilot_spaces` | 現在のユーザーがアクセスできるすべてのSpaceを一覧表示する |
| `mcp__github__get_copilot_space` | ownerとnameを指定してSpaceの完全なコンテキストを読み込む |

### `gh api` 経由のREST API（完全なCRUD）

Spaces REST APIは、Spaceの作成、更新、削除、コラボレーター管理に対応する。MCP serverが公開するのは読み取り操作だけなので、書き込みには `gh api` を使う。

**ユーザーのSpace:**

| メソッド | エンドポイント | 用途 |
|--------|----------|---------|
| `POST` | `/users/{username}/copilot-spaces` | Spaceを作成する |
| `GET` | `/users/{username}/copilot-spaces` | Spaceを一覧表示する |
| `GET` | `/users/{username}/copilot-spaces/{number}` | Spaceを取得する |
| `PUT` | `/users/{username}/copilot-spaces/{number}` | Spaceを更新する |
| `DELETE` | `/users/{username}/copilot-spaces/{number}` | Spaceを削除する |

**OrganizationのSpace:** `/orgs/{org}/copilot-spaces/...` 配下で同じパターンを使う。

**コラボレーター:** `.../collaborators` でコラボレーターを追加、一覧表示、更新、削除する。

**scope要件:** PATには、読み取り用の `read:user`、書き込み用の `user` が必要である。`gh auth refresh -h github.com -s user` で追加する。

**注:** このAPIは機能するが、公開REST API文書にはまだ掲載されていない。`copilot_spaces_api` feature flagが必要な場合がある。

## Spacesを使う場面

- ユーザーが「Copilot space」に言及する、または「Spaceを読み込む」よう求める
- 特定のプロジェクト文書、コード、標準に基づく回答を求める
- 利用可能なSpaceの確認、または特定目的のSpaceの検索を求める
- オンボーディング用コンテキスト、アーキテクチャ文書、チーム固有の指針を必要とする
- Spaceで定義された構造化Workflow（テンプレート、チェックリスト、複数ステップの手順）に従いたい

## Workflow

### 1. Spaceを検出する

ユーザーが利用可能なSpaceを尋ねた場合、または適切なSpaceを探す必要がある場合:

```
Call mcp__github__list_copilot_spaces
```

これにより、ユーザーがアクセスできるすべてのSpaceが、それぞれの `name` と `owner_login` とともに返される。関連する候補をユーザーへ提示する。

特定ユーザーのSpaceへ絞るには、`owner_login` をユーザー名と照合する。

### 2. Spaceを読み込む

ユーザーが特定のSpaceを指定した場合、または適切なSpaceを特定した場合:

```
Call mcp__github__get_copilot_space with:
  owner: "org-or-user"    (the owner_login from the list)
  name: "Space Name"      (exact space name, case-sensitive)
```

これにより、添付文書、コードコンテキスト、カスタム指示、その他の厳選された資料を含むSpaceの全内容が返される。このコンテキストを回答へ反映する。

### 3. 参照先をたどる

Spaceの内容は、GitHub Issue、ダッシュボード、リポジトリ、Discussion、他のツールなどの外部リソースを参照することが多い。完全なコンテキストを集めるため、他のMCPツールで先回りして取得する。例:
- Spaceが施策追跡Issueを参照する場合は、`issue_read` で最新コメントを取得する
- Spaceがproject boardへリンクする場合は、projectツールで現在の状態を確認する
- Spaceがリポジトリのmasterplanへ言及する場合は、`get_file_contents` で読む

### 4. 回答または実行する

読み込み後は、Spaceの内容に応じて利用する。

**Spaceに参考資料が含まれる場合**（文書、コード、標準）:
- プロジェクトのアーキテクチャ、パターン、標準に関する質問へ回答する
- チームの規約に従うコードを生成する
- プロジェクト固有の知識を使って問題をデバッグする

**SpaceにWorkflowの指示が含まれる場合**（テンプレート、段階的な手順）:
- 定義されたWorkflowへ1ステップずつ従う
- Workflowで指定された情報源からデータを収集する
- Workflowで定義された形式で出力する
- ユーザーが方向修正できるよう、各ステップ後に進捗を示す

### 5. Spaceを管理する（`gh api` 経由）

ユーザーがSpaceの作成、更新、削除を求めた場合は `gh api` を使う。まず一覧エンドポイントからSpace番号を探す。

**Spaceの指示を更新する:**
```bash
gh api users/{username}/copilot-spaces/{number} \
  -X PUT \
  -f general_instructions="New instructions here"
```

**名前、説明、指示をまとめて更新する:**
```bash
gh api users/{username}/copilot-spaces/{number} \
  -X PUT \
  -f name="Updated Name" \
  -f description="Updated description" \
  -f general_instructions="Updated instructions"
```

**新しいSpaceを作成する:**
```bash
gh api users/{username}/copilot-spaces \
  -X POST \
  -f name="My New Space" \
  -f general_instructions="Help me with..." \
  -f visibility="private"
```

**リソースを添付する（リソース一覧全体を置換）:**
```json
{
  "resources_attributes": [
    { "resource_type": "free_text", "metadata": { "name": "Notes", "text": "Content here" } },
    { "resource_type": "github_issue", "metadata": { "repository_id": 12345, "number": 42 } },
    { "resource_type": "github_file", "metadata": { "repository_id": 12345, "file_path": "docs/guide.md" } }
  ]
}
```

**Spaceを削除する:**
```bash
gh api users/{username}/copilot-spaces/{number} -X DELETE
```

**更新可能なフィールド:** `name`、`description`、`general_instructions`、`icon_type`、`icon_color`、`visibility`（`"private"`/`"public"`）、`base_role`（`"no_access"`/`"reader"`）、`resources_attributes`

## 例

### 例1: ユーザーがSpaceを指定する

**ユーザー**: 「Accessibility Copilot spaceを読み込んで」

**アクション**:
1. ownerを `"github"`、nameを `"Accessibility"` として `mcp__github__get_copilot_space` を呼び出す
2. 返されたコンテキストを使い、アクセシビリティ標準、MAS等級、コンプライアンスプロセスなどの質問へ回答する

### 例2: ユーザーがSpaceを探す

**ユーザー**: 「チームで利用できるCopilot spaceは何ですか？」

**アクション**:
1. `mcp__github__list_copilot_spaces` を呼び出す
2. ユーザーのOrganizationまたは関心に関連するSpaceへ絞って提示する
3. 関心のあるSpaceを読み込むことを提案する

### 例3: コンテキストに基づく質問

**ユーザー**: 「security spaceを使って、secret scanningに関する方針を教えて」

**アクション**:
1. 適切なownerとnameを指定して `mcp__github__get_copilot_space` を呼び出す
2. Spaceの内容から関連する方針を探す
3. 実際の内部文書に基づいて回答する

### 例4: WorkflowエンジンとしてのSpace

**ユーザー**: 「PM Weekly Updates spaceを使って週次報告を書いて」

**アクション**:
1. `mcp__github__get_copilot_space` を呼び出してSpaceを読み込む。Spaceにはテンプレート形式と段階的な手順が含まれる
2. SpaceのWorkflowに従い、添付された施策Issueからデータを取得し、メトリクスを収集して各セクションの下書きを作る
3. 他のMCPツールで、Spaceが参照する外部リソース（追跡Issue、ダッシュボード）を取得する
4. ユーザーが確認して不足を補えるよう、各セクションの後に下書きを示す
5. Spaceで定義された形式の最終出力を作成する

### 例5: Spaceの指示をプログラムで更新する

**ユーザー**: 「PM Weekly Updates spaceへ新しい文章作成ガイドラインを追加して」

**アクション**:
1. `mcp__github__list_copilot_spaces` を呼び出し、Space番号（例: 19）を探す
2. `mcp__github__get_copilot_space` を呼び出して現在の指示を読む
3. 依頼どおり指示テキストを変更する
4. 更新を反映する:
```bash
gh api users/labudis/copilot-spaces/19 -X PUT -f general_instructions="updated instructions..."
```

## ヒント

- Space名では**大文字と小文字を区別する**。`list_copilot_spaces` の正確な名前を使う
- SpaceはユーザーまたはOrganizationが所有できる。常に `owner` と `name` の両方を指定する
- Spaceの内容は大きい場合がある（20KB以上）。一時ファイルとして返された場合は、一度にすべて読まず、grepまたはview_rangeで関連セクションを探す
- Spaceが見つからない場合は、利用可能なSpaceを一覧表示して正しい名前を探すよう提案する
- 基になるリポジトリの変更に合わせてSpaceは自動更新されるため、コンテキストは常に最新である
- 一部のSpaceには、コーディング標準、推奨パターン、Workflowなど、動作を導くカスタム指示が含まれる。提案ではなく指示として扱う
- **書き込み操作**（作成、更新、削除の `gh api`）にはPATの `user` scopeが必要である。書き込み操作で404になった場合は `gh auth refresh -h github.com -s user` を実行する
- リソース更新は**配列全体を置換する**。リソースを追加するときは既存リソースすべてと新しいリソースを含める。削除するときは配列へ `{ "id": 123, "_destroy": true }` を含める

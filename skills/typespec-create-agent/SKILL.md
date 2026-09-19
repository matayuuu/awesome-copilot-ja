---
name: typespec-create-agent
description: 'Microsoft 365 Copilot向けに、指示、機能、会話スターターを備えた完全なTypeSpec宣言型Agentを生成します。'
---
# TypeSpec宣言型Agentの作成

次の構造を持つMicrosoft 365 Copilot向けの完全なTypeSpec宣言型Agentを作成します。

## 要件

次の内容を含む`main.tsp`ファイルを生成します。

1. **Agent宣言**
   - 説明的な名前と説明を持つ`@agent`デコレーターを使う
   - 名前は100文字以内にする
   - 説明は1,000文字以内にする

2. **指示**
   - 明確な行動指針を持つ`@instructions`デコレーターを使う
   - Agentの役割、専門知識、人格を定義する
   - Agentがすべきことと、すべきでないことを指定する
   - 8,000文字未満に保つ

3. **会話スターター**
   - 2～4個の`@conversationStarter`デコレーターを含める
   - それぞれにタイトルとクエリ例を設定する
   - 多様な内容にし、異なる機能を示す

4. **機能**（ユーザーのニーズに基づく）
   - `WebSearch` - サイト範囲を任意に指定したWebコンテンツ検索
   - `OneDriveAndSharePoint` - URLフィルター付きのドキュメントアクセス
   - `TeamsMessages` - Teamsのチャネル／チャットへのアクセス
   - `Email` - フォルダーのフィルター付きメールアクセス
   - `People` - 組織内の人物検索
   - `CodeInterpreter` - Pythonコードの実行
   - `GraphicArt` - 画像生成
   - `GraphConnectors` - Copilot connectorのコンテンツへのアクセス
   - `Dataverse` - Dataverseデータへのアクセス
   - `Meetings` - 会議コンテンツへのアクセス

## テンプレート構造

```typescript
import "@typespec/http";
import "@typespec/openapi3";
import "@microsoft/typespec-m365-copilot";

using TypeSpec.Http;
using TypeSpec.M365.Copilot.Agents;

@agent({
  name: "[Agent Name]",
  description: "[Agent Description]"
})
@instructions("""
  [Detailed instructions about agent behavior, role, and guidelines]
""")
@conversationStarter(#{
  title: "[Starter Title 1]",
  text: "[Example query 1]"
})
@conversationStarter(#{
  title: "[Starter Title 2]",
  text: "[Example query 2]"
})
namespace [AgentName] {
  // Add capabilities as operations here
  op capabilityName is AgentCapabilities.[CapabilityType]<[Parameters]>;
}
```

## ベストプラクティス

- 説明的で役割に基づくAgent名を使う（例：「カスタマーサポートアシスタント」「リサーチ支援」）
- 指示は二人称で書く（「あなたは…です」）
- Agentの専門知識と制限を具体的にする
- 異なる機能を示す多様な会話スターターを含める
- Agentが実際に必要とする機能だけを含める
- 可能な場合は機能の範囲（URL、フォルダーなど）を限定して性能を高める
- 複数行の指示には三重引用符の文字列を使う

## 例

ユーザーに次の点を尋ねます。
1. Agentの目的と役割は何か。
2. どの機能が必要か。
3. どの知識ソースにアクセスすべきか。
4. 典型的なユーザーとのやり取りは何か。

その後、完全なTypeSpec Agent定義を生成します。

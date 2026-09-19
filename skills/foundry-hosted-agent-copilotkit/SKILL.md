---
name: foundry-hosted-agent-copilotkit
description: 'AG-UI プロトコル経由で Azure AI Foundry のホストエージェント上にある Microsoft Agent Framework エージェントと CopilotKit フロントエンドを組み合わせたエージェント型 Web アプリの継続的な開発を支援します。エージェントツールの追加とゲート、ヒューマンインザループ承認の接続、生成 UI と共有状態の構築、イベントストリームのデバッグ、1.0 未満のパッケージの安全なアップグレード、ホストエージェント更新のデプロイを扱います。'
---

# CopilotKit + AG-UI + Azure AI Foundry ホストエージェントを使った開発

このスキルは、このスタック上に構築された**既存アプリケーション**内での開発作業に使用してください。CopilotKitを使用するReact/Nextフロントエンド、AG-UIプロトコル経由で接続された Microsoft Agent Framework (MAF) エージェント (PythonまたはC#)、Azure AI Foundryホストエージェント (有料Azureサービス、使用によってコストが発生する場合があります) として実行されている、または開発中のエージェント。

新規プロジェクトをスキャフォールドするためにこのスキルを使用**しないでください**。専用スキャフォルダーが存在します (CopilotKit CLI、`azd ai agent init`)。それらを使用してから、以下の作業に戻ってください: ツールの追加、承認の背後への配置、生成型UI、共有状態、デバッグ、依存関係のアップグレード、エージェント更新のデプロイ。

## メンタルモデル

```text
CopilotKit hooks (React)            useFrontendTool / useHumanInTheLoop /
        │                           useRenderToolCall / useCoAgent
        ▼
CopilotKit Runtime (route handler)  agents: { <name>: new HttpAgent({ url }) }
        │  AG-UI events over SSE
        ▼
AG-UI endpoint                      ← WHERE this lives defines your architecture
        │
        ▼
MAF Agent (tools, approval modes)   → model deployment
```

最も重要な事実は以下の通りです: **デプロイされたFoundryホストエージェントエンドポイントは、デフォルトではAG-UIを話しません。** OpenAI Responsesエンドポイント (`.../protocols/openai/responses`) および/または raw `.../protocols/invocations` エンドポイントを公開します。AG-UIはどこかで生成する必要があり、それがどこで生成されるかは、すべての機能 (特にヒューマンインザループ) がどのように動作するかを決定します。3つのワイヤリングは [references/architecture.md](references/architecture.md) に記載されています。

## ワークフロー

このスタック上のすべてのタスクについて、以下の手順に従います:

1. **ワイヤリングを最初に特定してください。** 何かを変更する前にコードベースを検査してください:
   - `add_agent_framework_fastapi_endpoint(...)` (Python) または `MapAGUI(...)` (.NET) がインプロセスエージェントをラップしている → アーキテクチャA (インプロセスAG-UIエンドポイント)。
   - `protocol: invocations` が `agent.yaml` で宣言された、AG-UIを提供する独自のコンテナを持つホストエージェント → アーキテクチャB。
   - AG-UIエンドポイントと、ホストエージェントの `/responses` エンドポイント間を変換する別のサービス (`previous_response_id`、`mcp_approval_response`、またはコード内のFoundry `conversation` オブジェクトを探してください) → アーキテクチャC (変換ブリッジ)。
   - フロントエンドエージェント名を確認してください: ランタイム `agents` 設定内のキー、`<CopilotKit>` プロバイダー上の `agent` プロップ、および `agent.yaml` 内のホストエージェント名が、すべて一致する必要があります。
2. **ライブドキュメンテーションに基づいてください。** ここのすべてのレイヤーはpre-1.0またはプレビューであり、マイナーバージョン間で変わります。 暗記したAPIを信頼しないでください:
   - MAFとFoundryホストエージェント: Microsoft Docs MCPツールが利用可能な場合は使用してください、そうでなければlearn.microsoft.comを参照してください (`/agent-framework/integrations/ag-ui/`、`/azure/foundry/`)。
   - CopilotKit: docs.copilotkit.ai (Microsoft Agent Framework セクション)。インストールされた `@copilotkit/*` パッケージにバンドルされているTypeScript宣言に対してフックおよびランタイムAPI名を検証してください — 名前が変わっています (`useCopilotAction` はレガシー; 現在の名前は `useFrontendTool`、`useHumanInTheLoop`、`useRenderToolCall`、`useCoAgent` を含みます)。
   - AG-UIプロトコル: docs.ag-ui.com (イベント参照、dojoパターン)。
3. **タスクを実行してください** 以下のマッチングリファレンスを使用して。
4. **対抗的に検証してください。** コンパイルに成功したビルド、開始したdevサーバー、または1つの成功したチャット返信は、証明**ではありません**。このスキルの最後にある完了基準を適用してください。

## リファレンス

必要に応じてロードしてください。各々は自己完結しています:

| リファレンス | ロードするタイミング |
| --- | --- |
| [references/architecture.md](references/architecture.md) | ワイヤリングの選択または理解; ローカルとデプロイ済みモード; 変換ブリッジが存在する理由とそれが何を処理する必要があるか |
| [references/patterns.md](references/patterns.md) | 7つのAG-UIインタラクションパターン (フロントエンドツール、バックエンドツールレンダリング、HITL、生成型UI、共有状態、予測状態) のいずれかの実装 |
| [references/hitl.md](references/hitl.md) | ヒューマンインザループ承認の追加またはデバッグ、既知の重複実行ハザードを含む |
| [references/troubleshooting.md](references/troubleshooting.md) | いかなる失敗: 症状 → 根本原因 → すべてのレイヤーの修正テーブル |
| [references/upgrading.md](references/upgrading.md) | 任意の依存関係のバンプ; バージョン互換性ルール; 追跡されたアップストリームの問題 |
| [references/deploy-loop.md](references/deploy-loop.md) | `azd ai agent run` を使用してエージェントをローカルで実行、更新のデプロイ、デプロイメント落とし穴 |

## タスクプレイブック

### エージェントツールを追加または変更する

1. エージェント上でツールを定義します (Python の `@tool` ; .NET の `AIFunctionFactory.Create`) 型付きされた、説明のあるパラメータを使用します。
2. ドックストリングをグラウンディング安全に保つ: モデルが実データから導出する必要があるフィールドのパラメータ説明に具体的な例値を入れないでください — モデルはリテラル例をコピーします。プレースホルダーを使用し、ツール内で検証してください。
3. コンパクトで、モデルが消費可能な値を返します; リッチフォーマットはツール結果ではなくUIレンダーに属しています。
4. 承認モード: 副作用を持つツールは `approval_mode="always_require"` を取得します ([references/hitl.md](references/hitl.md) 参照); 読み取り専用ツールは制限されたままです。
5. ツール呼び出しをUIでレンダリングする必要がある場合、`useRenderToolCall` /renderエントリを追加します ([references/patterns.md](references/patterns.md) 参照)。
6. ライブで検証: チャットUIを通じてツールをトリガーし、呼び出しと結果ストリームを `TOOL_CALL_*` イベントとして確認し、名前を変更したまたは再型付けされたパラメータが、引数を解析するフロントエンドコンポーネントを破壊していないことを確認します。

### 既存ツールにヒューマンインザループをワイヤリングする

[references/hitl.md](references/hitl.md) を端から端まで実行します。概要: ツールをマークします (`approval_mode="always_require"` / `ApprovalRequiredAIFunction`)、AG-UIラッパーで確認を有効にします、フロントエンドに承認UIフックを登録します、レスポンスペイロード形状がサーバー検出が期待するものと一致するようにします。次に、承認**と**拒否**と**承認後のフォローアップターン (重複実行ハザード参照) をテストします。

### 生成型UIまたは共有状態を構築する

[references/patterns.md](references/patterns.md) 内のパターンテーブルに従います。正直性の注意を知ってください: 状態同期パターンはAG-UIアダプターがインプロセスエージェント (アーキテクチャA/B) をラップする場合、ネイティブです; Responsesプロトコルブリッジ経由 (アーキテクチャC) では、明示的な合成作業が必要です — 機能を約束する前に、コードベースが実際に何を実装しているかを確認してください。

### 壊れたフローをデバッグする

1. 最下層で最初に再現してください: AG-UIエンドポイントを `curl -N` で、最小限の `RunAgentInput` JSONボディで、および raw SSEイベントを読んでください。バグがそこで再現される場合、フロントエンドは無罪です。
2. ホストエージェントの場合、1層下に移動してください: エージェントの `/responses` エンドポイントを直接呼び出してください。既知の再実行バグがフレームワークではなくUIスタックに分離されたのは、これです。
3. 症状を [references/troubleshooting.md](references/troubleshooting.md) と照合してください — 正確なエラー文字列がリストされています。
4. 検証パス間でローカルで実行されているホストエージェント (`azd ai agent run`) を再起動します (エージェントがメモリ内状態を保持する場合); 古い状態はテストが正しい理由のためにパスしたり失敗したりします。

### 依存関係をアップグレードする

[references/upgrading.md](references/upgrading.md) に従います。単一パッケージを分離でアップバンプしないでください: バージョン関係ルール (ランタイム ↔ AG-UIクライアント、エージェントフレームワークライン一貫性、ホスティングプロトコル ↔ マニフェストバージョン) はそこに存在し、同時に保持される必要があり、かつローカルワークアラウンドは削除前にその追跡アップストリーム問題に対して再検証される必要があります。

### エージェント更新をデプロイする

[references/deploy-loop.md](references/deploy-loop.md) に従います: `azd ai agent run` を使用して実際のエージェントに対してローカルで反復してから、`azd deploy` (各デプロイは新しいエージェントバージョンを作成)、次にデプロイされたエージェント — 承認一時停止を含む — を検証してから、成功を宣言してください。

## 完了基準

このスタック上の変更は、これらが**すべて**満たされている場合にのみ完了しています:

1. 読み取り/クエリパスは実際のUI (curlのみではない) を通じて機能します。
2. すべての承認ゲートツールは両方の方法でテストされました: 承認 → ツールがサーバー側で実行され、状態が目に見えて変わります; 拒否 → ツールが実行されず、エージェントが確認します。
3. 少なくとも1つのフォローアップターンが同じスレッドで承認後に送信され、ゲート付きツールは再び無声で実行**されていません** ([references/hitl.md](references/hitl.md) 参照、重複実行ハザード)。
4. ツール呼び出しはストリーム終了時に正しくレンダリングされ、ストリーミング中だけではありません (メッセージスナップショットはライブイベントと異なる可能性があります)。
5. デプロイされた変更の場合: 上記のチェックはローカルだけではなく、デプロイされたエンドポイントに対して実行されました — デプロイ成功は動作の証明**ではありません**。

DOCUMENT END

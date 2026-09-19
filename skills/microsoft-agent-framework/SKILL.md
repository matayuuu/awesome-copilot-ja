---
name: microsoft-agent-framework
description: '共有ガイドラインと .NET / Python 向けの言語別リファレンスを用いて、Microsoft Agent Framework のソリューションを作成、更新、リファクタリング、説明、またはレビューする。'
---

# Microsoft Agent Framework

Microsoft Agent Framework を使ったアプリケーション、エージェント、ワークフロー、または移行作業に取り組むときに、このスキルを使用します。

Microsoft Agent Framework は Semantic Kernel と AutoGen の統合後継であり、それらの強みと新しい機能を組み合わせたものです。まだパブリック プレビュー段階であり、変更が速いため、古い知識に依存するのではなく、常に最新の公式ドキュメントとサンプルを根拠として実装のアドバイスを行ってください。

## まず対象言語を決定する

推奨事項やコード変更を行う前に、対象の言語ワークフローを選択してください。

1. リポジトリに `.cs`、`.csproj`、`.sln`、`.slnx`、またはその他の .NET プロジェクト ファイルが含まれている場合、またはユーザーが明示的に C# または .NET のガイダンスを求めている場合は、**.NET** ワークフローを使用します。[references/dotnet.md](references/dotnet.md) に従ってください。
2. リポジトリに `.py`、`pyproject.toml`、`requirements.txt` が含まれている場合、またはユーザーが明示的に Python のガイダンスを求めている場合は、**Python** ワークフローを使用します。[references/python.md](references/python.md) に従ってください。
3. リポジトリに両方のエコシステムが含まれている場合は、編集対象のファイルで使われている言語、またはユーザーが指定した対象言語に合わせてください。
4. 言語が曖昧な場合は、まず現在のワークスペースを確認してから、最も近い言語別のリファレンスを選択してください。

## 常に最新のドキュメントを参照する

- まず Microsoft Agent Framework の概要を確認してください: <https://learn.microsoft.com/agent-framework/overview/agent-framework-overview>
- 現在の API 面に対しては、公式ドキュメントとサンプルを優先してください。
- 利用可能な場合は Microsoft Docs MCP ツールを使って、最新のフレームワーク ガイダンスと例を取得してください。
- 古い Semantic Kernel または AutoGen のパターンは、デフォルトの実装モデルではなく、移行の入力として扱ってください。

## 共通ガイダンス

どの言語でも Microsoft Agent Framework を扱うときは、次を守ってください。

- エージェントとワークフローの操作には非同期パターンを使用します。
- 明示的なエラー処理とログを実装します。
- 強い型付け、明確なインターフェイス、保守しやすい構成パターンを優先します。
- Azure 認証が適切な場合は `DefaultAzureCredential` を使用します。
- 自律的な意思決定、臨機応変な計画立案、会話フロー、ツールの利用、MCP サーバーとの対話にはエージェントを使用します。
- 複数ステップのオーケストレーション、事前定義された実行グラフ、長時間実行タスク、人間参加型のシナリオにはワークフローを使用します。
- Azure AI Foundry、Azure OpenAI、OpenAI などのモデル プロバイダーをサポートしますが、ユーザーのニーズに合う場合は新規プロジェクトでは Azure AI Foundry サービスを優先してください。
- 問題に適合する場合は、スレッド ベースまたは同等の状態管理、コンテキスト プロバイダー、ミドルウェア、チェックポイント、ルーティング、オーケストレーション パターンを使用します。

## 移行ガイダンス

- Semantic Kernel から移行する場合は、公式の移行ガイドを使用してください: <https://learn.microsoft.com/agent-framework/migration-guide/from-semantic-kernel/>
- AutoGen から移行する場合は、公式の移行ガイドを使用してください: <https://learn.microsoft.com/agent-framework/migration-guide/from-autogen/>
- まず既存の動作を維持し、その後にネイティブな Agent Framework パターンを段階的に採用してください。

## ワークフロー

1. 対象言語を特定し、対応するリファレンス ファイルを読みます。
2. 実装の選択を行う前に、最新の公式ドキュメントとサンプルを取得します。
3. このスキルに含まれる共通のエージェントとワークフローのガイダンスを適用します。
4. 選択したリファレンスに含まれる言語固有のパッケージ、リポジトリ、サンプル パス、コーディング実践を使用します。
5. リポジトリ内の例が現在のドキュメントと異なる場合は、その違いを説明したうえで、現在サポートされているパターンに従ってください。

## リファレンス

- [.NET リファレンス](references/dotnet.md)
- [Python リファレンス](references/python.md)

## 完了条件

- 推奨事項が対象言語と一致していること。
- パッケージ名、リポジトリ パス、サンプルの場所が選択したエコシステムと一致していること。
- ガイダンスが、レガシーな前提ではなく、現在の Microsoft Agent Framework のドキュメントを反映していること。
- 移行のアドバイスで Semantic Kernel と AutoGen を言及するのは、関連がある場合のみであること。

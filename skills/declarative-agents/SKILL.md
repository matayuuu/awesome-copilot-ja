---
name: declarative-agents
description: '3 つの包括的なワークフロー（基本、高度、検証）、TypeSpec 対応、Microsoft 365 Agents Toolkit 統合を備えた Microsoft 365 Copilot declarative agent の完全な開発キット'
---

# Microsoft 365 Declarative Agents 開発キット

最新の v1.5 スキーマを使用し、TypeSpec と Microsoft 365 Agents Toolkit を包括的に統合した Microsoft 365 Copilot declarative agent の作成と開発を支援します。3 つの専門ワークフローから選択してください。

## ワークフロー 1: 基本的なエージェント作成
**最適な用途**: 新しい開発者、単純なエージェント、迅速なプロトタイプ

次の手順を案内します。
1. **エージェント計画**: 目的、対象ユーザー、主要機能を定義する
2. **機能の選択**: 利用可能な 11 の機能（WebSearch、OneDriveAndSharePoint、GraphConnectors など）から選ぶ
3. **基本スキーマの作成**: 適切な制約を備えた準拠 JSON manifest を生成する
4. **TypeSpec の選択肢**: JSON にコンパイルされるモダンで型安全な定義を作成する
5. **テストのセットアップ**: ローカルテスト用に Agents Playground を構成する
6. **Toolkit 統合**: Microsoft 365 Agents Toolkit を活用して開発を強化する

## ワークフロー 2: 高度なエンタープライズエージェント設計
**最適な用途**: 複雑なエンタープライズシナリオ、本番デプロイ、高度な機能

次の設計を支援します。
1. **エンタープライズ要件分析**: マルチテナントの考慮事項、コンプライアンス、セキュリティ
2. **高度な機能構成**: 複雑な機能の組み合わせと相互作用
3. **動作オーバーライドの実装**: カスタム応答パターンと専門的な動作
4. **ローカライズ戦略**: 適切なリソース管理を備えた多言語対応
5. **会話スターター**: ユーザーエンゲージメントのための戦略的な会話開始点
6. **本番デプロイ**: 環境管理、バージョン管理、ライフサイクル計画
7. **監視と分析**: 追跡とパフォーマンス最適化の実装

## ワークフロー 3: 検証と最適化
**最適な用途**: 既存エージェント、トラブルシューティング、パフォーマンス最適化

次を実施します。
1. **スキーマ準拠検証**: v1.5 仕様への完全な準拠を確認する
2. **文字数制限の最適化**: name（100）、description（1000）、instructions（8000）
3. **機能監査**: 機能が適切に構成、使用されていることを確認する
4. **TypeSpec 移行**: 既存 JSON をモダンな TypeSpec 定義に変換する
5. **テストプロトコル**: Agents Playground を使って包括的に検証する
6. **パフォーマンス分析**: ボトルネックと最適化の機会を特定する
7. **ベストプラクティスレビュー**: Microsoft のガイドラインと推奨事項への整合性を確認する

## すべてのワークフローに共通する主要機能

### Microsoft 365 Agents Toolkit 統合
- **VS Code 拡張機能**: `teamsdevapp.ms-teams-vscode-extension` との完全な統合
- **TypeSpec 開発**: モダンで型安全なエージェント定義
- **ローカルデバッグ**: テスト用の Agents Playground 統合
- **環境管理**: 開発、ステージング、本番の構成
- **ライフサイクル管理**: 作成、テスト、デプロイ、監視

### TypeSpec の例
```typespec
// Modern declarative agent definition
model MyAgent {
  name: string;
  description: string;
  instructions: string;
  capabilities: AgentCapability[];
  conversation_starters?: ConversationStarter[];
}
```

### JSON Schema v1.5 の検証
- 最新の Microsoft 仕様への完全準拠
- 文字数制限の適用（name: 100、description: 1000、instructions: 8000）
- 配列制約の検証（conversation_starters: 最大 4、capabilities: 最大 5）
- 必須フィールドの検証と型チェック

### 利用可能な機能（最大 5 つ選択）
1. **WebSearch**: インターネット検索機能
2. **OneDriveAndSharePoint**: ファイルとコンテンツへのアクセス
3. **GraphConnectors**: エンタープライズデータ統合
4. **MicrosoftGraph**: Microsoft 365 サービス統合
5. **TeamsAndOutlook**: コミュニケーションプラットフォームへのアクセス
6. **PowerPlatform**: Power Apps と Power Automate の統合
7. **BusinessDataProcessing**: エンタープライズデータ分析
8. **WordAndExcel**: ドキュメントとスプレッドシートの操作
9. **CopilotForMicrosoft365**: 高度な Copilot 機能
10. **EnterpriseApplications**: サードパーティシステム統合
11. **CustomConnectors**: カスタム API とサービスの統合

### 環境変数のサポート
```json
{
  "name": "${AGENT_NAME}",
  "description": "${AGENT_DESCRIPTION}",
  "instructions": "${AGENT_INSTRUCTIONS}"
}
```

**どのワークフローから始めますか？** 要件を共有してください。TypeSpec と Microsoft 365 Agents Toolkit を完全にサポートした、Microsoft 365 Copilot declarative agent 開発向けの専門的なガイダンスを提供します。

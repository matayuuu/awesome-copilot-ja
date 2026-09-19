---
name: mcp-deploy-manage-agents
description: 'Microsoft 365管理センターで、ガバナンス、割り当て、組織配布を伴うMCPベース宣言型エージェントをデプロイ・管理する。'
---

````prompt
---
mode: 'agent'
tools: ['changes', 'search/codebase', 'edit/editFiles', 'problems']
description: 'Microsoft 365管理センターでガバナンス、割り当て、組織配布を伴うMCPベース宣言型エージェントをデプロイ・管理する'
model: 'gpt-4.1'
tags: [mcp, m365-copilot, deployment, admin, agent-management, governance]
---

# MCPベースエージェントのデプロイと管理

管理センターを使って、組織への配布と制御を目的にMicrosoft 365のMCPベース宣言型エージェントをデプロイ、管理、ガバナンスする。

## エージェントの種類

### 組織による公開
- 定義済みの指示とアクションで構築される
- 予測可能なタスクのために構造化されたロジックに従う
- 管理者の承認と公開プロセスが必要
- コンプライアンスとガバナンスの要件をサポートする

### 作成者による共有
- Microsoft 365 Copilot StudioまたはAgent Builderで作成される
- 特定のユーザーへ直接共有される
- 検索、アクション、コネクター、APIで機能を拡張できる
- エージェントレジストリで管理者に表示される

### Microsoft Agents
- Microsoftが開発・保守する
- Microsoft 365サービスと統合される
- 事前承認済みで、そのまま利用できる

### 外部パートナーエージェント
- 検証済みの外部開発者／ベンダーが作成する
- 管理者の承認と制御の対象となる
- 利用可否と権限を構成できる

### Frontier Agents
- 実験的または高度な機能
- 限定的なロールアウトや追加監督が必要になる場合がある
- 例:
  - **App Builder agent**: M365 CopilotまたはPower Platform admin centerで管理
  - **Workflows agent**: Power Platform admin centerで管理するフロー自動化

## 管理者ロールと権限

### 必須ロール
- **AI Admin**: 完全なエージェント管理機能
- **Global Reader**: 閲覧専用アクセス（編集不可）

### ベストプラクティス
- 権限が最も少ないロールを使う
- Global Administratorは緊急時に限定する
- 最小権限の原則に従う

## Microsoft 365管理センターでのエージェント管理

### エージェント管理へのアクセス
1. [Microsoft 365 admin center](https://admin.microsoft.com/)を開く
2. **Agents**ページへ移動する
3. 利用可能、デプロイ済み、またはブロック済みのエージェントを表示する

### 利用可能な操作

**エージェントを表示**
- 可用性（available、deployed、blocked）でフィルターする
- 特定のエージェントを検索する
- エージェントの詳細（名前、作成者、日付、ホスト製品、状態）を表示する

**エージェントをデプロイ**
配布の選択肢:
1. **Agent Store**: 検証と一般公開のためPartner Centerへ提出する
2. **Organization Deployment**: IT管理者が全従業員または選択した従業員へデプロイする

**エージェントのライフサイクルを管理**
- **Publish**: エージェントを組織で利用可能にする
- **Deploy**: 特定のユーザーまたはグループへ割り当てる
- **Block**: エージェントの利用を禁止する
- **Remove**: 組織からエージェントを削除する

**アクセスを構成**
- 特定のユーザーグループに対する可用性を設定する
- エージェントごとの権限を管理する
- Copilotに表示するエージェントを制御する

## デプロイワークフロー

### 組織へ公開

**エージェント開発者向け:**
1. Microsoft 365 Agents Toolkitでエージェントを構築する
2. 開発環境で十分にテストする
3. エージェントを承認に提出する
4. 管理者レビューを待つ

**管理者向け:**
1. 管理センターで提出されたエージェントを確認する
2. コンプライアンスとセキュリティを検証する
3. 組織での利用を承認する
4. デプロイ設定を構成する
5. 選択したユーザーまたは組織全体へ公開する

### Agent Store経由でデプロイ

**開発者の手順:**
1. エージェントの開発とテストを完了する
2. 提出用にエージェントをパッケージ化する
3. Partner Centerへ提出する
4. 検証プロセスを待つ
5. 承認通知を受け取る
6. エージェントがCopilot storeに表示される

**管理者の手順:**
1. Copilot storeでエージェントを見つける
2. エージェントの詳細と権限を確認する
3. 組織またはユーザーグループへ割り当てる
4. 利用状況とフィードバックを監視する

### 組織エージェントをデプロイ

**管理者によるデプロイの選択肢:**
```
組織全体:
- Copilotライセンスを持つ全従業員
- Copilotで自動的に利用可能

グループベース:
- 特定の部門またはチーム
- セキュリティグループへの割り当て
- ロールベースのアクセス制御
```

**構成手順:**
1. 管理センターのAgentsページへ移動する
2. デプロイするエージェントを選択する
3. デプロイ範囲を選択する:
   - All users
   - Specific security groups
   - Individual users
4. 可用性の状態を設定する
5. 必要に応じて権限を構成する
6. デプロイして監視する

## ユーザー体験

### エージェントの検出
ユーザーは次の場所でエージェントを見つける:
- Microsoft 365 Copilot hub
- Agent picker in Copilot interface
- Organization's agent catalog

### エージェントのアクセス制御
ユーザーは次の操作を行える:
- 対話中にエージェントをオン／オフにする
- 自分のエクスペリエンスにエージェントを追加／削除する
- エージェントを右クリックして設定を管理する
- 管理者が許可したエージェントだけにアクセスする

### エージェントの利用
- エージェントはCopilotのサイドバーに表示される
- ユーザーがコンテキスト用のエージェントを選択する
- クエリは選択したエージェント経由で処理される
- 応答はエージェントの機能を活用する

## ガバナンスとコンプライアンス

### セキュリティ上の考慮事項
- **データアクセス**: エージェントがアクセスできるデータを確認する
- **API権限**: 必要なスコープを検証する
- **認証**: 安全なOAuthフローを確保する
- **外部接続**: 外部統合のリスクを評価する

### コンプライアンス要件
- **データ所在地**: データが境界内に留まることを確認する
- **プライバシーポリシー**: エージェントのプライバシー声明を確認する
- **利用規約**: 許容される利用ポリシーを検証する
- **監査ログ**: エージェントの利用と活動を監視する

### 監視とレポート
追跡対象:
- エージェントの導入率
- ユーザーフィードバックと満足度
- エラー率と性能
- セキュリティインシデントまたは違反

## MCP固有の管理

### MCPエージェントの特性
- Model Context Protocolで外部システムに接続する
- MCPサーバーが公開するツールを使う
- OAuth 2.0またはSSO認証を必要とする
- REST APIエージェントと同じガバナンスをサポートする

### MCPエージェントの検証
確認対象:
- MCPサーバーURLにアクセスできる
- 認証構成が安全である
- インポートしたツールが適切である
- 応答データが機密情報を公開しない
- サーバーがセキュリティのベストプラクティスに従う

### MCPエージェントのデプロイ
REST APIエージェントと同じプロセス:
1. Review in admin center
2. Validate MCP server compliance
3. Test authentication flow
4. Deploy to users/groups
5. Monitor performance

## エージェント設定

### Organizational Settings
テナントレベルで構成する:
- Enable/disable agent creation
- Set default permissions
- Configure approval workflows
- Define compliance policies

### Per-Agent Settings
個別のエージェントに構成する:
- Availability (on/off)
- User assignment (all/groups/individuals)
- Permission scopes
- Usage limits or quotas

### Environment Routing
Power Platformベースのエージェントでは:
- Configure default environment
- Enable environment routing for Copilot Studio
- Manage flows via Power Platform admin center

## 共有エージェントの管理

### View Shared Agents
管理者は次を確認できる:
- List of all shared agents
- Creator information
- Creation date
- Host products
- Availability status

### Manage Shared Agents
管理者の操作:
- Search for specific shared agents
- View agent capabilities
- Block unsafe or non-compliant agents
- Monitor agent lifecycle

### User Access to Shared Agents
ユーザーは次を通じてアクセスする:
- Microsoft 365 Copilot on various surfaces
- Agent-specific tasks and assistance
- Creator-defined capabilities

## ベストプラクティス

### Before Deployment
- **Pilot test** with small user group
- **Gather feedback** from early adopters
- **Validate security** and compliance
- **Document** agent capabilities and limitations
- **Train users** on agent usage

### During Deployment
- **Phased rollout** to manage adoption
- **Monitor performance** and errors
- **Collect feedback** continuously
- **Address issues** promptly
- **Communicate** availability to users

### Post-Deployment
- **Track metrics**: Adoption, satisfaction, errors
- **Iterate**: Improve based on feedback
- **Update**: Keep agent current with new features
- **Retire**: Remove obsolete or unused agents
- **Review**: Regular security and compliance audits

### Communication
- Announce new agents to users
- Provide documentation and examples
- Share best practices and use cases
- Highlight benefits and capabilities
- Offer support channels

## トラブルシューティング

### Agent Not Appearing
- Check deployment status in admin center
- Verify user is in assigned group
- Confirm agent is not blocked
- Check user has Copilot license
- Refresh Copilot interface

### Authentication Failures
- Verify OAuth credentials are valid
- Check user has necessary permissions
- Confirm MCP server is accessible
- Test authentication flow independently

### Performance Issues
- Monitor MCP server response times
- Check network connectivity
- Review error logs in admin center
- Validate agent isn't rate-limited

### Compliance Violations
- Block agent immediately if unsafe
- Review audit logs for violations
- Investigate data access patterns
- Update policies to prevent recurrence

## リソース

- [Microsoft 365 admin center](https://admin.microsoft.com/)
- [Power Platform admin center](https://admin.powerplatform.microsoft.com/)
- [Partner Center](https://partner.microsoft.com/) for agent submissions
- [Microsoft Agent 365 Overview](https://learn.microsoft.com/en-us/microsoft-agent-365/overview)
- [Agent Registry Documentation](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/agent-registry)

## ワークフロー

ユーザーに確認する:
1. Is this agent ready for deployment or still in development?
2. Who should have access (all users, specific groups, individuals)?
3. Are there compliance or security requirements to address?
4. Should this be published to the organization or the public store?
5. What monitoring and reporting is needed?

その後、次を提供する:
- 手順形式のデプロイガイド
- 管理センターの構成手順
- ユーザー割り当ての推奨事項
- ガバナンスとコンプライアンスのチェックリスト
- 監視とレポート計画

````

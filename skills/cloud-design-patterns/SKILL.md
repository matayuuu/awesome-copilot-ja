---
name: cloud-design-patterns
description: '信頼性、パフォーマンス、メッセージング、セキュリティ、デプロイの各カテゴリにわたる業界標準の42パターンを扱う、分散システムアーキテクチャ向けクラウド設計パターン。分散システムアーキテクチャを設計、レビュー、実装するときに使用する。'
---

# クラウド設計パターン

アーキテクトは、機能要件と非機能要件の両方を満たすために、プラットフォームサービス、機能、コードを統合してワークロードを設計します。効果的なワークロードを設計するには、これらの要件を理解し、ワークロードの制約がもたらす課題に対応できるトポロジと方法論を選択する必要があります。クラウド設計パターンは、多くの一般的な課題に対する解決策を提供します。

システム設計は、確立された設計パターンに大きく依存します。これらのパターンを組み合わせることで、インフラストラクチャ、コード、分散システムを設計できます。クラウド上で信頼性、安全性、コスト効率、運用効率、パフォーマンスに優れたアプリケーションを構築するうえで、これらのパターンは極めて重要です。

以下のクラウド設計パターンは特定の技術に依存しないため、あらゆる分散システムに適用できます。Azure、その他のクラウドプラットフォーム、オンプレミス構成、ハイブリッド環境で利用できます。

## クラウド設計パターンが設計プロセスを向上させる仕組み

クラウドワークロードは、分散システムの動作に関する一般的ではあるものの誤った思い込みである「分散コンピューティングの誤謬」の影響を受けやすくなります。たとえば、次のような誤謬があります。

- ネットワークは信頼できる。
- レイテンシはゼロである。
- 帯域幅は無限である。
- ネットワークは安全である。
- トポロジは変化しない。
- 管理者は1人である。
- コンポーネントのバージョン管理は単純である。
- 可観測性の実装は後回しにできる。

こうした誤解は、欠陥のあるワークロード設計につながる可能性があります。設計パターンは誤解そのものをなくすものではありませんが、問題への認識を高め、補完戦略や軽減策を提供します。各クラウド設計パターンにはトレードオフがあります。実装方法ではなく、特定のパターンを選ぶ理由に注目してください。

---

## 参考資料

| 参考資料 | 読み込む場面 |
|---|---|
| [信頼性と回復性のパターン](references/reliability-resilience.md) | Ambassador、Bulkhead、Circuit Breaker、Compensating Transaction、Retry、Health Endpoint Monitoring、Leader Election、Saga、Sequential Convoy |
| [パフォーマンスパターン](references/performance.md) | Async Request-Reply、Cache-Aside、CQRS、Index Table、Materialized View、Priority Queue、Queue-Based Load Leveling、Rate Limiting、Sharding、Throttling |
| [メッセージングと統合のパターン](references/messaging-integration.md) | Choreography、Claim Check、Competing Consumers、Messaging Bridge、Pipes and Filters、Publisher-Subscriber、Scheduler Agent Supervisor |
| [アーキテクチャと設計のパターン](references/architecture-design.md) | Anti-Corruption Layer、Backends for Frontends、Gateway Aggregation／Offloading／Routing、Sidecar、Strangler Fig |
| [デプロイと運用のパターン](references/deployment-operational.md) | Compute Resource Consolidation、Deployment Stamps、External Configuration Store、Geode、Static Content Hosting |
| [セキュリティパターン](references/security.md) | Federated Identity、Quarantine、Valet Key |
| [イベント駆動アーキテクチャパターン](references/event-driven.md) | Event Sourcing |
| [ベストプラクティスとパターン選択](references/best-practices.md) | 適切なパターンの選択、Well-Architected Frameworkとの整合、ドキュメント化、監視 |
| [Azureサービスの対応関係](references/azure-service-mappings.md) | 各パターンカテゴリで一般的なAzureサービス |

---

## パターンカテゴリ一覧

| カテゴリ | パターン数 | 主な対象 |
|---|---|---|
| 信頼性と回復性 | 9パターン | フォールトトレランス、自己修復、グレースフルデグラデーション |
| パフォーマンス | 10パターン | キャッシュ、スケーリング、負荷管理、データ最適化 |
| メッセージングと統合 | 7パターン | 疎結合化、イベント駆動通信、ワークフロー調整 |
| アーキテクチャと設計 | 7パターン | システム境界、APIゲートウェイ、移行戦略 |
| デプロイと運用 | 5パターン | インフラストラクチャ管理、地理分散、構成 |
| セキュリティ | 3パターン | ID、アクセス制御、コンテンツ検証 |
| イベント駆動アーキテクチャ | 1パターン | イベントソーシングと監査証跡 |

## 外部リンク

- [Cloud Design Patterns - Azure Architecture Center](https://learn.microsoft.com/azure/architecture/patterns/)
- [Azure Well-Architected Framework](https://learn.microsoft.com/azure/architecture/framework/)

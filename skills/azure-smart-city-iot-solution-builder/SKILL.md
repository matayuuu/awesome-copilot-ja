---
name: azure-smart-city-iot-solution-builder
description: 'Azure IoT と Smart City のエンドツーエンド ソリューションを設計・計画します。要件、アーキテクチャ、セキュリティ、運用、コスト、具体的な実装成果物を含む段階的な提供計画を扱います。'
---

# Azure Smart City IoT Solution Builder

このSkillを使って、Azure IoT と Smart City ソリューションの完全なワークフローを再構築し、標準化します。

## 使用する場面

次のような依頼を受けた場合にこのSkillを使用します:

- "I want to build an IoT solution on Azure"
- "Smart City architecture for traffic, lighting, or waste"
- "How do I connect devices, analytics, and alerts?"
- "I need a roadmap and backlog for an urban platform"

## 目的

- 高レベルのアイデアをデプロイ可能なアーキテクチャに変換する。
- 可能な限り既存の Azure に特化したSkillを再利用する。
- チームが実装できる具体的な成果物を作成する。

## ワークフロー

### 0) 必須ドキュメントレビュー（アーキテクチャを検討する前）

エッジ コンピューティングに関係するアーキテクチャまたは技術的な判断を提案する前に、まず Azure IoT Edge のドキュメントを確認します:

- https://learn.microsoft.com/azure/iot-edge/

最低限確認するページ:

- What is Azure IoT Edge
- Runtime architecture
- Supported systems
- Version history/release notes
- Relevant Linux/Windows quickstarts for the scenario

ドキュメントを参照できない場合は、そのことを明示し、仮定を明確に示して続行します。

### 1) スコープと制約

次の情報を収集して確認します:

- City domain: mobility, parking, air quality, water, energy, public safety, waste, etc.
- Scale: number of devices, telemetry frequency, retention, regions.
- Latency and availability objectives.
- Regulatory and privacy constraints.
- Existing systems to integrate (SCADA, GIS, ERP, ticketing, APIs).

### 2) 能力マップ

プラットフォームを次のレイヤーに分割します:

- Device and edge: onboarding, identity, firmware, OTA, edge processing.
- Ingestion and messaging: command and control, event routing, buffering.
- Data and analytics: hot path vs cold path, dashboards, historical analysis.
- Operations: observability, incident flow, SLOs.
- Governance: RBAC, secrets, policies, network isolation.

### 3) Azure サービスの選択（参考）

- Device connectivity: Azure IoT Hub, Azure IoT Operations, IoT Edge.
- Event streaming: Event Hubs, Service Bus, Event Grid.
- Storage: Blob Storage, Data Lake, Cosmos DB, SQL.
- Analytics: Azure Data Explorer, Stream Analytics, Fabric/Synapse.
- APIs and applications: API Management, App Service, Container Apps, Functions.
- Monitoring: Azure Monitor, Application Insights, Log Analytics.
- Security: Key Vault, Defender for IoT, Private Endpoints, Managed Identity.

### 4) 非機能設計

次の事項を定義して文書化します:

- Reliability model (zones/regions, retries, dead-letter handling, replay).
- Security controls (zero trust, encryption, secret rotation, least privilege).
- Cost controls (retention tiers, rightsizing, autoscaling, workload scheduling).
- Data lifecycle (raw, curated, aggregated, archived).

### 5) 提供計画

段階的な実行計画を作成します:

- Phase 1: Pilot district or single use case.
- Phase 2: Multi-domain integration.
- Phase 3: City-scale rollout and optimization.

各フェーズに次の内容を含めます:

- Exit criteria
- Dependencies
- Risks and mitigations
- KPI set

## まず他のSkillを再利用する

Skillには2つのソースがあります:

- Runtime-provided skills (external to this repository): only available when the Copilot host environment exposes them.
- Local repository skills (this repository): available as local files under `skills/`.

### ランタイム提供の Azure Skill（任意）

実行環境で利用可能な場合は、より深いガイダンスのために次の専門Skillへ委譲します:

- `azure-kubernetes`
- `azure-messaging`
- `azure-observability`
- `azure-storage`
- `azure-rbac`
- `azure-cost`
- `azure-validate`
- `azure-deploy`

### ローカル リポジトリの代替（このリポジトリで使用）

ランタイム Skill が利用できない場合は、このリポジトリにある既存のローカル Skill を優先します:

- `azure-architecture-autopilot` for architecture generation and refinement.
- `azure-resource-visualizer` for resource relationship diagrams.
- `azure-role-selector` for role selection guidance.
- `az-cost-optimize` and `azure-pricing` for cost and pricing analysis.
- `azure-deployment-preflight` for pre-deployment checks.
- `appinsights-instrumentation` for telemetry instrumentation patterns.

専門 Skill が利用できない場合は、このSkillで続行し、仮定を明示します。

## 必須の出力成果物

常に次の出力を提供します:

1. Smart City solution summary (scope, assumptions, constraints).
2. Reference architecture (components and data flow).
3. Security and governance checklist.
4. Cost and scaling strategy.
5. Phased implementation backlog (epics and milestones).

## 出力テンプレート

各シナリオの出力を標準化するため、`references/smart-city-solution-template.md` を使用し、次の応答構成にします:

1. Context and objectives
2. Proposed architecture
3. Technology decisions and trade-offs
4. Security, operations, and cost controls
5. Phased implementation plan
6. Risks and open questions

## ガイドライン

- 前提条件を検証する前にデプロイへ進まない。
- 重要な都市ワークロードに単一リージョンの本番構成を推奨しない。
- 運用責任（インシデント、SLA、変更時間帯を誰が担当するか）を省略しない。
- 仮定と確認済みの事実を明確に分ける。

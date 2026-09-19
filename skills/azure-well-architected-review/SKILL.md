---
name: azure-well-architected-review
description: '現在のワークロードの IaC とアーキテクチャに対して Azure Well-Architected Framework レビューを実施し、改善のための指摘事項と GitHub issue を作成します。'
---

# Azure Well-Architected レビュー

このワークフローは、ワークロードの IaC ファイルとデプロイ済みインフラストラクチャに対して、構造化された Azure Well-Architected Framework (WAF) レビューを実施します。5 つすべての WAF の柱にまたがるリスクを特定し、修復を追跡する GitHub issue を作成します。

## 前提条件
- Azure CLI (`az`) が構成され、認証済みであること
- リポジトリに IaC ファイル（Bicep、Terraform、または ARM テンプレート）が存在すること
- GitHub MCP server が構成され、認証済みであること

## ワークフローの手順

### Step 1: Well-Architected Framework のリファレンスを読み込む
最新の Azure WAF ベスト プラクティスを取得します:
- `https://learn.microsoft.com/en-us/azure/well-architected/`
- Service guides for the Azure services in use (`https://learn.microsoft.com/en-us/azure/well-architected/service-guides/`)
- Workload-specific guidance relevant to the workload type (SaaS, mission-critical, AI, etc.)

`microsoft.docs.mcp` MCP server が利用可能な場合は、それを使って最新の柱別チェックリストとサービス固有の推奨事項を検索します。

### Step 2: IaC とアーキテクチャを検出する
レビューのスコープを確定し、コードと実環境の両方をインベントリ化します:

1. **Azure のスコープを確認する**: 対象となるサブスクリプション/リソース グループをユーザーに尋ねるか、IaC パラメーターから推測して確認する。
2. **リポジトリから IaC ファイルを検索する**:
   - Bicep: `**/*.bicep`, `bicepconfig.json`
   - Terraform: `**/*.tf` (azurerm/azapi providers)
   - ARM templates: `**/azuredeploy*.json`, `**/*.template.json`, files with `$schema` containing `deploymentTemplate`
3. **実環境のリソースをインベントリ化する**（IaC がある場合も必ず実施）: `az resource list --resource-group <rg> --output json`（またはサブスクリプション全体）と、柱別チェックに必要な構成詳細を取得する対象を絞った `az <service> show` を実行する。
4. **IaC と実環境のインベントリを比較する**: ドリフトを記録する。Azure に存在するが IaC にないリソース（ポータルで作成）、IaC に定義されているがデプロイされていないリソース、構成の不一致を対象とする。ドリフトの指摘事項を Step 3 用に記録する（通常は Operational Excellence の柱に対応する）。

使用中の主要な Azure サービス（コンピューティング、データ、ネットワーク、セキュリティ、可観測性）を特定し、Mermaid アーキテクチャ図を生成します。

### Step 3: 柱ごとのレビュー

#### 柱 1: Reliability
- [ ] Availability zones enabled for zonal services (VMs, VMSS, AKS node pools, App Service, SQL, Storage ZRS)
- [ ] Production SKUs support the required SLA (no Basic/Free tiers on critical paths)
- [ ] Azure SQL / Cosmos DB backup and point-in-time restore configured with appropriate retention
- [ ] Geo-redundancy configured where RPO requires it (GRS/RA-GRS storage, SQL failover groups, Cosmos DB multi-region)
- [ ] Autoscale rules configured for App Service plans, VMSS, AKS (no fixed single instance for production)
- [ ] Health probes configured on Load Balancer / Application Gateway / Front Door backends
- [ ] Dead-lettering enabled for Service Bus queues/subscriptions and Event Grid subscriptions
- [ ] Retry policies with exponential backoff implemented for transient fault handling
- [ ] Disaster recovery plan defined (documented RTO/RPO, tested failover)

#### 柱 2: Security
- [ ] Managed identities used instead of service principals with secrets or connection strings
- [ ] No hardcoded credentials, keys, or connection strings in IaC or code
- [ ] Secrets stored in Azure Key Vault with RBAC authorization (not access policies)
- [ ] Storage accounts deny public blob access and disallow shared key access where possible
- [ ] Private endpoints (or at minimum service endpoints + firewall rules) for PaaS data services
- [ ] NSGs restrict inbound traffic to minimum required ports/CIDRs (no `*` → `*` allow rules)
- [ ] TLS 1.2+ enforced on all endpoints (`minimumTlsVersion`, `httpsOnly`)
- [ ] Azure RBAC follows least privilege (no Owner/Contributor at subscription scope for workload identities)
- [ ] Microsoft Defender for Cloud enabled on relevant resource types (`az security pricing list`)
- [ ] Azure WAF (Application Gateway or Front Door) configured for public-facing web endpoints
- [ ] Diagnostic settings send security logs to Log Analytics / Microsoft Sentinel

#### 柱 3: Cost Optimization
- [ ] Reservations or savings plans evaluated for steady-state compute (VMs, App Service, SQL)
- [ ] Storage lifecycle management policies move blobs to cool/archive tiers
- [ ] Right-sized SKUs based on actual utilization (no oversized VMs/App Service plans)
- [ ] Dev/test environments use auto-shutdown schedules and Dev/Test pricing where eligible
- [ ] Azure Budgets and cost alerts configured (`az consumption budget list`)
- [ ] Unattached managed disks and orphaned public IPs identified and removed
- [ ] Consumption/serverless tiers used for spiky or low-volume workloads (Functions, Container Apps, SQL serverless)
- [ ] Log Analytics retention and data-cap settings tuned to avoid ingestion overruns

#### 柱 4: Operational Excellence
- [ ] All infrastructure defined as IaC (no manual portal changes; deny assignments or policy where feasible)
- [ ] Consistent tagging strategy applied across all resources (owner, environment, cost center)
- [ ] Azure Monitor alerts defined for key metrics and service health
- [ ] Automated deployment pipeline present (GitHub Actions / Azure Pipelines, no manual deployments)
- [ ] Azure Activity Log and resource diagnostic settings routed to Log Analytics
- [ ] Application Insights (or OpenTelemetry equivalent) instrumented for application workloads
- [ ] Azure Policy assignments enforce organizational standards (allowed locations, SKUs, tags)
- [ ] Runbooks or operational documentation present

#### 柱 5: Performance Efficiency
- [ ] Right-sized compute SKUs validated against load requirements
- [ ] Caching implemented where beneficial (Azure Cache for Redis, CDN/Front Door caching)
- [ ] Azure Front Door or CDN used for global static content delivery
- [ ] Autoscale based on load metrics rather than fixed instance counts
- [ ] Database performance tier appropriate (DTU vs vCore, elastic pools, Cosmos DB RU autoscale)
- [ ] Premium/zone-redundant storage used for latency-sensitive disk workloads
- [ ] Connection pooling and async patterns used for database and HTTP clients

### Step 4: リスクを分類する
各指摘事項を次のように分類します:
- **High Risk**: Security vulnerability, single point of failure, no backup/recovery
- **Medium Risk**: Suboptimal reliability, cost inefficiency, performance concern
- **Low Risk**: Best practice deviation, minor optimization opportunity

### Step 5: ユーザー確認

```
🏗️ Azure Well-Architected Review Summary

📊 Review Results:
• IaC Files Analyzed: X
• Azure Services Identified: Y
• Total Findings: Z
  • High Risk: A (immediate action required)
  • Medium Risk: B (should address soon)
  • Low Risk: C (nice to have)

🔴 Top High Risk Findings:
1. [Pillar]: [Finding] — [Why it matters]
2. [Pillar]: [Finding] — [Why it matters]

💡 This will create Z individual GitHub issues + 1 EPIC issue.

❓ Proceed with creating GitHub issues? (y/n)
```

**ゲート**: ユーザーが明示的に肯定（例: "y"、"yes"）した場合のみ Steps 6–7 に進みます。否定、曖昧、または応答がない場合は、GitHub issue を **作成せず**、指摘事項全体を整形済み Markdown としてコンソールに出力して停止します。

### Step 6: 個別の指摘事項 issue を作成する
"well-architected" と柱の名前（例: "security"、"reliability"）でラベル付けします。

**タイトル**: `[WAF-<PILLAR>] [Brief Finding] — [Risk Level]`

**Body**:
````markdown
## 🏗️ Well-Architected Finding: [Brief Title]

**Pillar**: [Name] | **Risk Level**: [High/Medium/Low] | **Effort**: [Low/Medium/High]

### 📋 Description
[Clear explanation of the finding and why it matters]

### 🔧 Remediation

**IaC Fix** (preferred):
```bicep
// Bicep example
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  sku: { name: 'Standard_ZRS' }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    supportsHttpsTrafficOnly: true
  }
}
```

**Azure CLI fallback**:
```bash
az storage account update --name <name> --resource-group <rg> \
  --min-tls-version TLS1_2 --allow-blob-public-access false --https-only true
```

### 📚 Azure Reference
- [WAF Best Practice Link]
- [Microsoft Learn Documentation Link]

### ✅ Validation
- [ ] Change implemented in IaC and deployed
- [ ] Azure Policy compliance passes (if applicable)
- [ ] Microsoft Defender for Cloud recommendation resolved (if applicable)

**Well-Architected Recommendation**: [WAF checklist item this maps to]
````

### Step 7: EPIC 追跡 issue を作成する
"well-architected" と "epic" でラベル付けします。

**Title**: `[EPIC] Azure Well-Architected Review — X findings across 5 pillars`

**Body**: Executive summary with pillar breakdown table (finding counts by pillar and risk level), Mermaid architecture diagram, prioritized checklist linking all individual issues (High → Medium → Low), and success criteria:
- All High-risk findings resolved
- Medium findings have accepted mitigation plans
- No regression in existing Azure Monitor alerts or Azure Policy compliance

## エラー処理
- **IaC ファイルが見つからない**: Azure CLI (`az resource list`) による実環境のリソース検出だけにレビューを限定し、その不足を記載する
- **Azure の権限不足**: レビューに必要な読み取り専用ロール（Reader、Security Reader）を一覧表示する
- **GitHub での作成に失敗**: すべての指摘事項を整形済み Markdown としてコンソールに出力する

## 成功基準
- ✅ 5 つすべての WAF の柱が IaC と実環境に対してレビューされている
- ✅ すべての指摘事項がリスク レベルと柱で分類されている
- ✅ 各指摘事項に IaC の例を含む実行可能な修復手順がある
- ✅ チームで追跡するための GitHub issue が作成されている
- ✅ EPIC のコンテキスト用アーキテクチャ図が生成されている
- ✅ Microsoft Learn のドキュメント参照が含まれている

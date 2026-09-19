---
name: azure-resource-health-diagnose
description: 'Azure リソースの正常性を分析し、ログとテレメトリから問題を診断して、特定した問題の修復計画を作成します。'
---

# Azure Resource Health と問題診断

このワークフローは、特定の Azure リソースを分析して正常性を評価し、ログとテレメトリデータを使って潜在的な問題を診断し、発見した問題に対する包括的な修復計画を作成します。

## 前提条件
- Azure MCP server が構成され、認証済みであること
- 対象 Azure リソースが特定されていること（名前、および必要に応じてリソース グループ/サブスクリプション）
- ログ/テレメトリを生成するため、リソースがデプロイされ稼働していること
- 利用可能な場合は、直接 Azure CLI より Azure MCP tools (`azmcp-*`) を優先すること

## ワークフローの手順

### Step 1: Azure のベスト プラクティスを取得する
**アクション**: 診断とトラブルシューティングのベスト プラクティスを取得する
**ツール**: Azure MCP best practices tool
**プロセス**:
1. **ベスト プラクティスを読み込む**:
   - Azure best practices tool を実行して診断ガイドラインを取得する
   - 正常性の監視、ログ分析、問題解決のパターンに重点を置く
   - これらのプラクティスを診断アプローチと修復の推奨事項に反映する

### Step 2: リソースを検出して特定する
**アクション**: 対象 Azure リソースを検索して特定する
**ツール**: Azure MCP tools + Azure CLI fallback
**プロセス**:
1. **リソースを検索する**:
   - リソース名だけが指定された場合は、`azmcp-subscription-list` を使ってサブスクリプション全体を検索する
   - `az resource list --name <resource-name>` を使って一致するリソースを検索する
   - 複数の一致が見つかった場合は、サブスクリプション/リソース グループを指定するようユーザーに求める
   - 詳細なリソース情報を収集する:
     - リソースの種類と現在の状態
     - 場所、タグ、構成
     - 関連サービスと依存関係

2. **リソースの種類を検出する**:
   - 適切な診断アプローチを決めるため、リソースの種類を特定する:
     - **Web Apps/Function Apps**: アプリケーション ログ、パフォーマンス メトリック、依存関係の追跡
     - **Virtual Machines**: システム ログ、パフォーマンス カウンター、ブート診断
     - **Cosmos DB**: 要求メトリック、スロットリング、パーティション統計
     - **Storage Accounts**: アクセス ログ、パフォーマンス メトリック、可用性
     - **SQL Database**: クエリ パフォーマンス、接続ログ、リソース使用率
     - **Application Insights**: アプリケーション テレメトリ、例外、依存関係
     - **Key Vault**: アクセス ログ、証明書の状態、シークレットの使用状況
     - **Service Bus**: メッセージ メトリック、配信不能キュー、スループット

### Step 3: 正常性を評価する
**アクション**: 現在のリソースの正常性と可用性を評価する
**ツール**: Azure MCP monitoring tools + Azure CLI
**プロセス**:
1. **基本的な正常性チェック**:
   - リソースのプロビジョニング状態と運用状態を確認する
   - サービスの可用性と応答性を検証する
   - 最近のデプロイまたは構成変更を確認する
   - 現在のリソース使用率（CPU、メモリ、ストレージなど）を評価する

2. **サービス固有の正常性指標**:
   - **Web Apps**: HTTP 応答コード、応答時間、稼働時間
   - **Databases**: 接続成功率、クエリ パフォーマンス、デッドロック
   - **Storage**: 可用性の割合、要求成功率、待機時間
   - **VMs**: ブート診断、ゲスト OS メトリック、ネットワーク接続
   - **Functions**: 実行成功率、実行時間、エラー頻度

### Step 4: ログとテレメトリを分析する
**アクション**: ログとテレメトリを分析して問題とパターンを特定する
**ツール**: Log Analytics クエリ用の Azure MCP monitoring tools
**プロセス**:
1. **監視ソースを見つける**:
   - `azmcp-monitor-workspace-list` を使って Log Analytics ワークスペースを特定する
   - リソースに関連付けられた Application Insights インスタンスを見つける
   - `azmcp-monitor-table-list` を使って関連するログ テーブルを特定する

2. **診断クエリを実行する**:
   リソースの種類に基づく対象を絞った KQL クエリとともに `azmcp-monitor-log-query` を使用する:

   **一般的なエラー分析**:
   ```kql
   // Recent errors and exceptions
   union isfuzzy=true 
       AzureDiagnostics,
       AppServiceHTTPLogs,
       AppServiceAppLogs,
       AzureActivity
   | where TimeGenerated > ago(24h)
   | where Level == "Error" or ResultType != "Success"
   | summarize ErrorCount=count() by Resource, ResultType, bin(TimeGenerated, 1h)
   | order by TimeGenerated desc
   ```

   **パフォーマンス分析**:
   ```kql
   // Performance degradation patterns
   Perf
   | where TimeGenerated > ago(7d)
   | where ObjectName == "Processor" and CounterName == "% Processor Time"
   | summarize avg(CounterValue) by Computer, bin(TimeGenerated, 1h)
   | where avg_CounterValue > 80
   ```

   **アプリケーション固有のクエリ**:
   ```kql
   // Application Insights - Failed requests
   requests
   | where timestamp > ago(24h)
   | where success == false
   | summarize FailureCount=count() by resultCode, bin(timestamp, 1h)
   | order by timestamp desc
   
   // Database - Connection failures
   AzureDiagnostics
   | where ResourceProvider == "MICROSOFT.SQL"
   | where Category == "SQLSecurityAuditEvents"
   | where action_name_s == "CONNECTION_FAILED"
   | summarize ConnectionFailures=count() by bin(TimeGenerated, 1h)
   ```

3. **パターンを認識する**:
   - 繰り返し発生するエラー パターンや異常を特定する
   - エラーをデプロイ時刻や構成変更と関連付ける
   - パフォーマンスの傾向と劣化パターンを分析する
   - 依存関係の障害や外部サービスの問題を調べる

### Step 5: 問題の分類と根本原因分析
**アクション**: 特定した問題を分類し、根本原因を判断する
**プロセス**:
1. **問題を分類する**:
   - **Critical**: サービス停止、データ損失、セキュリティ侵害
   - **High**: パフォーマンス劣化、一時的な障害、高いエラー率
   - **Medium**: 警告、最適でない構成、軽微なパフォーマンス問題
   - **Low**: 情報アラート、最適化の機会

2. **根本原因を分析する**:
   - **Configuration Issues**: 不正な設定、依存関係の不足
   - **Resource Constraints**: CPU/メモリ/ディスクの制限、スロットリング
   - **Network Issues**: 接続の問題、DNS 解決、ファイアウォール ルール
   - **Application Issues**: コードのバグ、メモリ リーク、非効率なクエリ
   - **External Dependencies**: サードパーティ サービスの障害、API 制限
   - **Security Issues**: 認証の失敗、証明書の有効期限切れ

3. **影響を評価する**:
   - ビジネスへの影響と影響を受けるユーザー/システムを判断する
   - データの整合性とセキュリティへの影響を評価する
   - 目標復旧時間と優先順位を評価する

### Step 6: 修復計画を生成する
**アクション**: 特定した問題に対処する包括的な計画を作成する
**プロセス**:
1. **即時対応**（重大な問題）:
   - サービスの可用性を回復する緊急修正
   - 影響を緩和する一時的な回避策
   - 複雑な問題のエスカレーション手順

2. **短期修正**（高/中程度の問題）:
   - 構成の調整とリソースのスケーリング
   - アプリケーションの更新とパッチ適用
   - 監視とアラートの改善

3. **長期的な改善**（すべての問題）:
   - 回復性を高めるアーキテクチャの変更
   - 予防策と監視機能の強化
   - ドキュメントとプロセスの改善

4. **実装手順**:
   - 具体的な Azure CLI コマンドを含む優先順位付きアクション項目
   - テストと検証の手順
   - 各変更のロールバック計画
   - 問題の解決を確認するための監視

### Step 7: ユーザー確認とレポート生成
**アクション**: 調査結果を提示し、修復アクションの承認を得る
**プロセス**:
1. **正常性評価の概要を表示する**:
   ```
   🏥 Azure Resource Health Assessment
   
   📊 Resource Overview:
   • Resource: [Name] ([Type])
   • Status: [Healthy/Warning/Critical]
   • Location: [Region]
   • Last Analyzed: [Timestamp]
   
   🚨 Issues Identified:
   • Critical: X issues requiring immediate attention
   • High: Y issues affecting performance/reliability  
   • Medium: Z issues for optimization
   • Low: N informational items
   
   🔍 Top Issues:
   1. [Issue Type]: [Description] - Impact: [High/Medium/Low]
   2. [Issue Type]: [Description] - Impact: [High/Medium/Low]
   3. [Issue Type]: [Description] - Impact: [High/Medium/Low]
   
   🛠️ Remediation Plan:
   • Immediate Actions: X items
   • Short-term Fixes: Y items  
   • Long-term Improvements: Z items
   • Estimated Resolution Time: [Timeline]
   
   ❓ Proceed with detailed remediation plan? (y/n)
   ```

2. **詳細レポートを生成する**:
   ```markdown
   # Azure Resource Health Report: [Resource Name]
   
   **Generated**: [Timestamp]  
   **Resource**: [Full Resource ID]  
   **Overall Health**: [Status with color indicator]
   
   ## 🔍 Executive Summary
   [Brief overview of health status and key findings]
   
   ## 📊 Health Metrics
   - **Availability**: X% over last 24h
   - **Performance**: [Average response time/throughput]
   - **Error Rate**: X% over last 24h
   - **Resource Utilization**: [CPU/Memory/Storage percentages]
   
   ## 🚨 Issues Identified
   
   ### Critical Issues
   - **[Issue 1]**: [Description]
     - **Root Cause**: [Analysis]
     - **Impact**: [Business impact]
     - **Immediate Action**: [Required steps]
   
   ### High Priority Issues  
   - **[Issue 2]**: [Description]
     - **Root Cause**: [Analysis]
     - **Impact**: [Performance/reliability impact]
     - **Recommended Fix**: [Solution steps]
   
   ## 🛠️ Remediation Plan
   
   ### Phase 1: Immediate Actions (0-2 hours)
   ```bash
   # Critical fixes to restore service
   [Azure CLI commands with explanations]
   ```
   
   ### Phase 2: Short-term Fixes (2-24 hours)
   ```bash
   # Performance and reliability improvements
   [Azure CLI commands with explanations]
   ```
   
   ### Phase 3: Long-term Improvements (1-4 weeks)
   ```bash
   # Architectural and preventive measures
   [Azure CLI commands and configuration changes]
   ```
   
   ## 📈 Monitoring Recommendations
   - **Alerts to Configure**: [List of recommended alerts]
   - **Dashboards to Create**: [Monitoring dashboard suggestions]
   - **Regular Health Checks**: [Recommended frequency and scope]
   
   ## ✅ Validation Steps
   - [ ] Verify issue resolution through logs
   - [ ] Confirm performance improvements
   - [ ] Test application functionality
   - [ ] Update monitoring and alerting
   - [ ] Document lessons learned
   
   ## 📝 Prevention Measures
   - [Recommendations to prevent similar issues]
   - [Process improvements]
   - [Monitoring enhancements]
   ```

## エラー処理
- **リソースが見つからない**: リソース名/場所の指定方法を案内する
- **認証の問題**: Azure 認証の設定を案内する
- **権限不足**: リソースへのアクセスに必要な RBAC ロールを一覧にする
- **ログを利用できない**: 診断設定を有効にしてデータを待つよう提案する
- **クエリのタイムアウト**: 分析をより短い時間枠に分割する
- **サービス固有の問題**: 制限事項を明記した一般的な正常性評価を提供する

## 成功基準
- ✅ リソースの正常性状態が正確に評価されている
- ✅ 重要な問題がすべて特定され、分類されている
- ✅ 主要な問題の根本原因分析が完了している
- ✅ 具体的な手順を含む実行可能な修復計画が提供されている
- ✅ 監視と予防に関する推奨事項が含まれている
- ✅ ビジネスへの影響に基づき、問題の優先順位が明確になっている
- ✅ 実装手順に検証とロールバックの手順が含まれている

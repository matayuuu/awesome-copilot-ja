---
name: copilot-usage-metrics
description: 'GitHub CLIとREST APIを使って、OrganizationおよびEnterpriseのGitHub Copilot利用メトリクスを取得して表示する。'
---

# Copilot利用メトリクス

GitHub CLI（`gh`）を使ってGitHub Copilotの利用メトリクスを取得し、表示するSkillである。

## このSkillを使う場面

ユーザーが次について質問した場合に使用する。
- Copilotの利用メトリクス、導入状況、統計
- OrganizationまたはEnterpriseでCopilotを利用している人数
- Copilotの採用率、提案、チャット利用状況
- ユーザーごとのCopilot利用内訳
- 特定日のCopilot利用状況

## このSkillの使い方

1. ユーザーが**Organization**レベルと**Enterprise**レベルのどちらのメトリクスを求めているか判断する。
2. Organization名またはEnterprise slugが未指定なら確認する。
3. **集約**メトリクスと**ユーザー別**メトリクスのどちらを求めているか判断する。
4. **特定日**（YYYY-MM-DD形式）のメトリクスか、一般的または最近のメトリクスかを判断する。
5. このSkillのディレクトリから適切なスクリプトを実行する。

## 利用可能なスクリプト

### Organizationメトリクス

- `get-org-metrics.sh <org> [day]` — Organizationの集約Copilot利用メトリクスを取得する。YYYY-MM-DD形式で特定日を任意指定できる。
- `get-org-user-metrics.sh <org> [day]` — Organizationのユーザー別Copilot利用メトリクスを取得する。特定日を任意指定できる。

### Enterpriseメトリクス

- `get-enterprise-metrics.sh <enterprise> [day]` — Enterpriseの集約Copilot利用メトリクスを取得する。特定日を任意指定できる。
- `get-enterprise-user-metrics.sh <enterprise> [day]` — Enterpriseのユーザー別Copilot利用メトリクスを取得する。特定日を任意指定できる。

## 出力の書式

ユーザーへ結果を提示するときは次に従う。
- アクティブユーザー総数、採用率、提案総数、チャット対話総数などの主要メトリクスを要約する
- ユーザー別の内訳には表を使う
- 複数日を比較する場合は傾向を強調する
- メトリクスデータは2025年10月10日以降が利用でき、過去データは最大1年間参照できることを記載する

## 重要事項

- これらのAPIエンドポイントには **GitHub Enterprise Cloud** が必要である
- ユーザーには適切な権限が必要である（Enterprise owner、billing manager、または `manage_billing:copilot` / `read:enterprise` scopeを持つtoken）
- Enterprise設定で「Copilot usage metrics」ポリシーを有効にする必要がある
- APIが403を返した場合は、tokenの権限とEnterpriseポリシー設定を確認するよう案内する

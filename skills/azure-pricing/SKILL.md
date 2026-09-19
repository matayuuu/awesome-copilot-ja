---
name: azure-pricing
description: 'Azure Retail Prices API (prices.azure.com) を使って Azure の小売価格をリアルタイムに取得し、Copilot Studio エージェントのクレジット消費量を見積もります。Azure サービスの料金、SKU 価格の比較、コスト見積もり用の価格データ、Azure pricing、Azure costs、Azure billing、Copilot Studio pricing、Copilot Credits、エージェント使用量の見積もりについて尋ねられた場合に使用します。コンピューティング、ストレージ、ネットワーク、データベース、AI、Copilot Studio、その他すべての Azure サービス ファミリに対応します。'
compatibility: prices.azure.com と learn.microsoft.com へのインターネット アクセスが必要です。認証は必要ありません。
metadata:
  author: anthonychu
  version: "1.2"
---

# Azure 料金 Skill

このSkillを使って、公開されている Azure Retail Prices API から Azure の小売価格データをリアルタイムに取得します。認証は必要ありません。

## このSkillを使う場面

- Azure サービスの料金を尋ねられた場合（例: "How much does a D4s v5 VM cost?"）
- リージョン間または SKU 間で料金を比較したい場合
- ワークロードまたはアーキテクチャのコスト見積もりが必要な場合
- Azure pricing、Azure costs、または Azure billing に言及された場合
- 予約インスタンスと従量課金の料金を比較したい場合
- Savings Plans または Spot pricing について知りたい場合

## API Endpoint

```
GET https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview
```

OData フィルター構文を使い、クエリパラメーターとして `$filter` を追加します。Savings Plan のデータを含めるため、常に `api-version=2023-01-01-preview` を使用します。

## 手順

ユーザーの依頼に不明点がある場合は、API を呼び出す前に確認質問を行い、正しいフィールドと値を特定します。

1. ユーザーの依頼から **フィルターフィールド**（サービス名、リージョン、SKU、価格種別）を特定します。
2. **リージョンを解決**します。API では `armRegionName` に小文字で空白なしの値が必要です（例: "East US" → `eastus`、"West Europe" → `westeurope`、"Southeast Asia" → `southeastasia`）。完全な一覧は [references/REGIONS.md](references/REGIONS.md) を参照してください。
3. 下記のフィールドを使って **フィルター文字列を作成**し、URL を取得します。
4. JSON 応答から **`Items` 配列を解析**します。各項目には価格とメタデータが含まれます。
5. 最初の 1000 件を超える結果が必要な場合（通常は不要）は、`NextPageLink` を使って **ページネーションを継続**します。
6. [references/COST-ESTIMATOR.md](references/COST-ESTIMATOR.md) の式を使って **コストを見積もり**、月額・年額を算出します。
7. サービス、SKU、リージョン、単価、月額・年額見積もりを含む **わかりやすい概要表で結果を提示**します。

## Filterable Fields

| フィールド | 型 | 例 |
|---|---|---|
| `serviceName` | string (exact, case-sensitive) | `'Functions'`, `'Virtual Machines'`, `'Storage'` |
| `serviceFamily` | string (exact, case-sensitive) | `'Compute'`, `'Storage'`, `'Databases'`, `'AI + Machine Learning'` |
| `armRegionName` | string (exact, lowercase) | `'eastus'`, `'westeurope'`, `'southeastasia'` |
| `armSkuName` | string (exact) | `'Standard_D4s_v5'`, `'Standard_LRS'` |
| `skuName` | string (contains supported) | `'D4s v5'` |
| `priceType` | string | `'Consumption'`, `'Reservation'`, `'DevTestConsumption'` |
| `meterName` | string (contains supported) | `'Spot'` |

一致には `eq`、条件の組み合わせには `and`、部分一致には `contains(field, 'value')` を使用します。

## Example Filter Strings

```
# All consumption prices for Functions in East US
serviceName eq 'Functions' and armRegionName eq 'eastus' and priceType eq 'Consumption'

# D4s v5 VMs in West Europe (consumption only)
armSkuName eq 'Standard_D4s_v5' and armRegionName eq 'westeurope' and priceType eq 'Consumption'

# All storage prices in a region
serviceName eq 'Storage' and armRegionName eq 'eastus'

# Spot pricing for a specific SKU
armSkuName eq 'Standard_D4s_v5' and contains(meterName, 'Spot') and armRegionName eq 'eastus'

# 1-year reservation pricing
serviceName eq 'Virtual Machines' and priceType eq 'Reservation' and armRegionName eq 'eastus'

# Azure AI / OpenAI pricing (now under Foundry Models)
serviceName eq 'Foundry Models' and armRegionName eq 'eastus' and priceType eq 'Consumption'

# Azure Cosmos DB pricing
serviceName eq 'Azure Cosmos DB' and armRegionName eq 'eastus' and priceType eq 'Consumption'
```

## 完全な取得 URL の例

```
https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview&$filter=serviceName eq 'Functions' and armRegionName eq 'eastus' and priceType eq 'Consumption'
```

URL を構築する際は、空白を `%20`、引用符を `%27` として URL エンコードします。

## Key Response Fields

```json
{
  "Items": [
    {
      "retailPrice": 0.000016,
      "unitPrice": 0.000016,
      "currencyCode": "USD",
      "unitOfMeasure": "1 Execution",
      "serviceName": "Functions",
      "skuName": "Premium",
      "armRegionName": "eastus",
      "meterName": "vCPU Duration",
      "productName": "Functions",
      "priceType": "Consumption",
      "isPrimaryMeterRegion": true,
      "savingsPlan": [
        { "unitPrice": 0.000012, "term": "1 Year" },
        { "unitPrice": 0.000010, "term": "3 Years" }
      ]
    }
  ],
  "NextPageLink": null,
  "Count": 1
}
```

ユーザーが非プライマリーメーターを明示的に求めた場合を除き、`isPrimaryMeterRegion` が `true` の項目だけを使用します。

## 対応する serviceFamily の値

`Analytics`, `Compute`, `Containers`, `Data`, `Databases`, `Developer Tools`, `Integration`, `Internet of Things`, `Management and Governance`, `Networking`, `Security`, `Storage`, `Web`, `AI + Machine Learning`

## ヒント

- `serviceName` の値は大文字と小文字を区別します。不明な場合は、まず `serviceFamily` でフィルターし、結果から有効な `serviceName` の値を確認します。
- 結果が空の場合は、フィルターを広げてみます（まず `priceType` またはリージョンの制約を削除するなど）。
- リクエストで `currencyCode` が指定されていない限り、価格は常に USD です。
- Savings Plan の価格については、各項目の `savingsPlan` 配列を確認します（`2023-01-01-preview` でのみ使用できます）。
- 一般的なサービス名と正しい大文字・小文字の一覧は [references/SERVICE-NAMES.md](references/SERVICE-NAMES.md) を参照してください。
- コスト見積もりの式とパターンは [references/COST-ESTIMATOR.md](references/COST-ESTIMATOR.md) を参照してください。
- Copilot Studio の請求レートと見積もり式は [references/COPILOT-STUDIO-RATES.md](references/COPILOT-STUDIO-RATES.md) を参照してください。

## Troubleshooting

| 問題 | 解決策 |
|-------|----------|
| Empty results | Broaden the filter — remove `priceType` or `armRegionName` first |
| Wrong service name | Use `serviceFamily` filter to discover valid `serviceName` values |
| Missing savings plan data | Ensure `api-version=2023-01-01-preview` is in the URL |
| URL errors | Check URL encoding — spaces as `%20`, quotes as `%27` |
| Too many results | Add more filter fields (region, SKU, priceType) to narrow down |

---

# Copilot Studio Agent Usage Estimation

ユーザーが Copilot Studio の料金、Copilot Credits、またはエージェントの使用コストについて尋ねた場合は、このセクションを使用します。

## このセクションを使う場面

- Copilot Studio の料金またはコストを尋ねられた場合
- Copilot Credits またはエージェントのクレジット消費量を尋ねられた場合
- Copilot Studio エージェントの月額コストを見積もりたい場合
- エージェント使用量の見積もりまたは Copilot Studio estimator に言及された場合
- エージェントの実行にいくらかかるか尋ねられた場合

## 主な事実

- **1 Copilot Credit = $0.01 USD**
- クレジットはテナント全体でプールされます。
- M365 Copilot のライセンスユーザー向けエージェントでは、classic answers、generative answers、tenant graph grounding が無料になります。
- 超過適用は、前払い容量の 125% で発動します。

## 見積もり手順

1. ユーザーから **入力値を収集**します。エージェントの種類（employee/customer）、ユーザー数、月間インタラクション数、knowledge %、tenant graph %、セッションあたりのツール使用回数を確認します。
2. **最新の請求レートを取得**します。組み込みの web fetch tool を使い、下記のソース URL から最新レートをダウンロードします。これにより、常に最新の Microsoft 価格を使って見積もれます。
3. **取得した内容を解析**し、現在の請求レート表（機能種別ごとのクレジット数）を抽出します。
4. 取得した内容のレートと式を使って **見積もりを計算**します。
   - `total_sessions = users × interactions_per_month`
   - Knowledge credits: apply tenant graph grounding rate, generative answer rate, and classic answer rate
   - Agent tools credits: apply agent action rate per tool call
   - Agent flow credits: apply flow rate per 100 actions
   - Prompt modifier credits: apply basic/standard/premium rates per 10 responses
5. カテゴリ別の内訳、合計クレジット、推定 USD コストを含む **わかりやすい表で結果を提示**します。

## 取得するソース URL

Copilot Studio の料金に関する質問へ回答する場合は、コンテキストとしてこれらの URL から最新の内容を取得します:

| URL | 内容 |
|---|---|
| https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management | Billing rates table, billing examples, overage enforcement rules |
| https://learn.microsoft.com/en-us/microsoft-copilot-studio/billing-licensing | Licensing options, M365 Copilot inclusions, prepaid vs pay-as-you-go |

計算前に、少なくとも最初の URL（請求レート）を取得してください。2 番目の URL はライセンスに関する質問の補足情報を提供します。

レート、式、請求例のキャッシュされたスナップショットは [references/COPILOT-STUDIO-RATES.md](references/COPILOT-STUDIO-RATES.md) を参照してください（web fetch が利用できない場合のフォールバックとして使用します）。

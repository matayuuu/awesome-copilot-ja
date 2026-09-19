---
name: data-breach-blast-radius
description: '侵害前の影響分析を行う。機密データ（PII、PHI、PCI-DSS、認証情報）を棚卸しし、データフローを追跡し、露出経路を採点して、GDPR Art. 83、CCPA § 1798.155(a)、HIPAA 45 CFR § 160.404 の罰金範囲を原文どおり参照した規制上の影響範囲レポートを生成する。コスト基準は毎年更新される IBM Cost of a Data Breach Report を使用する。「侵害の影響を評価」「露出し得るデータ」「影響範囲を計算」「データ露出分析」「侵害された場合の深刻度」「データリスクの定量化」「機密データ棚卸し」「データフローのセキュリティ監査」「侵害前評価」「最悪の侵害シナリオ」「侵害対応準備」「データリスクレポート」「/data-breach-blast-radius」と依頼された場合に使用する。ユーザーデータ、医療記録、金融情報を扱うあらゆる技術スタックが対象。法律に基づく正確な数値と、計画用の推定値を区別して表示する。法律相談の代替ではない。'
---

# データ侵害の影響範囲アナライザー

あなたは**データ侵害影響の専門家**です。多くのチームが侵害前に問わない最重要のセキュリティ質問、**「今侵害された場合、どれほど深刻で、どれほどの費用がかかるか」**に答えてください。

この Skill は、コードベースが扱う機密データ、その流れ、漏えい箇所、影響人数、規制上の結果を侵害発生前に監査する、**予防的な影響範囲分析**を行います。

> **重要性:** IBM Cost of a Data Breach Report によると、83% の組織が複数回のデータ侵害を経験しています。2024 年の世界平均侵害コストは **$4.88M** で、2025 年版では 9% 減少しました。最新版は https://www.ibm.com/reports/data-breach から取得してください。侵害前に露出箇所を特定して修復した組織は、相当な注意義務を示せるため、規制罰金を抑えられる傾向があります。

> **この Skill の出力と法的に正確な情報の区別:**
> - **法的に正確:** 規制上の罰金上限と侵害通知期限（GDPR Art. 83、CCPA § 1798.155、45 CFR § 160.404 などから原文どおり引用。すべて `references/SOURCES.md` に記載）
> - **計画用の推定:** 影響範囲スコア、財務影響の範囲、レコード数（OWASP のリスク手法と IBM の基準に基づくヒューリスティックモデル）
> - **出力で必ず明示:** 法律を根拠とする正確な数値と、モデルに基づく推定値
> - 有資格の法律専門家や正式な DPIA/リスク評価の代替にしない

## 使用する場面

- セキュリティレビューやペネトレーションテスト前のコードベース監査
- データ保護影響評価（DPIA）の準備
- 災害復旧/インシデント対応計画の作成またはレビュー
- 顧客データを扱う新規システムの導入
- 規制対応（GDPR、CCPA、HIPAA、SOC 2）の準備
- エンジニアリング責任者からの「露出範囲はどこか」という質問への回答
- 影響範囲、侵害影響、データ露出、機密データ棚卸し、データリスク、最悪のシナリオに関する依頼
- 直接呼び出し: `/data-breach-blast-radius`

## この Skill の仕組み

脆弱性を見つけるだけのツールとは異なり、**ビジネスと規制への影響を定量化**します。

1. スキーマ、モデル、DTO、ログ、構成、API コントラクトから機密データ資産をすべて**検出する**
2. 世界的な規制基準に従ってデータを重大度 Tier 1～4 に**分類する**
3. 取り込み → 処理 → 保存 → 送信 → 削除のデータフローを**追跡する**
4. API endpoint、ログ、エクスポート、キャッシュ、キューなど、データが漏えいし得る露出経路を**特定する**
5. 影響レコード数、リスクにさらされるユーザー数、適用される法域を**計算する**
6. GDPR の罰金、CCPA の制裁、HIPAA の制裁、侵害通知コストという規制影響を**定量化する**
7. 労力あたりの効果順に、優先順位付きの強化ロードマップを**生成する**

## 実行ワークフロー

毎回、次の手順を**順番どおり**に実行します。

### ステップ 1 — 範囲と技術スタックの検出

- パスが指定された場合（`/data-breach-blast-radius src/`）は、その範囲を分析する
- パスがない場合は**プロジェクト全体**を分析する
- `package.json`、`requirements.txt`、`go.mod`、`pom.xml`、`Cargo.toml`、`Gemfile`、`composer.json`、`.csproj` から言語とフレームワークを検出する
- ORM モデル、スキーマファイル、migration、Prisma schema、Entity Framework、Hibernate、SQLAlchemy、ActiveRecord からデータベース層を特定する
- REST controller、GraphQL schema、gRPC proto、OpenAPI spec から API 層を特定する
- Terraform、Bicep、CloudFormation、Pulumi からストレージリソースの公開状態を特定する

完全な機密度分類を読み込むため、`references/data-classification.md` を読みます。

### ステップ 2 — 機密データの棚卸し

**データモデル層:**
- データベーススキーマ、migration、ORM model、entity class
- GraphQL type、Prisma schema、TypeORM entity、Mongoose schema
- `references/data-classification.md` のデータカテゴリーに該当するすべてのフィールド
- seeder、fixture、コメントから規模が分かる場合は、テーブル/collection 名と推定カーディナリティ

**API コントラクト層:**
- REST request/response DTO と serializer
- GraphQL query/mutation の戻り値型
- gRPC proto message 定義
- OpenAPI / Swagger spec のフィールド
- 機密データを外部へ公開するフィールド

**構成とシークレット:**
- 環境ファイル（`.env`、`.env.*`）、構成ファイル、`appsettings.json`、`application.yml`
- Terraform/Bicep の variable ファイルと output
- CI/CD pipeline（`.github/workflows/`、`.gitlab-ci.yml`、`Jenkinsfile`、`azure-pipelines.yml`）
- Docker/Kubernetes の config map と secret

**ログと監査層:**
- ユーザーデータを出力するログ記録
- Segment、Mixpanel、Datadog、Sentry、Application Insights などの分析/テレメトリ統合
- 監査ログテーブルとイベント追跡

検出した機密データフィールドごとに次を記録します。

```
| フィールド | テーブル/情報源 | データ Tier | 目的 | 暗号化済み? | 注記 |
```

> **分類根拠:** Tier の割り当ては GDPR Article 9、PCI-DSS v4.0、HIPAA 45 CFR Part 164 に従います。完全な分類は `references/data-classification.md`、一次情報へのリンクは `references/SOURCES.md` を参照してください。

### ステップ 3 — データフローの追跡

**取り込み点:** フォーム送信、API POST/PUT endpoint、ファイルアップロード、third-party webhook、OAuth callback、SSO assertion、データ import、CSV/Excel 取り込み、ETL pipeline。

**処理点:** 機密フィールドを扱うビジネスロジック、Redis/Memcached cache、Kafka/SQS/Service Bus/RabbitMQ queue、background job と worker。

**保存点:** SQL/NoSQL/time-series database、S3/Azure Blob/GCS/local filesystem、Elasticsearch/OpenSearch/Azure AI Search/Algolia、BigQuery/Snowflake/Redshift/Synapse、backup store。

**送信点:** 決済、メール、分析などの third-party API、webhook payload、CSV/PDF/Excel report、email/SMS/push notification。

**露出点:** 認証のない公開 API endpoint、認可不足（IDOR/BOLA）、過剰な API response、CORS の誤構成、公開 storage bucket/container、stdout/stderr への機密ログ、PII を含むエラーや stack trace、production に残った debug endpoint。

採点式は `references/blast-radius-calculator.md` を読みます。

### ステップ 4 — 影響範囲の計算

ステップ 3 で特定した各**露出経路**について計算します。

```
影響範囲スコア = データ機密度 Tier × 露出可能性 × 対象人口規模 × データ完全性
```

**対象人口規模の推定:**
- seeder、コメント、README などにユーザー数が固定値で記載されている場合は、その値を使う
- 件数がない場合は保守的に推定し、仮定を明記する
  - SaaS product → 1 万～100 万ユーザー
  - 社内ツール → 100～1 万ユーザー
  - 消費者向けアプリ → 10 万～1,000 万ユーザー
- 未成年者のデータは ×2、医療データは ×3、金融認証情報は ×5 の係数を適用する

**規制法域の検出:**
- `gdpr`、EU 通貨、EU 電話形式、`.eu` domain、EU datacenter region → GDPR
- California 居住者、US `.com`、Stripe US、州固有の税務ロジック → CCPA
- 診断、投薬、ICD code、FHIR resource → HIPAA
- Brazilian user、BRL 通貨、CPF field → LGPD
- Singapore、Thailand、Malaysia、Philippines のデータパターン → PDPA
- 一致するすべての法域を適用し、最も厳しい通知期限を採用する

罰金計算式と通知要件は `references/regulatory-impact.md` を読みます。

### ステップ 5 — 規制影響の推定

適用される各法域について:
- `references/regulatory-impact.md` の式で**最大罰金リスク**を計算する
- 協力的な初回違反を想定した**現実的な最小罰金リスク**を計算する
- 法務、連絡、信用監視を含む**侵害通知コスト**を推定する
- 公開サービスか社内ツールかに基づく**評判への係数**を推定する

**財務影響要約表**を生成します。

```
| 規制 | 最大罰金 | 現実的な罰金 | 通知コスト | 期限 |
```

> 注: これらはリスク計画用の推定値です。実際の規制対応は必ず法律専門家へ相談してください。

### ステップ 6 — 影響範囲レポートの生成

`references/report-format.md` を読み、完全なレポートを生成します。必須内容:

1. **エグゼクティブサマリー**（専門用語を避けた 2～3 段落）
2. **機密データ棚卸し**（検出した PII/PHI/金融/認証情報フィールドの表）
3. **データフローマップ**（システム内のデータ移動を示す Mermaid diagram）
   - Mermaid markup 作成後、短いタイトルとともに **`renderMermaidDiagram` を呼び出す**。fenced code block として出力しない
   - 重大な検出事項には `fill:#ff4444`、高重大度の露出点には `fill:#ff8800` の `style` directive を使う
4. **上位 5 件の露出経路**（影響範囲スコア順）
5. **規制上の影響範囲表**（法域別）
6. **財務影響の推定**（現実的な範囲）
7. **強化ロードマップ**（`references/hardening-playbook.md` に基づく）

### ステップ 7 — 強化ロードマップ

`references/hardening-playbook.md` を読み、**優先順位付きのアクション計画**を生成します。

重大または高重大度の各露出経路について:
- **修正内容:** 具体的なコード/構成変更
- **理由:** 規制リスクとユーザーへの影響
- **労力:** 低 / 中 / 高
- **効果:** 影響範囲の推定削減率
- **クイックウィン:** 1 日未満で修正できる項目に印を付ける

`(効果 × 重大度) / 労力` の高い順に並べます。

## 出力規則

- 必ずエグゼクティブサマリーから始める
- 必ず機密データ棚卸し表を含める
- 必ず財務影響の推定を生成する
- データフローマップには必ず `renderMermaidDiagram` を呼び出し、生の Mermaid code block を出力しない
- コード変更を自動適用せず、人によるレビュー用に強化ロードマップを提示する
- すべての検出事項にファイルパス、フィールド名、行番号を記載する
- レコード数を推定した場合は仮定を明記する
- 「確実に露出している」と「条件 X で露出し得る」を区別する
- 機密データが少なく制御が強固な場合は、その事実と走査範囲を明確に説明する

## 影響範囲の重大度 Tier

| Tier | ラベル | 例 | 係数 |
|------|-------|----------|------------|
| T1 | **壊滅的** | 政府発行 ID、生体情報、医療記録、金融認証情報、password | ×5 |
| T2 | **重大** | 氏名 + 住所 + 生年月日の組み合わせ、payment card data（PAN）、SSN、passport number | ×4 |
| T3 | **高** | email + password（hash 済み）、電話番号、正確な位置情報、IP address、device fingerprint | ×3 |
| T4 | **上昇** | 名のみ、email address のみ、おおまかな場所（都市）、利用分析 | ×2 |
| T5 | **標準** | 非個人の構成データ、公開コンテンツ、匿名化された集計 | ×1 |

## 参照ファイル

必要に応じて読み込みます。

| ファイル | 使用時点 | 内容 |
|------|----------|---------|
| `references/data-classification.md` | **ステップ 2 — 常に** | PII、PHI、PCI-DSS、金融、認証情報、行動データの完全な分類と検出パターン |
| `references/blast-radius-calculator.md` | **ステップ 4** | 採点式、対象人口規模の推定、完全性係数、露出可能性マトリクス |
| `references/regulatory-impact.md` | **ステップ 5** | GDPR/CCPA/HIPAA/LGPD/PDPA の罰金式、通知期限、侵害コスト基準、法域検出パターン |
| `references/hardening-playbook.md` | **ステップ 7** | 暗号化、アクセス制御、データ最小化、tokenization、監査ログ、技術スタック別匿名化パターン |
| `references/report-format.md` | **ステップ 6** | Mermaid データフロー構文、財務要約表、強化ロードマップ形式を含む完全なレポートテンプレート |

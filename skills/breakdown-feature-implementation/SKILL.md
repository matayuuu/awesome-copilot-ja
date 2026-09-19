---
name: breakdown-feature-implementation
description: 'Epochモノレポ構造に従い、詳細な機能実装計画を作成するためのPromptです。'
---

# 機能実装計画Prompt

## 目標

大規模SaaS企業で高度な機能を作る責任を担う、業界経験豊富なソフトウェアエンジニアとして振る舞います。Feature PRDに基づき、機能の詳細な技術実装計画を作成します。
提供されたコンテキストをレビューし、徹底的で包括的な実装計画を出力します。
**注:** 技術的な状況を示す擬似コード以外のコードを出力してはいけません。

## 出力形式

出力は完全な実装計画をMarkdown形式で作成し、`/docs/ways-of-work/plan/{epic-name}/{feature-name}/implementation-plan.md` に保存します。

### ファイルシステム

Epochのモノレポ構造に従うフロントエンドとバックエンド両方のフォルダーおよびファイル構造:

```
apps/
  [app-name]/
services/
  [service-name]/
packages/
  [package-name]/
```

### 実装計画

各機能について:

#### 目標

機能の目標を3〜5文で記述します。

#### 要件

- 詳細な機能要件（箇条書き）
- 実装計画の具体的内容

#### 技術上の考慮事項

##### システムアーキテクチャ概要

この機能がシステム全体へどのように統合されるかを示す包括的なシステムアーキテクチャ図をMermaidで作成します。図には次を含めます。

- **Frontend Layer**: ユーザーインターフェイスコンポーネント、状態管理、クライアント側ロジック
- **API Layer**: tRPCエンドポイント、認証ミドルウェア、入力検証、リクエストルーティング
- **Business Logic Layer**: サービスクラス、業務ルール、ワークフローオーケストレーション、イベント処理
- **Data Layer**: データベース操作、キャッシュ機構、外部API統合
- **Infrastructure Layer**: Dockerコンテナー、バックグラウンドサービス、デプロイコンポーネント

サブグラフを使ってこれらのレイヤーを明確に整理します。リクエスト/レスポンスパターン、データ変換、イベントフローを示すラベル付き矢印でレイヤー間のデータフローを表します。この実装固有の機能コンポーネント、サービス、データ構造も含めます。

- **Technology Stack Selection**: 各レイヤーの選択理由を文書化
- **Integration Points**: 明確な境界と通信プロトコルを定義
- **Deployment Architecture**: Dockerコンテナー化戦略
- **Scalability Considerations**: 水平および垂直スケーリング方法

##### データベーススキーマ設計

機能のデータモデルを示すエンティティリレーションシップ図をMermaidで作成します。

- **Table Specifications**: 型と制約を含む詳細なフィールド定義
- **Indexing Strategy**: 性能上重要なインデックスとその理由
- **Foreign Key Relationships**: データ整合性と参照制約
- **Database Migration Strategy**: バージョン管理とデプロイ方法

##### API Design

- 完全な仕様を持つエンドポイント
- TypeScript型によるリクエスト/レスポンス形式
- Stack Authによる認証と認可
- エラー処理戦略とステータスコード
- レート制限とキャッシュ戦略

##### フロントエンドアーキテクチャ

###### コンポーネント階層の文書化

コンポーネント構造では、一貫性がありアクセシブルな基盤として `shadcn/ui` ライブラリを活用します。

**Layout Structure:**

```
Recipe Library Page
├── Header Section (shadcn: Card)
│   ├── Title (shadcn: Typography `h1`)
│   ├── Add Recipe Button (shadcn: Button with DropdownMenu)
│   │   ├── Manual Entry (DropdownMenuItem)
│   │   ├── Import from URL (DropdownMenuItem)
│   │   └── Import from PDF (DropdownMenuItem)
│   └── Search Input (shadcn: Input with icon)
├── Main Content Area (flex container)
│   ├── Filter Sidebar (aside)
│   │   ├── Filter Title (shadcn: Typography `h4`)
│   │   ├── Category Filters (shadcn: Checkbox group)
│   │   ├── Cuisine Filters (shadcn: Checkbox group)
│   │   └── Difficulty Filters (shadcn: RadioGroup)
│   └── Recipe Grid (main)
│       └── Recipe Card (shadcn: Card)
│           ├── Recipe Image (img)
│           ├── Recipe Title (shadcn: Typography `h3`)
│           ├── Recipe Tags (shadcn: Badge)
│           └── Quick Actions (shadcn: Button - View, Edit)
```

- **State Flow Diagram**: Mermaidを使ったコンポーネント状態管理
- 再利用可能なコンポーネントライブラリの仕様
- Zustand/React Queryによる状態管理パターン
- TypeScriptのインターフェイスと型

##### セキュリティと性能

- 認証/認可要件
- データ検証とサニタイズ
- 性能最適化戦略
- キャッシュ機構

## コンテキストテンプレート

- **Feature PRD:** [Feature PRD Markdownファイルの内容]

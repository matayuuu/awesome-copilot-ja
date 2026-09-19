---
name: breakdown-epic-arch
description: 'Product Requirements Document に基づいて、エピックの高レベルな技術アーキテクチャを作成するプロンプト。'
---

# エピックアーキテクチャ仕様プロンプト

## 目的

Senior Software Architect として行動します。タスクは、Epic PRD を基に高レベルな技術アーキテクチャ仕様を作成することです。この文書は、必要な主要コンポーネント、機能、技術的イネーブラーを示し、エピックの開発を導きます。

## コンテキスト上の考慮事項

- Product Manager による Epic PRD。
- モジュール型かつスケーラブルなアプリケーション向けの **Domain-driven architecture** パターン。
- **Self-hosted and SaaS deployment** の要件。
- すべてのサービスに対する **Docker containerization**。
- App Router を備えた **TypeScript/Next.js** スタック。
- **Turborepo monorepo** パターン。
- 型安全な API のための **tRPC**。
- 認証のための **Stack Auth**。

**注記:** 技術的な状況を表す疑似コード以外は、出力にコードを書かないでください。

## 出力形式

出力は完全な Epic Architecture Specification の Markdown 形式とし、`/docs/ways-of-work/plan/{epic-name}/arch.md` に保存します。

### 仕様の構成

#### 1. エピックアーキテクチャの概要

- エピックの技術的アプローチの簡潔な要約。

#### 2. システムアーキテクチャ図

このエピックの完全なシステムアーキテクチャを示す包括的な Mermaid 図を作成します。図には次を含めます。

- **User Layer**: 異なるユーザー種別（Web ブラウザー、モバイルアプリ、管理インターフェイス）がシステムとどのようにやり取りするかを示す
- **Application Layer**: ロードバランサー、アプリケーションインスタンス、認証サービス（Stack Auth）を描く
- **Service Layer**: tRPC API、バックグラウンドサービス、ワークフローエンジン（n8n）、およびエピック固有のサービスを含める
- **Data Layer**: データベース（PostgreSQL）、ベクターデータベース（Qdrant）、キャッシュ層（Redis）、外部 API 統合を示す
- **Infrastructure Layer**: Docker containerization とデプロイアーキテクチャを表す

明確なサブグラフでこれらの層を整理し、異なるコンポーネント種別には一貫した色分けを適用して、コンポーネント間のデータフローを示します。エピックに関連する同期リクエスト経路と非同期処理フローの両方を含めます。

#### 3. 高レベルの機能と技術的イネーブラー

- 構築する高レベルな機能の一覧。
- 機能を支えるために必要な技術的イネーブラー（例: 新しいサービス、ライブラリ、インフラストラクチャ）の一覧。

#### 4. テクノロジースタック

- 使用する主要なテクノロジー、フレームワーク、ライブラリの一覧。

#### 5. 技術的価値

- 簡潔な根拠とともに技術的価値（例: High、Medium、Low）を見積もります。

#### 6. T シャツサイズ見積もり

- エピックに対する高レベルな T シャツサイズ見積もり（例: S、M、L、XL）を示します。

## コンテキストテンプレート

- **Epic PRD:** [Epic PRD Markdown ファイルの内容]

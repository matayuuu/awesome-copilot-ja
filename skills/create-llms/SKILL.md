---
name: create-llms
description: 'https://llmstxt.org/ のllms.txt仕様に従い、リポジトリ構造に基づいてllms.txtファイルを一から作成する。'
---

# リポジトリ構造からLLMs.txtファイルを作成

https://llmstxt.org/ の公式llms.txt仕様に従い、リポジトリのルートに新しい `llms.txt` ファイルを一から作成する。このファイルは、リポジトリの目的と仕様を理解するために関連コンテンツを探す場所を、大規模言語モデル（LLM）へ大局的に案内する。

## 主要指示

LLMがリポジトリを効果的に理解して探索するための入口となる、包括的な `llms.txt` を作成する。llms.txt仕様に準拠し、人にも読みやすい状態を保ちながらLLMによる利用に最適化する。

## 分析と計画のフェーズ

`llms.txt` ファイルを作成する前に、詳細な分析を完了する。

### ステップ1: llms.txt仕様を確認する

- 完全に準拠するため、https://llmstxt.org/ の公式仕様を確認する
- 必須の書式構造と指針を理解する
- Markdown構造の具体的な要件を記録する

### ステップ2: リポジトリ構造を分析する

- 適切なツールでリポジトリ構造全体を調べる
- リポジトリの主な目的と範囲を特定する
- 重要なディレクトリとその目的を一覧化する
- LLMによる理解に役立つ主要ファイルを列挙する

### ステップ3: コンテンツを検出する

- READMEファイルと配置場所を特定する
- 文書ファイル（`/docs/`、`/spec/` などの `.md` ファイル）を探す
- 仕様ファイルとその目的を特定する
- 構成ファイルとその関連性を確認する
- サンプルファイルとコード例を探す
- 既存の文書構造を特定する

### ステップ4: 実装計画を作成する

分析に基づき、次を含む構造化された計画を作成する。

- リポジトリの目的と範囲の要約
- LLMの理解に必須のファイルを優先順に並べた一覧
- 追加のコンテキストを提供する補助ファイル
- llms.txtファイルの構成

## 実装要件

### 書式への準拠

`llms.txt` ファイルは、仕様に従って次の構造を正確に使用する。

1. **H1見出し**: リポジトリ名またはプロジェクト名を含む1行（必須）
2. **引用形式の要約**: 引用形式の簡潔な説明（任意だが推奨）
3. **追加詳細**: コンテキストを示す、見出しのない0個以上のMarkdownセクション
4. **ファイル一覧セクション**: リンクのMarkdownリストを含む0個以上のH2セクション

### 内容の要件

#### 必須要素

- **プロジェクト名**: 明確で説明的なH1タイトル
- **要約**: リポジトリの目的を説明する簡潔な引用
- **主要ファイル**: カテゴリ別に整理した必須ファイル（H2セクション）

#### ファイルリンクの形式

各ファイルリンクは `[descriptive-name](relative-url): optional description` の形式に従う。

#### セクション構成

ファイルを次のような論理的なH2セクションへ整理する。

- **文書**: 中核となる文書ファイル
- **仕様**: 技術仕様と要件
- **例**: サンプルコードと使用例
- **構成**: セットアップファイルと構成ファイル
- **任意**: 補助ファイル（短いコンテキストでは省略できる特別な意味を持つ）

### 内容の指針

#### 言語とスタイル

- 簡潔で明確かつ曖昧さのない言葉を使う
- 説明のない専門用語を避ける
- 人とLLMの両方を読者として書く
- 説明は具体的で有益な内容にする

#### ファイル選定基準

次に該当するファイルを含める。
- リポジトリの目的と範囲を説明する
- 必須の技術文書を提供する
- 使用例とパターンを示す
- インターフェイスと仕様を定義する
- 構成とセットアップの手順を含む

次に該当するファイルは除外する。
- 純粋な実装詳細である
- 重複情報を含む
- ビルド成果物または生成コンテンツである
- プロジェクトの理解に関係しない

## 実行手順

### ステップ1: リポジトリ分析

1. リポジトリ構造全体を調べる
2. メインのREADME.mdを読み、プロジェクトを理解する
3. すべての文書ディレクトリとファイルを特定する
4. 仕様ファイルとその目的を一覧化する
5. サンプルファイルと構成ファイルを探す

### ステップ2: 内容の計画

1. 主な目的を表す文を決める
2. 引用用の簡潔な要約を書く
3. 特定したファイルを論理的なカテゴリへ分類する
4. LLMによる理解の重要度に基づいてファイルへ優先順位を付ける
5. 各ファイルリンクの説明を作成する

### ステップ3: ファイル作成

1. リポジトリルートに `llms.txt` ファイルを作成する
2. 書式仕様へ正確に従う
3. 必須セクションをすべて含める
4. 適切なMarkdown書式を使う
5. すべてのリンクが有効な相対パスであることを確認する

### ステップ4: 検証
1. https://llmstxt.org/ の仕様への準拠を確認する
2. すべてのリンクが有効でアクセス可能か確認する
3. ファイルがLLM向けの効果的なナビゲーションとして機能することを確認する
4. 人と機械の両方が読み取れることを確認する

## 品質保証

### 書式の検証

- ✅ H1 header with project name
- ✅ Blockquote summary (if included)
- ✅ H2 sections for file lists
- ✅ Proper markdown link format
- ✅ No broken or invalid links
- ✅ Consistent formatting throughout

### 内容の検証

- ✅ Clear, unambiguous language
- ✅ Comprehensive coverage of essential files
- ✅ Logical organization of content
- ✅ Appropriate file descriptions
- ✅ Serves as effective LLM navigation tool

### 仕様への準拠

- ✅ Follows https://llmstxt.org/ format exactly
- ✅ Uses required markdown structure
- ✅ Implements optional sections appropriately
- ✅ File located at repository root (`/llms.txt`)

## 構造テンプレートの例

```txt
# [Repository Name]

> [Concise description of the repository's purpose and scope]

[Optional additional context paragraphs without headings]

## Documentation

- [Main README](README.md): Primary project documentation and getting started guide
- [Contributing Guide](CONTRIBUTING.md): Guidelines for contributing to the project
- [Code of Conduct](CODE_OF_CONDUCT.md): Community guidelines and expectations

## Specifications

- [Technical Specification](spec/technical-spec.md): Detailed technical requirements and constraints
- [API Specification](spec/api-spec.md): Interface definitions and data contracts

## Examples

- [Basic Example](examples/basic-usage.md): Simple usage demonstration
- [Advanced Example](examples/advanced-usage.md): Complex implementation patterns

## Configuration

- [Setup Guide](docs/setup.md): Installation and configuration instructions
- [Deployment Guide](docs/deployment.md): Production deployment guidelines

## Optional

- [Architecture Documentation](docs/architecture.md): Detailed system architecture
- [Design Decisions](docs/decisions.md): Historical design decision records
```

## 成功条件

作成する `llms.txt` ファイルは次を満たす。
1. LLMがリポジトリの目的をすばやく理解できる
2. 必須文書への明確なナビゲーションを提供する
3. 公式llms.txt仕様へ正確に従う
4. 包括的かつ簡潔である
5. 人と機械の両方の読者に効果的に役立つ
6. プロジェクト理解に重要なファイルをすべて含む
7. 全体を通して明確で曖昧さのない言葉を使う
8. 容易に利用できるよう内容を論理的に整理する

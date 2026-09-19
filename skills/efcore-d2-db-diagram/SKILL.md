---
name: efcore-d2-db-diagram
description: 'Entity Framework Core モデルから D2 データベース図を生成します。USE FOR: EF Core データベース図、Entity Framework Core ERD、DbContext 図、C# エンティティ関連図、PostgreSQL スキーマ可視化、EF Core エンティティからの .d2 ファイル生成、Fluent API マッピング図、マイグレーションベースのデータベース図、テーブル関連、所有型、多対多結合テーブル、インデックスと制約。DO NOT USE FOR: ランタイムデバッグ、データベースマイグレーションの実行、スキーマのデプロイ、SQL パフォーマンスチューニング、draw.io 図。'
---

# EF Core D2 データベース図ジェネレーター

## 使用時機

Entity Framework Core コードベースからデータベース/ERD 図を生成したいユーザーが要求している場合、このスキルを使用します。

典型的なリクエスト：

- EF Core エンティティから D2 データベース図を生成する。
- テーブル、列、主キー、外部キーおよび関連性を可視化する。
- `DbContext`、`DbSet<T>`、`IEntityTypeConfiguration<T>`、Fluent API とマイグレーションを分析する。
- `.d2` ファイルを生成し、`d2` CLI で SVG/PNG にレンダリング可能にする。
- ASP.NET Core / .NET プロジェクトのデータベースモデルをドキュメント化する。

## 目的

実際の EF Core 永続化モデルを反映した、読みやすい D2 エンティティ関連図を作成します。これは単なる生の C# クラス形状ではなく、実際のモデルに基づきます。

ダイアグラムは以下を優先する必要があります：

1. データベースのテーブルと関連性。
2. 主キー、外部キー、必須/オプション列。
3. 所有型と値オブジェクト。
4. 多対多関連性と結合テーブル。
5. インデックス、ユニーク制約、テーブル名。
6. 明示的なマッピングがない場合の EF Core 規約のみ。

出力は `.d2` ソースコードです。`d2` CLI で SVG または PNG にレンダリングできます。

## ツール

- **d2 CLI**: `.d2` ファイルを SVG/PNG にレンダリングします。
  - `d2 input.d2 output.svg`
  - `d2 --layout=elk input.d2 output.svg`
- **d2 fmt**: D2 ファイルをフォーマットします。
  - `d2 fmt input.d2`
- MCP サーバーは必要ありません。スキルは D2 ソースコードをテキストとして生成します。

## 推奨ワークフロー

1. EF Core プロジェクト構造を読み取ります。
2. すべての `DbContext` クラスを特定します。
3. すべての `DbSet<T>` 宣言を特定します。
4. エンティティクラス、所有型、列挙型、値オブジェクトを特定します。
5. `OnModelCreating` とすべての `IEntityTypeConfiguration<T>` クラスを読み取ります。
6. テーブル名、結合テーブル、インデックス、削除動作を確認するために、入手可能な場合はマイグレーションを読み取ります。
7. D2 を書く前に正規化されたデータベースモデルを構築します。
8. 生成の前に必須の図質問調査票を実施します。
9. 生のクラスネストではなく、データベースモデルを使用して `.d2` ファイルを生成します。
10. 配信前に `d2 fmt` で D2 構文を検証します。
11. 可能な場合は `d2 --layout=elk schema.d2 schema.svg` でレンダリングします。
12. 再生成する場合は、まず EF Core マッピングとマイグレーションを再度読み取ります。

## ダイアグラム生成前の必須質問

ユーザーが同じリクエストで既に回答していない限り、新しいダイアグラムおよび再生成のたびにこれらの質問をしてください。

1. `Which DbContext should be diagrammed? (auto-detect/all/specific name)`
2. `Display columns? (all/key-only/none)`
3. `Display column types? (Yes/No)`
4. `Display nullable/required markers? (Yes/No)`
5. `Display indexes and unique constraints? (Yes/No)`
6. `Display enum values? (Yes/No)`
7. `Display owned types? (inline/separate/hide)`
8. `Display many-to-many join tables? (explicit/compact/hide)`
9. `Display audit/technical tables? (Yes/No)`
10. `Display migration-only tables not present as entities? (Yes/No)`
11. `Which grouping mode? (bounded-context/schema/namespace/flat)`
12. `Which layout engine? (elk/dagre/tala)`
13. `Which output format? (d2/svg/png)`

ユーザーが高速生成を要求する場合のデフォルト値：

- DbContext: `auto-detect`
- 列: `key-only`
- 列の型: `Yes`
- Nullable マーカー: `Yes`
- インデックス: `Yes`
- 列挙型: `No`
- 所有型: `inline`
- 結合テーブル: `explicit`
- 監査/技術テーブル: `No`
- マイグレーションのみのテーブル: `Yes`
- グループ化: `bounded-context`
- レイアウト: `elk`
- 出力: `d2`

## 参照ドキュメント

必要に応じてオンデマンドで読み込みます：

| 参照 | 読み込む時機 |
|---|---|
| `references/efcore-model-extraction.md` | DbContext、DbSet、Fluent API、設定、マイグレーションを読み取るためのルール |
| `references/d2-erd-style.md` | ERD ダイアグラムの D2 構文と視覚的規約 |
| `references/relationship-rules.md` | 1 対 1、1 対多、多対多、所有関連性を推測する方法 |
| `references/grouping-modes.md` | 境界付きコンテキスト、スキーマ、名前空間、フラットグループ化のルール |
| `references/quality-gate.md` | 生成されたダイアグラムを配信する前の最終チェックリスト |

## EF Core 抽出ルール

### ソース優先順位

ソースが不一致の場合、この優先順位を使用します：

1. 最新の適用マイグレーション / マイグレーションスナップショット。
2. `OnModelCreating` または `IEntityTypeConfiguration<T>` の Fluent API 設定。
3. データアノテーション。
4. EF Core 規約。
5. 生の C# クラス形状。

### 検出すべき必須 EF Core 概念

以下を検出して表現します：

- `DbContext` と `DbSet<T>`。
- `ToTable` からのエンティティクラス名と実際のテーブル名。
- `ToTable("Table", "schema")` からのスキーマ名。
- `HasKey`、`[Key]`、規約、マイグレーションからの主キー。
- 複合キー。
- `HasForeignKey`、ナビゲーションプロパティ、マイグレーション操作からの外部キー。
- 削除動作が明示的な場合：`Cascade`、`Restrict`、`NoAction`、`SetNull`、`ClientSetNull`。
- 必須/オプション関連性マーカー。
- `OwnsOne`、`OwnsMany`、`[Owned]` からの所有型。
- `UsingEntity` と暗黙的な EF Core 結合テーブルからの多対多関連性。
- `HasIndex`、`IsUnique`、マイグレーションからのインデックス。
- `HasAlternateKey` からの代替キー。
- Fluent API で構成されたシャドウプロパティ。
- 永続化された型または可読性に影響を与える値の変換。
- 列挙型プロパティ。
- 無視されたプロパティと無視されたエンティティ。

## ダイアグラムレンダリングルール

### テーブル

各永続化テーブルを `shape: sql_table` を使用して D2 ノードとして表現します（可能な場合）。

このコンテンツ規約を使用します：

```d2
Clients: {
  shape: sql_table
  constraint: primary_key
  Id: uuid {constraint: primary_key}
  Name: text
  Status: enum
}
```

`sql_table` が利用できない場合または検証問題を引き起こす場合は、構造化されたテキストを持つ矩形にフォールバックします。

### 関連性

依存テーブルから主要テーブルへの方向性のあるエッジを使用します。

ラベルには、既知の場合、関連性の基数と FK 名を含める必要があります：

```d2
Offers.ClientId -> Clients.Id: "N:1 FK_Offers_Clients_ClientId"
```

これらの基数ラベルを使用します：

- `1:1`
- `1:N`
- `N:1`
- `N:N`
- `owned`

### 所有型

所有型は、デフォルトでインラインレンダリングされます。

インラインの例：

```d2
Clients: {
  shape: sql_table
  Id: uuid {constraint: primary_key}
  Address.Street: text
  Address.ZipCode: text
  Address.City: text
}
```

ユーザーが `separate` を選択した場合、所有型を視覚的に従属するテーブルとして表現し、`owned` 関連性を使用します。

### 多対多

暗黙的な多対多関連性の場合、生成された結合テーブルノードを作成し、`implicit join` としてマークします。デフォルトでは明示的な結合テーブルを使用してください。これは EF Core が実際のテーブルを作成するためです。

### 技術テーブル

リクエストされない限り、デフォルトで技術テーブルを非表示にします。

例：

- `__EFMigrationsHistory`
- Hangfire テーブル
- ASP.NET Identity テーブル
- 監査ログ
- Outbox テーブル

技術テーブルが非表示の場合、ダイアグラムの後の概要で言及してください。

## グループ化モード

- `bounded-context`: 検出されたドメイン領域またはフォルダー/モジュール別にグループ化します。
- `schema`: データベーススキーマ別にグループ化します（例：`public`、`auth`、`billing`）。
- `namespace`: C# 名前空間別にグループ化します。
- `flat`: コンテナーなし、すべてのテーブルが同じレベル。

## スタイルルール

一貫したスタイルを使用します：

- 主要エンティティテーブル：実線の枠線。
- 結合テーブル：破線の枠線。
- 所有型：より薄いストロークまたはネストされたインラインフィールド。
- 技術テーブル：ミュート化されたスタイル。
- 外部テーブルまたはマイグレーション専用テーブル：点線の枠線。
- 必須関連性：実線。
- オプション関連性：破線。
- カスケード削除：ラベルサフィックス `cascade`。

## 配信前の品質ゲート

ダイアグラムを配信する前に、以下を確認してください：

- [ ] 選択された DbContext が明確である。
- [ ] すべての `DbSet<T>` エンティティが考慮されている。
- [ ] Fluent API 設定が読み取られている。
- [ ] 存在する場合、マイグレーションがチェックされている。
- [ ] テーブル名とスキーマ名が EF Core マッピングと一致している。
- [ ] 主キーが存在する。
- [ ] 外部キーと基数が表現されている。
- [ ] 所有型がユーザーの選択に従って処理されている。
- [ ] ユーザーが別途要求しない限り、多対多結合テーブルが明示的である。
- [ ] 隠されている技術テーブルが最終概要にリストされている。
- [ ] D2 構文が `d2 fmt` で有効である。
- [ ] エッジエンドポイントがコンテナー内の場合、完全なドット記法を使用している。
- [ ] ダイアグラムが読みやすく、交差が多いレイアウトを回避している。

## 出力形式

ユーザーがスキルインストールを要求する場合、このフォルダー構造を提供します：

```text
.github/
  skills/
    efcore-d2-db-diagram/
      SKILL.md
      references/
        efcore-model-extraction.md
        d2-erd-style.md
        relationship-rules.md
        grouping-modes.md
        quality-gate.md
```

ユーザーがダイアグラムの生成を要求する場合、以下を提供します：

1. `.d2` ソースファイルの内容。
2. 選択されたレイアウトエンジンを使用するレンダーコマンド。
3. 仮定と隠されたテーブルの簡潔な概要。

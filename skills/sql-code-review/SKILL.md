---
name: sql-code-review
description: 'すべての SQL データベース（MySQL、PostgreSQL、SQL Server、Oracle）を対象に、セキュリティ、保守性、コード品質を包括的に分析する汎用 SQL コードレビューアシスタント。SQL インジェクション防止、アクセス制御、コード標準、アンチパターン検出に重点を置き、完全な開発対応のため SQL 最適化プロンプトを補完する。'
---
# SQL コードレビュー

${selection}（選択がない場合はプロジェクト全体）を対象に、セキュリティ、性能、保守性、データベースのベストプラクティスに重点を置いて、SQL コードを徹底的にレビューします。

## 🔒 セキュリティ分析

### SQL インジェクション防止
```sql
-- ❌ CRITICAL: SQL Injection vulnerability
query = "SELECT * FROM users WHERE id = " + userInput;
query = f"DELETE FROM orders WHERE user_id = {user_id}";

-- ✅ SECURE: Parameterized queries
-- PostgreSQL/MySQL
PREPARE stmt FROM 'SELECT * FROM users WHERE id = ?';
EXECUTE stmt USING @user_id;

-- SQL Server
EXEC sp_executesql N'SELECT * FROM users WHERE id = @id', N'@id INT', @id = @user_id;
```

### アクセス制御と権限
- **最小権限の原則**: 必要最小限の権限だけを付与する
- **ロールベースアクセス**: ユーザーへの直接権限ではなくデータベースロールを使う
- **スキーマセキュリティ**: 適切なスキーマ所有権とアクセス制御を設定する
- **関数・プロシージャのセキュリティ**: DEFINER と INVOKER の権限を確認する

### データ保護
- **機密データの露出**: 機密列を含むテーブルでは SELECT * を避ける
- **監査ログ**: 機密操作が記録されることを確認する
- **データマスキング**: ビューや関数で機密データをマスクする
- **暗号化**: 機密データが暗号化して保存されることを確認する

## ⚡ 性能最適化

### クエリ構造の分析
```sql
-- ❌ BAD: Inefficient query patterns
SELECT DISTINCT u.* 
FROM users u, orders o, products p
WHERE u.id = o.user_id 
AND o.product_id = p.id
AND YEAR(o.order_date) = 2024;

-- ✅ GOOD: Optimized structure
SELECT u.id, u.name, u.email
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.order_date >= '2024-01-01' 
AND o.order_date < '2025-01-01';
```

### インデックス戦略のレビュー
- **不足しているインデックス**: インデックスが必要な列を特定する
- **過剰なインデックス**: 未使用または重複するインデックスを見つける
- **複合インデックス**: 複雑なクエリ向けの複数列インデックス
- **インデックス保守**: 断片化または古くなったインデックスを確認する

### JOIN 最適化
- **JOIN の種類**: 適切な JOIN（INNER、LEFT、EXISTS）か確認する
- **JOIN 順序**: 小さい結果セットを先に処理するよう最適化する
- **直積**: 欠落した JOIN 条件を特定して修正する
- **サブクエリと JOIN**: 最も効率的な方法を選ぶ

### 集約関数とウィンドウ関数
```sql
-- ❌ BAD: Inefficient aggregation
SELECT user_id, 
       (SELECT COUNT(*) FROM orders o2 WHERE o2.user_id = o1.user_id) as order_count
FROM orders o1
GROUP BY user_id;

-- ✅ GOOD: Efficient aggregation
SELECT user_id, COUNT(*) as order_count
FROM orders
GROUP BY user_id;
```

## 🛠️ コード品質と保守性

### SQL のスタイルと整形
```sql
-- ❌ BAD: Poor formatting and style
select u.id,u.name,o.total from users u left join orders o on u.id=o.user_id where u.status='active' and o.order_date>='2024-01-01';

-- ✅ GOOD: Clean, readable formatting
SELECT u.id,
       u.name,
       o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
  AND o.order_date >= '2024-01-01';
```

### 命名規則
- **一貫した命名**: テーブル、列、制約で一貫したパターンに従う
- **説明的な名前**: データベースオブジェクトには明確で意味のある名前を付ける
- **予約語**: データベースの予約語を識別子として使わない
- **大文字と小文字**: スキーマ全体で大文字・小文字の使い方を統一する

### スキーマ設計のレビュー
- **正規化**: 適切な正規化レベルにする（過剰・不足を避ける）
- **データ型**: 保存効率と性能に適したデータ型を選ぶ
- **制約**: PRIMARY KEY、FOREIGN KEY、CHECK、NOT NULL を適切に使う
- **既定値**: 列に適切な既定値を設定する

## 🗄️ データベース固有のベストプラクティス

### PostgreSQL
```sql
-- Use JSONB for JSON data
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GIN index for JSONB queries
CREATE INDEX idx_events_data ON events USING gin(data);

-- Array types for multi-value columns
CREATE TABLE tags (
    post_id INT,
    tag_names TEXT[]
);
```

### MySQL
```sql
-- Use appropriate storage engines
CREATE TABLE sessions (
    id VARCHAR(128) PRIMARY KEY,
    data TEXT,
    expires TIMESTAMP
) ENGINE=InnoDB;

-- Optimize for InnoDB
ALTER TABLE large_table 
ADD INDEX idx_covering (status, created_at, id);
```

### SQL Server
```sql
-- Use appropriate data types
CREATE TABLE products (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at DATETIME2 DEFAULT GETUTCDATE()
);

-- Columnstore indexes for analytics
CREATE COLUMNSTORE INDEX idx_sales_cs ON sales;
```

### Oracle
```sql
-- Use sequences for auto-increment
CREATE SEQUENCE user_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE users (
    id NUMBER DEFAULT user_id_seq.NEXTVAL PRIMARY KEY,
    name VARCHAR2(255) NOT NULL
);
```

## 🧪 テストと検証

### データ整合性チェック
```sql
-- Verify referential integrity
SELECT o.user_id 
FROM orders o 
LEFT JOIN users u ON o.user_id = u.id 
WHERE u.id IS NULL;

-- Check for data consistency
SELECT COUNT(*) as inconsistent_records
FROM products 
WHERE price < 0 OR stock_quantity < 0;
```

### 性能テスト
- **実行計画**: クエリの実行計画を確認する
- **負荷テスト**: 現実的なデータ量でクエリをテストする
- **ストレステスト**: 同時負荷下の性能を検証する
- **回帰テスト**: 最適化で機能が壊れないことを確認する

## 📊 よくあるアンチパターン

### N+1 クエリ問題
```sql
-- ❌ BAD: N+1 queries in application code
for user in users:
    orders = query("SELECT * FROM orders WHERE user_id = ?", user.id)

-- ✅ GOOD: Single optimized query
SELECT u.*, o.*
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```

### DISTINCT の過剰使用
```sql
-- ❌ BAD: DISTINCT masking join issues
SELECT DISTINCT u.name 
FROM users u, orders o 
WHERE u.id = o.user_id;

-- ✅ GOOD: Proper join without DISTINCT
SELECT u.name
FROM users u
INNER JOIN orders o ON u.id = o.user_id
GROUP BY u.name;
```

### WHERE 句での関数の誤用
```sql
-- ❌ BAD: Functions prevent index usage
SELECT * FROM orders 
WHERE YEAR(order_date) = 2024;

-- ✅ GOOD: Range conditions use indexes
SELECT * FROM orders 
WHERE order_date >= '2024-01-01' 
  AND order_date < '2025-01-01';
```

## 📋 SQL レビューチェックリスト

### セキュリティ
- [ ] すべてのユーザー入力をパラメーター化している
- [ ] 文字列連結による動的 SQL の構築がない
- [ ] 適切なアクセス制御と権限を設定している
- [ ] 機密データを適切に保護している
- [ ] SQL インジェクションの攻撃経路を排除している

### 性能
- [ ] 頻繁に検索する列にインデックスがある
- [ ] 不要な SELECT * がない
- [ ] JOIN を最適化し、適切な種類を使っている
- [ ] WHERE 句が選択性を持ち、インデックスを使っている
- [ ] サブクエリを最適化するか JOIN に変換している

### コード品質
- [ ] 命名規則が一貫している
- [ ] 適切に整形・インデントしている
- [ ] 複雑なロジックに意味のあるコメントがある
- [ ] 適切なデータ型を使っている
- [ ] エラー処理を実装している

### スキーマ設計
- [ ] テーブルを適切に正規化している
- [ ] 制約でデータ整合性を保証している
- [ ] インデックスがクエリパターンを支えている
- [ ] 外部キー関係を定義している
- [ ] 既定値が適切である

## 🎯 レビュー出力形式

### 問題テンプレート
````
## [PRIORITY] [CATEGORY]: [Brief Description]

**Location**: [Table/View/Procedure name and line number if applicable]
**Issue**: [Detailed explanation of the problem]
**Security Risk**: [If applicable - injection risk, data exposure, etc.]
**Performance Impact**: [Query cost, execution time impact]
**Recommendation**: [Specific fix with code example]

**Before**:
```sql
-- Problematic SQL
```

**After**:
```sql
-- Improved SQL
```

**Expected Improvement**: [Performance gain, security benefit]
````

### 総合評価
- **セキュリティスコア**: [1-10] - SQL インジェクション対策、アクセス制御
- **性能スコア**: [1-10] - クエリ効率、インデックス利用
- **保守性スコア**: [1-10] - コード品質、ドキュメント
- **スキーマ品質スコア**: [1-10] - 設計パターン、正規化

### 優先アクション上位 3 件
1. **[重大なセキュリティ修正]**: SQL インジェクションの脆弱性に対処する
2. **[性能最適化]**: 不足しているインデックスを追加するか、クエリを最適化する
3. **[コード品質]**: 命名規則とドキュメントを改善する

実行可能でデータベース非依存の推奨事項を示しつつ、プラットフォーム固有の最適化とベストプラクティスを強調します。

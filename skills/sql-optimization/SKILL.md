---
name: sql-optimization
description: 'すべての SQL データベース（MySQL、PostgreSQL、SQL Server、Oracle）を対象に、クエリチューニング、インデックス戦略、データベース性能分析を包括的に支援する汎用 SQL 性能最適化アシスタント。実行計画分析、ページング最適化、バッチ処理、性能監視の指針を提供する。'
---
# SQL 性能最適化アシスタント

${selection}（選択がない場合はプロジェクト全体）を対象に、SQL の性能最適化を行う専門家です。MySQL、PostgreSQL、SQL Server、Oracle、その他の SQL データベースで使える汎用的な SQL 最適化技法に重点を置きます。

## 🎯 主な最適化領域

### クエリ性能分析
```sql
-- ❌ BAD: Inefficient query patterns
SELECT * FROM orders o
WHERE YEAR(o.created_at) = 2024
  AND o.customer_id IN (
      SELECT c.id FROM customers c WHERE c.status = 'active'
  );

-- ✅ GOOD: Optimized query with proper indexing hints
SELECT o.id, o.customer_id, o.total_amount, o.created_at
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id
WHERE o.created_at >= '2024-01-01' 
  AND o.created_at < '2025-01-01'
  AND c.status = 'active';

-- Required indexes:
-- CREATE INDEX idx_orders_created_at ON orders(created_at);
-- CREATE INDEX idx_customers_status ON customers(status);
-- CREATE INDEX idx_orders_customer_id ON orders(customer_id);
```

### インデックス戦略の最適化
```sql
-- ❌ BAD: Poor indexing strategy
CREATE INDEX idx_user_data ON users(email, first_name, last_name, created_at);

-- ✅ GOOD: Optimized composite indexing
-- For queries filtering by email first, then sorting by created_at
CREATE INDEX idx_users_email_created ON users(email, created_at);

-- For full-text name searches
CREATE INDEX idx_users_name ON users(last_name, first_name);

-- For user status queries
CREATE INDEX idx_users_status_created ON users(status, created_at)
WHERE status IS NOT NULL;
```

### サブクエリの最適化
```sql
-- ❌ BAD: Correlated subquery
SELECT p.product_name, p.price
FROM products p
WHERE p.price > (
    SELECT AVG(price) 
    FROM products p2 
    WHERE p2.category_id = p.category_id
);

-- ✅ GOOD: Window function approach
SELECT product_name, price
FROM (
    SELECT product_name, price,
           AVG(price) OVER (PARTITION BY category_id) as avg_category_price
    FROM products
) ranked
WHERE price > avg_category_price;
```

## 📊 性能チューニング技法

### JOIN の最適化
```sql
-- ❌ BAD: Inefficient JOIN order and conditions
SELECT o.*, c.name, p.product_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
WHERE o.created_at > '2024-01-01'
  AND c.status = 'active';

-- ✅ GOOD: Optimized JOIN with filtering
SELECT o.id, o.total_amount, c.name, p.product_name
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id AND c.status = 'active'
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.created_at > '2024-01-01';
```

### ページングの最適化
```sql
-- ❌ BAD: OFFSET-based pagination (slow for large offsets)
SELECT * FROM products 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 10000;

-- ✅ GOOD: Cursor-based pagination
SELECT * FROM products 
WHERE created_at < '2024-06-15 10:30:00'
ORDER BY created_at DESC 
LIMIT 20;

-- Or using ID-based cursor
SELECT * FROM products 
WHERE id > 1000
ORDER BY id 
LIMIT 20;
```

### 集約の最適化
```sql
-- ❌ BAD: Multiple separate aggregation queries
SELECT COUNT(*) FROM orders WHERE status = 'pending';
SELECT COUNT(*) FROM orders WHERE status = 'shipped';
SELECT COUNT(*) FROM orders WHERE status = 'delivered';

-- ✅ GOOD: Single query with conditional aggregation
SELECT 
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_count,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count
FROM orders;
```

## 🔍 クエリのアンチパターン

### SELECT の性能問題
```sql
-- ❌ BAD: SELECT * anti-pattern
SELECT * FROM large_table lt
JOIN another_table at ON lt.id = at.ref_id;

-- ✅ GOOD: Explicit column selection
SELECT lt.id, lt.name, at.value
FROM large_table lt
JOIN another_table at ON lt.id = at.ref_id;
```

### WHERE 句の最適化
```sql
-- ❌ BAD: Function calls in WHERE clause
SELECT * FROM orders 
WHERE UPPER(customer_email) = 'JOHN@EXAMPLE.COM';

-- ✅ GOOD: Index-friendly WHERE clause
SELECT * FROM orders 
WHERE customer_email = 'john@example.com';
-- Consider: CREATE INDEX idx_orders_email ON orders(LOWER(customer_email));
```

### OR と UNION の最適化
```sql
-- ❌ BAD: Complex OR conditions
SELECT * FROM products 
WHERE (category = 'electronics' AND price < 1000)
   OR (category = 'books' AND price < 50);

-- ✅ GOOD: UNION approach for better optimization
SELECT * FROM products WHERE category = 'electronics' AND price < 1000
UNION ALL
SELECT * FROM products WHERE category = 'books' AND price < 50;
```

## 📈 データベース非依存の最適化

### バッチ処理
```sql
-- ❌ BAD: Row-by-row operations
INSERT INTO products (name, price) VALUES ('Product 1', 10.00);
INSERT INTO products (name, price) VALUES ('Product 2', 15.00);
INSERT INTO products (name, price) VALUES ('Product 3', 20.00);

-- ✅ GOOD: Batch insert
INSERT INTO products (name, price) VALUES 
('Product 1', 10.00),
('Product 2', 15.00),
('Product 3', 20.00);
```

### 一時テーブルの使用
```sql
-- ✅ GOOD: Using temporary tables for complex operations
CREATE TEMPORARY TABLE temp_calculations AS
SELECT customer_id, 
       SUM(total_amount) as total_spent,
       COUNT(*) as order_count
FROM orders 
WHERE created_at >= '2024-01-01'
GROUP BY customer_id;

-- Use the temp table for further calculations
SELECT c.name, tc.total_spent, tc.order_count
FROM temp_calculations tc
JOIN customers c ON tc.customer_id = c.id
WHERE tc.total_spent > 1000;
```

## 🛠️ インデックス管理

### インデックス設計の原則
```sql
-- ✅ GOOD: Covering index design
CREATE INDEX idx_orders_covering 
ON orders(customer_id, created_at) 
INCLUDE (total_amount, status);  -- SQL Server syntax
-- Or: CREATE INDEX idx_orders_covering ON orders(customer_id, created_at, total_amount, status); -- Other databases
```

### 部分インデックス戦略
```sql
-- ✅ GOOD: Partial indexes for specific conditions
CREATE INDEX idx_orders_active 
ON orders(created_at) 
WHERE status IN ('pending', 'processing');
```

## 📊 性能監視クエリ

### クエリ性能分析
```sql
-- Generic approach to identify slow queries
-- (Specific syntax varies by database)

-- For MySQL:
SELECT query_time, lock_time, rows_sent, rows_examined, sql_text
FROM mysql.slow_log
ORDER BY query_time DESC;

-- For PostgreSQL:
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC;

-- For SQL Server:
SELECT 
    qs.total_elapsed_time/qs.execution_count as avg_elapsed_time,
    qs.execution_count,
    SUBSTRING(qt.text, (qs.statement_start_offset/2)+1,
        ((CASE qs.statement_end_offset WHEN -1 THEN DATALENGTH(qt.text)
        ELSE qs.statement_end_offset END - qs.statement_start_offset)/2)+1) as query_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
ORDER BY avg_elapsed_time DESC;
```

## 🎯 汎用最適化チェックリスト

### クエリ構造
- [ ] 本番クエリで SELECT * を避けている
- [ ] 適切な JOIN の種類（INNER、LEFT、RIGHT）を使っている
- [ ] WHERE 句で早期に絞り込んでいる
- [ ] 適切な場合はサブクエリで IN ではなく EXISTS を使っている
- [ ] インデックス利用を妨げる WHERE 句の関数を避けている

### インデックス戦略
- [ ] 頻繁に検索する列へインデックスを作成している
- [ ] 複合インデックスを適切な列順で使っている
- [ ] 過剰なインデックスを避けている（INSERT/UPDATE 性能に影響する）
- [ ] 有効な場面でカバリングインデックスを使っている
- [ ] 特定のクエリパターン向けに部分インデックスを作成している

### データ型とスキーマ
- [ ] 保存効率に適したデータ型を使っている
- [ ] 適切に正規化している（OLTP は 3NF、OLAP は非正規化）
- [ ] クエリオプティマイザーを助ける制約を使っている
- [ ] 適切な場合は大きなテーブルをパーティション分割している

### クエリパターン
- [ ] 結果セットの制御に LIMIT/TOP を使っている
- [ ] 効率的なページング戦略を実装している
- [ ] 大量データ変更にバッチ処理を使っている
- [ ] N+1 クエリ問題を避けている
- [ ] 繰り返し実行するクエリにプリペアドステートメントを使っている

### 性能テスト
- [ ] 現実的なデータ量でクエリをテストしている
- [ ] クエリ実行計画を分析している
- [ ] 時系列でクエリ性能を監視している
- [ ] 遅いクエリのアラートを設定している
- [ ] インデックス利用状況を定期的に分析している

## 📝 最適化の方法論

1. **特定**: データベース固有のツールで遅いクエリを見つける
2. **分析**: 実行計画を確認し、ボトルネックを特定する
3. **最適化**: 適切な最適化技法を適用する
4. **テスト**: 性能改善を検証する
5. **監視**: 性能指標を継続的に追跡する
6. **反復**: 定期的に性能をレビューして最適化する

測定可能な性能改善に重点を置き、現実的なデータ量とクエリパターンで必ず最適化をテストしてください。

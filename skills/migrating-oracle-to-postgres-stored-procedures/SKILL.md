---
name: migrating-oracle-to-postgres-stored-procedures
description: 'Oracle PL/SQLストアドプロシージャをPostgreSQL PL/pgSQLへ移行します。Oracle固有の構文を変換し、メソッドシグネチャと型アンカー付きパラメーターを保持し、適切な場合はorafceを活用し、明示的な照合順序マッピングを適用します（`COLLATE "C"`は適切な場合のみ、ロケール照合順序は必要な場合に使用）。データベース移行中にOracleのストアドプロシージャまたは関数をPostgreSQLの同等物へ変換する際に使用します。'
---

# OracleからPostgreSQLへのストアドプロシージャ移行

Oracle PL/SQLストアドプロシージャおよび関数をPostgreSQL PL/pgSQLの同等物へ変換します。

## Workflow

```
進捗:
- [ ] ステップ1: Oracleソースプロシージャを読む
- [ ] ステップ2: PostgreSQL PL/pgSQLへ変換する
- [ ] ステップ3: 移行したプロシージャをPostgres出力ディレクトリへ書き込む
```

**ステップ1: Oracleソースプロシージャを読む**

`.github/oracle-to-postgres-migration/DDL/Oracle/Procedures and Functions/`からOracleストアドプロシージャを読みます。型解決のために、`.github/oracle-to-postgres-migration/DDL/Oracle/Tables and Views/`にあるOracleのテーブル/ビュー定義を参照します。

**ステップ2: PostgreSQL PL/pgSQLへ変換する**

次の変換規則を適用します:

- すべてのOracle固有構文をPostgreSQLの同等物へ変換します。
- 元の機能と制御フローのロジックを保持します。
- 型アンカー付き入力パラメーターを維持します（例: `PARAM_NAME IN table_name.column_name%TYPE`）。
- 他のプロシージャへ渡す出力パラメーターには明示的な型（`NUMERIC`、`VARCHAR`、`INTEGER`）を使用します。これらには型アンカーを使用しません。
- メソッドシグネチャを変更しません。
- Oracleソースにすでに存在する場合を除き、オブジェクト名にスキーマ名を接頭辞として付けません。
- 例外処理とロールバックロジックは変更しません。
- `COMMENT`または`GRANT`ステートメントを生成しません。
- テキストを並べ替える際は、意図して照合順序を適用します:
  - Oracle互換のバイナリ順序が必要で、ほかの並べ替え順序が指定されていない場合にのみ`COLLATE "C"`を使用します。
  - Oracleが明示的な言語学的ソートを使用していた場合（例: `NLS_SORT = French`）、`"C"`ではなく明示的なPostgreSQLロケール照合順序へマッピングします。
  - 対象環境で照合順序を検出するには、`SELECT collname, collprovider, collcollate, collctype FROM pg_collation ORDER BY collname;`を使用します。
- `UNION ALL`をレビューのチェックポイントとして扱います。分岐ごとにプラン品質を検証し、結合分岐のプランニングによって回帰が生じる場合（例: 大きなテーブルで予期しないシーケンシャルスキャン）は再構成します。
- 明瞭さまたは忠実性が向上する場合は、`orafce`拡張機能を活用します。

対象スキーマの詳細については、`.github/oracle-to-postgres-migration/DDL/Postgres/{ProjectName}/Tables and Views/`にあるPostgreSQLのテーブル/ビュー定義を参照します。

**ステップ3: 移行したプロシージャをPostgres出力ディレクトリへ書き込む**

各移行済みプロシージャは、`.github/oracle-to-postgres-migration/DDL/Postgres/{ProjectName}/Procedures and Functions/{PACKAGE_NAME_IF_APPLICABLE}/`の下に個別のファイルとして配置します。ファイルごとに1つのプロシージャを配置します。

> `{ProjectName}`は、スペースを`-`に正規化したプロジェクトのアセンブリ名/フォルダー名です（例: `MyApp.DataAccess`）。これは、エージェントおよびほかの移行スキルで使用されるパスと一致します。

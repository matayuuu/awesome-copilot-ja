---
name: creating-oracle-to-postgres-master-migration-plan
description: '.NETソリューション内の全プロジェクトを検出し、OracleからPostgreSQLへの移行対象かどうかを分類して、永続的なマスター移行計画を作成する。複数プロジェクトのOracleからPostgreSQLへの移行開始、移行インベントリの作成、Oracle依存関係を含む.NETプロジェクトの評価に使用する。'
---

# OracleからPostgreSQLへのマスター移行計画の作成

.NETソリューションを分析し、すべてのプロジェクトをOracle→PostgreSQLの移行対象かどうかで分類して、後続のエージェントやSkillが解析できる構造化された計画を作成する。

## ワークフロー

```
Progress:
- [ ] Step 1: Discover projects in the solution
- [ ] Step 2: Classify each project
- [ ] Step 3: Confirm with user
- [ ] Step 4: Write the plan file
```

**ステップ1: プロジェクトを検出する**

ワークスペースのルートでソリューションファイル（拡張子は `.sln` または `.slnx`）を探す。複数ある場合はユーザーに確認する。ファイルを解析して、すべての `.csproj` プロジェクト参照を抽出する。各プロジェクトの名前、パス、種類（クラスライブラリ、Web API、コンソール、テストなど）を記録する。

**ステップ2: 各プロジェクトを分類する**

テスト以外の全プロジェクトを走査し、Oracleを示す次の要素を探す。

- NuGet参照: `Oracle.ManagedDataAccess`、`Oracle.EntityFrameworkCore`（`.csproj` と `packages.config` を確認）
- 構成項目: `appsettings.json`、`web.config`、`app.config` 内のOracle接続文字列
- コードでの使用: `OracleConnection`、`OracleCommand`、`OracleDataReader`
- `.github/oracle-to-postgres-migration/DDL/Oracle/` 配下のDDL相互参照（存在する場合）

プロジェクトごとに次のいずれか1つを割り当てる。

| 分類 | 意味 |
|---|---|
| **MIGRATE** | 変換が必要なOracleとのやり取りがある |
| **SKIP** | Oracleを示す要素がない（UI専用、共有ユーティリティなど） |
| **ALREADY_MIGRATED** | `-postgres` または `.Postgres` の複製が存在し、処理済みと判断できる |
| **TEST_PROJECT** | テストプロジェクト。テスト用Workflowで処理する |

**ステップ3: ユーザーに確認する**

分類済みの一覧を提示する。確定前に、ユーザーが分類または移行順序を調整できるようにする。

**ステップ4: 計画ファイルを書く**

保存先: `.github/oracle-to-postgres-migration/Reports/MasterMigrationPlan.md`

後続の利用者がこの構造に依存するため、次のテンプレートを正確に使用する。

````markdown
# Master Migration Plan

**Solution:** {solution file name}
**Solution Root:** {REPOSITORY_ROOT}
**Created:** {timestamp}
**Last Updated:** {timestamp}

## DDL Artifacts

**Location:** {path to DDL artifacts, e.g., `.github/oracle-to-postgres-migration/DDL/`}
**External tool used:** {Yes / No} — {If Yes, name the tool (e.g., `ora2pg`) and note that Phase 4 (Schema & DDL Migration) can be skipped; PostgreSQL DDL artifacts already exist.}

## Solution Summary

| Metric | Count |
|--------|-------|
| Total projects in solution | {n} |
| Projects requiring migration | {n} |
| Projects already migrated | {n} |
| Projects skipped (no Oracle usage) | {n} |
| Test projects (handled separately) | {n} |

## Project Inventory

| # | Project Name | Path | Classification | Notes |
|---|---|---|---|---|
| 1 | {name} | {relative path} | MIGRATE | {notes} |
| 2 | {name} | {relative path} | SKIP | No Oracle dependencies |

## Migration Order

1. **{ProjectName}** — {rationale, e.g., "Core data access library; other projects depend on it."}
2. **{ProjectName}** — {rationale}
````

共有ライブラリや基盤ライブラリが依存先より先に移行されるよう、プロジェクトを並べる。

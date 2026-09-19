---
name: creating-oracle-to-postgres-migration-bug-report
description: 'OracleからPostgreSQLへの移行中に見つかった不具合について、構造化されたバグレポートを作成する。OracleとPostgreSQLの動作差異を、重大度、根本原因、修正手順を含む実行可能なバグレポートとして記録するときに使用する。'
---

# OracleからPostgreSQLへの移行バグレポートの作成

## 使用する場面

- OracleとPostgreSQLの動作差異に起因する不具合を記録するとき
- OracleからPostgreSQLへの移行プロジェクトのバグレポートを作成またはレビューするとき

## バグレポートの形式

[references/BUG-REPORT-TEMPLATE.md](references/BUG-REPORT-TEMPLATE.md) のテンプレートを使用する。各レポートには次を含める。

- **Status**: ✅ RESOLVED、⛔ UNRESOLVED、⏳ IN PROGRESSのいずれか
- **Component**: 影響を受けるエンドポイント、リポジトリ、ストアドプロシージャ
- **Test**: 関連する自動テスト名
- **Severity**: 影響範囲に基づくLow / Medium / High / Critical
- **Problem**: 期待されるOracleの動作と、観測されたPostgreSQLの動作
- **Scenario**: シードデータ、操作、期待結果、実際の結果を含む順序立てた再現手順
- **Root Cause**: 不具合の原因となるOracleとPostgreSQLの具体的な動作差異
- **Solution**: 明示的なファイルパスを伴う、実施済みまたは必要な変更
- **Validation**: 両方のデータベースで修正を確認する手順

## OracleからPostgreSQLへの移行指針

- **Oracleを正本とする。** 期待される動作はOracleの基準から定義する
- 空文字列とNULL、型強制の厳密さ、照合順序、シーケンス値、タイムゾーン、パディング、制約など、データ層の微妙な差異を明示する
- 正しい動作に必要でない限りクライアントコードの変更を避ける。提案する場合は明確に記録し、理由を説明する

## 文体

- 平易な言葉、短い文、明確な次のアクションを使う
- 現在形または過去形に統一する
- 手順と検証には箇条書きや番号付きリストを使う
- 証拠として必要最小限のSQL抜粋とログを使い、機密データを省いて再現可能なスニペットにする
- 既存のランタイムおよび言語バージョンを守り、推測に基づく修正を避ける

## ファイル名規則

バグレポートは `.github/oracle-to-postgres-migration/Reports/{ProjectName}/BUG_REPORT_<DescriptiveSlug>.md` に保存する。
- `{ProjectName}` は、空白を `-` に正規化したプロジェクトのアセンブリ名またはフォルダー名（例: `MyApp.DataAccess`）
- `<DescriptiveSlug>` は、不具合を表す短いPascalCase識別子（例: `EmptyStringNullHandling`、`RefCursorUnwrapFailure`）

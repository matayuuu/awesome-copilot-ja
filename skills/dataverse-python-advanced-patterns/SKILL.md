---
name: dataverse-python-advanced-patterns
description: '高度なパターン、エラー処理、最適化手法を使用して Dataverse SDK の本番向けコードを生成する。'
---

あなたは Dataverse SDK for Python の専門家です。次の内容を実演する本番対応の Python コードを生成してください。

1. **エラー処理と再試行ロジック** — DataverseError をキャッチし、is_transient を確認して、指数バックオフを実装する。
2. **バッチ操作** — 適切なエラー回復を備えた一括作成、更新、削除を行う。
3. **OData クエリの最適化** — 正しい論理名を使って、filter、select、orderby、expand、ページングを行う。
4. **テーブルメタデータ** — 適切な列型定義（選択肢には IntEnum）を使ってカスタムテーブルを作成、検査、削除する。
5. **構成とタイムアウト** — http_retries、http_backoff、http_timeout、language_code に DataverseConfig を使う。
6. **キャッシュ管理** — メタデータ変更時に選択リストのキャッシュをフラッシュする。
7. **ファイル操作** — 大容量ファイルをチャンクでアップロードし、チャンクアップロードと単純アップロードを適切に扱う。
8. **Pandas 統合** — 適切な場合は DataFrame ワークフローに PandasODataClient を使う。

docstring、型ヒント、使用する各クラスとメソッドの公式 API リファレンスへのリンクを含めてください。

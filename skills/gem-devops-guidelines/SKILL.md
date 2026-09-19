---
name: gem-devops-guidelines
description: インフラ、デプロイ、CI/CD、Docker、Kubernetes、ヘルスチェック、ロールバック、フィーチャーフラグ、本番環境対応、モバイルリリースワークフローの設計またはレビューを行います。DevOps、プラットフォーム、コンテナ、パイプライン、リリース作業で使います。
---

# DevOps ガイドライン

ワークロード、プロバイダー、環境、受け入れ条件に関連するセクションだけを適用します。Docker、Kubernetes、モバイル、本番環境、ロールバック、ヘルス、フィーチャーフラグ、安全性チェックが該当しない場合は省略してください。

## デプロイ戦略

- ローリング（既定）: 段階的で無停止の置き換え。
- Blue-green: 環境を複製し、原子的に切り替えて即時ロールバックし、インフラを 2 倍にする。
- カナリア: まず小さな割合から流量を向ける。トラフィック分割が必要。

## Docker

- ベースイメージのタグを固定する（`node:22-alpine`）。`:latest` は使用しない。
- マルチステージビルドと非 root ユーザーを使う。キャッシュのために依存関係を先にコピーする。
- `.dockerignore`: `node_modules`、`.git`、tests を除外する。`HEALTHCHECK` とリソース制限を定義する。

## Kubernetes

起動、readiness、liveness のプローブを、ワークロードに適した初期遅延としきい値で設定します。

## CI/CD

- PR: lint -> typecheck -> unit -> integration -> preview
- Main: build -> staging -> smoke -> production

## ヘルスとシャットダウン

- シンプル: `GET /health` -> `{ "status": "ok" }`
- 詳細: 依存関係、稼働時間、バージョン
- サービスは意味のあるヘルス状態を公開し、ワークロードが必要とする場合は `SIGTERM` を Graceful に処理しなければならない。

## 設定

環境変数（Twelve-Factor）を使い、環境ごとに分離します。起動時に検証し、fail fast で進めます。シークレットをコミットしたり、`NODE_ENV=production` をハードコードしてはいけません。

## ロールバック

- Kubernetes: `kubectl rollout undo`
- Vercel: `vercel rollback`
- Docker: 事前に固定したイメージを再デプロイする

## フィーチャーフラグ

- ライフサイクル: 作成 -> 有効化 -> 5% -> 25% -> 50% -> 100% -> フラグとデッドコードを削除
- すべてのフラグには所有者、期限、ロールバックトリガーが必要。2 週間以内に削除する。

## チェックリスト

- デプロイ前: テスト通過、コードレビュー、環境変数、マイグレーション、ロールバック計画
- デプロイ後: 正常稼働、監視対象、古い Pod の終了、結果の記録
- 本番環境: テスト通過；ハードコードシークレットなし；JSON ログ；意味のあるヘルス状態；固定バージョン；検証済みの環境変数；リソース制限；TLS；CVE スキャン；CORS；レート制限；CSP/HSTS/X-Frame-Options；ロールバック確認済み；ランブック；オンコール
- 実行可能またはセキュリティ上重要なワークロードにはセキュリティ/CVE チェックを適用する。

## モバイルデプロイ

- EAS: `eas build:configure`; `eas build -p ios|android --profile preview`; `eas update --branch production`; `--auto-submit`
- Fastlane: iOS `match`/`cert`/`sigh`/`pilot`; Android Gradle/`supply`
- 認証情報は Git ではなく env/secret storage に置く。iOS 署名は `fastlane match` で自動化し、Android では `keytool` と Google Play App Signing を使う。
- TestFlight: 内部テストは即時、外部テストは 90 日 / 100 人のテスター。Google Play: internal/beta/production。レビューに 1–7 日を見込む。
- ロールバック: EAS `eas update:rollback`; ネイティブリリースはビルドを差し戻す; ストアリリースは段階的ロールアウトを縮小する。

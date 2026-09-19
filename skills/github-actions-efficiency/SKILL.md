---
name: github-actions-efficiency
description: 'GitHub Actions のワークフロー効率を監査し、CI 分数とコストを削減する修正案を提案します。'
---

# GitHub Actions 効率化

このスキルを、GitHub Actions の効率化作業のための簡潔な入口として使います。リポジトリを確認し、無駄の発生源を特定し、現在のタスクに必要な参照資料だけを読み込んでください。

ワークフローがまだ存在しない場合は、[`references/actions.md`](./references/actions.md) を読み込み、手順の前にベースラインを定義してください。

**シェルまたは `gh` CLI へのアクセスが利用できない場合:** ユーザーに `.github/workflows/` の内容と `gh run list --limit 10` の出力を貼り付けてもらってください。ファイルが一部しか提供されない場合は、その旨を明記してください: "Audit based on provided files only; some insights may be incomplete."（提供されたファイルのみを基に監査しており、一部の知見は不完全かもしれません。）ファイルだけでの応答は次のように始めてください: "**Static-only analysis** (not confirmed with live runs)."（**静的解析のみ**（実行中の実行結果では確認していません））

## このスキルを使う場合

- GitHub Actions の実行時間、CI コスト、または無駄なワークフロー実行を削減したい場合。
- リポジトリ内に `.github/workflows/` にある既存のワークフローや、GitHub Actions の設定に関する質問がある場合。
- キャッシュ、同時実行制御、path フィルター、マトリクス削減、ジョブ最適化、またはワークフロー固有の修正を求められている場合。
- 新しい GitHub Actions ワークフローや CI ベースラインをゼロから作成したい場合。

## 必要なものだけを読み込む

- [`references/actions.md`](./references/actions.md) — 監査、ジョブゲーティング、マトリクス削減、ライブ検証、ワークフロー固有の修正。
- [`references/reporting.md`](./references/reporting.md) — ユーザーが before/after の効率レポートを依頼した場合。
- [`references/patterns.md`](./references/patterns.md) — インライン監査コマンドでは十分でない場合の YAML の完全な例。

## コアワークフロー

### 1. まず測定する

```bash
rg -n "on:|concurrency:|paths:|paths-ignore:|strategy:|matrix:|cache:" .github/workflows
gh run list --limit 10
run_id=$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')
gh run view "$run_id" --log-failed
```

次を探す: 依存関係キャッシュの欠落、`concurrency` によるキャンセルの欠落、トリガーの広すぎる範囲、重複したワークフローのカバレッジ、そしてスコープに関係なくすべての変更で実行される高コストジョブ。

### 2. ガードレールを適用する

提案した修正を、推奨する前に次のルールに照らして確認してください:

1. 必須の検証を隠さない — リリース、スキーマ、マイグレーション、共有ライブラリのチェックを削除する修正は却下する。
2. 正当な理由なく並列性を下げない — ユーザーがレイテンシよりコストを優先し、かつ新しいクリティカルパスが元の 1.25 倍以内に収まる場合に限り採用する。
3. 明示されたマトリクスの実行のみ保持する — 明示されたバージョンやプラットフォームの約束のないマトリクス項目は除外する。
4. 書き戻しジョブは opt-in トリガーを使用する — フォーマッターや bot ジョブが自動実行される場合は、フラグを立てる（削除はしない）代わりに opt-in トリガーを推奨する。
5. リポジトリ変更と org 設定を分離する — リポジトリで編集可能な YAML と org レベルまたは GitHub アカウント設定を混ぜる修正は、2 つの別個の推奨として分ける。

### 3. 上位 3 件の修正を選ぶ

以下の 6 つの候補から、ステップ 1 の監査証跡に基づいて裏付けられ、かつステップ 2 のガードレールをすべて満たすものだけを残す。生存候補は、推定される毎日の CI 分節約数（1 回あたりの節約 × 1 日あたりの実行回数）で順位付けする。両要件を満たす候補を最大 3 件まで選ぶ。

1. ロックファイルベースのキーで依存関係キャッシュを追加する
2. `concurrency` によるキャンセルを追加または修正する
3. ジョブを統合する前に重複したワークフローのカバレッジを削除する
4. ワークフローまたはジョブのトリガーを安全に狭める
5. リスクとイベント種別に合わせてマトリクスの幅を縮小する
6. クリティカルパス上の独立ジョブを並列化する

### 4. 検証する

- `gh` CLI へのアクセスが可能な場合、非保護ブランチでのライブテスト push を実行し、path gating と concurrency cancellation を検証する。
- ライブ検証ができない場合は、出力で明示的にそのことを述べる。
- YAML が正しく見えても、予期しないライブ挙動は実際のバグとして扱う。

## 必須出力

1. **Waste sources** — ステップ 1 で見つかった主なコストまたはレイテンシ要因
2. **Proposed fixes** — 監査証跡に基づく上位 3 件（または残る候補）
3. **Validation** — 実際にライブで証明できたこと、ローカルのみで確認したこと、残るリスク
4. **Impact** — 期待される節約額と実測された節約額の比較。PR の壁時計時間と総ランナー時間を分けて説明する

## 参考資料

- [`references/actions.md`](./references/actions.md)
- [`references/reporting.md`](./references/reporting.md)
- [`references/patterns.md`](./references/patterns.md)
- [`references/review-rubric.md`](./references/review-rubric.md) — 完了した効率化作業をレビューするときに読み込む

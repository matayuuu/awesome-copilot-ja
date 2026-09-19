---
name: bug-reproduction-brief
description: '曖昧、断続的、または環境依存のバグ報告を、修正を提案する前に最小限の根拠付き再現手順へ変換する。'
---

# バグ再現ブリーフ

バグ報告が不完全、断続的、環境依存、または推定原因と混在している場合にこのスキルを使用します。目的は、診断または修正を始める前に、観測可能な最小の失敗を証明することです。

## 1. 観測された失敗を記録する

正確なエラー、不正な出力、タイムスタンプ、影響を受けたルートまたはコマンド、および既知の最小入力を記録します。秘密情報や個人データを含めずに関連ログを保持します。伝聞による説明には未検証であることを付記します。

## 2. 環境を特定する

確認できる事実だけを記録します。

- リポジトリとコミット
- ランタイムおよびパッケージマネージャーのバージョン
- オペレーティングシステムまたはコンテナー
- 依存関係のロックファイル
- 関連する機能フラグ
- 対象がローカル、テスト、ステージング、または本番のどれか

資格情報や本番構成を推測してはいけません。

## 3. 期待結果と実際の結果を分ける

観測可能な文を明示的に二つ記述します。

```text
Expected: [observable result]
Actual:   [observable result, including status or error]
```

推定原因をいずれの文にも含めないでください。

## 4. 再現を絞り込む

報告された経路から始め、無関係なデータ、サービス、手順を一つずつ取り除きます。失敗が続く最小のフィクスチャを維持します。失敗が止まった場合は、最後に取り除いた条件を戻し、記録します。

本番環境で再現するよりも、分離されたテスト、最小スクリプト、または最小限で安全なリクエストを優先します。

## 5. 再現性を証明する

安全な場合は最小再現を少なくとも二回実行します。コマンドと出力を記録します。失敗が断続的な場合は、決定的であると断定せず、観測された頻度と期間を報告します。

## 6. 修正前に止める

検証済みの再現が成果物です。ブリーフ作成中に実装コードを編集しないでください。証拠を失わせたり、診断と修復を混同したりするおそれがあります。

## 出力

```markdown
# Bug Reproduction Brief

- Target and commit:
- Environment:
- Expected:
- Actual:
- Minimal steps:
- Minimal fixture:
- Reproduced: yes / no / intermittent
- Evidence:
- Unknowns:
- Safe next hypothesis to test:
```

## 安全上の境界

- バグ再現だけを目的に本番データを変更しない。
- 秘密情報、顧客記録、非公開ソースを公開しない。
- 相関関係だけから根本原因を主張しない。
- 読み取り専用または可逆的な調査を先に行う。
- 検証済みの再現後に停止する。診断と修正は別のワークフローである。

## プロンプト例

```text
Use the Bug Reproduction Brief skill on the failing checkout test. Do not fix it yet. Reduce it to the smallest safe failing fixture and report the exact command evidence, expected result, actual result, and remaining unknowns.
```

## 出典とライセンス

Adapted from the MIT-licensed workflow at https://github.com/skyestrela/ai-agent-skill-preview.

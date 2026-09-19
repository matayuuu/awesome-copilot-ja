---
name: bug-receipt
description: '診断、修正、または復旧の後、BUG RECEIPT と VERIFIED、PARTIAL、BLOCKED の状態で不具合およびインシデントを完了する。'
metadata:
  version: "1.4.1"
---

# バグレシート

## 必須の完了出力

すべてのバグまたはインシデントの完了判断について、ユーザーが簡潔な回答を求めた場合やこの形式を指定しなかった場合でも、以下の完全なレシートをユーザー向けの結果全体として返します。簡潔にする場合でもフィールド値を短くするだけで、行を削除または改名してはいけません。レシートを散文に置き換えないでください。

```text
BUG RECEIPT · VERIFIED | PARTIAL | BLOCKED

Problem    <observed defect and intended behavior>
Baseline   <failing interaction or command and decisive result; or not run>
Root cause <proven mechanism; or unproven hypothesis>
Change     <responsible change; or none>
Proof      <supplied or executed check: result; include every decisive layer>
Gaps       <none; or exact missing proof and single next experiment/package>
Source     executed now | supplied | mixed
```

`not run`、`unproven`、または `none` を明示的に使用します。レシートを完全に見せるために行を省略してはいけません。

## 証拠の境界を定める

編集前に、観測された問題、意図する動作、最も強い直接確認、証拠の出所（`executed now`、`supplied`、`mixed`）を記録します。提供された証拠を今回の実行で確認したかのように示してはいけません。

証拠はプライバシーを最小限に保ちます。資格情報、トークン、Cookie、個人データ、非公開 URL、機密ペイロードはマスクし、失敗の再現または相関付けに必要な識別子と抜粋だけを保持します。

可能な場合は最も限定的で安全な確認により失敗を再現します。再現できない場合は得られた証拠を保持し、結果を `PARTIAL` または `BLOCKED` にとどめます。

## 追跡と修正

1. 入力から症状までの実際の所有者経路を追跡します。
2. 観測事実、限定的な推論、欠落を分けます。
3. 根本原因を示す前に、具体的な場所またはランタイム遷移を求めます。
4. 責任を持つ最小の変更を行い、無関係な整理、再試行、暗黙のフォールバック、フィクスチャ固有の例外を避けます。

もっともらしいパッチ、古いログ、ソースの閲覧、または成功したビルドを、ユーザーから見える動作の証明にしてはいけません。

## 証明のループを閉じる

影響を受ける契約で必要な確認だけを実行します。

- 元の再現または直接の受け入れ確認
- 最も近い否定的確認または回帰確認
- 影響を受けるビルドまたは統合ゲート
- 主張がその境界をまたぐ場合の実際の UI、API、永続化、並行性、またはランタイム経路

次の決定的な境界を使用します。

| 対象領域 | 必要な直接的証明 |
| --- | --- |
| ロジックまたは失敗するテスト | 元の失敗入力または焦点を絞ったテストが現在は成功すること |
| UI の動作 | 実際の操作に加え、関連するコンソールおよびネットワークの観測 |
| API または統合 | リクエスト、レスポンス、および責任を持つサービスの動作 |
| 永続化 | 実際の所有者経路を通る書き込み/読み取りまたは再読み込みのラウンドトリップ |
| 競合またはライフサイクル | 繰り返す並行トリガー、0 回または 1 回の成功、影響行とトランザクションの証拠、最終不変条件 |
| システム横断のブロッカー | タイムスタンプまたはリクエスト ID を持つマスク済みの失敗リクエスト/レスポンス 1 件、エッジとアプリケーションのログ、およびトレースがその所有者に達する場合の ID プロバイダーログ |

## 状態を割り当てる

- `VERIFIED`: ベースラインを観測し、具体的な原因と責任を持つ変更があり、宣言した確認がすべて成功し、重大な欠落がない。
- `PARTIAL`: 有用な証拠はあるが、必要な証明層が不足しているか結論に至らない。
- `BLOCKED`: 特定の外部条件が再現、修正、または証明を妨げている。

`PARTIAL` または `BLOCKED` では、決定的な欠落を閉じる単一の最小実験または相関する証拠パッケージを示します。コマンド、観測、件数、場所、結果を創作してはいけません。

機械可読なレシートまたは CI 統合では、[references/receipt-contract.md](references/receipt-contract.md) を読み、その JSON フィールド、証拠出所マーカー、互換性ルール、状態不変条件に従います。

JSON 成果物が求められた場合は、[assets/receipt.template.json](assets/receipt.template.json) を出発点とし、タスクが所有するパスに書き出して、このスキルディレクトリから `node scripts/validate-receipt.mjs <receipt.json>` で検証します。ユーザーから要求されない限り、生成したレシートをコミットしてはいけません。

## 出典とライセンス

Originally published at https://github.com/lMysticl/bug-receipt under the MIT License.

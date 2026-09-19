---
name: verify-agent-action
description: '実行前に、提案された AI エージェントのアクションまたは人間の承認パケットをレビューする。重大なツール、コマンド、デプロイ、メッセージ、購入、資格情報操作、データ変更の実行、承認と正確なアクションの一致確認、偽造結果、パラメーター差し替え、リプレイ、相関したレビュー担当者、欠落した証拠、期限切れ、古い監視の監査に使う。証拠に基づくレビューだけを行い、アクションを実行または承認しない。'
---
# エージェントアクションを検証

もっともらしい承認画面は証明ではなく主張として扱う。人間または外部の強制実行点が実行可否を判断する前に、意思決定経路全体を検証する。

## 安全境界を維持する

- 実行、承認、署名、送信、購入、デプロイ、変更を決して行わない。
- このレビューを実行権限へ変換しない。
- 欠落した証拠、ID、タイムスタンプ、パラメーターを推測しない。
- 有効なスキーマ、チェックサム、署名だけでは不十分と扱う。
- 署名は帰属と完全性の証拠として扱い、事実の真実性の証拠とは扱わない。
- 支持する証拠と反証する証拠を分離し、矛盾を平均化して消さない。
- 重大な不一致ではフェイルクローズする。必要な証拠が利用できない場合は `INCONCLUSIVE` を使う。

すべての最終結果にこのフィールドを設定する:

```json
{"execution_authorized": false}
```

## レビューパケットを収集する

レビューに必要な成果物だけを要求する:

1. 元のユーザーまたはシステムの依頼。
2. 提案された正確なアクション:
   - 操作またはツール名
   - 対象リソース
   - 完全なパラメーター
   - ファイルシステムとネットワークの範囲
   - 最大実行回数
   - not-before と有効期限
3. アクションが正当だと主張する評価。
4. その評価が使った根拠証拠とポリシー。
5. 承認者の ID、ロール、アクションダイジェスト、nonce、audience、発行時刻、有効期限、使用回数を含む承認記録。
6. 最新の監視イベントと想定ハートビート間隔。
7. 現在の信頼できる時刻と、過去の nonce 使用記録。

分析前に欠落フィールドを列挙する。既定値で黙って置き換えない。

## 正確なアクション識別子を構築する

フィールドを削除せず、正規化されたアクションオブジェクトを1つ作成する:

```json
{
  "operation": "git.push",
  "target": "owner/repository",
  "parameters": {
    "branch": "fix/example",
    "commit": "40-character-sha",
    "remote": "origin"
  },
  "filesystem_scope": [],
  "network_scope": ["github.com:443"],
  "execution_count": 1,
  "not_before": "RFC3339 timestamp",
  "expires_at": "RFC3339 timestamp"
}
```

指定されている場合はプロジェクト指定の正規化とダイジェストアルゴリズムを使う。それ以外では暗号学的識別子を独立検証できないと報告し、それでもすべてのフィールドを構造的に比較する。

次のようなセキュリティ上重要な違いを正規化で消してはならない:

- branch、commit、repository、environment、recipient、amount、currency、host
- recursive、force、overwrite、privileged、destructive、dry-run の各フラグ
- filesystem roots、CIDRs、ports、domains、execution counts、expiry

## 6つの管理項目を実行する

各管理項目を `PASS`、`FAIL`、`INCONCLUSIVE`、`NOT_APPLICABLE` のいずれかで評価する。

### 1. 評価を再計算する

- 実装が利用可能なら、宣言された入力から宣言された決定的評価器を再実行する。
- 選択したフィールドではなく、正規化された結果全体を比較する。
- 受け取った結果が再計算結果と異なる場合は `FAIL` とする。
- スキーマ検証、内部チェックサム、検証不能な評価器の主張しか利用できない場合は `INCONCLUSIVE` とする。

### 2. 承認済みの正確なアクションと照合する

- 提案されたアクションを、承認に束縛されたアクションと比較する。
- 正規化されたオブジェクト全体とそのダイジェストを比較する。
- 承認後に重要なフィールドが変更されていれば `FAIL` とする。
- 証拠がより狭いアクションだけを正当化する場合、広い対象または範囲を不一致として扱う。

### 3. リプレイと識別子の曖昧さを拒否する

- nonce が一意で未使用であることを検証する。
- subject、audience、issuer、承認者ロール、発行時刻、not-before 時刻、有効期限、最大使用回数を検証する。
- nonce の再利用、audience の誤り、期限切れの承認、未来の日付の承認、過剰な使用回数、失効した ID、ロール不一致は `FAIL` とする。
- 信頼できるリプレイストアまたは時刻ソースがない場合は `INCONCLUSIVE` とする。

### 4. レビュー担当者の独立性を検証する

すべてのレビュー担当者または評価器について依存関係表を作成する:

| 観点 | 比較対象 |
|---|---|
| モデル | ファミリ、バージョン、ファインチューニング |
| プロバイダー | アカウントとコントロールプレーン |
| プロンプト | 共有テンプレートまたは系譜 |
| 検索 | 重複するソースとインデックス |
| ツール | 共有評価器コードとランタイム |
| 運用者 | 共通の所有者または承認権限 |

相関したレビュー担当者を独立した定足数のメンバーとして数えない。ポリシーが独立承認を要求し、残った独立集合が小さすぎる場合は `FAIL` とする。

### 5. 証拠と矛盾を保持する

- 評価が参照するすべての証拠識別子を一覧化する。
- 各項目が存在し、真正性を確認でき、有効期間内で、主張に関連することを確認する。
- 支持と反証を独立して記録する:

| 支持 | 反証 | 認識状態 |
|---|---|---|
| absent | absent | `UNDETERMINED` |
| present | absent | `SUPPORTED_ONLY` |
| absent | present | `REFUTED_ONLY` |
| present | present | `CONFLICTED` |

- 結果を変える形で証拠が削除、改変、期限切れ、または隠蔽されていれば `FAIL` とする。
- `CONFLICTED` を安全に見える数値平均へ変換しない。

### 6. ライフサイクルと監視を検証する

- アクションが有効期間内であることを確認する。
- 利用可能な場合は、監視イベントの署名または完全性の証拠を検証する。
- シーケンス番号、直前イベントのダイジェスト、想定ハートビート間隔を確認する。
- ポリシーが継続的な監視を要求する場合、欠落、古い、順序が入れ替わった、またはチェーンが壊れたテレメトリを失敗として扱う。
- 沈黙を正常性と解釈しない。

## 都合のよい結論に異議を唱える

最終結果を出す前に、次の変更を頭の中で、またはプロジェクトが提供するテストフィクスチャで試す:

1. ブロックされた評価を許可された結果に置き換える。
2. 承認済みの対象、パラメーター、範囲、金額、またはコミットを1つ変更する。
3. それ以外は有効な承認 nonce を再利用する。
4. 独立したレビュー担当者を相関したコピーに置き換える。
5. 反証する証拠を1つ削除する。
6. 承認後に監視ハートビートを停止する。

いずれかの変更がレビュー済みの管理項目を通過する場合、影響を受けた管理項目を `FAIL` として記録する。将来の強化を推奨するだけにしない。

## レビュー結果を決定する

結果は必ず1つだけ使う:

- `ELIGIBLE_FOR_HUMAN_DECISION`: 必須の管理項目がすべて通過した。
- `ELIGIBLE_WITH_CONTROLS`: 必須の管理項目に失敗はなく、明示された外部管理項目で実行前に列挙した条件を解決できる。
- `BLOCKED`: 少なくとも1つの必須管理項目が失敗した、またはアクションが正当化された範囲を超えている。
- `INCONCLUSIVE`: 必須の管理項目が偽だと証明されたわけではないが、安全な判断に必要な証拠が欠落しているか検証不能である。

`ELIGIBLE_FOR_HUMAN_DECISION` は承認ではない。実際のアクションについては、人間の権限者と別の強制実行点が引き続き責任を負う。

## この形式で報告する

```markdown
# Agent Action Review

## Result
- Review result: BLOCKED | INCONCLUSIVE | ELIGIBLE_WITH_CONTROLS |
  ELIGIBLE_FOR_HUMAN_DECISION
- Execution authorized: false
- Exact action digest: <verified value or NOT_VERIFIED>

## Action
- Operation:
- Target:
- Material parameters:
- Scope:
- Validity window:
- Maximum uses:

## Control matrix
| Control | Status | Evidence | Reason |
|---|---|---|---|
| Recomputed assessment | PASS/FAIL/INCONCLUSIVE/N/A | ... | ... |
| Exact action binding | ... | ... | ... |
| Replay and identity | ... | ... | ... |
| Reviewer independence | ... | ... | ... |
| Evidence completeness | ... | ... | ... |
| Monitoring freshness | ... | ... | ... |

## Supporting evidence
- ...

## Refuting evidence and defeaters
- ...

## Required next action
- State the smallest concrete step that could change the result.

## Boundaries
- State what this review did not prove.
```

結果と正確な理由を先に示す。信頼度スコアよりも、再現可能なブロッカーを優先する。

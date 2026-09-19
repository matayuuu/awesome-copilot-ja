---
name: signal-write
description: '構造化されたエージェントシグナル（hands-up、blocked、done、checkpoint、partnership）を発行する。シグナルはダッシュボード向けに .signals/ へ JSON として書き込み、永続化のためジャーナルにも記録する。'
---
# エージェントシグナル

デスクからオペレーターや他のデスクへ、構造化されたシグナルを発行します。

## 使用する場面

- デスクがオペレーターの注意を必要とするとき（hands-up、blocked）
- 作業が完了し、レビュー可能になったとき（done）
- 記録する価値のある大きな進捗があったとき（checkpoint）
- 2つのデスクの意見が食い違い、解決できないとき（hands-up）
- TA が連携品質を報告するとき（partnership）

## シグナルの種類

### `hands-up`
2つのデスクの意見が外部の事実に照らしても一致しない。
これはシステムが機能している状態です。オペレーターが読むのは、デスクが自信を示した箇所ではなく、
*意見が食い違った*箇所です。

### `blocked`
入力がなければデスクが進められない。アクセス不足、範囲の曖昧さ、
オペレーターだけが下せる判断が必要、といった場合です。

### `done`
作業が完了し、レビュー可能です。成果物はベンチにあります。

### `checkpoint`
オペレーターが把握しておく価値のある大きな進捗があるが、作業は継続中です。
blocked でも done でもなく、単なる目印です。

### `partnership`
TA（ルームコーディネーター）が連携品質を報告するために使用します。
自己評価スコアはコードの正確さではなく、連携を評価します。
- **intent** — オペレーターが必要としていることを理解した
- **confidence** — 適切な作業を適切なデスクへ割り当てた
- **accuracy** — 割り当てた作業が正しい結果を生んだ
- **completeness** — 抜け漏れがなかった

## 発行方法

### 1. `.signals/` に JSON シグナルファイルを書き込む

これが主な出力であり、ダッシュボードが読み取る対象です。
`desks/<desk-name>/.signals/<timestamp>.json` を作成します。

```json
{
  "signal_type": "execution",
  "subtype": "checkpoint",
  "timestamp": "2026-07-19T21:30:00Z",
  "run_id": "<optional; set to pair this with an outcome signal>",
  "agent_name": "<desk-name>",
  "self_assessment": {
    "intent": 4,
    "confidence": 5,
    "accuracy": 4,
    "completeness": 3
  },
  "patterns": {
    "what_worked": "description of what went well",
    "what_was_hard": "description of challenges",
    "skill_gap": "areas for improvement"
  },
  "escalation": {
    "reason": null,
    "blocked_on": null,
    "recommendation": null
  }
}
```

### シグナル種別の対応

| シグナル  | `signal_type`   | `subtype`      |
|-----------|-----------------|----------------|
| hands-up  | `"escalation"`  | `"hands-up"`   |
| blocked   | `"escalation"`  | `"blocked"`    |
| done      | `"execution"`   | `"done"`       |
| checkpoint| `"execution"`   | `"checkpoint"` |
| partnership| `"partnership"` | `"partnership"`|

`subtype` フィールドはダッシュボード利用者向けに具体的なシグナル状態を保持します。
`signal_type` は並べ替えの優先度（escalation → 上位）を制御します。

> **注記:** signals-dashboard キャンバス拡張は `subtype` がある場合に
> それを読み取り、表示時は `signal_type` を代替として使います。
> 独自のツールでシグナルを利用する場合は、具体的な状態を示す
> `subtype` を優先してください。

> **順序:** `timestamp`（ISO 8601 UTC）を含めてください。ダッシュボードは
> その値でシグナルを並べ、値がない場合だけファイルの mtime を使います。
> git clone/checkout では mtime がリセットされるため、mtime だけでは
> 信頼できる時計になりません。

### 2. ジャーナルにシグナルを記録する

永続化のため、デスクのジャーナルにも短いマーカーを追記します。

```markdown
## <date> — [signal:<type>] <summary>
- <key details>
```

ジャーナルの記録は追跡用の目印です。JSON ファイルは機械可読なシグナルです。

## 結果シグナル（キャリブレーション）

signals-dashboard はデスクの自己評価と、実際の結果に対する独立した評価である
*outcome* を対応付け、**honesty gap**（デスクの自信と実際に届けた品質の差）を表示できます。
結果シグナルは任意で、通常はデスク自身ではなくレビュアーまたは評価者が発行します。

**同じ** `.signals/` ディレクトリに書き込みます。

```json
{
  "signal_type": "outcome",
  "run_id": "<same run_id as the signal it rates>",
  "agent_name": "<reviewer name>",
  "quality_rating": 4,
  "effort_to_merge": "minimal",
  "issues_found": ["optional short strings"],
  "timestamp": "2026-07-19T22:00:00Z"
}
```

- **`run_id`** は評価対象の実行または partnership シグナルと結果を関連付けます。
  両方に同じ `run_id` を設定してください。ない場合、ダッシュボードは
  最新シグナルの直後に発行された最も近い結果を使います。
- **`quality_rating`**（0～5）は実際に得られた品質です。ダッシュボードは
  デスクが自己評価した `confidence` と比較し、honesty gap を計算します。
- **`effort_to_merge`** — `"minimal"`、`"moderate"`、または `"significant"`。
- **`issues_found`** — 短い文字列の任意配列。

## 原則

- シグナルは構造化されたもので、饒舌にしない。短く、事実に基づき、行動につながる内容にする。
- hands-up は失敗ではなく、最も価値のあるシグナルです。1つの視点だけでは見落としたものを
  システムが捉えたことを意味します。
- 定常的な進捗ではシグナルを発行しない。シグナルは部屋に影響する状態変化のためであり、
  ステータス更新のためではありません。
- blocked は本当に進めない状態を意味し、「入力がある方が好ましい」という意味ではない。
  妥当なデフォルトで進められるなら、進めたうえで記録する。
- 自己評価スコアは楽観的でなく正直にする。3/5 は問題ありません。すべて 5/5 は疑わしい。

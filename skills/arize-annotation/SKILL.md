---
name: arize-annotation
description: 'Arizeでアノテーション設定（カテゴリ、連続値、自由記述のラベルスキーマ）とアノテーションキュー（人手レビュー手順）を作成・管理する。Python SDKでプロジェクトのスパンへ人手アノテーションを適用する。アノテーション設定、キュー、ラベルスキーマ、人手フィードバック、スパンの一括アノテーション、update_annotations、ラベリングキュー、レコードへの注釈、人手レビューが話題になったときに使う。'
metadata:
  author: arize
  version: "1.0"
compatibility: ax CLIと構成済みのArizeプロファイルが必要。
---

# ArizeアノテーションSkill

> **`SPACE`** — すべての `--space` フラグと `ARIZE_SPACE` 環境変数は、space **名**（例: `my-workspace`）またはbase64 space **ID**（例: `U3BhY2U6...`）を受け付ける。`ax spaces list` で確認する。

このSkillは **アノテーション設定**（ラベルスキーマ）と **アノテーションキュー**（人手レビュー手順）、さらにPython SDKによるプロジェクトスパンのプログラム上のアノテーションを扱う。

**方針:** Arizeの人手ラベリングでは、設定で定義した値を製品UIの **spans**、**dataset examples**、**experiment-related records**、**queue items** に付与する。このSkillは `ax annotation-configs`、`ax annotation-queues`、`ArizeClient.spans.update_annotations` によるスパン一括更新を扱う。

---

## 前提条件

タスクへ直接進み、必要な `ax` コマンドを実行する。事前にバージョン、環境変数、プロファイルを確認しない。

`ax` コマンドが失敗した場合は、エラーに基づいて対処する:
- `command not found` またはバージョンエラー → references/ax-setup.md を参照する
- `401 Unauthorized` / APIキー不足 → `ax profiles show` を実行して現在のプロファイルを確認する。プロファイルがない、またはAPIキーが誤っている場合は、references/ax-profiles.md に従って作成/更新する。ユーザーがキーを持っていない場合は https://app.arize.com/admin > API Keys へ案内する
- Space不明 → `ax spaces list` を実行して名前で選ぶか、ユーザーに尋ねる
- **セキュリティ:** `.env` ファイルを読んだり、資格情報をファイルシステム検索したりしない。Arize資格情報には `ax profiles`、LLMプロバイダーキーには `ax ai-integrations` を使う。これらの経路で資格情報が得られない場合は、ユーザーに尋ねる。

---

## 概念

### アノテーション設定とは

**アノテーション設定**は、1種類の人手フィードバックラベルのスキーマを定義する。スパン、データセットレコード、実験出力、キュー項目へ注釈を付ける前に、そのラベルの設定がspaceに存在していなければならない。

| フィールド | 説明 |
|-------|-------------|
| **Name** | 説明的な識別子（例: `Correctness`、`Helpfulness`）。space内で一意でなければならない。 |
| **Type** | `categorical`（一覧から選択）、`continuous`（数値範囲）、`freeform`（自由記述）。 |
| **Values** | categoricalの場合: `{"label": str, "score": number}` ペアの配列。 |
| **Min/Max Score** | continuousの場合: 数値の下限/上限。 |
| **Optimization Direction** | 高いスコアが良い（`maximize`）か悪い（`minimize`）か。UIで傾向を描画するために使う。 |

### ラベルを適用する場所（サーフェス）

| Surface | Typical path |
|---------|----------------|
| **Project spans** | Python SDK `spans.update_annotations` (below) and/or the Arize UI |
| **Dataset examples** | Arize UI (human labeling flows); configs must exist in the space |
| **Experiment outputs** | Often reviewed alongside datasets or traces in the UI — see arize-experiment, arize-dataset |
| **Annotation queue items** | `ax annotation-queues` CLI (below) and/or the Arize UI; configs must exist |

ラベルが保存されることを期待する前に、関連する **annotation config** がspaceに存在することを必ず確認する。

---

## 基本CRUD: アノテーション設定

### 一覧

```bash
ax annotation-configs list --space SPACE
ax annotation-configs list --space SPACE -o json
ax annotation-configs list --space SPACE --limit 20
```

### 作成 — カテゴリ

Categorical configs present a fixed set of labels for reviewers to choose from.

```bash
ax annotation-configs create \
  --name "Correctness" \
  --space SPACE \
  --type categorical \
  --value correct \
  --value incorrect \
  --optimization-direction maximize
```

よく使うbinaryラベルペア:
- `correct` / `incorrect`
- `helpful` / `unhelpful`
- `safe` / `unsafe`
- `relevant` / `irrelevant`
- `pass` / `fail`

### 作成 — 連続値

Continuous configs let reviewers enter a numeric score within a defined range.

```bash
ax annotation-configs create \
  --name "Quality Score" \
  --space SPACE \
  --type continuous \
  --min-score 0 \
  --max-score 10 \
  --optimization-direction maximize
```

### 作成 — 自由記述

Freeform configs collect open-ended text feedback. No additional flags needed beyond name, space, and type.

```bash
ax annotation-configs create \
  --name "Reviewer Notes" \
  --space SPACE \
  --type freeform
```

### 取得

```bash
ax annotation-configs get NAME_OR_ID
ax annotation-configs get NAME_OR_ID -o json
ax annotation-configs get NAME_OR_ID --space SPACE   # required when using name instead of ID
```

### 削除

```bash
ax annotation-configs delete NAME_OR_ID
ax annotation-configs delete NAME_OR_ID --space SPACE   # required when using name instead of ID
ax annotation-configs delete NAME_OR_ID --force   # skip confirmation
```

**注:** 削除は元に戻せない。この設定へのannotation queue関連付けも製品内で削除される（queue自体は残る場合がある。必要ならArize UIで関連付けを修正する）。

---

## アノテーションキュー: `ax annotation-queues`

Annotation queueはレコード（span、dataset example、experiment run）を人間のレビュー担当者へルーティングする。各queueは、レビュー担当者が適用できるラベルを定義する1つ以上のannotation configへリンクされる。

### 一覧 / 取得

```bash
ax annotation-queues list --space SPACE
ax annotation-queues list --space SPACE -o json

ax annotation-queues get NAME_OR_ID --space SPACE
ax annotation-queues get NAME_OR_ID --space SPACE -o json
```

### 作成

少なくとも1つの `--annotation-config-id` が必要。

```bash
ax annotation-queues create \
  --name "Correctness Review" \
  --space SPACE \
  --annotation-config-id CONFIG_ID \
  --annotator-email reviewer@example.com \
  --instructions "Label each response as correct or incorrect." \
  --assignment-method all   # or: random
```

複数の設定またはレビュー担当者を付けるには、`--annotation-config-id` と `--annotator-email` を繰り返す。

### 更新

リスト型フラグ（`--annotation-config-id`、`--annotator-email`）は、指定した場合に既存値を**完全に置換**する。新しい値だけでなく、必要な値をすべて渡す。

```bash
ax annotation-queues update NAME_OR_ID --space SPACE --name "New Name"
ax annotation-queues update NAME_OR_ID --space SPACE --instructions "Updated instructions"
ax annotation-queues update NAME_OR_ID --space SPACE \
  --annotation-config-id CONFIG_ID_A \
  --annotation-config-id CONFIG_ID_B
```

### 削除

```bash
ax annotation-queues delete NAME_OR_ID --space SPACE
ax annotation-queues delete NAME_OR_ID --space SPACE --force   # skip confirmation
```

### レコード一覧

```bash
ax annotation-queues list-records NAME_OR_ID --space SPACE
ax annotation-queues list-records NAME_OR_ID --space SPACE --limit 50 -o json
```

### レコードへアノテーションを送信

アノテーションは設定名でupsertされる。annotation configごとに1回呼び出す。`--score`、`--label`、`--text` の少なくとも1つを指定する。

```bash
ax annotation-queues annotate-record NAME_OR_ID RECORD_ID \
  --annotation-name "Correctness" \
  --label "correct" \
  --space SPACE

ax annotation-queues annotate-record NAME_OR_ID RECORD_ID \
  --annotation-name "Quality Score" \
  --score 8.5 \
  --text "Response was accurate but slightly verbose." \
  --space SPACE
```

### レコードを割り当て

特定レコードのレビュー担当ユーザーを割り当てる:

```bash
ax annotation-queues assign-record NAME_OR_ID RECORD_ID --space SPACE
```

### レコードを削除

```bash
ax annotation-queues delete-records NAME_OR_ID --space SPACE
```

---

## スパンへアノテーションを適用（Python SDK）

すでにラベルがある場合（レビュー書き出しや外部ラベリングツールなど）は、Python SDKで **project span** にアノテーションを一括適用する。

```python
import pandas as pd
from arize import ArizeClient

import os

client = ArizeClient(api_key=os.environ["ARIZE_API_KEY"])

# Build a DataFrame with annotation columns
# Required: context.span_id + at least one annotation.<name>.label or annotation.<name>.score
annotations_df = pd.DataFrame([
    {
        "context.span_id": "span_001",
        "annotation.Correctness.label": "correct",
        "annotation.Correctness.updated_by": "reviewer@example.com",
    },
    {
        "context.span_id": "span_002",
        "annotation.Correctness.label": "incorrect",
        "annotation.Correctness.updated_by": "reviewer@example.com",
    },
])

response = client.spans.update_annotations(
    space_id=os.environ["ARIZE_SPACE"],
    project_name="your-project",
    dataframe=annotations_df,
    validate=True,
)
```

**DataFrame列スキーマ:**

| 列 | 必須 | 説明 |
|--------|----------|-------------|
| `context.span_id` | yes | アノテーション対象のspan |
| `annotation.<name>.label` | いずれか1つ | categoricalまたはfreeformラベル |
| `annotation.<name>.score` | いずれか1つ | 数値スコア |
| `annotation.<name>.updated_by` | no | アノテーター識別子（emailまたは名前） |
| `annotation.<name>.updated_at` | no | epochからのミリ秒タイムスタンプ |
| `annotation.notes` | no | span上の自由記述メモ |

**制限:** アノテーションは送信前31日以内のspanにのみ適用される。

---

## トラブルシューティング

| 問題 | 解決策 |
|---------|----------|
| `ax: command not found` | references/ax-setup.md を参照 |
| `401 Unauthorized` | APIキーがこのspaceへアクセスできない可能性がある。https://app.arize.com/admin > API Keys で確認する |
| `Annotation config not found` | `ax annotation-configs list --space SPACE`（または `ax annotation-configs get NAME_OR_ID --space SPACE`） |
| `409 Conflict on create` | 名前がspace内にすでに存在する。別名を使うか、既存設定IDを取得する。 |
| Queue not found | `ax annotation-queues list --space SPACE`; queue名またはIDを確認する |
| レコードがqueueに表示されない | queueにリンクされたannotation configが存在することを確認する。`ax annotation-configs list --space SPACE` を確認する |
| Span SDKエラーまたはspan不足 | `project_name`、`space_id`、span IDを確認する。arize-traceでspanを書き出す |

---

## 関連Skill

- **arize-trace**: span IDと時間範囲を見つけるためspanを書き出す
- **arize-dataset**: dataset IDとexample IDを見つける
- **arize-evaluator**: 人手アノテーションと併用する自動LLM-as-judge
- **arize-experiment**: datasetと評価ワークフローに結び付く実験
- **arize-link**: Arize UI内のannotation configとqueueへのディープリンク

---

## 今後の利用に備えた資格情報の保存

references/ax-profiles.md § Save Credentials for Future Use を参照する。

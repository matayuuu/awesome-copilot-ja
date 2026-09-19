---
name: arize-evaluator
description: 'ArizeでのLLM-as-judge評価ワークフローを扱う。Evaluatorの作成・更新、スパンまたは実験の評価実行、タスク管理、trigger-run操作、列マッピング、継続監視を含む。Evaluator作成、LLM judge、ハルシネーション、忠実性、正確性、関連性、評価実行、スパン採点、実験採点、trigger-run、列マッピング、継続監視、Evaluatorプロンプト改善が話題になったときに使う。'
metadata:
  author: arize
  version: "1.0"
compatibility: ax CLI、構成済みのArizeプロファイル、AI統合が必要。
---

# Arize Evaluator Skill

> **`SPACE`** — すべての `--space` フラグと `ARIZE_SPACE` 環境変数は、space **名**（例: `my-workspace`）またはbase64 space **ID**（例: `U3BhY2U6...`）を受け付ける。`ax spaces list` で確認する。

このSkillはArizeで **LLM-as-judge evaluator** を設計、作成、実行する。Evaluatorは判定役を定義し、**task** は実データに対してそれを実行する方法を定義する。

---

## 前提条件

タスクへ直接進み、必要な `ax` コマンドを実行する。事前にバージョン、環境変数、プロファイルを確認しない。

`ax` コマンドが失敗した場合は、エラーに基づいて対処する:
- `command not found` またはバージョンエラー → references/ax-setup.md を参照する
- `401 Unauthorized` / APIキー不足 → `ax profiles show` を実行して現在のプロファイルを確認する。プロファイルがない、またはAPIキーが誤っている場合は、references/ax-profiles.md に従って作成/更新する。ユーザーがキーを持っていない場合は https://app.arize.com/admin > API Keys へ案内する
- Space不明 → `ax spaces list` を実行して名前で選ぶか、ユーザーに尋ねる
- LLMプロバイダー呼び出し失敗（OPENAI_API_KEY / ANTHROPIC_API_KEY不足） → `ax ai-integrations list --space SPACE` を実行し、プラットフォーム管理の資格情報があるか確認する。なければ、ユーザーにキー提供を依頼するか、**arize-ai-provider-integration** Skillで統合を作成する
- **セキュリティ:** `.env` ファイルを読んだり、資格情報をファイルシステム検索したりしない。Arize資格情報には `ax profiles`、LLMプロバイダーキーには `ax ai-integrations` を使う。これらの経路で資格情報が得られない場合は、ユーザーに尋ねる。
- **重要 — 評価結果を捏造しない:** 評価タスクが失敗、キャンセル、またはスコアなしの場合は、失敗を明確に報告し、何が起きたかを説明する。「手動評価」を行ったり、品質スコアや割合を作り出したり、Agent生成の分析をArize評価システム由来であるかのように示したりしない。代わりに、(1) 特定した問題を修正して再試行、(2) Arize UIからの実行を試す、(3) `ax ai-integrations list` で統合資格情報を確認、(4) https://arize.com/support へ問い合わせ、を提案する。

---

## 概念

### Evaluatorとは

An **evaluator** is an LLM-as-judge definition. It contains:

| フィールド | 説明 |
|-------|-------------|
| **テンプレート** | judgeプロンプト。`{input}`、`{output}`、`{context}` などの `{variable}` プレースホルダーを使い、実行時にtaskの列マッピングで埋められる。 |
| **Classification choices** | 許可される出力ラベル集合（例: `factual` / `hallucinated`）。binaryが既定で最も一般的。各選択肢は任意で数値スコアを持てる。 |
| **AI Integration** | judgeモデル呼び出しにEvaluatorが使う、保存済みLLMプロバイダー資格情報（OpenAI、Anthropic、Bedrockなど）。 |
| **Model** | 具体的なjudgeモデル（例: `gpt-4o`、`claude-sonnet-4-5`）。 |
| **Invocation params** | `{"temperature": 0}` のようなモデル設定の任意JSON。再現性のため低temperatureを推奨する。 |
| **Optimization direction** | 高いスコアが良い（`maximize`）か悪い（`minimize`）か。UIの傾向表示方法を設定する。 |
| **Data granularity** | Evaluatorが **span**、**trace**、**session** のどのレベルで実行されるか。ほとんどのEvaluatorはspanレベルで実行する。 |

Evaluatorは**バージョン管理**される。プロンプトまたはモデルを変更するたびに、新しい不変バージョンが作成される。最新バージョンが有効になる。

### Taskとは

A **task** is how you run one or more evaluators against real data. Tasks are attached to a **project** (live traces/spans) or a **dataset** (experiment runs). A task contains:

| Field | Description |
|-------|-------------|
| **Evaluators** | 実行するEvaluator一覧。1つのtaskで複数実行できる。 |
| **Column mappings** | 各Evaluatorのtemplate変数を、spanまたはexperiment run上の実フィールドパス（例: `"input" → "attributes.input.value"`）へ対応付ける。これによりEvaluatorをプロジェクトや実験をまたいで移植できる。 |
| **Query filter** | 評価するspan/runを選ぶSQL風の式（例: `"span_kind = 'LLM'"`）。任意だが精度のため重要。 |
| **Continuous** | project taskの場合、新しいspan到着時に自動採点するか。 |
| **Sampling rate** | continuous project taskの場合、評価する新規spanの割合（0–1）。 |

---

## データ粒度

`--data-granularity` フラグは、Evaluatorが採点するデータ単位を制御する。既定は `span` で、**project task** にのみ適用される（dataset/experiment taskには適用されない。これらはexperiment runを直接評価する）。

| レベル | 評価対象 | 用途 | 結果列プレフィックス |
|-------|-------------------|---------|---------------------|
| `span` (default) | Individual spans | Q&A correctness, hallucination, relevance | `eval.{name}.label` / `.score` / `.explanation` |
| `trace` | All spans in a trace, grouped by `context.trace_id` | Agent trajectory, task correctness — anything that needs the full call chain | `trace_eval.{name}.label` / `.score` / `.explanation` |
| `session` | All traces in a session, grouped by `attributes.session.id` and ordered by start time | Multi-turn coherence, overall tone, conversation quality | `session_eval.{name}.label` / `.score` / `.explanation` |

### traceとsessionの集約方法

For **trace** granularity, spans sharing the same `context.trace_id` are grouped together. Column values used by the evaluator template are comma-joined into a single string (each value truncated to 100K characters) before being passed to the judge model.

For **session** granularity, the same trace-level grouping happens first, then traces are ordered by `start_time` and grouped by `attributes.session.id`. Session-level values are capped at 100K characters total.

### `{conversation}` テンプレート変数

At session granularity, `{conversation}` is a special template variable that renders as a JSON array of `{input, output}` turns across all traces in the session, built from `attributes.input.value` / `attributes.llm.input_messages` (input side) and `attributes.output.value` / `attributes.llm.output_messages` (output side).

At span or trace granularity, `{conversation}` is treated as a regular template variable and resolved via column mappings like any other.

### 複数Evaluatorのタスク

A task can contain evaluators at different granularities. At runtime the system uses the **highest** granularity (session > trace > span) for data fetching and automatically **splits into one child run per evaluator**. Per-evaluator `query_filter` in the task's evaluators JSON further narrows which spans are included (e.g., only tool-call spans within a session).

---

## 基本CRUD

### AI統合

AI integrations store the LLM provider credentials the evaluator uses. For full CRUD — listing, creating for all providers (OpenAI, Anthropic, Azure, Bedrock, Vertex, Gemini, NVIDIA NIM, custom), updating, and deleting — use the **arize-ai-provider-integration** skill.

Quick reference for the common case (OpenAI):

```bash
# Check for an existing integration first
ax ai-integrations list --space SPACE

# Create if none exists
ax ai-integrations create \
  --name "My OpenAI Integration" \
  --provider openAI \
  --api-key $OPENAI_API_KEY
```

Copy the returned integration ID — it is required for `ax evaluators create --ai-integration-id`.

### Evaluator

```bash
# List / Get
ax evaluators list --space SPACE
ax evaluators get ID                    # accepts name or ID
ax evaluators get NAME --space SPACE   # required when using name instead of ID
ax evaluators list-versions NAME_OR_ID
ax evaluators get-version VERSION_ID

# Create (creates the evaluator and its first version)
ax evaluators create \
  --name "Answer Correctness" \
  --space SPACE \
  --description "Judges if the model answer is correct" \
  --template-name "correctness" \
  --commit-message "Initial version" \
  --ai-integration-id INT_ID \
  --model-name "gpt-4o" \
  --include-explanations \
  --use-function-calling \
  --classification-choices '{"correct": 1, "incorrect": 0}' \
  --template 'You are an evaluator. Given the user question and the model response, decide if the response correctly answers the question.

User question: {input}

Model response: {output}

Respond with exactly one of these labels: correct, incorrect'

# Create a new version (for prompt or model changes — versions are immutable)
ax evaluators create-version NAME_OR_ID \
  --commit-message "Added context grounding" \
  --template-name "correctness" \
  --ai-integration-id INT_ID \
  --model-name "gpt-4o" \
  --include-explanations \
  --classification-choices '{"correct": 1, "incorrect": 0}' \
  --template 'Updated prompt...

{input} / {output} / {context}'

# Update metadata only (name, description — not prompt)
ax evaluators update NAME_OR_ID \
  --name "New Name" \
  --description "Updated description"

# Delete (permanent — removes all versions)
ax evaluators delete NAME_OR_ID
```

**`create` の主要フラグ:**

| フラグ | 必須 | 説明 |
|------|----------|-------------|
| `--name` | yes | Evaluator名（space内で一意） |
| `--space` | yes | 作成先space名またはID |
| `--template-name` | yes | 評価列名。英数字、スペース、ハイフン、アンダースコア |
| `--commit-message` | yes | このバージョンの説明 |
| `--ai-integration-id` | yes | AI統合ID（上記から取得） |
| `--model-name` | yes | judgeモデル（例: `gpt-4o`） |
| `--template` | yes | `{variable}` プレースホルダー付きプロンプト（bashでは単一引用符で囲む） |
| `--classification-choices` | yes | 選択ラベルを数値スコアへ対応付けるJSONオブジェクト。例: `'{"correct": 1, "incorrect": 0}'` |
| `--description` | no | 人間が読める説明 |
| `--include-explanations` | no | ラベルとともに理由付けを含める |
| `--use-function-calling` | no | 構造化function-call出力を優先する |
| `--invocation-params` | no | `{"temperature": 0}` などのモデルパラメーターJSON |
| `--data-granularity` | no | `span`（既定）、`trace`、または `session`。project taskにのみ関係し、dataset/experiment taskには関係しない。データ粒度セクションを参照。 |
| `--direction` | no | 最適化方向: `maximize` または `minimize`。UIでの傾向表示方法を設定する。 |
| `--provider-params` | no | プロバイダー固有パラメーターのJSONオブジェクト |

### Task

> `PROJECT_NAME`、`DATASET_NAME`、`evaluator_id` はいずれも名前またはbase64 IDを受け付ける。

```bash
# List / Get
ax tasks list --space SPACE
ax tasks list --project PROJECT_NAME
ax tasks list --dataset DATASET_NAME --space SPACE
ax tasks get TASK_ID

# Create (project — continuous)
ax tasks create \
  --name "Correctness Monitor" \
  --task-type template_evaluation \
  --project PROJECT_NAME \
  --evaluators '[{"evaluator_id": "EVAL_ID", "column_mappings": {"input": "attributes.input.value", "output": "attributes.output.value"}}]' \
  --is-continuous \
  --sampling-rate 0.1

# Create (project — one-time / backfill)
ax tasks create \
  --name "Correctness Backfill" \
  --task-type template_evaluation \
  --project PROJECT_NAME \
  --evaluators '[{"evaluator_id": "EVAL_ID", "column_mappings": {"input": "attributes.input.value", "output": "attributes.output.value"}}]' \
  --no-continuous

# Create (experiment / dataset)
ax tasks create \
  --name "Experiment Scoring" \
  --task-type template_evaluation \
  --dataset DATASET_NAME --space SPACE \
  --experiment-ids "EXP_ID_1,EXP_ID_2" \   # base64 IDs from `ax experiments list --space SPACE -o json`
  --evaluators '[{"evaluator_id": "EVAL_ID", "column_mappings": {"output": "output"}}]' \
  --no-continuous

# Trigger a run (project task — use data window)
ax tasks trigger-run TASK_ID \
  --data-start-time "2026-03-20T00:00:00" \
  --data-end-time "2026-03-21T23:59:59" \
  --wait

# Trigger a run (experiment task — use experiment IDs)
ax tasks trigger-run TASK_ID \
  --experiment-ids "EXP_ID_1" \   # base64 ID from `ax experiments list --space SPACE -o json`
  --wait

# Monitor
ax tasks list-runs TASK_ID
ax tasks get-run RUN_ID
ax tasks wait-for-run RUN_ID --timeout 300
ax tasks cancel-run RUN_ID --force
```

**trigger-runの時刻形式:** `2026-03-21T09:00:00` — 末尾に `Z` を付けない。

**追加のtrigger-runフラグ:**

| フラグ | 説明 |
|------|-------------|
| `--max-spans` | 処理するspan数に上限を設ける（既定10,000） |
| `--override-evaluations` | すでにラベルがあるspanを再採点する |
| `--wait` / `-w` | 実行が終わるまでブロックする |
| `--timeout` | `--wait` 時に待機する秒数（既定600） |
| `--poll-interval` | 待機時のポーリング間隔秒数（既定5） |

**実行ステータスガイド:**

| ステータス | 意味 |
|--------|---------|
| `completed`, 0 spans | eval indexは1–2時間遅れる。最近取り込まれたspanはまだindexされていない可能性がある。少なくとも2時間前までのデータへwindowをずらすか、より古いデータを含むよう時間範囲を広げる。 |
| `cancelled` ~1s | 統合資格情報が無効 |
| `cancelled` ~3min | spanは見つかったがLLM呼び出しが失敗。モデル名またはキーを確認する |
| `completed`, N > 0 | 成功。UIでスコアを確認する |

---

## ワークフローA: プロジェクト用Evaluatorを作成

ユーザーが *"create an evaluator for my Playground Traces project"* のように言ったときに使う。

### 手順1: プロジェクト名を確認

`ax spans export` はプロジェクト名を直接受け付ける。ID検索は不要。プロジェクト名が分からない場合は、利用可能なプロジェクトを一覧表示する:

```bash
ax projects list --space SPACE -o json
```

`"name"` が一致するエントリ（大文字小文字を区別しない）を見つけ、その名前を後続コマンドの `PROJECT` として使う。後で名前による検証エラーに遭遇した場合は、代わりにプロジェクトの `"id"`（base64文字列）へフォールバックする。

### 手順2: 何を評価するか理解

ユーザーがEvaluator種別（hallucination、correctness、relevanceなど）を指定している場合 → 手順3へ進む。

指定がない場合は、実データに基づいてEvaluatorを作るため、最近のspanをサンプリングする:

```bash
ax spans export PROJECT --space SPACE -l 10 --days 30 --stdout
```

`attributes.input`、`attributes.output`、span種別、既存アノテーションを確認する。失敗モード（例: 幻覚した事実、話題外の回答、文脈不足）を特定し、**1〜3個の具体的なEvaluator案**を提案する。ユーザーに選んでもらう。

各提案には、Evaluator名（太字）、何を判定するかの1文説明、括弧内のbinaryラベルペアを含める。各項目は次の形式にする:

1. **名前** — 何を判定するかの説明。(`label_a` / `label_b`)

例:
1. **Response Correctness** — Agentの応答がユーザーの金融クエリへ正しく答えているか。(`correct` / `incorrect`)
2. **Hallucination** — 応答が取得文脈に根拠のない事実を捏造しているか。(`factual` / `hallucinated`)

### 手順3: AI統合を確認または作成

```bash
ax ai-integrations list --space SPACE -o json
```

適切な統合が存在する場合は、そのIDを記録する。なければ **arize-ai-provider-integration** Skillで作成する。judgeに使いたいプロバイダー/モデルをユーザーに尋ねる。

### 手順4: Evaluatorを作成

下記のテンプレート設計ベストプラクティスを使う。Evaluator名と変数は**汎用的**に保つ。プロジェクト固有の接続は、task（手順6）が `column_mappings` で扱う。

```bash
ax evaluators create \
  --name "Hallucination" \
  --space SPACE \
  --template-name "hallucination" \
  --commit-message "Initial version" \
  --ai-integration-id INT_ID \
  --model-name "gpt-4o" \
  --include-explanations \
  --use-function-calling \
  --classification-choices '{"factual": 1, "hallucinated": 0}' \
  --template 'You are an evaluator. Given the user question and the model response, decide if the response is factual or contains unsupported claims.

User question: {input}

Model response: {output}

Respond with exactly one of these labels: hallucinated, factual'
```

### 手順5: 確認 — バックフィル、継続、または両方か

**推奨アプローチ:** 継続監視を有効化する前に、必ず小さなbackfill（過去span約100件）から始めてEvaluatorを検証する。これにより、将来の本番spanをすべて採点する前に、既知データ上で列マッピングエラー、誤ったspan種別、テンプレート問題を発見できる。backfillで正しく採点できることを確認してからcontinuousを有効化する。

task作成前に次を尋ねる:

> "次のどれにしますか:
> (a) 過去spanに対して**backfill**を実行する（1回限り）
> (b) 今後の新しいspanに対して**continuous** evaluationを設定する
> (c) **両方** — まずbackfillで検証し、その後新しいspanを自動採点し続ける（推奨）"

### 手順6: 実際のスパンデータから列マッピングを決める

パスを推測しない。サンプルを取得し、実際に存在するフィールドを確認する:

```bash
ax spans export PROJECT --space SPACE -l 5 --days 7 --stdout
```

各template変数（`{input}`、`{output}`、`{context}`）について、一致するJSONパスを見つける。一般的な出発点は次のとおり。**使う前に必ず実データで確認する**:

| Template変数 | LLM span | CHAIN span |
|---|---|---|
| `input` | `attributes.input.value` | `attributes.input.value` |
| `output` | `attributes.llm.output_messages.0.message.content` | `attributes.output.value` |
| `context` | `attributes.retrieval.documents.contents` | — |
| `tool_output` | `attributes.input.value` (fallback) | `attributes.output.value` |

**span種別の整合性を検証:** EvaluatorプロンプトがLLMの最終テキストを前提にしているのにtaskがCHAIN spanを対象にする（またはその逆）場合、runはキャンセルされるか誤ったテキストを採点する可能性がある。taskの `query_filter` がマッピングしたspan種別と一致することを確認する。

**`query_filter` はindex済み属性にのみ効く:** evaluators JSON内の `query_filter` は、生のspan storeではなくeval indexに対して評価される。`attributes.metadata.*` 配下の属性やカスタムキーはindexされていない場合があり、静かに何にも一致しないことがある。フィルターには `span_kind` や `attributes.llm.model_name` のような既知のindex済み属性を使う。データが存在するのにフィルターが0 spanを返す場合は、診断手順としてフィルターを外してみる。

**完全な `--evaluators` JSON例:**

```json
[
  {
    "evaluator_id": "EVAL_ID",
    "query_filter": "span_kind = 'LLM'",
    "column_mappings": {
      "input": "attributes.input.value",
      "output": "attributes.llm.output_messages.0.message.content",
      "context": "attributes.retrieval.documents.contents"
    }
  }
]
```

templateが参照する**すべての**変数にマッピングを含める。1つでも省略すると、runは有効なスコアを生成できない。

### 手順7: Taskを作成

**Backfillのみ (a):**
```bash
ax tasks create \
  --name "Hallucination Backfill" \
  --task-type template_evaluation \
  --project PROJECT \
  --evaluators '[{"evaluator_id": "EVAL_ID", "column_mappings": {"input": "attributes.input.value", "output": "attributes.output.value"}}]' \
  --no-continuous
```

**Continuousのみ (b):**
```bash
ax tasks create \
  --name "Hallucination Monitor" \
  --task-type template_evaluation \
  --project PROJECT \
  --evaluators '[{"evaluator_id": "EVAL_ID", "column_mappings": {"input": "attributes.input.value", "output": "attributes.output.value"}}]' \
  --is-continuous \
  --sampling-rate 0.1
```

**両方 (c):** 作成時に `--is-continuous` を使い、その後手順8でbackfill runもトリガーする。

### 手順8: バックフィル実行をトリガー（要求された場合）

> **Eval indexの遅延:** eval indexはprimary trace storeから非同期で構築され、**1〜2時間**遅れる場合がある。最初のテストrunでは、少なくとも2時間前に終了する時間windowを使う。直近1時間に取り込まれたspanに対して `--data-end-time` を「now」にすると、runは成功完了しても0 spanを採点することがある。

まずデータがある時間範囲を見つける:
```bash
ax spans export PROJECT --space SPACE -l 100 --days 1 --stdout   # try last 24h first
ax spans export PROJECT --space SPACE -l 100 --days 7 --stdout   # widen if empty
```

実際のspanの `start_time` / `end_time` フィールドを使ってwindowを設定する。最初の検証runでは、素早いフィードバックを得るため `--max-spans` を約100に制限する:

```bash
ax tasks trigger-run TASK_ID \
  --data-start-time "2026-03-20T00:00:00" \
  --data-end-time "2026-03-21T23:59:59" \
  --max-spans 100 \
  --wait
```

完全なbackfillへ広げる、またはcontinuousを有効化する前に、スコアと説明を確認する。

---

## ワークフローB: 実験用Evaluatorを作成

ユーザーが *"create an evaluator for my experiment"* や *"evaluate my dataset runs"* のように言ったときに使う。

**ユーザーが「dataset」と言うがexperimentを持っていない場合:** taskの対象は裸のdatasetではなくexperimentでなければならない。次を尋ねる:
> "Evaluation tasks run against experiment runs, not datasets directly. Would you like help creating an experiment on that dataset first?"

はいの場合は、**arize-experiment** Skillで作成してから、ここへ戻る。

### 手順1: データセット名と実験名を探す

```bash
ax datasets list --space SPACE
ax experiments list --dataset DATASET_NAME --space SPACE -o json
```

採点対象のdataset名とexperiment名を記録する。後続コマンドでは名前またはIDを受け付けるが、名前を優先する。

### 手順2: 何を評価するか理解

ユーザーがEvaluator種別を指定した場合 → 手順3へ進む。

指定がない場合は、実データに基づくEvaluatorにするため、最近のexperiment runを確認する:

```bash
ax experiments export EXPERIMENT_NAME --dataset DATASET_NAME --space SPACE --stdout | python3 -c "import sys,json; runs=json.load(sys.stdin); print(json.dumps(runs[0], indent=2))"
```

`output`、`input`、`evaluations`、`metadata` フィールドを見る。ギャップ（ユーザーが気にしているがまだ持っていない指標）を特定し、**1〜3個のEvaluator案**を提案する。各提案には、Evaluator名（太字）、1文説明、括弧内のbinaryラベルペアを含める。形式はワークフローAの手順2と同じ。

### 手順3: AI統合を確認または作成

ワークフローAの手順3と同じ。

### 手順4: Evaluatorを作成

ワークフローAの手順4と同じ。変数は汎用的に保つ。

### 手順5: 実際の実行データから列マッピングを決める

runデータの形状はspanデータと異なる。確認する:

```bash
ax experiments export EXPERIMENT_NAME --dataset DATASET_NAME --space SPACE --stdout | python3 -c "import sys,json; runs=json.load(sys.stdin); print(json.dumps(runs[0], indent=2))"
```

experiment runの一般的なマッピング:
- `output` → `"output"`（各runのトップレベルフィールド）
- `input` → run上にあるか、リンクされたdataset exampleに埋め込まれているか確認する

run JSON上に `input` がない場合は、dataset exampleを書き出してパスを見つける:
```bash
ax datasets export DATASET_NAME --space SPACE --stdout | python3 -c "import sys,json; ex=json.load(sys.stdin); print(json.dumps(ex[0], indent=2))"
```

### 手順6: Taskを作成

```bash
ax tasks create \
  --name "Experiment Correctness" \
  --task-type template_evaluation \
  --dataset DATASET_NAME --space SPACE \
  --experiment-ids "EXP_ID" \   # base64 ID from `ax experiments list --space SPACE -o json`
  --evaluators '[{"evaluator_id": "EVAL_ID", "column_mappings": {"output": "output"}}]' \
  --no-continuous
```

### 手順7: トリガーして監視

```bash
ax tasks trigger-run TASK_ID \
  --experiment-ids "EXP_ID" \   # base64 ID from `ax experiments list --space SPACE -o json`
  --wait

ax tasks list-runs TASK_ID
ax tasks get-run RUN_ID
```

---

## テンプレート設計のベストプラクティス

### 1. 汎用的で移植可能な変数名を使う

`{input}`、`{output}`、`{context}` を使い、特定プロジェクトやspan属性に結び付く名前（例: `{attributes_input_value}`）は使わない。Evaluator自体は抽象的に保ち、特定プロジェクトや実験の実フィールドへの接続は **taskの `column_mappings`** で行う。これにより、同じEvaluatorを変更なしで複数のプロジェクトや実験に適用できる。

### 2. 既定はbinaryラベルにする

明確な文字列ラベルをちょうど2つ使う（例: `hallucinated` / `factual`、`correct` / `incorrect`、`pass` / `fail`）。binaryラベルは:
- judgeモデルが一貫して生成しやすい
- 業界で最も一般的
- ダッシュボードで最も解釈しやすい

ユーザーが3つ以上の選択肢を強く望む場合は問題ない。ただし最初にbinaryを推奨し、トレードオフ（ラベルが多い → 曖昧さが増える → 評価者間信頼性が下がる）を説明する。

### 3. モデルが返すべき内容を明示する

templateでは、judgeモデルに**ラベル文字列だけ**を返すよう指示する。それ以外は返させない。プロンプト内のラベル文字列は、`--classification-choices` のラベルと**完全一致**していなければならない（同じ綴り、同じ大文字小文字）。

良い例:
```
Respond with exactly one of these labels: hallucinated, factual
```

悪い例（自由度が高すぎる）:
```
Is this hallucinated? Answer yes or no.
```

### 4. temperatureを低く保つ

再現性のある採点のため、`--invocation-params '{"temperature": 0}'` を渡す。高いtemperatureは評価結果にノイズを入れる。

### 5. デバッグには `--include-explanations` を使う

初期設定中は常に説明を含め、大規模にラベルを信頼する前にjudgeが正しく推論していることを確認する。

### 6. bashではtemplateをシングルクォートで渡す

シングルクォートは、shellが `{variable}` プレースホルダーを展開するのを防ぐ。ダブルクォートは問題を起こす可能性がある:

```bash
# Correct
--template 'Judge this: {input} → {output}'

# Wrong — shell may interpret { } or fail
--template "Judge this: {input} → {output}"
```

### 7. `--classification-choices` は常にtemplateラベルと一致させる

`--classification-choices` のラベルは、`--template` で参照されるラベルと完全一致しなければならない（同じ綴り、同じ大文字小文字）。`--classification-choices` を省略すると、task runは "missing rails and classification choices" で失敗する。

---

## トラブルシューティング

| 問題 | 解決策 |
|---------|----------|
| `ax: command not found` | references/ax-setup.md を参照 |
| `401 Unauthorized` | APIキーがこのspaceへアクセスできない可能性がある。https://app.arize.com/admin > API Keys で確認する |
| `Evaluator not found` | `ax evaluators list --space SPACE` |
| `Integration not found` | `ax ai-integrations list --space SPACE` |
| `Task not found` | `ax tasks list --space SPACE` |
| `project and dataset-id are mutually exclusive` | task作成時はどちらか一方だけを使う |
| `experiment-ids required for dataset tasks` | `create` と `trigger-run` に `--experiment-ids` を追加する |
| `sampling-rate only valid for project tasks` | dataset taskから `--sampling-rate` を削除する |
| `ax spans export` の検証エラー | 通常はproject名で動作する。まだ検証エラーが出る場合は、`ax projects list --space SPACE -o json` でbase64 project IDを調べ、代わりに `id` フィールドを使う |
| Template検証エラー | bashではシングルクォートの `--template '...'` を使う。二重の `{{var}}` ではなく単一波括弧 `{var}` にする |
| Runが `pending` のまま | `ax tasks get-run RUN_ID`、その後 `ax tasks cancel-run RUN_ID` |
| Runが約1秒で `cancelled` | 統合資格情報が無効。AI統合を確認する |
| Runが約3分で `cancelled` | spanは見つかったがLLM呼び出しに失敗。モデル名誤りまたはキー不正 |
| Runが `completed`、0 spans | 時間windowを広げる。eval indexが古いデータを含まない可能性がある |
| UIにスコアがない | span/run上の実パスに合うよう `column_mappings` を修正する |
| スコアが誤って見える | `--include-explanations` を追加し、いくつかのサンプルでjudgeの推論を確認する |
| 誤ったspan種別でEvaluatorがキャンセルされる | `query_filter` と `column_mappings` をLLM spanまたはCHAIN spanに合わせる |
| `trigger-run` の時刻形式エラー | `2026-03-21T09:00:00` を使う。末尾の `Z` は付けない |
| Run failed: "missing rails and classification choices" | `ax evaluators create` に `--classification-choices '{"label_a": 1, "label_b": 0}'` を追加する。ラベルはtemplateと一致させる |
| Runが `completed`、全spanがスキップ | Query filterはspanに一致したが、column mappingが誤っているかtemplate変数が解決されていない。サンプルspanを書き出してパスを確認する |
| `query_filter` 設定時に0 span採点 | filter属性がeval indexにindexされていない可能性がある。`attributes.metadata.*` とカスタム属性はindexされないことが多い。代わりに `span_kind` または `attributes.llm.model_name` を使うか、filterを外してwindow内にspanが存在することを確認する。 |

### キャンセルされた実行の診断

task runがキャンセルされた（status `cancelled`）場合は、次のチェックリストを順番に実施する:

**1. 統合資格情報を確認する**
```bash
ax ai-integrations list --space SPACE -o json
```
Evaluatorが使う統合IDが存在し、有効な資格情報を持つことを確認する。統合が削除済み、またはAPIキーが期限切れの場合、runは約1秒以内にキャンセルされる。

**2. モデル名を確認する**
```bash
ax evaluators get EVALUATOR_NAME --space SPACE -o json
```
`model_name` フィールドを確認する。誤字や非推奨モデルはLLM呼び出しを失敗させ、runは約3分後にキャンセルされる。

**3. サンプルspan/runを書き出し、パスをcolumn_mappingsと比較する**

project taskの場合:
```bash
ax spans export PROJECT --space SPACE -l 1 --days 7 --stdout | python3 -m json.tool
```

experiment taskの場合:
```bash
ax experiments export EXPERIMENT_NAME --dataset DATASET_NAME --space SPACE --stdout | python3 -c "import sys,json; runs=json.load(sys.stdin); print(json.dumps(runs[0], indent=2)) if runs else print('No runs')"
```

書き出したJSONパスをtaskの `column_mappings` と比較する。template変数ごとに、マッピングされたパスが実際に存在することを確認する。よくある不一致:
- experiment runで `output` を `attributes.output.value` にマッピングする（正しくは単に `output`）
- CHAIN spanで `input` を `attributes.input.value` にマッピングするが、実際のパスは `attributes.llm.input_messages`
- filter対象のspan種別に存在しないパスへ `context` をマッピングする

**4. `data_start_time` がepochでないことを確認する**

`trigger-run` が開始時刻として `0`、`1970-01-01`、または空文字列を使った場合、時間windowは無効である。常に実際のspanタイムスタンプから導出する:
```bash
ax spans export PROJECT --space SPACE -l 5 --days 30 --stdout | python3 -c "
import sys, json
spans = json.load(sys.stdin)
for s in spans:
    print(s.get('start_time', 'N/A'), s.get('end_time', 'N/A'))
"
```

**5. span種別がEvaluator範囲と一致することを確認する**

Evaluatorが `--data-granularity trace` で作成されているのにtaskの `query_filter` が `span_kind = 'LLM'` の場合、runは対象データを見つけられずキャンセルされる可能性がある。granularityとfilterが一貫していることを確認する。

**6. すべてのtemplate変数が解決されることを確認する**

Evaluator template内の各 `{variable}` には、nullでない値へ解決される対応 `column_mappings` エントリが必要である。実際のspanに対して解決をテストする:
```bash
ax spans export PROJECT --space SPACE -l 3 --days 7 --stdout | python3 -c "
import sys, json
spans = json.load(sys.stdin)
# Replace these paths with your actual column_mappings values
mappings = {'input': 'attributes.input.value', 'output': 'attributes.output.value'}
for i, span in enumerate(spans):
    print(f'--- Span {i} ---')
    for var, path in mappings.items():
        parts = path.split('.')
        val = span
        for p in parts:
            val = val.get(p) if isinstance(val, dict) else None
        status = 'FOUND' if val else 'MISSING'
        print(f'  {var} ({path}): {status} — {str(val)[:80] if val else \"null\"}')
"
```
いずれかの変数が全spanでMISSINGを示す場合は、column mappingを修正するか、別のspan種別を対象にするよう `query_filter` を調整する。

---

## 関連Skill

- **arize-ai-provider-integration**: LLMプロバイダー統合の完全なCRUD（資格情報の作成、更新、削除）
- **arize-trace**: 列パスと時間範囲を見つけるためspanを書き出す
- **arize-experiment**: experiment column mapping用にexperimentを作成しrunを書き出す
- **arize-dataset**: runがinputを省略している場合にinputフィールドを見つけるためdataset exampleを書き出す
- **arize-link**: Arize UI内のEvaluatorとtaskへのdeep link

---

## 今後の利用に備えた資格情報の保存

references/ax-profiles.md § Save Credentials for Future Use を参照する。

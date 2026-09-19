---
name: arize-experiment
description: 'モデル性能の評価と比較に使うArize実験を作成、実行、分析する。ax CLIによる実験CRUD、実行結果の書き出し、結果比較、評価ワークフローを扱う。実験作成・実行、モデル比較、モデル性能、AI評価、実験結果、ベンチマーク、モデルのA/Bテスト、精度測定が話題になったときに使う。'
metadata:
  author: arize
  version: "1.0"
compatibility: ax CLIと構成済みのArizeプロファイルが必要。
---

# Arize実験Skill

> **`SPACE`** — すべての `--space` フラグと `ARIZE_SPACE` 環境変数は、space **名**（例: `my-workspace`）またはbase64 space **ID**（例: `U3BhY2U6...`）を受け付ける。`ax spaces list` で確認する。

## 概念

- **Experiment** = 特定のデータセット版に対する名前付き評価実行。サンプルごとに1つのrunを含む。
- **実験実行** = 1つのデータセットサンプルを処理した結果。モデル出力、任意の評価、任意のメタデータを含む。
- **Dataset** = 版管理されたサンプルの集合。各実験はデータセットと特定のデータセット版に結び付く。
- **Evaluation** = runに付ける名前付きメトリクス（例: `correctness`、`relevance`）。ラベル、スコア、説明を任意で持つ。

典型的な流れ: データセットを書き出す → 各exampleを処理する → 出力と評価を収集する → runを使って実験を作成する。

## 前提条件

タスクへ直接進み、必要な `ax` コマンドを実行する。事前にバージョン、環境変数、プロファイルを確認しない。

`ax` コマンドが失敗した場合は、エラーに基づいて対処する:
- `command not found` またはバージョンエラー → references/ax-setup.md を参照する
- `401 Unauthorized` / APIキー不足 → `ax profiles show` を実行して現在のプロファイルを確認する。プロファイルがない、またはAPIキーが誤っている場合は、references/ax-profiles.md に従って作成/更新する。ユーザーがキーを持っていない場合は https://app.arize.com/admin > API Keys へ案内する
- Space不明 → `ax spaces list` を実行して名前で選ぶか、ユーザーに尋ねる
- Projectが不明 → ユーザーに尋ねるか、`ax projects list -o json --limit 100` を実行して選択肢として提示する
- **セキュリティ:** `.env` ファイルを読んだり、資格情報をファイルシステム検索したりしない。Arize資格情報には `ax profiles`、LLMプロバイダーキーには `ax ai-integrations` を使う。これらの経路で資格情報が得られない場合は、ユーザーに尋ねる。
- **重要 — 出力を捏造しない:** 実験を実行するときは、データセットの各exampleについてユーザー指定の実モデルAPIを必ず呼び出す。モデル出力、レイテンシ、評価スコアを捏造、シミュレーション、ハードコードしない。APIを呼び出せない場合（SDK不足、資格情報不足、ネットワークエラー）は、停止して続行に必要なものをユーザーへ伝える。

## 実験一覧: `ax experiments list`

実験を閲覧し、必要に応じてデータセットで絞り込む。出力はstdoutへ送られる。

```bash
ax experiments list
ax experiments list --dataset DATASET_NAME --space SPACE --limit 20   # DATASET_NAME: name or ID (name preferred)
ax experiments list --cursor CURSOR_TOKEN
ax experiments list -o json
```

### Flags

| フラグ | 型 | 既定 | 説明 |
|------|------|---------|-------------|
| `--dataset` | string | なし | データセットで絞り込む |
| `--limit, -l` | int | 15 | 最大結果数（1-100） |
| `--cursor` | string | なし | 前回レスポンスのページングカーソル |
| `-o, --output` | string | table | 出力形式: table、json、csv、parquet、またはファイルパス |
| `-p, --profile` | string | default | 構成プロファイル |

## 実験取得: `ax experiments get`

Quick metadata lookup -- returns experiment name, linked dataset/version, and timestamps.

```bash
ax experiments get NAME_OR_ID
ax experiments get NAME_OR_ID -o json
ax experiments get NAME_OR_ID --dataset DATASET_NAME --space SPACE   # required when using experiment name instead of ID
```

### フラグ

| フラグ | 型 | 既定 | 説明 |
|------|------|---------|-------------|
| `NAME_OR_ID` | string | 必須 | 実験名またはID（位置引数） |
| `--dataset` | string | なし | データセット名またはID（IDではなく実験名を使う場合は必須） |
| `--space` | string | なし | space名またはID（IDではなくデータセット名を使う場合は必須） |
| `-o, --output` | string | table | 出力形式 |
| `-p, --profile` | string | default | 構成プロファイル |

### レスポンスフィールド

| フィールド | 型 | 説明 |
|-------|------|-------------|
| `id` | string | 実験ID |
| `name` | string | 実験名 |
| `dataset_id` | string | リンクされたデータセットID |
| `dataset_version_id` | string | 使用された特定データセットバージョン |
| `experiment_traces_project_id` | string | 実験traceが保存されるプロジェクト |
| `created_at` | datetime | 実験作成時刻 |
| `updated_at` | datetime | 最終更新時刻 |

## 実験書き出し: `ax experiments export`

すべてのrunをファイルへダウンロードする。既定ではREST APIを使う。一括転送にArrow Flightを使うには `--all` を渡す。

```bash
# EXPERIMENT_NAME, DATASET_NAME: name or ID (name preferred)
ax experiments export EXPERIMENT_NAME --dataset DATASET_NAME --space SPACE
# -> experiment_abc123_20260305_141500/runs.json

ax experiments export EXPERIMENT_NAME --dataset DATASET_NAME --space SPACE --all
ax experiments export EXPERIMENT_NAME --dataset DATASET_NAME --space SPACE --output-dir ./results
ax experiments export EXPERIMENT_NAME --dataset DATASET_NAME --space SPACE --stdout
ax experiments export EXPERIMENT_NAME --dataset DATASET_NAME --space SPACE --stdout | jq '.[0]'
```

### フラグ

| フラグ | 型 | 既定 | 説明 |
|------|------|---------|-------------|
| `NAME_OR_ID` | string | 必須 | 実験名またはID（位置引数） |
| `--dataset` | string | なし | データセット名またはID（IDではなく実験名を使う場合は必須） |
| `--space` | string | なし | space名またはID（IDではなくデータセット名を使う場合は必須） |
| `--all` | bool | false | 一括書き出しにArrow Flightを使う（下記参照） |
| `--output-dir` | string | `.` | 出力ディレクトリ |
| `--stdout` | bool | false | ファイルではなくstdoutへJSONを出力する |
| `-p, --profile` | string | default | 構成プロファイル |

### REST vs Flight (`--all`)

- **REST**（既定）: 摩擦が少ない。Arrow/Flight依存はなく、標準HTTPSポートを使い、任意の企業プロキシやファイアウォール越しに動作する。1ページあたり500 runに制限される。
- **Flight**（`--all`）: 500件を超えるrunを持つ実験で必要。別ホスト/ポート（`flight.arize.com:443`）上のgRPC+TLSを使うため、一部の企業ネットワークではブロックされる場合がある。

**Agent自動エスカレーションルール:** REST書き出しがちょうど500件のrunを返した場合、結果は切り詰められている可能性が高い。完全なデータセットを取得するため `--all` で再実行する。

出力はrunオブジェクトのJSON配列である:

```json
[
  {
    "id": "run_001",
    "example_id": "ex_001",
    "output": "The answer is 4.",
    "evaluations": {
      "correctness": { "label": "correct", "score": 1.0 },
      "relevance": { "score": 0.95, "explanation": "Directly answers the question" }
    },
    "metadata": { "model": "gpt-4o", "latency_ms": 1234 }
  }
]
```

## 実験作成: `ax experiments create`

データファイル内のrunから新しい実験を作成する。

```bash
ax experiments create --name "gpt-4o-baseline" --dataset DATASET_NAME --space SPACE --file runs.json
ax experiments create --name "claude-test" --dataset DATASET_NAME --space SPACE --file runs.csv
```

### Flags

| フラグ | 型 | 必須 | 説明 |
|------|------|----------|-------------|
| `--name, -n` | string | yes | 実験名 |
| `--dataset` | string | yes | 実験を実行する対象データセット |
| `--space, -s` | string | no | space名またはID（IDではなくデータセット名を使う場合は必須） |
| `--file, -f` | path | yes | runを含むデータファイル: CSV、JSON、JSONL、Parquet |
| `-o, --output` | string | no | 出力形式 |
| `-p, --profile` | string | no | 構成プロファイル |

### stdin経由でデータを渡す

`--file -` を使うと、テンポラリファイルなしでデータを直接pipeできる:

```bash
echo '[{"example_id": "ex_001", "output": "Paris"}]' | ax experiments create --name "my-experiment" --dataset DATASET_NAME --space SPACE --file -

# Or with a heredoc
ax experiments create --name "my-experiment" --dataset DATASET_NAME --space SPACE --file - << 'EOF'
[{"example_id": "ex_001", "output": "Paris"}]
EOF
```

### 実行ファイルの必須列

| 列 | 型 | 必須 | 説明 |
|--------|------|----------|-------------|
| `example_id` | string | yes | このrunが対応するデータセットexampleのID |
| `output` | string | yes | このexampleに対するモデル/システム出力 |

追加列はrun上の `additionalProperties` として渡される。

## 実験削除: `ax experiments delete`

```bash
ax experiments delete NAME_OR_ID
ax experiments delete NAME_OR_ID --dataset DATASET_NAME --space SPACE   # required when using experiment name instead of ID
ax experiments delete NAME_OR_ID --force   # skip confirmation prompt
```

### Flags

| フラグ | 型 | 既定 | 説明 |
|------|------|---------|-------------|
| `NAME_OR_ID` | string | 必須 | experiment名またはID（位置引数） |
| `--dataset` | string | なし | dataset名またはID（IDではなくexperiment名を使う場合は必須） |
| `--space` | string | なし | space名またはID（IDではなくdataset名を使う場合は必須） |
| `--force, -f` | bool | false | 確認プロンプトをスキップ |
| `-p, --profile` | string | default | 構成プロファイル |

## 実験実行スキーマ

各runは1つのdataset exampleに対応する:

```json
{
  "example_id": "required -- links to dataset example",
  "output": "required -- the model/system output for this example",
  "evaluations": {
    "metric_name": {
      "label": "optional string label (e.g., 'correct', 'incorrect')",
      "score": "optional numeric score (e.g., 0.95)",
      "explanation": "optional freeform text"
    }
  },
  "metadata": {
    "model": "gpt-4o",
    "temperature": 0.7,
    "latency_ms": 1234
  }
}
```

### 評価フィールド

| フィールド | 型 | 必須 | 説明 |
|-------|------|----------|-------------|
| `label` | string | no | カテゴリ分類（例: `correct`、`incorrect`、`partial`） |
| `score` | number | no | 数値の品質スコア（例: 0.0 - 1.0） |
| `explanation` | string | no | 評価に対する自由形式の理由 |

評価ごとに `label`、`score`、`explanation` の少なくとも1つが存在するべきである。

## ワークフロー

### データセットに対して実験を実行

1. datasetを探す、または作成する:
   ```bash
   ax datasets list --space SPACE
   ax datasets export DATASET_NAME --space SPACE --stdout | jq 'length'
   ```
2. dataset exampleを書き出す:
   ```bash
   ax datasets export DATASET_NAME --space SPACE
   ```
3. 各exampleについて実際のモデルAPIを呼び出し、出力を収集する。`ax datasets export --stdout` を使ってexampleを推論スクリプトへ直接pipeする:

   ```bash
   ax datasets export DATASET_NAME --space SPACE --stdout | python3 infer.py > runs.json
   ```

   `infer.py` はstdinからexampleを読み取り、対象モデルを呼び出し、runs JSONをstdoutへ書くように作成する。下のスクリプトはtemplateである。まず書き出したdataset JSONを確認して正しいinputフィールド名を見つけ、次にユーザーが希望するproviderブロックのコメントを外す:

   ```python
   import json, sys, time

   examples = json.load(sys.stdin)
   runs = []

   for ex in examples:
       # Inspect the exported JSON to find the right field (e.g. "input", "question", "prompt")
       user_input = ex.get("input") or ex.get("question") or ex.get("prompt") or str(ex)

       start = time.time()

       # === CALL THE REAL MODEL API HERE — never fabricate or simulate ===
       # Uncomment and adapt the provider block the user requested:
       #
       # OpenAI (pip install openai  — uses OPENAI_API_KEY env var):
       #   from openai import OpenAI
       #   resp = OpenAI().chat.completions.create(
       #       model="gpt-4o",
       #       messages=[{"role": "user", "content": user_input}]
       #   )
       #   output_text = resp.choices[0].message.content
       #
       # Anthropic (pip install anthropic  — uses ANTHROPIC_API_KEY env var):
       #   import anthropic
       #   resp = anthropic.Anthropic().messages.create(
       #       model="claude-sonnet-4-6", max_tokens=1024,
       #       messages=[{"role": "user", "content": user_input}]
       #   )
       #   output_text = resp.content[0].text
       #
       # Google Gemini (pip install google-genai  — uses GOOGLE_API_KEY env var):
       #   from google import genai
       #   resp = genai.Client().models.generate_content(
       #       model="gemini-2.5-pro", contents=user_input
       #   )
       #   output_text = resp.text
       #
       # Custom / OpenAI-compatible proxy (pip install openai — uses CUSTOM_BASE_URL + CUSTOM_API_KEY env vars):
       # Use this for Azure OpenAI, NVIDIA NIM, local Ollama, or any OpenAI-compatible endpoint,
       # including a test integration proxy. Matches the `custom` provider in `ax ai-integrations create`.
       #   import os
       #   from openai import OpenAI
       #   resp = OpenAI(
       #       base_url=os.environ["CUSTOM_BASE_URL"],          # e.g. https://my-proxy.example.com/v1
       #       api_key=os.environ.get("CUSTOM_API_KEY", "none"),
       #   ).chat.completions.create(
       #       model=os.environ.get("CUSTOM_MODEL", "default"),
       #       messages=[{"role": "user", "content": user_input}]
       #   )
       #   output_text = resp.choices[0].message.content

       latency_ms = round((time.time() - start) * 1000)
       runs.append({
           "example_id": ex["id"],
           "output": output_text,
           "metadata": {"model": "MODEL_NAME", "latency_ms": latency_ms}
       })
       print(f"  {ex['id']}: {latency_ms}ms", file=sys.stderr)

   json.dump(runs, sys.stdout, indent=2)
   ```

   **実行前:** provider SDK（`pip install openai` / `anthropic` / `google-genai`）をインストールし、APIキーがshellの環境変数として設定されていることを確認する。APIへアクセスできない場合は停止し、必要なものをユーザーへ伝える。

4. runsファイルを検証する:
   ```bash
   python3 -c "import json; runs=json.load(open('runs.json')); print(f'{len(runs)} runs'); print(json.dumps(runs[0], indent=2))"
   ```
   各runには `example_id` と `output` が必要である。任意フィールド: `evaluations`、`metadata`。
5. experimentを作成する:
   ```bash
   ax experiments create --name "gpt-4o-baseline" --dataset DATASET_NAME --space SPACE --file runs.json
   ```
6. 検証: `ax experiments get "gpt-4o-baseline" --dataset DATASET_NAME --space SPACE`

### 2つの実験を比較

1. 両方のexperimentを書き出す:
   ```bash
   ax experiments export "experiment-a" --dataset DATASET_NAME --space SPACE --stdout > a.json
   ax experiments export "experiment-b" --dataset DATASET_NAME --space SPACE --stdout > b.json
   ```
2. `example_id` ごとに評価スコアを比較する:
   ```bash
   # Average correctness score for experiment A
   jq '[.[] | .evaluations.correctness.score] | add / length' a.json

   # Same for experiment B
   jq '[.[] | .evaluations.correctness.score] | add / length' b.json
   ```
3. 結果が異なるexampleを見つける:
   ```bash
   jq -s '.[0] as $a | .[1][] | . as $run |
     {
       example_id: $run.example_id,
       b_score: $run.evaluations.correctness.score,
       a_score: ($a[] | select(.example_id == $run.example_id) | .evaluations.correctness.score)
     }' a.json b.json
   ```
4. Evaluatorごとのスコア分布（pass/fail/partial件数）:
   ```bash
   # Count by label for experiment A
   jq '[.[] | .evaluations.correctness.label] | group_by(.) | map({label: .[0], count: length})' a.json
   ```
5. 回帰（AではpassしたがBではfailしたexample）を見つける:
   ```bash
   jq -s '
     [.[0][] | select(.evaluations.correctness.label == "correct")] as $passed_a |
     [.[1][] | select(.evaluations.correctness.label != "correct") |
       select(.example_id as $id | $passed_a | any(.example_id == $id))
     ]
   ' a.json b.json
   ```

**統計的有意性の注意:** スコア比較は、Evaluatorごとに30件以上のexampleがある場合に最も信頼できる。exampleが少ない場合、差分は方向性としてのみ扱う。n=10での5%差はノイズの可能性がある。スコアとともにサンプルサイズを報告する: `jq 'length' a.json`。

### 分析用に実験結果をダウンロード

1. `ax experiments list --dataset DATASET_NAME --space SPACE` -- experimentを探す
2. `ax experiments export EXPERIMENT_NAME --dataset DATASET_NAME --space SPACE` -- ファイルへダウンロードする
3. 解析: `jq '.[] | {example_id, score: .evaluations.correctness.score}' experiment_*/runs.json`

### 書き出し結果を他のツールへパイプ

```bash
# Count runs
ax experiments export EXPERIMENT_NAME --dataset DATASET_NAME --space SPACE --stdout | jq 'length'

# Extract all outputs
ax experiments export EXPERIMENT_NAME --dataset DATASET_NAME --space SPACE --stdout | jq '.[].output'

# Get runs with low scores
ax experiments export EXPERIMENT_NAME --dataset DATASET_NAME --space SPACE --stdout | jq '[.[] | select(.evaluations.correctness.score < 0.5)]'

# Convert to CSV
ax experiments export EXPERIMENT_NAME --dataset DATASET_NAME --space SPACE --stdout | jq -r '.[] | [.example_id, .output, .evaluations.correctness.score] | @csv'
```

## 関連Skill

- **arize-dataset**: このexperimentが対象にするdatasetを作成または書き出す → 先に `arize-dataset` を使う
- **arize-prompt-optimization**: experiment結果を使ってpromptを改善する → 次の手順は `arize-prompt-optimization`
- **arize-trace**: 失敗したexperiment runの個別span traceを調査する → `arize-trace` を使う
- **arize-link**: experiment runからtraceへのクリック可能なUIリンクを生成する → `arize-link` を使う

## トラブルシューティング

| 問題 | 解決策 |
|---------|----------|
| `ax: command not found` | references/ax-setup.md を参照 |
| `401 Unauthorized` | APIキーが誤っている、期限切れ、またはこのspaceへアクセスできない。references/ax-profiles.mdでプロファイルを修正する。 |
| `No profile found` | プロファイルが構成されていない。作成方法はreferences/ax-profiles.mdを参照。 |
| `Experiment not found` | `ax experiments list --space SPACE` でexperiment名を確認する |
| `Invalid runs file` | 各runには `example_id` と `output` フィールドが必要 |
| `example_id mismatch` | `example_id` の値がdatasetのIDと一致することを確認する（検証用にdatasetを書き出す） |
| `No runs found` | 書き出し結果が空。`ax experiments get` でexperimentにrunがあることを確認する |
| `Dataset not found` | リンクされたdatasetが削除された可能性がある。`ax datasets list` で確認する |

## 今後の利用に備えた資格情報の保存

references/ax-profiles.md § Save Credentials for Future Use を参照する。

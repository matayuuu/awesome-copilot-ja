---
name: arize-dataset
description: 'Arizeのデータセットとサンプルを作成、管理、検索する。ax CLIによるデータセットCRUD、サンプル追加、データ書き出し、ファイルからのデータセット作成を扱う。テストデータ、評価サンプル、データセット作成・一覧・書き出し・追加、データセット版、ゴールデンデータセット、テストセットが必要なときに使う。'
metadata:
  author: arize
  version: "1.0"
compatibility: ax CLIと構成済みのArizeプロファイルが必要。
---

# ArizeデータセットSkill

> **`SPACE`** — すべての `--space` フラグと `ARIZE_SPACE` 環境変数は、space **名**（例: `my-workspace`）またはbase64 space **ID**（例: `U3BhY2U6...`）を受け付ける。`ax spaces list` で確認する。

## 概念

- **Dataset** = 評価と実験に使う、版管理されたサンプルの集合。
- **Dataset Version** = ある時点のデータセットのスナップショット。更新はインプレースまたは新しい版の作成になる。
- **サンプル** = 任意のユーザー定義フィールド（例: `question`、`answer`、`context`）を持つデータセット内の1レコード。
- **Space** = 組織上のコンテナー。データセットはspaceに属する。

example上のシステム管理フィールド（`id`、`created_at`、`updated_at`）はサーバーが自動生成する。createやappendのペイロードには決して含めない。

## 前提条件

タスクへ直接進み、必要な `ax` コマンドを実行する。事前にバージョン、環境変数、プロファイルを確認しない。

`ax` コマンドが失敗した場合は、エラーに基づいて対処する:
- `command not found` またはバージョンエラー → references/ax-setup.md を参照する
- `401 Unauthorized` / APIキー不足 → `ax profiles show` を実行して現在のプロファイルを確認する。プロファイルがない、またはAPIキーが誤っている場合は、references/ax-profiles.md に従って作成/更新する。ユーザーがキーを持っていない場合は https://app.arize.com/admin > API Keys へ案内する
- Space不明 → `ax spaces list` を実行して名前で選ぶか、ユーザーに尋ねる
- Projectが不明 → ユーザーに尋ねるか、`ax projects list -o json --limit 100` を実行して選択肢として提示する
- **セキュリティ:** `.env` ファイルを読んだり、資格情報をファイルシステム検索したりしない。Arize資格情報には `ax profiles`、LLMプロバイダーキーには `ax ai-integrations` を使う。これらの経路で資格情報が得られない場合は、ユーザーに尋ねる。

## データセット一覧: `ax datasets list`

space内のデータセットを閲覧する。出力はstdoutへ送られる。

```bash
ax datasets list
ax datasets list --space SPACE --limit 20
ax datasets list --cursor CURSOR_TOKEN
ax datasets list -o json
```

### Flags

| フラグ | 型 | 既定 | 説明 |
|------|------|---------|-------------|
| `--space` | string | profileから | spaceで絞り込む |
| `--limit, -l` | int | 15 | 最大結果数（1-100） |
| `--cursor` | string | なし | 前回レスポンスのページングカーソル |
| `-o, --output` | string | table | 出力形式: table、json、csv、parquet、またはファイルパス |
| `-p, --profile` | string | default | 構成プロファイル |

## データセット取得: `ax datasets get`

簡易メタデータ検索。データセット名、space、タイムスタンプ、バージョン一覧を返す。

```bash
ax datasets get NAME_OR_ID
ax datasets get NAME_OR_ID -o json
ax datasets get NAME_OR_ID --space SPACE   # required when using dataset name instead of ID
```

### Flags

| フラグ | 型 | 既定 | 説明 |
|------|------|---------|-------------|
| `NAME_OR_ID` | string | 必須 | データセット名またはID（位置引数） |
| `--space` | string | なし | space名またはID（IDではなくデータセット名を使う場合は必須） |
| `-o, --output` | string | table | 出力形式 |
| `-p, --profile` | string | default | 構成プロファイル |

### レスポンスフィールド

| フィールド | 型 | 説明 |
|-------|------|-------------|
| `id` | string | データセットID |
| `name` | string | データセット名 |
| `space_id` | string | このデータセットが属するspace |
| `created_at` | datetime | データセット作成時刻 |
| `updated_at` | datetime | 最終更新時刻 |
| `versions` | array | データセットバージョン一覧（id、name、dataset_id、created_at、updated_at） |

## データセット書き出し: `ax datasets export`

すべてのexampleをファイルへダウンロードする。500件を超えるデータセットでは `--all` を使う（無制限の一括書き出し）。

```bash
ax datasets export NAME_OR_ID
# -> dataset_abc123_20260305_141500/examples.json

ax datasets export NAME_OR_ID --all
ax datasets export NAME_OR_ID --version-id VERSION_ID
ax datasets export NAME_OR_ID --output-dir ./data
ax datasets export NAME_OR_ID --stdout
ax datasets export NAME_OR_ID --stdout | jq '.[0]'
ax datasets export NAME_OR_ID --space SPACE   # required when using dataset name instead of ID
```

### Flags

| フラグ | 型 | 既定 | 説明 |
|------|------|---------|-------------|
| `NAME_OR_ID` | string | required | Dataset name or ID (positional) |
| `--space` | string | none | Space name or ID (required if using dataset name instead of ID) |
| `--version-id` | string | latest | 特定のデータセットバージョンを書き出す |
| `--all` | bool | false | 無制限の一括書き出し（500件超のデータセットで使用） |
| `--output-dir` | string | `.` | 出力ディレクトリ |
| `--stdout` | bool | false | ファイルではなくstdoutへJSONを出力する |
| `-p, --profile` | string | default | 構成プロファイル |

**Agent自動エスカレーションルール:** 書き出しがちょうど500件のexampleを返した場合、結果は切り詰められている可能性が高い。完全なデータセットを取得するため `--all` で再実行する。

**書き出し完全性の検証:** 書き出し後、行数がサーバー報告値と一致することを確認する:
```bash
# Get the server-reported count from dataset metadata
ax datasets get DATASET_NAME --space SPACE -o json | jq '.versions[-1] | {version: .id, examples: .example_count}'

# Compare to what was exported
jq 'length' dataset_*/examples.json

# If counts differ, re-export with --all
```

出力はexampleオブジェクトのJSON配列である。各exampleにはシステムフィールド（`id`、`created_at`、`updated_at`）と、すべてのユーザー定義フィールドが含まれる:

```json
[
  {
    "id": "ex_001",
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z",
    "question": "What is 2+2?",
    "answer": "4",
    "topic": "math"
  }
]
```

## データセット作成: `ax datasets create`

データファイルから新しいデータセットを作成する。

```bash
ax datasets create --name "My Dataset" --space SPACE --file data.csv
ax datasets create --name "My Dataset" --space SPACE --file data.json
ax datasets create --name "My Dataset" --space SPACE --file data.jsonl
ax datasets create --name "My Dataset" --space SPACE --file data.parquet
```

### Flags

| フラグ | 型 | 必須 | 説明 |
|------|------|----------|-------------|
| `--name, -n` | string | yes | データセット名 |
| `--space` | string | yes | データセットを作成するspace |
| `--file, -f` | path | yes | データファイル: CSV、JSON、JSONL、Parquet |
| `-o, --output` | string | no | 返されるデータセットメタデータの出力形式 |
| `-p, --profile` | string | no | 構成プロファイル |

### stdin経由でデータを渡す

`--file -` を使うと、テンポラリファイルなしでデータを直接pipeできる:

```bash
echo '[{"question": "What is 2+2?", "answer": "4"}]' | ax datasets create --name "my-dataset" --space SPACE --file -

# Or with a heredoc
ax datasets create --name "my-dataset" --space SPACE --file - << 'EOF'
[{"question": "What is 2+2?", "answer": "4"}]
EOF
```

既存データセットへ行を追加するには、代わりに `ax datasets append --json '[...]'` を使う。ファイルは不要。

### 対応ファイル形式

| 形式 | 拡張子 | 注意 |
|--------|-----------|-------|
| CSV | `.csv` | 列ヘッダーがフィールド名になる |
| JSON | `.json` | オブジェクト配列 |
| JSON Lines | `.jsonl` | 1行に1オブジェクト（JSON配列ではない） |
| Parquet | `.parquet` | 列名がフィールド名になり、型を保持する |

**形式上の注意:**
- **CSV**: 型情報を失う。日付は文字列になり、`null` は空文字列になる。型を保持するにはJSON/Parquetを使う。
- **JSONL**: 各行は別々のJSONオブジェクトである。`.jsonl` ファイル内のJSON配列（`[{...}, {...}]`）は失敗するため、代わりに `.json` 拡張子を使う。
- **Parquet**: 列型を保持する。ローカルで読むには `pandas`/`pyarrow` が必要: `pd.read_parquet("examples.parquet")`。

## サンプル追加: `ax datasets append`

既存データセットへexampleを追加する。2つの入力モードがあり、適した方を使う。

### インラインJSON（Agent向け）

ペイロードを直接生成する。テンポラリファイルは不要:

```bash
ax datasets append DATASET_NAME --space SPACE --json '[{"question": "What is 2+2?", "answer": "4"}]'

ax datasets append DATASET_NAME --space SPACE --json '[
  {"question": "What is gravity?", "answer": "A fundamental force..."},
  {"question": "What is light?", "answer": "Electromagnetic radiation..."}
]'
```

### ファイルから

```bash
ax datasets append DATASET_NAME --space SPACE --file new_examples.csv
ax datasets append DATASET_NAME --space SPACE --file additions.json
```

### 特定バージョンへ追加

```bash
ax datasets append DATASET_NAME --space SPACE --json '[{"q": "..."}]' --version-id VERSION_ID
```

### フラグ

| フラグ | 型 | 必須 | 説明 |
|------|------|----------|-------------|
| `NAME_OR_ID` | string | yes | データセット名またはID（位置引数）。名前を使う場合は `--space` を追加する |
| `--space` | string | no | space名またはID（IDではなくデータセット名を使う場合は必須） |
| `--json` | string | mutex | exampleオブジェクトのJSON配列 |
| `--file, -f` | path | mutex | データファイル（CSV、JSON、JSONL、Parquet） |
| `--version-id` | string | no | 特定バージョンへ追加（既定: latest） |
| `-o, --output` | string | no | 返されるデータセットメタデータの出力形式 |
| `-p, --profile` | string | no | 構成プロファイル |

`--json` または `--file` のどちらか一方だけが必須。

### 検証

- 各exampleは、少なくとも1つのユーザー定義フィールドを持つJSONオブジェクトでなければならない
- 1リクエストあたり最大100,000件のexample

**append前のスキーマ検証:** データセットにすでにexampleがある場合、静かなフィールド不一致を避けるため、追加前にスキーマを確認する:

```bash
# Check existing field names in the dataset
ax datasets export DATASET_NAME --space SPACE --stdout | jq '.[0] | keys'

# Verify your new data has matching field names
echo '[{"question": "..."}]' | jq '.[0] | keys'

# Both outputs should show the same user-defined fields
```

フィールドは自由形式である。新しいexampleの追加フィールドは追加され、不足フィールドはnullになる。ただし、フィールド名の誤字（例: `queston` vs `question`）は新しい列を静かに作るため、append前に綴りを確認する。

## データセット削除: `ax datasets delete`

```bash
ax datasets delete NAME_OR_ID
ax datasets delete NAME_OR_ID --space SPACE   # required when using dataset name instead of ID
ax datasets delete NAME_OR_ID --force   # skip confirmation prompt
```

### Flags

| フラグ | 型 | 既定 | 説明 |
|------|------|---------|-------------|
| `NAME_OR_ID` | string | 必須 | データセット名またはID（位置引数） |
| `--space` | string | なし | space名またはID（IDではなくデータセット名を使う場合は必須） |
| `--force, -f` | bool | false | 確認プロンプトをスキップ |
| `-p, --profile` | string | default | 構成プロファイル |

## ワークフロー

### 名前でデータセットを探す

すべてのdatasetコマンドは名前またはIDを直接受け付ける。位置引数としてデータセット名を渡せる（IDを使わない場合は `--space SPACE` を追加する）:

```bash
# Use name directly
ax datasets get "eval-set-v1" --space SPACE
ax datasets export "eval-set-v1" --space SPACE

# Or resolve name to ID via list if you need the base64 ID
ax datasets list -o json | jq '.[] | select(.name == "eval-set-v1") | .id'
```

### 評価用にファイルからデータセットを作成

1. 評価列（例: `input`、`expected_output`）を持つCSV/JSON/Parquetファイルを準備する
   - データをインライン生成する場合は、`--file -` を使ってstdin経由でpipeする（データセット作成セクションを参照）
2. `ax datasets create --name "eval-set-v1" --space SPACE --file eval_data.csv`
3. 検証: `ax datasets get DATASET_NAME --space SPACE`
4. データセット名を使って実験を実行する

### 既存データセットへサンプルを追加

```bash
# Find the dataset
ax datasets list --space SPACE

# Append inline or from a file using the dataset name (see Append Examples section for full syntax)
ax datasets append DATASET_NAME --space SPACE --json '[{"question": "...", "answer": "..."}]'
ax datasets append DATASET_NAME --space SPACE --file additional_examples.csv
```

### オフライン分析用にデータセットをダウンロード

1. `ax datasets list --space SPACE` -- データセット名を探す
2. `ax datasets export DATASET_NAME --space SPACE` -- ファイルへダウンロードする
3. JSONを解析する: `jq '.[] | .question' dataset_*/examples.json`

### 特定の版を書き出す

```bash
# List versions
ax datasets get DATASET_NAME --space SPACE -o json | jq '.versions'

# Export that version
ax datasets export DATASET_NAME --space SPACE --version-id VERSION_ID
```

### データセットを反復改善

1. Export current version: `ax datasets export DATASET_NAME --space SPACE`
2. Modify the examples locally
3. Append new rows: `ax datasets append DATASET_NAME --space SPACE --file new_rows.csv`
4. Or create a fresh version: `ax datasets create --name "eval-set-v2" --space SPACE --file updated_data.json`

### 書き出し結果を他のツールへパイプ

```bash
# Count examples
ax datasets export DATASET_NAME --space SPACE --stdout | jq 'length'

# Extract a single field
ax datasets export DATASET_NAME --space SPACE --stdout | jq '.[].question'

# Convert to CSV with jq
ax datasets export DATASET_NAME --space SPACE --stdout | jq -r '.[] | [.question, .answer] | @csv'
```

## データセットサンプルのスキーマ

exampleは自由形式のJSONオブジェクトである。固定スキーマはなく、列は指定した任意のフィールドになる。システム管理フィールドはサーバーが追加する:

| フィールド | 型 | 管理者 | 注意 |
|-------|------|-----------|-------|
| `id` | string | server | 自動生成UUID。updateでは必須、create/appendでは禁止 |
| `created_at` | datetime | server | 不変の作成タイムスタンプ |
| `updated_at` | datetime | server | 変更時に自動更新 |
| *(任意のユーザーフィールド)* | 任意のJSON型 | user | 文字列、数値、真偽値、null、ネストオブジェクト、配列 |


## 関連Skill

- **arize-trace**: データセットへ入れるデータを理解するため、本番spanを書き出す → `arize-trace` を使う
- **arize-experiment**: このデータセットに対して評価を実行する → 次の手順は `arize-experiment`
- **arize-prompt-optimization**: データセットと実験結果を使ってプロンプトを改善する → `arize-prompt-optimization` を使う

## トラブルシューティング

| 問題 | 解決策 |
|---------|----------|
| `ax: command not found` | references/ax-setup.md を参照 |
| `401 Unauthorized` | APIキーが誤っている、期限切れ、またはこのspaceへアクセスできない。references/ax-profiles.mdでプロファイルを修正する。 |
| `No profile found` | プロファイルが構成されていない。作成方法はreferences/ax-profiles.mdを参照。 |
| `Dataset not found` | `ax datasets list` でデータセットIDを確認する |
| `File format error` | 対応形式: CSV、JSON、JSONL、Parquet。stdinから読むには `--file -` を使う。 |
| `platform-managed column` | create/appendペイロードから `id`、`created_at`、`updated_at` を削除する |
| `reserved column` | `time`、`count`、任意の `source_record_*` フィールドを削除する |
| `Provide either --json or --file` | appendには入力ソースがちょうど1つ必要 |
| `Examples array is empty` | JSON配列またはファイルに少なくとも1つのexampleが含まれることを確認する |
| `not a JSON object` | `--json` 配列内の各要素は、文字列や数値ではなく `{...}` オブジェクトでなければならない |

## 今後の利用に備えた資格情報の保存

references/ax-profiles.md § Save Credentials for Future Use を参照する。

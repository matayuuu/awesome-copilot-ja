---
name: arize-ai-provider-integration
description: 'Evaluatorやその他のArize機能が使うLLMプロバイダー資格情報を保存するArize AI統合を作成、取得、更新、削除する。OpenAI、Anthropic、Azure OpenAI、AWS Bedrock、Vertex AI、Gemini、NVIDIA NIMなど任意のLLMプロバイダーに対応する。AI統合、LLMプロバイダー資格情報、統合の作成・一覧・資格情報更新・削除、LLMプロバイダーのArize接続が話題になったときに使う。'
metadata:
  author: arize
  version: "1.0"
compatibility: ax CLIと構成済みのArizeプロファイルが必要。
---

# Arize AI統合Skill

> **`SPACE`** — ほとんどの `--space` フラグと `ARIZE_SPACE` 環境変数は、space **名**（例: `my-workspace`）またはbase64 space **ID**（例: `U3BhY2U6...`）を受け付ける。`ax spaces list` で確認する。
> **注:** `ai-integrations create` は `--space` を**受け付けない**。AI統合はアカウントスコープである。`--space` は `list`、`get`、`update`、`delete` でだけ使う。

## 概念

- **AI Integration** = Arizeに登録されたLLMプロバイダー資格情報。Evaluatorが判定モデルを呼び出すため、またArizeの他機能がユーザーに代わってLLMを呼び出すために使う。
- **Provider** = 統合を支えるLLMサービス（例: `openAI`、`anthropic`、`awsBedrock`）。
- **Integration ID** = 統合のbase64エンコード済みグローバル識別子（例: `TGxtSW50ZWdyYXRpb246MTI6YUJjRA==`）。Evaluator作成など後続操作に必要。
- **Scoping** = 統合を使えるspaceまたはユーザーを制御する可視性ルール。
- **Auth type** = Arizeがプロバイダーで認証する方法: `default`（プロバイダーAPIキー）、`proxy_with_headers`（カスタムヘッダー経由のプロキシ）、`bearer_token`（ベアラートークン認証）。

## 前提条件

タスクへ直接進み、必要な `ax` コマンドを実行する。事前にバージョン、環境変数、プロファイルを確認しない。

`ax` コマンドが失敗した場合は、エラーに基づいて対処する:
- `command not found` またはバージョンエラー → references/ax-setup.md を参照する
- `401 Unauthorized` / APIキー不足 → `ax profiles show` を実行して現在のプロファイルを確認する。プロファイルがない、またはAPIキーが誤っている場合は、references/ax-profiles.md に従って作成/更新する。ユーザーがキーを持っていない場合は https://app.arize.com/admin > API Keys へ案内する
- Space不明 → `ax spaces list` を実行して名前で選ぶか、ユーザーに尋ねる
- LLMプロバイダー呼び出し失敗（OPENAI_API_KEY / ANTHROPIC_API_KEY不足） → `ax ai-integrations list --space SPACE` を実行し、プラットフォーム管理の資格情報があるか確認する。なければ、ユーザーにキー提供を依頼するか、**arize-ai-provider-integration** Skillで統合を作成する
- **セキュリティ:** `.env` ファイルを読んだり、資格情報をファイルシステム検索したりしない。Arize資格情報には `ax profiles`、LLMプロバイダーキーには `ax ai-integrations` を使う。これらの経路で資格情報が得られない場合は、ユーザーに尋ねる。

---

## AI統合を一覧表示

space内でアクセス可能なすべての統合を一覧表示する:

```bash
ax ai-integrations list --space SPACE
```

名前でフィルターする（大文字小文字を区別しない部分一致）:

```bash
ax ai-integrations list --space SPACE --name "openai"
```

大きな結果セットをページングする:

```bash
# Get first page
ax ai-integrations list --space SPACE --limit 20 -o json

# Get next page using cursor from previous response
ax ai-integrations list --space SPACE --limit 20 --cursor CURSOR_TOKEN -o json
```

**主要フラグ:**

| フラグ | 説明 |
|------|-------------|
| `--space` | 統合を絞り込むspace名またはID |
| `--name` | 統合名に対する大文字小文字を区別しない部分一致フィルター |
| `--limit` | 最大結果数（1–100、既定15） |
| `--cursor` | 前回レスポンスのページングトークン |
| `-o, --output` | 出力形式: `table`（既定）または `json` |

**レスポンスフィールド:**

| フィールド | 説明 |
|-------|-------------|
| `id` | Base64統合ID — 後続コマンド用にコピーする |
| `name` | 人間が読める名前 |
| `provider` | LLMプロバイダー列挙値（下記の対応プロバイダーを参照） |
| `has_api_key` | 資格情報が保存されていれば `true` |
| `model_names` | 許可モデル一覧。全モデル有効なら `null` |
| `enable_default_models` | このプロバイダーの既定モデルを許可するか |
| `function_calling_enabled` | tool/function callingが有効か |
| `auth_type` | 認証方式: `default`、`proxy_with_headers`、`bearer_token` |

---

## 特定の統合を取得

```bash
ax ai-integrations get NAME_OR_ID
ax ai-integrations get NAME_OR_ID -o json
ax ai-integrations get NAME_OR_ID --space SPACE   # required when using name instead of ID
```

統合の完全な構成を確認する、または作成後にIDを確認するために使う。

---

## AI統合を作成

作成前に必ず先に統合を一覧表示する。ユーザーがすでに適切な統合を持っている場合がある:

```bash
ax ai-integrations list --space SPACE
```

適切な統合がない場合は作成する。必要なフラグはプロバイダーによって異なる。

### OpenAI

```bash
ax ai-integrations create \
  --name "My OpenAI Integration" \
  --provider openAI \
  --api-key $OPENAI_API_KEY
```

### Anthropic

```bash
ax ai-integrations create \
  --name "My Anthropic Integration" \
  --provider anthropic \
  --api-key $ANTHROPIC_API_KEY
```

### Azure OpenAI

```bash
ax ai-integrations create \
  --name "My Azure OpenAI Integration" \
  --provider azureOpenAI \
  --api-key $AZURE_OPENAI_API_KEY \
  --base-url "https://my-resource.openai.azure.com/"
```

### AWS Bedrock

AWS BedrockはIAMロールベース認証を使う。Arizeが引き受けるロールのARNを `--provider-metadata` で渡す:

```bash
ax ai-integrations create \
  --name "My Bedrock Integration" \
  --provider awsBedrock \
  --provider-metadata '{"role_arn": "arn:aws:iam::123456789012:role/ArizeBedrockRole"}'
```

### Vertex AI

Vertex AIはGCPサービスアカウント資格情報を使う。GCPプロジェクトとリージョンを `--provider-metadata` で渡す:

```bash
ax ai-integrations create \
  --name "My Vertex AI Integration" \
  --provider vertexAI \
  --provider-metadata '{"project_id": "my-gcp-project", "location": "us-central1"}'
```

### Gemini

```bash
ax ai-integrations create \
  --name "My Gemini Integration" \
  --provider gemini \
  --api-key $GEMINI_API_KEY
```

### NVIDIA NIM

```bash
ax ai-integrations create \
  --name "My NVIDIA NIM Integration" \
  --provider nvidiaNim \
  --api-key $NVIDIA_API_KEY \
  --base-url "https://integrate.api.nvidia.com/v1"
```

### Custom (OpenAI-compatible endpoint)

```bash
ax ai-integrations create \
  --name "My Custom Integration" \
  --provider custom \
  --base-url "https://my-llm-proxy.example.com/v1" \
  --api-key $CUSTOM_LLM_API_KEY
```

### 対応プロバイダー

| Provider | Required extra flags |
|----------|---------------------|
| `openAI` | `--api-key <key>` |
| `anthropic` | `--api-key <key>` |
| `azureOpenAI` | `--api-key <key>`, `--base-url <azure-endpoint>` |
| `awsBedrock` | `--provider-metadata '{"role_arn": "<arn>"}'` |
| `vertexAI` | `--provider-metadata '{"project_id": "<gcp-project>", "location": "<region>"}'` |
| `gemini` | `--api-key <key>` |
| `nvidiaNim` | `--api-key <key>`, `--base-url <nim-endpoint>` |
| `custom` | `--base-url <endpoint>` |

### 任意のプロバイダーで使えるオプション

| Flag | Description |
|------|-------------|
| `--model-name` | Allowed model name (repeat for multiple, e.g. `--model-name gpt-4o --model-name gpt-4o-mini`); omit to allow all models |
| `--enable-default-models` | Enable the provider's default model list |
| `--function-calling-enabled` | Enable tool/function calling support |
| `--auth-type` | Authentication type: `default`, `proxy_with_headers`, or `bearer_token` |
| `--headers` | Custom headers as JSON object or file path (for proxy auth) |
| `--provider-metadata` | Provider-specific metadata as JSON object or file path |

### 作成後

返された統合ID（例: `TGxtSW50ZWdyYXRpb246MTI6YUJjRA==`）を控える。Evaluator作成やその他の後続コマンドに必要である。見逃した場合は取得し直す:

```bash
ax ai-integrations list --space SPACE -o json
# or by name/ID directly:
ax ai-integrations get NAME_OR_ID
```

---

## AI統合を更新

`update` は部分更新であり、指定したフラグだけが変更される。省略したフィールドはそのまま残る。

```bash
# Rename
ax ai-integrations update NAME_OR_ID --name "New Name"

# Rotate the API key
ax ai-integrations update NAME_OR_ID --api-key $OPENAI_API_KEY

# Change the model list (replaces all existing model names)
ax ai-integrations update NAME_OR_ID --model-name gpt-4o --model-name gpt-4o-mini

# Update base URL (for Azure, custom, or NIM)
ax ai-integrations update NAME_OR_ID --base-url "https://new-endpoint.example.com/v1"
```

IDではなく名前を使う場合は `--space SPACE` を追加する。`create` が受け付ける任意のフラグは `update` にも渡せる。

---

## AI統合を削除

**警告:** 削除は永続的である。この統合を参照するEvaluatorは実行できなくなる。

```bash
ax ai-integrations delete NAME_OR_ID --force
ax ai-integrations delete NAME_OR_ID --space SPACE --force   # required when using name instead of ID
```

すぐ削除せず確認プロンプトを表示するには `--force` を省略する。

---

## トラブルシューティング

| 問題 | 解決策 |
|---------|----------|
| `ax: command not found` | references/ax-setup.md を参照 |
| `401 Unauthorized` | APIキーがこのspaceへアクセスできない可能性がある。https://app.arize.com/admin > API Keys でキーとspace IDを確認する |
| `No profile found` | `ax profiles show --expand` を実行し、`ARIZE_API_KEY` 環境変数を設定するか `~/.arize/config.toml` を書く |
| `Integration not found` | `ax ai-integrations list --space SPACE` で確認する |
| 作成後に `has_api_key: false` | 資格情報が保存されていない。正しい `--api-key` または `--provider-metadata` で `update` を再実行する |
| Evaluator実行がLLMエラーで失敗する | `ax ai-integrations get INT_ID` で統合資格情報を確認し、必要ならAPIキーをローテーションする |
| `provider` 不一致 | 作成後にproviderは変更できない。削除して正しいproviderで再作成する |

---

## 関連Skill

- **arize-evaluator**: AI統合を使うLLM-as-judge Evaluatorを作成する → `arize-evaluator` を使う
- **arize-experiment**: AI統合に支えられたEvaluatorを使う実験を実行する → `arize-experiment` を使う

---

## 今後の利用に備えた資格情報の保存

references/ax-profiles.md § Save Credentials for Future Use を参照する。

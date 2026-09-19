---
name: generate-image
description: 'AIを使って画像を生成します。画像、テクスチャ、アイコン、スプライト、アートワーク、視覚アセット、モックアップの作成時に使います。OpenAI (gpt-image-2) と Google Gemini (Nano Banana) に対応し、選択したプロバイダーのAPIキーが必要です。'
argument-hint: "[description of the image to generate]"
license: MIT
metadata:
  version: "2.1.0"
  providers: "openai, gemini"
---

# 画像生成

画像生成アシスタントとして動作します。呼び出されたときは、以下のワークフローに従ってください。

## ワークフロー

1. **API キーを確認する** — 環境変数 `SKILL_IMAGE_GEN_OPENAI_KEY` と `SKILL_IMAGE_GEN_GEMINI_KEY` が設定されているか確認します。
2. **キーが 1 つだけ設定されている場合** — そのプロバイダーを使います。追加で質問する必要はありません。
3. **両方のキーが設定されている場合** — 文脈に応じて選びます（OpenAI は仕上がり重視、Gemini は速度重視）。ユーザーの好みがあれば確認します。
4. **キーがどちらも設定されていない場合** — オンボーディングのセクションを実行します。
5. **適切な API 仕様を使って画像を生成する**
6. **ユーザーに画像が保存された場所を伝える**

## オンボーディング

キーが未設定のときだけ実行します。ユーザーに対して会話形式で案内します。

1. どのプロバイダーを使いたいかを聞く:
   - **OpenAI (gpt-image-2)** — 高品質で、テキストの描画が優秀、1 枚ごとに課金
   - **Google Gemini (Nano Banana)** — 高速で、無料枠あり、反復作業に適している
2. API キーの取得方法を案内する:
   - OpenAI → https://platform.openai.com/api-keys
   - Gemini → https://aistudio.google.com/apikey
3. キーを受け取ったら、現在のセッションで `SKILL_IMAGE_GEN_OPENAI_KEY` または `SKILL_IMAGE_GEN_GEMINI_KEY` を設定し、適切なシェルプロファイルに永続化する。
4. 元々依頼されていた画像生成を続行する。

## API リファレンス: OpenAI

**メソッド:** `POST`
**URL:** `https://api.openai.com/v1/images/generations`

**ヘッダー:**
- `Authorization: ******`
- `Content-Type: application/json`

**リクエスト本文 (JSON):**
```json
{
  "model": "gpt-image-2",
  "prompt": "<user prompt>",
  "n": 1,
  "size": "1024x1024",
  "quality": "medium"
}
```

| 項目 | 既定値 | オプション |
|---|---|---|
| model | `gpt-image-2` | `gpt-image-2`, `gpt-image-1` |
| size | `1024x1024` | `1024x1024`, `1024x1536`, `1536x1024`, `auto` |
| quality | `medium` | `low`, `medium`, `high` |

**レスポンス:** `data[0].b64_json` に Base64 形式の画像が入ります。これをデコードして出力パスに保存します。`data[0].url` が存在する場合は、その URL から画像をダウンロードします。

## API リファレンス: Google Gemini (Nano Banana)

**メソッド:** `POST`
**URL:** `https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`

**ヘッダー:**
- `x-goog-api-key: <SKILL_IMAGE_GEN_GEMINI_KEY>`
- `Content-Type: application/json`

**リクエスト本文 (JSON):**
```json
{
  "contents": [{"parts": [{"text": "Generate an image: <user prompt>"}]}],
  "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}
}
```

| 項目 | 既定値 | オプション |
|---|---|---|
| model (URL 内) | `gemini-2.0-flash-exp` | `gemini-2.0-flash-exp`, `gemini-2.5-flash-image` |

**レスポンス:** `candidates[0].content.parts[]` を探し、`inlineData.data`（Base64 画像）と `inlineData.mimeType` を持つ part を見つけます。デコードして保存します。

**エラーケース:** `error` キー（API エラー）、`promptFeedback.blockReason`（安全性ブロック）、`finishReason: "SAFETY"`（フィルタリング）。

## エージェントのガイドライン

- 出力パスは適切に選ぶ — プロジェクトに関連するディレクトリ（例: `assets/`、`images/`、現在のディレクトリ）に保存する。
- ゲームテクスチャでは、`"seamless"`、`"tileable"`、`"game asset"` をプロンプトに加えて拡張する。
- バッチ生成では、複数の API 呼び出しを並列に行う。
- プロバイダーの切り替えや利用可能なオプションを尋ねられた場合は、両方を説明し、設定を支援する。
- 保存前に出力ディレクトリを必ず作成する。
- ユーザーのプロンプト中の特殊文字が JSON 本文で適切にエスケープされるようにする。

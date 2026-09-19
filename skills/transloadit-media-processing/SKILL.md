---
name: transloadit-media-processing
description: 'Transloaditを使ってメディアファイル（動画、音声、画像、ドキュメント）を処理します。動画のHLS／MP4エンコード、サムネイル生成、画像のリサイズや透かし、音声抽出、クリップ結合、字幕追加、ドキュメントのOCR、メディア処理パイプラインの実行を依頼されたときに使用します。大規模なファイル変換に対応する86種類以上の処理Robotを扱います。'
license: MIT
compatibility: Requires a free Transloadit account (https://transloadit.com/signup). Uses the @transloadit/mcp-server MCP server or the @transloadit/node CLI.
---
# Transloaditによるメディア処理

Transloaditのクラウドインフラストラクチャを使って、メディアファイルを処理、変換、エンコードします。
動画、音声、画像、ドキュメントに対応し、86種類以上の専門的な処理Robotを利用できます。

## このSkillを使う場面

次の作業が必要なときに使用します。

- 動画をHLS、MP4、WebMなどの形式へエンコードする
- 動画からサムネイルやアニメーションGIFを生成する
- 画像をリサイズ、トリミング、透かし追加、最適化する
- 画像形式（JPEG、PNG、WebP、AVIF、HEIF）を相互変換する
- 音声（MP3、AAC、FLAC、WAV）を抽出またはトランスコードする
- 動画または音声のクリップを結合する
- 動画に字幕を追加したりテキストを重ねたりする
- ドキュメント（PDF、スキャン画像）をOCR処理する
- 音声テキスト変換またはテキスト音声変換を実行する
- AIベースのコンテンツモデレーションまたは物体検出を適用する
- 複数の処理を連結したメディアパイプラインを構築する

## セットアップ

### オプションA：MCPサーバー（Copilot向けに推奨）

IDEの設定にTransloadit MCPサーバーを追加します。これにより、エージェントからTransloaditのツール（`create_template`、`create_assembly`、`list_assembly_notifications`など）へ直接アクセスできます。

**VS Code / GitHub Copilot**（`.vscode/mcp.json`またはユーザー設定）：

```json
{
  "servers": {
    "transloadit": {
      "command": "npx",
      "args": ["-y", "@transloadit/mcp-server", "stdio"],
      "env": {
        "TRANSLOADIT_KEY": "YOUR_AUTH_KEY",
        "TRANSLOADIT_SECRET": "YOUR_AUTH_SECRET"
      }
    }
  }
}
```

API認証情報は https://transloadit.com/c/-/api-credentials から取得します。

### オプションB：CLI

コマンドを直接実行する場合：

```bash
npx -y @transloadit/node assemblies create \
  --steps '{"encoded": {"robot": "/video/encode", "use": ":original", "preset": "hls-1080p"}}' \
  --wait \
  --input ./my-video.mp4
```

## 基本ワークフロー

### 動画をHLSへエンコード（アダプティブストリーミング）

```json
{
  "steps": {
    "encoded": {
      "robot": "/video/encode",
      "use": ":original",
      "preset": "hls-1080p"
    }
  }
}
```

### 動画からサムネイルを生成

```json
{
  "steps": {
    "thumbnails": {
      "robot": "/video/thumbs",
      "use": ":original",
      "count": 8,
      "width": 320,
      "height": 240
    }
  }
}
```

### 画像のリサイズと透かし

```json
{
  "steps": {
    "resized": {
      "robot": "/image/resize",
      "use": ":original",
      "width": 1200,
      "height": 800,
      "resize_strategy": "fit"
    },
    "watermarked": {
      "robot": "/image/resize",
      "use": "resized",
      "watermark_url": "https://example.com/logo.png",
      "watermark_position": "bottom-right",
      "watermark_size": "15%"
    }
  }
}
```

### ドキュメントのOCR

```json
{
  "steps": {
    "recognized": {
      "robot": "/document/ocr",
      "use": ":original",
      "provider": "aws",
      "format": "text"
    }
  }
}
```

### 音声クリップの結合

```json
{
  "steps": {
    "imported": {
      "robot": "/http/import",
      "url": ["https://example.com/clip1.mp3", "https://example.com/clip2.mp3"]
    },
    "concatenated": {
      "robot": "/audio/concat",
      "use": "imported",
      "preset": "mp3"
    }
  }
}
```

## 複数ステップのパイプライン

`"use"`フィールドでステップを連結できます。各ステップは前のステップの出力を参照します。

```json
{
  "steps": {
    "resized": {
      "robot": "/image/resize",
      "use": ":original",
      "width": 1920
    },
    "optimized": {
      "robot": "/image/optimize",
      "use": "resized"
    },
    "exported": {
      "robot": "/s3/store",
      "use": "optimized",
      "bucket": "my-bucket",
      "path": "processed/${file.name}"
    }
  }
}
```

## 主要概念

- **アセンブリ**：1つの処理ジョブです。`create_assembly`（MCP）または`assemblies create`（CLI）で作成します。
- **テンプレート**：Transloaditに保存する再利用可能なステップの集合です。`create_template`（MCP）または`templates create`（CLI）で作成します。
- **Robot**：処理単位です（例：`/video/encode`、`/image/resize`）。一覧は https://transloadit.com/docs/transcoding/ を参照してください。
- **ステップ**：パイプラインを定義するJSONオブジェクトです。各キーがステップ名で、各値がRobotを設定します。
- **`:original`**：アップロードされた入力ファイルを指します。

## ヒント

- CLIでは処理が完了するまで待機するために`--wait`を使います。
- 一般的な形式の変換では、すべてのパラメーターを指定する代わりに`"hls-1080p"`、`"mp3"`、`"webp"`などの`preset`値を使います。
- `"use": "step_name"`を連結して、中間ダウンロードなしで複数ステップのパイプラインを構築します。
- バッチ処理では`/http/import`を使って、URL、S3、GCS、Azure、FTP、Dropboxからファイルを取得します。
- テンプレートには、アセンブリ作成時に渡す動的な値のための`${variables}`を含められます。

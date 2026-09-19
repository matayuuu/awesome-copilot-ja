---
name: md-to-docx
description: Markdown ファイルを、埋め込み PNG 画像付きのプロフェッショナルな Word (.docx) ドキュメントへ変換する — 純粋な JavaScript で、外部ツールを使わない
---

# Markdown を Word (.docx) に変換するスキル

Markdown (`.md`) ファイルを、埋め込み PNG 画像付きのプロフェッショナルな Word (`.docx`) ドキュメントへ変換します。`docx` と `marked` の npm パッケージを使った **純粋な JavaScript** で実装されており、Pandoc、LibreOffice、その他のネイティブ バイナリは不要です。

## 変換方法

```bash
# 依存関係をインストール（初回のみ、scripts フォルダー内で実行）
cd skills/md-to-docx/scripts && npm install

# 変換（ワークスペースのルートから実行）
node skills/md-to-docx/scripts/md-to-docx.mjs <input.md> [output.docx]
```

`output.docx` を省略した場合、現在のディレクトリに `<input-basename>.docx` が既定の出力先になります。

## スキル フォルダーの内容

| ファイル | 用途 |
|------|---------|
| `SKILL.md` | この指示ファイル |
| `scripts/md-to-docx.mjs` | Node.js の Markdown から Word への変換器 |
| `scripts/package.json` | 依存関係（`docx`、`marked`） |

## 前提条件

| 要件 | バージョン | 備考 |
|-------------|---------|-------|
| **Node.js** | 18+ | 必須ランタイム |
| **`docx`** | 9+ | 純粋な JavaScript の Word ドキュメント生成ライブラリ |
| **`marked`** | 15+ | Markdown パーサー |

ネイティブ バイナリは不要です。システム レベルのインストールも不要です。Windows、macOS、Linux で動作します。

## 機能

変換器は次を行います。

- **YAML フロントマターを抽出** — `title`、`date`、`version`、`audience` を使ってタイトル ページを生成
- **タイトル ページを生成** — プロジェクト名、サブタイトル、日付、バージョン、対象読者を含む
- **目次を生成** — H1-H3 の見出しから作成
- **PNG 画像を埋め込み** — Markdown 内の `![alt](path)` 参照を入力 `.md` ファイルを基準に解決し、PNG を読み取り、Word ドキュメント内にインラインで埋め込む
- **スタイル付きの出力** — Calibri フォント、色付き見出し（`#1F3864`）、交互の行色を持つスタイル付き表、Consolas のコード ブロック
- **Markdown のすべての要素を処理** — 見出し、段落、表、コード ブロック、リスト、画像、リンク、水平線

## 画像の埋め込み

変換器は、Markdown 内で参照されている PNG 画像を自動的に埋め込みます。

```markdown
![High-Level Architecture](diagrams/high-level-architecture.drawio.png)
```

画像パスは、入力した Markdown ファイルを基準に **相対パスで解決** されます。PNG を読み取り、PNG ヘッダーから寸法を抽出し、縦横比を維持したまま 6 インチ幅以内に収まるように拡大縮小されます。

画像ファイルが見つからない場合は、プレースホルダー `[画像が見つかりません: <path>]` が挿入されます。

## フロントマター形式

```yaml
---
title: Project Name — Project Summary
date: 2025-01-15
version: 1.0
audience: Engineering Team, Architects, Stakeholders
---
```

タイトルは `—` または `–` で区切られ、タイトル ページ用のメイン タイトルとサブタイトルに分割されます。

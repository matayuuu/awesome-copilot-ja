---
name: drawio
description: 'draw.io 図を .drawio ファイルとして生成し、XML を埋め込んだ PNG/SVG/PDF へエクスポートします'
---

# Draw.io 図作成スキル

draw.io 図をネイティブの `.drawio` ファイルとして生成し、Word 文書に埋め込める PNG 画像としてエクスポートします。

## 図の作成方法

1. 要求された図の **draw.io XML を生成** します（形式: `mxGraphModel`）
2. create/edit file tool を使用して、XML を `.drawio` ファイルへ **書き込み** ます
3. バンドルされたエクスポートスクリプトを使用して **PNG にエクスポート** します

## バンドルされたエクスポートスクリプト

このスキルには `drawio-to-png.mjs` が含まれています。これは 2 つのレンダリングバックエンドを備えた Node.js エクスポートスクリプトです。

1. **draw.io CLI**（ピクセルパーフェクト、最速）— draw.io desktop がインストールされている場合は自動的に使用されます
2. **ヘッドレスブラウザー内の公式 draw.io viewer**（ピクセルパーフェクト、Chromium/Edge が必要）— CLI を使用できない場合のフォールバックです

### 使用方法

```bash
# Install dependencies (one-time, from the scripts folder)
cd skills/drawio/scripts && npm install

# Export a single diagram
node skills/drawio/scripts/drawio-to-png.mjs <input.drawio> [output.png]

# Export all .drawio files in a directory
node skills/drawio/scripts/drawio-to-png.mjs --dir <directory>

# Force a specific renderer
node skills/drawio/scripts/drawio-to-png.mjs --renderer=cli|viewer|auto <input.drawio>
```

### スキルフォルダーの内容

| ファイル | 用途 |
|------|---------|
| `SKILL.md` | この指示ファイル |
| `scripts/drawio-to-png.mjs` | Node.js エクスポートスクリプト（CLI + ブラウザーフォールバック） |
| `scripts/package.json` | 依存関係（`puppeteer-core`） |

## サポートされるエクスポート形式

| 形式 | XML を埋め込む | 注記 |
|--------|-----------|-------|
| `png` | はい | あらゆる環境で表示可能、draw.io で編集可能 |
| `svg` | はい | 拡大縮小可能、draw.io で編集可能 |
| `pdf` | はい | 印刷可能、draw.io で編集可能 |

## Draw.io XML スタイル規則

一貫性があり、プロフェッショナルな図にするため、次のスタイルを使用してください。

```xml
<!-- Primary service (highlighted) -->
<mxCell style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;strokeWidth=2;arcSize=12;shadow=1;" />

<!-- External system -->
<mxCell style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;" />

<!-- Success/processing stage -->
<mxCell style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" />

<!-- Warning/quality gate -->
<mxCell style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;" />

<!-- Error/failure path -->
<mxCell style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;" />

<!-- Data store (cylinder) -->
<mxCell style="shape=cylinder3;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;" />

<!-- Arrow -->
<mxCell style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#6c8ebf;strokeWidth=2;" />
```

## draw.io CLI の場所

まず `drawio` を試してください（PATH 上にあれば動作します）。その後、次の場所にフォールバックします。

- **Windows**: `"C:\Program Files\draw.io\draw.io.exe"`
- **macOS**: `/Applications/draw.io.app/Contents/MacOS/draw.io`
- **Linux**: `drawio`（snap/apt/flatpak 経由）

### CLI エクスポートコマンド

```bash
drawio -x -f png -e -b 10 -o <output.png> <input.drawio>
```

フラグ: `-x`（エクスポート）、`-f`（形式）、`-e`（図の XML を埋め込む）、`-b`（境界線）、`-o`（出力パス）。

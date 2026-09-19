---
name: adobe-illustrator-scripting
description: 'ExtendScript (JavaScript/JSX)でAdobe Illustrator自動化スクリプトを作成、デバッグ、最適化する。ドキュメント、レイヤー、パス、テキストフレーム、カラー、シンボル、アートボード、その他のIllustrator DOMオブジェクトを操作するスクリプトの作成・変更で使う。JavaScriptオブジェクトモデル、座標系、測定単位、書き出し手順、スクリプトのベストプラクティスを扱う。'
---

# Adobe Illustratorスクリプティング

ExtendScript（JavaScript/JSX）でAdobe Illustratorを自動化するための専門的な指針を提供する。このSkillはIllustratorのスクリプティングオブジェクトモデル、主要APIオブジェクト、コードパターン、本番品質の `.jsx` スクリプトを書くためのベストプラクティスを扱う。

## 同梱アセット

- [`references/object-model-quick-reference.md`](references/object-model-quick-reference.md): Illustratorスクリプトのオブジェクトモデル、一般的なドキュメントやページアイテムの種類、関連するDOM概念を、スクリプトの作成やデバッグ時に素早く参照する。
- `scripts/`: ドキュメント操作、書き出し、バッチ処理、DOM利用などの出発点や実装パターンになるIllustrator自動化スクリプトの例を含む。動作するJSXパターンが必要な場合やデバッグ時の挙動比較に使う。
## このSkillを使う場面

- Illustrator自動化スクリプト（`.jsx` または `.js` ファイル）の新規作成
- 既存のIllustrator ExtendScriptコードのデバッグまたは修正
- ドキュメント、レイヤー、ページアイテム、パス、テキスト、カラーのプログラム操作
- Illustratorファイルのバッチ処理、またはデータからのアートワーク生成
- ドキュメントの各種形式（PDF、SVG、PNG、EPSなど）への書き出し
- Illustrator DOM（Application、Document、Layer、PathItem、TextFrameなど）の操作
- 変数とデータセットを使ったデータ駆動グラフィックの作成
- スクリプト化された印刷オプションによる印刷ワークフローの自動化

## 前提条件

- Adobe Illustrator CC以降がインストールされている
- 基本的なJavaScript知識（ExtendScriptはAdobe拡張を含むES3ベース）
- スクリプトは File > Scripts > Other Scripts、Scriptsメニュー、またはStartup Scriptsフォルダー配置で実行する
- `.jsx` ファイルの作成にはExtendScript Toolkit（ESTK）または任意のテキストエディターを使える

## スクリプト環境

### 言語とファイル拡張子

| 言語 | 拡張子 | プラットフォーム |
|---|---|---|
| ExtendScript/JavaScript | `.jsx`, `.js` | Windows, macOS |
| AppleScript | `.scpt` | macOS only |
| VBScript | `.vbs` | Windows only |

このSkillは、クロスプラットフォームで最も広く使われる選択肢として **ExtendScript/JavaScript** に集中する。

### スクリプトの実行

- **Scripts menu**: File > Scripts はアプリケーションのscriptsフォルダーにあるスクリプトを一覧表示する
- **Other Scripts**: File > Scripts > Other Scripts で任意の `.jsx` ファイルを参照して実行する
- **Startup Scripts**: Startup Scriptsフォルダーへ置くと起動時に自動実行される
- **targetディレクティブ**: ESTKや外部ツールから実行する場合は、スクリプトを `#target illustrator` で始める
- **`#targetengine` ディレクティブ**: スクリプト実行をまたいで変数を保持するには `#targetengine "session"` を使う
- **外部呼び出し**: スクリプトはシェルスクリプト、タスクランナー、CIジョブ、ExtendScript Toolkit（`ExtendScript Toolkit.exe -run script.jsx`）、または他のAdobeアプリからの `BridgeTalk` メッセージでIllustrator外部から起動されることが多い。[外部呼び出しと引数の受け渡し](#外部呼び出しと引数の受け渡し)を参照する。

### 命名規則（JavaScript）

- オブジェクトとプロパティは **camelCase** を使う: `activeDocument`、`pathItems`、`textFrames`
- `app` グローバルは `Application` オブジェクトを参照する
- コレクションのインデックスは **0始まり**: `documents[0]` は最前面のドキュメント
- 実行時にオブジェクト型を特定するには `typename` プロパティを使う

## オブジェクトモデルの概要

Illustrator DOMは厳密な包含階層に従う:

```
Application (app)
├── activeDocument / documents[]
│   ├── layers[]
│   │   ├── pageItems[] (all artwork)
│   │   ├── pathItems[]
│   │   ├── compoundPathItems[]
│   │   ├── textFrames[]
│   │   ├── placedItems[]
│   │   ├── rasterItems[]
│   │   ├── meshItems[]
│   │   ├── pluginItems[]
│   │   ├── graphItems[]
│   │   ├── symbolItems[]
│   │   ├── nonNativeItems[]
│   │   ├── legacyTextItems[]
│   │   └── groupItems[]
│   ├── artboards[]
│   ├── views[]
│   ├── selection (array of selected items)
│   ├── swatches[], spots[], gradients[], patterns[]
│   ├── graphicStyles[], brushes[], symbols[]
│   ├── textFonts[] (via app.textFonts)
│   ├── stories[], characterStyles[], paragraphStyles[]
│   ├── variables[], datasets[]
│   └── inkList[], printOptions
├── preferences
├── printerList[]
└── textFonts[]
```

### トップレベルオブジェクト

- **Application** (`app`): ルートオブジェクト。ドキュメント、環境設定、フォント、プリンターへアクセスできる。主要プロパティ: `activeDocument`、`documents`、`textFonts`、`printerList`、`userInteractionLevel`、`version`。
- **Document**: 開いている `.ai` ファイルを表す。主要プロパティ: `layers`、`pageItems`、`selection`、`activeLayer`、`width`、`height`、`rulerOrigin`、`documentColorSpace`。主要メソッド: `saveAs()`、`exportFile()`、`close()`、`print()`。
- **Layer**: 描画レイヤー。主要プロパティ: `pageItems`、`pathItems`、`textFrames`、`visible`、`locked`、`opacity`、`name`、`zOrderPosition`、`color`。

## 測定単位と座標

### 単位

すべてのスクリプティングAPI値は **points**（72 points = 1 inch）を使う。他の単位は変換する:

| 単位 | 変換 |
|---|---|
| Inches | multiply by 72 |
| Centimeters | multiply by 28.346 |
| Millimeters | multiply by 2.834645 |
| Picas | multiply by 12 |

カーニング、トラッキング、`aki` プロパティは **em units**（emの1000分の1、フォントサイズに比例）を使う。

### 座標系

- **スクリプトで作成したドキュメント**では、原点 `(0,0)` はアートボードの**左下**にある
- Xは左から右へ、Yは下から上へ増える
- ページアイテムの `position` プロパティは、バウンディングボックスの**左上角**を `[x, y]` で表す
- ページアイテムの最大幅/高さ: 16348 points

### アートアイテムの境界

すべてのページアイテムには3種類の境界矩形がある:

- `geometricBounds`: 線幅を除く `[left, top, right, bottom]`
- `visibleBounds`: 線幅を含む
- `controlBounds`: 制御点/方向点を含む

## ドキュメントの操作

### 作成と開く操作

```javascript
// Create a new document
var doc = app.documents.add();

// Create with a preset
var preset = new DocumentPreset();
preset.width = 612;  // 8.5 inches
preset.height = 792; // 11 inches
preset.colorMode = DocumentColorSpace.CMYK;
var doc = app.documents.addDocument("Print", preset);

// Open an existing file
var fileRef = new File("/path/to/file.ai");
var doc = app.open(fileRef);
```

### 保存と書き出し

```javascript
// Save as Illustrator format
var saveOpts = new IllustratorSaveOptions();
saveOpts.compatibility = Compatibility.ILLUSTRATOR17; // CC
doc.saveAs(new File("/path/to/output.ai"), saveOpts);

// Export as PDF
var pdfOpts = new PDFSaveOptions();
pdfOpts.compatibility = PDFCompatibility.ACROBAT7;
pdfOpts.preserveEditability = false;
doc.saveAs(new File("/path/to/output.pdf"), pdfOpts);

// Export as PNG
var pngOpts = new ExportOptionsPNG24();
pngOpts.horizontalScale = 300;
pngOpts.verticalScale = 300;
pngOpts.transparency = true;
doc.exportFile(new File("/path/to/output.png"), ExportType.PNG24, pngOpts);

// Export as SVG
var svgOpts = new ExportOptionsSVG();
svgOpts.fontType = SVGFontType.OUTLINEFONT;
doc.exportFile(new File("/path/to/output.svg"), ExportType.SVG, svgOpts);
```

## パスと図形の操作

### 組み込み図形メソッド

`pathItems` コレクションは一般的な図形向けの便利メソッドを提供する:

```javascript
var doc = app.activeDocument;
var layer = doc.activeLayer;

// Rectangle: rectangle(top, left, width, height)
var rect = layer.pathItems.rectangle(500, 100, 200, 150);

// Rounded rectangle: roundedRectangle(top, left, width, height, hRadius, vRadius)
var rrect = layer.pathItems.roundedRectangle(500, 100, 200, 150, 20, 20);

// Ellipse: ellipse(top, left, width, height)
var oval = layer.pathItems.ellipse(400, 200, 100, 100);

// Polygon: polygon(centerX, centerY, radius, sides)
var hex = layer.pathItems.polygon(300, 300, 50, 6);

// Star: star(centerX, centerY, radius, innerRadius, points)
var star = layer.pathItems.star(300, 300, 50, 25, 5);
```

### 座標配列を使った自由形状パス

```javascript
var doc = app.activeDocument;
var path = doc.pathItems.add();
path.setEntirePath([[100, 100], [200, 200], [300, 100]]);
path.closed = false;
path.stroked = true;
path.strokeWidth = 2;
```

### PathPointオブジェクトを使った自由形状パス

```javascript
var doc = app.activeDocument;
var path = doc.pathItems.add();

var point1 = path.pathPoints.add();
point1.anchor = [100, 100];
point1.leftDirection = [100, 100];
point1.rightDirection = [150, 150];
point1.pointType = PointType.SMOOTH;

var point2 = path.pathPoints.add();
point2.anchor = [300, 100];
point2.leftDirection = [250, 150];
point2.rightDirection = [300, 100];
point2.pointType = PointType.SMOOTH;

path.closed = false;
```

### パスのプロパティ

```javascript
var item = doc.pathItems[0];
item.filled = true;
item.stroked = true;
item.strokeWidth = 1.5;
item.strokeCap = StrokeCap.ROUNDENDCAP;
item.strokeJoin = StrokeJoin.ROUNDENDJOIN;
item.opacity = 80;
item.closed = true;
```

## カラーの操作

### カラーオブジェクト

```javascript
// RGB Color (values 0-255)
var red = new RGBColor();
red.red = 255;
red.green = 0;
red.blue = 0;

// CMYK Color (values 0-100)
var cyan = new CMYKColor();
cyan.cyan = 100;
cyan.magenta = 0;
cyan.yellow = 0;
cyan.black = 0;

// Grayscale (0-100, 0 = black)
var gray = new GrayColor();
gray.gray = 50;

// Lab Color
var lab = new LabColor();
lab.l = 50;
lab.a = 20;
lab.b = -30;

// No color (transparent)
var none = new NoColor();
```

### カラーの適用

```javascript
var item = doc.pathItems[0];
item.fillColor = red;
item.strokeColor = cyan;

// Gradient fill
var gradient = doc.gradients.add();
gradient.type = GradientType.LINEAR;
gradient.gradientStops[0].color = red;
gradient.gradientStops[1].color = cyan;

var gradColor = new GradientColor();
gradColor.gradient = gradient;
item.fillColor = gradColor;
```

###特色カラーとスウォッチ

```javascript
// Create a spot color
var spot = doc.spots.add();
spot.name = "My Spot Color";
spot.color = red; // Base color definition

var spotColor = new SpotColor();
spotColor.spot = spot;
spotColor.tint = 100;

item.fillColor = spotColor;

// Access a swatch by name
var swatch = doc.swatches.getByName("PANTONE 185 C");
item.fillColor = swatch.color;
```

## テキストの操作

### テキストフレームの種類

```javascript
var doc = app.activeDocument;

// Point text
var pointText = doc.textFrames.add();
pointText.contents = "Hello World!";
pointText.position = [100, 500];

// Area text (text inside a path)
var rectPath = doc.pathItems.rectangle(500, 100, 200, 100);
var areaText = doc.textFrames.areaText(rectPath);
areaText.contents = "Text inside a rectangle shape.";

// Path text (text along a path)
var curvePath = doc.pathItems.add();
curvePath.setEntirePath([[50, 300], [150, 400], [250, 300]]);
var pathText = doc.textFrames.pathText(curvePath);
pathText.contents = "Text on a path";
```

### 文字と段落の書式

```javascript
var tf = doc.textFrames[0];
var textRange = tf.textRange;

// Character attributes
var charAttr = textRange.characterAttributes;
charAttr.size = 24;           // Font size in points
charAttr.textFont = app.textFonts.getByName("ArialMT");
charAttr.fillColor = red;
charAttr.tracking = 50;       // Em units
charAttr.horizontalScale = 100;
charAttr.verticalScale = 100;
charAttr.baselineShift = 0;

// Paragraph attributes
var paraAttr = textRange.paragraphAttributes;
paraAttr.justification = Justification.CENTER;
paraAttr.firstLineIndent = 0;
paraAttr.leftIndent = 0;
paraAttr.spaceBefore = 0;
paraAttr.spaceAfter = 0;
```

### テキスト内容へのアクセス

```javascript
var tf = doc.textFrames[0];

// Access sub-ranges
var firstChar = tf.characters[0];
var firstWord = tf.words[0];
var firstPara = tf.paragraphs[0];
var firstLine = tf.lines[0];

// Modify specific ranges
tf.words[0].characterAttributes.size = 36;
tf.paragraphs[0].paragraphAttributes.justification = Justification.LEFT;
```

### テキストフレームの連結

```javascript
var frame1 = doc.textFrames.areaText(path1);
var frame2 = doc.textFrames.areaText(path2);

// Link frames so text flows from frame1 to frame2
frame1.nextFrame = frame2;

// Stories represent the full text across threaded frames
var storyCount = doc.stories.length;
var fullText = doc.stories[0].textRange.contents;
```

## レイヤーの操作

```javascript
var doc = app.activeDocument;

// Create a layer
var newLayer = doc.layers.add();
newLayer.name = "Background";
newLayer.visible = true;
newLayer.locked = false;
newLayer.opacity = 100;

// Access existing layers
var topLayer = doc.layers[0];
var layerByName = doc.layers.getByName("Background");

// Move items between layers
var item = doc.pathItems[0];
item.move(newLayer, ElementPlacement.PLACEATBEGINNING);

// Reorder layers
newLayer.zOrder(ZOrderMethod.SENDTOBACK);
```

## 選択範囲の操作

```javascript
// Get current selection
var sel = app.activeDocument.selection;

// Iterate selected items
for (var i = 0; i < sel.length; i++) {
    var item = sel[i];
    // Check type using typename
    if (item.typename === "PathItem") {
        item.fillColor = red;
    } else if (item.typename === "TextFrame") {
        item.contents = "Modified";
    }
}

// Select an item programmatically
doc.pathItems[0].selected = true;

// Deselect all
doc.selection = null;
```

## シンボルの操作

```javascript
// Place a symbol instance
var sym = doc.symbols.getByName("MySymbol");
var instance = doc.symbolItems.add(sym);
instance.position = [200, 400];

// Access symbol definition
var symDef = instance.symbol;

// Break link to symbol (expand to regular art)
instance.breakLink();
```

## 変形

```javascript
var item = doc.pathItems[0];

// Rotate 45 degrees around center
item.rotate(45);

// Scale to 50% width, 75% height
item.resize(50, 75);

// Translate (move) by 100 points right and 50 points up
item.translate(100, 50);

// Using a transformation matrix
var matrix = app.getIdentityMatrix();
matrix = app.concatenateRotationMatrix(matrix, 30);
matrix = app.concatenateScaleMatrix(matrix, 150, 150);
item.transform(matrix);
```

## アートボードの操作

```javascript
var doc = app.activeDocument;

// Access artboards
var ab = doc.artboards[0];
var rect = ab.artboardRect; // [left, top, right, bottom]

// Create a new artboard
var newAB = doc.artboards.add([0, 0, 612, 792]); // Letter size
newAB.name = "Page 2";

// Set active artboard
doc.artboards.setActiveArtboardIndex(1);
```

## データ駆動グラフィック（変数とデータセット）

```javascript
// Variables link document items to data fields
var v = doc.variables.add();
v.kind = VariableKind.TEXTUAL;
v.name = "headline";

// Link a text frame to the variable
var tf = doc.textFrames[0];
tf.contentVariable = v;

// Create datasets for batch content
var ds = doc.dataSets.add();
ds.name = "Version 1";
// Dataset captures current variable bindings

// Switch datasets to swap content
doc.dataSets[0].display();
```

## 印刷

```javascript
var doc = app.activeDocument;
var opts = new PrintOptions();

opts.printPreset = "Default";

// Paper options
var paperOpts = new PrintPaperOptions();
paperOpts.name = "Letter";
opts.paperOptions = paperOpts;

// Job options
var jobOpts = new PrintJobOptions();
jobOpts.copies = 1;
jobOpts.designation = PrintArtworkDesignation.VISIBLELAYERS;
opts.jobOptions = jobOpts;

doc.print(opts);
```

## ユーザー操作レベル

スクリプト実行中にIllustratorがダイアログを表示するかを制御する:

```javascript
// Suppress all dialogs
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

// Perform operations that might prompt dialogs...
doc.close(SaveOptions.DONOTSAVECHANGES);

// Restore dialog display
app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;
```

## メソッドの操作（JavaScript固有）

複数の任意パラメーターを持つメソッドを呼ぶ場合、中間パラメーターを飛ばすには `undefined` を使う:

```javascript
// rotate(angle, [changePositions], [changeFillPatterns], [changeFillGradients], ...)
item.rotate(30, undefined, undefined, true);
```

## 外部呼び出しと引数の受け渡し

Illustratorスクリプトは、シェルスクリプト、スケジューラー、ビルドパイプライン、ExtendScript Toolkit、または他のCreative Cloudアプリからの `BridgeTalk` メッセージなど、アプリケーション外部から起動されることが多い。これらのランチャー配下の実行環境は、アプリケーション内の *File > Scripts* 経路といくつかの点で異なり、本来は正しいコードを壊すことがよくある。

### 外部ランチャー配下では `arguments[]` は信頼できない

ExtendScript Toolkitの `-run` 呼び出しと `BridgeTalk.send()` は、任意のランチャー引数をスクリプト最上位の `arguments[]` 配列へ転送しない。多くの構成では、下記のように、呼び出し元が渡した値ではなく単一の `[object BridgeTalk]` 要素だけが配列に入る。

```javascript
// At top of script
var passed = (typeof arguments !== "undefined") ? arguments : [];
for (var i = 0; i < passed.length; i++) {
    $.writeln("arg[" + i + "] = " + passed[i]);
    // Often prints: arg[0] = [object BridgeTalk]
}
```

スクリプトが外部から起動される場合、必須入力に `arguments[]` を頼らない。次のより信頼できるチャネルのいずれかを使う。

### パラメーター用サイドカーファイル

外部ランチャー配下でスクリプトが失敗し、エラー原因が明らかでない場合は、サイドカーファイルへフォールバックする。呼び出し元に既知の絶対パスへ小さなテキストファイルを書かせ、起動時にそれを読む。この方法はランチャーの癖に左右されず、失敗後に調査しやすい。

```javascript
var SIDECAR_PATH = "C:/Users/userName/job.args.txt";

function readSidecar(path) {
    var f = new File(path);
    if (!f.exists || !f.open("r")) return null;
    var lines = [];
    while (!f.eof) {
        var ln = f.readln();
        if (ln && !/^\s*$/.test(ln)) lines.push(ln);
    }
    f.close();
    return {
        input:  lines[0],
        output: lines[1],
        mode:   lines[2]
    };
}
```

`key=value` 形式も同様に使いやすく、位置依存の脆さを避けられる:

```text
input=C:/path/to/input.ai
output=C:/path/to/output.pdf
mode=preview
```

### 環境変数

`$.getenv("NAME")` は、ランチャーではなく **Illustratorのプロセス**から見える環境変数を返す。ランチャーがIllustratorに値を見せる必要がある場合は、起動前にシステム全体またはIllustratorの親環境へ変数を設定しなければならない。呼び出しごとの値にはサイドカーファイルを優先する。

### `$.fileName` と `File($.fileName).parent`

アプリケーション内実行では、`$.fileName` は実行中スクリプトの絶対パスであり、`File($.fileName).parent` はスクリプトのフォルダーを返す。一部の外部ランチャー（特にESTK `-run`）では `$.fileName` が空になり、相対パス解決が静かに失敗することがある。

```javascript
// Fragile: returns null under some launchers
var here = $.fileName ? File($.fileName).parent : null;
var sidecar = here ? new File(here.fsName + "/job.args.txt") : null;

// Robust: hardcode a known absolute path or fall back to a stable location
var sidecar = new File("C:/Users/userName/job.args.txt");
if (!sidecar.exists) sidecar = new File(Folder.temp.fsName + "/job.args.txt");
```

### 絶対パスへの診断ログ

ダイアログが抑制され、ランチャーが `$.writeln` 出力を表示しない場合があるため、無言の失敗はよく起こる。実行後に調査できるよう、既知の絶対パスへプレーンテキストログを書く。最初の呼び出しがディレクトリ不足で失敗しないよう、親フォルダーは必要時に作成する。

```javascript
var LOG_PATH = "C:/Users/userName/logs/job.log";

function log(msg) {
    try {
        var f = new File(LOG_PATH);
        try { if (!f.parent.exists) f.parent.create(); } catch (eDir) {}
        if (f.open("a")) {
            f.writeln("[" + new Date() + "] " + msg);
            f.close();
        }
    } catch (e) {}
}
```

### エントリポイントを `try { ... } catch` で囲む

外部起動されたスクリプトは、目に見える兆候なしに失敗することが多い。最上位の `try`/`catch` でエラーをログファイルへ書くと、無言の失敗を調査可能な1行へ変換できる。

```javascript
try {
    main();
} catch (err) {
    log("FATAL: " + err + (err && err.line ? " line=" + err.line : ""));
}
```

### ユーザー操作を抑制する

外部呼び出し元はダイアログに応答できない。DOM操作の前に無効化し、ヘッドレスで起動される可能性があるスクリプトでは `alert()` / `confirm()` / `prompt()` を完全に避ける。

```javascript
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
```

### 明示的に保存する

閉じるだけ、またはIllustratorをアイドル状態へ戻すだけでは作業ファイルは保存されない。すべてのDOM編集後、`doc.saveAs(...)`（または `doc.save()`）を明示的に呼び出し、成功したかをログに記録する。

```javascript
var opts = new IllustratorSaveOptions();
opts.compatibility = Compatibility.ILLUSTRATOR17;
doc.saveAs(new File(doc.fullName.fsName), opts);
```

## よく使うパターン

### ドキュメント内のすべてのページアイテムを反復する

```javascript
function processAllItems(doc) {
    for (var i = 0; i < doc.pageItems.length; i++) {
        var item = doc.pageItems[i];
        // Process based on type
        switch (item.typename) {
            case "PathItem":
                // handle path
                break;
            case "TextFrame":
                // handle text
                break;
            case "GroupItem":
                // handle group (may contain nested items)
                break;
        }
    }
}
```

### 編集前にレイヤーとグループを再帰的にロック解除する

A locked layer or any locked ancestor (parent group, clip group, sublayer)
will cause edits to throw `Error: Target layer cannot be modified`. Walk the
full hierarchy and clear `locked` / `hidden` flags before performing DOM
modifications.

```javascript
function unlockAll(doc) {
    function visitLayers(layers) {
        for (var i = 0; i < layers.length; i++) {
            var lyr = layers[i];
            try { lyr.locked = false; lyr.visible = true; } catch (e) {}
            visitItems(lyr);
            if (lyr.layers && lyr.layers.length) visitLayers(lyr.layers);
        }
    }
    function visitItems(container) {
        var items = container.pageItems;
        for (var j = 0; j < items.length; j++) {
            var it = items[j];
            try { it.locked = false; it.hidden = false; } catch (e) {}
            if (it.typename === "GroupItem") visitItems(it);
        }
    }
    visitLayers(doc.layers);
}
```

### リンク画像の背後にあるファイルを差し替える（再リンク）

`PlacedItem.file = newFile` replaces a linked image while preserving the
parent, stacking order, and (after re-applying) the bounds. **`RasterItem`
does not expose a writable `file` property**, so when a placeholder is a
raster you must add a fresh `PlacedItem` in the same parent, copy the bounds,
then remove the original.

```javascript
function relinkOrRebuild(item, newFile) {
    var bounds = item.geometricBounds.slice();
    var parent = item.parent;
    var name   = item.name;

    if (item.typename === "PlacedItem") {
        item.file = newFile;
        item.geometricBounds = bounds;
        return item;
    }

    // RasterItem path: rebuild as a linked PlacedItem in the same parent.
    var fresh = parent.placedItems.add();
    fresh.file = newFile;
    fresh.geometricBounds = bounds;
    if (name) try { fresh.name = name; } catch (e) {}
    fresh.move(item, ElementPlacement.PLACEBEFORE);
    item.remove();
    return fresh;
}
```

### SVGコンテンツを配置する（コピー/貼り付けパターン）

`PlacedItem.file` はラスター形式とAI/PDFを受け付けるが、**SVGは受け付けない**。`.svg` Fileを設定すると `Unable to set placed item's file, is the file path provided valid?` が投げられる。SVGアートワークをドキュメントへ取り込む信頼できる方法は、SVGを別ドキュメントとして開き、すべて選択してコピーし、閉じてから作業ドキュメントへ貼り付けることである。

```javascript
function placeSVG(targetDoc, svgFile, targetLayer) {
    var donor = app.open(svgFile);
    app.executeMenuCommand("selectall");
    app.executeMenuCommand("copy");
    donor.close(SaveOptions.DONOTSAVECHANGES);

    app.activeDocument = targetDoc;
    targetDoc.activeLayer = targetLayer;
    app.executeMenuCommand("pasteFront");

    var sel = targetDoc.selection;
    if (!sel || sel.length === 0) return null;
    if (sel.length === 1) return sel[0];

    // Multiple pasted items: group them so callers get a single handle.
    var group = targetLayer.groupItems.add();
    for (var i = sel.length - 1; i >= 0; i--) {
        sel[i].move(group, ElementPlacement.PLACEATBEGINNING);
    }
    return group;
}
```

### マスクグループ内のクリッピングパスを見つける

クリップグループは、`clipping === true` を持つ子 `PathItem`（または、まれに `CompoundPathItem` の子）としてクリッピング形状を公開する。クリップの `geometricBounds` は、コンテンツのサイズ調整や中央揃えに使う可視フレームを提供する。

```javascript
function findClipPath(group) {
    var items = group.pageItems;
    for (var i = 0; i < items.length; i++) {
        var it = items[i];
        try {
            if (it.typename === "PathItem" && it.clipping) return it;
            if (it.typename === "CompoundPathItem") {
                for (var j = 0; j < it.pathItems.length; j++) {
                    if (it.pathItems[j].clipping) return it;
                }
            }
        } catch (e) {}
    }
    return null;
}
```

### cover-fitとcontain-fitのサイズ調整

画像で矩形を完全に覆う（はみ出しはマスクで隠す）には、幅/高さ比の大きい方を使う。完全に内側へ収めるには、小さい方を使う。塗り足し係数（例: `1.10`）を使うと、cover画像をクリップ端より少し外側まで広げられる。

```javascript
function fitItemToRect(item, rect, mode, bleed) {
    // rect = [L, T, R, B] (Illustrator: T > B)
    var rw = rect[2] - rect[0];
    var rh = rect[1] - rect[3];
    var ib = item.geometricBounds;
    var iw = ib[2] - ib[0];
    var ih = ib[1] - ib[3];
    if (iw <= 0 || ih <= 0) return;

    var sx = rw / iw;
    var sy = rh / ih;
    var s  = (mode === "cover" ? Math.max(sx, sy) : Math.min(sx, sy))
           * (bleed || 1);
    item.resize(s * 100, s * 100);

    var cx = (rect[0] + rect[2]) / 2;
    var cy = (rect[1] + rect[3]) / 2;
    var b  = item.geometricBounds;
    var w  = b[2] - b[0];
    var h  = b[1] - b[3];
    item.position = [cx - w / 2, cy + h / 2];
}
```



### フォルダー内のファイルをバッチ処理する

```javascript
var folder = Folder.selectDialog("Select folder of .ai files");
if (folder) {
    var files = folder.getFiles("*.ai");
    for (var i = 0; i < files.length; i++) {
        var doc = app.open(files[i]);
        // Process each document...
        doc.close(SaveOptions.DONOTSAVECHANGES);
    }
}
```

### エラー処理

```javascript
try {
    var doc = app.activeDocument;
    var layer = doc.layers.getByName("NonExistentLayer");
} catch (e) {
    alert("Error: " + e.message);
    // e.message, e.line, e.fileName available
}
```

## トラブルシューティング

- **"undefined is not an object"**: 通常はコレクションが空、またはインデックスが範囲外であることを意味する。アイテムへアクセスする前に `.length` を確認する。
- **スクリプトは実行されるが見た目が変わらない**: 変更後に `app.redraw()` を呼び出し、画面更新を強制する。
- **カラーモード不一致**: ドキュメントのカラースペース（RGB vs CMYK）はカラーオブジェクトと一致している必要がある。`doc.documentColorSpace` で確認する。
- **位置がおかしく見える**: スクリプトで作成したドキュメントは左下原点で、Yが上方向に増えることを思い出す。`position` プロパティはバウンディングボックス左上である。
- **テキストが表示されない**: テキストフレームが0ではないサイズを持つことを確認する。ポイントテキストでは `position` を設定し、エリアテキストでは `areaText()` に有効なパスを渡す。
- **Windowsのファイルパス**: パス文字列ではスラッシュ（`/`）または二重バックスラッシュ（`\\`）を使うか、`File` オブジェクトコンストラクターを使う。
- **ダイアログボックスがバッチスクリプトを中断する**: バッチ操作前に `app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS` を設定する。
- **コレクションは `getByName()` を使う**: 多くのコレクションオブジェクトは `getByName("name")` をサポートし、見つからない場合はエラーを投げるためtry/catchで囲む。
- **"Target layer cannot be modified"**: ロックされたレイヤー、サブレイヤー、または親グループ（多くは `Cover_Mask` のようなクリップグループ）が編集を妨げている。変更前にドキュメント全体で `locked` と `hidden` を再帰的に解除する。[レイヤーとグループを再帰的にロック解除する](#編集前にレイヤーとグループを再帰的にロック解除する)を参照する。
- **"Unable to set placed item's file, is the file path provided valid?"**: ファイルは存在しパスも正しいが、`PlacedItem.file` がその形式を受け付けない。SVGが最も一般的な原因である。代わりに[open / copy / pasteパターン](#svgコンテンツを配置するコピー貼り付けパターン)を使う。
- **`RasterItem.file = newFile` が何もしない、または例外を投げる**: `RasterItem` は書き込み可能な `file` プロパティを公開しない。同じ親に新しい `PlacedItem` を追加し、境界と名前を復元してからラスタを `.remove()` する。
- **`arguments[0]` が `[object BridgeTalk]`（または空）**: スクリプトがESTK `-run` または `BridgeTalk` メッセージ経由で起動されており、位置引数が転送されていない。既知の絶対パスにあるサイドカーファイルを使う。[外部呼び出しと引数の受け渡し](#外部呼び出しと引数の受け渡し)を参照する。
- **`$.fileName` が空**: 同じ外部ランチャー起因である。ヘッドレス起動され得るスクリプトでは、`$.fileName` からリソースパスを導出しない。絶対パスまたは `Folder.temp` を使う。
- **スクリプトが何もしていないように見える**: ほとんどの場合、ロックされた祖先、抑制されたダイアログがエラーを隠していること、または編集後の明示的な `saveAs` 不足が原因である。実行確認とエラー取得のため、絶対パスへログを書く最上位 `try`/`catch` を追加する。
- **`item.resize(sx, sy)` が予期せずアートワークを再中央揃えした**: `resize` は既定でアイテム中心（`Transformation.CENTER`）を基準に拡大縮小する。明示的な `scaleAbout` 引数を渡すか、後続で `translate(dx, dy)` して再配置する。

## スクリプティング定数リファレンス

API全体でよく使う列挙定数:

| カテゴリ | 定数 |
|---|---|
| **Color Space** | `DocumentColorSpace.RGB`, `DocumentColorSpace.CMYK` |
| **Justification** | `Justification.LEFT`, `Justification.CENTER`, `Justification.RIGHT`, `Justification.FULLJUSTIFY` |
| **Point Type** | `PointType.SMOOTH`, `PointType.CORNER` |
| **Stroke Cap** | `StrokeCap.BUTTENDCAP`, `StrokeCap.ROUNDENDCAP`, `StrokeCap.PROJECTINGENDCAP` |
| **Stroke Join** | `StrokeJoin.MITERENDJOIN`, `StrokeJoin.ROUNDENDJOIN`, `StrokeJoin.BEVELENDJOIN` |
| **Blend Mode** | `BlendModes.NORMAL`, `BlendModes.MULTIPLY`, `BlendModes.SCREEN`, `BlendModes.OVERLAY` |
| **Save Options** | `SaveOptions.SAVECHANGES`, `SaveOptions.DONOTSAVECHANGES`, `SaveOptions.PROMPTTOSAVECHANGES` |
| **Export Type** | `ExportType.PNG24`, `ExportType.PNG8`, `ExportType.JPEG`, `ExportType.SVG`, `ExportType.TIFF`, `ExportType.PHOTOSHOP`, `ExportType.AUTOCAD`, `ExportType.FLASH` |
| **Element Placement** | `ElementPlacement.PLACEATBEGINNING`, `ElementPlacement.PLACEATEND`, `ElementPlacement.PLACEBEFORE`, `ElementPlacement.PLACEAFTER`, `ElementPlacement.INSIDE` |
| **Z-Order** | `ZOrderMethod.BRINGTOFRONT`, `ZOrderMethod.SENDTOBACK`, `ZOrderMethod.BRINGFORWARD`, `ZOrderMethod.SENDBACKWARD` |
| **Gradient Type** | `GradientType.LINEAR`, `GradientType.RADIAL` |
| **Text Frame Kind** | `TextType.POINTTEXT`, `TextType.AREATEXT`, `TextType.PATHTEXT` |
| **Variable Kind** | `VariableKind.TEXTUAL`, `VariableKind.IMAGE`, `VariableKind.VISIBILITY`, `VariableKind.GRAPH` |
| **User Interaction** | `UserInteractionLevel.DISPLAYALERTS`, `UserInteractionLevel.DONTDISPLAYALERTS` |
| **Compatibility** | `Compatibility.ILLUSTRATOR10` through `Compatibility.ILLUSTRATOR24` |

## JavaScriptオブジェクトリファレンス（APIオブジェクト完全一覧）

Illustrator JavaScript APIには、カテゴリ別に次のオブジェクトが含まれる:

### Core Objects

`Application`, `Document`, `Documents`, `DocumentPreset`, `Layer`, `Layers`, `PageItem`, `PageItems`, `View`, `Views`, `Preferences`

### Path and Shape Objects

`PathItem`, `PathItems`, `PathPoint`, `PathPoints`, `CompoundPathItem`, `CompoundPathItems`, `GroupItem`, `GroupItems`

### Text Objects

`TextFrame`, `TextRange`, `TextRanges`, `TextPath`, `Characters`, `Words`, `Paragraphs`, `Lines`, `InsertionPoint`, `InsertionPoints`, `Story`, `Stories`, `CharacterAttributes`, `ParagraphAttributes`, `CharacterStyle`, `CharacterStyles`, `ParagraphStyle`, `ParagraphStyles`, `TextFont`, `TextFonts`, `TabStopInfo`

### Color Objects

`RGBColor`, `CMYKColor`, `GrayColor`, `LabColor`, `NoColor`, `SpotColor`, `Spot`, `Spots`, `PatternColor`, `GradientColor`, `Color`, `Gradient`, `Gradients`, `GradientStop`, `GradientStops`

### Swatch and Style Objects

`Swatch`, `Swatches`, `SwatchGroup`, `SwatchGroups`, `GraphicStyle`, `GraphicStyles`, `Pattern`, `Patterns`, `Brush`, `Brushes`

### Symbol Objects

`Symbol`, `Symbols`, `SymbolItem`, `SymbolItems`

### Artboard Objects

`Artboard`, `Artboards`

### Placed and Raster Objects

`PlacedItem`, `PlacedItems`, `RasterItem`, `RasterItems`, `MeshItem`, `MeshItems`, `GraphItem`, `GraphItems`, `PluginItem`, `PluginItems`, `NonNativeItem`, `NonNativeItems`, `LegacyTextItem`, `LegacyTextItems`

### Data-Driven Objects

`Variable`, `Variables`, `Dataset`, `Datasets`

### Matrix and Transform Objects

`Matrix`

### Tag Objects

`Tag`, `Tags`

### Tracing Objects

`TracingObject`, `TracingOptions`

### Save and Export Options

`IllustratorSaveOptions`, `EPSSaveOptions`, `PDFSaveOptions`, `FXGSaveOptions`, `ExportOptionsAutoCAD`, `ExportOptionsFlash`, `ExportOptionsGIF`, `ExportOptionsJPEG`, `ExportOptionsPhotoshop`, `ExportOptionsPNG8`, `ExportOptionsPNG24`, `ExportOptionsSVG`, `ExportOptionsTIFF`

### Open Options

`OpenOptions`, `OpenOptionsAutoCAD`, `OpenOptionsFreeHand`, `OpenOptionsPhotoshop`, `PDFFileOptions`, `PhotoshopFileOptions`

### Print Objects

`PrintOptions`, `PrintJobOptions`, `PrintPaperOptions`, `PrintColorManagementOptions`, `PrintColorSeparationOptions`, `PrintCoordinateOptions`, `PrintFlattenerOptions`, `PrintFontOptions`, `PrintPageMarksOptions`, `PrintPostScriptOptions`, `Printer`, `PrinterInfo`, `Paper`, `PaperInfo`, `PPDFile`, `PPDFileInfo`, `Ink`, `InkInfo`, `Screen`, `ScreenInfo`, `ScreenSpotFunction`

### Image and Rasterize Options

`ImageCaptureOptions`, `RasterEffectOptions`, `RasterizeOptions`

## 参考資料

- [Changelog](https://ai-scripting.docsforadobe.dev/introduction/changelog/) - Recent scripting API changes (CC 2020 added `Document.getPageItemFromUuid` and `PageItem.uuid`; CC 2017 added `Application.getIsFileOpen`)
- [Illustrator Scripting Guide](https://ai-scripting.docsforadobe.dev/) - Full community-maintained documentation

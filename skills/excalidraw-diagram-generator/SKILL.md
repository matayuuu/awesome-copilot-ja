---
name: excalidraw-diagram-generator
description: '自然言語の説明から Excalidraw 図を生成します。「図を作成」「フローチャートを作成」「プロセスを可視化」「システム アーキテクチャを描画」「マインドマップを作成」「Excalidraw ファイルを生成」などの依頼で使用します。フローチャート、関連図、マインドマップ、システム アーキテクチャ図に対応し、Excalidraw で直接開ける .excalidraw JSON ファイルを出力します。'
---

# Excalidraw 図ジェネレーター

Excalidraw形式の図を自然言語の説明から生成するためのスキルです。このスキルを使うと、手作業で描くことなく、プロセス、システム、関係性、アイデアの視覚表現を作成できます。

## このスキルを使うとき

次のような依頼があった場合にこのスキルを使います。

- "Create a diagram showing..."
- "Make a flowchart for..."
- "Visualize the process of..."
- "Draw the system architecture of..."
- "Generate a mind map about..."
- "Create an Excalidraw file for..."
- "Show the relationship between..."
- "Diagram the workflow of..."

**対応している図の種類:**
- 📊 **フローチャート**: 連続したプロセス、ワークフロー、意思決定ツリー
- 🔗 **関連図**: エンティティ間の関係、システム構成要素、依存関係
- 🧠 **マインドマップ**: 概念の階層、ブレインストーミングの結果、トピックの整理
- 🏗️ **アーキテクチャ図**: システム設計、モジュール間の相互作用、データフロー
- 📈 **データフロー図 (DFD)**: データの流れの可視化、データ変換処理
- 🏊 **ビジネスフロー (Swimlane)**: 部門横断のワークフロー、役割に基づくプロセスの流れ
- 📦 **クラス図**: オブジェクト指向設計、クラス構造と関係
- 🔄 **シーケンス図**: 時間の経過に伴うオブジェクト間の相互作用、メッセージの流れ
- 🗃️ **ER図**: データベースのエンティティ関係、データモデル

## 前提条件

- 可視化したい内容の明確な説明
- 主要なエンティティ、手順、または概念の特定
- 要素間の関係や流れの理解

## 手順に沿ったワークフロー

### 手順 1: 要求を理解する

ユーザーの説明を分析し、次を判断します。
1. **図の種類**（フローチャート、関係図、マインドマップ、アーキテクチャ）
2. **主要な要素**（エンティティ、手順、概念）
3. **関係性**（流れ、接続、階層）
4. **複雑さ**（要素数）

### 手順 2: 適切な図の種類を選ぶ

| ユーザーの意図 | 図の種類 | 例のキーワード |
|-------------|--------------|------------------|
| プロセスの流れ、手順、手続き | **フローチャート** | "workflow", "process", "steps", "procedure" |
| 接続、依存関係、関連付け | **関連図** | "relationship", "connections", "dependencies", "structure" |
| 概念の階層、ブレインストーミング | **マインドマップ** | "mind map", "concepts", "ideas", "breakdown" |
| システム設計、構成要素 | **アーキテクチャ図** | "architecture", "system", "components", "modules" |
| データの流れ、変換処理 | **データフロー図 (DFD)** | "data flow", "data processing", "data transformation" |
| 部門横断のプロセス、役割の責任 | **ビジネスフロー (Swimlane)** | "business process", "swimlane", "actors", "responsibilities" |
| オブジェクト指向設計、クラス構造 | **クラス図** | "class", "inheritance", "OOP", "object model" |
| 相互作用のシーケンス、メッセージの流れ | **シーケンス図** | "sequence", "interaction", "messages", "timeline" |
| データベース設計、エンティティ間の関係 | **ER図** | "database", "entity", "relationship", "data model" |

### 手順 3: 構造化された情報を抽出する

**フローチャートの場合:**
- 連続した手順の一覧
- 判断ポイント（ある場合）
- 開始点と終了点

**関連図の場合:**
- エンティティ/ノード（名前 + 必要に応じた説明）
- エンティティ間の関係（from → to、ラベル付き）

**マインドマップの場合:**
- 中心トピック
- メインブランチ（3〜6程度を推奨）
- 各ブランチのサブトピック（任意）

**データフロー図 (DFD) の場合:**
- データソースと宛先（外部エンティティ）
- プロセス（データ変換）
- データストア（データベース、ファイル）
- データフロー（左から右、または左上から右下への向きの矢印）
- **重要**: プロセスの順序は表現せず、データフローのみを表現する

**ビジネスフロー (Swimlane) の場合:**
- 役割/アクター（部門、システム、人間）- ヘッダー列として表示
- プロセスレーン（各アクターの下の縦レーン）
- プロセスボックス（各レーン内のアクティビティ）
- フロー矢印（プロセスボックス間を接続し、レーン横断の受け渡しを含む）

**クラス図の場合:**
- 名前付きクラス
- 可視性（+, -, #）付き属性
- 可視性と引数付きメソッド
- 関係: 継承（実線 + 白三角形）、実装（破線 + 白三角形）、関連（実線）、依存（破線）、集約（実線 + 白ダイヤモンド）、合成（実線 + 塗りつぶしダイヤモンド）
- 多重度表記（1, 0..1, 1..*, *）

**シーケンス図の場合:**
- オブジェクト/アクター（上部で横に配置）
- ライフライン（各オブジェクトから伸びる縦線）
- メッセージ（ライフライン間の横向き矢印）
- 同期メッセージ（実線の矢印）、非同期メッセージ（破線の矢印）
- 戻り値（破線の矢印）
- アクティベーションボックス（実行中のライフライン上の矩形）
- 時間の流れは上から下

**ER図の場合:**
- エンティティ（エンティティ名付きの矩形）
- 属性（エンティティ内に列挙）
- 主キー（下線または PK として表示）
- 外部キー（FK として表示）
- 関係（エンティティをつなぐ線）
- カーディナリティ: 1:1（1対1）、1:N（1対多）、N:M（多対多）
- 多対多関係のための接続テーブル/関連エンティティ（破線の矩形）

### 手順 4: Excalidraw JSON を生成する

`.excalidraw` ファイルを作成し、適切な要素を配置します:

**利用可能な要素の種類:**
- `rectangle`: エンティティ、手順、概念のためのボックス
- `ellipse`: 強調のための代替形状
- `diamond`: 判断ポイント
- `arrow`: 方向性のある接続
- `text`: ラベルと注釈

**設定する主なプロパティ:**
- **位置**: `x`, `y` 座標
- **サイズ**: `width`, `height`
- **スタイル**: `strokeColor`, `backgroundColor`, `fillStyle`
- **フォント**: `fontFamily: 5` (Excalifont - すべてのテキスト要素に必須)
- **テキスト**: ラベル用の埋め込みテキスト
- **接続**: `points` 配列で矢印を定義

**重要**: すべてのテキスト要素は、一貫した視覚的な見た目を維持するために `fontFamily: 5` (Excalifont) を使用する必要があります。

### 手順 5: 出力を整形する

完全な Excalidraw ファイルの構造を整えます:

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [
    // Array of diagram elements
  ],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "gridSize": 20
  },
  "files": {}
}
```

### 手順 6: 保存して案内する

1. `<descriptive-name>.excalidraw` として保存する
2. 開き方を案内する:
   - https://excalidraw.com を開く
   - 「Open」をクリックするか、ファイルをドラッグ＆ドロップする
   - または Excalidraw の VS Code 拡張機能を使用する

## ベストプラクティス

### 要素数のガイドライン

| 図の種類 | 推奨数 | 最大数 |
|--------------|--------|--------|
| フローチャートの手順 | 3-10 | 15 |
| 関連図のエンティティ | 3-8 | 12 |
| マインドマップのブランチ | 4-6 | 8 |
| ブランチごとのマインドマップのサブトピック | 2-4 | 6 |

### レイアウトのコツ

1. **開始位置**: 重要な要素を中央に配置し、一貫した間隔を保つ
2. **間隔**:
   - 要素間の横方向のギャップ: 200-300px
   - 行間の縦方向のギャップ: 100-150px
3. **色**: 一貫した配色を使用する
   - 基本要素: 薄い青色 (`#a5d8ff`)
   - 副要素: 薄い緑色 (`#b2f2bb`)
   - 重要/中心要素: 黄色 (`#ffd43b`)
   - 警告/注意: 薄い赤色 (`#ffc9c9`)
4. **文字サイズ**: 読みやすさのため 16-24px
5. **フォント**: すべてのテキスト要素で `fontFamily: 5` (Excalifont) を使用する
6. **矢印のスタイル**: 単純な流れには直線の矢印を使い、複雑な関係では曲線を使う

### 複雑さの管理

**ユーザーの依頼に要素が多すぎる場合:**
- 複数の図に分割することを提案する
- まず主要な要素に絞る
- 詳細なサブ図を作成する提案を行う

**例の応答:**
```
"Your request includes 15 components. For clarity, I recommend:
1. High-level architecture diagram (6 main components)
2. Detailed diagram for each subsystem

Would you like me to start with the high-level view?"
```

## 例のプロンプトと応答

### 例 1: シンプルなフローチャート

**ユーザー:** "Create a flowchart for user registration"

**エージェントが生成する内容:**
1. 手順を抽出: "Enter email" → "Verify email" → "Set password" → "Complete"
2. 4つの矩形 + 3つの矢印でフローチャートを作成
3. `user-registration-flow.excalidraw` として保存

### 例 2: 関連図

**ユーザー:** "Diagram the relationship between User, Post, and Comment entities"

**エージェントが生成する内容:**
1. エンティティ: User, Post, Comment
2. 関係: User → Post ("creates"), User → Comment ("writes"), Post → Comment ("contains")
3. `user-content-relationships.excalidraw` として保存

### 例 3: マインドマップ

**ユーザー:** "Mind map about machine learning concepts"

**エージェントが生成する内容:**
1. 中心: "Machine Learning"
2. ブランチ: Supervised Learning, Unsupervised Learning, Reinforcement Learning, Deep Learning
3. 各ブランチのサブトピック
4. `machine-learning-mindmap.excalidraw` として保存

## トラブルシューティング

| 問題 | 対処法 |
|-------|----------|
| 要素が重なる | 座標間の余白を増やす |
| ボックス内にテキストが収まらない | ボックス幅を広げるか、フォントサイズを小さくする |
| 要素が多すぎる | 複数の図に分割する |
| レイアウトが不明瞭 | グリッドレイアウト（行/列）または放射状レイアウト（マインドマップ）を使う |
| 色が一貫しない | 要素の種類に基づいて配色を事前に定義する |

## 高度な技術

### グリッドレイアウト（関係図向け）
```javascript
const columns = Math.ceil(Math.sqrt(entityCount));
const x = startX + (index % columns) * horizontalGap;
const y = startY + Math.floor(index / columns) * verticalGap;
```

### 放射状レイアウト（マインドマップ向け）
```javascript
const angle = (2 * Math.PI * index) / branchCount;
const x = centerX + radius * Math.cos(angle);
const y = centerY + radius * Math.sin(angle);
```

### 自動生成ID
一意なIDを作成するには、タイムスタンプとランダム文字列を使います:
```javascript
const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
```

## 出力形式

常に次を提供します:
1. ✅ 完全な `.excalidraw` JSON ファイル
2. 📊 作成した内容の要約
3. 📝 要素数
4. 💡 開く/編集するための手順

**例の要約:**
```
Created: user-workflow.excalidraw
Type: Flowchart
Elements: 7 rectangles, 6 arrows, 1 title text
Total: 14 elements

To view:
1. Visit https://excalidraw.com
2. Drag and drop user-workflow.excalidraw
3. Or use File → Open in Excalidraw VS Code extension
```

## 検証チェックリスト

図を納品する前に:
- [ ] すべての要素に一意のIDがある
- [ ] 座標が重なり合わないように設定されている
- [ ] テキストが読みやすい（フォントサイズ 16 以上）
- [ ] **すべてのテキスト要素は `fontFamily: 5` (Excalifont) を使用している**
- [ ] 矢印が論理的に接続されている
- [ ] 色が一貫した配色に従っている
- [ ] ファイルが有効な JSON である
- [ ] 要素数が妥当である（明確さのため 20 未満）

## アイコンライブラリ（任意の強化機能）

特化した図（例: AWS/GCP/Azure のアーキテクチャ図）では、Excalidraw の既製アイコンライブラリを使うことができます。これにより、基本的な図形ではなく、プロフェッショナルで標準化されたアイコンを使えます。

### ユーザーがアイコンを要求した場合

**ユーザーが AWS/cloud アーキテクチャ図を依頼し、特定のアイコンの使用を希望した場合:**

1. **ライブラリが存在するか確認**: `libraries/<library-name>/reference.md` を確認する
2. **ライブラリが存在する場合**: アイコンを使って進める（以下の AI Assistant Workflow を参照）
3. **ライブラリが存在しない場合**: セットアップ手順を伝える:

   ```
   To use [AWS/GCP/Azure/etc.] architecture icons, please follow these steps:
   
   1. Visit https://libraries.excalidraw.com/
   2. Search for "[AWS Architecture Icons/etc.]" and download the .excalidrawlib file
   3. Create directory: skills/excalidraw-diagram-generator/libraries/[icon-set-name]/
   4. Place the downloaded file in that directory
   5. Run the splitter script:
      python skills/excalidraw-diagram-generator/scripts/split-excalidraw-library.py skills/excalidraw-diagram-generator/libraries/[icon-set-name]/
   
   This will split the library into individual icon files for efficient use.
   After setup is complete, I can create your diagram using the actual AWS/cloud icons.
   
   Alternatively, I can create the diagram now using simple shapes (rectangles, ellipses) 
   which you can later replace with icons manually in Excalidraw.
   ```

### ユーザー向けセットアップ手順（詳細）

**手順 1: ライブラリ用ディレクトリを作成**
```bash
mkdir -p skills/excalidraw-diagram-generator/libraries/aws-architecture-icons
```

**手順 2: ライブラリをダウンロード**
- アクセス先: https://libraries.excalidraw.com/
- 目的のアイコンセット（例: "AWS Architecture Icons"）を検索する
- ダウンロードして `.excalidrawlib` ファイルを取得する
- 例のカテゴリ（利用状況は変動するため、サイトで確認）:
   - Cloud service icons
   - UI/Material icons
   - Flowchart symbols

**手順 3: ライブラリファイルを配置**
- ダウンロードしたファイル名を、作成したディレクトリ名に合わせて変更する（例: `aws-architecture-icons.excalidrawlib`）
- 手順 1 で作成したディレクトリに移動する

**手順 4: 分割スクリプトを実行**
```bash
python skills/excalidraw-diagram-generator/scripts/split-excalidraw-library.py skills/excalidraw-diagram-generator/libraries/aws-architecture-icons/
```

**手順 5: セットアップを確認**
スクリプト実行後、次の構造が存在することを確認します:
```
skills/excalidraw-diagram-generator/libraries/aws-architecture-icons/
  aws-architecture-icons.excalidrawlib  (original)
  reference.md                          (generated - icon lookup table)
  icons/                                (generated - individual icon files)
    API-Gateway.json
    CloudFront.json
    EC2.json
    Lambda.json
    RDS.json
    S3.json
    ...
```

### AI アシスタントのワークフロー

**`libraries/` にアイコンライブラリがある場合:**

**推奨アプローチ: Python スクリプトを使用する（効率的かつ信頼性が高い）**

リポジトリには、アイコンの統合を自動で処理する Python スクリプトが含まれています:

1. **ベースとなる図の構造を作成**:
   - 基本レイアウト（タイトル、ボックス、領域）を含む `.excalidraw` ファイルを作成する
   - キャンバスと全体構造を確立する

2. **Python スクリプトでアイコンを追加**:
   ```bash
   python skills/excalidraw-diagram-generator/scripts/add-icon-to-diagram.py \
     <diagram-path> <icon-name> <x> <y> [--label "Text"] [--library-path PATH]
   ```
   - 上書きの問題を避けるため、`.excalidraw.edit` による編集をデフォルトで有効にする。上書きを無効にするには `--no-use-edit-suffix` を渡す。

   **例**:
   ```bash
   # Add EC2 icon at position (400, 300) with label
   python scripts/add-icon-to-diagram.py diagram.excalidraw EC2 400 300 --label "Web Server"
   
   # Add VPC icon at position (200, 150)
   python scripts/add-icon-to-diagram.py diagram.excalidraw VPC 200 150
   
   # Add icon from different library
   python scripts/add-icon-to-diagram.py diagram.excalidraw Compute-Engine 500 200 \
     --library-path libraries/gcp-icons --label "API Server"
   ```

3. **接続矢印を追加**:
   ```bash
   python skills/excalidraw-diagram-generator/scripts/add-arrow.py \
     <diagram-path> <from-x> <from-y> <to-x> <to-y> [--label "Text"] [--style solid|dashed|dotted] [--color HEX]
   ```
   - 上書きの問題を避けるため、`.excalidraw.edit` による編集をデフォルトで有効にする。上書きを無効にするには `--no-use-edit-suffix` を渡す。

   **例**:
   ```bash
   # Simple arrow from (300, 250) to (500, 300)
   python scripts/add-arrow.py diagram.excalidraw 300 250 500 300
   
   # Arrow with label
   python scripts/add-arrow.py diagram.excalidraw 300 250 500 300 --label "HTTPS"
   
   # Dashed arrow with custom color
   python scripts/add-arrow.py diagram.excalidraw 400 350 600 400 --style dashed --color "#7950f2"
   ```

4. **ワークフローの要約**:
   ```bash
   # Step 1: Create base diagram with title and structure
   # (Create .excalidraw file with initial elements)
   
   # Step 2: Add icons with labels
   python scripts/add-icon-to-diagram.py my-diagram.excalidraw "Internet-gateway" 200 150 --label "Internet Gateway"
   python scripts/add-icon-to-diagram.py my-diagram.excalidraw VPC 250 250
   python scripts/add-icon-to-diagram.py my-diagram.excalidraw ELB 350 300 --label "Load Balancer"
   python scripts/add-icon-to-diagram.py my-diagram.excalidraw EC2 450 350 --label "EC2 Instance"
   python scripts/add-icon-to-diagram.py my-diagram.excalidraw RDS 550 400 --label "Database"
   
   # Step 3: Add connecting arrows
   python scripts/add-arrow.py my-diagram.excalidraw 250 200 300 250  # Internet → VPC
   python scripts/add-arrow.py my-diagram.excalidraw 300 300 400 300  # VPC → ELB
   python scripts/add-arrow.py my-diagram.excalidraw 400 330 500 350  # ELB → EC2
   python scripts/add-arrow.py my-diagram.excalidraw 500 380 600 400  # EC2 → RDS
   ```

**Python スクリプト方式の利点**:
- ✅ **トークン消費なし**: アイコン JSON データ（1件あたり 200-1000 行）は AI コンテキストに入らない
- ✅ **正確な変換**: 座標計算が決定論的に処理される
- ✅ **ID 管理**: 自動の UUID 生成で競合を防ぐ
- ✅ **信頼性が高い**: 座標の誤計算や ID 衝突のリスクがない
- ✅ **高速**: 直接ファイル操作で、解析オーバーヘッドがない
- ✅ **再利用可能**: 提供した任意の Excalidraw ライブラリで動作する

**代替手段: 手動でアイコンを統合する（推奨しない）**

この方法は Python スクリプトが利用できない場合のみ使用します:

1. **ライブラリを確認**:
   ```
   List directory: skills/excalidraw-diagram-generator/libraries/
   Look for subdirectories containing reference.md files
   ```

2. **reference.md を読み込む**:
   ```
   Open: libraries/<library-name>/reference.md
   This is lightweight (typically <300 lines) and lists all available icons
   ```

3. **関連するアイコンを探す**:
   ```
   Search the reference.md table for icon names matching diagram needs
   Example: For AWS diagram with EC2, S3, Lambda → Find "EC2", "S3", "Lambda" in table
   ```

4. **必要なアイコンデータを読み込む**（警告: 大容量）:
   ```
   Read ONLY the needed icon files:
   - libraries/aws-architecture-icons/icons/EC2.json (200-300 lines)
   - libraries/aws-architecture-icons/icons/S3.json (200-300 lines)
   - libraries/aws-architecture-icons/icons/Lambda.json (200-300 lines)
   Note: Each icon file is 200-1000 lines - this consumes significant tokens
   ```

5. **要素を抽出して変換**:
   ```
   Each icon JSON contains an "elements" array
   Calculate bounding box (min_x, min_y, max_x, max_y)
   Apply offset to all x/y coordinates
   Generate new unique IDs for all elements
   Update groupIds references
   Copy transformed elements into your diagram
   ```

6. **アイコンを配置し、接続を追加**:
   ```
   Adjust x/y coordinates to position icons correctly in the diagram
   Update IDs to ensure uniqueness across diagram
   Add connecting arrows and labels as needed
   ```

**手動統合の課題**:
- ⚠️ 高いトークン消費（1アイコンあたり 200-1000 行 × アイコン数）
- ⚠️ 複雑な座標変換計算
- ⚠️ 適切に処理しないと ID が衝突するリスク
- ⚠️ 多くのアイコンを含む図では時間がかかる

### AWS 図をアイコン付きで作成する例

**依頼**: "Create an AWS architecture diagram with Internet Gateway, VPC, ELB, EC2, and RDS"

**推奨ワークフロー（Python スクリプト使用）**:
**依頼**: "Create an AWS architecture diagram with Internet Gateway, VPC, ELB, EC2, and RDS"

**推奨ワークフロー（Python スクリプト使用）**:

```bash
# Step 1: Create base diagram file with title
# Create my-aws-diagram.excalidraw with basic structure (title, etc.)

# Step 2: Check icon availability
# Read: libraries/aws-architecture-icons/reference.md
# Confirm icons exist: Internet-gateway, VPC, ELB, EC2, RDS

# Step 3: Add icons with Python script
python scripts/add-icon-to-diagram.py my-aws-diagram.excalidraw "Internet-gateway" 150 100 --label "Internet Gateway"
python scripts/add-icon-to-diagram.py my-aws-diagram.excalidraw VPC 200 200
python scripts/add-icon-to-diagram.py my-aws-diagram.excalidraw ELB 350 250 --label "Load Balancer"
python scripts/add-icon-to-diagram.py my-aws-diagram.excalidraw EC2 500 300 --label "Web Server"
python scripts/add-icon-to-diagram.py my-aws-diagram.excalidraw RDS 650 350 --label "Database"

# Step 4: Add connecting arrows
python scripts/add-arrow.py my-aws-diagram.excalidraw 200 150 250 200  # Internet → VPC
python scripts/add-arrow.py my-aws-diagram.excalidraw 265 230 350 250  # VPC → ELB
python scripts/add-arrow.py my-aws-diagram.excalidraw 415 280 500 300  # ELB → EC2
python scripts/add-arrow.py my-aws-diagram.excalidraw 565 330 650 350 --label "SQL" --style dashed

# Result: Complete diagram with professional AWS icons, labels, and connections
```

**利点**:
- 座標計算を手作業で行わない
- アイコンデータのトークン消費がない
- 決定論的で信頼性が高い
- 位置調整を簡単に繰り返せる

**代替ワークフロー（手動、スクリプトが使えない場合）**:
1. 確認: `libraries/aws-architecture-icons/reference.md` が存在する → はい
2. reference.md を読み込む → Internet-gateway, VPC, ELB, EC2, RDS の項目を探す
3. 読み込む:
   - `icons/Internet-gateway.json` (298 行)
   - `icons/VPC.json` (550 行)
   - `icons/ELB.json` (363 行)
   - `icons/EC2.json` (231 行)
   - `icons/RDS.json` (同程度)
   **合計: 2000 行以上の JSON を処理**
4. 各 JSON から要素を抽出
5. 各アイコンの境界ボックスとオフセットを計算
6. 位置決めのためにすべての x/y 座標を変換
7. すべての要素に一意の ID を生成
8. データフローを示す矢印を追加
9. テキストラベルを追加
10. 最終的な `.excalidraw` ファイルを生成

**手動アプローチの課題**:
- 高いトークン消費（約 2000-5000 行）
- 複雑な座標計算
- ID 衝突のリスク

### サポート対象のアイコンライブラリ（例 - 利用可能性を確認）

- このワークフローは、提供された有効な `.excalidrawlib` ファイルで動作します。
- https://libraries.excalidraw.com/: で見つかる可能性があるライブラリカテゴリの例:
   - Cloud service icons
   - Kubernetes / infrastructure icons
   - UI / Material icons
   - Flowchart / diagram symbols
   - Network diagram icons
- 利用可能性と命名は変更される場合があるため、使用前にサイトで正確なライブラリ名を確認してください。

### 代替手段: アイコンライブラリがない場合

**アイコンライブラリが未設定の場合:**
- 基本的な図形（矩形、楕円、矢印）で図を作成する
- 色分けとテキストラベルを使って構成要素を区別する
- 後でアイコンを追加できること、または将来の図のためにライブラリをセットアップできることをユーザーに伝える
- 図は機能的で明確なままですが、視覚的にはやや簡素になる

## 参考資料

関連する参考資料:
- `references/excalidraw-schema.md` - 完全な Excalidraw JSON スキーマ
- `references/element-types.md` - 詳細な要素型の仕様
- `templates/flowchart-template.excalidraw` - 基本的なフローチャートのスターター
- `templates/relationship-template.excalidraw` - 関連図のスターター
- `templates/mindmap-template.excalidraw` - マインドマップのスターター
- `templates/business-flow-swimlane-template.excalidraw` - ビジネスフローの swimlane スターター
- `templates/class-diagram-template.excalidraw` - クラス図のスターター
- `templates/data-flow-diagram-template.excalidraw` - データフロー図のスターター
- `templates/er-diagram-template.excalidraw` - エンティティ関係図のスターター
- `templates/sequence-diagram-template.excalidraw` - シーケンス図のスターター
- `scripts/add-icon-to-diagram.py` - Excalidraw ライブラリから図へのアイコン追加
- `scripts/add-arrow.py` - 図内の要素間に矢印（接続）を追加
- `scripts/split-excalidraw-library.py` - `.excalidrawlib` ファイルを分割するためのツール
- `scripts/README.md` - ライブラリツールのドキュメント
- `scripts/.gitignore` - ローカルの Python アーティファクトをコミットしないようにする

## 制約事項

- 複雑な曲線は、直線/基本的な曲線に簡略化される
- 手描きの粗さはデフォルト値（1）に設定される
- 自動生成では埋め込み画像のサポートはない
- 推奨される最大要素数: 1図あたり 20 個
- 自動衝突検出はない（間隔ガイドラインを使用する）

## 今後の拡張予定

将来の改善案:
- 自動レイアウト最適化アルゴリズム
- Mermaid/PlantUML 構文からのインポート
- テンプレートライブラリの拡張
- 生成後の対話的な編集

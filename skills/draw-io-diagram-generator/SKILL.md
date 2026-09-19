---
name: draw-io-diagram-generator
description: 'draw.io ダイアグラムファイル（.drawio、.drawio.svg、.drawio.png）の作成、編集、生成時に使用します。mxGraph XML の作成、シェイプライブラリ、スタイル文字列、フローチャート、システムアーキテクチャ、シーケンス図、ER 図、UML クラス図、ネットワークトポロジ、レイアウト戦略、hediet.vscode-drawio VS Code 拡張機能、依頼から開けるファイルを完成させるまでのエージェントワークフローを扱います。'
---

# Draw.io 図ジェネレーター

このスキルを使用すると、正しい mxGraph XML 構造を持つ draw.io (`.drawio`) ダイアグラムファイルを生成、編集、検証できます。生成されたすべてのファイルは、手動での修正を一切必要とせずに、[Draw.io VS Code extension](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio)
(`hediet.vscode-drawio`) ですぐに開けます。必要に応じて、draw.io の Web アプリまたはデスクトップアプリでファイルを開くこともできます。

---

## 1. このスキルを使用する場面

**トリガーフレーズ（これらを見かけたらこのスキルを読み込む）**

- 「ダイアグラムを作成する」、「フローチャートを描く」、「アーキテクチャ図を生成する」
- 「シーケンス図を設計する」、「UML クラス図を作成する」、「ER 図を構築する」
- 「.drawio ファイルを追加する」、「ダイアグラムを更新する」、「フローを可視化する」
- 「アーキテクチャを文書化する」、「データモデルを示す」、「サービス間のやり取りを図式化する」
- `.drawio`、`.drawio.svg`、または `.drawio.png` ファイルの作成または変更を求めるあらゆる依頼

**対応するダイアグラムの種類**

| ダイアグラムの種類 | テンプレートの有無 | 説明 |
|---|---|---|
| フローチャート | `assets/templates/flowchart.drawio` | 判断と分岐を含むプロセスフロー |
| システムアーキテクチャ | `assets/templates/architecture.drawio` | マルチティア / レイヤードサービスアーキテクチャ |
| シーケンス図 | `assets/templates/sequence.drawio` | アクターのライフラインと時系列のメッセージフロー |
| ER 図 | `assets/templates/er-diagram.drawio` | リレーションシップを持つデータベーステーブル |
| UML クラス図 | `assets/templates/uml-class.drawio` | クラス、インターフェース、列挙型、リレーションシップ |
| ネットワークトポロジ | （シェイプライブラリを使用） | ルーター、サーバー、ファイアウォール、サブネット |
| BPMN ワークフロー | （シェイプライブラリを使用） | ビジネスプロセスのイベント、タスク、ゲートウェイ |
| マインドマップ | （手動） | 放射状に分岐する中心トピック |

---

## 2. 前提条件

- VS Code 統合を有効にして実行する場合は、drawio 拡張機能をインストールします: **draw.io VS Code extension** — `hediet.vscode-drawio`（拡張機能 ID）。次のコマンドでインストールします:
  ```
  ext install hediet.vscode-drawio
  ```
- **対応するファイル拡張子**: `.drawio`、`.drawio.svg`、`.drawio.png`
- **Python 3.8+**（任意）— `scripts/` 内の検証スクリプトおよびシェイプ挿入スクリプト用

---

## 3. エージェントの段階的ワークフロー

すべてのダイアグラム生成タスクで、以下の手順を順番に実行します。

### ステップ 1 — 依頼を理解する

次の項目を質問または推測します:
1. **ダイアグラムの種類** — どの種類のダイアグラムか?（フローチャート、アーキテクチャ、UML、ER、シーケンス、ネットワークなど）
2. **エンティティ / アクター** — 主なコンポーネント、アクター、クラス、テーブルは何か?
3. **リレーションシップ** — どのように接続されるか? 方向は? カーディナリティは?
4. **出力パス** — `.drawio` ファイルはどこに保存するか?
5. **既存ファイル** — 新規作成か、既存ファイルの編集か?

依頼が曖昧な場合は、コンテキストから最も妥当なダイアグラムの種類を推測します（例: 「テーブルを表示する」→ ER 図、「API 呼び出しの流れを表示する」→ シーケンス図）。

### ステップ 2 — テンプレートを選択するか、新規に開始する

- ダイアグラムの種類が `assets/templates/` 内のものと一致する場合は、**テンプレートを使用します**。テンプレート構造をコピーしてプレースホルダー値を置き換えます。
- 新しいレイアウトには**新規に開始します**。最小限の有効なスケルトンから始めます:

```xml
<!-- Set modified="" to the current ISO 8601 timestamp when generating a new file -->
<mxfile host="Electron" modified="" version="26.0.0">
  <diagram id="page-1" name="Page-1">
    <mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1"
                  tooltips="1" connect="1" arrows="1" fold="1"
                  page="1" pageScale="1" pageWidth="1169" pageHeight="827"
                  math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <!-- Your cells go here -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

> **ルール**: id `0` および `1` は常に必須で、最初の 2 つのセルでなければなりません。これらを再利用してはいけません。

### ステップ 3 — レイアウトを計画する

XML を生成する前に、論理的な配置をスケッチします:
- **行**または**層**に整理する（レイヤーにはスイムレーンを使用）
- **水平方向の間隔**: 同一行のシェイプ間を 40～60px
- **垂直方向の間隔**: 層の行間を 80～120px
- 標準シェイプサイズ: プロセスボックスは `120x60` px、スイムレーンは `160x80` px
- 既定のキャンバス: A4 横向き = `1169 x 827` px

### ステップ 4 — mxGraph XML を生成する

**頂点セル**（すべてのシェイプ）:
```xml
<mxCell id="unique-id" value="Label"
        style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
        vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="120" height="60" as="geometry" />
</mxCell>
```

**エッジセル**（すべてのコネクタ）:
```xml
<mxCell id="edge-id" value="Label (optional)"
        style="edgeStyle=orthogonalEdgeStyle;html=1;"
        edge="1" source="source-id" target="target-id" parent="1">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
```

**重要なルール**:
- すべてのセル ID は、ファイル内で**グローバルに一意**でなければならない
- すべての頂点には、`x`、`y`、`width`、`height`、`as="geometry"` を持つ `mxGeometry` 子要素が必要
- すべてのエッジには、既存の頂点 ID と一致する `source` および `target` が必要 — **例外**: フローティングエッジ（例: シーケンス図のライフライン）は、代わりに `<mxGeometry>` 内で `sourcePoint`/`targetPoint` を使用します。§4「シーケンス図」を参照してください
- すべてのセルの `parent` は、既存のセル ID を参照しなければならない
- ラベルに HTML（`<b>`、`<i>`、`<br>`）が含まれる場合は、style に `html=1` を使用する
- ラベル内の XML 特殊文字をエスケープする: `&` => `&amp;`、`<` => `&lt;`、`>` => `&gt;`

### ステップ 5 — 正しいスタイルを適用する

一貫性のために、標準のセマンティックカラーパレットを使用します:

| 用途 | fillColor | strokeColor |
|---|---|---|
| 主要 / 情報 | `#dae8fc` | `#6c8ebf` |
| 成功 / 開始 | `#d5e8d4` | `#82b366` |
| 警告 / 判断 | `#fff2cc` | `#d6b656` |
| エラー / 終了 | `#f8cecc` | `#b85450` |
| ニュートラル | `#f5f5f5` | `#666666` |
| 外部 / パートナー | `#e1d5e7` | `#9673a6` |

ダイアグラムの種類ごとの一般的なスタイル文字列:

```
# Rounded process box (flowchart)
rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;

# Decision diamond
rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;

# Start/End terminal
ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;

# Database cylinder
shape=mxgraph.flowchart.database;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;

# Swimlane container (tier)
swimlane;startSize=30;fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=1;

# UML class box
swimlane;fontStyle=1;align=center;startSize=40;fillColor=#dae8fc;strokeColor=#6c8ebf;

# Interface / stereotype box
swimlane;fontStyle=3;align=center;startSize=40;fillColor=#f5f5f5;strokeColor=#666666;

# ER table container
shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;

# Orthogonal connector
edgeStyle=orthogonalEdgeStyle;html=1;

# ER relationship (crow's foot)
edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;
```

> 完全なスタイルキーのカタログについては `references/style-reference.md` を、すべてのシェイプライブラリ名については `references/shape-libraries.md` を参照してください。

### ステップ 6 — 保存して検証する

1. `.drawio` 拡張子を付けて、**ファイルを書き込みます**
2. **バリデーターを実行します**（任意ですが推奨）:
   ```bash
   python .github/skills/draw-io-diagram-generator/scripts/validate-drawio.py <path-to-file.drawio>
   ```
3. **ファイルの開き方をユーザーに伝えます**:
   > 「VS Code で `<filename>` を開くと、draw.io 拡張機能により自動的にレンダリングされます。必要に応じて draw.io の Web アプリまたはデスクトップアプリも使用できます。」
4. ユーザーが内容を把握できるよう、ダイアグラムに含まれるものを**簡潔に説明します**。

---

## 4. ダイアグラムの種類ごとのレシピ

### フローチャート

主要な要素: 開始（楕円）=> プロセス（角丸四角形）=> 判断（ひし形）=> 終了（楕円）

```xml
<!-- Start node -->
<mxCell id="start" value="Start"
        style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;"
        vertex="1" parent="1">
  <mxGeometry x="500" y="80" width="120" height="60" as="geometry" />
</mxCell>

<!-- Process -->
<mxCell id="p1" value="Process Step"
        style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
        vertex="1" parent="1">
  <mxGeometry x="500" y="200" width="120" height="60" as="geometry" />
</mxCell>

<!-- Decision -->
<mxCell id="d1" value="Condition?"
        style="rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;"
        vertex="1" parent="1">
  <mxGeometry x="460" y="320" width="200" height="100" as="geometry" />
</mxCell>

<!-- Arrow: start to p1 -->
<mxCell id="e1" value=""
        style="edgeStyle=orthogonalEdgeStyle;html=1;"
        edge="1" source="start" target="p1" parent="1">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
```

### アーキテクチャ図（3 層）

各層には**スイムレーンコンテナ**を使用します。すべてのサービスボックスは、そのスイムレーンの子要素です。

```xml
<!-- Tier swimlane -->
<mxCell id="tier1" value="Client Layer"
        style="swimlane;startSize=30;fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=1;"
        vertex="1" parent="1">
  <mxGeometry x="60" y="100" width="1050" height="130" as="geometry" />
</mxCell>

<!-- Service inside tier (parent="tier1", coords are relative to tier) -->
<mxCell id="webapp" value="Web App"
        style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
        vertex="1" parent="tier1">
  <mxGeometry x="80" y="40" width="120" height="60" as="geometry" />
</mxCell>
```

> 層間のコネクタでは、`parent="1"` を含む絶対座標を使用します。

### シーケンス図

主要な要素: アクター（上部）、ライフライン（破線の垂直線）、アクティベーションボックス、メッセージ矢印。

- ライフライン: `endArrow=none` および `dashed=1` を持つ `edge="1"`。source/target は使用せず、geometry 内で `sourcePoint`/`targetPoint` を使用する
- 同期メッセージ: `endArrow=block;endFill=1`
- 戻りメッセージ: `endArrow=open;endFill=0;dashed=1`
- 自己呼び出し: 右方向と戻る方向に 2 つの Array ポイントを使用してエッジをループさせる

**最小 XML スニペット:**

```xml
<!-- Actor (stick figure) -->
<mxCell id="actorA" value="Client"
        style="shape=mxgraph.uml.actor;pointerEvents=1;dashed=0;whiteSpace=wrap;html=1;aspect=fixed;"
        vertex="1" parent="1">
  <mxGeometry x="110" y="80" width="60" height="80" as="geometry" />
</mxCell>

<!-- Service box -->
<mxCell id="actorB" value="API Server"
        style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;"
        vertex="1" parent="1">
  <mxGeometry x="480" y="100" width="160" height="60" as="geometry" />
</mxCell>

<!-- Lifeline — floating edge: uses sourcePoint/targetPoint, NOT source/target attributes -->
<mxCell id="lifA" value=""
        style="edgeStyle=none;dashed=1;endArrow=none;"
        edge="1" parent="1">
  <mxGeometry relative="1" as="geometry">
    <mxPoint x="140" y="160" as="sourcePoint" />
    <mxPoint x="140" y="700" as="targetPoint" />
  </mxGeometry>
</mxCell>

<!-- Activation box (thin rectangle on lifeline) -->
<mxCell id="actA1" value=""
        style="fillColor=#dae8fc;strokeColor=#6c8ebf;"
        vertex="1" parent="1">
  <mxGeometry x="130" y="220" width="20" height="180" as="geometry" />
</mxCell>

<!-- Synchronous message -->
<mxCell id="msg1" value="POST /orders"
        style="edgeStyle=elbowEdgeStyle;elbow=vertical;html=1;endArrow=block;endFill=1;"
        edge="1" source="actA1" target="actorB" parent="1">
  <mxGeometry relative="1" as="geometry" />
</mxCell>

<!-- Return message (dashed) -->
<mxCell id="msg2" value="201 Created"
        style="edgeStyle=elbowEdgeStyle;elbow=vertical;dashed=1;html=1;endArrow=open;endFill=0;"
        edge="1" source="actorB" target="actA1" parent="1">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
```

> **注:** ライフラインは、`source`/`target` 属性の代わりに `<mxGeometry>` 内で `sourcePoint`/`targetPoint` を使用するフローティングエッジです。これはシーケンス図における標準の draw.io パターンです。

### ER 図

`childLayout=tableLayout` を持つ `shape=table` コンテナを使用します。行は `portConstraint=eastwest` を持つ `shape=tableRow` セルです。各行内の列は `shape=partialRectangle` です。

リレーションシップ矢印には `edgeStyle=entityRelationEdgeStyle` を使用します:
- 1 対 1: `startArrow=ERone;endArrow=ERone`
- 1 対多: `startArrow=ERone;endArrow=ERmany`
- 多対多: `startArrow=ERmany;endArrow=ERmany`
- 必須: `ERmandOne`、任意: `ERzeroToOne`

### UML クラス図

クラスボックスはスイムレーンコンテナです。属性とメソッドはプレーンテキストセルです。区切り線は高さ 0 のスイムレーンの子要素です。

リレーションシップの種類ごとの矢印スタイル:

| リレーションシップ | スタイル文字列 |
|---|---|
| 継承（extends） | `edgeStyle=orthogonalEdgeStyle;html=1;endArrow=block;endFill=0;` |
| 実現（implements） | `edgeStyle=orthogonalEdgeStyle;dashed=1;html=1;endArrow=block;endFill=0;` |
| コンポジション | `edgeStyle=orthogonalEdgeStyle;html=1;startArrow=diamond;startFill=1;endArrow=none;` |
| 集約 | `edgeStyle=orthogonalEdgeStyle;html=1;startArrow=diamond;startFill=0;endArrow=none;` |
| 依存 | `edgeStyle=orthogonalEdgeStyle;dashed=1;html=1;endArrow=open;endFill=0;` |
| 関連 | `edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;` |

---

## 5. 複数ページのダイアグラム

複雑なシステムでは、複数の `<diagram>` 要素を追加します:

```xml
<mxfile host="Electron" version="26.0.0">
  <diagram id="overview" name="Overview">
    <!-- overview mxGraphModel -->
  </diagram>
  <diagram id="detail" name="Detail View">
    <!-- detail mxGraphModel -->
  </diagram>
</mxfile>
```

各ページは独立したセル ID 名前空間を持ちます。同じ ID 値が異なるページに出現しても競合しません。

---

## 6. 既存のダイアグラムを編集する

既存の `.drawio` ファイルを変更する場合:

1. 既存のセル ID、位置、親階層を理解するため、最初にファイルを**読み取ります**
2. **対象のダイアグラムページを特定します** — インデックスまたは `name` 属性で特定します
3. 既存の ID と衝突しない、新しい一意の ID を**割り当てます**
4. **コンテナ階層を尊重します** — スイムレーンの子要素には、親を基準とした相対座標を使用します
5. **エッジを検証します** — ノードを再配置した後に、エッジの source/target ID が有効なままであることを確認します

生の XML を編集せずに 1 つのシェイプを安全に追加するには、`scripts/add-shape.py` を使用します:
```bash
python .github/skills/draw-io-diagram-generator/scripts/add-shape.py docs/arch.drawio "New Service" 700 380
```

---

## 7. ベストプラクティス

**レイアウト**
- シェイプを 10px グリッドに揃える（すべての座標を 10 で割り切れる値にする）
- 関連するシェイプをスイムレーンコンテナ内にグループ化する
- 1 ページにつき 1 つのダイアグラムトピックとし、複雑なシステムには複数ページのファイルを使用する
- 可読性のため、1 ページあたりのセル数は 40 以下を目標とする

**ラベル**
- すべてのページの上部にタイトルテキストセル（`text;strokeColor=none;fillColor=none;fontSize=18;fontStyle=1`）を追加する
- 頂点シェイプには常に `whiteSpace=wrap;html=1` を設定する
- ラベルは簡潔に保つ — 可能であれば、各シェイプにつき 3 語以下にする

**スタイルの一貫性**
- プロジェクト全体でセクション 3 ステップ 5 のセマンティックカラーパレットを一貫して使用する
- すっきりした直角コネクタには `edgeStyle=orthogonalEdgeStyle` を優先する
- 必要な場合を除き、ラベル内に任意の HTML をインラインで記述しない

**ファイル名**
- ケバブケースを使用する: `order-service-flow.drawio`、`database-schema.drawio`
- ダイアグラムを、それが文書化するコードの隣に配置する: `docs/` または `architecture/`

---

## 8. トラブルシューティング

| 問題 | 考えられる原因 | 修正方法 |
|---|---|---|
| VS Code でファイルを開くと空白になる | id=0 または id=1 のセルがない | 他のセルより前に、両方のルートセルを追加する |
| シェイプの位置が誤っている | コンテナ内の子要素である — 座標は相対座標 | `parent` を確認し、コンテナを基準に x/y を調整する |
| エッジが表示されない | source または target ID がどの頂点にも一致しない | 両方の ID が記載どおりに存在することを確認する |
| ダイアグラムに「Compressed」と表示される | mxGraphModel が base64 エンコードされている | draw.io Web で開き、File > Export > XML（uncompressed）を選択する |
| シェイプスタイルがレンダリングされない | shape= 名のタイプミス | 正確なスタイル文字列について `references/shape-libraries.md` を確認する |
| ラベルにエスケープされた HTML が表示される | HTML ラベルを持つセルで html=0 が設定されている | セルスタイルに `html=1;` を追加する |
| コンテナの子要素がコンテナの端と重なる | コンテナの高さが小さすぎる | mxGeometry 内のコンテナの高さを増やす |

---

## 9. 検証チェックリスト

生成した `.drawio` ファイルを提供する前に、次の項目を確認します:

- [ ] ファイルが `<mxfile>` ルート要素で始まる
- [ ] すべての `<diagram>` に空でない `id` 属性がある
- [ ] `<mxCell id="0" />` がすべてのダイアグラムの最初のセルである
- [ ] `<mxCell id="1" parent="0" />` がすべてのダイアグラムの 2 番目のセルである
- [ ] すべてのセルの `id` 値が各ダイアグラム内で一意である
- [ ] すべての頂点セルに `vertex="1"` と子 `<mxGeometry as="geometry">` がある
- [ ] すべてのエッジセルに `edge="1"` があり、次のいずれかを満たす: (a) 既存の頂点 ID を指す `source`/`target`、または (b) `<mxGeometry>` 内の `<mxPoint as="sourcePoint">` と `<mxPoint as="targetPoint">`（フローティングエッジ — シーケンス図のライフラインで使用）
- [ ] （id=0 を除く）すべてのセルに、既存の ID を指す `parent` がある
- [ ] HTML タグを含むすべてのラベルのスタイルに `html=1` が含まれる
- [ ] XML が整形式である（閉じられていないタグや、属性値内でエスケープされていない `&`、`<`、`>` がない）
- [ ] 各ページの上部にタイトルラベルセルがある

自動バリデーターを実行します:
```bash
python .github/skills/draw-io-diagram-generator/scripts/validate-drawio.py <file.drawio>
```

---

## 10. 出力形式

ダイアグラムを提供する際は、常に以下を提供します:

1. 要求されたパスに書き込まれた **`.drawio` ファイル**
2. ダイアグラムが示す内容の**一文による要約**
3. **開き方**:
   > 「VS Code で `<filename>` を開くと、draw.io 拡張機能により自動的にレンダリングされます。または、必要に応じて draw.io の Web アプリまたはデスクトップアプリで開くこともできます。」
4. **編集方法**（ユーザーがカスタマイズする可能性が高い場合）:
   > 「任意のシェイプをクリックして選択します。ラベルを編集するにはダブルクリックします。ドラッグして再配置します。」
5. **検証ステータス** — バリデータースクリプトを実行し、成功したかどうか

---

## 11. 参照

すべての関連ファイルは `.github/skills/draw-io-diagram-generator/` にあります:

| ファイル | 内容 |
|---|---|
| `references/drawio-xml-schema.md` | 完全な mxfile / mxGraphModel / mxCell 属性リファレンス、座標系、予約済みセル、検証ルール |
| `references/style-reference.md` | 許可される値を含むすべてのスタイルキー、頂点およびエッジのスタイルキー、シェイプカタログ、セマンティックカラーパレット |
| `references/shape-libraries.md` | スタイル文字列を含むすべてのシェイプライブラリカテゴリ（General、Flowchart、UML、ER、Network、BPMN、Mockup、K8s） |
| `assets/templates/flowchart.drawio` | すぐに使用できるフローチャートテンプレート |
| `assets/templates/architecture.drawio` | 4 層システムアーキテクチャテンプレート |
| `assets/templates/sequence.drawio` | 3 アクターのシーケンス図テンプレート |
| `assets/templates/er-diagram.drawio` | カラスの足記法のリレーションシップを持つ 3 テーブル ER 図 |
| `assets/templates/uml-class.drawio` | リレーションシップ矢印を含むインターフェース + 2 クラス + 列挙型 |
| `scripts/validate-drawio.py` | 任意の .drawio ファイルの XML 構造を検証する Python スクリプト |
| `scripts/add-shape.py` | 既存のダイアグラムに新しいシェイプを追加する Python CLI |
| `scripts/README.md` | 例を使ったスクリプトの使用方法 |

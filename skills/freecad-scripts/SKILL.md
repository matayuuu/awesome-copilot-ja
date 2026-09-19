---
name: freecad-scripts
description: 'FreeCAD の Python スクリプト、マクロ、自動化を作成する専門スキルです。FreeCAD モデル、パラメトリック オブジェクト、Part/Mesh/Sketcher スクリプト、ワークベンチ ツール、PySide による GUI ダイアログ、Coin3D シーングラフ操作、または FreeCAD Python API に関するタスクの作成を求められた場合に使用します。FreeCAD スクリプティングの基礎、ジオメトリ作成、FeaturePython オブジェクト、インターフェイス ツール、マクロ開発を扱います。'
---

# FreeCAD スクリプト

FreeCAD CAD アプリケーション向けの本番品質の Python スクリプトを生成するための専門スキル。3D モデリングタスクの略記、疑似コード、自然言語による説明を解釈し、正しい FreeCAD Python API 呼び出しへ変換します。

## このスキルを使用する場面

- FreeCAD の組み込みコンソールまたはマクロシステム向け Python スクリプトの作成
- 3D ジオメトリの作成または操作（Part、Mesh、Sketcher、Path、FEM）
- カスタムプロパティを持つパラメトリック FeaturePython オブジェクトの構築
- FreeCAD 内で PySide/Qt を使用する GUI ツールの開発
- Pivy による Coin3D シーングラフの操作
- カスタムワークベンチまたは Gui Commands の作成
- マクロによる反復的な CAD 操作の自動化
- メッシュ表現とソリッド表現の変換
- FEM 解析、レイトレーシング、図面エクスポートのスクリプト化

## 前提条件

- FreeCAD がインストール済みであること（0.19+ を推奨。最新 API には 0.21+/1.0+）
- Python 3.x（FreeCAD に同梱）
- GUI 作業の場合: PySide2（FreeCAD に同梱）
- シーングラフの場合: Pivy（FreeCAD に同梱）

## FreeCAD Python 環境

FreeCAD には Python インタープリターが埋め込まれています。スクリプトは、以下の主要モジュールが利用可能な環境で実行されます。

```python
import FreeCAD          # Core module (also aliased as 'App')
import FreeCADGui       # GUI module (also aliased as 'Gui') — only in GUI mode
import Part             # Part workbench — BRep/OpenCASCADE shapes
import Mesh             # Mesh workbench — triangulated meshes
import Sketcher         # Sketcher workbench — 2D constrained sketches
import Draft            # Draft workbench — 2D drawing tools
import Arch             # Arch/BIM workbench
import Path             # Path/CAM workbench
import FEM              # FEM workbench
import TechDraw         # TechDraw workbench (replaces Drawing)
import BOPTools         # Boolean operations
import CompoundTools    # Compound shape utilities
```

### FreeCAD のドキュメントモデル

```python
# Create or access a document
doc = FreeCAD.newDocument("MyDoc")
doc = FreeCAD.ActiveDocument

# Add objects
box = doc.addObject("Part::Box", "MyBox")
box.Length = 10.0
box.Width = 10.0
box.Height = 10.0

# Recompute
doc.recompute()

# Access objects
obj = doc.getObject("MyBox")
obj = doc.MyBox  # Attribute access also works

# Remove objects
doc.removeObject("MyBox")
```

## コアコンセプト

### ベクトルと配置

```python
import FreeCAD

# Vectors
v1 = FreeCAD.Vector(1, 0, 0)
v2 = FreeCAD.Vector(0, 1, 0)
v3 = v1.cross(v2)          # Cross product
d = v1.dot(v2)              # Dot product
v4 = v1 + v2                # Addition
length = v1.Length           # Magnitude
v_norm = FreeCAD.Vector(v1)
v_norm.normalize()           # In-place normalize

# Rotations
rot = FreeCAD.Rotation(FreeCAD.Vector(0, 0, 1), 45)  # axis, angle(deg)
rot = FreeCAD.Rotation(0, 0, 45)                       # Euler angles (yaw, pitch, roll)

# Placements (position + orientation)
placement = FreeCAD.Placement(
    FreeCAD.Vector(10, 20, 0),    # translation
    FreeCAD.Rotation(0, 0, 45),   # rotation
    FreeCAD.Vector(0, 0, 0)       # center of rotation
)
obj.Placement = placement

# Matrix (4x4 transformation)
import math
mat = FreeCAD.Matrix()
mat.move(FreeCAD.Vector(10, 0, 0))
mat.rotateZ(math.radians(45))
```

### ジオメトリの作成と操作（Part モジュール）

Part モジュールは OpenCASCADE をラップし、BRep ソリッドモデリングを提供します。

```python
import FreeCAD
import Part

# --- Primitive Shapes ---
box = Part.makeBox(10, 10, 10)               # length, width, height
cyl = Part.makeCylinder(5, 20)               # radius, height
sphere = Part.makeSphere(10)                  # radius
cone = Part.makeCone(5, 2, 10)               # r1, r2, height
torus = Part.makeTorus(10, 2)                 # major_r, minor_r

# --- Wires and Edges ---
edge1 = Part.makeLine((0, 0, 0), (10, 0, 0))
edge2 = Part.makeLine((10, 0, 0), (10, 10, 0))
edge3 = Part.makeLine((10, 10, 0), (0, 0, 0))
wire = Part.Wire([edge1, edge2, edge3])

# Circles and arcs
circle = Part.makeCircle(5)                   # radius
arc = Part.makeCircle(5, FreeCAD.Vector(0, 0, 0),
                       FreeCAD.Vector(0, 0, 1), 0, 180)  # start/end angle

# --- Faces ---
face = Part.Face(wire)                        # From a closed wire

# --- Solids from Faces/Wires ---
extrusion = face.extrude(FreeCAD.Vector(0, 0, 10))       # Extrude
revolved = face.revolve(FreeCAD.Vector(0, 0, 0),
                         FreeCAD.Vector(0, 0, 1), 360)    # Revolve

# --- Boolean Operations ---
fused = box.fuse(cyl)           # Union
cut = box.cut(cyl)              # Subtraction
common = box.common(cyl)        # Intersection
fused_clean = fused.removeSplitter()  # Clean up seams

# --- Fillets and Chamfers ---
filleted = box.makeFillet(1.0, box.Edges)          # radius, edges
chamfered = box.makeChamfer(1.0, box.Edges)        # dist, edges

# --- Loft and Sweep ---
loft = Part.makeLoft([wire1, wire2], True)          # wires, solid
swept = Part.Wire([path_edge]).makePipeShell([profile_wire],
                                              True, False)  # solid, frenet

# --- BSpline Curves ---
from FreeCAD import Vector
points = [Vector(0,0,0), Vector(1,2,0), Vector(3,1,0), Vector(4,3,0)]
bspline = Part.BSplineCurve()
bspline.interpolate(points)
edge = bspline.toShape()

# --- Show in document ---
Part.show(box, "MyBox")    # Quick display (adds to active doc)
# Or explicitly:
doc = FreeCAD.ActiveDocument or FreeCAD.newDocument()
obj = doc.addObject("Part::Feature", "MyShape")
obj.Shape = box
doc.recompute()
```

### トポロジーの探索

```python
shape = obj.Shape

# Access sub-elements
shape.Vertexes    # List of Vertex objects
shape.Edges       # List of Edge objects
shape.Wires       # List of Wire objects
shape.Faces       # List of Face objects
shape.Shells      # List of Shell objects
shape.Solids      # List of Solid objects

# Bounding box
bb = shape.BoundBox
print(bb.XMin, bb.XMax, bb.YMin, bb.YMax, bb.ZMin, bb.ZMax)
print(bb.Center)

# Properties
shape.Volume
shape.Area
shape.Length       # For edges/wires
face.Surface       # Underlying geometric surface
edge.Curve         # Underlying geometric curve

# Shape type
shape.ShapeType    # "Solid", "Shell", "Face", "Wire", "Edge", "Vertex", "Compound"
```

### Mesh モジュール

```python
import Mesh

# Create mesh from vertices and facets
mesh = Mesh.Mesh()
mesh.addFacet(
    0.0, 0.0, 0.0,   # vertex 1
    1.0, 0.0, 0.0,   # vertex 2
    0.0, 1.0, 0.0    # vertex 3
)

# Import/Export
mesh = Mesh.Mesh("/path/to/file.stl")
mesh.write("/path/to/output.stl")

# Convert Part shape to Mesh
import Part
import MeshPart
shape = Part.makeBox(1, 1, 1)
mesh = MeshPart.meshFromShape(Shape=shape, LinearDeflection=0.1,
                                AngularDeflection=0.5)

# Convert Mesh to Part shape
shape = Part.Shape()
shape.makeShapeFromMesh(mesh.Topology, 0.05)  # tolerance
solid = Part.makeSolid(shape)
```

### Sketcher モジュール

# Create a sketch on XY plane
sketch = doc.addObject("Sketcher::SketchObject", "MySketch")
sketch.Placement = FreeCAD.Placement(
    FreeCAD.Vector(0, 0, 0),
    FreeCAD.Rotation(0, 0, 0, 1)
)

# Add geometry (returns geometry index)
idx_line = sketch.addGeometry(Part.LineSegment(
    FreeCAD.Vector(0, 0, 0), FreeCAD.Vector(10, 0, 0)))
idx_circle = sketch.addGeometry(Part.Circle(
    FreeCAD.Vector(5, 5, 0), FreeCAD.Vector(0, 0, 1), 3))

# Add constraints
sketch.addConstraint(Sketcher.Constraint("Coincident", 0, 2, 1, 1))
sketch.addConstraint(Sketcher.Constraint("Horizontal", 0))
sketch.addConstraint(Sketcher.Constraint("DistanceX", 0, 1, 0, 2, 10.0))
sketch.addConstraint(Sketcher.Constraint("Radius", 1, 3.0))
sketch.addConstraint(Sketcher.Constraint("Fixed", 0, 1))
# Constraint types: Coincident, Horizontal, Vertical, Parallel, Perpendicular,
#   Tangent, Equal, Symmetric, Distance, DistanceX, DistanceY, Radius, Angle,
#   Fixed (Block), InternalAlignment

doc.recompute()
```

### Draft Module

```python
import Draft
import FreeCAD

# 2D shapes
line = Draft.makeLine(FreeCAD.Vector(0,0,0), FreeCAD.Vector(10,0,0))
circle = Draft.makeCircle(5)
rect = Draft.makeRectangle(10, 5)
poly = Draft.makePolygon(6, radius=5)   # hexagon

# Operations
moved = Draft.move(obj, FreeCAD.Vector(10, 0, 0), copy=True)
rotated = Draft.rotate(obj, 45, FreeCAD.Vector(0,0,0),
                        axis=FreeCAD.Vector(0,0,1), copy=True)
scaled = Draft.scale(obj, FreeCAD.Vector(2,2,2), center=FreeCAD.Vector(0,0,0),
                      copy=True)
offset = Draft.offset(obj, FreeCAD.Vector(1,0,0))
array = Draft.makeArray(obj, FreeCAD.Vector(15,0,0),
                         FreeCAD.Vector(0,15,0), 3, 3)
```

## パラメトリックオブジェクトの作成（FeaturePython）

FeaturePython オブジェクトは、再計算をトリガーするプロパティを持つカスタムパラメトリックオブジェクトです。

```python
import FreeCAD
import Part

class MyBox:
    """A custom parametric box."""

    def __init__(self, obj):
        obj.Proxy = self
        obj.addProperty("App::PropertyLength", "Length", "Dimensions",
                         "Box length").Length = 10.0
        obj.addProperty("App::PropertyLength", "Width", "Dimensions",
                         "Box width").Width = 10.0
        obj.addProperty("App::PropertyLength", "Height", "Dimensions",
                         "Box height").Height = 10.0

    def execute(self, obj):
        """Called on document recompute."""
        obj.Shape = Part.makeBox(obj.Length, obj.Width, obj.Height)

    def onChanged(self, obj, prop):
        """Called when a property changes."""
        pass

    def __getstate__(self):
        return None

    def __setstate__(self, state):
        return None


class ViewProviderMyBox:
    """View provider for custom icon and display settings."""

    def __init__(self, vobj):
        vobj.Proxy = self

    def getIcon(self):
        return ":/icons/Part_Box.svg"

    def attach(self, vobj):
        self.Object = vobj.Object

    def updateData(self, obj, prop):
        pass

    def onChanged(self, vobj, prop):
        pass

    def __getstate__(self):
        return None

    def __setstate__(self, state):
        return None


# --- Usage ---
doc = FreeCAD.ActiveDocument or FreeCAD.newDocument("Test")
obj = doc.addObject("Part::FeaturePython", "CustomBox")
MyBox(obj)
ViewProviderMyBox(obj.ViewObject)
doc.recompute()
```

### 一般的なプロパティ型

| プロパティ型 | Python 型 | 説明 |
|---|---|---|
| `App::PropertyBool` | `bool` | ブール値 |
| `App::PropertyInteger` | `int` | 整数 |
| `App::PropertyFloat` | `float` | 浮動小数点数 |
| `App::PropertyString` | `str` | 文字列 |
| `App::PropertyLength` | `float` (units) | 単位付きの長さ |
| `App::PropertyAngle` | `float` (deg) | 度単位の角度 |
| `App::PropertyVector` | `FreeCAD.Vector` | 3D ベクトル |
| `App::PropertyPlacement` | `FreeCAD.Placement` | 位置 + 回転 |
| `App::PropertyLink` | object ref | 別のオブジェクトへのリンク |
| `App::PropertyLinkList` | list of refs | 複数オブジェクトへのリンク |
| `App::PropertyEnumeration` | `list`/`str` | ドロップダウン選択 |
| `App::PropertyFile` | `str` | ファイルパス |
| `App::PropertyColor` | `tuple` | RGB 色（0.0-1.0） |
| `App::PropertyPythonObject` | any | シリアル化可能な Python オブジェクト |

## GUI ツールの作成

### Gui Commands

```python
import FreeCAD
import FreeCADGui

class MyCommand:
    """A custom toolbar/menu command."""

    def GetResources(self):
        return {
            "Pixmap": ":/icons/Part_Box.svg",
            "MenuText": "My Custom Command",
            "ToolTip": "Creates a custom box",
            "Accel": "Ctrl+Shift+B"
        }

    def IsActive(self):
        return FreeCAD.ActiveDocument is not None

    def Activated(self):
        # Command logic here
        FreeCAD.Console.PrintMessage("Command activated\n")

FreeCADGui.addCommand("My_CustomCommand", MyCommand())
```

### PySide ダイアログ

```python
from PySide2 import QtWidgets, QtCore, QtGui

class MyDialog(QtWidgets.QDialog):
    def __init__(self, parent=None):
        super().__init__(parent or FreeCADGui.getMainWindow())
        self.setWindowTitle("My Tool")
        self.setMinimumWidth(300)

        layout = QtWidgets.QVBoxLayout(self)

        # Input fields
        self.label = QtWidgets.QLabel("Length:")
        self.spinbox = QtWidgets.QDoubleSpinBox()
        self.spinbox.setRange(0.1, 1000.0)
        self.spinbox.setValue(10.0)
        self.spinbox.setSuffix(" mm")

        form = QtWidgets.QFormLayout()
        form.addRow(self.label, self.spinbox)
        layout.addLayout(form)

        # Buttons
        btn_layout = QtWidgets.QHBoxLayout()
        self.btn_ok = QtWidgets.QPushButton("OK")
        self.btn_cancel = QtWidgets.QPushButton("Cancel")
        btn_layout.addWidget(self.btn_ok)
        btn_layout.addWidget(self.btn_cancel)
        layout.addLayout(btn_layout)

        self.btn_ok.clicked.connect(self.accept)
        self.btn_cancel.clicked.connect(self.reject)

# Usage
dialog = MyDialog()
if dialog.exec_() == QtWidgets.QDialog.Accepted:
    length = dialog.spinbox.value()
    FreeCAD.Console.PrintMessage(f"Length: {length}\n")
```

### タスクパネル（FreeCAD 統合に推奨）

```python
class MyTaskPanel:
    """Task panel shown in the left sidebar."""

    def __init__(self):
        self.form = QtWidgets.QWidget()
        layout = QtWidgets.QVBoxLayout(self.form)
        self.spinbox = QtWidgets.QDoubleSpinBox()
        self.spinbox.setValue(10.0)
        layout.addWidget(QtWidgets.QLabel("Length:"))
        layout.addWidget(self.spinbox)

    def accept(self):
        # Called when user clicks OK
        length = self.spinbox.value()
        FreeCAD.Console.PrintMessage(f"Accepted: {length}\n")
        FreeCADGui.Control.closeDialog()
        return True

    def reject(self):
        FreeCADGui.Control.closeDialog()
        return True

    def getStandardButtons(self):
        return int(QtWidgets.QDialogButtonBox.Ok |
                   QtWidgets.QDialogButtonBox.Cancel)

# Show the panel
panel = MyTaskPanel()
FreeCADGui.Control.showDialog(panel)
```

## Coin3D シーングラフ（Pivy）

```python
from pivy import coin
import FreeCADGui

# Access the scenegraph root
sg = FreeCADGui.ActiveDocument.ActiveView.getSceneGraph()

# Add a custom separator with a sphere
sep = coin.SoSeparator()
mat = coin.SoMaterial()
mat.diffuseColor.setValue(1.0, 0.0, 0.0)  # Red
trans = coin.SoTranslation()
trans.translation.setValue(10, 10, 10)
sphere = coin.SoSphere()
sphere.radius.setValue(2.0)
sep.addChild(mat)
sep.addChild(trans)
sep.addChild(sphere)
sg.addChild(sep)

# Remove later
sg.removeChild(sep)
```

## カスタムワークベンチの作成

```python
import FreeCADGui

class MyWorkbench(FreeCADGui.Workbench):
    MenuText = "My Workbench"
    ToolTip = "A custom workbench"
    Icon = ":/icons/freecad.svg"

    def Initialize(self):
        """Called at workbench activation."""
        import MyCommands  # Import your command module
        self.appendToolbar("My Tools", ["My_CustomCommand"])
        self.appendMenu("My Menu", ["My_CustomCommand"])

    def Activated(self):
        pass

    def Deactivated(self):
        pass

    def GetClassName(self):
        return "Gui::PythonWorkbench"

FreeCADGui.addWorkbench(MyWorkbench)
```

## マクロのベストプラクティス

```python
# Standard macro header
# -*- coding: utf-8 -*-
# FreeCAD Macro: MyMacro
# Description: Brief description of what the macro does
# Author: YourName
# Version: 1.0
# Date: 2026-04-07

import FreeCAD
import Part
from FreeCAD import Base

# Guard for GUI availability
if FreeCAD.GuiUp:
    import FreeCADGui
    from PySide2 import QtWidgets, QtCore

def main():
    doc = FreeCAD.ActiveDocument
    if doc is None:
        FreeCAD.Console.PrintError("No active document\n")
        return

    if FreeCAD.GuiUp:
        sel = FreeCADGui.Selection.getSelection()
        if not sel:
            FreeCAD.Console.PrintWarning("No objects selected\n")

    # ... macro logic ...

    doc.recompute()
    FreeCAD.Console.PrintMessage("Macro completed\n")

if __name__ == "__main__":
    main()
```

### 選択の処理

```python
# Get selected objects
sel = FreeCADGui.Selection.getSelection()           # List of objects
sel_ex = FreeCADGui.Selection.getSelectionEx()       # Extended (sub-elements)

for selobj in sel_ex:
    obj = selobj.Object
    for sub in selobj.SubElementNames:
        print(f"{obj.Name}.{sub}")
        shape = obj.getSubObject(sub)  # Get sub-shape

# Select programmatically
FreeCADGui.Selection.addSelection(doc.MyBox)
FreeCADGui.Selection.addSelection(doc.MyBox, "Face1")
FreeCADGui.Selection.clearSelection()
```

### コンソール出力

```python
FreeCAD.Console.PrintMessage("Info message\n")
FreeCAD.Console.PrintWarning("Warning message\n")
FreeCAD.Console.PrintError("Error message\n")
FreeCAD.Console.PrintLog("Debug/log message\n")
```

## 一般的なパターン

### スケッチからのパラメトリック Pad

```python
doc = FreeCAD.ActiveDocument

# Create sketch
sketch = doc.addObject("Sketcher::SketchObject", "Sketch")
sketch.addGeometry(Part.LineSegment(FreeCAD.Vector(0,0,0), FreeCAD.Vector(10,0,0)))
sketch.addGeometry(Part.LineSegment(FreeCAD.Vector(10,0,0), FreeCAD.Vector(10,10,0)))
sketch.addGeometry(Part.LineSegment(FreeCAD.Vector(10,10,0), FreeCAD.Vector(0,10,0)))
sketch.addGeometry(Part.LineSegment(FreeCAD.Vector(0,10,0), FreeCAD.Vector(0,0,0)))
# Close with coincident constraints
for i in range(3):
    sketch.addConstraint(Sketcher.Constraint("Coincident", i, 2, i+1, 1))
sketch.addConstraint(Sketcher.Constraint("Coincident", 3, 2, 0, 1))

# Pad (PartDesign)
pad = doc.addObject("PartDesign::Pad", "Pad")
pad.Profile = sketch
pad.Length = 5.0
sketch.Visibility = False
doc.recompute()
```

### シェイプのエクスポート

```python
# STEP export
Part.export([doc.MyBox], "/path/to/output.step")

# STL export (mesh)
import Mesh
Mesh.export([doc.MyBox], "/path/to/output.stl")

# IGES export
Part.export([doc.MyBox], "/path/to/output.iges")

# Multiple formats via importlib
import importlib
importlib.import_module("importOBJ").export([doc.MyBox], "/path/to/output.obj")
```

### 単位と Quantity

```python
# FreeCAD uses mm internally
q = FreeCAD.Units.Quantity("10 mm")
q_inch = FreeCAD.Units.Quantity("1 in")
print(q_inch.getValueAs("mm"))  # 25.4

# Parse user input with units
q = FreeCAD.Units.parseQuantity("2.5 in")
value_mm = float(q)  # Value in mm (internal unit)
```

## 補償ルール（Quasi-Coder 統合）

FreeCAD スクリプト向けの略記または疑似コードを解釈する場合:

1. **用語のマッピング**: 「box」→ `Part.makeBox()`、「cylinder」→ `Part.makeCylinder()`、「sphere」→ `Part.makeSphere()`、「merge/combine/join」→ `.fuse()`、「subtract/cut/remove」→ `.cut()`、「intersect」→ `.common()`、「round edges/fillet」→ `.makeFillet()`、「bevel/chamfer」→ `.makeChamfer()`
2. **暗黙的なドキュメント**: ドキュメント処理が指定されていない場合は、標準の `doc = FreeCAD.ActiveDocument or FreeCAD.newDocument()` でラップする
3. **単位の前提**: 別途指定がない限り、デフォルトはミリメートルとする
4. **再計算**: 変更後は常に `doc.recompute()` を呼び出す
5. **GUI ガード**: スクリプトがヘッドレスで実行される可能性がある場合は、GUI 依存コードを `if FreeCAD.GuiUp:` でラップする
6. **Part.show()**: 簡易表示には `Part.show(shape, "Name")` を使用し、名前付きの永続オブジェクトには `doc.addObject("Part::Feature", "Name")` を使用する

## 参考資料

### 主要リンク

- [Python コードの記述](https://wiki.freecad.org/Manual:A_gentle_introduction#Writing_Python_code)
- [FreeCAD オブジェクトの操作](https://wiki.freecad.org/Manual:A_gentle_introduction#Manipulating_FreeCAD_objects)
- [ベクトルと配置](https://wiki.freecad.org/Manual:A_gentle_introduction#Vectors_and_Placements)
- [ジオメトリの作成と操作](https://wiki.freecad.org/Manual:Creating_and_manipulating_geometry)
- [パラメトリックオブジェクトの作成](https://wiki.freecad.org/Manual:Creating_parametric_objects)
- [インターフェイスツールの作成](https://wiki.freecad.org/Manual:Creating_interface_tools)
- [Python](https://en.wikipedia.org/wiki/Python_%28programming_language%29)
- [Python 入門](https://wiki.freecad.org/Introduction_to_Python)
- [Python スクリプティングチュートリアル](https://wiki.freecad.org/Python_scripting_tutorial)
- [FreeCAD スクリプティングの基礎](https://wiki.freecad.org/FreeCAD_Scripting_Basics)
- [Gui Command](https://wiki.freecad.org/Gui_Command)

### 同梱の参照ドキュメント

トピック別に整理されたガイドについては、[references/](references/) ディレクトリを参照してください。

1. [scripting-fundamentals.md](references/scripting-fundamentals.md) — コアスクリプティング、ドキュメントモデル、コンソール
2. [geometry-and-shapes.md](references/geometry-and-shapes.md) — Part、Mesh、Sketcher、トポロジー
3. [parametric-objects.md](references/parametric-objects.md) — FeaturePython、プロパティ、スクリプト化オブジェクト
4. [gui-and-interface.md](references/gui-and-interface.md) — PySide、ダイアログ、タスクパネル、Coin3D
5. [workbenches-and-advanced.md](references/workbenches-and-advanced.md) — ワークベンチ、マクロ、FEM、Path、レシピ

---
name: screen-recording
description: 'pull requestやdocumentation向けに、annotation付きanimated GIF demoとscreen recordingを作成します。frame capture、timing、imageioベースのGIF作成、frameごとのannotation workflowを扱います。'
---
# 画面録画

featureやworkflowの動作を示す、annotation、可変timing、適切なpacingを備えたanimated GIF demoを作成します。PR description、documentation、release noteに役立ちます。

## このSkillを使う場面

次の作業が必要なときにこのSkillを使います。

- 複数stepのUI interactionをanimated GIFとして記録する
- before/after behaviorを示すdemoを作成する
- documentationやrelease note用のannotation付きwalkthroughを作る
- bugの再現や修正の動作を示す

## 前提条件

```bash
pip install playwright Pillow imageio numpy scipy mss -q
playwright install chromium
```

## 基本Workflow

### 1. frameを取得する

Playwrightでinteractionを順に実行し、各frameを取得します。

```python
from playwright.async_api import async_playwright

async def record_frames(url, steps, width=1400, height=900):
    """
    steps: list of dicts with 'action' (async callable taking page)
           and 'name' (frame filename)
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": width, "height": height})
        await page.goto(url, wait_until="networkidle")

        for step in steps:
            if step.get("action"):
                await step["action"](page)
                await page.wait_for_timeout(step.get("wait", 500))
            await page.screenshot(path=step["name"])

        await browser.close()
```

### 2. imageioでGIFを組み立てる

**GIFの書き出しにはPILではなくimageioを使います** — PILのGIF encoderは見た目が似たframeを統合し、animationを壊します。

```python
import imageio.v3 as iio
from PIL import Image
import numpy as np

frames = []
durations = []

for frame_path, duration_ms in frame_list:
    img = Image.open(frame_path)
    frames.append(np.array(img))
    durations.append(duration_ms)

iio.imwrite("demo.gif", frames, duration=durations, loop=0)
```

### 3. frame timingを可変にする

均一なtimingでは、すべてが速すぎるか遅すぎるように感じられます。可変durationを使います。

| 段階 | 期間 | 理由 |
|-------|----------|-----|
| 高速な操作（typing、clicking） | 100ms | 自然に感じられ、勢いを保てる |
| 操作後のpause | 600-800ms | viewerが起きたことを理解する時間を確保 |
| 主役となる最終メッセージ | 500ms以上 | main takeawayが伝わる時間を確保 |

### 4. frameにannotationを付ける

`image-annotations` skillを使って特定のframeにannotationを適用します。

```python
from PIL import Image, ImageDraw, ImageFont

def annotate_frame(frame_path, annotations, out_path):
    img = Image.open(frame_path)
    draw = ImageDraw.Draw(img)

    for ann in annotations:
        # Apply annotation (rect, arrow, label, etc.)
        pass

    img.save(out_path)
```

### 5. annotationをfade-inする

annotationを滑らかに表示するには次を使います。

```python
def apply_fade(base_frame, annotation_layer, alpha):
    """Blend annotation onto frame at given alpha (0.0 to 1.0)"""
    blended = Image.blend(
        base_frame.convert("RGBA"),
        annotation_layer.convert("RGBA"),
        alpha
    )
    return blended.convert("RGB")

# 2-frame pop-in at 10fps: 50% then 100%
faded_frames = [
    apply_fade(base, annotations, 0.5),  # frame 1: half opacity
    apply_fade(base, annotations, 1.0),  # frame 2: full opacity
]
```

10fpsでは2つのfade frame（合計0.2s）を使います。30fpsでは3-4 frameを使います。低FPSではeasing curveの見た目が悪くなるため、simple pop-inの方が素早く読みやすくなります。

## scriptとして構築する

単純なdemoを超えるとannotation logicは複雑になります。inline codeではなく、functionを持つ専用script（例: `annotate_gif.py`）を書きます。timingと配置を反復調整できます。

## Animationのテスト

**必ず最初に単独でテストします** — fadeの微調整を試すためにfull demoを再構築しないでください。

```python
# Small test GIF: 10 bare frames → fade frames → 15 hold frames
# Add a frame counter overlay for debugging:
draw.text((10, height - 30), f"F{i}/{total} a={alpha:.0%} FADE",
          fill="white", font=small_font)
```

## desktop screen recording（mss）

desktop app、terminal、browser外の対象を記録します。高速なscreen captureには`mss`を使います。

```python
import mss
from PIL import Image
import time

def record_gif(output_path, region=None, duration=5, fps=8):
    """Record screen region to GIF. region = {left, top, width, height} or None for full screen."""
    with mss.mss() as sct:
        if region is None:
            region = sct.monitors[1]  # primary monitor

        frames = []
        t_end = time.time() + duration
        while time.time() < t_end:
            t0 = time.time()
            shot = sct.grab(region)
            frames.append(Image.frombytes('RGB', shot.size, shot.rgb))
            time.sleep(max(0, 1 / fps - (time.time() - t0)))

    frames[0].save(output_path, save_all=True, append_images=frames[1:],
                   duration=int(1000 / fps), loop=0, optimize=True)
    return len(frames)

record_gif('demo.gif', region={'left': 0, 'top': 0, 'width': 800, 'height': 500}, duration=3)
```

検証結果: 8fpsで3秒の場合は24 frame、約31KBです。妥当なfile sizeにするためfpsは10以下にします。

**注意:** `PIL.save(save_all=True)`は単純なrecordingでは動作しますが、見た目が似たframeを統合します。fade effect付きのannotation GIFには代わりに`imageio.v3.imwrite`を使います。

### window captureと組み合わせる

```python
# Find window rect, then record it as a GIF
# Reuse find_window() from the ui-screenshots skill
import ctypes
from ctypes import c_int, Structure, byref, windll

class RECT(Structure):
    _fields_ = [('left', c_int), ('top', c_int), ('right', c_int), ('bottom', c_int)]

hwnd = find_window('My App')[0][0]
rect = RECT()
windll.user32.GetWindowRect(hwnd, byref(rect))
region = {'left': rect.left, 'top': rect.top,
          'width': rect.right - rect.left, 'height': rect.bottom - rect.top}
record_gif('app-demo.gif', region=region, duration=5, fps=8)
```

## 差分ベースのcluster検出

frame間の変更領域をprogrammaticallyに見つけ、annotation対象を決めます。

```python
import numpy as np
from scipy import ndimage

def find_changed_clusters(frame_a, frame_b, threshold=30, min_pixels=300, dilate=5):
    """Find bounding boxes of changed regions between two frames."""
    diff = np.abs(frame_b.astype(float) - frame_a.astype(float)).max(axis=2)
    mask = diff > threshold
    dilated = ndimage.binary_dilation(mask, iterations=dilate)
    labeled, n = ndimage.label(dilated)
    clusters = []
    for i in range(1, n + 1):
        ys, xs = np.where(labeled == i)
        if len(ys) < min_pixels:
            continue
        clusters.append((xs.min(), ys.min(), xs.max(), ys.max(), len(ys)))
    return sorted(clusters, key=lambda c: -c[4])  # largest first
```

## formatの互換性

| format | VS Code Preview | GitHub | Browser（ブラウザー） |
|--------|----------------|--------|---------|
| GIF | ✅ animation対応 | ✅ | ✅ |
| WebP | ⚠️ staticのみ | ✅ | ✅ |
| MP4 | ❌ 非対応 | ⚠️ | ✅ |

**GIFはVS Code preview、GitHub markdown、browserで普遍的に対応される唯一のanimated formatです**。

## ガイドライン

1. **Type → pause → annotate** — fast action中はannotationを表示しない。まずpauseし、その後annotationを付ける
2. **Hero messageは最大fontにする** — main takeawayは64pt以上、detailは38pt
3. **GIF paletteはgradientを壊さない** — 20段階のalphaなら256-color paletteでも維持される
4. typing/interactionは**最低10fps** — それ未満では動きがぎこちない
5. **反復的に構築する** — 最初にframe sequence、次にannotation、最後にtimingを調整する

## 制限

- GIFはframeごとに256色に制限される — UI screenshotには適するが、写真ではbandingが出る場合がある
- 高解像度で50+ frameのlarge GIFは数MBになることがある — relevant areaへのcropを検討する
- GIFはaudioをサポートしない — narration付きdemoにはMP4を使う（ただしVS Code preview対応を失う）

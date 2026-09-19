---
name: ui-screenshots
description: 'PlaywrightとPILを使って開発中のWebアプリをスクリーンショット撮影します。ページ全体の撮影、インタラクティブ状態、再撮影の遅さを避ける切り抜き反復ワークフローに対応します。'
---
# UIスクリーンショット

開発中のWebアプリやグラフィカルUIを撮影し、見た目の変更を記録します。

## このSkillを使う場面

次の作業が必要なときに使用します。

- 実行中のWebアプリの現在の状態を撮影する
- コード変更前後のUIを記録する
- インタラクティブ状態（ツールチップ、ホバー、選択要素）を撮影する
- 再撮影せずにページの特定部分を撮影する

## 前提条件

```bash
pip install playwright Pillow -q
playwright install chromium
```

## 基本ワークフロー

### 1. 生のページ全体スクリーンショットを撮る

```python
from playwright.async_api import async_playwright

async def capture(url="http://localhost:3000", out="screenshot-raw.png", width=1400, height=5000):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": width, "height": height})
        await page.goto(url, wait_until="networkidle")
        await page.wait_for_timeout(4000)  # let charts/animations render
        await page.screenshot(path=out, full_page=True)
        await browser.close()
```

- ページがスクロールなしですべてを描画できるよう、**縦長のビューポート**（height=5000）を使う
- `wait_until="networkidle"` と `wait_for_timeout(4000)`で非同期チャートの読み込みを待つ
- `full_page=True`でスクロール可能なコンテンツ全体を撮影する

### 2. 生画像を確認してからPILで切り抜く

**Playwrightの`clip`パラメーターで完璧な切り抜きを得ようとしないでください。**ページ全体の撮影では信頼性がありません。

```python
from PIL import Image

img = Image.open("screenshot-raw.png")
cropped = img.crop((left, top, right, bottom))  # adjust based on what you see
cropped.save("screenshot-final.png")
```

1. 生スクリーンショットを撮る
2. 実際のピクセル位置を確認する
3. 確認結果に基づいてPILで切り抜く
4. 結果を確認し、適切でなければ再度切り抜く（即時に反映され、再撮影は不要）

### 3. 撮影ではなく切り抜きを反復する

- 再撮影は遅い（ブラウザー起動、ページ読み込み、描画待ちが必要）
- 再切り抜きは即時に行える（PILだけでよい）
- 良い生画像を1枚撮り、必要なだけさまざまに切り出す

### 4. インタラクティブ状態

```python
element = page.locator("selector").first
await element.hover()
await page.wait_for_timeout(1000)  # let tooltip appear
await page.screenshot(path="screenshot-hover.png", full_page=True)
```

ホバー効果のない「選択済み」状態を撮るには、クリック後にマウスを移動します。

```python
await element.click()
await page.mouse.move(300, 300)  # move away so hover doesn't show
await page.wait_for_timeout(500)
await page.screenshot(path="screenshot-selected.png", full_page=True)
```

### 5. セクション別の撮影

1枚のページ全体スクリーンショットから、異なるセクションを切り抜きます。

```python
img.crop((0, 200, 920, 900)).save("screenshot-header.png")
img.crop((0, 900, 920, 1600)).save("screenshot-main.png")
```

## ガイドライン

1. **必ず変更前の状態を変更前に撮影する**——忘れると、変更前の撮影のためにコードを戻す必要がある
2. **変更前後の組は同じビューポート幅と切り抜きを使う**——そうしなければ比較できない
3. **すでにコードを変更した後で「変更前」を撮る場合**：`git checkout HEAD~1 -- <files>`で戻して撮影し、`git checkout HEAD -- <files>`で復元する
4. **インタラクティブ状態では**各状態について変更前と変更後を撮る——通常状態の変更前で全ケースを代表できると考えない
5. **Playwrightでは`device_scale_factor=1`を使う**ことで1倍のピクセルに固定し、100%ズームでの見え方に合わせる
6. **チャートには追加の待機時間が必要**——PlotlyやD3などは非同期に描画されるため、networkidle後に最低4秒待つ
7. **狭いビューポートで描画バグが見つかる**——境界線や配置の問題は特定の幅でのみ現れることがある

## Web以外のアプリのスクリーンショット

Playwrightで操作できないデスクトップアプリ（VS、WPF、WinForms、コンソールアプリ、ターミナル）向けです。

### mss + ctypes（デスクトップウィンドウ向け推奨）

Win32 APIでタイトルからウィンドウを検索し、`mss`で領域をキャプチャします。1回約33msで動作確認済みです。

```python
import ctypes
from ctypes import c_int, Structure, byref, windll
import mss
from PIL import Image

user32 = windll.user32

def find_window(title_contains):
    """Find visible windows matching a title substring."""
    results = []
    WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
    def cb(hwnd, _):
        if user32.IsWindowVisible(hwnd):
            buf = ctypes.create_unicode_buffer(256)
            user32.GetWindowTextW(hwnd, buf, 256)
            if title_contains.lower() in buf.value.lower():
                results.append((hwnd, buf.value))
        return True
    user32.EnumWindows(WNDENUMPROC(cb), 0)
    return results

def capture_window(title_contains, output_path):
    """Capture a window by title substring."""
    windows = find_window(title_contains)
    if not windows:
        raise ValueError(f"No window matching '{title_contains}'")
    hwnd = windows[0][0]

    class RECT(Structure):
        _fields_ = [('left', c_int), ('top', c_int), ('right', c_int), ('bottom', c_int)]
    rect = RECT()
    user32.GetWindowRect(hwnd, byref(rect))
    w, h = rect.right - rect.left, rect.bottom - rect.top

    with mss.mss() as sct:
        shot = sct.grab({'left': rect.left, 'top': rect.top, 'width': w, 'height': h})
        img = Image.frombytes('RGB', shot.size, shot.rgb)
        img.save(output_path)
        return img

# Usage:
capture_window('Visual Studio Code', 'vscode-capture.png')
```

**前提条件：** `pip install mss pillow`
**制限：**ウィンドウが表示されている必要があります（他のウィンドウの背後や最小化状態では不可）。

### Electronアプリ（VS Codeなど）

**Node.js版Playwrightのみ** — Python版Playwrightには`electron` APIがありません。画面ではなくCDP（Chrome DevTools Protocol）経由でキャプチャするため、最小化中でも動作します。

```javascript
const { _electron: electron } = require('playwright');
const app = await electron.launch({
    executablePath: 'C:\\Program Files\\Microsoft VS Code\\Code.exe',
    args: ['--new-window', '--disable-extensions', '--user-data-dir=' + tmpDir]
});
const window = await app.firstWindow();
await window.waitForLoadState('domcontentloaded');

// Minimize immediately — captures still work via CDP
await app.evaluate(({ BrowserWindow }) => {
    BrowserWindow.getAllWindows()[0].minimize();
});

await window.screenshot({ path: 'capture.png' }); // works while minimized!
await app.close();
```

**重要**：`--user-data-dir=<temp>`が必要です。指定しないとVS Codeが既存インスタンスへ処理を委譲し、起動したプロセスが直ちに終了します。

### 選択基準

| 状況 | ツール | 備考 |
|---|---|---|
| Webアプリ（localhost） | Playwright | 実績があり、DOM全体にアクセス可能 |
| Electronアプリ（VS Code） | Playwright Electron（Node.js） | CDP経由で最小化中も動作 |
| デスクトップアプリ、表示中のウィンドウ | mss + ctypes（タイトルで検索） | 1回約33ms |
| デスクトップアプリ、他のウィンドウの背後 | Windows Graphics Capture API | 複雑なセットアップ、Win10 1903以降 |
| すばやい全画面撮影 | mss | 約68ms |

## 制限事項

- Web撮影にはローカルで実行中のアプリまたはアクセス可能なURLが必要
- デスクトップ撮影（mss）には表示され、遮られていないウィンドウが必要
- Electron撮影にはNode.js版Playwrightが必要（Python版では不可）
- クライアント側の描画が重いSPAでは、networkidle以外の待機処理が必要になることがある

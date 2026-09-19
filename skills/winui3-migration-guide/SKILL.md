---
name: winui3-migration-guide
description: 'UWP から WinUI 3 への移行リファレンス。レガシー UWP API を正しい Windows App SDK 相当 API に対応付け、移行前後のコード例を示す。名前空間の変更、スレッド処理（CoreDispatcher から DispatcherQueue）、ウィンドウ管理（CoreWindow から AppWindow）、ダイアログ、ピッカー、共有、印刷、バックグラウンドタスク、Copilot がコード生成で起こしやすい間違いを扱う。'
---
# WinUI 3 移行ガイド

UWP アプリを WinUI 3 / Windows App SDK に移行するとき、または生成コードがレガシー UWP パターンではなく正しい WinUI 3 API を使っているか検証するときに使う。

---

## 名前空間の変更

すべての `Windows.UI.Xaml.*` 名前空間は `Microsoft.UI.Xaml.*` に移行する:

| UWP 名前空間 | WinUI 3 名前空間 |
|--------------|-------------------|
| `Windows.UI.Xaml` | `Microsoft.UI.Xaml` |
| `Windows.UI.Xaml.Controls` | `Microsoft.UI.Xaml.Controls` |
| `Windows.UI.Xaml.Media` | `Microsoft.UI.Xaml.Media` |
| `Windows.UI.Xaml.Input` | `Microsoft.UI.Xaml.Input` |
| `Windows.UI.Xaml.Data` | `Microsoft.UI.Xaml.Data` |
| `Windows.UI.Xaml.Navigation` | `Microsoft.UI.Xaml.Navigation` |
| `Windows.UI.Xaml.Shapes` | `Microsoft.UI.Xaml.Shapes` |
| `Windows.UI.Composition` | `Microsoft.UI.Composition` |
| `Windows.UI.Input` | `Microsoft.UI.Input` |
| `Windows.UI.Colors` | `Microsoft.UI.Colors` |
| `Windows.UI.Text` | `Microsoft.UI.Text` |
| `Windows.UI.Core` | `Microsoft.UI.Dispatching`（ディスパッチャー用） |

---

## Copilot が最も起こしやすい3つの間違い

### 1. XamlRoot なしの ContentDialog

```csharp
// ❌ WRONG — Throws InvalidOperationException in WinUI 3
var dialog = new ContentDialog
{
    Title = "Error",
    Content = "Something went wrong.",
    CloseButtonText = "OK"
};
await dialog.ShowAsync();
```

```csharp
// ✅ CORRECT — Set XamlRoot before showing
var dialog = new ContentDialog
{
    Title = "Error",
    Content = "Something went wrong.",
    CloseButtonText = "OK",
    XamlRoot = this.Content.XamlRoot  // Required in WinUI 3
};
await dialog.ShowAsync();
```

### 2. ContentDialog の代わりに MessageDialog を使う

```csharp
// ❌ WRONG — UWP API, not available in WinUI 3 desktop
var dialog = new Windows.UI.Popups.MessageDialog("Are you sure?", "Confirm");
await dialog.ShowAsync();
```

```csharp
// ✅ CORRECT — Use ContentDialog
var dialog = new ContentDialog
{
    Title = "Confirm",
    Content = "Are you sure?",
    PrimaryButtonText = "Yes",
    CloseButtonText = "No",
    XamlRoot = this.Content.XamlRoot
};
var result = await dialog.ShowAsync();
if (result == ContentDialogResult.Primary)
{
    // User confirmed
}
```

### 3. DispatcherQueue の代わりに CoreDispatcher を使う

```csharp
// ❌ WRONG — CoreDispatcher does not exist in WinUI 3
await Dispatcher.RunAsync(CoreDispatcherPriority.Normal, () =>
{
    StatusText.Text = "Done";
});
```

```csharp
// ✅ CORRECT — Use DispatcherQueue
DispatcherQueue.TryEnqueue(() =>
{
    StatusText.Text = "Done";
});

// With priority:
DispatcherQueue.TryEnqueue(DispatcherQueuePriority.High, () =>
{
    ProgressBar.Value = 100;
});
```

---

## ウィンドウ管理の移行

### ウィンドウ参照

```csharp
// ❌ WRONG — Window.Current does not exist in WinUI 3
var currentWindow = Window.Current;
```

```csharp
// ✅ CORRECT — Use a static property in App
public partial class App : Application
{
    public static Window MainWindow { get; private set; }

    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
        MainWindow = new MainWindow();
        MainWindow.Activate();
    }
}
// Access anywhere: App.MainWindow
```

### ウィンドウ管理

| UWP API | WinUI 3 API |
|---------|-------------|
| `ApplicationView.TryResizeView()` | `AppWindow.Resize()` |
| `AppWindow.TryCreateAsync()` | `AppWindow.Create()` |
| `AppWindow.TryShowAsync()` | `AppWindow.Show()` |
| `AppWindow.TryConsolidateAsync()` | `AppWindow.Destroy()` |
| `AppWindow.RequestMoveXxx()` | `AppWindow.Move()` |
| `AppWindow.GetPlacement()` | `AppWindow.Position` property |
| `AppWindow.RequestPresentation()` | `AppWindow.SetPresenter()` |

### タイトルバー

| UWP API | WinUI 3 API |
|---------|-------------|
| `CoreApplicationViewTitleBar` | `AppWindowTitleBar` |
| `CoreApplicationView.TitleBar.ExtendViewIntoTitleBar` | `AppWindow.TitleBar.ExtendsContentIntoTitleBar` |

---

## ダイアログとピッカーの移行

### ファイル／フォルダーのピッカー

```csharp
// ❌ WRONG — UWP style, no window handle
var picker = new FileOpenPicker();
picker.FileTypeFilter.Add(".txt");
var file = await picker.PickSingleFileAsync();
```

```csharp
// ✅ CORRECT — Initialize with window handle
var picker = new FileOpenPicker();
var hwnd = WinRT.Interop.WindowNative.GetWindowHandle(App.MainWindow);
WinRT.Interop.InitializeWithWindow.Initialize(picker, hwnd);
picker.FileTypeFilter.Add(".txt");
var file = await picker.PickSingleFileAsync();
```

## スレッド処理の移行

| UWP パターン | WinUI 3 相当 |
|-------------|-------------------|
| `CoreDispatcher.RunAsync(priority, callback)` | `DispatcherQueue.TryEnqueue(priority, callback)` |
| `Dispatcher.HasThreadAccess` | `DispatcherQueue.HasThreadAccess` |
| `CoreDispatcher.ProcessEvents()` | 相当機能なし — 非同期コードを再構成する |
| `CoreWindow.GetForCurrentThread()` | 利用不可 — `DispatcherQueue.GetForCurrentThread()` を使う |

**重要な違い**: UWP は組み込みの再入防止を備えた ASTA（Application STA）を使う。WinUI 3 はこの保護のない標準 STA を使う。非同期コードがメッセージを処理するときの再入問題に注意する。

---

## バックグラウンドタスクの移行

```csharp
// ❌ WRONG — UWP IBackgroundTask
public sealed class MyTask : IBackgroundTask
{
    public void Run(IBackgroundTaskInstance taskInstance) { }
}
```

```csharp
// ✅ CORRECT — Windows App SDK AppLifecycle
using Microsoft.Windows.AppLifecycle;

// Register for activation
var args = AppInstance.GetCurrent().GetActivatedEventArgs();
if (args.Kind == ExtendedActivationKind.AppNotification)
{
    // Handle background activation
}
```

---

## アプリ設定の移行

| シナリオ | パッケージ アプリ | パッケージ化されていないアプリ |
|----------|-------------|----------------|
| 簡単な設定 | `ApplicationData.Current.LocalSettings` | `LocalApplicationData` の JSON ファイル |
| ローカル ファイル保存 | `ApplicationData.Current.LocalFolder` | `Environment.GetFolderPath(SpecialFolder.LocalApplicationData)` |

---

## GetForCurrentView() の置き換え

WinUI 3 デスクトップ アプリでは、すべての `GetForCurrentView()` パターンを利用できない:

| UWP API | WinUI 3 での置き換え |
|---------|-------------------|
| `UIViewSettings.GetForCurrentView()` | `AppWindow` プロパティを使う |
| `ApplicationView.GetForCurrentView()` | `AppWindow.GetFromWindowId(windowId)` |
| `DisplayInformation.GetForCurrentView()` | Win32 `GetDpiForWindow()` または `XamlRoot.RasterizationScale` |
| `CoreApplication.GetCurrentView()` | 利用不可 — ウィンドウを手動で追跡する |
| `SystemNavigationManager.GetForCurrentView()` | `NavigationView` で戻るナビゲーションを直接処理する |

---

## テストの移行

UWP の単体テスト プロジェクトは WinUI 3 では動作しない。WinUI 3 のテスト プロジェクト テンプレートへ移行する必要がある。

| UWP | WinUI 3 |
|-----|---------|
| Unit Test App (Universal Windows) | **Unit Test App (WinUI in Desktop)** |
| UWP 型を使う標準 MSTest プロジェクト | Xaml ランタイムには WinUI テスト アプリを使う必要がある |
| すべてのテストに `[TestMethod]` | ロジックには `[TestMethod]`、XAML/UI テストには `[UITestMethod]` |
| Class Library (Universal Windows) | **Class Library (WinUI in Desktop)** |

```csharp
// ✅ WinUI 3 unit test — use [UITestMethod] for any XAML interaction
[UITestMethod]
public void TestMyControl()
{
    var control = new MyLibrary.MyUserControl();
    Assert.AreEqual(expected, control.MyProperty);
}
```

**要点:** `[UITestMethod]` 属性は、テストランナーに XAML UI スレッド上でテストを実行させる。これは `Microsoft.UI.Xaml` 型をインスタンス化するために必要である。

---

## 移行チェックリスト

1. [ ] すべての `Windows.UI.Xaml.*` using ディレクティブを `Microsoft.UI.Xaml.*` に置き換える
2. [ ] `Windows.UI.Colors` を `Microsoft.UI.Colors` に置き換える
3. [ ] `CoreDispatcher.RunAsync` を `DispatcherQueue.TryEnqueue` に置き換える
4. [ ] `Window.Current` を `App.MainWindow` 静的プロパティに置き換える
5. [ ] すべての `ContentDialog` インスタンスに `XamlRoot` を追加する
6. [ ] すべてのピッカーを `InitializeWithWindow.Initialize(picker, hwnd)` で初期化する
7. [ ] `MessageDialog` を `ContentDialog` に置き換える
8. [ ] `ApplicationView`/`CoreWindow` を `AppWindow` に置き換える
9. [ ] `CoreApplicationViewTitleBar` を `AppWindowTitleBar` に置き換える
10. [ ] すべての `GetForCurrentView()` 呼び出しを `AppWindow` 相当へ置き換える
11. [ ] Share および Print マネージャーの相互運用を更新する
12. [ ] `IBackgroundTask` を `AppLifecycle` のアクティベーションに置き換える
13. [ ] プロジェクト ファイルを更新する: TFM を `net10.0-windows10.0.22621.0` にし、`<UseWinUI>true</UseWinUI>` を追加する
14. [ ] 単体テストを **Unit Test App (WinUI in Desktop)** プロジェクトへ移行し、XAML テストには `[UITestMethod]` を使う
15. [ ] パッケージ化構成とパッケージ化されていない構成の両方をテストする

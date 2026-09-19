---
name: mvvm-toolkit-di
description: 'CommunityToolkit.Mvvm の ViewModel を Microsoft.Extensions.DependencyInjection に接続します。.NET Generic Host のコンポジションルート、コンストラクターインジェクション、サービスのライフタイム（Singleton / Transient / Scoped）、IMessenger の登録、View での ViewModel 解決、キー付きサービス、テストの差し替えポイント、従来の Ioc.Default の退避手段を扱います。WPF、WinUI 3、.NET MAUI、Uno、Avalonia で使用してください。'
---

# CommunityToolkit.Mvvm + `Microsoft.Extensions.DependencyInjection`

MVVM Toolkit は意図的に **DI コンテナーを同梱していません**。代わりに、ASP.NET
Core、Worker サービス、.NET Generic Host と同じコンテナーである
`Microsoft.Extensions.DependencyInjection` と組み合わせて使用します。

> **要約。** 起動時にサービスプロバイダーを一度だけ構築します（推奨:
> `Host.CreateDefaultBuilder()`）。サービスと ViewModel を登録します。
> コンストラクターを通じて注入します。ユーザーコードでは
> `Ioc.Default.GetService<T>()` を避けてください。

---

## このスキルを使用する場合

- 新しい XAML アプリ（WPF、WinUI 3、MAUI、Uno、Avalonia）のコンポジションルートを
  構築するとき
- サービスと VM のライフタイムを選択するとき
- `IMessenger` を一度だけ構成し、`ObservableRecipient` の ViewModel に
  注入するとき
- サービスロケーターに依存せずにページの ViewModel を解決するとき
- 「Y をアクティブ化しようとしているときに、型 X のサービスを解決できません」という
  エラーを診断するとき

ソースジェネレーターと ViewModel パターンについては **`mvvm-toolkit`** スキルを
参照してください。Messenger の pub/sub については
**`mvvm-toolkit-messenger`** を参照してください。

---

## 推奨するコンポジションルート（Generic Host）

```csharp
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using CommunityToolkit.Mvvm.Messaging;

public partial class App : Application
{
    public IHost Host { get; }

    public App()
    {
        Host = Microsoft.Extensions.Hosting.Host
            .CreateDefaultBuilder()
            .ConfigureServices((_, services) =>
            {
                services.AddSingleton<IFilesService, FilesService>();
                services.AddSingleton<ISettingsService, SettingsService>();
                services.AddSingleton<IMessenger>(WeakReferenceMessenger.Default);

                services.AddSingleton<ShellViewModel>();
                services.AddTransient<ContactViewModel>();
                services.AddTransient<EditorViewModel>();
            })
            .Build();
    }

    public static T GetService<T>() where T : class =>
        ((App)Current).Host.Services.GetRequiredService<T>();
}
```

Generic Host の利点:

- `Microsoft.Extensions.Configuration` による `appsettings.json` のバインド
- `Microsoft.Extensions.Logging` によるログ記録
- バックグラウンド処理用のホスト型サービス（`IHostedService`）
- 開発ビルドでのスコープ検証

> WPF と Windows Forms では、ホストのライフタイムをアプリのライフタイムと統合する
> 必要があります。詳細は
> [Use the .NET Generic Host in a WPF app](https://learn.microsoft.com/en-us/dotnet/desktop/wpf/app-development/how-to-use-host-builder)
> を参照してください。

### Generic Host を使わない場合

サービスコンテナーだけが必要で、追加の依存関係を一切持ちたくない場合:

```csharp
var services = new ServiceCollection();
services.AddSingleton<IFilesService, FilesService>();
services.AddTransient<ContactViewModel>();
ServiceProvider provider = services.BuildServiceProvider();
```

---

## コンストラクターインジェクション

サービスと子 ViewModel をコンストラクター経由で注入します:

```csharp
public sealed partial class ContactViewModel(
    IFilesService files,
    IMessenger messenger,
    ILogger<ContactViewModel> logger)
    : ObservableRecipient(messenger)
{
    [ObservableProperty]
    private string? name;

    [RelayCommand]
    private async Task SaveAsync()
    {
        logger.LogInformation("Saving {Name}", Name);
        await files.SaveAsync(Name!);
    }
}
```

コンストラクターインジェクションがサービスロケーターより優れている理由:

- 依存関係が明示的であり、呼び出し元で確認できる
- 単体テストでフェイクやモックを直接注入できる
- DI コンテナーが起動時に依存関係グラフを検証する
- 登録漏れは最初の使用時ではなく、すぐに例外として通知される

---

## ライフタイム

| ライフタイム | メソッド | XAML アプリでの一般的な用途 |
|----------|--------|--------------------------|
| Singleton | `AddSingleton<T>` | Shell/メインウィンドウの VM、設定、ファイル/HTTP サービス、共有の `IMessenger`、アプリ全体のキャッシュ |
| Transient | `AddTransient<T>` | ページ単位またはドキュメント単位の ViewModel（解決のたびに新しいインスタンス） |
| Scoped | `AddScoped<T>` | クライアントアプリで必要になることはまれですが、明示的な `IServiceScope`（例: ウィンドウ単位のスコープ）で有用です |

```csharp
services.AddSingleton<ShellViewModel>();   // 1 instance for app lifetime
services.AddTransient<NoteViewModel>();    // new instance per resolve
services.AddScoped<DialogService>();       // 1 per scope (rare)
```

---

## View での解決

コードビハインドでページのルート ViewModel を解決し、そこから必要な依存関係を
取得させます:

```csharp
public sealed partial class ContactPage : Page
{
    public ContactViewModel ViewModel { get; }

    public ContactPage()
    {
        ViewModel = App.GetService<ContactViewModel>();
        InitializeComponent();
    }
}
```

XAML では、`{x:Bind ViewModel.Xxx}`（コンパイル済みバインディング）または
`DataContext` を対象にした `{Binding Xxx}` でバインドします。

ナビゲーションフレームワーク（WinUI 3 `Frame.Navigate`、MAUI Shell、Prism、
MVVMCross）では、フレームワークにページを解決させ、ページが DI から自身の
ViewModel を解決するようにします。ViewModel を手動で `new` しないでください。

---

## `IMessenger` の登録

使用するメッセンジャーを一度だけ登録し、どこでも `IMessenger` を注入します:

```csharp
services.AddSingleton<IMessenger>(WeakReferenceMessenger.Default);
// or
services.AddSingleton<IMessenger>(StrongReferenceMessenger.Default);
```

Then:

```csharp
public sealed partial class MyViewModel(IMessenger messenger)
    : ObservableRecipient(messenger) { }
```

ウィンドウ単位のメッセンジャーでは、キー付きサービスまたはスコープ付きインスタンス
として登録し、ウィンドウ単位の ViewModel に注入します。

メッセンジャーの機能範囲については、**`mvvm-toolkit-messenger`** スキルを
参照してください。

---

## キー付きサービス（.NET 8 以降）

同じインターフェイスの異なる実装をキーで解決します:

```csharp
services.AddKeyedSingleton<IExporter, CsvExporter>("csv");
services.AddKeyedSingleton<IExporter, JsonExporter>("json");

public sealed partial class ExportViewModel(
    [FromKeyedServices("csv")] IExporter csvExporter,
    [FromKeyedServices("json")] IExporter jsonExporter)
    : ObservableObject { /* ... */ }
```

---

## テストの差し替えポイント

コンストラクターで注入する依存関係は、テストで簡単に差し替えられます。
`Moq` を使用する場合:

```csharp
[Fact]
public async Task Save_calls_files_service()
{
    var files = new Mock<IFilesService>();
    var messenger = new WeakReferenceMessenger();
    var logger = NullLogger<ContactViewModel>.Instance;

    var vm = new ContactViewModel(files.Object, messenger, logger)
    {
        Name = "Ada"
    };

    await vm.SaveCommand.ExecuteAsync(null);

    files.Verify(f => f.SaveAsync("Ada"), Times.Once);
}
```

`Ioc.Default` または静的な状態をモックしている場合、その ViewModel はサービス
ロケーターを使用しています。コンストラクターインジェクションへリファクタリング
してください。

---

## 従来方式: `Ioc.Default`

`CommunityToolkit.Mvvm.DependencyInjection.Ioc` は、コンストラクター
インジェクションが不可能な場合の退避手段です。たとえば、デザイン時データ用に
XAML でインスタンス化される VM、`ValueConverter`、コントロールテンプレートで
使用します。

```csharp
Ioc.Default.ConfigureServices(
    new ServiceCollection()
        .AddSingleton<IFilesService, FilesService>()
        .AddTransient<ContactViewModel>()
        .BuildServiceProvider());

var files = Ioc.Default.GetRequiredService<IFilesService>();
```

これは最後の手段として扱ってください。ViewModel、サービス、および DI コンテナーが
構築できるあらゆるクラスの内部では、コンストラクターインジェクションを優先します。

---

## よくある落とし穴

1. **VM コンストラクター内の `Ioc.Default.GetService<T>()`。** 依存関係が隠され、
   単体テストが壊れ、起動時の依存関係グラフ検証が妨げられます。
2. **すべてを `Singleton` にすること。** Singleton として登録された「ドキュメント
   単位」の VM は、すべてのドキュメント間で共有状態になります。これは検出しにくい
   データ破損につながります。インスタンス単位の VM には `AddTransient` を使用して
   ください。
3. **複数回の `BuildServiceProvider()` 呼び出し。** 呼び出すたびに新しい
   コンテナーが作成されるため、Singleton は共有されません。起動時に一度だけ
   構築してください。
4. **長寿命オブジェクトでの `IServiceProvider` の保持。** これはサービス
   ロケーターパターンを示します。必要な特定の依存関係を注入してください。
5. **開発時にスコープ検証を行わないこと。** `Host.CreateDefaultBuilder()` を使用
   してください。これにより開発時に `ValidateScopes` と `ValidateOnBuild` が設定され、
   登録ミスが最初の使用時ではなく起動時に失敗します。
6. **ルートプロバイダーからスコープ付きサービスを解決すること。** 実質的に
   Singleton のライフタイムへ昇格されます。スコープ検証がなければ警告は表示され
   ません。ライフタイムを変更するか、明示的な `IServiceScope` から解決してください。

---

## 参照資料

| トピック | ファイル |
|-------|------|
| 詳細な解説（Generic Host の設定、ライフタイム、キー付きサービス、テストパターン、従来の Ioc） | [`references/dependency-injection.md`](references/dependency-injection.md) |

外部資料:

- DI の概要: <https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection>
- DI の使用方法: <https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-usage>
- MVVM Toolkit の Ioc ページ: <https://learn.microsoft.com/en-us/dotnet/communitytoolkit/mvvm/ioc>
- Generic Host: <https://learn.microsoft.com/en-us/dotnet/core/extensions/generic-host>

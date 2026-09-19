---
name: fluentui-blazor
description: 'Blazor アプリケーションで Microsoft Fluent UI Blazor コンポーネント ライブラリ（Microsoft.FluentUI.AspNetCore.Components NuGet パッケージ）を使用するためのガイドです。Fluent UI コンポーネントを使った Blazor アプリの構築、ライブラリの設定、FluentButton、FluentDataGrid、FluentDialog、FluentToast、FluentNavMenu、FluentTextField、FluentSelect、FluentAutocomplete、FluentDesignTheme、または "Fluent" で始まるコンポーネントの使用時に利用します。プロバイダー不足、JS 相互運用の問題、テーマ設定のトラブルシューティングにも使用します。'
---

# Fluent UI Blazor — 利用ガイド

このスキルでは、Blazor アプリケーションで **Microsoft.FluentUI.AspNetCore.Components**（バージョン 4）の NuGet パッケージを正しく使う方法を説明します。

## 重要なルール

### 1. 手動で `<script>` または `<link>` タグを追加する必要はありません

このライブラリは、Blazor の静的 Web アセットと JS 初期化を通じて CSS と JS を自動的に読み込みます。**コア ライブラリに対して `<script>` または `<link>` タグを追加するようユーザーに案内してはいけません。**

### 2. サービス ベースのコンポーネントにはプロバイダーが必須です

これらのプロバイダー コンポーネントは、対応するサービスを機能させるために、ルート レイアウト（例: `MainLayout.razor`）に追加する必要があります。これがないと、サービス呼び出しは**黙って失敗**します（エラーも UI も表示されません）。

```razor
<FluentToastProvider />
<FluentDialogProvider />
<FluentMessageBarProvider />
<FluentTooltipProvider />
<FluentKeyCodeProvider />
```

### 3. Program.cs でのサービス登録

```csharp
builder.Services.AddFluentUIComponents();

// Or with configuration:
builder.Services.AddFluentUIComponents(options =>
{
    options.UseTooltipServiceProvider = true;  // default: true
    options.ServiceLifetime = ServiceLifetime.Scoped; // default
});
```

**ServiceLifetime のルール:**
- `ServiceLifetime.Scoped` — Blazor Server / Interactive 用（既定）
- `ServiceLifetime.Singleton` — Blazor WebAssembly スタンドアロン用
- `ServiceLifetime.Transient` — **`NotSupportedException` をスローする**

### 4. アイコンには別の NuGet パッケージが必要です

```
dotnet add package Microsoft.FluentUI.AspNetCore.Components.Icons
```

`@using` エイリアスを使った使用例:

```razor
@using Icons = Microsoft.FluentUI.AspNetCore.Components.Icons

<FluentIcon Value="@(Icons.Regular.Size24.Save)" />
<FluentIcon Value="@(Icons.Filled.Size20.Delete)" Color="@Color.Error" />
```

パターン: `Icons.[Variant].[Size].[Name]`
- バリエーション: `Regular`、`Filled`
- サイズ: `Size12`、`Size16`、`Size20`、`Size24`、`Size28`、`Size32`、`Size48`

カスタム画像: `Icon.FromImageUrl("/path/to/image.png")`

**文字列ベースのアイコン名は使用しないでください** — アイコンは厳密に型付けされたクラスです。

### 5. リスト コンポーネントのバインディング モデル

`FluentSelect<TOption>`、`FluentCombobox<TOption>`、`FluentListbox<TOption>`、`FluentAutocomplete<TOption>` は `<InputSelect>` のようには動作しません。これらは次を使用します:

- `Items` — データ ソース（`IEnumerable<TOption>`）
- `OptionText` — 表示テキストを抽出するための `Func<TOption, string?>`
- `OptionValue` — 値文字列を抽出するための `Func<TOption, string?>`
- `SelectedOption` / `SelectedOptionChanged` — 単一選択バインディング用
- `SelectedOptions` / `SelectedOptionsChanged` — 複数選択バインディング用

```razor
<FluentSelect Items="@countries"
              OptionText="@(c => c.Name)"
              OptionValue="@(c => c.Code)"
              @bind-SelectedOption="@selectedCountry"
              Label="Country" />
```

**このようにはしません（間違ったパターン）:**
```razor
@* WRONG — do not use InputSelect pattern *@
<FluentSelect @bind-Value="@selectedValue">
    <option value="1">One</option>
</FluentSelect>
```

### 6. FluentAutocomplete の仕様

- 検索入力テキストには `ValueText` を使用します（`Value` は使わないでください — 非推奨です）
- `OnOptionsSearch` はオプションを絞り込むための必須コールバックです
- 既定値は `Multiple="true"` です

```razor
<FluentAutocomplete TOption="Person"
                    OnOptionsSearch="@OnSearch"
                    OptionText="@(p => p.FullName)"
                    @bind-SelectedOptions="@selectedPeople"
                    Label="Search people" />

@code {
    private void OnSearch(OptionsSearchEventArgs<Person> args)
    {
        args.Items = allPeople.Where(p =>
            p.FullName.Contains(args.Text, StringComparison.OrdinalIgnoreCase));
    }
}
```

### 7. ダイアログ サービス パターン

**`<FluentDialog>` タグの表示状態を切り替えてはいけません。** サービス パターンは次のとおりです:

1. `IDialogContentComponent<TData>` を実装するコンテンツ コンポーネントを作成します:

```csharp
public partial class EditPersonDialog : IDialogContentComponent<Person>
{
    [Parameter] public Person Content { get; set; } = default!;

    [CascadingParameter] public FluentDialog Dialog { get; set; } = default!;

    private async Task SaveAsync()
    {
        await Dialog.CloseAsync(Content);
    }

    private async Task CancelAsync()
    {
        await Dialog.CancelAsync();
    }
}
```

2. `IDialogService` を使ってダイアログを表示します:

```csharp
[Inject] private IDialogService DialogService { get; set; } = default!;

private async Task ShowEditDialog()
{
    var dialog = await DialogService.ShowDialogAsync<EditPersonDialog, Person>(
        person,
        new DialogParameters
        {
            Title = "Edit Person",
            PrimaryAction = "Save",
            SecondaryAction = "Cancel",
            Width = "500px",
            PreventDismissOnOverlayClick = true,
        });

    var result = await dialog.Result;
    if (!result.Cancelled)
    {
        var updatedPerson = result.Data as Person;
    }
}
```

簡易ダイアログの場合:
```csharp
await DialogService.ShowConfirmationAsync("Are you sure?", "Yes", "No");
await DialogService.ShowSuccessAsync("Done!");
await DialogService.ShowErrorAsync("Something went wrong.");
```

### 8. トースト通知

```csharp
[Inject] private IToastService ToastService { get; set; } = default!;

ToastService.ShowSuccess("Item saved successfully");
ToastService.ShowError("Failed to save");
ToastService.ShowWarning("Check your input");
ToastService.ShowInfo("New update available");
```

`FluentToastProvider` パラメーター: `Position`（既定値: `TopRight`）、`Timeout`（既定値 7000ms）、`MaxToastCount`（既定値 4）

### 9. デザイン トークンとテーマはレンダリング後にのみ機能します

デザイン トークンは JS 相互運用に依存します。**`OnInitialized` では設定しないでください** — `OnAfterRenderAsync` を使用してください。

```razor
<FluentDesignTheme Mode="DesignThemeModes.System"
                   OfficeColor="OfficeColor.Teams"
                   StorageName="mytheme" />
```

### 10. FluentEditForm と EditForm

`FluentEditForm` は `FluentWizard` ステップ内でのみ必要です（ステップごとの検証）。通常のフォームでは、Fluent フォーム コンポーネントとともに標準の `EditForm` を使用します:

```razor
<EditForm Model="@model" OnValidSubmit="HandleSubmit">
    <DataAnnotationsValidator />
    <FluentTextField @bind-Value="@model.Name" Label="Name" Required />
    <FluentSelect Items="@options"
                  OptionText="@(o => o.Label)"
                  @bind-SelectedOption="@model.Category"
                  Label="Category" />
    <FluentValidationSummary />
    <FluentButton Type="ButtonType.Submit" Appearance="Appearance.Accent">Save</FluentButton>
</EditForm>
```

Fluent のスタイルを使用するには、標準の Blazor 検証コンポーネントではなく `FluentValidationMessage` と `FluentValidationSummary` を使用します。

## 参照ファイル

特定のトピックに関する詳しいガイダンスについては、次を参照してください:

- [セットアップと構成](references/SETUP.md)
- [レイアウトとナビゲーション](references/LAYOUT-AND-NAVIGATION.md)
- [データ グリッド](references/DATAGRID.md)
- [テーマ設定](references/THEMING.md)

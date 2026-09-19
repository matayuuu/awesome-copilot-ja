---
name: mvvm-toolkit
description: 'CommunityToolkit.Mvvm（MVVM Toolkit）のコア機能: ソース ジェネレーター（[ObservableProperty]、[RelayCommand]、[NotifyPropertyChangedFor]、[NotifyCanExecuteChangedFor]、[NotifyDataErrorInfo]）、基底クラス（ObservableObject / ObservableValidator / ObservableRecipient）、コマンド（RelayCommand / AsyncRelayCommand）、検証。関連スキル: pub/sub 用の mvvm-toolkit-messenger、Microsoft.Extensions.DependencyInjection の構成用の mvvm-toolkit-di。WPF、WinUI 3、MAUI、Uno、Avalonia で使用できます。'
---

# CommunityToolkit.Mvvm（コア）

`CommunityToolkit.Mvvm` 8.x を使用するアプリで、ViewModel、プロパティ、
コマンド、検証を作成またはレビューするときに、このスキルを使用してください。

> **関連スキル。** `IMessenger` の pub/sub パターンには
> **`mvvm-toolkit-messenger`** を読み込んでください。
> `Microsoft.Extensions.DependencyInjection` の統合には
> **`mvvm-toolkit-di`** を読み込んでください。

> **要約。** `partial` クラスの private フィールドには `[ObservableProperty]` を、
> インスタンス メソッドには `[RelayCommand]` を付与します。
> `ObservableObject` を継承し（入力フォームでは `ObservableValidator`、
> `IMessenger` を使用する場合は `ObservableRecipient`）、実装してください。

---

## パッケージとセットアップ

```xml
<ItemGroup>
  <PackageReference Include="CommunityToolkit.Mvvm" Version="8.*" />
</ItemGroup>
```

対象フレームワーク: `netstandard2.0`、`netstandard2.1`、`net6.0` 以降。.NET、.NET
Framework、Mono で動作します。ソース ジェネレーターは同じ NuGet に含まれるため、
追加のアナライザー参照は不要です。

名前空間:

```csharp
using CommunityToolkit.Mvvm.ComponentModel;   // ObservableObject, [ObservableProperty]
using CommunityToolkit.Mvvm.Input;             // [RelayCommand], RelayCommand, AsyncRelayCommand
```

> **共通ルール。** `[ObservableProperty]` または `[RelayCommand]` を使用するすべての型と、
> 入れ子の場合はすべての包含型を `partial` として宣言する必要があります。これがないと、
> ジェネレーターは `MVVMTK0008` / `MVVMTK0042` を出力します。

---

## ソース ジェネレーター早見表

| 属性 | 適用先 | 生成されるもの |
|-----------|-----------|-----------|
| `[ObservableProperty]` | private フィールド | public `INotifyPropertyChanged` プロパティと `OnXxxChanging` / `OnXxxChanged` 部分メソッド フック |
| `[NotifyPropertyChangedFor(nameof(Other))]` | 監視可能なフィールド | 指定したプロパティに対しても `PropertyChanged` を発生させる |
| `[NotifyCanExecuteChangedFor(nameof(MyCommand))]` | 監視可能なフィールド | 変更時に `MyCommand.NotifyCanExecuteChanged()` を呼び出す |
| `[NotifyDataErrorInfo]` | `ObservableValidator` 上の監視可能なフィールド | setter から `ValidateProperty(value)` を呼び出す |
| `[NotifyPropertyChangedRecipients]` | `ObservableRecipient` 上の監視可能なフィールド | 変更後に `Broadcast(old, new)` を呼び出す |
| `[RelayCommand]` | インスタンス メソッド | `IRelayCommand` / `IAsyncRelayCommand` として公開される遅延生成の `RelayCommand` / `AsyncRelayCommand` |
| `[RelayCommand(CanExecute = nameof(CanX))]` | インスタンス メソッド | `CanExecute` をメソッドまたはプロパティへ接続する |
| `[RelayCommand(IncludeCancelCommand = true)]` | `CancellationToken` を持つ async メソッド | `XxxCancelCommand` も生成する |
| `[RelayCommand(AllowConcurrentExecutions = true)]` | async メソッド | キューイングまたは並列実行を許可する（既定では実行中は無効） |
| `[RelayCommand(FlowExceptionsToTaskScheduler = true)]` | async メソッド | await して再スローする代わりに、`ExecutionTask` を介して例外を公開する |
| `[property: SomeAttr]` | 監視可能なフィールドまたは `[RelayCommand]` メソッド | `SomeAttr` を生成されたプロパティへ転送する（例: `[JsonIgnore]`） |

**命名。** フィールド `name` / `_name` / `m_name` → `Name`。メソッド `LoadAsync` →
`LoadCommand`（`Async` サフィックスと、先頭にある `On` は取り除かれます）。

生成コードのサンプルを含む完全な属性リファレンスについては、
[`references/source-generators.md`](references/source-generators.md) を参照してください。

---

## ViewModel パターン

### 単純な監視可能プロパティ

```csharp
public partial class ContactViewModel : ObservableObject
{
    [ObservableProperty]
    private string? name;
}
```

### フック: `OnXxxChanging` / `OnXxxChanged`

```csharp
[ObservableProperty]
private string? name;

partial void OnNameChanged(string? value) =>
    Logger.LogInformation("Name changed to {Name}", value);
```

単一引数 `(value)` と 2 引数 `(oldValue, newValue)` の両方のオーバーロードを利用できます。
必要なものだけを実装してください。未実装のフックはコンパイラーによって除去されるため、
実行時コストはゼロです。

### 依存プロパティと依存コマンド

```csharp
[ObservableProperty]
[NotifyPropertyChangedFor(nameof(FullName))]
[NotifyCanExecuteChangedFor(nameof(SaveCommand))]
private string? firstName;

[ObservableProperty]
[NotifyPropertyChangedFor(nameof(FullName))]
[NotifyCanExecuteChangedFor(nameof(SaveCommand))]
private string? lastName;

public string FullName => $"{FirstName} {LastName}".Trim();
```

### 監視可能ではないモデルをラップする

```csharp
public sealed class ObservableUser(User user) : ObservableObject
{
    public string Name
    {
        get => user.Name;
        set => SetProperty(user.Name, value, user, (u, n) => u.Name = n);
    }
}
```

キャプチャした状態を持たない static ラムダを渡すと、呼び出し時の割り当てを回避できます。

---

## コマンド

```csharp
[RelayCommand]
private void Refresh() => Items.Reset();

[RelayCommand]
private async Task LoadAsync()
{
    foreach (var item in await service.GetItemsAsync())
        Items.Add(item);
}

[RelayCommand(IncludeCancelCommand = true)]
private async Task DownloadAsync(CancellationToken token)
{
    await using var stream = await http.GetStreamAsync(url, token);
    // ...
}

[RelayCommand(CanExecute = nameof(CanSave))]
private Task SaveAsync() => repo.SaveAsync(Name!);

private bool CanSave() => !string.IsNullOrWhiteSpace(Name);
```

コマンドのライフタイムを明示的に管理する必要がある場合や、単純でないソースから
コマンドを構成する場合にのみ、手動で `RelayCommand` / `AsyncRelayCommand`
コンストラクターを使用してください。属性形式で約 95% のケースをカバーできます。

同期 / 非同期 / キャンセル可能 / 同時実行 / 例外の公開に関するレシピは、
[`references/relaycommand-cookbook.md`](references/relaycommand-cookbook.md)
を参照してください。

---

## 基底クラスの選択

| 基底クラス | 使用する場面 |
|------------|---------|
| `ObservableObject` | 既定。`INotifyPropertyChanged` + `INotifyPropertyChanging` + `SetProperty` のオーバーロード + `Task` プロパティ用の `SetPropertyAndNotifyOnCompletion` |
| `ObservableValidator` | VM に `INotifyDataErrorInfo` が必要な場合（フォーム、設定入力） |
| `ObservableRecipient` | VM が `IMessenger` メッセージを送受信する場合。**`mvvm-toolkit-messenger`** スキルを参照 |

C# は単一継承です。`ObservableValidator` と `ObservableRecipient` はどちらも
`ObservableObject` を継承するため、両方を組み合わせるには合成が必要です
（例: `ObservableValidator` に `IMessenger` を注入する）。

---

## 検証

```csharp
using System.ComponentModel.DataAnnotations;

public sealed partial class RegistrationViewModel : ObservableValidator
{
    [ObservableProperty]
    [NotifyDataErrorInfo]
    [Required, MinLength(2), MaxLength(100)]
    private string? name;

    [ObservableProperty]
    [NotifyDataErrorInfo]
    [Required, EmailAddress]
    private string? email;

    [RelayCommand]
    private void Submit()
    {
        ValidateAllProperties();
        if (HasErrors) return;
        // submit...
    }
}
```

その他のエントリ ポイントは `TrySetProperty`、`ValidateProperty(value, name)`、
`ClearAllErrors()`、`GetErrors(propertyName)` です。カスタム ルールでは、
`[CustomValidation]` メソッドとカスタム `ValidationAttribute` サブクラスを利用できます。

バリデーターの完全な API 一覧については、
[`references/validation.md`](references/validation.md) を参照してください。

---

## 主な落とし穴

1. **`partial` を忘れる。** クラス（およびすべての包含型）は `partial` である必要があります。
   コンパイル エラーは `MVVMTK0008` / `MVVMTK0042` です。
2. **PascalCase のフィールド名。** `[ObservableProperty] private string Name;` は
   生成されるプロパティと競合します。`name`、`_name`、または `m_name` を使用してください。
3. **`[RelayCommand]` での `async void`。** ジェネレーターが `IAsyncRelayCommand` として
   ラップするのは `Task` を返すメソッドだけです。`async void` は同期 `RelayCommand` となり、
   例外が監視されません。常に `Task` を返してください。
4. **`[NotifyCanExecuteChangedFor]` を忘れる。** `CanSave()` が `true` を返すようになっても、
   Save ボタンは無効のままです。
5. **`[ObservableProperty]` フィールドが保持している同じ参照を変更する。**
   `EqualityComparer<T>.Default` が `true` を返すため、通知は発生しません。
   インスタンスを変更する代わりに置き換えてください。

完全な診断表（`MVVMTK0xxx`）と追加の落とし穴については、
[`references/troubleshooting.md`](references/troubleshooting.md) を参照してください。

---

## エンドツーエンドのミニ チュートリアル

ジェネレーター、コマンド、`[NotifyCanExecuteChangedFor]` を示す
2 ペインの Notes アプリです。

```csharp
public sealed partial class NoteViewModel(INotesService notes,
    IMessenger messenger) : ObservableRecipient(messenger)
{
    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(SaveCommand))]
    [NotifyCanExecuteChangedFor(nameof(DeleteCommand))]
    private string? filename;

    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(SaveCommand))]
    private string? text;

    [RelayCommand(CanExecute = nameof(CanSave))]
    private Task SaveAsync()
    {
        Messenger.Send(new NoteSavedMessage(Filename!));
        return notes.SaveAsync(Filename!, Text!);
    }

    [RelayCommand(CanExecute = nameof(CanDelete))]
    private Task DeleteAsync() => notes.DeleteAsync(Filename!);

    private bool CanSave() =>
        !string.IsNullOrWhiteSpace(Filename) && !string.IsNullOrEmpty(Text);
    private bool CanDelete() => !string.IsNullOrWhiteSpace(Filename);
}
```

完全なサンプル（DI 構成、View のコードビハインド、XAML、単体テスト）については、
[`references/end-to-end-walkthrough.md`](references/end-to-end-walkthrough.md)
を参照してください。

---

## 参照資料と関連スキル

| トピック | 場所 |
|-------|-------|
| ソース ジェネレーター属性リファレンス | [`references/source-generators.md`](references/source-generators.md) |
| RelayCommand レシピ | [`references/relaycommand-cookbook.md`](references/relaycommand-cookbook.md) |
| 検証の詳細 | [`references/validation.md`](references/validation.md) |
| 完全な Notes アプリのチュートリアル | [`references/end-to-end-walkthrough.md`](references/end-to-end-walkthrough.md) |
| `MVVMTK0xxx` の診断と落とし穴 | [`references/troubleshooting.md`](references/troubleshooting.md) |
| **Messenger pub/sub** | 関連スキル: **`mvvm-toolkit-messenger`** |
| **`Microsoft.Extensions.DependencyInjection` の構成** | 関連スキル: **`mvvm-toolkit-di`** |

外部資料:

- Toolkit の概要: <https://learn.microsoft.com/en-us/dotnet/communitytoolkit/mvvm/>
- WinUI MVVM Toolkit チュートリアル: <https://learn.microsoft.com/en-us/windows/apps/tutorials/winui-mvvm-toolkit/intro>
- ソース: <https://github.com/CommunityToolkit/dotnet>
- サンプル: <https://github.com/CommunityToolkit/MVVM-Samples>

---
name: mvvm-toolkit-messenger
description: 'CommunityToolkit.Mvvm Messenger pub/sub for decoupled communication between ViewModels (or any objects). Covers WeakReferenceMessenger vs StrongReferenceMessenger, IRecipient<TMessage>, RequestMessage<T> / AsyncRequestMessage<T> / CollectionRequestMessage<T>, ValueChangedMessage<T>, channels (tokens), and the ObservableRecipient activation lifecycle. Use across WPF, WinUI 3, .NET MAUI, Uno, and Avalonia.'
---

# CommunityToolkit.Mvvm Messenger

ViewModel（または任意のオブジェクト）間で、共有参照グラフを強制せずに利用できる
pub/sub メッセージングです。`CommunityToolkit.Mvvm` 8.x の一部です。

> **要約。** 基本は `WeakReferenceMessenger.Default` を使用してください。ハンドラーは
> `(recipient, message)` ラムダと `static` 修飾子で登録し、`this` をキャプチャしないように
> します。`ObservableRecipient` を継承し、アクティブ化・非アクティブ化時に
> `IsActive` を切り替えると、自動登録・登録解除を利用できます。

---

## このスキルを使う場面

- 2 つ以上の ViewModel が、互いへの参照を保持せずにイベント（ログイン、テーマ変更、
  保存、ナビゲーション）へ反応する必要がある
- ViewModel が別の VM に値を問い合わせる必要がある（リクエスト・リプライ）
- チャネル トークンでイベントの対象をサブシステムまたはウィンドウに限定する
- 「ハンドラーがまったく実行されない」問題や、弱参照の受信者のライフタイム問題を診断する

ソース ジェネレーター、基底クラス、コマンドについては **`mvvm-toolkit`**
スキルを参照してください。DI の構成（`IMessenger` インスタンスの登録）については
**`mvvm-toolkit-di`** を参照してください。

---

## 実装を選ぶ

| 種類 | 使用する場面 |
|------|------|
| `WeakReferenceMessenger.Default` | **既定。** 受信者は弱参照で保持されるため、登録中でも GC の対象になります。内部トリミングはフル GC 時に実行されるため、手動で `Cleanup()` を呼び出す必要はありません。 |
| `StrongReferenceMessenger.Default` | プロファイラーでメッセンジャーがホット パスにあり、割り当てが重要だと判明した場合。受信者は `Unregister` するまで固定されます。登録解除を忘れるとリークします。 |
| カスタム `IMessenger` インスタンス | ウィンドウ単位またはスコープ単位の場合（例: アプリ ウィンドウごとに 1 つのメッセンジャー）。直接生成し、DI 経由で注入します。 |

`ObservableRecipient` の引数なしコンストラクターは
`WeakReferenceMessenger.Default` を使用します。別の `IMessenger` を
コンストラクターへ渡すと、これをオーバーライドできます。

---

## メッセージを定義する

ツールキットには基底クラスが用意されていますが、任意のクラスを使用できます。

```csharp
using CommunityToolkit.Mvvm.Messaging.Messages;

// Single-payload broadcast
public sealed class LoggedInUserChangedMessage(User user)
    : ValueChangedMessage<User>(user);

// Custom shape (records are great for this)
public sealed record ThemeChangedMessage(AppTheme NewTheme);

// Empty signal
public sealed record RefreshRequestedMessage;
```

---

## 受信者を登録する

### ラムダ形式（推奨）

```csharp
WeakReferenceMessenger.Default.Register<MyViewModel, ThemeChangedMessage>(
    this,
    static (recipient, message) => recipient.OnThemeChanged(message.NewTheme));
```

`static` 修飾子は意図しないクロージャーの割り当てを防ぎ、ラムダから
`this` を除外します。代わりに `recipient` パラメーターを使用してください。

### `IRecipient<TMessage>` インターフェイス形式

```csharp
public sealed class MyViewModel : ObservableRecipient,
    IRecipient<ThemeChangedMessage>,
    IRecipient<RefreshRequestedMessage>
{
    public void Receive(ThemeChangedMessage message) { /* ... */ }
    public void Receive(RefreshRequestedMessage message) { /* ... */ }
}
```

`ObservableRecipient.OnActivated()` は `Messenger.RegisterAll(this)` を呼び出します。
これにより、型で実装されているすべての `IRecipient<T>` インターフェイスが購読されます。
`ObservableRecipient` を使用しない場合は、手動で登録します。

```csharp
WeakReferenceMessenger.Default.RegisterAll(this);
```

---

## メッセージを送信する

```csharp
WeakReferenceMessenger.Default.Send(new ThemeChangedMessage(AppTheme.Dark));

// Empty payloads use the parameterless overload:
WeakReferenceMessenger.Default.Send<RefreshRequestedMessage>();
```

---

## チャネル（トークン）

トークン（`int`、`string`、`Guid` などの比較可能な任意の値）を使用して、
メッセージの対象をサブシステムまたはウィンドウに限定します。

```csharp
const int LeftPaneChannel = 1;

WeakReferenceMessenger.Default.Register<MyViewModel, RefreshRequestedMessage, int>(
    this, LeftPaneChannel,
    static (r, _) => r.RefreshLeft());

WeakReferenceMessenger.Default.Send(new RefreshRequestedMessage(), LeftPaneChannel);
```

トークンなしで送信したメッセージは既定の共有チャネルを使用するため、
チャネル スコープの受信者には**配信されません**。

---

## リクエスト・リプライ

受信者が送信者へ値を返す問い合わせ形式のシナリオでは、
`RequestMessage<T>` ファミリーを使用します。

### 同期リクエスト

```csharp
public sealed class CurrentUserRequest : RequestMessage<User> { }

WeakReferenceMessenger.Default.Register<UserService, CurrentUserRequest>(
    this,
    static (r, m) => m.Reply(r.CurrentUser));

User user = WeakReferenceMessenger.Default.Send<CurrentUserRequest>();
```

受信者が `Reply` を呼び出さなかった場合、`CurrentUserRequest` から `User` への
暗黙的な変換は例外をスローします。まずメッセージを保持して確認してください。

```csharp
var request = WeakReferenceMessenger.Default.Send<CurrentUserRequest>();
if (request.HasReceivedResponse)
    User user = request.Response;
```

### 非同期リクエスト

```csharp
public sealed class CurrentUserRequest : AsyncRequestMessage<User> { }

WeakReferenceMessenger.Default.Register<UserService, CurrentUserRequest>(
    this,
    static (r, m) => m.Reply(r.GetCurrentUserAsync()));

User user = await WeakReferenceMessenger.Default.Send<CurrentUserRequest>();
```

### コレクション リクエスト（ファンイン）

`CollectionRequestMessage<T>` と `AsyncCollectionRequestMessage<T>` は、
すべての応答する受信者からの `Reply` を収集します。

```csharp
public sealed class OpenDocumentsRequest : CollectionRequestMessage<Document> { }

var docs = WeakReferenceMessenger.Default.Send<OpenDocumentsRequest>();
foreach (Document doc in docs) { /* ... */ }
```

---

## ライフサイクル

`WeakReferenceMessenger` を使用している場合でも、受信者が破棄される際には
明示的に登録を解除してください。これにより無効なエントリがトリミングされ、
パフォーマンスが向上します。

```csharp
WeakReferenceMessenger.Default.Unregister<ThemeChangedMessage>(this);
WeakReferenceMessenger.Default.Unregister<ThemeChangedMessage, int>(this, LeftPaneChannel);
WeakReferenceMessenger.Default.UnregisterAll(this);
```

`ObservableRecipient.OnDeactivated()` は、`IsActive` が `false` に切り替わると
これを自動的に実行します。アクティブ化フックから設定してください。

```csharp
protected override void OnNavigatedTo(NavigationEventArgs e)
{
    base.OnNavigatedTo(e);
    ViewModel.IsActive = true;
}

protected override void OnNavigatedFrom(NavigationEventArgs e)
{
    ViewModel.IsActive = false;
    base.OnNavigatedFrom(e);
}
```

---

## よくある落とし穴

1. **ラムダで `this` をキャプチャする。** `(r, m) => OnX(m)` は暗黙的に
   `this` をキャプチャするため、クロージャーが割り当てられ、ライフタイムが分かりにくくなります。
   常に `static` を付けた `(r, m) => r.OnX(m)` を使用してください。
2. **`Unregister` しない強参照の受信者。** `StrongReferenceMessenger` では、
   受信者（およびそのオブジェクト グラフ全体）が永続的に固定されます。
   `ObservableRecipient` を継承する（`OnDeactivated` で自動登録解除される）か、
   `UnregisterAll(this)` を呼び出してください。
3. **継承されたメッセージ型。** `BaseMessage` 用に登録されたハンドラーは、
   `DerivedMessage : BaseMessage` に対しては**呼び出されません**。具象型ごとに
   登録してください。
4. **誤ったメッセンジャー インスタンス。** `WeakReferenceMessenger.Default` 経由で送信し、
   注入されたウィンドウ単位のメッセンジャー経由で登録すると、メッセージは届きません。
   どこでも同じ `IMessenger` を使用してください（通常は
   `ObservableRecipient(messenger)` 経由で注入します）。
5. **`OnActivated` が実行されない。** `ObservableRecipient` が `IRecipient<T>` ハンドラーを
   登録するのは、`IsActive` が `false` から `true` に切り替わる場合だけです。
6. **スレッドをまたぐ更新。** メッセンジャーはスレッドに依存しません。ハンドラーで UI を
   更新する場合は、手動でディスパッチしてください
   （`DispatcherQueue.TryEnqueue` / `Dispatcher.BeginInvoke`）。

---

## 複数のメッセンジャー（ウィンドウ単位のスコープ）

```csharp
services.AddSingleton<IMessenger>(WeakReferenceMessenger.Default); // app-wide
services.AddScoped<WindowScopedMessenger>();                       // per-window
```

適切な `IMessenger` を ViewModel コンストラクターへ注入します。

```csharp
public sealed partial class WindowViewModel(IMessenger messenger)
    : ObservableRecipient(messenger) { }
```

これによりブロードキャストが単一のウィンドウに分離されます。マルチウィンドウの
デスクトップ アプリ（WinUI 3、WPF、MAUI desktop、Avalonia）で役立ちます。

---

## 参照資料

| トピック | ファイル |
|-------|------|
| 詳細な解説（追加のチャネル・ライフサイクル例、診断） | [`references/messenger-patterns.md`](references/messenger-patterns.md) |

外部資料:

- Messenger ドキュメント: <https://learn.microsoft.com/en-us/dotnet/communitytoolkit/mvvm/messenger>
- `WeakReferenceMessenger` API: <https://learn.microsoft.com/en-us/dotnet/api/communitytoolkit.mvvm.messaging.weakreferencemessenger>
- ソース: <https://github.com/CommunityToolkit/dotnet>

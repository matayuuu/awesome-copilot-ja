---
name: winmd-api-search
description: 'Windows デスクトップ API を検索・調査する。カメラ、ファイルアクセス、通知、UI コントロール、AI/ML、センサー、ネットワークなど、プラットフォーム機能を必要とする機能を構築するときに使う。タスクに適した API を見つけ、型の詳細（メソッド、プロパティ、イベント、列挙値）を取得する。'
license: Complete terms in LICENSE.txt
---
# WinMD API 検索

この Skill は、任意の機能に適した Windows API を見つけ、完全な詳細を取得するのに役立つ。次のすべての WinMD メタデータを含むローカルキャッシュを検索する:

- **Windows Platform SDK** — すべての `Windows.*` WinRT API（常に利用可能で、復元不要）
- **WinAppSDK / WinUI** — キャッシュ生成ツールにベースラインとして組み込み済み（常に利用可能で、復元不要）
- **NuGet packages** — 復元済みプロジェクトに含まれる `.winmd` ファイルを持つ追加パッケージ
- **Project-output WinMD** — ビルド出力として `.winmd` を生成するクラス ライブラリ（C++/WinRT、C#）

復元もビルドもしていない新しいクローンでも、Platform SDK と WinAppSDK の全範囲を利用できる。

## この Skill を使う場面

- ユーザーが機能を構築したいが、その機能を提供する API を見つける必要がある場合
- X がプラットフォーム機能（カメラ、ファイル、通知、センサー、AI など）に関係する「X はどう実装するか」という質問
- コードを書く前に、型の正確なメソッド、プロパティ、イベント、列挙値が必要な場合
- UI またはシステムタスクにどのコントロール、クラス、インターフェイスを使うべきか不明な場合

## 前提条件

- **.NET SDK 8.0 以降** — キャッシュ生成ツールのビルドに必要。不足している場合は [dotnet.microsoft.com](https://dotnet.microsoft.com/download) からインストールする。

## キャッシュのセットアップ（初回使用前に必須）

すべてのクエリと検索コマンドはローカル JSON キャッシュを読む。**クエリを実行する前に必ずキャッシュを生成する。**

```powershell
# All projects in the repo (recommended for first run)
.\.github\skills\winmd-api-search\scripts\Update-WinMdCache.ps1

# Single project
.\.github\skills\winmd-api-search\scripts\Update-WinMdCache.ps1 -ProjectDir <project-folder>
```

ベースラインの範囲（Platform SDK + WinAppSDK）には、プロジェクトの復元やビルドは必要ない。追加の NuGet パッケージを使う場合は、`project.assets.json` を生成する `dotnet restore` または `packages.config` ファイルが必要になる。

キャッシュは `Generated Files\winmd-cache\` に保存され、パッケージとバージョンの組み合わせごとに重複排除される。

### インデックス対象

| ソース | 利用可能になる条件 |
|--------|----------------|
| Windows Platform SDK | 常時（ローカル SDK のインストール先から読み取る） |
| WinAppSDK (latest) | 常時（キャッシュ生成ツールにベースラインとして同梱） |
| WinAppSDK Runtime | システムにインストールされている場合（`Get-AppxPackage` で検出） |
| プロジェクトの NuGet パッケージ | `dotnet restore` 実行後、または `packages.config` がある場合 |
| プロジェクト出力の `.winmd` | プロジェクトのビルド後（WinMD を生成するクラス ライブラリ） |

> **注:** このキャッシュ ディレクトリは生成物でありソースではないため、`.gitignore` に含めること。

## 使用方法

状況に合う経路を選ぶ:

---

### 発見 — 「どの API を使えばよいか分からない」

ユーザーが自分の言葉で機能を説明する。適切な API を見つける必要がある。

**0. キャッシュが存在することを確認する**

キャッシュがまだ生成されていない場合は、まず `Update-WinMdCache.ps1` を実行する。上記の [キャッシュのセットアップ（初回使用前に必須）](#キャッシュのセットアップ（初回使用前に必須）) を参照する。

**1. ユーザーの表現を検索キーワードへ変換する**

ユーザーの日常的な表現をプログラミング用語に対応付ける。複数の表現を試す:

| ユーザーの表現 | 試す検索キーワード（順番どおり） |
|-----------|-----------------------------------|
| 「写真を撮る」 | `camera`, `capture`, `photo`, `MediaCapture` |
| 「ディスクから読み込む」 | `file open`, `picker`, `FileOpen`, `StorageFile` |
| 「画像の内容を説明する」 | `image description`, `Vision`, `Recognition` |
| 「ポップアップを表示する」 | `dialog`, `flyout`, `popup`, `ContentDialog` |
| 「ドラッグ アンド ドロップする」 | `drag`, `drop`, `DragDrop` |
| 「設定を保存する」 | `settings`, `ApplicationData`, `LocalSettings` |

簡単な日常語から始める。結果が少ない、または無関係な場合は、より技術的な表現を試す。

**2. 検索を実行する**

```powershell
.\.github\skills\winmd-api-search\scripts\Invoke-WinMdQuery.ps1 -Action search -Query "<keyword>"
```

これにより、上位の一致する型と **JSON ファイルのパス** を含む、順位付けされた名前空間が返される。

結果の **スコアが低い（60 未満）か無関係な場合** は、オンライン ドキュメントの検索に切り替える:

1. Web 検索を使って Microsoft Learn で適切な API を探す。例:
   - `site:learn.microsoft.com/uwp/api <capability keywords>`（`Windows.*` API 用）
   - `site:learn.microsoft.com/windows/windows-app-sdk/api/winrt <capability keywords>`（`Microsoft.*` WinAppSDK API 用）
2. ドキュメント ページを読み、ユーザーの要件に一致する型を特定する。
3. 型名が分かったら戻り、`-Action members` または `-Action enums` を使ってローカルの正確なシグネチャを取得する。

**3. JSON を読んで適切な API を選ぶ**

上位結果に示されたパスのファイルを読む。JSON にはその名前空間のすべての型、完全なメンバー、シグネチャ、パラメーター、戻り値、列挙値が含まれる。

内容を読み、ユーザーの要件に適合する型とメンバーを判断する。

**4. 公式ドキュメントで背景を確認する**

キャッシュにはシグネチャだけが含まれ、説明や使用方法は含まれない。説明、例、注意事項については Microsoft Learn で型を調べる:

| 名前空間の接頭辞 | ドキュメントのベース URL |
|-----------------|----------------------|
| `Windows.*` | `https://learn.microsoft.com/uwp/api/{fully.qualified.typename}` |
| `Microsoft.*` (WinAppSDK) | `https://learn.microsoft.com/windows/windows-app-sdk/api/winrt/{fully.qualified.typename}` |

たとえば、`Microsoft.UI.Xaml.Controls.NavigationView` は次に対応する:
`https://learn.microsoft.com/windows/windows-app-sdk/api/winrt/microsoft.ui.xaml.controls.navigationview`

**5. API の知識を使って回答またはコードを作成する**

---

### 参照 — 「API は分かっているので詳細を見たい」

型または名前空間の名前が分かっている、または候補がある場合は、直接参照する:

```powershell
# Get all members of a known type
.\.github\skills\winmd-api-search\scripts\Invoke-WinMdQuery.ps1 -Action members -TypeName "Microsoft.UI.Xaml.Controls.NavigationView"

# Get enum values
.\.github\skills\winmd-api-search\scripts\Invoke-WinMdQuery.ps1 -Action enums -TypeName "Microsoft.UI.Xaml.Visibility"

# List all types in a namespace
.\.github\skills\winmd-api-search\scripts\Invoke-WinMdQuery.ps1 -Action types -Namespace "Microsoft.UI.Xaml.Controls"

# Browse namespaces
.\.github\skills\winmd-api-search\scripts\Invoke-WinMdQuery.ps1 -Action namespaces -Filter "Microsoft.UI"
```

`-Action members` の表示より詳しい情報が必要な場合は、`-Action search` で JSON ファイルのパスを取得し、その JSON ファイルを直接読む。

---

### その他のコマンド

```powershell
# List cached projects
.\.github\skills\winmd-api-search\scripts\Invoke-WinMdQuery.ps1 -Action projects

# List packages for a project
.\.github\skills\winmd-api-search\scripts\Invoke-WinMdQuery.ps1 -Action packages

# Show stats
.\.github\skills\winmd-api-search\scripts\Invoke-WinMdQuery.ps1 -Action stats
```

> キャッシュされたプロジェクトが 1 つだけの場合、`-Project` は自動選択される。
> 複数のプロジェクトがある場合は `-Project <name>` を追加する（利用可能な名前は `-Action projects` で確認する）。
> スキャン モードでは衝突を避けるためマニフェスト名に短いハッシュ接尾辞が付く。曖昧でなければ接尾辞なしの基本プロジェクト名を指定できる。

## 検索スコア

検索では、クエリに対する型名とメンバー名の一致度を順位付けする:

| スコア | 一致種別 | 例 |
|-------|-----------|---------|
| 100 | 名前の完全一致 | `Button` → `Button` |
| 80 | 前方一致 | `Navigation` → `NavigationView` |
| 60 | 部分一致 | `Dialog` → `ContentDialog` |
| 50 | PascalCase の頭文字 | `ASB` → `AutoSuggestBox` |
| 40 | 複数キーワードの AND | `navigation item` → `NavigationViewItem` |
| 20 | あいまいな文字一致 | `NavVw` → `NavigationView` |

結果は名前空間ごとにまとめられ、スコアの高い名前空間が先に表示される。

## トラブルシューティング

| 問題 | 対処 |
|-------|-----|
| 「キャッシュが見つからない」 | `Update-WinMdCache.ps1` を実行する |
| 「複数のプロジェクトがキャッシュされている」 | `-Project <name>` を追加する |
| 「名前空間が見つからない」 | `-Action namespaces` で利用可能な名前空間を一覧表示する |
| 「型が見つからない」 | 完全修飾名を使う（例: `Microsoft.UI.Xaml.Controls.Button`） |
| NuGet 更新後に古い | `Update-WinMdCache.ps1` を再実行する |
| キャッシュが Git 履歴に入る | `.gitignore` に `Generated Files/` を追加する |

## 参照

- [Windows Platform SDK API リファレンス](https://learn.microsoft.com/uwp/api/) — `Windows.*` 名前空間のドキュメント
- [Windows App SDK API リファレンス](https://learn.microsoft.com/windows/windows-app-sdk/api/winrt/) — `Microsoft.*` WinAppSDK 名前空間のドキュメント

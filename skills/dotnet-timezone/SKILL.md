---
name: dotnet-timezone
description: '.NET timezone handling guidance for C# applications. Use when working with TimeZoneInfo, DateTimeOffset, NodaTime, UTC conversion, daylight saving time, scheduling across timezones, cross-platform Windows/IANA timezone IDs, or when a .NET user needs the timezone for a city, address, region, or country and copy-paste-ready C# code.'
---

# .NET タイムゾーン

本番環境で安全なガイダンスと、コピー＆ペーストですぐに使えるスニペットを使用して、.NET および C# コードのタイムゾーンに関する質問を解決します。

## 適切な方法から始める

まず、リクエストの種類を特定します。

- 住所または場所の検索
- タイムゾーン ID の検索
- UTC/ローカル時刻の変換
- クロスプラットフォームのタイムゾーン互換性
- スケジュール設定または DST の処理
- API または永続化の設計

ライブラリが明確でない場合、クロスプラットフォームの作業では既定で `TimeZoneConverter` を使用します。シナリオに繰り返しスケジュールまたは厳密な DST ルールが含まれる場合は、`NodaTime` を優先します。

## 住所と場所を解決する

ユーザーが住所、市区町村、地域、国、または地名を含むドキュメントを提供した場合:

1. 入力から各場所を抽出します。
2. 一般的な Windows と IANA の対応関係について `references/timezone-index.md` を読みます。
3. 正確な場所が記載されていない場合は、地理情報から正しい IANA ゾーンを推定し、それを Windows ID にマッピングします。
4. 両方の ID と、すぐに使用できる C# の例を返します。

解決した各場所について、次を提供します。

```text
Location: <resolved place>
Windows ID: <windows id>
IANA ID: <iana id>
UTC offset: <standard offset and DST offset when relevant>
DST: <yes/no>
```

その後、次のようなクロスプラットフォームのスニペットを含めます。

```csharp
using TimeZoneConverter;

TimeZoneInfo tz = TZConvert.GetTimeZoneInfo("Asia/Colombo");
DateTime local = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);
```

複数の場所が存在する場合は、場所ごとに 1 つのブロックを含め、その後に複数タイムゾーンを組み合わせたスニペットを追加します。

場所があいまいな場合は、可能性のあるタイムゾーン候補を一覧表示し、ユーザーに正しいものを選択するよう求めます。

## タイムゾーン ID を検索する

Windows から IANA へのマッピングには `references/timezone-index.md` を使用します。

常に両方の形式を提供します。

- Windows 上の `TimeZoneInfo.FindSystemTimeZoneById()` 用の Windows ID
- Linux、コンテナー、`NodaTime`、および `TimeZoneConverter` 用の IANA ID

## コードを生成する

`references/code-patterns.md` を使用し、適合する最小のパターンを選択します。

- パターン 1: Windows 専用コード向けの `TimeZoneInfo`
- パターン 2: クロスプラットフォーム変換向けの `TimeZoneConverter`
- パターン 3: 厳密なタイムゾーン演算および DST の影響を受けやすいスケジュール向けの `NodaTime`
- パターン 4: API およびデータ転送向けの `DateTimeOffset`
- パターン 5: ASP.NET Core の永続化と表示
- パターン 6: 繰り返しジョブとスケジューラー
- パターン 7: あいまいな DST タイムスタンプと無効な DST タイムスタンプ

サードパーティ ライブラリを推奨する場合は、常にパッケージに関するガイダンスを含めます。

## よくある落とし穴について警告する

該当する場合は、関連する警告を記載します。

- `TimeZoneInfo.FindSystemTimeZoneById()` はタイムゾーン ID に関してプラットフォーム固有です。
- データベースに `DateTime.Now` を保存しないでください。代わりに UTC を保存します。
- `DateTimeKind.Unspecified` は意図的な入力でない限り、バグのリスクとして扱います。
- DST の移行では、ローカル時刻がスキップまたは繰り返されることがあります。
- Azure Windows と Azure Linux の環境では、異なるタイムゾーン ID 形式が求められる場合があります。

## 応答の形式

住所および場所に関するリクエストの場合:

1. 場所ごとに解決したタイムゾーン ブロックを返します。
2. 推奨する実装を 1 文で示します。
3. コピー＆ペーストですぐに使える C# スニペットを含めます。

コードおよびアーキテクチャに関するリクエストの場合:

1. 推奨するアプローチを 1 文で示します。
2. 関連する場合はタイムゾーン ID を示します。
3. 最小限で動作するコード スニペットを含めます。
4. 必要な場合はパッケージ要件を記載します。
5. 重要な場合は落とし穴に関する警告を 1 つ追加します。

応答は簡潔にし、コードを優先します。

## 参考資料

- `references/timezone-index.md`: 一般的な Windows と IANA のタイムゾーン マッピング
- `references/code-patterns.md`: すぐに使用できる .NET タイムゾーン パターン

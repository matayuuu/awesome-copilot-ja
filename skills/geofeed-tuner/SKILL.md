---
name: geofeed-tuner
description: 'IP geolocation feed、RFC 8805、geofeedに関する作業や、CSV形式の自家公開IP geolocation feedの作成、調整、検証、公開を支援します。ネットワーク運用者、ISP、モバイル通信事業者、クラウドプロバイダー、ホスティング企業、IXP、衛星プロバイダー向けです。RFC 8805準拠を超える推奨事項も扱いますが、プライベートまたは内部のIPアドレス管理には使わず、公開経路可能なIPアドレスにのみ適用します。'
license: Apache-2.0
metadata:
  author: Sid Mathur <support@getfastah.com>
  version: "0.0.9"
compatibility: Requires Python 3
---

# Geofeed Tuner – より良い IP geolocation feeds を作成する

このスキルは、CSV 形式の IP geolocation feed を作成・改善するために役立ちます。具体的には:
- CSV のフォーマットが整っていて一貫していることを確認する
- [RFC 8805](references/rfc8805.txt) と整合しているかを確認する（業界標準）
- 実運用で得られた意見を含むベストプラクティスを適用する
- 正確性、完全性、プライバシーの観点で改善案を提案する

## このスキルを使うタイミング

- ユーザーが、CSV 形式の IP geolocation feed ファイルを**作成、改善、公開**する支援を求めている場合。
- CSV geolocation feed を**調整・トラブルシュート**したい場合。エラーの特定、改善提案、RFC コンプライアンスを超えた実運用上の使いやすさの確保を支援します。
- **対象読者:**
  - 公開経路可能な IP アドレス空間を担当するネットワーク運用者、管理者、エンジニア
  - ISP、モバイル通信事業者、クラウドプロバイダー、ホスティング・コロケーション企業、インターネット交換局運営者、衛星インターネット事業者などの組織
- このスキルを**プライベートまたは内部の IP アドレス管理**には使わないでください。**公開経路可能な IP アドレス**にのみ適用されます。

## 前提条件

- **Python 3** が必要です。

## ディレクトリ構造とファイル管理

このスキルでは、**配布ファイル**（読み取り専用）と **作業ファイル**（実行時に生成）を明確に分離します。

### 読み取り専用ディレクトリ（変更しない）

以下のディレクトリには静的な配布アセットが含まれています。**これらのディレクトリではファイルを作成、変更、削除しないでください。**

| ディレクトリ | 目的 |
|--------------|------|
`assets/` | 静的データファイル（ISO コード、例など） |
`references/` | 参照用の RFC 仕様とコードスニペット |
`scripts/` | レポート生成用の実行可能コードと HTML テンプレート |

### 作業用ディレクトリ（生成されるコンテンツ）

生成物、一時ファイル、出力ファイルは以下のディレクトリに置きます。

| ディレクトリ | 目的 |
|--------------|------|
`run/` | エージェント生成コンテンツの作業ディレクトリ |
`run/data/` | リモート URL からダウンロードした CSV ファイル |
`run/report/` | 生成された HTML チューニングレポート |

### ファイル管理ルール

1. `assets/`、`references/`、`scripts/` には**絶対に書き込まない** — これらはスキル配布物の一部であり、変更してはいけません。
2. **ダウンロードした入力ファイル**（リモート URL から取得したもの）は必ず `./run/data/` に保存する。
3. **生成した HTML レポート**は必ず `./run/report/` に保存する。
4. **生成した Python スクリプト**は必ず `./run/` に保存する。
5. `run/` ディレクトリはセッション間でクリアできるため、そこに永続データを保存しない。
6. **実行時の作業ディレクトリ:** `./run/` にある生成スクリプトは、**スキルのルートディレクトリ**（`SKILL.md` が置かれているディレクトリ）をカレントディレクトリとして実行する必要があります。これにより `assets/iso3166-1.json` や `./run/data/report-data.json` のような相対パスが正しく解決されます。スクリプト実行前に `./run/` に `cd` しないでください。

## 処理パイプライン: 順次フェーズ実行

すべてのフェーズは、Phase 1 から Phase 6 の順で実行する必要があります。各フェーズは前のフェーズの成功完了に依存します。たとえば、**構造チェック**が完了していないと **品質分析** は実行できません。

フェーズは以下のとおり要約されています。エージェントは各フェーズに記載された詳細な手順に従ってください。

| フェーズ | 名前 | 説明 |
|---------|------|------|
| 1 | 標準を理解する | 自家公開 IP geolocation feed に関する RFC 8805 の主要要件を確認する |
| 2 | 入力を収集する | ローカルファイルまたはリモート URL から IP サブネットデータを収集する |
| 3 | チェックと提案 | CSV 構造を検証し、IP プレフィックスを分析し、データ品質を確認する |
| 4 | チューニングデータ lookup | Fastah の MCP ツールを使って geolocation 精度向上のためのチューニングデータを取得する |
| 5 | チューニングレポート生成 | 分析と提案を要約した HTML レポートを作成する |
| 6 | 最終レビュー | レポートデータの整合性と完全性を確認する |

**フェーズを飛ばさないでください。** 各フェーズは後続の段階で必要とされる重要なチェックやデータ変換を提供します。

### 実行計画ルール

各フェーズを実行する前に、エージェントは**必ず目に見える TODO チェックリスト**を生成しなければなりません。

計画は次の要件を満たす必要があります:
- フェーズの最初に表示する
- 手順を順番にすべて列挙する
- チェックボックス形式を使う
- 手順が完了するたびにライブで更新する

### Phase 1: 標準を理解する

このスキルが強制する RFC 8805 の重要要件は、以下の要約を作業用リファレンスとしてください。**この要約は作業用の参照として使う**。完全な [RFC 8805 テキスト](references/rfc8805.txt) は、エッジケース、曖昧な状況、またはユーザーがこの要約ではカバーされていない標準に関する質問をした場合だけ確認してください。

#### RFC 8805 の主要な事実

**目的:** 自家公開 IP geolocation feed は、ネットワーク運用者が自分の IP アドレス空間に対する権威ある位置情報データを簡単な CSV 形式で公開できるようにし、geolocation プロバイダーがオペレーター提供の補正を取り込めるようにするためのものです。

**CSV 列順（Sections 2.1.1.1–2.1.1.5）：**

| 列 | フィールド | 必須 | 補足 |
|----|-----------|------|------|
| 1 | `ip_prefix` | はい | CIDR 表記; IPv4 または IPv6; ネットワークアドレスである必要がある |
| 2 | `alpha2code` | いいえ | ISO 3166-1 alpha-2 国コード; 空または "ZZ" = do-not-geolocate |
| 3 | `region` | いいえ | ISO 3166-2 地域コード（例: `US-CA`） |
| 4 | `city` | いいえ | 自由記述の都市名; 権威ある検証集合ではない |
| 5 | `postal_code` | いいえ | **非推奨** — 空または省略する必要がある |

**構造ルール:**
- 行頭が `#` のコメント行を含められる。
- ヘッダー行は任意であり、`#` で始まる場合はコメントとして扱われる。
- ファイルは UTF-8 でエンコードする必要がある。
- サブネットのホストビットは設定してはいけない（例: `192.168.1.1/24` は不正; `192.168.1.0/24` を使う）。
- **グローバルに経路可能なユニキャストアドレス**にのみ適用される — プライベート、ループバック、リンクローカル、マルチキャスト空間には適用されない。

**do-not-geolocate:** `alpha2code` が空、または大文字小文字を区別しない `ZZ` のエントリは、オペレーターがそのプレフィックスに geolocation を適用しないことを明示的に示すものです。

**郵便番号は非推奨（Section 2.1.1.5）:** 5 列目には郵便番号や ZIP コードを入れてはいけません。IP 範囲マッピングには粒度が細かすぎ、プライバシーリスクも高くなります。

### Phase 2: 入力を収集する

- ユーザーがまだ IP サブネットや範囲の一覧（`inetnum` または `inet6num` と呼ばれることもある）を提供していない場合は、送ってもらうよう依頼してください。受け付ける入力形式:
  - チャットに貼り付けたテキスト
  - ローカル CSV ファイル
  - CSV ファイルへのリモート URL

- 入力が **リモート URL** の場合:
  - CSV ファイルを `./run/data/` にダウンロードしてから処理してください。
  - HTTP エラー（4xx, 5xx, タイムアウト、リダイレクトループ）が発生した場合は、処理を**直ちに停止**してユーザーに報告してください:
    `Feed URL is not reachable: HTTP {status_code}. Please verify the URL is publicly accessible.`
  - 完了していない、または空のダウンロードを使って Phase 3 に進まないでください。

- 入力が **ローカルファイル** の場合は、ダウンロードせずにそのまま処理してください。

- **エンコーディング検出と正規化:**
  1. まず UTF-8 として読み取りを試みる。
  2. `UnicodeDecodeError` が発生した場合は、`utf-8-sig`（BOM 付き UTF-8）、次に `latin-1` を試す。
  3. 正しくデコードできたら、再エンコードして作業用コピーを UTF-8 として書き出す。
  4. いずれのエンコーディングでも失敗した場合は停止し、次のメッセージを報告する: `Unable to decode input file. Please save it as UTF-8 and try again.`

```json
{
  "InputFile": "",
  "Timestamp": 0,

  "TotalEntries": 0,
  "IpV4Entries": 0,
  "IpV6Entries": 0,
  "InvalidEntries": 0,

  "Errors": 0,
  "Warnings": 0,
  "OK": 0,
  "Suggestions": 0,

  "CityLevelAccuracy": 0,
  "RegionLevelAccuracy": 0,
  "CountryLevelAccuracy": 0,
  "DoNotGeolocate": 0,

  "Entries": [
    {
      "Line": 0,
      "IPPrefix": "",
      "CountryCode": "",
      "RegionCode": "",
      "City": "",

      "Status": "",
      "IPVersion": "",

      "Messages": [
        {
          "ID": "",
          "Type": "",
          "Text": "",
          "Checked": false
        }
      ],

      "HasError": false,
      "HasWarning": false,
      "HasSuggestion": false,
      "DoNotGeolocate": false,
      "GeocodingHint": "",
      "Tunable": false
    }
  ]
}
```

```python
entry["Messages"].append({
    "ID": "1201",      # From the table
    "Type": "ERROR",   # From the table
    "Text": "Invalid country code: not a valid ISO 3166-1 alpha-2 value",  # From the table
    "Checked": True    # From the table (True = tunable)
})
```

```python
entry["HasError"] = any(m["Type"] == "ERROR" for m in entry["Messages"])
entry["HasWarning"] = any(m["Type"] == "WARNING" for m in entry["Messages"])
entry["HasSuggestion"] = any(m["Type"] == "SUGGESTION" for m in entry["Messages"])
entry["Tunable"] = any(m["Checked"] for m in entry["Messages"])
```

    ```
    ip_prefix, alpha2code, region, city, postal code (deprecated)
    ```

```json
[
    {"rowKey": "550e8400-e29b-41d4-a716-446655440000", "countryCode":"CA","regionCode":"CA-ON","cityName":"Toronto"},
    {"rowKey": "6ba7b810-9dad-11d1-80b4-00c04fd430c8", "countryCode":"IN","regionCode":"IN-KA","cityName":"Bangalore"},
    {"rowKey": "6ba7b811-9dad-11d1-80b4-00c04fd430c8", "countryCode":"IN","regionCode":"IN-KA"}
]
```

```json
    "fastah-ip-geofeed": {
      "type": "http",
      "url": "https://mcp.fastah.ai/mcp"
    }
```

  ```json
  [
      {"rowKey": "550e8400-...", "countryCode":"CA", ...},
      {"rowKey": "690e9301-...", "countryCode":"ZZ", ...}
  ]
- Open `./run/data/mcp-server-payload.json` and send all deduplicated entries with their rowKeys.
- If there are more than 1000 deduplicated entries after deduplication, split into multiple requests of 1000 entries each.
- The server will respond with the same `rowKey` field in each response for mapping back.
- Do NOT use local data.

#### Step 3: Attach Tuned Data to Entries

- Generate a new **script** for attaching tuned data.
- Load both `./run/data/report-data.json` and the deduplication map (held in memory from Step 1, or re-derived from the payload file).
- For each response from the MCP server:
  - Extract the `rowKey` from the response.
  - Look up the `entryIndices` array associated with that `rowKey` from the deduplication map.
  - For each index in `entryIndices`, attach the best match to `Entries[index]`.
- Use the **first (best) match** from the response when available.

Create the field on each affected entry if it does not exist. Remap the MCP API response keys to Go struct field names:

```json
"TunedEntry": {
  "Name": "",
  "CountryCode": "",
  "RegionCode": "",
  "PlaceType": "",
  "H3Cells": [],
  "BoundingBox": []
}
```

```javascript
const commentMap = {{.Comments}};
```

```python
comments_json = json.dumps(comments)
template = template.replace("{{.Comments}}", comments_json)
```

    ```python
    m = re.search(
        r'\{\{range \.Entries\}\}(.*?)\{\{end\}\}\s*</tbody>',
        template,
        re.DOTALL,
    )
    entry_body = m.group(1)  # template text for one entry iteration
    ```

```python
STATUS_CSS = {"ERROR": "error", "WARNING": "warning", "SUGGESTION": "suggestion", "OK": "ok"}
STATUS_ICON = {
    "ERROR": "bi-x-circle-fill",
    "WARNING": "bi-exclamation-triangle-fill",
    "SUGGESTION": "bi-lightbulb-fill",
    "OK": "bi-check-circle-fill",
}

def resolve_status_if(match_obj, status):
    """Pick the branch matching `status` from a {{if eq .Status ...}}...{{end}} block."""
    block = match_obj.group(0)
    # Try each branch: {{if eq .Status "X"}}val{{else if ...}}val{{else}}val{{end}}
    for st, val in [("ERROR",), ("WARNING",), ("SUGGESTION",)]:
        # not needed to parse generically — just map from the known patterns
    ...
```

```python
css_class = STATUS_CSS.get(status, "ok")
icon_class = STATUS_ICON.get(status, "bi-check-circle-fill")
body = body.replace(
    '{{if eq .Status "ERROR"}}error{{else if eq .Status "WARNING"}}warning{{else if eq .Status "SUGGESTION"}}suggestion{{else}}ok{{end}}',
    css_class,
)
body = body.replace(
    '{{if eq .Status "ERROR"}}bi-x-circle-fill{{else if eq .Status "WARNING"}}bi-exclamation-triangle-fill{{else if eq .Status "SUGGESTION"}}bi-lightbulb-fill{{else}}bi-check-circle-fill{{end}}',
    icon_class,
)
```

```python
msg_match = re.search(
    r'\{\{range \.Messages\}\}(.*?)\{\{end\}\}\s*(?=</td>)',
    body, re.DOTALL
)
```

   ```python
   if msg.get("Checked"):
       msg_body = msg_body.replace(
           '{{if .Checked}} checked{{else}} disabled{{end}}', ' checked'
       )
   else:
       msg_body = msg_body.replace(
           '{{if .Checked}} checked{{else}} disabled{{end}}', ' disabled'
       )
   ```

   ```python
   body = body[:msg_match.start()] + "".join(expanded_msgs) + body[msg_match.end():]
   ```

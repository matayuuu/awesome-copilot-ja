---
name: code-tour
description: '実在するファイルと行番号へリンクする、ペルソナ別の段階的なCodeTour .tourファイルを作成する。「ツアーを作成」「コードツアーを作って」「オンボーディングツアー」「このPRのツアー」「このバグのツアー」「RCAツアー」「アーキテクチャツアー」「Xの仕組みを説明」「PRレビューツアー」「コントリビューターガイド」など、コードを構造的に案内する依頼で使用する。20種類の開発者ペルソナ、すべてのCodeTourステップ形式、ツアーレベルのフィールドに対応し、あらゆる言語のRepositoryで使用できる。'
---

# Code Tour Skillの使い方

あなたは**CodeTour**を作成します。これは、ファイルと行番号へ直接リンクする、ペルソナ別の段階的なコードベース案内です。CodeTourファイルは`.tours/`に配置し、[VS Code CodeTour extension](https://github.com/microsoft/codetour)で動作します。

`scripts/`には2つのスクリプトが同梱されています:

- **`scripts/validate_tour.py`** — ツアーを書いた後に実行する。JSONの妥当性、ファイル／ディレクトリの存在、行番号の範囲、パターン一致、nextTourの相互参照、物語の流れを確認する。実行方法: `python ~/.agents/skills/code-tour/scripts/validate_tour.py .tours/<name>.tour --repo-root .`
- **`scripts/generate_from_docs.py`** — ユーザーがREADME／ドキュメントからの生成を依頼した場合、最初に実行して骨格を抽出し、その後内容を埋める。実行方法: `python ~/.agents/skills/code-tour/scripts/generate_from_docs.py --persona new-joiner --output .tours/skeleton.tour`

2つの参考ファイルが同梱されています:

- **`references/codetour-schema.json`** — 正式なJSON Schema。フィールド名や型を確認するために読む。使用するすべてのフィールドをこのSchemaへ準拠させる。
- **`references/examples.md`** — 本番Repositoryから取得した8件の実際のCodeTourと、手法に関する注釈。特定の機能（`commands`、`selection`、`view`、`pattern`、`isPrimary`、複数ツアーのシリーズ）が実際にどう使われるかを確認するときに読む。

### GitHub上の実際の`.tour`ファイル

以下は本番利用が確認された`.tour`ファイルです。特定のステップ形式、ツアーレベルのフィールド、物語構造の動作例が必要な場合に取得してください。実物を取得できるなら、記憶だけで書かないでください。

GitHub code searchでさらに探せます: https://github.com/search?q=path%3A**%2F*.tour+&type=code

#### 示されるステップ形式／手法別

| 学習対象 | ファイルURL |
|---|---|
| `directory` + `file+line`（コントリビューターのオンボーディング） | https://github.com/coder/code-server/blob/main/.tours/contributing.tour |
| `selection` + `file+line` + 導入用contentステップ（アクセシビリティプロジェクト） | https://github.com/a11yproject/a11yproject.com/blob/main/.tours/code-tour.tour |
| 最小限のチュートリアル — 対話型学習向けの簡潔な`file+line`説明 | https://github.com/lostintangent/rock-paper-scissors/blob/master/main.tour |
| `nextTour`で連結した複数ツアーのRepository（クラウドネイティブOCIの案内） | https://github.com/lucasjellema/cloudnative-on-oci-2021/blob/main/.tours/introduction.tour |
| `isPrimary: true`（オンボーディングのエントリポイントを示す） | https://github.com/nickvdyck/webbundlr/blob/main/.tours/getting-started.tour |
| `line`の代わりに`pattern`を使用（正規表現で固定したステップ） | https://github.com/nickvdyck/webbundlr/blob/main/.tours/architecture.tour |

**Rawコンテンツのヒント:** Raw JSONへアクセスするには、`raw.githubusercontent.com`を先頭に使用し、`/blob/`を削除します。

優れたツアーは、単にファイルへ注釈を付けたものではありません。重要なこと、その理由、次にすべきことを特定の人へ伝える**物語**です。対象者がこのRepositoryを初めて開いたときに、あってほしかったと思えるツアーを書くことが目標です。

**重要: `.tour` JSONファイルだけを作成します。その他のファイルは作成、変更、scaffoldしないでください。**

---

## ステップ1: Repositoryを調査する

ユーザーへ質問する前に、コードベースを調査します:

- ルートディレクトリを一覧表示し、READMEを読み、主要な構成ファイルを確認する
  （package.json、pyproject.toml、go.mod、Cargo.toml、composer.jsonなど）
- 言語、フレームワーク、プロジェクトの目的を特定する
- フォルダー構造を1～2階層まで整理する
- エントリポイント（mainファイル、indexファイル、アプリのbootstrap）を見つける
- **実在するファイルを記録する** — ツアーに記述するすべてのパスは実在しなければならない

Repository内のファイルが少ない、または空の場合は、その旨を伝え、存在するものを使用します。

**ユーザーが「READMEから生成」または「ドキュメントを使う」と依頼した場合:** 最初に骨格生成ツールを実行し、その後、実際のファイルを読んですべての`[TODO: ...]`を埋めます:

```bash
python skills/code-tour/scripts/generate_from_docs.py \
  --persona new-joiner \
  --output .tours/skeleton.tour
```

### 言語／フレームワーク別のエントリポイント

すべてを読まず、ここから始めてimportをたどります。

| スタック | 最初に読むエントリポイント |
|-------|---------------------------|
| **Node.js / TS** | `index.js/ts`, `server.js`, `app.js`, `src/main.ts`, `package.json` (scripts) |
| **Python** | `main.py`, `app.py`, `__main__.py`, `manage.py` (Django), `app/__init__.py` (Flask/FastAPI) |
| **Go** | `main.go`, `cmd/<name>/main.go`, `internal/` |
| **Rust** | `src/main.rs`, `src/lib.rs`, `Cargo.toml` |
| **Java / Kotlin** | `*Application.java`, `src/main/java/.../Main.java`, `build.gradle` |
| **Ruby** | `config/application.rb`, `config/routes.rb`, `app/controllers/application_controller.rb` |
| **PHP** | `index.php`, `public/index.php`, `bootstrap/app.php` (Laravel) |

### Repositoryの種類による差異 — 注目点を調整する

同じペルソナでも、Repositoryの種類に応じて求める内容は異なります:

| Repositoryの種類 | 強調する内容 | 典型的なアンカーファイル |
|-----------|-------------------|----------------------|
| **サービス／API** | リクエストのライフサイクル、認証、エラー契約 | router、middleware、handler、schema |
| **ライブラリ／SDK** | 公開API、拡張ポイント、バージョン管理 | index／exports、types、changelog |
| **CLI Tool** | コマンド解析、構成読み込み、出力形式 | main、commands/、config |
| **Monorepo** | パッケージ境界、共有契約、ビルドグラフ | ルートのpackage.json／pnpm-workspace、shared/、packages/ |
| **フレームワーク** | プラグインシステム、ライフサイクルフック、escape hatch | core/、plugins/、lifecycle |
| **データパイプライン** | ソース → 変換 → シンク、スキーマの所有権 | ingest/、transform/、schema/、dbt model |
| **フロントエンドアプリ** | コンポーネント階層、状態管理、ルーティング | pages/、store/、router、api/ |

**monorepo**では、ペルソナの目標に最も関連する2～3個のパッケージを特定します。すべてを案内しようとせず、ワークスペースの移動方法を説明するステップでツアーを開始し、その後は対象に集中します。

### 大規模Repositoryの戦略

100個以上のファイルがあるRepositoryでは、すべてを読もうとしないでください。

1. 最初にエントリポイントとREADMEを読む
2. 主要な5～7個のモジュールについて全体像を作る
3. 指定されたペルソナにとって**最も重要な2～3個のモジュール**を特定し、詳しく読む
4. 扱わないモジュールは、導入ステップで「このツアーの対象外」として言及する
5. 整理したものの読んでいない領域には`directory`ステップを使用する。完全な知識がなくても方向性を示せる

適切なファイルに集中した10ステップのツアーは、すべてを散漫に扱う25ステップのツアーより優れています。

---

## ステップ2: 意図を読み取る — 推測できることは推測し、分からないことだけを質問する

**ユーザーからの1件のメッセージで十分にしてください。** 質問する前に依頼を読み、ペルソナ、深さ、注目領域を推測します。

### 意図の対応表

| ユーザーの依頼 | → ペルソナ | → 深さ | → 動作 |
|-----------|-----------|---------|----------|
| 「このPRのツアー」／「PRレビュー」／「#123」 | pr-reviewer | standard | PRへの`uri`ステップを追加し、ブランチには`ref`を使用する |
| 「Xが壊れた理由」／「RCA」／「インシデント」 | rca-investigator | standard | 障害の因果関係を追跡する |
| 「Xをデバッグ」／「バグツアー」／「バグを探す」 | bug-fixer | standard | エントリ → 障害点 → テスト |
| 「オンボーディング」／「新規参加者」／「立ち上がり」 | new-joiner | standard | ディレクトリ、セットアップ、ビジネスコンテキスト |
| 「簡易ツアー」／「雰囲気をつかむ」／「要点だけ」 | vibecoder | quick | 5～8ステップ、最短経路のみ |
| 「Xの仕組みを説明」／「機能ツアー」 | feature-explainer | standard | UI → API → バックエンド → ストレージ |
| 「アーキテクチャ」／「技術リード」／「システム設計」 | architect | deep | 境界、判断、トレードオフ |
| 「セキュリティ」／「認証レビュー」／「信頼境界」 | security-reviewer | standard | 認証フロー、検証、機密性の高いシンク |
| 「リファクタリング」／「安全に抽出できる？」 | refactorer | standard | 境界、隠れた依存関係、抽出順序 |
| 「パフォーマンス」／「ボトルネック」／「遅い経路」 | performance-optimizer | standard | ホットパス、N+1、I/O、キャッシュ |
| 「コントリビューター」／「オープンソースのオンボーディング」 | external-contributor | quick | 安全な領域、規約、落とし穴 |
| 「概念」／「パターンXを説明」 | concept-learner | standard | 概念 → 実装 → 根拠 |
| 「テストカバレッジ」／「テストを追加する場所」 | test-writer | standard | 契約、境界、カバレッジ不足 |
| 「APIの呼び出し方」 | api-consumer | standard | 公開インターフェイス、認証、エラーの意味 |

**黙って推測する項目:** ペルソナ、深さ、注目領域、`uri`／`ref`を追加するか、`isPrimary`。

**本当に推測できない場合だけ質問する:**
- 「バグツアー」だがバグの説明がない → バグの説明を求める
- 「機能ツアー」だが機能名がない → 対象機能を尋ねる
- 「特定のファイル」が明示されている → 必須の経由地点として扱う

ユーザーが言及しない限り、`nextTour`、`commands`、`when`、`stepMarker`について質問しないでください。

### PRツアーのレシピ

PRツアーでは、`"ref"`をブランチに設定し、PRへの`uri`ステップで開始します。変更されたファイルを先に扱い、その後、変更されていないが重要なファイルを扱い、レビュアー向けチェックリストで締めくくります。

### ユーザー指定のカスタマイズ — 必ず尊重する

| ユーザーの依頼 | 対応 |
|-----------|-----------|
| 「`src/auth.ts`と`config/db.yml`を扱う」 | これらのファイルを必須の経由地点にする |
| 「`v2.3.0`タグに固定」／「このコミット: abc123」 | `"ref": "v2.3.0"`を設定する |
| 「PR #456へリンク」／URLを貼り付ける | 物語上の適切な位置へ`uri`ステップを追加する |
| 「完了後にセキュリティツアーへつなぐ」 | `"nextTour": "Security Review"`を設定する |
| 「これをメインのオンボーディングツアーにする」 | `"isPrimary": true`を設定する |
| 「このステップでターミナルを開く」 | `"commands": ["workbench.action.terminal.focus"]`を追加する |
| 「詳細」／「徹底的」／「5ステップ」／「簡易」 | 指定に合わせて深さを上書きする |

---

## ステップ3: 実際のファイルを読む — 例外なし

**ツアー内のすべてのファイルパスと行番号は、ファイルを読んで確認する必要があります。**
誤ったファイルや存在しない行を指すツアーは、ツアーがない状態より悪質です。

計画した各ステップについて:
1. ファイルを読む
2. 強調するコードの正確な行を見つける
3. 対象ペルソナへ説明できるまで理解する

ユーザーが指定したファイルが存在しない場合は、その旨を伝え、黙って別のファイルに置き換えないでください。

---

## ステップ4: ツアーを書く

`.tours/<persona>-<focus>.tour`へ保存します。正式なフィールド一覧については`references/codetour-schema.json`を読みます。使用するすべてのフィールドがそのSchemaに存在しなければなりません。

### ツアーのルート

```json
{
  "$schema": "https://aka.ms/codetour-schema",
  "title": "Descriptive Title — Persona / Goal",
  "description": "One sentence: who this is for and what they'll understand after.",
  "ref": "main",
  "isPrimary": false,
  "nextTour": "Title of follow-up tour",
  "steps": []
}
```

このツアーに該当しないフィールドは省略します。

**`when`** — 条件付き表示。ランタイムで評価されるJavaScript式です。条件がtrueの場合だけこのツアーを表示します。ペルソナ固有の自動起動や、簡単なツアーが完了するまで高度なツアーを非表示にする場合に役立ちます。
```json
{ "when": "workspaceFolders[0].name === 'api'" }
```

**`stepMarker`** — ステップのアンカーをソースコードのコメントへ直接埋め込みます。設定すると、CodeTourはファイル内の`// <stepMarker>`コメントを探し、行番号の代わり、または行番号と併せてステップ位置として使用します。行番号が頻繁に変わる、活発に変更されるコードのツアーに役立ちます。例: `"stepMarker": "CT"`を設定し、ソースファイルへ`// CT`を記述します。ソースファイルの編集が必要となる特殊な方法なので、ユーザーが依頼しない限り提案しないでください。

---

### ステップ形式 — 完全なリファレンス

すべてのステップ形式: **content**（導入／締めくくり、最大2件）、**directory**、**file+line**（中心的な形式）、**selection**（コードブロック）、**pattern**（正規表現一致）、**uri**（外部リンク）、**view**（VS Codeパネルへフォーカス）、**commands**（VS Codeコマンドを実行）。

> **パスのルール:** `"file"`と`"directory"`はRepositoryルートからの相対パスにする。絶対パスや先頭の`./`は使用しない。

---

### 各ステップ形式を使用する場面

| 状況 | ステップ形式 |
|-----------|-----------|
| ツアーの導入または締めくくり | content |
| 「このフォルダーにあるもの」を示す | directory |
| 1行で全体を説明できる | file + line |
| 関数／クラス本体が要点 | selection |
| 行番号が変わりやすく、ファイルが頻繁に変化する | pattern |
| PR／Issue／ドキュメントが「理由」を示す | uri |
| 読者にterminalまたはexplorerを開いてほしい | viewまたはcommands |

---

### ステップ数の調整

ステップ数を深さとペルソナに合わせます。これは目安であり、厳密な上限ではありません。

| 深さ | 総ステップ数 | コアパスのステップ数 | 注記 |
|-------|-------------|-----------------|-------|
| 簡易 | 5～8 | 3～5 | バイブコーダー、短時間の調査 — 徹底して絞る |
| 標準 | 9～13 | 6～9 | 多くのペルソナ — 幅広さと十分な詳細 |
| 詳細 | 14～18 | 10～13 | アーキテクト、RCA — すべてのトレードオフを示す |

Repositoryの規模にも合わせます。3ファイルのCLIに15ステップは不要です。200ファイルのmonolithを5ステップに押し込めるべきでもありません。

| Repositoryの規模 | 推奨される標準の深さ |
|-----------|---------------------------|
| 極小（20ファイル未満） | 5～8ステップ |
| 小（20～80ファイル） | 8～11ステップ |
| 中（80～300ファイル） | 10～13ステップ |
| 大（300ファイル超） | 12～15ステップ（関連サブシステムに限定） |

---

### 優れた説明を書く — SMIGの公式

すべての説明で、4つの問いに順番に答えます。4段落にする必要はありませんが、短くても4つの要素をすべて含めます。

**S — Situation（状況）**: 読者は何を見ているか。1文でコンテキストを示す。
**M — Mechanism（仕組み）**: このコードはどう動くか。どのパターン、規則、設計が使われているか。
**I — Implication（意味）**: *このペルソナの目標にとって*なぜ重要か。
**G — Gotcha（注意点）**: 理解力のある人でも何を誤りやすいか。分かりにくい点、壊れやすい点、意外な点は何か。

説明では、ファイルを読むだけでは分からないことを読者へ伝えます。パターン名を示し、設計判断を説明し、障害モードを指摘し、関連コンテキストを相互参照します。

---

## 物語の流れ — すべてのツアーとペルソナ

1. **方向付け** — **必ず`file`または`directory`ステップにし、contentだけにはしない。**
   `"file": "README.md", "line": 1`または`"directory": "src"`を使用し、歓迎メッセージをdescriptionへ記述します。
   contentだけの最初のステップ（`file`、`directory`、`uri`なし）は、VS Code CodeTourで空白ページとして表示されます。これはVS Code extensionの既知の動作で、構成変更できません。

2. **上位レベルの地図**（directoryまたはuriを1～3ステップ） — 主要モジュールとその関係。
   すべてのフォルダーではなく、このペルソナが知る必要のあるものだけを扱います。

3. **コアパス**（file/line、selection、pattern、uriステップ） — 重要な具体的コード。
   ここがツアーの中心です。読み、物語として説明します。流し読みしないでください。

4. **締めくくり**（content） — 読者が理解したこと、次にできること、
   推奨する後続ツアー2～3件。`nextTour`を設定した場合は、ここで名前を参照します。

### 締めくくりのステップ

要約しないでください。読者は今読んだばかりです。代わりに、これから*できること*、避けるべきことを伝え、後続ツアーを2～3件提案します。

---

## 20種類のペルソナ

| ペルソナ | 目標 | 必ず扱う内容 | 避ける内容 |
|---------|------|------------|-------|
| **バイブコーダー** | 短時間で雰囲気をつかむ | エントリポイント、リクエストフロー、主要モジュール。最大8ステップ。 | 詳細な掘り下げ、エッジケース |
| **新規参加者** | 構造的に立ち上がる | ディレクトリ、セットアップ、ビジネスコンテキスト、サービス境界。 | 高度な内部実装 |
| **バグ修正担当** | 根本原因を素早く見つける | ユーザー操作 → トリガー → 障害点。再現のヒント + テストの場所。 | アーキテクチャツアー |
| **RCA調査担当** | 失敗理由を理解する | 因果関係、副作用、race condition、可観測性。 | 正常系 |
| **機能説明担当** | 1つの機能をend-to-endで理解する | UI → API → バックエンド → ストレージ。feature flag、エッジケース。 | 無関係な機能 |
| **PRレビュアー** | 変更を正しくレビューする | 変更の物語、不変条件、危険な領域、レビュアー向けチェックリスト。PRへのURIステップ。 | 無関係なコンテキスト |
| **セキュリティレビュアー** | 信頼境界を理解する | 認証フロー、入力検証、secret処理、機密性の高いシンク。 | 無関係なビジネスロジック |
| **リファクタリング担当** | 安全に再構成する | 境界、隠れた依存関係、結合の集中箇所、安全な抽出順序。 | 機能説明 |
| **外部コントリビューター** | 壊さずに貢献する | 安全な領域、コードスタイル、アーキテクチャ上の落とし穴。 | 深い内部実装 |
| **技術リード／アーキテクト** | 構造と根拠を理解する | モジュール境界、設計上のトレードオフ、リスク集中箇所。 | 1行ずつの案内 |

---

## ツアーシリーズの設計

コードベースが複雑で1つのツアーでは十分に扱えない場合は、シリーズを設計します。`nextTour`フィールドでツアーを連結すると、読者が1つのツアーを完了したとき、VS Codeが次のツアーの自動起動を提案します。

**ツアーを書く前にシリーズを計画します。** 優れたシリーズの特徴:
- 明確な段階的進行（広い範囲 → 狭い範囲、方向付け → 詳細）
- ツアー間でステップが重複しない
- 各ツアーが単独でも役立つ程度に独立している

各ツアーの`nextTour`を次のツアーの`title`へ設定します（完全一致が必要）。各ツアーは単独でも役立つ程度に独立させます。

---

## CodeTourでできないこと

次のいずれかを依頼された場合は、対応していないことを明確に伝え、存在しない回避策を提案しないでください:

| 依頼 | 実際の仕様 |
|---|---|
| **X秒後に次のステップへ自動で進む** | 非対応。移動は常に手動で、読者が「次へ」をクリックする。CodeTourにはtimer、delay、自動再生の仕組みがない。 |
| **ステップへ動画やGIFを埋め込む** | 非対応。descriptionはMarkdownテキストのみ。 |
| **任意のshellコマンドを実行する** | 非対応。`commands`で実行できるのはVS Codeコマンド（例: `workbench.action.terminal.focus`）だけで、shellコマンドは実行できない。 |
| **分岐／条件付きの次ステップ** | 非対応。ツアーは直線的である。`when`が制御するのはツアーを表示するかどうかであり、次にどのステップへ進むかではない。 |
| **ファイルを開かずにステップを表示する** | 一部対応。contentだけのステップは動作するが、ステップ1には`file`または`directory`アンカーが必要で、ない場合はVS Codeに空白ページが表示される。 |

---

## アンチパターン

| アンチパターン | 修正方法 |
|---|---|
| **ファイル一覧** — 「このファイルには～が含まれる」とファイルを巡る | 物語を伝える。各ステップが前のステップに依存するようにする |
| **一般的すぎる説明** | *この*コードベース固有のパターン／注意点を示す |
| **行番号の推測** | ファイルを読んで確認していない行番号は絶対に書かない |
| **ペルソナの無視** | ペルソナ固有の目標に役立たないステップをすべて削る |
| **存在しないファイル** | ファイルが存在しない場合は、そのステップを省く |

---

## 品質チェックリスト — ファイルを書く前に確認

- [ ] すべての`file`パスが**Repositoryルートからの相対パス**である（先頭に`/`または`./`を付けない）
- [ ] すべての`file`パスを読み、存在を確認した
- [ ] すべての`line`番号をファイルを読んで確認した（推測していない）
- [ ] すべての`directory`が**Repositoryルートからの相対パス**であり、存在を確認した
- [ ] すべての`pattern`正規表現がファイル内の実在する行に一致する
- [ ] すべての`uri`が完全な実在するURLである（https://...）
- [ ] `ref`を設定した場合、実在するbranch／tag／commitである
- [ ] `nextTour`を設定した場合、別の`.tour`ファイルの`title`と完全に一致する
- [ ] `.tour` JSONファイルだけを作成し、ソースコードには触れていない
- [ ] 最初のステップに`file`または`directory`アンカーがある（contentだけの最初のステップはVS Codeで空白ページになる）
- [ ] ツアーが、読者が次に*できること*を伝える締めくくりのcontentステップで終わる
- [ ] すべてのdescriptionがSMIG（Situation、Mechanism、Implication、Gotcha）に答える
- [ ] ペルソナの優先事項に基づいてステップを選択している（目標に役立たないものをすべて削る）
- [ ] ステップ数が指定された深さとRepository規模に合っている（調整表を参照）
- [ ] contentだけのステップが最大2件（導入 + 締めくくり）
- [ ] すべてのフィールドが`references/codetour-schema.json`に準拠している

---

## ステップ5: ツアーを検証する

**ツアーファイルを書いた直後に、必ずvalidatorを実行します。この手順を省略しないでください。**

```bash
python ~/.agents/skills/code-tour/scripts/validate_tour.py .tours/<name>.tour --repo-root .
```

validatorは次を確認します:
- JSONの妥当性
- すべての`file`パスが存在し、すべての`line`がファイルの範囲内にあること
- すべての`directory`が存在すること
- すべての`pattern`正規表現がコンパイルでき、ファイル内の少なくとも1行に一致すること
- すべての`uri`が`https://`で始まること
- `nextTour`が`.tours/`内の既存ツアーのtitleと一致すること
- contentだけのステップ数（2件を超える場合は警告）
- 物語の流れ（方向付けまたは締めくくりのステップがない場合は警告）

**続行する前にすべてのエラーを修正します。** validatorが✓または警告だけを報告するまで再実行します。警告は助言なので、判断して対応してください。検証に合格するまでユーザーへツアーを提示しないでください。

**一般的なVS Codeの問題:** contentだけの最初のステップは空白になる（代わりにfile／directoryへ固定する）。絶対パスや`./`で始まるパスは通知なく失敗する。範囲外の行番号ではどこにもスクロールしない。

スクリプトを実行できない場合は、ステップ1に`file`／`directory`があること、すべてのパスが存在すること、すべての行番号が範囲内であること、`nextTour`が完全に一致することを手動で確認します。

**自動再生:** `isPrimary: true`と、`{ "codetour.promptForPrimaryTour": true }`を含む`.vscode/settings.json`を設定すると、Repositoryを開いたときに確認が表示されます。どのブランチでも表示するツアーでは`ref`を省略します。

**共有:** 公開Repositoryでは、ユーザーはインストールせずに`https://vscode.dev/github.com/<owner>/<repo>`でツアーを開けます。

---

## ステップ6: 要約する

ツアーを書いた後、ユーザーへ次を伝えます:
- ファイルパス（`.tours/<name>.tour`）
- ツアーが扱う内容と対象者を説明する1段落の要約
- Repositoryが公開されている場合は`vscode.dev`のURL（すぐに共有できる）
- 推奨する後続ツアー2～3件（シリーズを計画した場合は次のツアー）
- ユーザーが指定したものの存在しなかったファイル（明示し、黙って置き換えない）

---

## ファイル命名

`<persona>-<focus>.tour` — kebab-caseで、両方を伝える:
```
onboarding-new-joiner.tour
bug-fixer-payment-flow.tour
architect-overview.tour
vibecoder-quickstart.tour
pr-review-auth-refactor.tour
security-auth-boundaries.tour
concept-dependency-injection.tour
rca-login-outage.tour
```
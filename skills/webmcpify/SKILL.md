---
name: webmcpify
description: 'Web アプリをエージェント対応にするため、WebMCP ツールマニフェストを提案し、統合、実ブラウザーでの検証、修復を行う。無関係なコードは変更しない。「webmcpify」「WebMCP を追加」「アプリの操作を AI エージェントに公開」で使う。'
argument-hint: "[inventory|integrate|verify|status|full] [scope notes]"
license: MIT
metadata:
  source: https://github.com/TueJon/webmcpify
---
# webmcpify — 任意の Web アプリを検証可能な形でエージェント対応にする

webmcpify パイプラインを実行する。既存の Web アプリのユーザー向け機能を [WebMCP](https://webmachinelearning.github.io/webmcp/) ツール（`document.modelContext` — W3C Web Machine Learning Community Group で検討中の提案 Web 標準で、現在は Chrome origin trial）として公開し、ブラウザー AI エージェントが DOM を推測せず構造化されたツール呼び出しでアプリを操作できるようにする。

```
DETECT ──▶ INVENTORY ──▶ [HUMAN GATE: manifest approval] ──▶ INTEGRATE ──▶ VERIFY ──▶ HEAL ──▶ AUDIT
              ▲  loop            per-area batches on big apps    ▲  loop      ▲ loop    ▲ loop
              └── per area                                       └── per manifest entry ──┘
```

必要なものはすべてこの Skill ディレクトリに含まれる。フェーズガイドは `references/` に、ベンダー可能なコード（ランタイム、アンビエント型、JS 版、React JSX 型、検証仕様）は `templates/` にある。Skill ディレクトリ外のファイルの存在を前提にしない。

**対象外**（停止してその旨を伝える）: バックエンド専用 MCP サーバー（これは WebMCP ではなく classic MCP）、管理していない第三者サイトの自動化、一般的な SEO 作業。

## 起動モード

ユーザーは引数（`/webmcpify <mode>` または通常の語句）を渡せる:

| 引数 | 実行内容 | 停止地点 |
|---|---|---|
| *(なし)* または `full` | 現在のマニフェスト状態から再開して全フェーズ | 完了 |
| `inventory` / `map` | DETECT + INVENTORY ループのみ — **コード変更ゼロ** | マニフェスト表をレビュー用に提示 |
| `integrate` | INTEGRATE ループのみ（マニフェストに承認済みツールが必要） | 統合とビルドの完了 |
| `verify` | 統合・検証済みツールに対する VERIFY + HEAL ループ | 成功またはスキップのレポート |
| `status` | `.webmcpify/manifest.json` を読み取り — **読み取り専用** | フェーズ、状態別ツール数、推奨される次のコマンドを報告 |

その他のテキストは範囲指定の指示として扱う（例: 「checkout 領域だけ」「読み取り専用ツールだけ」）。

## 基本ルール（交渉不可、全フェーズで適用）

1. **無関係な変更ゼロ。** 作成するすべての diff hunk は、マニフェストのエントリまたは記録済みの一度限りのセットアップに対応付けられなければならない。その他をリファクタリング、再フォーマット、改名、「改善」してはならず、問題はレポートに記録する。ベースライン時点ですでに変更されていたファイル（マニフェストに記録済み）は **変更不可** とし、変更も復元もしない。
2. **読み取り専用ツールを先にする。** 変更は3状態とする: `mutating: false`、`"client"`（ブラウザー内だけ: 設定、localStorage）、または `"server"`（データがブラウザー外へ出る）。サーバーを変更するツールには、マニフェストに記録した**ツールごとの**人間の明示的な承認が必要である。クライアントを変更するツールはゲートで一括承認してよい。初回の統合では、破壊的、不可逆、支払いのアクションを公開しない。
3. **サーバーだけを信頼境界とする。** ツールの `execute()` は UI がすでに使うコードパス（同じエンドポイント、同じ検証、同じ認証）だけを呼び出せる。新しいエンドポイントを作らず、既存のチェックを迂回せず、ツールに秘密情報を入れない。
4. **仕様準拠かつ依存関係なし。** AbortSignal のライフサイクルを使い（非推奨の `navigator.modelContext` フォールバックを機能検出して）、`document.modelContext.registerTool()` で登録する。第三者の WebMCP ランタイム依存関係を追加しない。すべてを機能検出し、WebMCP のないブラウザーでもアプリが同じように動作するようにする。
5. **状態を変更するフォームで `toolautosubmit` を決して使わない** — `mutating: "client"` でも `"server"` でも同じである。純粋な読み取りフォーム（検索、フィルター、空き状況）だけで使う。
6. **状態はコンテキストではなくファイルに置く。** `.webmcpify/` を常に読み書きし、任意の2つの手順の間にコンテキストが消去される可能性を前提にする。マニフェストはアトミックに書き込む（`manifest.json.tmp` に書いてから `manifest.json` にリネームする）。
7. **コミットはオプトイン。** 人間がゲートでコミット方針を選ばない限り、決してコミットしない（下記参照）。Git がない場合や権限がない場合は、変更をワーキングツリーに残し、進捗だけをマニフェストに記録する。

## 最新かつ権威あるガイダンス

WebMCP は変化中の origin-trial API であり、トライアル中にも API の表面は変更されている（testing API は 2026-07 に削除、`navigator` → `document`）。フェーズ2の前にネットワークが利用できる場合は、記憶に頼らず Google の最新公式ガイドを取得する:

```sh
npx -y modern-web-guidance@latest retrieve "webmcp,agentic-forms,agentic-javascript-tools"
```

オフラインの場合は `references/integrate.md` を使う。ただし、内容が矛盾する場合は最新のガイドを優先する。

## 状態プロトコル — 対象リポジトリの `.webmcpify/`

| ファイル | 目的 |
|---|---|
| `manifest.json` | 唯一の正本（スキーマは下記、アトミック書き込み） |
| `areas/<id>.tools.json` | インベントリの分散処理中にサブエージェントが出力する分割結果（統合後に削除） |
| `report.md` | 人間向けの進行レポート。最後に確定する |

**再開ルール:** `manifest.json` が存在する場合は再開し、すでに記録された内容を再計算しない。**残った分割結果を最初に統合する**: 既存の `areas/<id>.tools.json` ファイルをマニフェストへ統合し（該当領域を `inventoried` にして分割結果を削除する）、サブエージェントを再割り当てする。その後 `pipeline.phase`、最初の `pending` 領域、または状態が終端でない最初のツールから続行する。
終端状態: `verified`、`skipped`、`rejected`。

**フェーズ遷移**（条件が成立した時点でアトミックなマニフェスト書き込みを行う）:

- `detect → inventory`: `app` を記録し、`baselineSha`／`baselineDirty` を取得済み。
- `inventory → gate`: `pending` の領域がなく、完全性確認を実行済み。
- `gate → integrate`: すべての `discovered` ツールが `approved` または `rejected` で、`commitPolicy` と `commitWebmcpifyDir` が設定されている。
- `integrate → verify`: `approved` ツールが残っておらず、すべてが `integrated` または終端状態で、ビルドが成功している。
- `verify → heal`: 検証ループがすべての `integrated` ツールを確認し、1つ以上が `failed`。
  （失敗がなければ `audit` へ直行する。）
- `heal → audit`: `failed` のツールがなく、修復後の完全な再検証に合格。
- `audit → done`: すべての hunk を対応付けまたはフラグ付けし、`report.md` を確定済み。

マニフェスト スキーマ（Webmcpify Manifest v3）:

```jsonc
{
  "webmcpify": 3,
  "app": { "stack": "react-vite", "typescript": true, "entry": "src/main.tsx",
           "baseUrl": "http://localhost:5173", "startCommand": "npm run dev",
           "authFixtures": {                    // how verify OBTAINS each session
             "member": { "obtain": "npm run seed:test-user, then sign in at /login",
                         "account": "member@example.test",
                         "env": ["TEST_MEMBER_PASSWORD"] }  // env var NAMES only — never secret values
           } },
  "pipeline": {
    "phase": "inventory",          // detect|inventory|gate|integrate|verify|heal|audit|done — transition rules above
    "setup": {                     // PATHS created/modified per one-time setup step ([] = not done yet)
      "runtimeVendored": ["src/webmcp/webmcpify.ts", "src/webmcp/webmcp.d.ts"],
      "harnessInstalled": [".webmcpify/webmcp.spec.ts"],
      "originTrialNoted": ["README.md"]
    },
    "baselineSha": "abc1234",      // HEAD at pipeline start; null if no git
    "baselineDirty": ["src/wip.ts"], // paths dirty at start — untouchable (ground rule 1)
    "commitPolicy": null,          // set at the gate: "commit-per-batch" | "no-commit"
    "commitWebmcpifyDir": null,    // set at the gate: commit .webmcpify/ itself? true | false
    "blockers": []                 // e.g. "app won't start locally: needs $API_KEY" — surfaced at the gate
  },
  "areas": [
    { "id": "checkout", "paths": ["src/features/checkout/"], "status": "pending" } // pending|inventoried
  ],
  "tools": [
    {
      "id": "create_ticket",
      "area": "tickets",
      "kind": "imperative",        // imperative | declarative
      "mutating": "server",        // false | "client" (browser-local only: prefs, localStorage) | "server" (data leaves the browser)
      "priority": 1,               // 1 = expose first; 2/3 = later waves
      "description": "Creates a new ticket in the currently open project.",
      "inputSchema": { /* JSON Schema */ },
      "annotations": { "readOnlyHint": false, "untrustedContentHint": false }, // verify asserts these on the enumerated tool
      "source": ["src/features/tickets/NewTicket.tsx:42"], // the UI code path it wraps
      "route": "/projects/demo/tickets",                    // where verify navigates
      "auth": ["role:member"],     // "none" | "session" | ["role:<name>", ...] — keys into app.authFixtures; verify runs once per listed role
      "examples": { "valid": { "title": "Test ticket" }, "invalid": {} },
                                   // invalid: null ONLY for readOnlyHint tools with no/empty params —
                                   // verify then asserts dual-outcome: rejects OR resolves with no side effect
      "expect": { "result": "created", "navigation": null, "ui": "new row appears in the ticket list" },
                                   // exactly one of result|navigation: result = substring of the resolved string;
                                   // navigation = destination URL/pattern when executeTool resolves null (it navigated)
      "cleanup": "delete the created ticket via the UI's own delete path (test data only)", // required for mutating:"server", recommended for "client"
      "status": "discovered",      // discovered|approved|rejected*|integrated|verified*|failed|skipped*  (* = terminal)
      "approval": null,            // server-mutating tools, once approved: { "note": "...", "at": "2026-07-12",
                                   //   "productionSideEffect": null } — set only when verification unavoidably
                                   //   causes a real production effect (see VERIFY: production side-effect policy)
      "attempts": 0,               // heal-fix cycles; the triggering verify failure is attempt 0
      "batchCommit": null,         // sha under commit-per-batch — lands in the manifest one commit LATER
      "notes": ""
    }
  ],
  "log": [ "2026-07-12 inventory: area checkout done, 4 candidates" ]
}
```

**v2→v3 の移行:** `"webmcpify": 2` マニフェストを再開すると、最初の書き込み時にその場で移行する。`auth` の文字列を配列にし、`setup` のブール値をパス配列にする（`false` → `[]`、`true` → git または `log` からパスを復元し、復元できなければ `null` = 完了済みだが未記録。監査ではこれらのファイルをフラグのみの対象とする）。`mutating: true` を `"server"` にし、`annotations`（インベントリ表の既定値）、`blockers: []`、`commitWebmcpifyDir: null`、`expect.navigation: null` を追加し、最後に 3 へ更新する。

## フェーズ 0 — DETECT

技術スタック、ビルドと開発サーバーのコマンド、TypeScript の使用有無、認証モデル（各テスト セッションを検証がどのように取得するかを含む → `app.authFixtures`）、テスト設定、ローカルでのアプリ起動方法を特定し、`app` に記録する。Git のベースラインも記録する:
`pipeline.baselineSha` = 現在の HEAD、`pipeline.baselineDirty` = `git status
--porcelain` のパス（Git がない場合はどちらも `null`／`[]`）。アプリをローカルで起動できない場合はブロッカーを `pipeline.blockers` に追加する。統合は続行できるが検証はブロックされるため、ゲートで明示する。詳細:
`references/inventory.md`.

## フェーズ 1 — INVENTORY（ループ。規模を問わず適用）

**大規模なコードベースを 1 回でマッピングしない。**

1. **最初に領域をマッピングする（低コストで構造的）:** 実装ファイルを読まず、ルーター設定、ページ ディレクトリ、ナビゲーションからルート、ビュー、機能モジュールを列挙する。すべての領域を `"pending"` として `areas` に書き込む。
2. **インベントリ ループ（1 回につき 1 領域）:** その領域のファイルだけを詳しく読み、`references/inventory.md` の規約、ツール数の予算、重複ルールに従って、ユーザー操作ごとの候補ツールを作る。`route`、`auth`、`annotations`、`examples`、`expect`、`cleanup` を含むマニフェストの全フィールドを埋める（`mutating: "server"` では必須、`"client"` では推奨）。検証フェーズはこれらのフィールドだけで実行できる。`"discovered"` として追加し、領域を `"inventoried"` にしてマニフェストを書き込み、繰り返す。
   - **サブエージェントの分散:** サブエージェントは `manifest.json` を書き込まない。それぞれが次の内容だけを書く。
     各自の `areas/<id>.tools.json` 分割ファイル — スキーマ
     `{ "webmcpifyShard": 3, "area": "<id>", "tools": [ /* full v3 tool entries */ ] }`,
     アトミックに書き込む（tmp + rename）。コーディネーターが分割結果を順番にマニフェストへ統合してから削除する。再開時は再割り当ての前に既存の分割結果を最初に統合する（再開ルール）。
3. **終了:** `pending` の領域をなくし、完全性確認を 1 回行う。アプリのナビゲーションをたどり、「表示されるユーザー操作に抜けがないか」を確認する。

## ゲート — マニフェスト承認（主なチェックポイント）

マニフェストを簡潔に提示する（id、領域、種別、状態変更の有無、優先度、1 行の説明）。大規模アプリでは領域ごとに提示する。可能なら 1 回のやり取りで人間に決定を求める:

1. どのツールを `approved` または `rejected` にするかを決める（**`rejected` は終端状態**であり、後続の全フェーズと終了条件から除外する）。`mutating: "server"` ツールには個別の承認が必要で、`approval` に記録する。`mutating: "client"` ツールは一括承認できる。
2. **コミット方針**: `commit-per-batch`（各統合バッチをコミットし、巻き戻し可能。クリーンなベースラインに推奨）または `no-commit`（人間がレビューしてコミットできるよう変更を未コミットで残す）を `pipeline.commitPolicy` に設定する。`.webmcpify/` 自体をコミットするかも決める（統合を記録するため yes を推奨）→ `pipeline.commitWebmcpifyDir`。
3. `pipeline.blockers` の各項目（例: アプリが起動しない）。ツールの検証で実運用への副作用が避けられない場合（例: Origin 許可リストのエンドポイントを使うメーラー）は、ここで承認を得て `approval.productionSideEffect` に記録する。VERIFY を参照する。

提示する前に、すべての状態変更ツールへ `references/security.md` を適用する。

## フェーズ 2 — INTEGRATE（ループ）

最初に一度だけ設定し、作成または変更したファイルの **パス** を
`pipeline.setup`（例: `runtimeVendored: ["src/webmcp/webmcpify.ts", ...]`）に記録する:
この Skill の `templates/`（`webmcpify.ts`、または
非 TS プロジェクト用の `webmcpify.js`、TS 用の `webmcp.d.ts`、React TSX 用の
`webmcp-jsx.d.ts`）からランタイムを同梱する（MIT ヘッダー全体を保持し、詳細は
`references/runtime.md` を参照する）。対象
README（`originTrialNoted`）に記録する。その後ループする:

1. 次の `approved` ツールのバッチを選ぶ（1 領域または 5 ツール以下）。
2. `references/integrate.md` に従って実装する。標準
   HTML フォーム（フレームワークでレンダリングされたもの、fetch でインターセプトされるものを含む）;
   フォーム以外または制御状態の操作には、同梱したランタイムで命令的に登録する。
3. ビルドと型チェックを行い、バッチによって壊れたものだけを修正する。
4. ツールを `"integrated"` としてマークし、マニフェストを書き込む。`commit-per-batch` では、
   ステージ前に **クリーンな index** を要求する（無関係なステージ済み変更があれば停止して明示する）。バッチのファイルだけをパスでステージし、`git add -A`、`-u`、`.`、`commit -a` は決して使わない。`feat(webmcp): expose <ids> (webmcpify)` としてコミットする。コミット SHA は **次の** マニフェスト書き込み時に `batchCommit` へ記録する（1 コミット後。マニフェストには自分自身のコミット SHA を含められない）。以前のバッチ コミットを amend しない。
5. `approved` ツールがなくなるまで繰り返す。

## フェーズ 3 — VERIFY（ループ）

`references/verify.md` に従い `templates/webmcp.spec.ts` から一度だけ設定する（実際のヘッド付き Chrome、レガシー フォールバック調査を伴う本番の `getTools()`／`executeTool()` サーフェイス）。
その後、各 `integrated` ツールについて、マニフェストの `route`、`auth`、
`examples`、`expect`、`annotations` フィールドを使い、次を確認する:

- 期待するスキーマでツールが登録されていることを検証する（列挙された `inputSchema` は *文字列化された* JSON Schema なので、比較前に解析する）。同時にマニフェストの `annotations` も検証する。
- 有効な例を実行し（状態変更ツールでは開発／テスト データだけを使い、その後 `cleanup` を実行する）、無効な例も 1 つ実行する（パラメーターのない読み取りツールで `invalid: null` の場合は二重結果を検証する。`references/verify.md` を参照）。
- `expect` に従って返された結果 **と** その後の UI 状態を検証する（UI の **差分**、または実行結果が `null` の場合は `expect.navigation`）。

成功したら `"verified"`、失敗したら `"failed"` と失敗内容を記録する。ロール単位のツールでは、`auth` に記載された各ロールについて、対応する
`app.authFixtures` のエントリ。

**実運用への副作用に関する方針** — ツールの検証で実運用への副作用が避けられない場合（例: 実際にメールが送信される場合）は、次の 3 つすべてが必要である:
(1) ゲートで人間が承認し、`approval.productionSideEffect` に記録していること、
(2) すべてのテスト ペイロードに `[webmcpify verification]` を付けること、
(3) 副作用を `report.md` に記載すること。記録された承認がない場合は実運用経路を実行せず、ブロッカーの注記を付けてツールを `skipped` にする。

## フェーズ 4 — HEAL（ループ）

いずれかのツールが `"failed"` の間は、`references/heal.md` で診断し、そのツールの統合 **だけ** を修正する（**実装だけ**の修正）。修正によって承認済み契約（スキーマ、説明、`mutating` の分類、`annotations`、`expect`）が変わる場合は、マニフェストを黙って変更せず、ゲートに戻って再承認を得る。検証失敗の発生時を試行 0 とし、修正サイクルごとに `attempts` を増やして再検証する。`attempts` = 3 では、明確なブロッカー注記を付けて `"skipped"` にする（黙って削除せず、人間へ明示的にエスカレーションする）。差分を広げたり、合格を偽装したりしない。修復後は、状態が `integrated` または `verified` の **すべて**のツールをもう一度検証する（1 つの修正が別のツールを壊す可能性があるため）。

**終了:** すべてのツールが `verified`、`skipped`、または `rejected` であり、ビルドが成功している。

## 最終 — AUDIT とレポート

1. **差分監査（フラグのみ、自動的に巻き戻さない）:** パイプラインの変更を収集する。
   `git diff <baselineSha>..HEAD` に加えて、`commit-per-batch` では index と未追跡ファイルを、`no-commit` では作業ツリー、index、未追跡ファイルを対象にする。
   すべての hunk をマニフェスト エントリまたは記録された `pipeline.setup` パスに対応付ける。対応付けられない hunk は、ファイル／行と推奨する扱いを付けて **レポートにフラグを立てる**。自分で巻き戻してはならない。`baselineDirty` ファイル内の hunk は変更不可で、フラグだけを立てる。`baselineSha` がない場合は、マニフェストの `source` フィールドと `pipeline.setup` パスに記載されたファイルを監査する（v2→v3 移行で設定項目が `null` と記録されている場合は、そのファイルをフラグのみの対象とする）。
2. `.webmcpify/report.md` を確定する: 領域ごとのツール範囲、スキップまたは拒否したツールと理由、セキュリティ注記（存在する状態変更ツール、それを保護する仕組み、記録された実運用への副作用）、手動テスト方法（フラグ、DevTools の WebMCP ペイン、インスペクター拡張機能）、人間の対応が必要なすべてのブロッカーを含める。
3. 人間に、公開したもの、スキップしたものとその理由、試す方法を伝える。

## 参照（最初にすべて読むのではなく、必要に応じて読む）

- `references/inventory.md` — 領域マッピング、命名／スキーマ規約、予算／重複
- `references/integrate.md` — 技術スタックごとの宣言的および命令的パターン
- `references/runtime.md` — `templates/` ランタイムの同梱と接続
- `references/verify.md` — ハーネス設定: フラグ、サーフェイス、Playwright／Puppeteer、評価
- `references/heal.md` — 失敗分類から修正への対応
- `references/security.md` — セキュリティ チェックリスト（ゲート前と監査時に適用）

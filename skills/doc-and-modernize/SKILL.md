---
name: doc-and-modernize
description: 'ローカルに clone 済みのコードベースを対象とする、関連した 2 つのワークフローを 1 つにまとめた Skill。ドキュメントモードでは、主にディスク上のファイルを読むローカル優先の方法で、包括的かつ検証可能な単一のアーキテクチャ文書を作成する。コードベースの理解、マッピング、文書化、調査、オンボーディング、アーキテクチャの詳細調査、システム設計図の作成に使用する。モダナイゼーションモードでは、legacy system の modernize、migrate、upgrade、rewrite に向けた段階的な計画を生成する。アーキテクチャ文書がなければ、最初にドキュメントモードを実行し、そのまま計画作成まで続ける。legacy stack が動作不能な可能性を前提に、時間制限付き feasibility spike を行い、最初から完全に green な legacy CI gate を要求せず、safety ladder 上で達成可能な最上位を選ぶ。'
---

# ドキュメント作成とモダナイゼーション

ユーザーがローカルに checkout 済みのリポジトリ向けに、相互補完する 2 つのワークフローを提供します。

- **ドキュメントモード** — ディスク上のコードから、引用付きの決定版アーキテクチャ文書を 1 つ作成する。オンボーディング、システム設計の把握、モダナイゼーションの根拠作りに適する。
- **モダナイゼーションモード** — アーキテクチャを、legacy system の upgrade、migrate、rewrite に向けた段階的で安全性を調整した計画へ変換する。

## モード選択

- コードベースの**理解、文書化、マッピング、調査、オンボーディング**が目的なら、**ドキュメントモード**を実行する。
- システムの **modernize、migrate、upgrade、rewrite** が目的なら、**モダナイゼーションモード**を実行する。アーキテクチャ文書がなければ、同じ処理内で先にドキュメントモードを実行し、そのまま計画へ進む。

迷った場合は、両モードの監査済み根拠となるアーキテクチャ文書を先に作成します。

## ドキュメントモード

ローカルに checkout 済みのリポジトリについて、引用付きの決定版アーキテクチャ文書を 1 つ生成します。新しいエンジニアへオンボーディング資料として渡せる広さ、難所を理解できる深さ、すべての主張をディスク上のファイルへたどれる信頼性を備えた文書を目指します。

### ローカル優先の理由

GitHub API や Web ではなくローカル checkout を読むことを意図的な既定値とします。高速で無料、rate limit がなく、remote の `main` ではなく**目の前の正確なコード**を説明できるためです。star 数、CI の全履歴、sibling repository など remote にしかない事実は見えません。それらは推測せず、範囲外または `[UNVERIFIED]` とします。

ローカル優先は remote を一切使わないという意味ではありません。ディスクから判断できず、かつ文書に重要な事実に限り、Web/API を**最後の手段**として使います。利用した場合は `[UNVERIFIED]` や remote 由来であることを明示します。

### ワークフロー

1. **最初に識別情報を確立する。** `git remote -v`、`git branch --show-current`、`git log -1` を実行し、remote、branch、commit に文書を結び付ける。remote URL に埋め込まれた credential/token は記録前に削除する。
2. **推測せず検出する。** 実際の manifest（`go.mod`、`package.json`、`Cargo.toml`、`pyproject.toml`、`pom.xml` など）、`Makefile`/task runner、CI 構成、`AGENTS.md`、`CONTRIBUTING`、`README`、`docs/` を読む。技術スタックとコマンドは framework の事前知識ではなく、これらを正本とする。
3. **全体を地図化してから深掘りする。** まず後述の 3 観点でリポジトリ全体を把握し、その後、最も難しい 2～3 個の subsystem を詳しく調べる。
4. **調査しながら検証する。** 引用するファイルを実際に開き、行番号を示す場合はその行を読んでおく。裏付けのない主張より、省略の方がよい。

### 出力構造

次のセクションを順番どおりに含む**単一の Markdown ファイル**を作成します。実際のプロジェクトに合わせて見出しは調整できますが、3 観点の構成と検証規律は維持します。

#### パート 1 — リポジトリ全体の技術的詳細

- リポジトリの概要。README を引用して 1 段落で説明する。
- 技術スタック検出表: layer | technology | evidence（file+line）。
- backend、frontend、CLI など、該当する entry point。
- **コマンドと検証の棚卸し**: `command | purpose | evidence` 表。build、run/serve、test、単一 test、lint、format、存在する場合は typecheck、end-to-end/smoke、contract、そのほかの gate と、それを実行する CI workflow と trigger を扱う。task runner、manifest、CI 構成で検証し、推測しない。
- CI が単に実行されるだけか、required status check / branch protection として merge を阻止するかも記録する。ローカルから通常は判断できないため、ユーザーに確認するか `[UNVERIFIED]` とする。
- 主要ディレクトリの構成と、各ディレクトリの目的。
- **デプロイと runtime の表面**: 実行時の language/runtime と backing service の version を固定するすべての場所を表にする。container base image、`docker-compose*`、CI runner image、`setup-*` version、`engines`、`.nvmrc`、`.tool-versions`、`runtime.txt`、serverless runtime、database/cache/broker/search の image tag を file+line で引用する。build runtime と run runtime のずれを明示する。
- **EOL / 保守停止依存関係の走査**: EOL、保守停止、次の major で削除された framework、runtime、base image、library を示す。必要に応じて `[INFERRED]` / `[UNVERIFIED]` とする。
- data/storage layer、API、plugin/extension、background job、CI/CD、test。

#### パート 2 — コンテキストと ecosystem

- ローカル checkout の識別表（remote、branch、HEAD commit、version、license）。
- リポジトリ固有の agent/contributor 文書と、その規則。
- test watch mode、遅い build、commit 必須の codegen、pre-commit hook などの開発上の注意点。すべて引用する。
- ディスクから確認できる範囲で、broader ecosystem や sibling service との関係を示す。remote の雑学を持ち込まない。

#### パート 3 — アーキテクチャブループリント

- パート 1 の表を参照できる技術スタック要約。
- Mermaid による C4 形式の図: Level 1 system context、Level 2 container、Level 3 の代表的な request/component lifecycle。
- layer と依存規則、およびそれを強制する仕組み。
- 横断的関心事の表: auth、config、logging、metrics/tracing、secret、error handling、feature flag と、それぞれの場所と根拠。
- コードと文書から復元したアーキテクチャ意思決定記録。
- CI gate、codegen 検証、CODEOWNERS、review gate、互換性規則などの governance と enforcement。
- 機能追加ガイドと一般的な落とし穴。

#### subsystem の詳細調査

evaluation/scheduling engine、plugin loader pipeline、state machine、rendering/migration framework など、新しいエンジニアが最も理解しにくい 2～3 個の subsystem を選びます。それぞれについて内部構造、lifecycle/state machine、主要な型、データフローをローカルの file+line 引用と小さな Mermaid diagram で説明します。

#### 信頼度評価

主要な主張領域を **High / Inferred / Unverified** で評価する表を作り、再確認が必要な箇所を明示します。

#### 脚注 — ローカルファイルの引用

文書の根拠となる主要なローカルファイルと、それが何を裏付けるかを 1 行ずつ記載します。

### 信頼できる文書にする規則

- 自明でない主張はすべてローカルパスへ引用し、具体的な値を固定する場合は行番号も付ける（`pkg/server/server.go#L39-L41`）。
- 不確実性を正直に示す。推論は `[INFERRED]`、未確認情報は `[UNVERIFIED]`。
- 矛盾を並べるだけにせず、コードを読んで解決し、`[Resolved contradiction]` と理由を示す。
- FE/BE PR の分離、双方向の storage compatibility、additive-only protobuf change など、互換性と deployment cadence の規則を記載する。
- 「多数」ではなく、directory listing から確認した「73 service package」「89 workflow file」のような正確な件数を優先する。
- checkout の範囲を守り、外部情報は明確にラベル付けする。

## モダナイゼーションモード

legacy codebase に対して、何を、なぜ、どの順序で、どの方法で modernize するかを示す完全で実行可能な計画を生成します。アーキテクチャ文書がなければ、先にドキュメントモードで作成します。

**動作不能を既定として考えます。** EOL runtime、build 不能な native module、廃止された package mirror、放棄された framework がある可能性を前提にします。legacy toolchain の完全復旧と green CI を最初から要求せず、時間制限付き feasibility spike を実施し、実際の状態に合う migration strategy と safety strategy を選びます。

計画の中心は、component ごとに build、run、test が再び可能になる**Testability Milestone**、達成可能な最上位を選ぶ**safety ladder**、CI を初めて構築する phase を示す**CI Milestone**です。CI を required check にする操作は、人が行う必要があります。

### 前提条件

1. ドキュメントモードの成果物、ユーザーが示した README / ARCHITECTURE.md、または十分な会話コンテキストがあれば、それを使う。
2. なければ、同じ処理内で先にドキュメントモードを実行し、レビュー待ちで止まらず計画作成へ進む。

成果物は、監査済み根拠となるアーキテクチャ文書と、将来の作業を示すモダナイゼーション計画の 2 つです。

計画前に**コマンドと検証の棚卸し**があることを確認します。build / run / test / lint / typecheck / e2e / contract の canonical command と CI gate を実際の task runner、manifest、CI 構成で検証し、存在しないコマンドを創作しません。

### フェーズ 1: 現状評価

アーキテクチャ文書から、技術スタック、機能/domain map、既知の痛点、deployment と infrastructure を抽出します。すべての source file を読み直さず、特定の詳細を確認する必要がある場合だけ対象ファイルを開きます。

### フェーズ 2: Feasibility Spike、戦略分岐、Safety Ladder

target architecture や phase を提案する前に実施します。component/deployable unit ごとに、時間制限（例: 1 日）を設けて次を確認します。

- committed lockfile から手動 patch なしで依存関係を install できるか
- 現在サポートされる toolchain で native/build step が成功するか
- boot/start できるか
- test runner が動き、意味のある test が 1 件以上成功するか

時間切れ時点の実測結果を記録し、動かないものを何週間も復旧し続けません。

#### Testability Milestone

component ごとに、次の 4 条件を同時に初めて満たす phase を明記します。

1. サポート対象の非 EOL runtime で動く。
2. lockfile から手動 patch なしで依存関係を install できる。
3. 現在の toolchain で native/build step が成功する。
4. CI で test runner が動き、意味のある test が 1 件以上成功する。

Testability Milestone 前を **pre-testability（dark）**、後を **post-testability（lit）** とします。dark phase に自動 test gate を要求してはいけません。lit phase で初めて本物の CI、characterization test、e2e を gate にできます。

#### migration strategy

- **A: Freeze-then-lift** — 旧アプリを現状のまま safety net で覆い、その下で upgrade する。許容コストで復旧できる場合だけ選ぶ。
- **B: Beachhead-then-expand（walking skeleton）** — 動かない旧環境全体を覆わず、最小の end-to-end slice を modern stack に移し、build、boot、test を可能にしてから範囲を拡大する。動かないアプリの既定戦略。

旧 stack がまったく build/run できない場合は、旧環境の characterization test を諦め、旧コードや出力を参照 oracle として target stack 上に test を構築します。

#### safety ladder

- **L4 — 完全な自動 gate:** CI で lint + unit + characterization + e2e が green。
- **L3 — 部分 gate:** 一部 suite が green で lockfile と CI があり、残りは名前付きで quarantine。
- **L2 — characterization / golden-master のみ:** CI では動かないが I/O snapshot や behavior diff を取得。
- **L1 — 可逆性ベース:** runnable test がなく、小さく戻せる変更、strangler/parallel-run、smoke checklist、review で守る。
- **L0 — safety net 不可:** 旧コードを仕様とする rewrite、または archive。

安全性は test だけではありません。可逆性、分離、動作中の旧 system を oracle とする record/replay、人の review と domain knowledge も使います。unit ではなく、HTTP endpoint、DB schema/query、file/wire format、CLI output、protocol などの**動作境界**を固定します。

oracle の優先順位:
1. 許可された動作中の prod/VM/old container から real I/O を記録して replay。
2. 動かない場合は old source を仕様とし、prod log、DB dump、docs、ticket で補う。
3. 外部参照がない/許可されない場合は、Testability Milestone の最初の正常動作を**自己凍結 golden master**として保存する。ただし、後続変更の自己整合性は保証しても最初の出力の正しさは保証しないという残存リスクを明記する。

production 利用、実ユーザー、旧 system を oracle として使えるかを考慮し、regression cost に見合う rung を選びます。

#### CI Milestone

CI を初めて構築する phase をロードマップで明記します。CI は各 component の最初の lit phase、つまり Testability Milestone と同時か直後に構築します。

1. agent は `.github/workflows/*.yml`、`.gitlab-ci.yml`、Azure Pipelines などの workflow file を作成できる。
2. required status check、branch protection、merge-request approval rule として**強制する操作は人が platform UI で行う**。

人が設定するまでは CI は PR で実行されても merge を阻止しません。この操作を phase の exit criteria と「ステークホルダーに必要な判断」に明示します。

### フェーズ 2.5: hazard catalog による全 phase の red-team

実装前に `references/migration-hazards.md` の H1～H8 を各 phase に照合します。各 hazard について、該当有無を判断し、実リポジトリで detection probe を実行し、必要な action を task と exit criteria に組み込みます。検出されたものだけでなく、確認して問題なしとした hazard も記録します。

### フェーズ 3: Target Architecture の推奨

各 component/dependency について、影響が小さい順に評価し、問題を解決できる最初の段階で止めます。

1. **その場で upgrade** — major version を上げて破壊的変更を修正できるか。
2. **dependency を交換** — 保守停止 library を、同様の interface を持つ保守中の代替へ交換できるか。
3. **wrap/adapt（Strangler Fig）** — 安定した interface を前に置き、内部を段階的に置換できるか。
4. **rewrite** — upgrade path がなく、必要機能に構造的に対応できない、または upgrade cost が rewrite cost を上回る場合だけ。すべての rewrite に明示的な根拠を付ける。
5. **remove** — 未使用、非推奨、ほかの system に置換済みの機能。利用状況を確認してから提案する。

保守的に判断します。古い framework 上でも動く system は、新しい stack 上の未完成 rewrite より優れています。

mechanical migration では、`references/migration-hazards.md` に対応する次を必ず扱います。

- **H1:** dependency family を除去する際、すべての manifest を検索し、移行または quarantine が必要な依存先を完全に列挙する。
- **H2:** framework major bump に伴う namespace rename、削除 API、test engine、config key の変更を個別 task とし、OpenRewrite、jscodeshift/react-codemod、`2to3`/`pyupgrade` などの codemod を優先する。
- **H3:** runtime major bump と同じ phase で、base image、`docker-compose`、CI runner、`engines`、`.nvmrc`、`.tool-versions`、serverless runtime を更新する。

Target Architecture には、推奨技術スタック、architecture pattern、維持/upgrade/swap/wrap/rewrite/remove の分類、各判断の inline ADR を含めます。

```markdown
#### ADR: [判断のタイトル]
- **コンテキスト:** [判断が必要な理由]
- **判断:** [選択内容と decision framework 上の段階]
- **検討した代替案:** [ほかの案と不採用理由]
- **結果:** [受け入れる tradeoff]
```

### フェーズ 4: 機能ごとの migration 分析

各主要機能/domain について、現在の実装、A/B 戦略と tactic、Testability Milestone と safety rung、依存関係と coupling、T-shirt size による労力見積もり、risk、oracle/seam contract に基づく acceptance criteria を記載します。

### フェーズ 5: 段階的な実装計画

各 phase は独立して deploy 可能にします。次の phase へ進む前に、客観的で実行済みの Verification & Exit Criteria を満たします。

- lit phase: 実行可能な command と green CI が authoritative signal。
- dark phase: test gate ではなく、取得済み oracle snapshot、可逆性、smoke checklist、review など、達成可能な safety rung の根拠を使う。

Strategy A で復旧可能な component の最初の phase は、seam の characterization/golden/contract test、green CI、固定依存関係と lockfile、既知の正常 baseline を追加し、意図的な mutation で test が失敗することを確認して戻します。

Strategy B の動かない component の最初の phase は、最小 slice で Testability Milestone に到達し、旧 system の oracle contract と照合します。動かない旧環境全体を test しようとしません。

各 phase は次の構造にします。

```markdown
### フェーズ N: [名前]（T-shirt size: M）

**目標:** [1 文]
**regime:** [pre-testability（dark）| post-testability（lit）] — component ごと
**safety rung:** [L0～L4。L4 未満は残存リスクも記載]
**前提条件:** [先に完了すべき phase]
**期間見積もり:** [相対値。例: 2～4 sprint]

#### タスク
| ID | タスク | component | 依存先 |
|----|------|-----------|------------|
| N.1 | ... | ... | — |
| N.2 | ... | ... | N.1 |

#### リスクと軽減策
- **リスク:** ... → **軽減策:** ...

#### 決定済み事項
- [実装に必要な下位判断をすべて解決して記載する。除外項目は dropped と deferred を区別する。]

#### 検証と完了基準
- [ ] [regime に適した客観的な基準]
- [ ] [動作維持が目的なら、選択した oracle との parity/characterization check]
- [ ] [純粋な追加なら、behavior/dependency/logic が変わっていないこと]
- [ ] [L4 未満なら残存リスクと、それを解消する後続 phase]
```

順序付けの原則:
- component ごとの Testability Milestone を先に決め、最小 slice で早期到達する。
- Testability Milestone 前に自動 test gate を要求しない。
- CI Milestone を明記し、required check の強制は人の操作とする。
- behavior change 前に達成可能な最高の safety rung を確立する。
- 次に infrastructure と横断的関心事、その後に高リスク/高価値機能、最後に低リスク機能を扱う。
- data migration は rollback plan を備えた独立 phase にする。

### フェーズ 6: 実行 governance

- phase ごとに branch と PR を作り、既定 branch へ直接 commit しない。
- phase branch は trunk から作り、次の phase 前に前 phase を trunk へ merge する。sibling phase branch を基点に積み重ねない（H7）。
- trunk 名を確認し、古い既定 branch は「履歴のみ — 対象外」とする。
- lit phase は green CI、dark phase は safety rung の根拠で gate する。
- CI Milestone で workflow を作り、required status check / branch protection の有効化を人へ引き継ぐ。
- interface を維持し、各 phase 後も system を実行可能にする。rollback は前 version の再 deploy とする。
- `MODERNIZATION_PLAN.md` を生きた計画として更新し、✅ complete / ⏭️ descoped / 🗑️ dropped、判断、safety rung、残存リスクを記録する。
- topology、module、branch、command、endpoint を変える phase では、`.github/copilot-instructions.md`、README、関連一覧も同じ PR で更新する（H8）。
- 実装前に各 phase を H1～H8 で red-team し、確認結果を記録する。
- `references/copilot-instructions.template.md` から、canonical command と regime-aware gate、branch/PR rule を含む `.github/copilot-instructions.md` を生成する。既存ファイルは上書きせず merge するか、`.github/copilot-instructions.modernization.md` として作成して統合を依頼する。

### フェーズ 7: Migration Safety Net

- **feature flag:** old/new の共存方法。
- **data migration:** schema change、backfill、dual-write。persisted volume を持つ stateful data-store の major upgrade（H5）は単なる image tag 更新にせず、段階的/feature-compatibility-version upgrade と rollback、または ephemeral/demo data の明示的な破壊的 reset と再 seed のどちらかを選ぶ。
- **rollback plan:** phase ごとの復元方法。
- **transitional-insecure-state register（H6）:** permit-all shim、CSRF 無効化、open endpoint、placeholder secret など、途中で意図的に弱める状態について、理由、解消 phase、残存リスク、phase N まで仕様上必要という注記を記録する。
- **oracle と seam contract:** running instance、recorded I/O、golden snapshot、または self-frozen golden master と比較方法。
- **test strategy:** target stack 上で Testability Milestone 到達後に追加する test と、quarantine を継続する範囲。
- **observability:** 新旧 system の同等性を示す metric/alert。

## 出力構造

主成果物 `MODERNIZATION_PLAN.md` に次を含めます。

1. エグゼクティブサマリー
2. アーキテクチャ文書に基づく現状評価
3. component ごとの feasibility spike、A/B 戦略、Testability Milestone、safety rung、L4 未満の残存リスク、および計画全体の CI Milestone と人による強制設定の注記
4. ADR 付き Target Architecture
5. 機能ごとの migration 分析
6. regime-aware な gate を持つ段階的実装計画
7. 実行 governance
8. oracle、seam contract、flag、rollback、observability を含む migration safety net
9. required check / branch protection など、agent が実行できない platform 構成を含むステークホルダーの未決事項

さらに `references/copilot-instructions.template.md` から `.github/copilot-instructions.md` を生成します。既存ファイルは上書きしません。

## 規則

- 現状を説明するときはアーキテクチャ文書を引用し、計画は将来の作業に集中させる。
- 具体的な推奨を示し、選択肢を並べるだけにしない。
- 一度にすべてを変える非現実的な計画にせず、phase 1 と将来検討を分ける。
- phase 内の実装判断は計画時に解決し、`dropped` と `deferred` を区別する。`[DECISION NEEDED]` は budget、team size、product direction、timeline など本物の stakeholder 判断に限る。
- 問題なく動く component は「変更しない」と判断できる。
- legacy CI の完全な green を前提にせず、feasibility spike 後に達成可能な safety rung を選び、低い rung への変更を失敗ではなく残存リスク付きの正式な判断として扱う。
- component ごとの Testability Milestone を明記し、それ以前に自動 test gate を要求しない。
- CI Milestone を明記し、enforced required check / branch protection は人の platform 操作として user action にする。
- unit ではなく seam を固定し、running instance → recorded I/O → code-as-spec → self-frozen golden master の順で oracle を選ぶ。
- project 固有の package manager、test runner、CI を使い、特定 stack を仮定しない。
- 実装前に各 phase を `references/migration-hazards.md` の H1～H8 で red-team し、task と exit criteria に反映する。

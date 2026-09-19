---
name: copilot-pr-autopilot
description: 'CopilotがPRに多数のレビューコメントを残し、修正、返信、解決、再依頼を繰り返すたびに新たなコメントが増える状況で、レビュー対応ループを自動運転する。GraphQLでCopilot Code Reviewを自動起動し、すべての未解決スレッドを修正、却下、エスカレーションの基準で分類する。リポジトリのbuild、test、lint規約に従う修正サブエージェントを並列実行し、反復ごとにコミットして、push済みSHAを示しながら返信と解決を行う。HEADのレビューが完了し、エージェントの返信待ちスレッドがゼロになるまで再起動する。リポジトリ非依存で、gh CLIとPowerShellを使用する。完全自動運転にはTriageまたはWrite権限が必要で、外部PR作成者は単一反復モードと手動再起動を使う。'
---

# Copilot PR自動運転

Copilotの各指摘へエージェントが返信（修正の確認、理由を添えた却下、またはユーザーへの
明示的なエスカレーション）するまで、GitHub pull requestに対するCopilot code reviewを
反復実行する。未解決のスレッドが残る場合、それらは人間のmerge担当者へ意図的に
引き継いだものであり、ループの失敗ではない。リポジトリには依存せず、Copilot Code Reviewが
有効な任意のrepoで動作する。`gh` CLIをインストールして認証済みのマシンで実行する
（「前提条件」を参照）。

## このSkillを使う場合

- ユーザーがPRについて「Copilot reviewを依頼して」または「Copilot review loopを実行して」と依頼した場合。
- PRが機能的に完成しており、ユーザーが自動reviewを反復して最終的な正確性を確認したい場合。
- PRに対する以前のCopilot reviewで、分類、修正、返信、解決が必要な未解決スレッドが残っている場合。

## このSkillを使わない場合

- PRの設計が進行中の場合。構造が安定するまで待つ。そうしないと、ラウンドごとに指摘が変動する。
- ユーザーがCopilotではなく、人間のreviewerからのフィードバックを求めている場合。

## 前提条件

- `gh` CLIがインストールされ、対象リポジトリに対して認証済みであること。
- PowerShellがPATHにあること。Windows PowerShell 5.1以降（`powershell.exe`）と
  PowerShell 7以降（`pwsh`）の両方を検証済み。
- 主な用途はCopilot Code Reviewである（`01-request-review.ps1` はGraphQLの
  `requestReviewsByLogin` を使ってCopilotを起動する）。ただし**必須条件ではない**。
  repoまたはaccountでCopilotが有効でないため `01-request-review.ps1` が失敗しても、
  エージェントは起動と待機を省略し、手順3〜8を単一反復として1回実行することで、既存の
  review thread（人間、advanced-securityなど）を完了まで処理できる。「Copilotが利用不可」
  かどうかは自動検出されない。起動失敗後にエージェントが判断する（APIの状態だけでは、
  「Copilotが無効」「Copilotは有効だが未起動」「Copilotが起動済み」をscriptが確実に
  区別できないため）。

### 権限: 完全なループを実行できるユーザー

複数ラウンドの完全自動運転（手順1 → 9 → 1）には、対象repoへの **TriageまたはWrite** 権限が必要である。Copilot botをreviewerとして追加するGitHub唯一の公開API（`requestReviewsByLogin`）が、この権限を要求するためである。このPRのcommit履歴で公開RESTおよびGraphQLを検証した結果、write権限なしでbot reviewerを追加できる公開APIの経路は存在しない。

| ユーザーの立場 | 利用できる機能 |
|---|---|
| **Triage / Write権限を持つrepo collaborator** | 完全なループ: `01` でCopilotを起動し、`02` で待機、`04`〜`08` で分類、修正、返信を行い、`01` へ戻る。操作不要。 |
| **外部PR作成者（write権限なし）** | `01` は、対処方法を明示したエラーを返す。`-SingleIteration` modeを使い、現在の指摘すべてへ1回で対応する。その後、Copilotの横にあるUIの🔄をクリックするか、**実質的なcommitをpushする**（多くのrepoでは `synchronize` eventでCopilotが自動起動する）。その後、`02` を再実行して確認する。 |

単一反復modeでは、`OpenThreadsAwaitingReply == 0`（エージェント側の作業完了）の場合に限り、ループの収束値が `Converged: true` になる。その後、maintainer側で再起動すると追加ラウンドが進行する。

すべてのscriptは [scripts/_lib.ps1](scripts/_lib.ps1) をdot-sourceし、読み込み時に
`Assert-GhReady` を実行する。`gh` がない、または `gh auth status` が失敗した場合、
scriptは**作業を始める前に**停止し、インストールコマンドと `gh auth login` を示す
実行可能な単一のエラーメッセージを出す。エージェントはそのメッセージをそのまま
ユーザーへ提示してループを停止し、再試行や回避をしてはならない。

## 手順ごとのWorkflow

> **ループ:** 手順1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9を実行し、`Converged: false` の場合は**手順1へ戻る**。手順9が `Converged: true` を返すまで1〜9のラウンドを繰り返す。その後に限り手順10を1回実行し、`task_complete` を呼び出す。**10ラウンドごとに、親エージェントはループへ戻る前に[ラウンド上限の要約ゲート](references/09-convergence.md#round-cap--recap-gate-circuit-breaker)を実行する**。それまでの全ラウンドを要約し、ループがPR本来の範囲から逸脱していれば停止する。

各ラウンドで手順1〜9を実行し、手順10は収束後に一度だけ行うcleanupである。親エージェントが調整し、各sub-agent手順は上限付きの新しいcontextで実行する。共通protocol（時間制限、延長、単一反復fallback）は [orchestration.md](references/orchestration.md) を参照する。

1. **reviewを依頼**（親）— [01-request-review.md](references/01-request-review.md)を参照
2. **reviewを待機**（sub-agent、上限20分）— [02-wait.md](references/02-wait.md)を参照
3. **未解決threadの一覧化と分類**（sub-agent、5分）— [03-list-threads.md](references/03-list-threads.md)を参照
4. **トリアージ**（sub-agent、5 thread以下ごとに5分）— [04-triage.md](references/04-triage.md)を参照
5. **修正**（sub-agent、最大5体を並列、各5分）— [05-fix.md](references/05-fix.md)を参照
6. **repoの規約に従ってbuildとtest**（sub-agent、10分）— [06-build-test.md](references/06-build-test.md)を参照
7. **commitとpush**（親）— [07-commit-push.md](references/07-commit-push.md)を参照
8. **必ず返信し、条件に応じて解決**（sub-agentが下書きし、親が投稿）— [08-reply-resolve.md](references/08-reply-resolve.md)を参照
9. **収束を確認**（sub-agent、3分）— [09-convergence.md](references/09-convergence.md)を参照
   - **`Converged: false` → 手順1へ戻る**。再起動、待機、一覧化、分類、修正、push、返信、再確認を行う。各ラウンドでは前ラウンドのHEADに対するCopilotの指摘へ対応する。Copilotから新しい指摘がなく、かつすべての未解決threadへエージェントが返信した時点でループを終了する。
   - **`Converged: true` → ループを終了**し、手順10を1回実行して、証拠とともに `task_complete` を呼び出す。
   - **10ラウンドごと（10、20、30…）→ ループへ戻る前に[ラウンド上限の要約ゲート](references/09-convergence.md#round-cap--recap-gate-circuit-breaker)を実行する。** PR本来の範囲に照らして、それまでの**全**ラウンドを要約し、**CONTINUE**、**REVERT-AND-SHIP**（逸脱したcommitを破棄し、範囲内のcommitを出荷）、**HAND-OFF**（ユーザーへエスカレーション）のいずれかを選ぶ。これは、bot reviewの暴走ループを止めるcircuit breakerである。
10. **古いthreadをcleanup**（親、収束後に1回）— [10-cleanup.md](references/10-cleanup.md)を参照

収束は [scripts/02-check-review-status.ps1](scripts/02-check-review-status.ps1) が単一の真偽値 `Converged: true` として計算する。trueが返るまで `task_complete` を呼び出してはならない。完了メッセージに証拠（`HeadOid`、`LatestCopilotReview.commitOid`、`submittedAt`）を出力する。

## 注意点

同梱scriptは、厳密な正確性の不変条件（`copilot_work_started` event idによる起動確認、HEAD一致・返信待ちゼロ・HEAD上のreviewを要求する `Converged`、単一反復fallbackの意味、PR状態のguard）を適用する。これらを信頼し、独自に再導出しない。以下はscriptが判断できない事項を扱う。

- **すべての未解決threadへ返信し、ループが処置を所有する場合だけ解決する。** `fix` と `decline` のthreadは返信して解決する。`escalate-to-user` のthreadは分析を返信するが、人間のmerge担当者が対応できるようOPENのままにする（`08-reply-and-resolve.ps1 -NoResolve`）。[08-reply-resolve.md](references/08-reply-resolve.md)を参照する。
- **Copilot threadはループが所有し、人間、advanced-security、その他のbotによるthreadは既定で `escalate-to-user` とする。** 人間のreview threadを自動解決すると、未対応の懸念が隠れる可能性がある。基準は [04-triage.md](references/04-triage.md)を参照する。
- **PRごとではなく、ラウンドごとに焦点を絞ったcommitを1つ作る。** 複数ラウンドをまとめると、どの指摘がどの変更を促したかという監査証跡が失われ、`git bisect` が機能しなくなる。[07-commit-push.md](references/07-commit-push.md)を参照する。
- **修正をpushする前に、repo独自のコマンドでbuild、test、lintを行う**（`CONTRIBUTING`、`AGENTS`、`README`、`package.json`、`Makefile` に従う）。検出手順は [06-build-test.md](references/06-build-test.md)を参照する。
- Copilotの指摘が仮想的なedge caseのために設計を過剰化する場合は、**理由を書いて反論する**。すべての提案を自動承認すると設計が損なわれる。[04-triage.md](references/04-triage.md)の `decline` 経路を参照する。
- **scriptの落とし穴**（`gh api graphql -F` の型強制、`git stash push -m` の位置引数解析、reviewer mutationに関する3つのGraphQLの落とし穴）は [references/api-quirks.md](references/api-quirks.md)に記載されている。scriptを変更する前に読む。

## トラブルシューティング

| 問題 | 解決策 |
|-------|----------|
| scriptが `prerequisite missing — gh CLI is not on PATH` を返す | `gh` をインストールする（Windowsでは `winget install GitHub.cli`、macOSでは `brew install gh`、Linuxではpackage managerを使うか https://cli.github.com からdownloadする）。次に `gh auth login` を実行する。メッセージをユーザーへ提示し、ループを**停止**する。再試行しない。 |
| scriptが `prerequisite missing — gh CLI is not authenticated` を返す | `gh auth login` を実行する。ユーザーが認証を完了するまでループを**停止**する。 |
| 起動に失敗する、または `copilot_work_started` eventが発生しない | 空白だけではない実質的なcommitをpushする。`synchronize` 時の自動割り当てが最も確実な起動方法である。失敗が続く場合は、repoまたはaccountでCopilot Code Reviewが有効でない可能性がある（repoのSettings → Code & automation → Copilot、またはaccountのCopilot Pro/Pro+を確認する）。 |
| 約10分待っても新しいreviewがない | 最近のdismiss後のquiet period、または軽微なdiffの抑制が考えられる。実質的なcommitをpushして再試行する。`01-request-review.ps1` を無条件に再実行してはならない。Copilotがrequested reviewerの間は `InFlight` を報告する。 |
| 未解決一覧に古い未解決threadがある | 想定どおり。未解決状態が正本である。他の未解決threadと同様に返信して解決する。`10-cleanup-outdated.ps1` は最後の安全策にすぎない。 |
| 指摘を修正すべきか却下すべきか判断できない | [references/04-triage.md](references/04-triage.md)を参照する。 |
| 「修正済み」「却下」「逸脱」に対する返信表現が必要 | [templates/](templates/) 配下のtemplate、[reply-fix.md](templates/reply-fix.md)、[reply-decline.md](templates/reply-decline.md)、[reply-drift.md](templates/reply-drift.md)、[reply-partial.md](templates/reply-partial.md)を参照する。 |

## 参照

- [references/orchestration.md](references/orchestration.md) —
  時間制限と延長protocol、sub-agent委譲map、単一反復fallback、ループ全体の注意事項を含む共通のループ制御。
- 手順ごとの契約（各手順に1つの `NN-*.md`）:
  [references/01-request-review.md](references/01-request-review.md) _（親）_,
  [references/02-wait.md](references/02-wait.md),
  [references/03-list-threads.md](references/03-list-threads.md),
  [references/04-triage.md](references/04-triage.md)（修正と却下の判断基準を含む）、
  [references/05-fix.md](references/05-fix.md),
  [references/06-build-test.md](references/06-build-test.md),
  [references/07-commit-push.md](references/07-commit-push.md) _（親）_,
  [references/08-reply-resolve.md](references/08-reply-resolve.md),
  [references/09-convergence.md](references/09-convergence.md)（ラウンド上限の要約ゲートを含む）、
  [references/10-cleanup.md](references/10-cleanup.md) _（親）_。
- [references/api-quirks.md](references/api-quirks.md) — 検証済みのGitHub API動作、行き止まり、
  reviewer mutationに関するGraphQLの落とし穴。
- template（返信種別ごとに1つ）:
  [templates/reply-fix.md](templates/reply-fix.md) — 修正受け入れのパターン。
  [templates/reply-decline.md](templates/reply-decline.md) — 理由を添えた却下のパターン。
  [templates/reply-drift.md](templates/reply-drift.md) —
  PR description、comment、test planの逸脱を認めるパターン。
  [templates/reply-partial.md](templates/reply-partial.md) —
  後続対応を延期する部分修正。共通の返信指針とanti-patternは
  [references/08-reply-resolve.md](references/08-reply-resolve.md#reply-guidance).
- [scripts/_lib.ps1](scripts/_lib.ps1) — 共有helper（`Invoke-Gh`、
  `Invoke-GhGraphQL`、`Resolve-RepoCoords`）。すべてのscriptがdot-sourceする。
- [scripts/01-request-review.ps1](scripts/01-request-review.ps1) —
  Copilot reviewを起動し、`copilot_work_started` eventで受け付けを確認する。
- [scripts/02-check-review-status.ps1](scripts/02-check-review-status.ps1) —
  PRのCopilot review状態を単発でsnapshot取得する。3条件すべてを満たす場合だけ
  `Converged: true` を出力する。
- [scripts/03-list-open-threads.ps1](scripts/03-list-open-threads.ps1) —
  **すべてのreviewer**（Copilot、人間、github-advanced-securityなど）による
  未解決のPR review threadをすべて取得する。
- [scripts/08-reply-and-resolve.ps1](scripts/08-reply-and-resolve.ps1) —
  1回の呼び出しで返信を投稿して解決する。
- [scripts/10-cleanup-outdated.ps1](scripts/10-cleanup-outdated.ps1) —
  古いCopilot threadの安全策。

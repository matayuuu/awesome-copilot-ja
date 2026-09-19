---
name: impediment-prioritization
description: 'バリューストリームのスコアリングモデル（ROI、実装コスト、展開容易性、リスク要因）と固定の優先度式を使って、障害と対策の任意の一覧を順位付けする。障害、対策、是正項目、リスク、指摘、ギャップ、アクション項目、バックログの優先順位付け・順位付け・順序付け・トリアージ、バリューストリーム優先順位付け、A3 / リーン対策順位付け、ROI対労力スコア、是正・改善バックログの作成を求められたときに使う。GHQR指摘、監査結果、振り返りアクション項目、リスク台帳、アーキテクチャレビューのギャップ、任意の `{impediment, countermeasure}` リストに対応する。'
license: MIT
metadata:
  author: ajenns
  version: "2.0.0"
  created: "2026-04-19"
  updated: "2026-04-21"
  framework: value-stream-prioritization
  domain: general
---

# 障害優先順位付けSkill

障害とその対策を順位付けする、ドメインに依存しないSkill。GHQR指摘、監査結果、振り返りアクション項目、リスク台帳、アーキテクチャレビューのギャップなど、任意の `{impediment, countermeasure}` リストに対応する。

## 起動する場面

次の場合に起動する。
- 障害、ギャップ、リスク、指摘、是正項目の優先順位付け、順位付け、順序付け、トリアージを求められた
- 対策案付きの障害一覧を提示された（または問題一覧への対策案を求められた）
- 改善 / 是正バックログについて「最初に何を直すべきか」と聞かれた
- バリューストリーム優先順位付け、A3対策、ROI対労力、リーン障害順位付けに言及された

## 入力

受け付ける入力は `{impediment, countermeasure}` のペア一覧である。情報源の例（網羅的ではない）:

| Source | Maps to Impediment | Maps to Countermeasure |
|--------|---------------------|-------------------------|
| GHQR / health-check findings | Finding or gap (Status ≠ Expected) | Recommendation / expected value |
| Audit results | Non-conformance | Remediation action |
| Retrospective | "What went wrong" item | Agreed improvement |
| Risk register | Risk | Mitigation |
| Architecture review | Gap vs. target state | Proposed change |
| User free-form list | Problem statement | Proposed fix |

**ルール:**
- 障害1件につき対策は1件とする。入力に複数の是正経路がある場合は主案を選び、代替案を根拠に記載する。同じ障害に複数行を出力しない。
- スコアリング前に重複をまとめる。
- 情報源のリンク / 引用があれば対策に付ける。
- 情報源に信頼度があれば、任意の `Confidence` 列として示す。

## スコアリング基準（1～10）

各障害の対策を4つの基準すべてで評価する。複数ドメイン（プラットフォームエンジニアリング、セキュリティ、SRE、アプリケーション開発、ガバナンス）における1 / 5 / 10の基準例は [references/scoring-rubric.md](./references/scoring-rubric.md) を参照する。

| 基準 | 尺度 | 定義 |
|-----------|-------|------------|
| **投資収益率（ROI）** | 1 = 低、10 = 高 | 対策がこのステップとバリューストリーム全体にもたらす効率向上。金銭面だけでなく、スループット、サイクルタイム短縮、欠陥除去、ユーザー / 開発者体験、コンプライアンス向上を重視する。 |
| **実装コスト** | 1 = 安価、10 = 非常に高価 | 対策の実装に必要な人的資本（人員の給与と時間）に加え、購入、ライセンス、インフラの費用。 |
| **展開容易性** | 1 = 非常に困難、10 = 非常に容易 | 対策をエンドツーエンドで実際に展開するために必要な是正作業。技術的複雑さ、変更管理の負担、ロールバックリスクを反映する。 |
| **リスク要因** | 1 = 低リスク、10 = 非常に高リスク | 対策が失敗、停滞、延期した場合のバリューストリーム全体への影響で重み付けしたリスク。 |

すべてのスコアに1行の根拠を付ける。明示的なデータではなく推定したスコアには、根拠に `(estimated)` を付ける。

## Formula

```
Priority = ((ROI * (10 / Cost)) + (Ease * (10 / Risk))) / 2
```

- 理論範囲: **1 → 100**。一般的なバックログでの実用範囲: 約1 → 100。
- 尺度の最小値を `1` とすることで、CostとRiskがゼロにならない（ゼロ除算を防ぐ）。
- Priorityが高いものから着手する。
- 境界値の確認:
  - ROI=10, Cost=1, Ease=10, Risk=1 → `((10*10)+(10*10))/2 = 100`
  - ROI=1, Cost=10, Ease=1, Risk=10 → `((1*1)+(1*1))/2 = 1`

式はそのまま使う。重み付けの変更、正規化、代替を行わない。

## 方法（Agentの手順）

1. **取り込む** 障害一覧を取り込む。障害と対策の1対1対応を確認し、重複をまとめる。
2. **対策を確認する** 各障害の対策を確認する。ドメインで文書化されたベストプラクティスを優先し、利用可能なら公開 / 権威あるリンクを引用する。
3. **スコアリングする** 基準ですべての項目を評価し、各基準に1行の根拠を書く。
4. **計算する** 式でPriorityを計算し、小数第1位に丸める。
5. **並べ替える** Priorityの降順で行を並べ、Rankを1から付ける。
6. **出力表を描画する**（以下を参照）。
7. **上位3件を強調する** 「なぜ最初に着手するか」を短い段落で示す。
8. **任意タグ**: GHQR/PAKの `[CSA Action Required]` と `[Customer Self-Service]`、内部バックログの `[Owner: Team X]` と `[Self-Service]` など、ワークフローで担当フラグが必要なら上位項目に含める。要求されていなければ省略する。

## Output Template

```markdown
## Prioritized Impediments

**Scoring:** ROI (1 low → 10 high), Cost (1 cheap → 10 expensive), Ease (1 hard → 10 easy), Risk (1 low → 10 high).
**Formula:** `Priority = ((ROI * (10/Cost)) + (Ease * (10/Risk))) / 2`

| Rank | Impediment | Countermeasure | ROI | Cost | Ease | Risk | Priority | Rationale |
|------|------------|----------------|-----|------|------|------|----------|-----------|
| 1 | [gap] | [action + link] | [n] | [n] | [n] | [n] | [n.n] | ROI: …<br>Cost: …<br>Ease: …<br>Risk: … |

### Top 3 — Act First
1. **[Impediment]** — [why it wins on the formula + optional ownership tag]
2. …
3. …
```

**例（GitHub Enterpriseの導入）:**

| 順位 | 障害 | 対策 | ROI | コスト | 容易性 | リスク | Priority | 根拠 |
|------|------------|----------------|-----|------|------|------|----------|-----------|
| 1 | 組織レベルで2FAが強制されていない | 組織全体で2FAを強制する（[ドキュメント](https://docs.github.com/en/organizations/keeping-your-organization-secure/setting-up-two-factor-authentication/requiring-two-factor-authentication-in-your-organization)） | 9 | 2 | 8 | 2 | 42.5 | ROI: 広範な認証情報侵害を除去<br>コスト: 管理者設定とメンバー連絡<br>容易性: 組織設定1つ、メンバーが再登録<br>リスク: 低い。猶予期間を設けて段階導入できる |
| 2 | Secret scanningが無効 | 組織全体でsecret scanningとpush protectionを有効化する（[ドキュメント](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)） | 8 | 3 | 7 | 3 | 25.0 | ROI: マージ前に漏えいした認証情報を検出<br>コスト: 含まれない場合はGHASシート（estimated）<br>容易性: 組織レベルの既定値<br>リスク: push protectionが正当なコミットをブロックする可能性。リポジトリごとに段階導入 |
| 3 | 重要リポジトリにCODEOWNERSがない | 上位20リポジトリにCODEOWNERSを追加する（[ドキュメント](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)） | 6 | 4 | 6 | 4 | 15.0 | ROI: 対象を絞ったレビュー範囲<br>コスト: オーナー定義のチーム工数（estimated）<br>容易性: ファイル単位の変更だがオーナーの合意が必要<br>リスク: オーナーが不足するとレビューが滞留 |

**例（一般的な振り返りアクション項目）:**

| 順位 | 障害 | 対策 | ROI | コスト | 容易性 | リスク | Priority |
|------|------------|----------------|-----|------|------|------|----------|
| 1 | 不安定なテストスイートが毎日デプロイを妨げる | 上位10件の不安定なテストを隔離し、再試行ポリシーを追加する | 9 | 2 | 8 | 2 | 42.5 |
| 2 | 決済サービスのオンコールランブックがない | 直近3件のインシデントからランブックを作成する | 7 | 3 | 8 | 2 | 31.7 |
| 3 | リリースノートの手作業にリリースごと2時間かかる | CIでConventional Commitsから生成する | 6 | 4 | 5 | 3 | 15.8 |

## 前提とガードレール

- スコアは基準と利用可能な情報源 / 引用に基づく推定である。推定の根拠には明示的に `(estimated)` を付ける。
- 文脈（チーム規模、予算、ツール一覧、組織上の制約）を決して捏造しない。必要ならユーザーに確認するか、スコアを推定として示す。
- 最終順位は推奨である。実行計画に組み込む前に、責任を持つチーム / オーナーがレビューする。
- 既定では読み取り専用。このSkillは是正を実行せず、後続処理が利用する順位付き一覧を作成する。

## 下流連携（任意）

このSkillが生成する順位付き表が成果物である。ワークフローで必要な下流成果物（Jira epic、ADR、OKRバックログ、インシデントレビュー、ヘルスチェックレポートなど）へ接続する。このSkillは兄弟Skillや外部テンプレートに依存しない。

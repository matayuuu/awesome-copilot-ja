---
name: acreadiness-policy
description: 'AgentRCポリシーの選択、作成、適用を支援する。ポリシーで無関係なチェックの無効化、impact/levelの上書き、合格率しきい値の設定、組織ベースラインとチーム上書きの連結ができる。strict mode、AIのみの採点、重みのカスタマイズ、CIゲート、組織標準化を尋ねられたときに使う。'
argument-hint: "[show | new <name> | apply <path-or-pkg>] — e.g. /acreadiness-policy show, /acreadiness-policy new strict-frontend"
---

# /acreadiness-policy — AgentRCポリシー

ユーザーが準備状況評価の **ポリシー**、**strict mode**、**カスタム採点**、**チェックの無効化**、**組織標準**、**CIゲート**について尋ねたときに使う。

ポリシーは3つの任意セクション — `criteria`、`extras`、`thresholds` — を持つ小さなJSONファイルで、AgentRCの準備状況採点方法をカスタマイズする。

## 組み込み例

AgentRCには `examples/policies/` に3つのポリシー例が同梱されている:

| ポリシー | 動作 |
|---|---|
| `strict.json` | 合格率100%を要求し、主要基準のimpactを上げる |
| `ai-only.json` | すべてのrepo-healthチェックを無効化し、AI toolingに集中する |
| `repo-health-only.json` | AIチェックを無効化し、従来の品質に集中する |

カスタムポリシーを書く前の出発点として、これらを推奨する。

## ポリシースキーマ

```jsonc
{
  "name": "my-policy",
  "criteria": {
    "disable":  ["env-example", "observability", "dependabot"],
    "override": {
      "readme":      { "impact": "high", "level": 2 },
      "lint-config": { "title": "Linter required" }
    }
  },
  "extras": {
    "disable": ["pre-commit"]
  },
  "thresholds": {
    "passRate": 0.9
  }
}
```

### impactの重み

| 影響度 | 重み |
|---|---|
| critical | 5 |
| high | 4 |
| medium | 3 |
| low | 2 |
| info | 0 |

`Score = 1 − (deductions / max possible weight)`。評価: **A** ≥ 0.9、**B** ≥ 0.8、**C** ≥ 0.7、**D** ≥ 0.6、**F** < 0.6。

## サブコマンド

### `show`
現在有効なポリシーを一覧表示する（`agentrc.config.json` の `policies` 配列から取得。なければなし）。

### `new <name>`
妥当な既定値で `policies/<name>.json` を雛形生成する。ユーザーを次の項目へ案内する:
1. **無効化するもの** — スタックに無関係な柱や追加項目（例: 静的サイトで `observability` を無効化）。
2. **重要度を上げるもの** — 必須項目（例: `readme`、`codeowners`）の `impact` を `high` または `critical` に上書きする。
3. **合格率のしきい値** — 組織でよく使う基準: `0.7`（緩い）、`0.85`（標準）、`1.0`（厳格）。
4. `agentrc.config.json` からポリシーを参照する:
   ```json
   { "policies": ["./policies/<name>.json"] }
   ```

### `apply <path-or-pkg>`
`agentrc readiness --json --policy <source>` を実行し、`assess` Skill / `ai-readiness-reporter` Agentへ委譲してレポートを再描画する。連結をサポートする:
```bash
npx -y github:microsoft/agentrc readiness --json --policy ./org-baseline.json,./team-frontend.json
```

## CIゲート

`--fail-level` とポリシーを組み合わせ、CIで最低成熟度レベルを強制する:

```yaml
- run: npx -y github:microsoft/agentrc readiness --policy ./policies/strict.json --fail-level 3
```

## 高度な使い方

JSONポリシーでは無効化、上書き、しきい値設定ができるが、**新しい基準は追加できない**。新しい検出ロジックにはAgentRCのTypeScriptプラグインシステム（`docs/dev/plugins.md`）を案内する。

## 運用ルール

- **柱を黙って無効化しない。** ユーザーが `observability` の無効化を望む場合は、確認してトレードオフを説明する。
- **無効化より `impact` の上書きを優先する。** 無効化するとギャップ全体が隠れるが、上書きならレポートに残る。
- **追加項目は有効のままにするよう推奨する。** 無料であり、スコアへ影響しない。
- **階層化を提案する。** 多くの組織では、基準ポリシーとチーム別上書きを `--policy a.json,b.json` で連結する。

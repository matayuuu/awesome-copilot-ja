---
name: acreadiness-assess
description: '現在のリポジトリで AgentRC の準備状況評価を実行し、reports/index.html に静的HTMLダッシュボードを生成する。`npx github:microsoft/agentrc readiness` をラップし、表示を @ai-readiness-reporter カスタムAgentへ委譲する。組織固有の採点向けにポリシー（--policy）をサポートする。リポジトリのAI対応度を評価、監査、採点する依頼で使う。'
argument-hint: "[--policy <path-or-pkg>] [--per-area] — e.g. /acreadiness-assess, /acreadiness-assess --policy ./policies/strict.json"
---

# /acreadiness-assess — AI対応度の評価

ユーザーが **AI対応度の評価**、**準備状況チェック**、**監査**、またはリポジトリの **AI対応度を確認すること**を求めたときに使う。

このSkillは AgentRC の **Measure → Generate → Maintain** ループにおける *Measure* 段階である。結果は単独で動作するHTMLダッシュボードで、ユーザーは `file://` で開くかリポジトリへコミットできる。

## 手順

1. **前提条件を確認する。** Node 20以上が PATH にある必要がある。不明な場合は `node --version` を実行する。

2. **ポリシーを決める**（任意だが推奨）:
   - ユーザーが `--policy <source>` を指定した場合は、その値を取得する。
   - それ以外の場合は `agentrc.config.json` の `policies` 配列を確認する。
   - どちらもなければ、ポリシーなし（組み込みの既定値）で実行する。
   - ポリシーの入門として `acreadiness-policy` Skillを案内する。

3. **準備状況スキャンを実行する**。構造化出力をリポジトリルートで取得する:
   ```bash
   npx -y github:microsoft/agentrc readiness --json [--policy <source>] [--per-area]
   ```
   `CommandResult<T>` JSONエンベロープを次の手順の入力にする。

4. **`ai-readiness-reporter` カスタムAgentへ委譲する**。JSONを解釈して `reports/index.html` を生成する。このAgentは同梱テンプレート `report-template.html` を使って描画するため、すべてのレポートで見た目が統一される。Agentは次を行う:
   - 同梱の `report-template.html` を読み込み、プレースホルダーを実データで置換する。
   - すべてのCSSをインライン化し、単一の静的ファイルとして提供する（`file://` で動作）。
   - 成熟度、総合スコア、評価、しきい値に対する合格率を表示する。
   - **Repo Health**（8）と **AI Setup**（1）の9つの柱を、*測定対象*、*AIにとっての重要性*、*現在の状態*、*具体的な推奨事項*で分解する。
   - 各柱に **AIとの関連性** バッジ（High / Medium / Low）を付ける。
   - **Extras** を分けて表示する（スコアには影響しない）。
   - 無効化・上書きされた基準としきい値を含む **Active Policy** を表示する。
   - **優先度付き修復計画**（🔴 まず修正 / 🟡 次に修正 / 🔵 計画）を生成する。
   - 再利用できるよう生のAgentRC JSONを埋め込む。

5. **レポートの場所**（`reports/index.html`）と開き方をユーザーへ伝える。チャットでは成熟度、総合スコア、最も低い柱3つ、最も効果の高い次のアクション1つ（ほぼ常に `acreadiness-generate-instructions` Skillの実行）を要約する。

## 注意事項

- AgentRCには組み込みHTMLレンダラー（`--visual` / `--output report.html`）もあるが、出力は意図的に汎用的である。このSkillはカスタムAgentを通じて、メトリクスの羅列ではなくコードレビューに近い、対象に合わせた判断付きダッシュボードを生成する。
- CIゲートには `agentrc readiness --fail-level <n>`（1–5）を推奨する。
- このSkillは `reports/index.html` の作成以外にリポジトリファイルを変更しない。

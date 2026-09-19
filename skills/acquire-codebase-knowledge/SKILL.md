---
name: acquire-codebase-knowledge
description: '既存のコードベースの把握、文書化、オンボーディングを明示的に依頼されたときに使うSkill。「このコードベースを地図化して」「このアーキテクチャを文書化して」「このリポジトリを理解したい」「コードベースの文書を作って」などが対象。リポジトリ全体の探索を求められない通常の機能実装、バグ修正、狭いコード編集では起動しない。'
license: MIT
compatibility: 'クロスプラットフォーム。Python 3.8以降とgitが必要。対象プロジェクトのルートからscripts/scan.pyを実行する。'
metadata:
  version: "1.3"
  enhancements:
    - 多言語マニフェスト検出（25以上の言語に対応）
    - CI/CDパイプライン検出（10以上のプラットフォーム）
    - コンテナーとオーケストレーションの検出
    - 言語別コードメトリクス
    - セキュリティとコンプライアンス設定の検出
    - パフォーマンステスト用マーカー
argument-hint: '任意: 対象領域（例: "architecture only", "testing and concerns"）'
---

# コードベースの知識を取得

プロジェクトで効果的に作業するために必要な情報を網羅した7つの文書を `docs/codebase/` に生成する。ファイルまたはターミナル出力で検証できる内容だけを記録し、推測や仮定はしない。

## 出力契約（必須）

完了前に、次のすべてを満たすこと:

1. `docs/codebase/` には次のファイルだけが存在すること: `STACK.md`, `STRUCTURE.md`, `ARCHITECTURE.md`, `CONVENTIONS.md`, `INTEGRATIONS.md`, `TESTING.md`, `CONCERNS.md`。
2. すべての主張をソースファイル、設定、またはターミナル出力まで追跡できること。
3. 不明点は `[TODO]`、意図に依存する判断は `[ASK USER]` と記すこと。
4. 各文書に具体的なファイルパスを含む短い「根拠」一覧を付けること。
5. 最終回答に番号付きの `[ASK USER]` 質問と、意図と実態の相違を含めること。

## ワークフロー

次のチェックリストをコピーして追跡する:

```
- [ ] Phase 1: Run scan, read intent documents
- [ ] Phase 2: Investigate each documentation area
- [ ] Phase 3: Populate all seven docs in docs/codebase/
- [ ] Phase 4: Validate docs, present findings, resolve all [ASK USER] items
```

## 対象領域モード

ユーザーが対象領域（例:「アーキテクチャのみ」「テストと懸念」）を指定した場合:

1. フェーズ1は必ず完全に実行する。
2. 対象領域の文書を先に完全に仕上げる。
3. まだ分析していない対象外文書も必須セクションを残し、不明点を `[TODO]` とする。
4. 最終出力前に、7文書すべてへフェーズ4の検証ループを実行する。

### フェーズ1: スキャンと意図の確認

1. 対象プロジェクトのルートからスキャンスクリプトを実行する:
   ```bash
   python3 "$SKILL_ROOT/scripts/scan.py" --output docs/codebase/.codebase-scan.txt
   ```
   `$SKILL_ROOT` はSkillフォルダーの絶対パス。Windows、macOS、Linuxで動作する。

   **クイックスタート:** パスをインラインで指定できる場合:
   ```bash
   python3 /absolute/path/to/skills/acquire-codebase-knowledge/scripts/scan.py --output docs/codebase/.codebase-scan.txt
   ```

2. `PRD`、`TRD`、`README`、`ROADMAP`、`SPEC`、`DESIGN` ファイルを検索して読む。
3. ソースコードを読む前に、明記されたプロジェクトの意図を要約する。

### フェーズ2: 調査

スキャン結果を使って7つのテンプレートごとの質問に答える。テンプレート別の質問一覧は [`references/inquiry-checkpoints.md`](references/inquiry-checkpoints.md) を読み込む。

スタックが曖昧な場合（マニフェストが複数、未知のファイル形式、`package.json` がない場合）は [`references/stack-detection.md`](references/stack-detection.md) を読み込む。

### フェーズ3: テンプレートを埋める

`assets/templates/` の各テンプレートを `docs/codebase/` にコピーする。次の順序で記入する:

1. [STACK.md](assets/templates/STACK.md) — 言語、ランタイム、フレームワーク、すべての依存関係
2. [STRUCTURE.md](assets/templates/STRUCTURE.md) — ディレクトリ構成、エントリポイント、主要ファイル
3. [ARCHITECTURE.md](assets/templates/ARCHITECTURE.md) — 層、パターン、データフロー
4. [CONVENTIONS.md](assets/templates/CONVENTIONS.md) — 命名、フォーマット、エラー処理、インポート
5. [INTEGRATIONS.md](assets/templates/INTEGRATIONS.md) — 外部API、データベース、認証、監視
6. [TESTING.md](assets/templates/TESTING.md) — フレームワーク、ファイル構成、モック方針
7. [CONCERNS.md](assets/templates/CONCERNS.md) — 技術的負債、バグ、セキュリティリスク、性能ボトルネック

コードから判断できない内容には `[TODO]` を使う。正解にチームの意図が必要な場合は `[ASK USER]` を使う。

### フェーズ4: 検証、修復、確認

完了前に、次の必須検証ループを実行する:

1. 各文書を `references/inquiry-checkpoints.md` と照合して検証する。
2. 重要な主張ごとに、少なくとも1つの根拠参照があることを確認する。
3. 必須セクションが欠けている、または根拠がない場合:
  - 文書を修正する。
  - 検証を再実行する。
4. 7文書すべてが合格するまで繰り返す。

その後、7文書すべての概要を示し、すべての `[ASK USER]` 項目を番号付き質問として列挙し、フェーズ1で見つかった意図と実態の相違を強調する。

検証合格基準:

- 根拠のない主張がない。
- 必須セクションが空でない。
- 不明点に仮定ではなく `[TODO]` を使っている。
- チームの意図が必要な空白を `[ASK USER]` と明示している。

---

## 注意点

**モノレポ:** ルートの `package.json` にソースがない場合があるため、`workspaces`、`packages/`、`apps/` ディレクトリを確認する。各ワークスペースは独立した依存関係と規約を持つ場合があるため、サブパッケージごとに対応付ける。

**古いREADME:** READMEは現在の構成ではなく、意図したアーキテクチャを説明していることが多い。READMEの記述を事実として扱う前に、実際のファイル構成と照合する。

**TypeScriptのパスエイリアス:** `tsconfig.json` の `paths` 設定により、`@/foo` のようなインポートはファイルシステムへ直接対応しない。構成を文書化する前に、エイリアスを実パスへ対応付ける。

**生成・コンパイル出力:** `dist/`、`build/`、`generated/`、`.next/`、`out/`、`__pycache__/` のパターンは決して文書化しない。これらは成果物であり、ソースの規約だけを文書化する。

**`.env.example` は必須設定を示す:** シークレットは決してコミットされない。必要な環境変数を把握するには `.env.example`、`.env.template`、または `.env.sample` を読む。

**`devDependencies` ≠ 本番スタック:** 本番で動くのは `dependencies`（または `[tool.poetry.dependencies]` などの同等設定）だけである。リンター、フォーマッター、テストフレームワークは開発用ツールとして分けて文書化する。

**テストのTODO ≠ 本番の負債:** `test/`、`tests/`、`__tests__/`、`spec/` 内のTODOはカバレッジ不足であり、本番の技術的負債ではない。`CONCERNS.md` では分けて扱う。

**変更頻度の高いファイル = 脆弱な領域:** 直近のgit履歴に最も多く現れるファイルは変更率が高く、隠れた複雑性を持つ可能性がある。必ず `CONCERNS.md` に記録する。

---

## アンチパターン

| ❌ しないこと | ✅ 代わりに行うこと |
|---------|--------------|
| 「Domain/Data層を持つClean Architectureを使う」（そのようなディレクトリがない場合） | 実際のディレクトリ構成が示す内容だけを記述する。 |
| 「これはNext.jsプロジェクトである」（`package.json`を確認せずに） | まず `dependencies` を確認し、実際の内容を記述する。 |
| `dbUrl` のような変数名からデータベースを推測する | マニフェストで `pg`、`mysql2`、`mongoose`、`prisma` などを確認する。 |
| `dist/` や `build/` の命名パターンを規約として文書化する | ソースファイルだけを扱う。 |

---

## 拡張スキャン出力のセクション

`scan.py` スクリプトは、従来の出力に加えて次のセクションを生成する:

- **コードメトリクス** — 総ファイル数、言語別コード行数、最大ファイル（複雑性の兆候）
- **CI/CDパイプライン** — 検出されたGitHub Actions、GitLab CI、Jenkins、CircleCIなど
- **コンテナーとオーケストレーション** — Docker、Docker Compose、Kubernetes、Vagrantの設定
- **セキュリティとコンプライアンス** — Snyk、Dependabot、SECURITY.md、SBOM、セキュリティポリシー
- **パフォーマンスとテスト** — ベンチマーク設定、プロファイリング用マーカー、負荷テストツール

フェーズ2ではこれらのセクションを使って調査項目を定め、ツール固有のパターンを特定する。

---

## 同梱アセット

| アセット | 読み込むタイミング |
|-------|-------------|
| [`scripts/scan.py`](scripts/scan.py) | フェーズ1 — コードを読む前に最初に実行する（Python 3.8以上が必要） |
| [`references/inquiry-checkpoints.md`](references/inquiry-checkpoints.md) | フェーズ2 — テンプレート別の調査質問を読み込む |
| [`references/stack-detection.md`](references/stack-detection.md) | フェーズ2 — スタックが曖昧な場合だけ読み込む |
| [`assets/templates/STACK.md`](assets/templates/STACK.md) | フェーズ3 手順1 |
| [`assets/templates/STRUCTURE.md`](assets/templates/STRUCTURE.md) | フェーズ3 手順2 |
| [`assets/templates/ARCHITECTURE.md`](assets/templates/ARCHITECTURE.md) | フェーズ3 手順3 |
| [`assets/templates/CONVENTIONS.md`](assets/templates/CONVENTIONS.md) | フェーズ3 手順4 |
| [`assets/templates/INTEGRATIONS.md`](assets/templates/INTEGRATIONS.md) | フェーズ3 手順5 |
| [`assets/templates/TESTING.md`](assets/templates/TESTING.md) | フェーズ3 手順6 |
| [`assets/templates/CONCERNS.md`](assets/templates/CONCERNS.md) | フェーズ3 手順7 |

テンプレートの使用モード:

- 既定モード: 各テンプレートの「必須コアセクション」だけを完成させる。
- 拡張モード: リポジトリの複雑性から必要と判断した場合だけ任意セクションを追加する。

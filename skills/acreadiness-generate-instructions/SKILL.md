---
name: acreadiness-generate-instructions
description: 'AgentRC instructions コマンドで、対象リポジトリ向けのAI Agent指示ファイルを生成する。既定では .github/copilot-instructions.md（VS CodeのCopilot向けに推奨）を作り、モノレポでは applyTo glob 付きの領域別 .instructions.md ファイルも任意で生成する。AI Tooling の不足を埋めるため、/acreadiness-assess の後に使う。'
argument-hint: "[--output .github/copilot-instructions.md|AGENTS.md] [--strategy flat|nested] [--areas | --area <name>] [--apply-to <glob>] [--claude-md] [--dry-run]"
---

# /acreadiness-generate-instructions — AI Agent指示を作成

ユーザーがAIコーディングAgent（Copilot、Claudeなど）のカスタム指示を **作成**、**再生成**、**更新**したいときに使う。これは AgentRC の **Measure → Generate → Maintain** ループの *Generate* 段階であり、**AI Tooling** の柱に対する最も効果の高い単一アクションである。

## 出力オプション

VS Codeはいくつかの指示ファイル形式を認識し、AgentRCは一般的な形式を生成する:

| ファイル | 範囲 | 使う場面 |
|---|---|---|
| `.github/copilot-instructions.md` | 常時有効、ワークスペース全体 | **既定** — VS Code Copilotのネイティブ指示ファイル |
| `AGENTS.md` | 常時有効、ワークスペース全体 | マルチAgentリポジトリ（Copilot + Claudeなど） |
| `.github/instructions/*.instructions.md` | `applyTo` globで限定 | モノレポの領域別・言語別ルール |
| `CLAUDE.md` | Claude固有 | `--claude-md` で追加（nestedのみ） |

## 戦略

- **`flat`** *(既定)* — 選択した場所に単一の `.github/copilot-instructions.md` を置く。単純で、レビューしやすい。
- **`nested`** — `.github/copilot-instructions.md` をハブとし、`.github/instructions/<topic>.instructions.md` にトピック別詳細ファイルを置く。各ファイルに `applyTo` glob を付け、関連時だけVS Codeが読み込む。大規模または複数スタックのリポジトリに適する。

> **なぜ `.agents/` ではなく `.github/instructions/` なのか?** AgentRCの既定のnestedレイアウトは `.agents/` に書き出す。これは `AGENTS.md` を読むCopilot、Claude、Cursorなどの*Agent非依存*リポジトリに適している。一方、VS Code Copilotのネイティブな場所は `applyTo` frontmatter付きの `.github/instructions/` であり、Copilotが自動検出する。このSkillは、主出力が `.github/copilot-instructions.md` の場合にAgentRCのnested出力をVS Codeネイティブの場所へ書き換える。`--output AGENTS.md` を選んだ場合、nestedはAgentRC既定の `.agents/` レイアウトを維持する。

モノレポでは、`--areas`、`--area <name>`、または `--areas-only` で**領域限定**の指示を生成する。領域は `agentrc.config.json` で定義する。領域別の出力は `applyTo` glob付きのVS Code `.instructions.md` ファイルとして書き出す（下記参照）。

### トピック別と領域別の `.instructions.md` ファイル

どちらも `.github/instructions/` に配置されるが、扱う問いが異なる:

| 種類 | ファイル名の例 | `applyTo` の例 | 生成元 |
|---|---|---|---|
| **Topic** (nested) | `testing.instructions.md` | `**/*.{test,spec}.{ts,tsx,js}` | AgentRC `--strategy nested` topic split |
| **Area** (monorepo) | `frontend.instructions.md` | `apps/frontend/**` | `agentrc.config.json` areas + `--areas` |

両方を同時に使える。topic別のnestedファイル一式と、モノレポ用の領域別ファイルを併用できる。

## `applyTo` 付き領域別ファイル

ユーザーが領域を有効にした場合、領域ごとに `.github/instructions/<area>.instructions.md` へVS Codeネイティブの `.instructions.md` ファイルを1つ出力する。各ファイルは、ルールを適用するglobを宣言するfrontmatterで必ず始める:

```markdown
---
applyTo: "apps/frontend/**"
---

# Frontend area instructions

…AgentRC-generated content for this area…
```

ワークフロー:

1. **`agentrc.config.json`を読む** — 定義済みの領域と `paths` / globを確認する。`paths` がない場合は、ユーザーにglob（例: `src/api/**`）を尋ねる。
2. **`agentrc instructions --areas`**（または `--area <name>`）を実行し、領域別の本文を生成する。
3. **各領域の内容をラップする** — 領域の `paths` から取得した `applyTo` frontmatterを付けて `.github/instructions/<area>.instructions.md` に配置する。単一領域の呼び出しでユーザーが `--apply-to <glob>` を渡した場合は、そのglobをそのまま使う。
4. **メインファイルは変更しない** — ルートの `.github/copilot-instructions.md` は常時有効な指示のままとし、`.instructions.md` は一致するパスにだけ適用する。

命名: 領域名は小文字のkebab-case。例: `.github/instructions/frontend.instructions.md`、`.github/instructions/api.instructions.md`、`.github/instructions/infra.instructions.md`。

## 手順

1. **対象ファイルを選ぶ。** **既定は `.github/copilot-instructions.md`。** ユーザーがmulti-agent / Claude / Cursor対応に言及した場合だけ `AGENTS.md` に切り替える。
2. ユーザーのメッセージまたは `--strategy` ですでに指定されていない限り、**常に戦略を確認する** — `flat` か `nested` か。トレードオフを簡潔に示す:
   - **Flat** *(既定)* — `.github/copilot-instructions.md` を1つだけ置く。単純で、1つのPRでレビューしやすい。単一スタックの小〜中規模リポジトリに最適。
   - **Nested** — ハブとなる `.github/copilot-instructions.md` と、トピック別の `.github/instructions/<topic>.instructions.md` ファイル（それぞれ `applyTo` glob付きで、関連時だけVS Codeが読み込む）を使う。大規模または複数スタックのリポジトリに最適。`--claude-md` を追加すると `CLAUDE.md` も出力する。
   リポジトリに5個を超えるトップレベルディレクトリ、複数スタック、または既存のモノレポツール（turbo/nx/pnpm workspaces）がある場合は、積極的に `nested` を推奨する。
3. **モノレポ領域を検出する**ため `agentrc.config.json` を読む。領域がある場合は、ルートファイルに加えて **`applyTo` 付きの領域別 `.instructions.md` ファイル**も必要かをユーザーに確認する。`agentrc.config.json` が領域を宣言している場合の既定は「yes」とする。
4. **先にdry-runを実行する**ことで、ユーザーがプレビューできるようにする:
   ```bash
   npx -y github:microsoft/agentrc instructions --output <file> --strategy <flat|nested> [--areas|--area <name>] [--claude-md] --dry-run
   ```
5. **変更内容の短い概要を示す** — 作成または上書きされるファイル、領域数と各 `applyTo` glob、使用モデル（既定は `claude-sonnet-4.6`）。
6. **確認後、同じコマンドを `--dry-run` なしで実行する**（既存ファイルがある場合は必要に応じて `--force`）。
7. **Copilot出力用にレイアウトを後処理する**:
   - **`--output` が `copilot-instructions.md` で終わり、戦略が `nested` の場合**: AgentRCの `.agents/<topic>.md` ファイルを `.github/instructions/<topic>.instructions.md` へ移動または書き換える。各ファイルに適切な `applyTo` glob付きfrontmatterを追加する（下記「トピック別 `applyTo` 既定値」を参照）。空になった `.agents/` ディレクトリを削除する。
   - **`--areas` が使われた場合**: 各領域について `.github/instructions/<area>.instructions.md` も書き出し、`agentrc.config.json` の各領域の `paths` を `applyTo` globとして使う（単一領域呼び出しでは `--apply-to` で上書き）。
   - **`--output AGENTS.md`** が選ばれた場合: nestedではAgentRCネイティブの `.agents/` レイアウトを維持する。Agent非依存の読み手はそこを期待する。
   `.github/instructions/` ディレクトリがなければ作成する。

### トピック別 `applyTo` 既定値

AgentRCのnestedトピックファイルを `.instructions.md` へ昇格する場合、ユーザーが別指定しない限り次の既定値を使う:

| トピック | 既定の `applyTo` |
|---|---|
| `testing` | `**/*.{test,spec}.{ts,tsx,js,jsx,mjs,cjs}` |
| `style` / `code-quality` / `formatting` | `**/*.{ts,tsx,js,jsx,mjs,cjs,py,go,rs,java,kt,cs}` |
| `build` / `ci` | `**/{package.json,turbo.json,nx.json,.github/workflows/**}` |
| `docs` | `**/*.md` |
| `security` | `**` |
| その他 / ハブレベル | `**` |
8. **検証する**ため生成ファイルを読み返し、検出されたスタック、取り込まれた規約、長さ、`.instructions.md` ファイルと各globの一覧を1段落でユーザーへ示す。
9. **次の手順を提案する**:
   - AI Toolingの柱スコアが改善したことを確認するため、`assess` Skillを再実行する。
   - ユーザーがすでに `copilot-instructions.md` と `AGENTS.md` の両方を持っている場合は、単一の正本へ統合することを推奨する（AgentRCは成熟度Level 2以上でこれを指摘する）。

## 注意事項

- AgentRCは**実際のコード**を読む。テンプレートではないため、出力は検出された言語、フレームワーク、規約を反映する。
- `--claude-md`（nested戦略のみ）は `CLAUDE.md` も出力する。
- VS Codeは、アクティブファイルが `applyTo` に一致したとき `.instructions.md` ファイルを自動適用する。ルートの `.github/copilot-instructions.md` は常に読み込まれる。
- このSkillをCIで非対話的に実行しない。指示はリポジトリの一部であり、PRとして取り込むべきである。

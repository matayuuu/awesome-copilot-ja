---
name: memory-merger
description: 'ドメインのメモリーファイルから成熟した学びを命令ファイルへ統合する。構文は `/memory-merger >domain [scope]` で、scopeは既定で `global`、または `user`、`workspace`、`ws`。'
---

# メモリー統合

ドメインのメモリーファイルから成熟した学びを命令ファイルへ統合し、知識を保ちながら重複を最小限にする。

**todoリストを使い**、手順の進捗を追跡してユーザーへ共有する。

## スコープ

Memory instructions can be stored in two scopes:

- **Global**（`global`または`user`）- `<global-prompts>`（`vscode-userdata:/User/prompts/`）に保存され、すべてのVS Codeプロジェクトへ適用される
- **Workspace**（`workspace`または`ws`）- `<workspace-instructions>`（`<workspace-root>/.github/instructions/`）に保存され、現在のプロジェクトだけに適用される

Default scope is **global**.

Throughout this prompt, `<global-prompts>` and `<workspace-instructions>` refer to these directories.

## 構文

```
/memory-merger >domain-name [scope]
```

- `>domain-name` - 必須。統合するドメイン（例: `>clojure`、`>git-workflow`、`>prompt-engineering`）
- `[scope]` - 任意。`global`、`user`（どちらもglobal）、`workspace`、`ws`のいずれか。既定値は`global`

**Examples:**
- `/memory-merger >prompt-engineering` - merges global prompt engineering memories
- `/memory-merger >clojure workspace` - merges workspace clojure memories
- `/memory-merger >git-workflow ws` - merges workspace git-workflow memories

## 手順

### 1. 入力を解析してファイルを読む

- ユーザー入力からドメインとスコープを**抽出**する
- ファイルパスを**決定**する:
  - Global: `<global-prompts>/{domain}-memory.instructions.md` → `<global-prompts>/{domain}.instructions.md`
  - Workspace: `<workspace-instructions>/{domain}-memory.instructions.md` → `<workspace-instructions>/{domain}.instructions.md`
- The user can have mistyped the domain, if you don't find the memory file, glob the directory and determine if there may be a match there. Ask the user for input if in doubt.
- 両方のファイルを**読む**（メモリーファイルは必須、命令ファイルは任意）

### 2. 分析して提案する

Review all memory sections and present them for merger consideration:

```
## Proposed Memories for Merger

### Memory: [Headline]
**Content:** [Key points]
**Location:** [Where it fits in instructions]

[More memories]...
```

Say: "Please review these memories. Approve all with 'go' or specify which to skip."

**STOP and wait for user input.**

### 3. 品質基準を定義する

Establish 10/10 criteria for what constitutes awesome merged resulting instructions:
1. **Zero knowledge loss** - Every detail, example, and nuance preserved
2. **Minimal redundancy** - Overlapping guidance consolidated
3. **Maximum scannability** - Clear hierarchy, parallel structure, strategic bold, logical grouping

### 4. 統合して反復する

Develop the final merged instructions **without updating files yet**:

1. Draft the merged instructions incorporating approved memories
2. Evaluate against quality bar
3. Refine structure, wording, organization
4. Repeat until the merged instructions meet 10/10 criteria

### 5. ファイルを更新する

Once the final merged instructions meet 10/10 criteria:

- **Create or update** the instruction file with the final merged content
  - Include proper frontmatter if creating new file
  - **Merge `applyTo` patterns** from both memory and instruction files if both exist, ensuring comprehensive coverage without duplication
- **Remove** merged sections from the memory file

## 例

```
User: "/memory-merger >clojure"

Agent:
1. Reads clojure-memory.instructions.md and clojure.instructions.md
2. Proposes 3 memories for merger
3. [STOPS]

User: "go"

Agent:
4. Defines quality bar for 10/10
5. Merges new instructions candidate, iterates to 10/10
6. Updates clojure.instructions.md
7. Cleans clojure-memory.instructions.md
```

---
name: microsoft-skill-creator
description: Learn MCP ツールを使って Microsoft テクノロジー向けの Agent Skill を作成する。Azure、.NET、M365、VS Code、Bicep などの技術、ライブラリ、フレームワーク、サービスを教える Skill の作成に使う。深く調査し、基本知識をローカルに保存しつつ動的な追加調査も可能なハイブリッド Skill を生成する。
context: fork
compatibility: Works best with Microsoft Learn MCP Server (https://learn.microsoft.com/api/mcp). Can also use the mslearn CLI as a fallback.
---

# Microsoft Skill作成者

必須知識をローカルに保存しつつ、詳細について動的なLearn MCP検索も可能にするMicrosoftテクノロジー向けハイブリッドSkillを作成する。

## Skillについて

Skillは、専門知識とワークフローでエージェントの能力を拡張するモジュール式パッケージである。Skillにより、汎用エージェントを特定分野向けの専門エージェントへ変える。

### Skillの構造

```
skill-name/
├── SKILL.md (required)     # Frontmatter (name, description) + instructions
├── references/             # Documentation loaded into context as needed
├── sample_codes/           # Working code examples
└── assets/                 # Files used in output (templates, etc.)
```

### 基本原則

- **Frontmatter is critical**: `name` and `description` determine when the skill triggers—be clear and comprehensive
- **Concise is key**: Only include what agents don't already know; context window is shared
- **No duplication**: Information lives in SKILL.md OR reference files, not both

## Learn MCPツール

| ツール | 目的 | 使用時 |
|------|---------|-------------|
| `microsoft_docs_search` | Search official docs | First pass discovery, finding topics |
| `microsoft_docs_fetch` | Get full page content | Deep dive into important pages |
| `microsoft_code_sample_search` | Find code examples | Get implementation patterns |

### CLIの代替手段

Learn MCPサーバーが利用できない場合は、代わりにターミナルまたはシェル（Bash、PowerShell、cmdなど）から`mslearn` CLIを使う:

```bash
# Run directly (no install needed)
npx @microsoft/learn-cli search "semantic kernel overview"

# Or install globally, then run
npm install -g @microsoft/learn-cli
mslearn search "semantic kernel overview"
```

| MCP Tool | CLI Command |
|----------|-------------|
| `microsoft_docs_search(query: "...")` | `mslearn search "..."` |
| `microsoft_code_sample_search(query: "...", language: "...")` | `mslearn code-search "..." --language ...` |
| `microsoft_docs_fetch(url: "...")` | `mslearn fetch "..."` |

生成するSkillには、エージェントがどちらの経路も使えるよう、同じCLIフォールバック表を含める。

## 作成プロセス

### Step 1：トピックを調査する

Learn MCPツールを3段階で使い、深い理解を構築する:

**フェーズ1 - 範囲の発見:**
```
microsoft_docs_search(query="{technology} overview what is")
microsoft_docs_search(query="{technology} concepts architecture")
microsoft_docs_search(query="{technology} getting started tutorial")
```

**フェーズ2 - 中核コンテンツ:**
```
microsoft_docs_fetch(url="...")  # Fetch pages from Phase 1
microsoft_code_sample_search(query="{technology}", language="{lang}")
```

**フェーズ3 - 深掘り:**
```
microsoft_docs_search(query="{technology} best practices")
microsoft_docs_search(query="{technology} troubleshooting errors")
```

#### Investigation Checklist

調査後に次を確認する:
- [ ] Can explain what the technology does in one paragraph
- [ ] Identified 3-5 key concepts
- [ ] Have working code for basic usage
- [ ] Know the most common API patterns
- [ ] Have search queries for deeper topics

### Step 2：ユーザーと確認する

調査結果を示し、次を尋ねる:
1. 「次の重要領域を見つけました: [一覧]。どれを最も重視しますか？」
2. 「エージェントはこのSkillで主にどのようなタスクを行いますか？」
3. 「コードサンプルで優先するプログラミング言語は何ですか？」

### Step 3：Skillを生成する

Use the appropriate template from [skill-templates.md](references/skill-templates.md):

| Technology Type | Template |
|-----------------|----------|
| Client library, NuGet/npm package | SDK/Library |
| Azure resource | Azure Service |
| App development framework | Framework/Platform |
| REST API, protocol | API/Protocol |

#### Generated Skill Structure

```
{skill-name}/
├── SKILL.md                    # Core knowledge + Learn MCP guidance
├── references/                 # Detailed local documentation (if needed)
└── sample_codes/               # Working code examples
    ├── getting-started/
    └── common-patterns/
```

### Step 4：ローカル情報と動的情報のバランス

**ローカルに保存するもの:**
- Foundational (needed for any task)
- Frequently accessed
- Stable (won't change)
- Hard to find via search

**動的に保つもの:**
- Exhaustive reference (too large)
- Version-specific
- Situational (specific tasks only)
- Well-indexed (easy to search)

#### Content Guidelines

| Content Type | Local | Dynamic |
|--------------|-------|---------|
| Core concepts (3-5) | ✅ Full | |
| Hello world code | ✅ Full | |
| Common patterns (3-5) | ✅ Full | |
| Top API methods | Signature + example | Full docs via fetch |
| Best practices | Top 5 bullets | Search for more |
| Troubleshooting | | Search queries |
| Full API reference | | Doc links |

### Step 5：検証する

1. レビュー: ローカルコンテンツは一般的なタスクに十分か。
2. テスト: 提案した検索クエリは有用な結果を返すか。
3. 検証: コードサンプルはエラーなく実行できるか。

## 一般的な調査パターン

### For SDKs/Libraries
```
"{name} overview" → purpose, architecture
"{name} getting started quickstart" → setup steps
"{name} API reference" → core classes/methods
"{name} samples examples" → code patterns
"{name} best practices performance" → optimization
```

### For Azure Services
```
"{service} overview features" → capabilities
"{service} quickstart {language}" → setup code
"{service} REST API reference" → endpoints
"{service} SDK {language}" → client library
"{service} pricing limits quotas" → constraints
```

### For Frameworks/Platforms
```
"{framework} architecture concepts" → mental model
"{framework} project structure" → conventions
"{framework} tutorial walkthrough" → end-to-end flow
"{framework} configuration options" → customization
```

## 例：「Semantic Kernel」Skillの作成

### Investigation

```
microsoft_docs_search(query="semantic kernel overview")
microsoft_docs_search(query="semantic kernel plugins functions")
microsoft_code_sample_search(query="semantic kernel", language="csharp")
microsoft_docs_fetch(url="https://learn.microsoft.com/semantic-kernel/overview/")
```

### Generated Skill

```
semantic-kernel/
├── SKILL.md
└── sample_codes/
    ├── getting-started/
    │   └── hello-kernel.cs
    └── common-patterns/
        ├── chat-completion.cs
        └── function-calling.cs
```

### Generated SKILL.md

```markdown
---
name: semantic-kernel
description: Build AI agents with Microsoft Semantic Kernel. Use for LLM-powered apps with plugins, planners, and memory in .NET or Python.
---

# Semantic Kernel

Orchestration SDK for integrating LLMs into applications with plugins, planners, and memory.

## Key Concepts

- **Kernel**: Central orchestrator managing AI services and plugins
- **Plugins**: Collections of functions the AI can call
- **Planner**: Sequences plugin functions to achieve goals
- **Memory**: Vector store integration for RAG patterns

## Quick Start

See [getting-started/hello-kernel.cs](sample_codes/getting-started/hello-kernel.cs)

## Learn More

| Topic | How to Find |
|-------|-------------|
| Plugin development | `microsoft_docs_search(query="semantic kernel plugins custom functions")` |
| Planners | `microsoft_docs_search(query="semantic kernel planner")` |
| Memory | `microsoft_docs_fetch(url="https://learn.microsoft.com/en-us/semantic-kernel/frameworks/agent/agent-memory")` |

## CLI Alternative

If the Learn MCP server is not available, use the `mslearn` CLI instead:

| MCP Tool | CLI Command |
|----------|-------------|
| `microsoft_docs_search(query: "...")` | `mslearn search "..."` |
| `microsoft_code_sample_search(query: "...", language: "...")` | `mslearn code-search "..." --language ...` |
| `microsoft_docs_fetch(url: "...")` | `mslearn fetch "..."` |

Run directly with `npx @microsoft/learn-cli <command>` or install globally with `npm install -g @microsoft/learn-cli`.
```

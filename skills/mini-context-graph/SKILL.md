---
name: mini-context-graph
description: 'KarpathyのLLM Wikiパターンと構造化知識グラフを組み合わせた、永続的に蓄積する知識ベース。構造化されたナレッジグラフを組み合わせた、永続的に蓄積する知識ベース。ドキュメントを一度取り込むと、LLM が wiki ページを作成し、エンティティと関係をグラフへ抽出し、根拠を検索できるよう生のコンテンツを保存する。知識は蓄積・相互参照され、毎回ゼロから再導出されることはない。'
---

# Mini Context Graph スキル

## 中核となる考え方

標準的な RAG はクエリごとに知識をゼロから再発見します。このスキルは異なります。

1. **Wiki レイヤー** — LLM が永続的な Markdown ページ（要約、エンティティページ、トピックの統合）を作成・保守します。相互参照はすでに存在し、取り込みのたびに wiki が充実します。
2. **グラフレイヤー** — エンティティと関係を一度だけ抽出し、探索可能なナレッジグラフとして保存します。BFS トラバーサルは、ソースを再読せずに構造的な質問へ回答します。
3. **生ソースレイヤー** — 元のドキュメントをチャンク付きで不変に保存します。出所リンクにより、すべてのグラフノードとエッジが根拠となる正確なテキストへ結び付けられます。

> LLM が記述し、Python ツールがすべての管理処理を担います。

---

## 3つの層

| レイヤー | 場所 | LLM が行うこと | Python が行うこと |
|-------|-------|-------------------|-----------------|
| **生ソース** | `data/documents.json` | 読み取る（変更しない） | チャンクとメタデータを保存する |
| **Wiki** | `wiki/`（Markdown） | ページを作成・更新する | index.md と log.md を管理する |
| **グラフ** | `data/graph.json` | エンティティと関係を抽出する | 永続化、重複排除、トラバーサルを行う |

---

## ⚡ Agent向けクイックスタート

このワークフローの完全に実行可能な版は `scripts/template_agent_workflow.py` にあります。コピーして調整してください。

```python
from scripts.contextgraph import ContextGraphSkill
from scripts.tools import wiki_store

skill = ContextGraphSkill()

# ===== INGEST WITH FULL RAG + WIKI =====
# 1. Read references/ingestion.md and references/ontology.md first
# 2. Extract entities and relations (LLM reasoning step)
entities = [
    {"name": "memory leak",   "type": "issue",  "supporting_text": "memory leaks cause crashes"},
    {"name": "system crash",  "type": "issue",  "supporting_text": "system crashes due to memory leaks"},
]
relations = [
    {"source": "memory leak", "target": "system crash", "type": "causes",
     "confidence": 1.0, "supporting_text": "System crashes due to memory leaks."},
]

result = skill.ingest_with_content(
    doc_id="doc_001",
    title="System Crash Analysis",
    source="/docs/incident_report.pdf",
    raw_content="System crashes due to memory leaks. Memory leaks occur when objects are not released.",
    entities=entities,
    relations=relations,
)
# result = {"doc_id": "doc_001", "chunk_count": 1, "nodes_added": 2, "edges_added": 1}

# 3. Write a wiki summary page for this document
wiki_store.write_page(
    category="summary",
    title="System Crash Analysis Summary",
    content="""---
title: System Crash Analysis
source_document: doc_001
tags: [summary, incident]
---

# System Crash Analysis

**Source:** incident_report.pdf

## Key Claims

- [[memory-leak]] causes [[system-crash]] (confidence: 1.0)

## Entities

- [[memory-leak]] (issue)
- [[system-crash]] (issue)
""",
    summary="Incident report: memory leaks cause system crashes.",
)

# ===== QUERY WITH EVIDENCE =====
result = skill.query_with_evidence("Why does the system crash?")
# Returns: {"query": ..., "subgraph": ..., "supporting_documents": [...], "evidence_chain": ...}

# ===== WIKI SEARCH (read wiki before answering) =====
pages = wiki_store.search_wiki("memory leak")
# Returns: [{slug, category, path, snippet}, ...]
```

---

## 操作

### 取り込み

ユーザーが新しいドキュメントを提供した場合:

1. `references/ingestion.md` を読む — エンティティと関係の抽出規則。
2. `references/ontology.md` を読む — 型の正規化規則。
3. LLM の推論を使ってエンティティと関係を抽出する。
4. `skill.ingest_with_content(...)` を呼び出す — 生コンテンツ、チャンク、グラフノード、出所を保存する。
5. `wiki_store.write_page(category="summary", ...)` を使って **wiki の要約ページを作成する**。
6. **エンティティページを更新する** — 新規または更新されたエンティティごとに、`wiki_store.write_page(category="entity", ...)` を作成または更新する。
7. ドキュメントが既存の統合トピックに触れる場合は、**トピックページを更新する**。
8. 1 つのドキュメントの取り込みでは、通常 3～10 個の wiki ページを扱う。

### クエリ

ユーザーが質問した場合:

1. **まず wiki を確認する** — `wiki_store.search_wiki(query)` で関連ページを探して読む。
2. wiki に十分な回答があれば、wiki ページから統合して回答する（高速パス）。
3. より深いグラフトラバーサルが必要な場合は、`skill.query_with_evidence(query)` を呼び出す。
4. `supporting_documents` の根拠を引用して回答を返す。
5. 回答に価値があれば、新しい wiki トピックページとして保存する。

### Lint

定期的に wiki の健全性を確認します。

```python
from scripts.tools import wiki_store
issues = wiki_store.lint_wiki()
# Returns: {orphan_pages, missing_pages, broken_wikilinks, isolated_pages}
```

LLM に、壊れたリンク、孤立ページ、古い主張、欠落した相互参照をレビューして修正させます。完全な lint ワークフローは `references/lint.md` を参照してください。

---

## 取り込みの制約

- ❌ テキストに存在しないエンティティを幻覚しない
- ❌ 明示的なテキスト上の根拠なしに関係を追加しない
- ❌ 信頼度が 0.6 未満のエッジを追加しない
- ✅ すべてのエンティティと関係に `supporting_text` を指定する。これにより出所追跡が可能になる
- ✅ 取り込んだドキュメントごとに wiki の要約ページを作成する
- ✅ 新しい情報が到着したら既存のエンティティページを更新する
- ✅ 新しいデータが古い主張と矛盾する場合は、wiki ページで矛盾を明示する

---

## 取得の制約

- 🔒 トラバーサル深度は 2 を超えてはならない（設定: `MAX_GRAPH_DEPTH`）
- 🔒 信頼度が 0.6 以上のエッジだけを対象とする（設定: `MIN_CONFIDENCE`）
- 🔒 返すノードは最大 50 件（設定: `MAX_NODES`）
- ❌ グラフに存在しないノードやエッジを作り出さない

---

## Python API 完全リファレンス

| メソッド | 目的 | 使用する場面 |
|--------|---------|-------------|
| `skill.ingest_with_content(doc_id, title, source, raw_content, entities, relations)` | 完全な RAG 取り込み: 生ドキュメント、グラフ、出所 | 新規ドキュメントごと |
| `skill.add_node(name, node_type)` | 単一のエンティティを追加（出所なし） | ソースドキュメントなしの迅速な追加 |
| `skill.add_edge(source_name, target_name, relation, confidence)` | 単一の関係を追加 | ソースドキュメントなしの迅速な追加 |
| `skill.query(query)` | グラフのみの取得 → サブグラフ | 構造的な質問 |
| `skill.query_with_evidence(query)` | グラフと出所 → サブグラフとソースチャンク | 引用が必要な質問 |
| `wiki_store.write_page(category, title, content, summary)` | wiki ページを作成・更新 | 取り込み後および質問への回答後 |
| `wiki_store.read_page(category, title)` | wiki ページを読む | 回答前および相互参照時 |
| `wiki_store.search_wiki(query)` | wiki 全体をキーワード検索 | グラフトラバーサル前の高速パス |
| `wiki_store.list_pages(category)` | すべての wiki ページを一覧表示 | 概要の把握 |
| `wiki_store.get_log(last_n)` | 最近の操作を読む | wiki 履歴の理解 |
| `wiki_store.lint_wiki()` | 健全性確認 | 定期メンテナンス |
| `documents_store.list_documents()` | 取り込んだすべての生ソースを一覧表示 | 監査・出所確認 |
| `documents_store.search_chunks(query)` | チャンク単位で検索 | 特定の根拠を探す |

---

## 設計思想

> "The wiki is a persistent, compounding artifact. The cross-references are already there. The synthesis already reflects everything you've read." — Karpathy

| レイヤー | 行われること | 担当 |
|-------|-----------|-------------|
| **LLM の推論** | 抽出、統合、wiki ページの作成 | エージェント（`.md` ガイダンスファイル） |
| **Wiki の永続化** | インデックス、ログ、ファイル I/O | `wiki_store.py` |
| **グラフの永続化** | 重複排除、インデックス、BFS トラバーサル | `graph_store.py`、`retrieval_engine.py` |
| **生ソースの保存** | 不変ドキュメント、チャンク、出所 | `documents_store.py` |

人間がソースを選定して質問します。LLM が wiki を作成し、グラフを抽出し、引用付きで回答します。Python がすべての管理処理を担います。

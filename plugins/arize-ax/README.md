# Arize AX プラグイン

LLM の可観測性、評価、最適化のための Arize AX プラットフォームスキルです。トレースのエクスポート、計装、データセット、実験、評価器、AI プロバイダー統合、アノテーション、プロンプト最適化、Arize UI へのディープリンクに対応します。

## インストール

```bash
# Using Copilot CLI
copilot plugin install arize-ax@awesome-copilot
```

## 含まれるもの

### Skills

| Skill | Description |
|-------|-------------|
| `arize-trace` | Export and analyze Arize traces and spans for debugging LLM applications using the ax CLI. |
| `arize-instrumentation` | Add Arize AX tracing to applications using a two-phase agent-assisted workflow. |
| `arize-dataset` | Create, manage, and query versioned evaluation datasets using the ax CLI. |
| `arize-experiment` | Run experiments against datasets and compare results using the ax CLI. |
| `arize-evaluator` | Create and run LLM-as-judge evaluators for automated scoring of spans and experiments. |
| `arize-ai-provider-integration` | Store and manage LLM provider credentials for use with evaluators. |
| `arize-annotation` | Create annotation configs and bulk-apply human feedback labels to spans. |
| `arize-prompt-optimization` | Optimize LLM prompts using production trace data, evaluations, and annotations. |
| `arize-link` | Generate deep links to the Arize UI for traces, spans, sessions, datasets, and more. |

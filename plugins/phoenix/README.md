# Phoenix Plugin

LLMアプリケーションのデバッグ、評価、トレースに対応するPhoenix AIオブザーバビリティSkillです。CLIデバッグツール、LLM評価ワークフロー、OpenInferenceトレース計装を含みます。

## インストール

```bash
# Using Copilot CLI
copilot plugin install phoenix@awesome-copilot
```

## 含まれるもの

### Skills

| Skill | Description |
|-------|-------------|
| `phoenix-cli` | Debug LLM applications using the Phoenix CLI. Fetch traces, analyze errors, review experiments, inspect datasets, and query the GraphQL API. |
| `phoenix-evals` | Build and run evaluators for AI/LLM applications using Phoenix. |
| `phoenix-tracing` | OpenInference semantic conventions and instrumentation for Phoenix AI observability. |

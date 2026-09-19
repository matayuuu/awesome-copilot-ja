---
name: 'audit-integrity'
description: 'すべての AppSec エージェント向けの共有監査完全性フレームワークです。合理化防止ガード、自己批評ループ、再試行プロトコル、必須行動、自己内省品質ゲート（1～10 の採点、基準値 ≥8）、教訓とメモリのガバナンスを通じて、出力品質、知的誠実さ、継続的改善を徹底します。'
compatibility: 'Cross-platform. Works with any language or framework analyzed by AppSec agents.'
metadata:
  version: '1.0'
---

# 監査完全性 Skill

Enforces output quality, intellectual honesty, and continuous improvement across all AppSec agents.

## 使用する場面

- Every security analysis, code review, threat model, or quality scan agent run
- Applied automatically as a post-analysis quality gate
- Applicable to any agent performing SAST, SCA, threat modeling, or code quality analysis

## 構成要素

This skill provides 7 reusable capabilities. Agents apply all 7 unless their scope excludes a specific component.

| Component | Reference File | Purpose |
|-----------|---------------|---------|
| Clarification Protocol | [clarification-protocol.md](references/clarification-protocol.md) | Ask ≤2 targeted questions before analysis when scope is ambiguous |
| Anti-Rationalization Guard | [anti-rationalization-guard.md](references/anti-rationalization-guard.md) | Table of prohibited rationalizations with mandatory responses |
| Self-Critique Loop | [self-critique-loop.md](references/self-critique-loop.md) | Mandatory second-pass review after initial analysis |
| Retry Protocol | [retry-protocol.md](references/retry-protocol.md) | Tool failure handling — retry once, then document |
| Non-Negotiable Behaviors | [non-negotiable-behaviors.md](references/non-negotiable-behaviors.md) | Hard rules: never fabricate, always cite evidence, report gaps |
| Self-Reflection Quality Gate | [self-reflection-quality-gate.md](references/self-reflection-quality-gate.md) | 1–10 scoring rubric with ≥8 threshold per category |
| Self-Learning System | [self-learning-system.md](references/self-learning-system.md) | Lesson/Memory templates and governance rules |

## 実行フロー

1. **Before analysis**: Apply Clarification Protocol if scope is ambiguous
2. **During analysis**: Apply Anti-Rationalization Guard at every decision point
3. **After initial pass**: Execute Self-Critique Loop (mandatory second pass)
4. **On tool failure**: Apply Retry Protocol
5. **Before delivery**: Run Self-Reflection Quality Gate (all categories must score ≥8)
6. **After delivery**: Create Lessons/Memories for novel findings, false positives, or methodology gaps (see Self-Learning System)

## エージェント固有の適応

Each agent customizes the **Self-Critique Loop** checklist and **Self-Reflection Quality Gate** categories to match its domain. The reference files provide the base templates; agents extend them with domain-specific items.

### エージェント種別ごとの拡張例
- **SAST/SCA agents**: Add taint trace completeness and manifest coverage checks
- **SonarQube-style agents**: Add rating sanity check (A–E consistency with findings)
- **Threat modeling agents**: Add STRIDE category completeness per trust boundary
- **Code review agents**: Add trust boundary audit with data flow tracing

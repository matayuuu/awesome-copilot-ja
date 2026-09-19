# Arch プラグイン

ローカルに clone したリポジトリ向けのアーキテクチャとモダナイゼーションのツールキットです。ディスク上のコードから出典付きのアーキテクチャ文書を 1 つ作成し、アーキテクチャ文書がまだない場合は Documentation mode を自動実行してから、段階的なモダナイゼーション計画を生成します。

## インストール

```bash
copilot plugin install arch@awesome-copilot
```

## 含まれるもの

### Skills

- **`doc-and-modernize`** — Two complementary workflows for a locally-cloned repository, in one skill (installed via this plugin it surfaces as `arch:doc-and-modernize`):
  - **Documentation mode** — Produce one comprehensive, verifiable architecture document for a repository you already have checked out locally. Works local-first (prefers the local checkout, treating remote/API lookups as a flagged last resort), cites every claim to a file + line, flags unverified facts, resolves contradictions, and deep-dives the most complex subsystems. Ideal for onboarding docs and system-design maps.
  - **Modernization mode** — Generate a phased modernization plan for a legacy codebase. If a current architecture document exists it builds on it; otherwise it first runs the Documentation mode workflow to produce one, then continues to the plan. Produces per-feature migration docs, tech-stack recommendations with ADRs, and an adaptive, safety-laddered phased implementation plan.

## ソース

このプラグインは [Awesome Copilot](https://github.com/github/awesome-copilot) の一部です。

## ライセンス

MIT

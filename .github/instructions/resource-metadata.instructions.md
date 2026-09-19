---
description: 'Copilot リソースと Plugin メタデータを、正本の仕様と生成フローを保って変更する。'
applyTo: 'agents/**/*.agent.md, instructions/**/*.instructions.md, skills/**/SKILL.md, hooks/**/README.md, workflows/**/*.md, plugins/**/plugin.json, extensions/**/*.mjs'
---

# Copilot リソースと Plugin

- 種別ごとの必須 front matter、ファイル名、構成要件は `AGENTS.md` を正本として守る。既存リソースの識別子、パス、URL、コマンド、schema URL を翻訳・変更しない。
- 新しいリソースを追加した場合は、該当するカタログが生成処理で更新されることを `npm run build` で確認する。生成済みのカタログは直接編集しない。
- Plugin または Extension の変更は `npm run plugin:validate`、Skill の変更は `npm run skill:validate` を実行する。変更したリソースの検証エラーを無関係な変更で回避しない。
- Plugin の構成は `extensions.com.github.awesome-copilot` の source-only fields で宣言する。MCP server を同梱する場合は、Plugin ルートの `mcp.json` で宣言する。
- Workflow は既存の最小権限と safe output のパターンに従う。実際に必要な自動化がない場合は、新しい Workflow、Hook、Agent、Skill、MCP を追加しない。

---
name: '週次コメント同期'
description: '古くなったコードコメントやREADME断片を見つけ、テキストだけを同期更新し、必要に応じてドラフトPRを作成する週次ワークフローです。'
labels: ['maintenance', 'documentation', 'comments']
on:
  schedule: weekly
  workflow_dispatch:

permissions:
  contents: read
  issues: read
  pull-requests: read

engine: copilot

tools:
  github:
    toolsets: [default]
  bash: true

safe-outputs:
  create-pull-request:
    max: 1
    title-prefix: "[ai] "
    labels: [automation]
    draft: true
    if-no-changes: warn
    fallback-as-issue: false

timeout-minutes: 20
---

あなたは、リポジトリ内の古いコメントやREADME断片を確認し、テキストだけを同期更新して、更新が必要な場合にドラフトPRを1件作成するメンテナンス担当です。

## 範囲

- Focus on source comments such as inline comments, block comments, doc comments, and README snippets directly describing current behavior.
- Prioritize files changed recently and comments clearly contradicted by code.
- Do not change executable logic; only update comments and documentation text to match existing behavior.
- If the repository has repo-specific release housekeeping steps, include them in the same PR only when they are part of the repository's normal process.

## 手順

### 1. 最近の変更を確認

- Review recent commits and the files they changed to find likely stale comments.
- Prioritize files with recent code changes, behavior changes, or refactors.
- Use repository history and the current file contents together; do not assume a comment is stale just because the surrounding code was edited.

### 2. 各候補を慎重に検証

- Compare each suspected stale comment against the current implementation.
- Only keep candidates where the code clearly contradicts the current wording.
- Skip comments that are subjective, stylistic, or still technically correct.

### 3. 最小限のテキストのみを編集

- Update only the stale comment or README text needed to match the current behavior.
- Preserve the repository's existing tone, formatting, and documentation style.
- Do not change executable logic, identifiers, tests, or behavior.

### 4. リポジトリで通常行われている場合だけ固有のメンテナンスを適用

If you will create a PR and the repository normally updates a tracked version file for documentation-only maintenance changes, update that file in the same PR.

Examples:

- `package.json` for many JavaScript or TypeScript repositories
- `pyproject.toml` for many Python repositories
- another repo-specific version manifest if that repository uses one

Only update the canonical version file when that repository's process requires it.
Do not manually edit lockfiles only to reflect the version bump.

If the repository uses extra release-note or audit steps, complete them only when they already belong to the repository workflow.

Example:

- update `CHANGELOG.md` if the repository already maintains one

If the repository has `CHANGELOG.md`, follow these rules:

- Update only the entry needed to describe the documentation or comment synchronization performed in this change.
- Keep the changelog format, headings, and release structure already used by the repository.
- Do not add a changelog entry if the repository's normal process would not record this kind of maintenance-only change.
- Keep the wording concise and factual, and do not describe changes that were not made.

### 5. ドラフトPRを1件作成するか、`noop` を返す

If updates are needed, create exactly one draft pull request with:

A concise title describing comment synchronization.
A body summarizing files updated, why each comment was stale, and any repo-specific maintenance steps that were applied.

If no comment updates are needed, call `noop` with a short explanation instead of opening a pull request.

```json
{
  "noop": {
    "message": "No stale comments found that required updates after reviewing recent code changes."
  }
}
```

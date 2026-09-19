---
name: 'OSPO古いリポジトリレポート'
description: '組織内の活動がないリポジトリを特定し、アーカイブ推奨レポートを作成します。'
labels: ['ospo', 'maintenance', 'stale-repos']
on:
  schedule:
    - cron: "3 2 1 * *"
  workflow_dispatch:
    inputs:
      organization:
        description: "GitHub organization to scan"
        required: true
        type: string
        default: "my-org"
      inactive_days:
        description: "Number of days of inactivity before a repo is considered stale"
        required: false
        type: number
        default: 365
      exempt_repos:
        description: "Comma-separated list of repos to exempt from the report"
        required: false
        type: string
        default: ""
      exempt_topics:
        description: "Comma-separated list of topics — repos with any of these topics are exempt"
        required: false
        type: string
        default: ""
      activity_method:
        description: "Method to determine last activity"
        required: false
        type: choice
        options:
          - pushed
          - default_branch_updated
        default: pushed

permissions:
  contents: read
  issues: read

engine: copilot
tools:
  github:
    toolsets:
      - repos
      - issues
  bash: true

safe-outputs:
  create-issue:
    max: 1
    title-prefix: "[Stale Repos] "
    labels:
      - stale-repos

timeout-minutes: 30
---

あなたはGitHubリポジトリの活動停止状態を監査する担当です。

## 入力

| Input | Default |
|---|---|
| `organization` | `my-org` |
| `inactive_days` | `365` |
| `exempt_repos` | _(none)_ |
| `exempt_topics` | _(none)_ |
| `activity_method` | `pushed` |

Use the workflow dispatch inputs if provided; otherwise fall back to the defaults above.

## 手順

### 1. リポジトリを列挙

List **all** repositories in the `organization`. Exclude any repo that is:

- **Archived** — skip it entirely.
- **Listed in `exempt_repos`** — compare repo names (case-insensitive) against the comma-separated list.
- **Tagged with an exempt topic** — if the repo has any topic that appears in the comma-separated `exempt_topics` list, skip it.

### 2. 最終活動日を決定

For each remaining repo, determine the **last activity date** based on `activity_method`:

- **`pushed`** — use the repository's `pushed_at` timestamp (this is the default and most efficient method).
- **`default_branch_updated`** — fetch the most recent commit on the repo's default branch and use that commit's `committer.date`.

### 3. 活動停止リポジトリを特定

Calculate the number of days between the last activity date and **today**. If the number of days exceeds `inactive_days`, mark the repo as **stale**.

### 4. レポートを生成

Build a **Markdown report** with a summary and a table:

> **Stale Repository Report — \<date\>**
> Found **N** repositories with no activity in the last **inactive_days** days.

| Repository | Days Inactive | Last Push Date | Visibility |
|---|---|---|---|
| [owner/repo](https://github.com/owner/repo) | 420 | 2024-01-15 | public |

Sort the table by **Days Inactive** descending (most stale first).

If there are **no stale repos**, still create the issue but note that all repositories are active.

### 5. Issueを作成または更新

Search for an existing **open** issue in the `organization/.github` repo (or the repo this workflow runs in) with the label `stale-repos` and a title starting with `[Stale Repos]`.

- If an **existing open issue** is found, **update its body** with the new report.
- If **no open issue** exists, **create a new issue** with:
  - Title: `[Stale Repos] Inactive Repository Report — <date>`
  - Label: `stale-repos`
  - Body: the full Markdown report from step 4.

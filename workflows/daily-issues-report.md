---
name: "毎日のIssueレポート"
description: "オープンIssueと最近の活動の日次サマリーをGitHub Issueとして作成します"
on:
  schedule: daily on weekdays
permissions:
  contents: read
  issues: read
safe-outputs:
  create-issue:
    title-prefix: "[daily-report] "
    labels: [report]
---

## 毎日のIssueレポート

チーム向けにオープンIssueの日次サマリーを作成します。

## 含める内容

- 過去24時間に作成された新しいIssue
- クローズまたは解決されたIssue
- 対応が必要な古いIssue

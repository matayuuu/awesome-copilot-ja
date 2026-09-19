---
name: qdrant-monitoring
description: 'qdrant-monitoring に関する作業を支援する Skill です。対象のファイルや設定を確認し、必要な手順、検証方法、注意点を案内します。対象技術の調査、実装、運用、トラブルシューティングに使用します。'
allowed-tools:
  - Read
  - Grep
  - Glob
---

# Qdrant Monitoring

Qdrant monitoring allows tracking performance and health of your deployment, and identifying issues before they become outages. First determine whether you need to set up monitoring or diagnose an active issue.

- Understand available metrics [Monitoring docs](https://search.qdrant.tech/md/documentation/operations/monitoring/)


## Monitoring Setup

Prometheus scraping, health probes, Hybrid Cloud specifics, alerting, and log centralization. [Monitoring Setup](setup/SKILL.md)


## Debugging with Metrics

Optimizer stuck, memory growth, slow requests. Using metrics to diagnose active production issues. [Debugging with Metrics](debugging/SKILL.md)

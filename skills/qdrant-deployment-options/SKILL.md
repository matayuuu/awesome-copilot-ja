---
name: qdrant-deployment-options
description: 'qdrant-deployment-options に関する作業を支援する Skill です。対象のファイルや設定を確認し、必要な手順、検証方法、注意点を案内します。対象技術の調査、実装、運用、トラブルシューティングに使用します。'
---

# Which Qdrant Deployment Do I Need?

Start with what you need: managed ops or full control? Network latency acceptable or not? Production or prototyping? The answer narrows to one of four options.


## Getting Started or Prototyping

Use when: building a prototype, running tests, CI/CD pipelines, or learning Qdrant.

- Use local mode (Python only): zero-dependency, in-memory or disk-persisted, no server needed [Local mode](https://search.qdrant.tech/md/documentation/quickstart/)
- Local mode data format is NOT compatible with server. Do not use for production or benchmarking.
- For a real server locally, use Docker [Quick start](https://search.qdrant.tech/md/documentation/quickstart/?s=download-and-run)


## Going to Production (Self-Hosted)

Use when: you need full control over infrastructure, data residency, or custom configuration.

- Docker is the default deployment. Full Qdrant Open Source feature set, minimal setup. [Quick start](https://search.qdrant.tech/md/documentation/quickstart/?s=download-and-run)
- You own operations: upgrades, backups, scaling, monitoring
- Must set up distributed mode manually for multi-node clusters [Distributed deployment](https://search.qdrant.tech/md/documentation/operations/distributed_deployment/)
- Consider Hybrid Cloud if you want Qdrant Cloud management on your infrastructure [Hybrid Cloud](https://search.qdrant.tech/md/documentation/hybrid-cloud/)


## Going to Production (Zero-Ops)

Use when: you want managed infrastructure with zero-downtime updates, automatic backups, and resharding without operating clusters yourself.

- Qdrant Cloud handles upgrades, scaling, backups, and monitoring [Qdrant Cloud](https://search.qdrant.tech/md/documentation/cloud-quickstart/)
- Supports multi-version upgrades automatically
- Provides features not available in self-hosted: `/sys_metrics`, managed resharding, pre-configured alerts


## Need Lowest Possible Latency

Use when: network round-trip to a server is unacceptable. Edge devices, in-process search, or latency-critical applications.

- Qdrant EDGE: in-process bindings to Qdrant shard-level functions, no network overhead [Qdrant EDGE](https://search.qdrant.tech/md/documentation/edge/edge-quickstart/)
- Same data format as server. Can sync with server via shard snapshots.
- Single-node feature set only. No distributed mode.


## What NOT to Do

- Use local mode for production or benchmarking (not optimized, incompatible data format)
- Self-host without monitoring and backup strategy (you will lose data or miss outages)
- Choose EDGE when you need distributed search (single-node only)
- Pick Hybrid Cloud unless you have data residency requirements (unnecessary Kubernetes complexity when Qdrant Cloud works)

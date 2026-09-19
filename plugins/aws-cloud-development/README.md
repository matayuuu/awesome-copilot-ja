# AWS Cloud Development プラグイン

スケーラブルなクラウドアプリケーションを構築するための、Infrastructure as Code、サーバーレス関数、アーキテクチャパターン、コスト最適化を含む包括的な AWS クラウド開発ツールです。

## インストール

```bash
# Using Copilot CLI
copilot plugin install aws-cloud-development@awesome-copilot
```

## 含まれるもの

### コマンド（スラッシュコマンド）

| Command | Description |
|---------|-------------|
| `/aws-cloud-development:aws-cost-optimize` | Analyze AWS resources used in the app (IaC files and/or resources in a target account/region) and optimize costs - creating GitHub issues for identified optimizations. |
| `/aws-cloud-development:aws-resource-health-diagnose` | Analyze AWS resource health, diagnose issues from CloudWatch logs and metrics, and create a remediation plan for identified problems. |
| `/aws-cloud-development:aws-resource-query` | Query any AWS resource using natural language (EC2, S3, RDS, Lambda, VPC, IAM, Secrets Manager, and more). Strictly read-only — no writes or deletes. |
| `/aws-cloud-development:aws-well-architected-review` | Perform an AWS Well-Architected Framework review of the current workload IaC and architecture, generating findings and GitHub issues for improvements. |

### Agents

| Agent | Description |
|-------|-------------|
| `aws-principal-architect` | Provide expert AWS Principal Architect guidance using AWS Well-Architected Framework principles and AWS best practices. |
| `aws-serverless-architect` | Provide expert AWS Serverless Architect guidance focusing on event-driven architectures, Lambda, API Gateway, and serverless best practices. |
| `terraform-aws-planning` | Act as implementation planner for your AWS Terraform Infrastructure as Code task. |
| `terraform-aws-implement` | Act as an AWS Terraform Infrastructure as Code coding specialist that creates and reviews Terraform for AWS resources. |

## ソース

このプラグインは、コミュニティ主導の GitHub Copilot 拡張機能コレクションである [Awesome Copilot](https://github.com/github/awesome-copilot) の一部です。

## ライセンス

MIT

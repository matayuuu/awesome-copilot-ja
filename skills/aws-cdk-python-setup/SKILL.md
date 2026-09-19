---
name: aws-cdk-python-setup
description: 'Python で AWS CDK（Cloud Development Kit）アプリケーションを開発するためのセットアップと初期化ガイドです。環境の前提条件を構成し、新しい CDK プロジェクトを作成し、依存関係を管理して AWS にデプロイできるようにします。'
---
# AWS CDK Python セットアップ手順

この Skill は **Python** を使う **AWS CDK（Cloud Development Kit）** プロジェクトの作業に必要なセットアップ手順を提供します。

---

## 前提条件

Before starting, ensure the following tools are installed:

- **Node.js** ≥ 14.15.0 — Required for the AWS CDK CLI
- **Python** ≥ 3.7 — Used for writing CDK code
- **AWS CLI** — Manages credentials and resources
- **Git** — Version control and project management

---

## インストール手順

### 1. AWS CDK CLI をインストール
```bash
npm install -g aws-cdk
cdk --version
```

### 2. AWS 認証情報を構成
```bash
# Install AWS CLI (if not installed)
brew install awscli

# Configure credentials
aws configure
```
Enter your AWS Access Key, Secret Access Key, default region, and output format when prompted.

### 3. 新しい CDK プロジェクトを作成
```bash
mkdir my-cdk-project
cd my-cdk-project
cdk init app --language python
```

Your project will include:
- `app.py` — Main application entry point
- `my_cdk_project/` — CDK stack definitions
- `requirements.txt` — Python dependencies
- `cdk.json` — Configuration file

### 4. Python 仮想環境をセットアップ
```bash
# macOS/Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

### 5. Python 依存関係をインストール
```bash
pip install -r requirements.txt
```
Primary dependencies:
- `aws-cdk-lib` — Core CDK constructs
- `constructs` — Base construct library

---

## 開発ワークフロー

### CloudFormation テンプレートを合成
```bash
cdk synth
```
Generates `cdk.out/` containing CloudFormation templates.

### スタックを AWS にデプロイ
```bash
cdk deploy
```
Reviews and confirms deployment to the configured AWS account.

### ブートストラップ（初回デプロイのみ）
```bash
cdk bootstrap
```
Prepares environment resources like S3 buckets for asset storage.

---

## ベストプラクティス

- Always activate the virtual environment before working.
- Run `cdk diff` before deployment to preview changes.
- Use development accounts for testing.
- Follow Pythonic naming and directory conventions.
- Keep `requirements.txt` pinned for consistent builds.

---

## トラブルシューティングのヒント

If issues occur, check:

- AWS credentials are correctly configured.
- Default region is set properly.
- Node.js and Python versions meet minimum requirements.
- Run `cdk doctor` to diagnose environment issues.

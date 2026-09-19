---
name: terraform-azurerm-set-diff-analyzer
description: 'AzureRM ProviderのTerraform plan JSON出力を分析し、誤検出された差分（Set型属性の順序だけの変更）と実際のリソース変更を区別します。Application Gateway、Load Balancer、Firewall、Front Door、NSGなど、内部順序の変更による不要な差分が発生するSet型属性を持つAzureリソースのterraform plan出力をレビューするときに使います。'
license: MIT
---
# Terraform AzureRM Set差分アナライザー

AzureRM ProviderのSet型属性が原因でTerraform planに現れる「誤検出された差分」を特定し、実際の変更と区別するSkillです。

## 使う場面

- 1つの要素を追加または削除しただけなのに、`terraform plan` に多数の変更が表示される
- Application Gateway、Load Balancer、NSGなどで「すべての要素が変更された」と表示される
- CI/CDで誤検出された差分を自動的に除外したい

## 背景

TerraformのSet型はキーではなく位置で比較するため、要素を追加または削除すると、すべての要素が「変更された」と表示されます。これはTerraform全般の問題ですが、Application Gateway、Load Balancer、NSGのようにSet型属性を多用するAzureRMリソースで特に目立ちます。

これらの「誤検出された差分」は実際のリソースには影響しませんが、terraform planの出力レビューを難しくします。

## 前提条件

- Python 3.8+

Pythonが利用できない場合は、パッケージマネージャー（例: `apt install python3`、`brew install python3`）または[python.org](https://www.python.org/downloads/)からインストールします。

## 基本的な使い方

```bash
# 1. plan JSON出力を生成
terraform plan -out=plan.tfplan
terraform show -json plan.tfplan > plan.json

# 2. 分析
python scripts/analyze_plan.py plan.json
```

## トラブルシューティング

- **`python: command not found`**: 代わりに `python3` を使うか、Pythonをインストールする
- **`ModuleNotFoundError`**: スクリプトは標準ライブラリだけを使うため、Python 3.8以降であることを確認する

## 詳細ドキュメント

- [scripts/README.md](scripts/README.md) - すべてのオプション、出力形式、終了コード、CI/CDの例
- [references/azurerm_set_attributes.md](references/azurerm_set_attributes.md) - 対応するリソースと属性

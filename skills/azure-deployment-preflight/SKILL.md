---
name: azure-deployment-preflight
description: 'テンプレート構文の検証、what-if 分析、権限確認を含む Azure Bicep デプロイの包括的な事前検証を実施します。Azure へのデプロイ前に変更をプレビューし、潜在的な問題を特定して、デプロイが成功することを確認するために使用します。Azure デプロイ、Bicep ファイルの検証、デプロイ権限の確認、インフラストラクチャ変更のプレビュー、what-if、azd provision の準備に言及されたときに有効化します。'
---

# Azure デプロイ事前検証

This skill validates Bicep deployments before execution, supporting both Azure CLI (`az`) and Azure Developer CLI (`azd`) workflows.

## この Skill を使用する場面

- Before deploying infrastructure to Azure
- When preparing or reviewing Bicep files
- To preview what changes a deployment will make
- To verify permissions are sufficient for deployment
- Before running `azd up`, `azd provision`, or `az deployment` commands

## 検証プロセス

Follow these steps in order. Continue to the next step even if a previous step fails—capture all issues in the final report.

### ステップ 1: プロジェクト種別を検出

Determine the deployment workflow by checking for project indicators:

1. **Check for azd project**: Look for `azure.yaml` in the project root
   - If found → Use **azd workflow**
   - If not found → Use **az CLI workflow**

2. **Locate Bicep files**: Find all `.bicep` files to validate
   - For azd projects: Check `infra/` directory first, then project root
   - For standalone: Use the file specified by the user or search common locations (`infra/`, `deploy/`, project root)

3. **Auto-detect parameter files**: For each Bicep file, look for matching parameter files:
   - `<filename>.bicepparam` (Bicep parameters - preferred)
   - `<filename>.parameters.json` (JSON parameters)
   - `parameters.json` or `parameters/<env>.json` in same directory

### ステップ 2: Bicep 構文を検証

Run Bicep CLI to check template syntax before attempting deployment validation:

```bash
bicep build <bicep-file> --stdout
```

**What to capture:**
- Syntax errors with line/column numbers
- Warning messages
- Build success/failure status

**If Bicep CLI is not installed:**
- Note the issue in the report
- Continue to Step 3 (Azure will validate syntax during what-if)

### ステップ 3: 事前検証を実行

Choose the appropriate validation based on project type detected in Step 1.

#### For azd Projects (azure.yaml exists)

Use `azd provision --preview` to validate the deployment:

```bash
azd provision --preview
```

If an environment is specified or multiple environments exist:
```bash
azd provision --preview --environment <env-name>
```

#### For Standalone Bicep (no azure.yaml)

Determine the deployment scope from the Bicep file's `targetScope` declaration:

| Target Scope | Command |
|--------------|---------|
| `resourceGroup` (default) | `az deployment group what-if` |
| `subscription` | `az deployment sub what-if` |
| `managementGroup` | `az deployment mg what-if` |
| `tenant` | `az deployment tenant what-if` |

**Run with Provider validation level first:**

```bash
# Resource Group scope (most common)
az deployment group what-if \
  --resource-group <rg-name> \
  --template-file <bicep-file> \
  --parameters <param-file> \
  --validation-level Provider

# Subscription scope
az deployment sub what-if \
  --location <location> \
  --template-file <bicep-file> \
  --parameters <param-file> \
  --validation-level Provider

# Management Group scope
az deployment mg what-if \
  --location <location> \
  --management-group-id <mg-id> \
  --template-file <bicep-file> \
  --parameters <param-file> \
  --validation-level Provider

# Tenant scope
az deployment tenant what-if \
  --location <location> \
  --template-file <bicep-file> \
  --parameters <param-file> \
  --validation-level Provider
```

**Fallback Strategy:**

If `--validation-level Provider` fails with permission errors (RBAC), retry with `ProviderNoRbac`:

```bash
az deployment group what-if \
  --resource-group <rg-name> \
  --template-file <bicep-file> \
  --validation-level ProviderNoRbac
```

Note the fallback in the report—the user may lack full deployment permissions.

### ステップ 4: What-if 結果を取得

Parse the what-if output to categorize resource changes:

| Change Type | Symbol | Meaning |
|-------------|--------|---------|
| Create | `+` | New resource will be created |
| Delete | `-` | Resource will be deleted |
| Modify | `~` | Resource properties will change |
| NoChange | `=` | Resource unchanged |
| Ignore | `*` | Resource not analyzed (limits reached) |
| Deploy | `!` | Resource will be deployed (changes unknown) |

For modified resources, capture the specific property changes.

### ステップ 5: レポートを生成

Create a Markdown report file in the **project root** named:
- `preflight-report.md`

Use the template structure from [references/REPORT-TEMPLATE.md](references/REPORT-TEMPLATE.md).

**Report sections:**
1. **Summary** - Overall status, timestamp, files validated, target scope
2. **Tools Executed** - Commands run, versions, validation levels used
3. **Issues** - All errors and warnings with severity and remediation
4. **What-If Results** - Resources to create/modify/delete/unchanged
5. **Recommendations** - Actionable next steps

## 必須情報

Before running validation, gather:

| Information | Required For | How to Obtain |
|-------------|--------------|---------------|
| Resource Group | `az deployment group` | Ask user or check existing `.azure/` config |
| Subscription | All deployments | `az account show` or ask user |
| Location | Sub/MG/Tenant scope | Ask user or use default from config |
| Environment | azd projects | `azd env list` or ask user |

If required information is missing, prompt the user before proceeding.

## エラー処理

See [references/ERROR-HANDLING.md](references/ERROR-HANDLING.md) for detailed error handling guidance.

**Key principle:** Continue validation even when errors occur. Capture all issues in the final report.

| Error Type | Action |
|------------|--------|
| Not logged in | Note in report, suggest `az login` or `azd auth login` |
| Permission denied | Fall back to `ProviderNoRbac`, note in report |
| Bicep syntax error | Include all errors, continue to other files |
| Tool not installed | Note in report, skip that validation step |
| Resource group not found | Note in report, suggest creating it |

## ツール要件

This skill uses the following tools:

- **Azure CLI** (`az`) - Version 2.76.0+ recommended for `--validation-level`
- **Azure Developer CLI** (`azd`) - For projects with `azure.yaml`
- **Bicep CLI** (`bicep`) - For syntax validation
- **Azure MCP Tools** - For documentation lookups and best practices

Check tool availability before starting:
```bash
az --version
azd version
bicep --version
```

## ワークフロー例

1. User: "Validate my Bicep deployment before I run it"
2. Agent detects `azure.yaml` → azd project
3. Agent finds `infra/main.bicep` and `infra/main.bicepparam`
4. Agent runs `bicep build infra/main.bicep --stdout`
5. Agent runs `azd provision --preview`
6. Agent generates `preflight-report.md` in project root
7. Agent summarizes findings to user

## 参考ドキュメント

- [Validation Commands Reference](references/VALIDATION-COMMANDS.md)
- [Report Template](references/REPORT-TEMPLATE.md)
- [Error Handling Guide](references/ERROR-HANDLING.md)

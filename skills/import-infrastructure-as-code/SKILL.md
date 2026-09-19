---
name: import-infrastructure-as-code
description: 'Azure CLIによる探索とAzure Verified Modules（AVM）を使って既存のAzureリソースをTerraformへインポートする。稼働中のAzureインフラの逆解析、既存のサブスクリプション/リソースグループ/リソースIDからのInfrastructure as Code生成、依存関係の対応付け、ダウンロードしたモジュールソースからの正確なインポートアドレス導出、構成ドリフト防止、任意のAzureリソース種別向けに検証・計画可能なAVMベースTerraformファイルの作成に使う。'
---

# Infrastructure as Codeのインポート（Azure -> AVMを使ったTerraform）

探索データとAzure Verified Modulesを使って、既存のAzureインフラを保守可能なTerraformコードへ変換する。

## このSkillを使う場面

次の依頼を受けたときに使用する。

- 既存のAzureリソースをTerraformへインポートする
- 稼働中のAzure環境からIaCを生成する
- AVMがサポートする任意のAzureリソース種別を扱う（正当な非AVMフォールバックは記録する）
- サブスクリプションまたはリソースグループからインフラを再作成する
- 探索したAzureリソース間の依存関係を対応付ける
- 手書きの `azurerm_*` リソースではなくAVMモジュールを使う

## 前提条件

- Azure CLIがインストールされ、認証済みである（`az login`）
- 対象のサブスクリプションまたはリソースグループへのアクセス
- Terraform CLIがインストールされている
- Terraform RegistryとAVMインデックスソースへのネットワークアクセス

## 入力

| パラメーター | 必須 | 既定値 | 説明 |
|---|---|---|---|
| `subscription-id` | いいえ | CLIのアクティブなコンテキスト | サブスクリプション範囲の探索とコンテキスト設定に使うAzureサブスクリプション |
| `resource-group-name` | いいえ | なし | リソースグループ範囲の探索に使うAzureリソースグループ |
| `resource-id` | いいえ | なし | 特定リソース範囲の探索に使う1つ以上のAzure ARMリソースID |

`subscription-id`、`resource-group-name`、`resource-id` のいずれか1つ以上が必要。

## 手順

### 1) 必要な範囲を収集する（必須）

探索コマンドを実行する前に、次のいずれかの範囲を指定してもらう。

- Subscription scope: `<subscription-id>`
- Resource group scope: `<resource-group-name>`
- Specific resources scope: one or more `<resource-id>` values

範囲の扱いに関するルール:

- Azure ARMリソースID（例 `/subscriptions/.../providers/...`）はローカルファイルシステムのパスではなく、クラウドリソース識別子として扱う。
- リソースIDはAzure CLIの `--ids` 引数でのみ使う（例 `az resource show --ids <resource-id>`）。
- ユーザーがローカルファイルパスだと明示しない限り、リソースIDをファイル読み取りコマンド（`cat`、`ls`、`read_file`、glob検索）へ渡さない。
- ユーザーが有効な範囲を1つ指定済みなら、コマンド失敗で必要にならない限り追加の範囲入力を求めない。
- すでに指定された範囲の値から答えられる追加質問をしない。

範囲が不足している場合は明示的に求め、停止する。

### 2) 認証してコンテキストを設定する

選択した範囲に必要なコマンドだけを実行する。

For subscription scope:

```bash
az login
az account set --subscription <subscription-id>
az account show --query "{subscriptionId:id, name:name, tenantId:tenantId}" -o json
```

期待される出力: `subscriptionId`、`name`、`tenantId` を含むJSONオブジェクト。

リソースグループまたは特定リソースの範囲でも `az login` は必要だが、アクティブなコンテキストが正しければ `az account set` は省略できる。

特定リソースの範囲では、まず `--ids` ベースの直接コマンドを優先し、具体的なコマンドに必要でない限りサブスクリプションやリソースグループについて追加の探索を求めない。

### 3) 探索コマンドを実行する

選択した範囲でリソースを探索する。正確なTerraform生成に必要な情報をすべて取得する。

```bash
# Subscription scope
az resource list --subscription <subscription-id> -o json

# Resource group scope
az resource list --resource-group <resource-group-name> -o json

# Specific resource scope
az resource show --ids <resource-id-1> <resource-id-2> ... -o json
```

期待される出力: Azureリソースのメタデータ（`id`、`type`、`name`、`location`、`tags`、`properties`）を含むJSONオブジェクトまたは配列。

### 4) コード生成前に依存関係を解決する

エクスポートしたJSONを解析し、次を対応付ける。

- 親子関係（例: NIC -> Subnet -> VNet）
- `properties` 内のリソース間参照
- Terraformで作成する順序

重要: 次の文書を生成し、プロジェクトルートのdocsフォルダーに保存する。
- `exported-resources.json`: 探索したすべてのリソースと、依存関係・参照を含むメタデータ。
- `EXPORTED-ARCHITECTURE.MD`: 探索したリソースと関係に基づく、人が読めるアーキテクチャ概要。

### 5) Azure Verified Modulesを選択する（必須）

各リソース種別で最新のAVMバージョンを使う。

### Terraform Registry

- 「avm」+ リソース名で検索する
- 「Partner」タグで絞り込み、公式AVMモジュールを探す
- 例: 「avm storage account」で検索 → Partnerで絞り込む

### 公式AVMインデックス

> **注:** 以下のリンクは常にmainブランチのCSVファイル最新版を指す。そのためファイルは時間とともに変わる可能性がある。特定時点の版が必要なら、URLに特定のリリースタグを使うことを検討する。

- **Terraform Resource Modules**: `https://raw.githubusercontent.com/Azure/Azure-Verified-Modules/refs/heads/main/docs/static/module-indexes/TerraformResourceModules.csv`
- **Terraform Pattern Modules**: `https://raw.githubusercontent.com/Azure/Azure-Verified-Modules/refs/heads/main/docs/static/module-indexes/TerraformPatternModules.csv`
- **Terraform Utility Modules**: `https://raw.githubusercontent.com/Azure/Azure-Verified-Modules/refs/heads/main/docs/static/module-indexes/TerraformUtilityModules.csv`

### 個別モジュールの情報

`.terraform`フォルダーに情報がない場合は、`web`ツールまたは適切なMCPメソッドでモジュール情報を取得する。

Use AVM sources:

- Registry: `https://registry.terraform.io/modules/Azure/<module>/azurerm/latest`
- GitHub: `https://github.com/Azure/terraform-azurerm-avm-res-<service>-<resource>`

AVMモジュールが存在する場合は、手書きの `azurerm_*` リソースよりAVMモジュールを優先する。

When fetching module information from GitHub repositories, the README.md file in the root of the repository typically contains all detailed information about the module, for example: https://raw.githubusercontent.com/Azure/terraform-azurerm-avm-res-<service>-<resource>/refs/heads/main/README.md

### 5a) コードを書く前にモジュールREADMEを読む（必須）

**この手順は省略できない。** モジュールのHCLを1行でも書く前に、そのモジュールのREADME全体を取得して読む。raw `azurerm` プロバイダーの知識や、他のAVMモジュールでの経験に頼らない。

For each selected AVM module, fetch its README:

```text
https://raw.githubusercontent.com/Azure/terraform-azurerm-avm-res-<service>-<resource>/refs/heads/main/README.md
```

Or if the module is already downloaded after `terraform init`:

```bash
cat .terraform/modules/<module_key>/README.md
```

コードを書く**前に**READMEから次を抽出して記録する。

1. **Required Inputs** — モジュールが必要とするすべての入力。ここに記載された子リソース（NIC、拡張機能、サブネット、パブリックIP）はモジュール**内部で**管理される。これらのリソース用に独立したモジュールブロックを**作成しない**。
2. **Optional Inputs** — 正確なTerraform変数名と宣言された `type`。raw `azurerm` プロバイダーの引数名やブロック形状と一致すると仮定しない。
3. **Usage examples** — 使用するリソースグループ識別子（`parent_id` と `resource_group_name` のどちらか）、子リソースの表現方法（インラインマップか別モジュールか）、各入力が期待する構文を確認する。

#### Apply module rules as patterns, not assumptions

Use the lessons below as examples of the *type* of mismatch that often causes imports to fail.
Do not assume these exact names apply to every AVM module. Always verify each selected module's
README and `variables.tf`.

**`avm-res-compute-virtualmachine` (any version)**

- `network_interfaces` is a **Required Input**. NICs are owned by the VM module. Never
	create standalone `avm-res-network-networkinterface` modules alongside a VM module —
	define every NIC inline under `network_interfaces`.
- TrustedLaunch is expressed through the top-level booleans `secure_boot_enabled = true`
	and `vtpm_enabled = true`. The `security_type` argument exists only under `os_disk` for
	Confidential VM disk encryption and must not be used for TrustedLaunch.
- `boot_diagnostics` is a `bool`, not an object. Use `boot_diagnostics = true`; use the
	separate `boot_diagnostics_storage_account_uri` variable if a storage URI is needed.
- Extensions are managed inside the module via the `extensions` map. Do not create
	standalone extension resources.

**`avm-res-network-virtualnetwork` (any version)**

- This module is backed by the AzAPI provider, not `azurerm`. Use `parent_id` (the full
	resource group resource ID string) to specify the resource group, not `resource_group_name`.
- Every example in the README shows `parent_id`; none show `resource_group_name`.

Generalized takeaway for all AVM modules:

- Determine child resource ownership from **Required Inputs** before creating sibling modules.
- Determine accepted variable names and types from **Optional Inputs** and `variables.tf`.
- Determine identifier style and input shape from README usage examples.
- Do not infer argument names from raw `azurerm_*` resources.

### 6) Terraformファイルを生成する

### インポートブロックを書く前にモジュールソースを調べる（必須）

`terraform init`でモジュールがダウンロードされたら、各モジュールのソースファイルを調べて正確なTerraformリソースアドレスを特定してから `import {}` ブロックを書く。記憶だけでインポートアドレスを書かない。

#### 手順A — プロバイダーとリソースラベルを特定する

```bash
grep "^resource" .terraform/modules/<module_key>/main*.tf
```

これにより、モジュールが `azurerm_*` と `azapi_resource` のどちらのラベルを使うか分かる。たとえば `avm-res-network-virtualnetwork` は `azurerm_virtual_network "this"` ではなく `azapi_resource "vnet"` を公開する。

#### 手順B — 子モジュールとネストしたパスを特定する

```bash
grep "^module" .terraform/modules/<module_key>/main*.tf
```

子リソース（サブネット、拡張機能など）がサブモジュールで管理される場合、インポートアドレスにはすべての中間モジュールラベルを含める。

```text
module.<root_module_key>.module.<child_module_key>["<map_key>"].<resource_type>.<label>[<index>]
```

#### 手順C — `count` と `for_each` を確認する

```bash
grep -n "count\|for_each" .terraform/modules/<module_key>/main*.tf
```

`count` を使うリソースにはインポートアドレスのインデックスが必要。`count = 1`（例: LinuxとWindowsの条件付き選択）の場合、アドレスは `[0]` で終わる。`for_each` を使うリソースでは数値インデックスではなく文字列キーを使う。

#### 既知のインポートアドレスパターン（学習結果の例）

これはあくまで例。推論のテンプレートとして使い、現在のインポートで使うモジュールのダウンロード済みソースコードから正確なアドレスを導出する。

| Resource | Correct import `to` address pattern |
|---|---|
| AzAPI-backed VNet | `module.<vnet_key>.azapi_resource.vnet` |
| Subnet (nested, count-based) | `module.<vnet_key>.module.subnet["<subnet_name>"].azapi_resource.subnet[0]` |
| Linux VM (count-based) | `module.<vm_key>.azurerm_linux_virtual_machine.this[0]` |
| VM NIC | `module.<vm_key>.azurerm_network_interface.virtualmachine_network_interfaces["<nic_key>"]` |
| VM extension (default deploy_sequence=5) | `module.<vm_key>.module.extension["<ext_name>"].azurerm_virtual_machine_extension.this` |
| VM extension (deploy_sequence=1–4) | `module.<vm_key>.module.extension_<n>["<ext_name>"].azurerm_virtual_machine_extension.this` |
| NSG-NIC association | `module.<vm_key>.azurerm_network_interface_security_group_association.this["<nic_key>-<nsg_key>"]` |

Produce:

- `providers.tf` with `azurerm` provider and required version constraints
- `main.tf` with AVM module blocks and explicit dependencies
- `variables.tf` for environment-specific values
- `outputs.tf` for key IDs and endpoints
- `terraform.tfvars.example` with placeholder values

### 稼働中のプロパティをモジュールの既定値と比較する（必須）

初期構成を書いた後、探索した各稼働中リソースのすべての非ゼロプロパティを、対応するAVMモジュールの `variables.tf` に宣言された既定値と比較する。稼働中の値がモジュールの既定値と異なるプロパティは、Terraform構成で明示的に設定する。

Pay particular attention to the following property categories, which are common sources
of silent configuration drift:

- **Timeout values** (e.g., Public IP `idle_timeout_in_minutes` defaults to `4`; live
	deployments often use `30`)
- **Network policy flags** (e.g., subnet `private_endpoint_network_policies` defaults to
	`"Enabled"`; existing subnets often have `"Disabled"`)
- **SKU and allocation** (e.g., Public IP `sku`, `allocation_method`)
- **Availability zones** (e.g., VM zone, Public IP zone)
- **Redundancy and replication** settings on storage and database resources

Retrieve full live properties with explicit `az` commands, for example:

```bash
az network public-ip show --ids <resource_id> --query "{idleTimeout:idleTimeoutInMinutes, sku:sku.name, zones:zones}" -o json
az network vnet subnet show --ids <resource_id> --query "{privateEndpointPolicies:privateEndpointNetworkPolicies, delegation:delegations}" -o json
```

Do not rely solely on `az resource list` output, which may omit nested or computed properties.

Pin module versions explicitly:

```hcl
module "example" {
	source  = "Azure/<module>/azurerm"
	version = "<latest-compatible-version>"
}
```

### 7) 生成コードを検証する

Run:

```bash
terraform init
terraform fmt -recursive
terraform validate
terraform plan
```

期待される出力: 構文エラーと検証エラーがなく、探索したインフラの意図に一致するプラン。

## トラブルシューティング

| 問題 | 考えられる原因 | 対処 |
|---|---|---|
| `az` command fails with authorization errors | Wrong tenant/subscription or missing RBAC role | Re-run `az login`, verify subscription context, confirm required permissions |
| Discovery output is empty | Incorrect scope or no resources in scope | Re-check scope input and run scoped list/show command again |
| No AVM module found for a resource type | Resource type not yet covered by AVM | Use native `azurerm_*` resource for that type and document the gap |
| `terraform validate` fails | Missing variables or unresolved dependencies | Add required variables and explicit dependencies, then re-run validation |
| Unknown argument or variable not found in module | AVM variable name differs from `azurerm` provider argument name | Read the module README `variables.tf` or Optional Inputs section for the correct name |
| Import block fails — resource not found at address | Wrong provider label (`azurerm_` vs `azapi_`), missing sub-module path, or missing `[0]` index | Run `grep "^resource" .terraform/modules/<key>/main*.tf` and `grep "^module"` to find exact address |
| `terraform plan` shows unexpected `~ update` on imported resource | Live value differs from AVM module default | Fetch live property with `az <resource> show`, compare to module default, add explicit value |
| Child-resource module gives "provider configuration not present" | Child resources declared as standalone modules even though parent module owns them | Check Required Inputs in README, remove incorrect standalone modules, and model child resources using the parent module's documented input structure |
| Nested child resource import fails with "resource not found" | Missing intermediate module path, wrong map key, or missing index | Inspect module blocks and `count`/`for_each` in source; build full nested import address including all module segments and required key/index |
| Tool tries to read ARM resource ID as file path or asks repeated scope questions | Resource ID not treated as `--ids` input, or agent did not trust already-provided scope | Treat ARM IDs strictly as cloud identifiers, use `az ... --ids ...`, and stop re-prompting once one valid scope is present |

## 応答の契約

結果を返すときは次を示す。

1. Scope used (subscription, resource group, or resource IDs)
2. Discovery files created
3. Resource types detected
4. AVM modules selected with versions
5. Terraform files generated or updated
6. Validation command results
7. Open gaps requiring user input (if any)

## Agentの実行ルール

- 範囲が不足している場合は続行しない。
- 探索したファイルと検証出力を列挙せずにインポート成功と主張しない。
- Terraform生成前の依存関係対応付けを省略しない。
- まずAVMモジュールを優先し、各非AVMフォールバックを明示的に正当化する。
- **Read the README for every AVM module before writing code.** Required Inputs identify
	which child resources the module owns. Optional Inputs document exact variable names and
	types. Usage examples show provider-specific conventions (`parent_id` vs
	`resource_group_name`). Skipping the README is the single most common cause of
	code errors in AVM-based imports.
- **Never assume NIC, extension, or public IP resources are standalone.** For
	any AVM module, treat child resources as parent-owned unless the README explicitly indicates
	a separate module is required. Check Required Inputs before creating sibling modules.
- **Never write import addresses from memory.** After `terraform init`, grep the downloaded
	module source to discover the actual provider (`azurerm` vs `azapi`), resource labels,
	sub-module nesting, and `count` vs `for_each` usage before writing any `import {}` block.
- **Never treat ARM resource IDs as file paths.** Resource IDs belong in Azure CLI `--ids`
	arguments and API queries, not file IO tools. Only read local files when a real workspace
	path is provided.
- **Minimize prompts when scope is already known.** If subscription, resource group, or
	specific resource IDs are already provided, proceed with commands directly and only ask a
	follow-up when a command fails due to missing required context.
- **Do not declare the import complete until `terraform plan` shows 0 destroys and 0
	unwanted changes.** Telemetry `+ create` resources are acceptable. Any `~ update` or
	`- destroy` on real infrastructure resources must be resolved.

## 参考資料

- [Azure Verified Modules index (Terraform)](https://github.com/Azure/Azure-Verified-Modules/tree/main/docs/static/module-indexes)
- [Terraform AVM Registry namespace](https://registry.terraform.io/namespaces/Azure)

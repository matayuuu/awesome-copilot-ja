---
name: semantic-kernel
description: '共通ガイダンスと.NETおよびPython向けの言語別referenceを使って、Semantic Kernel solutionを作成、更新、refactor、説明、レビューします。'
---
# Semantic Kernel

Semantic Kernelで構築されたapplication、plugin、function-calling flow、AI integrationを扱うときにこのSkillを使います。

implementation adviceは記憶だけに頼らず、常に最新のSemantic Kernel documentationとsampleに基づけます。

## 最初にtarget languageを決める

recommendationやcode changeの前にlanguage workflowを選択します。

1. repositoryに`.cs`、`.csproj`、`.sln`、その他の.NET project fileがある場合、またはuserがC# / .NET guidanceを明示的に求めた場合は**.NET** workflowを使う。[references/dotnet.md](references/dotnet.md)に従う。
2. repositoryに`.py`、`pyproject.toml`、`requirements.txt`がある場合、またはuserがPython guidanceを明示的に求めた場合は**Python** workflowを使う。[references/python.md](references/python.md)に従う。
3. repositoryに両方のecosystemがある場合は、編集対象fileまたはuserが示したtargetのlanguageに合わせる。
4. languageが曖昧な場合は、まずcurrent workspaceを調査し、最も近いlanguage-specific referenceを選ぶ。

## 常に最新のdocumentationを参照する

- 最初にSemantic Kernel overviewを読む: <https://learn.microsoft.com/semantic-kernel/overview/>
- current API surfaceについてはofficial docsとsampleを優先する。
- 利用できる場合はMicrosoft Docs MCP toolingで最新のframework guidanceとexampleを取得する。

## 共通guidance

どの language で Semantic Kernel を扱う場合も、次を守ります。

- kernel operationにはasync patternを使う。
- official pluginとfunction-calling patternに従う。
- 明示的なerror handlingとloggingを実装する。
- strong typing、明確なabstraction、保守しやすいcomposition patternを優先する。
- Azure AI Foundry、Azure OpenAI、OpenAI、その他のAI serviceにはbuilt-in connectorを使い、taskに合う新規projectではAzure AI Foundry serviceを優先する。
- 解決を簡素化できる場合はkernelのmemoryとcontext-management capabilityを使う。
- Azure authenticationが適切な場合は`DefaultAzureCredential`を使う。

## Workflow（作業手順）

1. target languageを決め、対応するreference fileを読む。
2. implementation choiceの前に最新のofficial docsとsampleを取得する。
3. このSkillの共通Semantic Kernel guidanceを適用する。
4. 選択したreferenceのlanguage-specific package、repository、sample path、coding practiceを使う。
5. repoのexampleがcurrent docsと異なる場合は差異を説明し、current supported patternに従う。

## References（参照資料）

- [.NET reference](references/dotnet.md)
- [Python reference](references/python.md)

## 完了条件

- recommendationがtarget languageに合っている。
- package name、repository path、sample locationが選択したecosystemに合っている。
- guidanceが古い前提ではなくcurrent Semantic Kernel documentationを反映している。

---
name: appinsights-instrumentation
description: '有用なテレメトリデータを Azure App Insights に送信するようWebアプリを計装します。'
---

# AppInsights の計装

このスキルは、アプリの正常性をより観測しやすくするために、Webアプリのテレメトリデータを Azure App Insights へ送信できるようにします。

## このスキルを使用する場面

ユーザーがWebアプリのテレメトリを有効にしたい場合に、このスキルを使用します。

## 前提条件

ワークスペース内のアプリは、次のいずれかである必要があります。

- Azure でホストされる ASP.NET Core アプリ
- Azure でホストされる Node.js アプリ

## ガイドライン

### コンテキスト情報を収集する

ユーザーがテレメトリサポートを追加しようとしているアプリの（プログラミング言語、アプリケーションフレームワーク、ホスティング）の組み合わせを特定します。これによりアプリを計装する方法が決まります。ソースコードを読んで根拠のある推測を行います。不明な点はユーザーに確認します。アプリがどこでホストされているか（例: 個人のコンピューター、コードとして Azure App Service、コンテナーとして Azure App Service、Azure Container App など）を常にユーザーへ尋ねる必要があります。

### 可能なら自動計装を優先する

アプリが Azure App Service でホストされている C# ASP.NET Core アプリの場合は、[AUTO ガイド](references/AUTO.md) を使用して、ユーザーがアプリを自動計装できるよう支援します。

### 手動で計装する

AppInsights リソースを作成してアプリのコードを更新することで、アプリを手動計装します。

#### AppInsights リソースを作成する

環境に適した次のいずれかの方法を使用します。

- 既存の Bicep テンプレートに AppInsights を追加します。追加内容は [examples/appinsights.bicep](examples/appinsights.bicep) を参照してください。ワークスペースに既存の Bicep テンプレートファイルがある場合、これが最適な方法です。
- Azure CLI を使用します。App Insights リソースを作成するために実行する Azure CLI コマンドは、[scripts/appinsights.ps1](scripts/appinsights.ps1) を参照してください。

どちらの方法を選んでも、リソース管理を容易にする意味のあるリソースグループに App Insights リソースを作成するよう、ユーザーへ推奨します。Azure でホストされているアプリのリソースを含むリソースグループが適切な候補です。

#### アプリケーションコードを変更する

- アプリが ASP.NET Core アプリの場合、C# コードの変更方法は [ASPNETCORE ガイド](references/ASPNETCORE.md) を参照してください。
- アプリが Node.js アプリの場合、JavaScript/TypeScript コードの変更方法は [NODEJS ガイド](references/NODEJS.md) を参照してください。
- アプリが Python アプリの場合、Python コードの変更方法は [PYTHON ガイド](references/PYTHON.md) を参照してください。

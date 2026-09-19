---
name: vscode-ext-commands
description: 'VS Code拡張機能にコマンドを追加するための指針。VS Code拡張機能の開発ガイドライン、ライブラリ、ベストプラクティスに従い、命名規則、可視性、ローカライズなどを扱います。'
---

# VS Code拡張機能のコマンド追加

このSkillは、VS Code拡張機能へのコマンド追加を支援します。

## このSkillを使う場面

次の作業が必要なときに使ってください。
- VS Code拡張機能のコマンドを追加または更新する

# 手順

VS Codeのコマンドでは、カテゴリ、可視性、配置に関係なく、必ず `title` を定義してください。コマンドの「種類」ごとに、以下の特徴を持ついくつかのパターンを使います。

* 通常のコマンド: 既定ではすべてのコマンドをCommand Paletteから利用できるようにし、`category` を定義してください。Side Barで使う場合を除き、`icon` は不要です。

* Side Barのコマンド: 名前はアンダースコア（`_`）で始まり、`#sideBar` で終わる特別なパターンに従います。たとえば `_extensionId.someCommand#sideBar` です。`icon` を定義する必要があり、`enablement` のルールは任意です。Side Bar専用のコマンドはCommand Paletteに表示しないでください。`view/title` または `view/item/context` に追加する場合は、表示される _order/position_ を指定する必要があります。また、「他のコマンド/ボタンとの相対位置」を使って適切な `group` を決められるようにし、新しいコマンドを表示する条件（`when`）を定義するのがよい習慣です。

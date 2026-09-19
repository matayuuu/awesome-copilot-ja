---
name: vscode-ext-localization
description: 'VS Code拡張機能を適切にローカライズするための指針。VS Code拡張機能の開発ガイドライン、ライブラリ、ベストプラクティスに従います。'
---

# VS Code拡張機能のローカライズ

このSkillは、VS Code拡張機能のあらゆる要素のローカライズを支援します。

## このSkillを使う場面

次の作業が必要なときに使ってください。
- 新規または既存の提供構成（設定、コマンド、メニュー、ビュー、ウォークスルー）をローカライズする
- 拡張機能のソースコードに含まれ、エンドユーザーに表示される新規または既存のメッセージやその他の文字列リソースをローカライズする

# Instructions

VS Codeのローカライズには、対象リソースに応じて3つの方法があります。ローカライズ可能なリソースを新規作成または更新した場合は、現在利用できるすべての言語について対応するローカライズも作成または更新してください。

1. `package.json` に定義されたSettings、Commands、Menus、Views、ViewsWelcome、Walkthrough Titles、Descriptionsなどの構成
  -> ブラジルポルトガル語（`pt-br`）のローカライズなら `package.nls.pt-br.json` のような専用の `package.nls.LANGID.json` ファイル
2. 独自の `Markdown` ファイルに定義されたウォークスルーの内容
  -> ブラジルポルトガル語のローカライズなら `walkthrough/someStep.pt-br.md` のような専用の `Markdown` ファイル
3. 拡張機能のソースコード（JavaScriptまたはTypeScriptファイル）にあるメッセージや文字列
  -> ブラジルポルトガル語のローカライズなら専用の `bundle.l10n.pt-br.json`

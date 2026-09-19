---
name: update-avm-modules-in-bicep
description: 'Bicep ファイル内の Azure Verified Modules (AVM) を最新バージョンへ更新する。'
---
# Bicep ファイル内の Azure Verified Modules を更新

Bicep ファイル `${file}` を最新の Azure Verified Module (AVM) バージョンを使うよう更新する。進捗更新は破壊的変更がない場合に限る。最終出力の表と概要以外の情報は出力しない。

## 手順

1. **スキャン**: `${file}` から AVM モジュールと現在のバージョンを抽出する。
1. **特定**: `#search` ツールで `avm/res/{service}/{resource}` に一致する、使用中の一意な AVM モジュールをすべて列挙する。
1. **確認**: MCR から各 AVM モジュールの最新バージョンを取得するために `#fetch` ツールを使う: `https://mcr.microsoft.com/v2/bicep/avm/res/{service}/{resource}/tags/list`
1. **比較**: セマンティックバージョンを解析し、更新が必要な AVM モジュールを特定する。
1. **レビュー**: 破壊的変更については、`#fetch` ツールで次のドキュメントを取得する: `https://github.com/Azure/bicep-registry-modules/tree/main/avm/res/{service}/{resource}`
1. **更新**: `#editFiles` ツールでバージョン更新とパラメーター変更を適用する。
1. **検証**: `#runCommands` ツールで `bicep lint` と `bicep build` を実行し、準拠を確認する。
1. **出力**: 変更を表形式で要約し、その下に更新概要を記載する。

## ツールの使用

利用可能な場合は常に `#search`、`#searchResults`、`#fetch`、`#editFiles`、`#runCommands`、`#todos` ツールを使う。作業を実行するためのコードは書かない。

## 破壊的変更の方針

⚠️ 更新に次の内容が含まれる場合は、**承認を得るために停止する**:

- 互換性のないパラメーター変更
- セキュリティまたはコンプライアンスの変更
- 動作の変更

## 出力形式

結果はアイコン付きの表だけを表示する:

```markdown
| Module | Current | Latest | Status | Action | Docs |
|--------|---------|--------|--------|--------|------|
| avm/res/compute/vm | 0.1.0 | 0.2.0 | 🔄 | Updated | [📖](link) |
| avm/res/storage/account | 0.3.0 | 0.3.0 | ✅ | Current | [📖](link) |

### Summary of Updates

Describe updates made, any manual reviews needed or issues encountered.
```

## アイコン

- 🔄 更新済み
- ✅ 最新
- ⚠️ 手動レビューが必要
- ❌ 失敗
- 📖 ドキュメント

## 要件

- バージョンの検出には MCR tags API のみを使う。
- JSON の tags 配列を解析し、セマンティックバージョニングで並べ替える。
- Bicep ファイルの有効性と lint 準拠を維持する。

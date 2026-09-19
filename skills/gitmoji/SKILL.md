---
name: gitmoji
description: 'gitmoji規約（https://gitmoji.dev）に従うコミットメッセージを生成する — 変更の意図に合う絵文字を選び、整ったメッセージを書く。「gitmojiコミットを書いて」「コミットメッセージに絵文字を追加して」「どのgitmojiを使うべき？」「この変更をgitmoji化して」と依頼された場合、またはプロジェクトがgitmoji形式のコミットメッセージを使っている場合に使用する。git diff、ステージ済み変更、または単純な説明から動作する。'
license: MIT
---

# Gitmoji

[gitmoji](https://gitmoji.dev/)規約に従うコミットメッセージを生成する：すべてのコミットを、意図をひと目で示す絵文字で始める。ユーザーが差分、ステージ済みファイルの一覧、または通常の説明を示したら、このSkillは最も適切なgitmojiを選び、簡潔で整ったメッセージを作成する。

このSkillは**メッセージだけを生成**する — `git commit`やその他のgitコマンドは実行しない。出力はユーザーがコピーして使用できるメッセージである。

## このSkillを使用する場面

- ユーザーが「gitmojiコミットを書いて」「この変更をgitmoji化して」「コミットメッセージに絵文字を追加して」と言った場合
- ユーザーが「どのgitmojiを使うべき？」と尋ねた場合
- ユーザーがgit diffを貼り付けた、またはgitmoji形式を採用するプロジェクトで変更を説明した場合
- ユーザーが表現豊かで読みやすいコミット履歴を求めた場合

**使用しない場面：** プロジェクトが通常の[Conventional Commits](https://www.conventionalcommits.org/)（`feat:`、`fix:`など）に従って絵文字を使わない場合は、`conventional-commit`または`commit-message-storyteller` Skillを使う。どの規約か不明な場合は、最近のコミット履歴（例：`git log --oneline -10`）をユーザーに示してもらう。

## メッセージ形式

gitmoji仕様：

```
<intention> [scope?][:?] <message>
```

- **intention** — 変更の目的を表すgitmojiを1つだけ
- **scope** *(任意)* — 影響を受けるコード領域
- **message** — 簡潔で命令形の変更説明

例：

```
✨ add multi-tenant support to the billing service
🐛 (auth) prevent token refresh loop on expired sessions
♻️ (api): extract pagination logic into shared helper
```

### 絵文字のスタイル：Unicodeとショートコード

gitmojiは同等の2つの表記に対応する。

| スタイル | 例 | 優先する場面 |
|-------|---------|----------------|
| Unicode | `✨ add dark mode` | デフォルト — どこでも表示され、件名が短い |
| Shortcode | `:sparkles: add dark mode` | ショートコードを表示するプラットフォーム（GitHub、GitLab）や、コードでコミット履歴を検索するチーム |

**リポジトリの既存履歴に合わせる。** 最近のコミットが`:sparkles:`形式のショートコードを使っている場合はショートコードを生成し、それ以外はUnicode絵文字をデフォルトにする。

## 動作方法

### 手順1：変更を理解する

ユーザーが提供した内容に応じて作業する。

1. **git diff** — 何が、なぜ変更されたかを特定する
2. **ステージ済み／変更済みファイルの一覧** — ファイル名とパスから意図を推測する
3. **通常の説明** — その説明を直接使う

意図が本当に曖昧な場合（例：「auth.jsを更新した」が修正、機能、リファクタリングのどれか不明）は、推測せず短い確認質問を1つする。

### 手順2：主な意図を特定する

変更の主な目的を決める。一般的な意図とgitmojiは次のとおり。

| 絵文字 | Shortcode | 意図 |
|-------|-----------|--------|
| ✨ | `:sparkles:` | 新機能の導入 |
| 🐛 | `:bug:` | バグ修正 |
| 🚑️ | `:ambulance:` | 緊急のホットフィックス |
| 📝 | `:memo:` | ドキュメントの追加または更新 |
| ♻️ | `:recycle:` | リファクタリング（動作変更なし） |
| ✅ | `:white_check_mark:` | テストの追加、更新、成功 |
| ⚡️ | `:zap:` | パフォーマンス改善 |
| 🎨 | `:art:` | コード構造／形式の改善 |
| 🔥 | `:fire:` | コードまたはファイルの削除 |
| 🔒️ | `:lock:` | セキュリティまたはプライバシー問題の修正 |
| ⬆️ | `:arrow_up:` | 依存関係のアップグレード |
| 🔧 | `:wrench:` | 設定ファイルの追加または更新 |
| 💄 | `:lipstick:` | UIとスタイルファイルの追加または更新 |
| 💥 | `:boom:` | 破壊的変更の導入 |
| 🚨 | `:rotating_light:` | コンパイラー／リンター警告の修正 |
| 🌐 | `:globe_with_meridians:` | 国際化とローカライズ |

これはよく使う一部にすぎない — 最終決定の前に、常に公式の75個のgitmojiを掲載した[`references/gitmoji-reference.md`](references/gitmoji-reference.md)を確認する。より具体的な絵文字が存在する場合がある（例：バグではなく些細な修正には🩹、タイプミスには✏️、ファイル移動には🚚）。

### 手順3：絵文字を1つだけ選ぶ

曖昧な場合の規則：

- **具体的なものを優先する** — タイプミスの修正は🐛ではなく✏️、ファイル移動は♻️ではなく🚚、緊急ではない軽微な修正は🐛ではなく🩹
- **テスト：** 通過するテストの追加／更新には✅、意図的に失敗させるテスト（TDDのred stepなど）には🧪
- **修正とホットフィックス：** 緊急の本番修正だけ🚑️、通常のバグ修正は🐛
- **セキュリティ修正：** バグより🔒️を優先する
- **形式だけの変更：** コード構造／形式には🎨、UI／スタイルファイルだけには💄
- **コミットごとに絵文字は1つ** — 2つの意図が同程度なら、下記の複合変更を参照する

### 手順4：メッセージを書く

- 命令形：「add」「fix」「remove」—「added」や「fixes」ではない
- 絵文字を含めて件名を72文字未満にする
- 先頭は小文字にし、末尾にピリオドを付けない
- プロジェクトの履歴がscopeを使う場合は、scopeを追加する
- 本文は、理由が件名から明らかでない場合だけ空行で区切って追加する

### 手順5：出力する

コピーできるコードブロックにコミットメッセージを出力し、その後に選んだgitmojiの理由を1行で説明する。`git commit`は実行しない。

**出力例：**

```
🐛 (auth) prevent token refresh loop on expired sessions

Expired sessions triggered a refresh that failed validation and
re-triggered itself, crashing the app. A recursion guard now aborts
the cycle and returns a clean 401.
```

> **なぜ🐛なのか：** この変更は誤った実行時の動作を修正するものであり、🚑️を使うほど緊急ではないバグ修正だから。

## 境界事例

| 状況 | 対応 |
|-----------|---------------|
| 複合変更（例：機能追加＋リファクタリング） | 主な意図の絵文字を選び、関係のない懸念ならコミットを分けることを提案する |
| 破壊的変更 | 意図として💥を使い、本文で破壊内容を説明する |
| Revert | ⏪️を使い、元に戻したコミットを件名で参照する |
| マージコミット | 🔀 `merge branch '<name>' into <target>` |
| 初回コミット | 🎉 `begin project` |
| 作業途中 | 🚧を使い、残っている作業を明確に記す |
| 一致する絵文字がない | **完全な参照**を再確認する。それでもなければ、最も近い一般的な意図（✨、🐛、♻️）にフォールバックする |

## クイックリファレンス

```bash
# Get your staged diff to paste into Copilot
git diff --staged

# Check which emoji style the repo already uses
git log --oneline -10
```

完全な公式gitmoji一覧は[`references/gitmoji-reference.md`](references/gitmoji-reference.md)を参照する。

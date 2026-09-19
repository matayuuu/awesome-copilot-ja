---
name: 'セッション自動コミット'
description: 'Copilot coding agent のセッション終了時に変更を自動でコミットしてプッシュします'
tags: ['automation', 'git', 'productivity']
---

# セッション自動コミットフック

GitHub Copilot coding agent のセッション終了時に変更を自動でコミットしてプッシュし、作業を常に保存・バックアップします。

## 概要

このフックは Copilot coding agent の各セッション終了時に実行され、次を自動的に行います。
- 未コミットの変更があるか検出
- すべての変更をステージ
- タイムスタンプ付きコミットを作成
- リモートリポジトリへプッシュ

## 機能

- **自動バックアップ**: Copilot セッションの作業を失いません
- **タイムスタンプ付きコミット**: 各自動コミットにセッション終了時刻を含めます
- **安全な実行**: 実際に変更がある場合だけコミットします
- **エラー処理**: プッシュ失敗を適切に処理します

## インストール

1. このフックフォルダーをリポジトリの `.github/hooks/` ディレクトリへコピーします。
   ```bash
   cp -r hooks/session-auto-commit .github/hooks/
   ```

2. スクリプトに実行権限があることを確認します。
   ```bash
   chmod +x .github/hooks/session-auto-commit/auto-commit.sh
   ```

3. フック設定をリポジトリのデフォルトブランチへコミットします。

## 設定

The hook is configured in `hooks.json` to run on the `sessionEnd` event:

```json
{
  "version": 1,
  "hooks": {
    "sessionEnd": [
      {
        "type": "command",
        "bash": ".github/hooks/session-auto-commit/auto-commit.sh",
        "timeoutSec": 30
      }
    ]
  }
}
```

## 仕組み

1. Copilot coding agent のセッション終了時にフックを実行
2. Git リポジトリ内で実行されているか確認
3. `git status` で未コミットの変更を検出
4. `git add -A` ですべての変更をステージ
5. `auto-commit: YYYY-MM-DD HH:MM:SS` 形式でコミットを作成
6. リモートへのプッシュを試行
7. 成功または失敗を報告

## カスタマイズ

`auto-commit.sh` を変更してフックをカスタマイズできます。

- **コミットメッセージ形式**: タイムスタンプ形式やメッセージ接頭辞を変更
- **選択的ステージ**: `-A` の代わりに特定の git add パターンを使用
- **ブランチ選択**: 特定のブランチだけへプッシュ
- **通知**: デスクトップ通知や Slack メッセージを追加

## 無効化

自動コミットを一時的に無効化するには:

1. `hooks.json` の `sessionEnd` フックを削除またはコメントアウト
2. または環境変数 `export SKIP_AUTO_COMMIT=true` を設定

## 注意事項

- フックは pre-commit フックを起動しないよう `--no-verify` を使用します
- プッシュ失敗でもセッション終了は妨げません
- 適切な git 認証情報の設定が必要です
- Copilot coding agent と GitHub Copilot CLI の両方で動作します

---
name: 'セッションロガー'
description: '監査と分析のために、Copilot coding agent のセッション活動をすべて記録します'
tags: ['logging', 'audit', 'analytics']
---

# セッションロガーフック

GitHub Copilot coding agent のセッションについて、開始・終了・ユーザープロンプトを追跡し、監査証跡と利用分析のために包括的に記録します。

## 概要

このフックは Copilot coding agent の活動を詳細に記録します。
- 作業ディレクトリのコンテキストを含むセッション開始・終了時刻
- ユーザープロンプトの送信イベント
- 設定可能なログレベル

## 機能

- **セッション追跡**: セッションの開始・終了イベントを記録
- **プロンプト記録**: ユーザープロンプトが送信された時点を記録
- **構造化ログ**: 解析しやすい JSON 形式
- **プライバシー配慮**: ログ全体を無効化できる設定

## インストール

1. このフックフォルダーをリポジトリの `.github/hooks/` ディレクトリへコピーします。
   ```bash
   cp -r hooks/session-logger .github/hooks/
   ```

2. ログディレクトリを作成します。
   ```bash
   mkdir -p logs/copilot
   ```

3. スクリプトに実行権限があることを確認します。
   ```bash
   chmod +x .github/hooks/session-logger/*.sh
   ```

4. フック設定をリポジトリのデフォルトブランチへコミットします。

## ログ形式

セッションイベントは `logs/copilot/session.log` に、プロンプトイベントは `logs/copilot/prompts.log` に JSON 形式で書き込まれます。

```json
{"timestamp":"2024-01-15T10:30:00Z","event":"sessionStart","cwd":"/workspace/project"}
{"timestamp":"2024-01-15T10:35:00Z","event":"sessionEnd"}
```

## プライバシーとセキュリティ

- セッションデータをコミットしないよう `.gitignore` に `logs/` を追加します。
- エラーだけを記録するには `LOG_LEVEL=ERROR` を使用します。
- 無効化するには環境変数 `SKIP_LOGGING=true` を設定します。
- ログはローカルにのみ保存されます。

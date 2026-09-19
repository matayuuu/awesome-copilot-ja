---
name: chrome-devtools
description: 'Chrome DevTools MCPを使用した高度なブラウザー自動化、デバッグ、パフォーマンス分析。Webページの操作、スクリーンショットの取得、ネットワークトラフィックの分析、パフォーマンスのプロファイリングに使用する。'
license: MIT
---

# Chrome DevTools Agentの使い方

## 概要

実行中のChromeブラウザーを制御、検査するための専門Skillです。`chrome-devtools` MCP serverを活用し、単純なページ移動から複雑なパフォーマンスプロファイリングまで、幅広いブラウザー関連タスクを実行します。

## 使用する場面

次の場合にこのSkillを使用します:

- **ブラウザー自動化**: ページ移動、要素のクリック、フォーム入力、ダイアログの処理。
- **視覚的な検査**: Webページのスクリーンショットまたはテキストスナップショットの取得。
- **デバッグ**: コンソールメッセージの検査、ページコンテキストでのJavaScript評価、ネットワークリクエストの分析。
- **パフォーマンス分析**: パフォーマンストレースを記録、分析し、ボトルネックやCore Web Vitalsの問題を特定。
- **エミュレーション**: ビューポートのサイズ変更、ネットワーク／CPU条件のエミュレーション。

## Toolのカテゴリ

### 1. ナビゲーションとページ管理

- `new_page`: 新しいタブ／ページを開く。
- `navigate_page`: 指定したURLへ移動する、再読み込みする、または履歴を移動する。
- `select_page`: 開いているページ間でコンテキストを切り替える。
- `list_pages`: 開いているすべてのページとそのIDを確認する。
- `close_page`: 指定したページを閉じる。
- `wait_for`: 指定したテキストがページに表示されるまで待機する。

### 2. 入力と操作

- `click`: 要素をクリックする（スナップショットの`uid`を使用）。
- `fill` / `fill_form`: 入力欄にテキストを入力する、または複数のフィールドへ一括入力する。
- `hover`: 要素の上へマウスを移動する。
- `press_key`: キーボードショートカットや特殊キー（例: "Enter"、"Control+C"）を送信する。
- `drag`: 要素をドラッグ＆ドロップする。
- `handle_dialog`: ブラウザーのアラート／プロンプトを承認または閉じる。
- `upload_file`: ファイル入力を通じてファイルをアップロードする。

### 3. デバッグと検査

- `take_snapshot`: テキストベースのアクセシビリティツリーを取得する（要素の特定に最適）。
- `take_screenshot`: ページまたは指定した要素の表示を画像として取得する。
- `list_console_messages` / `get_console_message`: ページのコンソール出力を検査する。
- `evaluate_script`: ページコンテキストでカスタムJavaScriptを実行する。
- `list_network_requests` / `get_network_request`: ネットワークトラフィックとリクエストの詳細を分析する。

### 4. エミュレーションとパフォーマンス

- `resize_page`: ビューポートの寸法を変更する。
- `emulate`: CPU／ネットワークをスロットリングする、または位置情報をエミュレートする。
- `performance_start_trace`: パフォーマンスプロファイルの記録を開始する。
- `performance_stop_trace`: 記録を停止してトレースを保存する。
- `performance_analyze_insight`: 記録したパフォーマンスデータから詳細な分析を取得する。

## ワークフローパターン

### パターンA: 要素の特定（スナップショット優先）

要素を見つけるときは、常に`take_screenshot`より`take_snapshot`を優先します。スナップショットでは、操作Toolに必要な`uid`値を取得できます。

```markdown
1. `take_snapshot` to get the current page structure.
2. Find the `uid` of the target element.
3. Use `click(uid=...)` or `fill(uid=..., value=...)`.
```

### パターンB: エラーのトラブルシューティング

ページで問題が発生している場合は、コンソールログとネットワークリクエストの両方を確認します。

```markdown
1. `list_console_messages` to check for JavaScript errors.
2. `list_network_requests` to identify failed (4xx/5xx) resources.
3. `evaluate_script` to check the value of specific DOM elements or global variables.
```

### パターンC: パフォーマンスプロファイリング

ページが遅い理由を特定します。

```markdown
1. `performance_start_trace(reload=true, autoStop=true)`
2. Wait for the page to load/trace to finish.
3. `performance_analyze_insight` to find LCP issues or layout shifts.
```

## ベストプラクティス

- **コンテキストの把握**: 現在アクティブなタブが不明な場合は、必ず`list_pages`と`select_page`を実行する。
- **スナップショット**: `uid`値が変わる可能性があるため、大きなページ移動やDOM変更の後には新しいスナップショットを取得する。
- **タイムアウト**: 読み込みが遅い要素で停止し続けないよう、`wait_for`には適切なタイムアウトを使用する。
- **スクリーンショット**: `take_screenshot`は視覚的な確認に限定して使用し、ロジックには`take_snapshot`を利用する。

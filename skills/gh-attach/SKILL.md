---
name: gh-attach
description: 'GitHub の user-attachments にローカルファイル（スクリーンショット、画像、PDF、zip、動画）をアップロードし、GitHub の user-attachments からダウンロードし、PR、Issue、コメントにローカルファイルを埋め込みます。PR にスクリーンショットを添付したい、Issue に画像を追加したい、比較前後のスクリーンショットを埋め込みたい、ファイルを添付したい、GitHub の添付ファイルをダウンロードしたいと依頼されたときに使います。`gh-attach` によって動作します。'
---

# gh-attach

`gh attach` は GitHub の内部 user-attachments エンドポイントにファイルをアップロードし、URL を出力します。この URL は GitHub が自動的に描画（画像/動画/ファイル）し、貼り付けた場所で表示されます。URL はリポジトリの可視性を継承するため、private リポジトリにアップロードした内容は非公開のままです。

## 前提条件

```sh
gh extension list | grep -q 'gh attach' || gh extension install sudosubin/gh-attach
```

アップロードには GitHub のブラウザセッション cookie を使い、`gh` のトークンではありません。既定では `gh` が認証済みである必要があり、`gh-attach` が一致するブラウザアカウントを選べます。アカウントが違う場合は `--browser <name> --profile <name>` を追加してください。ヘッドレス利用では `GH_ATTACH_SESSION_TOKEN` に bare の `user_session` cookie 値を設定します。これは完全なアカウント認証情報として扱ってください。

## 手順

**1. アップロード**: 絶対パスの引用付きパスを使います。リポジトリ内なら `-R` は省略可能です。GHES では `-R host/owner/repo` を使います。コマンドは 1 行に URL を出力します。GitHub が自動で描画するため、URL をそのまま使います:

```sh
URL=$(gh attach "$FILE" -R <owner>/<repo>)
```

**2. 埋め込む**（常に `--body-file -` を使います。例: `gh pr comment/edit`, `gh issue comment/edit`）:

```sh
printf '## Screenshots

%s
' "$URL" | gh pr comment <pr> -R <owner>/<repo> --body-file -
```

**3. ダウンロード**: 保存先を明示的に指定します。private の添付ファイルは有効な `gh` トークンを使い、必要ならブラウザ cookie を認可フォールバックとして使います:

```sh
gh attach download "$URL" -O "$FILE"
```

## メモ

- Private リポジトリ: URL は認可された閲覧者にだけ表示されます。匿名でアクセスすると 404 または 403 が返るのが想定されます。
- サイズ調整: bare の URL ではなく、`<img width="800" src="$URL">` を埋め込んでください。
- GitHub Cloud と GHES は、どのファイル拡張子やコンテンツタイプを受け付けるかを決定します。

---
name: dataverse-python-quickstart
description: '公式パターンを使って Python SDK のセットアップ、CRUD、一括処理、ページングのスニペットを生成する。'
---

Microsoft Dataverse SDK for Python（preview）の利用を支援します。
次の内容を含む簡潔な Python スニペットを生成してください。
- SDK をインストールする（pip install PowerPlatform-Dataverse-Client）
- InteractiveBrowserCredential を使って DataverseClient を作成する
- 単一レコードの CRUD 操作を示す
- 一括作成と一括更新（ブロードキャスト + 1:1）を示す
- ページング（top、page_size）を使った複数レコード取得を示す
- 必要に応じて File 列へのファイルアップロードを示す
コードは公式例に沿わせ、未発表の preview 機能は使用しないでください。

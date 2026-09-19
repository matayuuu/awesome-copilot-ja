---
name: lsp-setup
description: 'Copilot CLI用のLSPサーバーをインストールして構成し、任意のプログラミング言語でコードインテリジェンス（定義へ移動、参照検索、ホバー、型情報）を有効にする。深いコード理解が必要でLSPサーバーが未構成の場合や、LSPサーバーのセットアップ、インストール、構成を依頼された場合に使う。'
---

# GitHub Copilot CLIのLSPセットアップ

**ユーティリティSkill** — Copilot CLI用のLanguage Server Protocolサーバーをインストールして構成する。
使用対象: 「LSPをセットアップ」「言語サーバーをインストール」「Java用にLSPを構成」「TypeScript LSPを追加」「コードインテリジェンスを有効化」「定義へ移動が必要」「参照検索が動作しない」「より深いコード理解が必要」
使用対象外: 一般的なコーディング作業、IDE/エディターのLSP構成、Copilot CLI以外のセットアップ

## ワークフロー

1. **言語を尋ねる** — ユーザーがLSPサポートを求めるプログラミング言語を`ask_user`で尋ねる
2. **OSを検出する** — `uname -s`を実行する（または`$env:OS` / `%OS%`でWindowsを確認する）ことで、macOS、Linux、Windowsのいずれかを判定する
3. **LSPサーバーを調べる** — 既知のサーバー、インストールコマンド、構成スニペットについて`references/lsp-servers.md`を読む
4. **スコープを尋ねる** — 構成をユーザーレベル（`~/.copilot/lsp-config.json`）にするか、リポジトリレベル（リポジトリルートの`lsp.json`または`.github/lsp.json`）にするかを`ask_user`で尋ねる
5. **サーバーをインストールする** — 検出したOSに対応するインストールコマンドを実行する
6. **構成を書き込む** — 選んだ構成ファイル（ユーザーレベルは`~/.copilot/lsp-config.json`、リポジトリレベルは`lsp.json`または`.github/lsp.json`）へ新しいサーバーエントリをマージする。リポジトリレベルの構成が既にある場合はその場所を使い続け、ない場合はどの場所を希望するか尋ねる。ファイルがなければ作成し、既存エントリを保持する。
7. **検証する** — LSPバイナリが`$PATH`上にあり、構成ファイルが有効なJSONであることを確認する

## 構成形式

Copilot CLIはユーザーレベルまたはリポジトリレベルの場所からLSP構成を読み取り、リポジトリレベルの構成がユーザーレベルの構成より優先される。

- **User-level**: `~/.copilot/lsp-config.json`
- **Repo-level**: `lsp.json` (repo root) or `.github/lsp.json`

The JSON structure:

```json
{
  "lspServers": {
    "<server-key>": {
      "command": "<binary>",
      "args": ["--stdio"],
      "fileExtensions": {
        ".<ext>": "<languageId>",
        ".<ext2>": "<languageId>"
      }
    }
  }
}
```

### 主なルール

- `command`はバイナリ名（`$PATH`上にある必要がある）または絶対パスである。
- `args`には、標準I/Oトランスポートを使うため、ほぼ常に`"--stdio"`を含める。
- `fileExtensions`は各ファイル拡張子（先頭にドットを付ける）を[Language ID](https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers)に対応付ける。
- `lspServers`には複数のサーバーを共存させられる。
- 既存ファイルにマージするときは、他のサーバーエントリを**決して上書きせず**、対象言語のキーだけを追加または更新する。

## 動作

- ユーザーに言語またはスコープを選んでもらうときは、必ず`choices`付きの`ask_user`を使う。
- 言語が`references/lsp-servers.md`にない場合は、Webで「<language> LSP server」を検索し、手動構成を案内する。
- パッケージマネージャーが利用できない場合（macOSでHomebrewがない場合など）は、参照ファイルにある代替インストール方法を提案する。
- インストール後、`which <binary>`（Windowsでは`where.exe`）を実行して、バイナリにアクセスできることを確認する。
- 書き込む前に、最終的な構成JSONをユーザーに表示する。
- 構成ファイルが既にある場合は、まず読み込んでマージし、上書きしない。

## 検証

セットアップ後、ユーザーに次を伝える。

1. Type `/exit` to quit Copilot CLI — this is **required** so the new LSP configuration is loaded on next launch
2. Re-launch `copilot` in a project with files of the configured language
3. Run `/lsp` to check the server status
4. Try code intelligence features like go-to-definition or hover

---
name: batch-files
description: 'Windowsバッチファイル（.bat/.cmd）の作成、デバッグ、保守を行う熟練者向けSkill。「バッチファイルを作成」「.batスクリプトを書く」「Windowsタスクを自動化」「CMDスクリプト」「バッチ自動化」「スケジュールタスク用スクリプト」「Windowsシェルスクリプト」などを依頼されたとき、またはワークスペースで.bat/.cmdファイルを扱うときに使用します。cmd.exe構文、環境変数、制御フロー、文字列処理、エラー処理、システムToolとの統合を扱います。'
---

# バッチファイル

cmd.exeを使ってWindowsバッチファイル（.bat/.cmd）を作成、編集、デバッグ、保守するための包括的なSkillです。CLI Tool開発、システム管理の自動化、スケジュールタスク、ファイル操作スクリプト、PATH上の実行可能スクリプトに適用します。

## このSkillを使用する場面

- `.bat` または `.cmd` ファイルを作成または編集するとき
- Windowsタスク（ファイル操作、デプロイ、バックアップ）を自動化するとき
- PATH上の `bin/` フォルダー向けCLI Toolを構築するとき
- スケジュールタスク用スクリプト（SCHTASKS、Task Scheduler）を書くとき
- バッチスクリプトの問題（変数展開、エラーレベル、引用符）をデバッグするとき
- バッチスクリプトを外部Tool（curl、git、Node.js、Python）と統合するとき
- 構造化されたテンプレートで新しいバッチベースのプロジェクトを雛形化するとき

## 前提条件

- Windows NTベースのOS（Windows 7以降）
- cmd.exe（組み込み）
- 任意: スクリプトをコマンドとして配布するためのPATH上の `bin/` ディレクトリ
- 任意: `.BAT;.CMD` を含むよう設定されたPATHEXT（Windowsの既定値）

## コマンドの解釈

cmd.exeは各行を次の4段階で順に処理します。

1. **変数置換** — `%VAR%` トークンを環境変数の値に置換します。`%0`–`%9` はバッチ引数を参照し、`%*` はすべての引数に展開されます。
2. **引用とエスケープ** — キャレット `^` は特殊文字（`& | < > ^`）をエスケープします。引用符は囲まれた特殊文字の解釈を防ぎます。バッチファイルでは `%%` がリテラルの `%` になります。
3. **構文解析** — 行をパイプライン（`|`）、複合コマンド（`&`、`&&`、`||`）、括弧グループ `( )` に分割します。
4. **リダイレクト** — `>` は上書き、`>>` は追記、`<` は入力読み取り、`2>` はstderrのリダイレクト、`2>&1` はstderrをstdoutへ統合、`>NUL` は出力破棄です。

## 変数

### 環境変数

```bat
set _MY_VAR=Hello World
echo %_MY_VAR%
set _MY_VAR=
```

- 引数なしの `set` はすべての変数を一覧します
- `set _PREFIX` は `_PREFIX` で始まる変数を一覧します
- `=` の前後に空白を置かない — `set name = val` は変数 `"name "` に `" val"` を設定します

### 特殊変数

| 変数 | 値 |
|----------|-------|
| `%CD%` | 現在のディレクトリ |
| `%DATE%` | システム日付（ロケール依存） |
| `%TIME%` | システム時刻 HH:MM:SS.mm |
| `%RANDOM%` | 疑似乱数 0–32767 |
| `%ERRORLEVEL%` | 直前のコマンドの終了コード |
| `%USERNAME%` | 現在のユーザー名 |
| `%USERPROFILE%` | 現在のユーザープロファイルパス |
| `%TEMP%` / `%TMP%` | 一時ファイルディレクトリ |
| `%PATHEXT%` | 実行可能ファイル拡張子一覧 |
| `%COMSPEC%` | cmd.exeのパス |

### SETLOCAL / ENDLOCALによるスコープ

```bat
setlocal
set _LOCAL_VAR=scoped value
endlocal
REM _LOCAL_VAR is no longer defined here
```

スコープされたブロックから値を返すには:

```bat
endlocal & set _RESULT=%_LOCAL_VAR%
```

### 遅延展開

括弧ブロック内の変数は解析時に展開されます。実行時に評価するには遅延展開を使います。

```bat
setlocal EnableDelayedExpansion
set _COUNT=0
for /l %%i in (1,1,5) do (
    set /a _COUNT+=1
    echo !_COUNT!
)
endlocal
```

- `!VAR!` は実行時に展開されます（遅延）
- `%VAR%` は解析時に展開されます（即時）

## 制御フロー

### 条件実行

```bat
if exist "output.txt" echo File found
if not defined _MY_VAR echo Variable not set
if "%_STATUS%"=="ready" (echo Go) else (echo Wait)
if %ERRORLEVEL% neq 0 echo Command failed
```

比較演算子: `equ`、`neq`、`lss`、`leq`、`gtr`、`geq`。大文字小文字を区別しない文字列比較には `/i` を使います。

### 複合コマンド

```bat
command1 & command2        & REM Always run both
command1 && command2       & REM Run command2 only if command1 succeeds
command1 || command2       & REM Run command2 only if command1 fails
```

### FORループ

```bat
REM Iterate over a set of values
for %%i in (alpha beta gamma) do echo %%i

REM Numeric range: start, step, end
for /l %%i in (1,1,10) do echo %%i

REM Files in a directory
for %%f in (*.txt) do echo %%f

REM Recursive file search
for /r %%f in (*.log) do echo %%f

REM Directories only
for /d %%d in (*) do echo %%d

REM Parse command output
for /f "tokens=1,2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do echo %%b

REM Parse file lines
for /f "usebackq tokens=*" %%a in ("data.txt") do echo %%a
```

### GOTOとラベル

```bat
goto :main_logic
:usage
echo Usage: %~nx0 [options]
exit /b 1

:main_logic
echo Running main logic...
goto :eof
```

`goto :eof` は現在のバッチまたはサブルーチンを終了します。ラベルは `:` で始まります。

## コマンドライン引数

| 構文 | 値 |
|--------|-------|
| `%0` | 呼び出されたスクリプト名 |
| `%1`–`%9` | 位置引数 |
| `%*` | すべての引数（SHIFTの影響を受けない） |
| `%~1` | 囲み引用符を除いた第1引数 |
| `%~f1` | 第1引数の完全パス |
| `%~d1` | 第1引数のドライブ文字 |
| `%~p1` | 第1引数のパス（ドライブなし） |
| `%~n1` | 第1引数のファイル名（拡張子なし） |
| `%~x1` | 第1引数の拡張子 |
| `%~dp0` | バッチファイル自身のドライブとパス |
| `%~nx0` | バッチファイルの拡張子付きファイル名 |
| `%~z1` | 第1引数のファイルサイズ |
| `%~$PATH:1` | PATHで第1引数を検索 |

### 引数解析パターン

```bat
:parse_args
if "%~1"=="" goto :args_done
if /i "%~1"=="--help" goto :usage
if /i "%~1"=="--output" (
    set "_OUTPUT_DIR=%~2"
    shift
)
shift
goto :parse_args
:args_done
```

## 文字列処理

### 部分文字列

```bat
set _STR=Hello World
echo %_STR:~0,5%       & REM "Hello"
echo %_STR:~6%         & REM "World"
echo %_STR:~-5%        & REM "World"
echo %_STR:~0,-6%      & REM "Hello"
```

### 検索と置換

```bat
set _STR=Hello World
echo %_STR:World=Earth%       & REM "Hello Earth"
echo %_STR:Hello=%            & REM " World" (remove "Hello")
```

### 部分文字列の包含テスト

```bat
if not "%_STR:World=%"=="%_STR%" echo Contains "World"
```

## 関数

関数にはラベル、CALL、SETLOCAL/ENDLOCALを使います。

```bat
@echo off
call :greet "Jane Doe"
echo Result: %_GREETING%
exit /b 0

:greet
setlocal
set "_MSG=Hello, %~1"
endlocal & set "_GREETING=%_MSG%"
exit /b 0
```

- `call :label args` は関数を呼び出します
- `exit /b` はスクリプト全体ではなく関数から戻ります
- `endlocal & set` のテクニックで、スコープされたブロックの外へ値を渡します

## 算術

`set /a` は32ビット符号付き整数の算術を実行します。

```bat
set /a _RESULT=10 * 5 + 3
set /a _COUNTER+=1
set /a _REMAINDER=14 %% 3       & REM Use %% for modulo in batch files
set /a _BITS="255 & 0x0F"       & REM Bitwise AND
```

対応する演算子: `+ - * / %% ( )` とビット演算の `& | ^ ~ << >>`。

16進数（`0xFF`）と8進数（`077`）のリテラルに対応しています。

## エラー処理

### エラーレベルの規約

- `0` = 成功
- 0以外 = 失敗（通常は `1`）

```bat
mycommand.exe
if %ERRORLEVEL% neq 0 (
    echo ERROR: mycommand failed with code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)
```

### フェイルファストパターン

```bat
command1 || (echo command1 failed & exit /b 1)
command2 || (echo command2 failed & exit /b 1)
```

### 終了コードの設定

```bat
exit /b 0        & REM Return success from a batch/function
exit /b 1        & REM Return failure
cmd /c "exit /b 42"   & REM Set ERRORLEVEL to 42 inline
```

## 主要コマンドリファレンス

### ファイル操作

| コマンド | 用途 |
|---------|---------|
| `DIR` | ディレクトリ内容を一覧 |
| `COPY` | ファイルをコピー |
| `XCOPY` | サブディレクトリ対応の拡張コピー（レガシー） |
| `ROBOCOPY` | 再試行、ミラー、ログに対応する堅牢なコピー |
| `MOVE` | ファイルを移動または名前変更 |
| `DEL` | ファイルを削除 |
| `REN` | ファイル名を変更 |
| `MD` / `MKDIR` | ディレクトリを作成 |
| `RD` / `RMDIR` | ディレクトリを削除 |
| `MKLINK` | シンボリックリンクまたはハードリンクを作成 |
| `ATTRIB` | ファイル属性を表示または設定 |
| `TYPE` | ファイル内容を表示 |
| `MORE` | ページ送りでファイルを表示 |
| `TREE` | ディレクトリ構造を表示 |
| `REPLACE` | コピー元でコピー先を置換 |
| `COMPACT` | NTFS圧縮を表示または設定 |
| `EXPAND` | .cabから展開 |
| `MAKECAB` | .cabアーカイブを作成 |
| `TAR` | tarを作成または展開 |

### テキスト検索と処理

| コマンド | 用途 |
|---------|---------|
| `FIND` | リテラル文字列を検索 |
| `FINDSTR` | 制限付き正規表現で検索 |
| `SORT` | 行をアルファベット順に並べ替え |
| `CLIP` | パイプ入力をクリップボードへコピー |
| `FC` | ファイルを比較 |
| `COMP` | バイナリファイルを比較 |
| `CERTUTIL` | Base64のエンコード/デコード、ハッシュ計算 |

### システム情報

| コマンド | 用途 |
|---------|---------|
| `SYSTEMINFO` | システム構成全体 |
| `HOSTNAME` | コンピューター名を表示 |
| `VER` | Windowsバージョン |
| `WHOAMI` | 現在のユーザーとグループ情報 |
| `TASKLIST` | プロセスを一覧 |
| `TASKKILL` | プロセスを終了 |
| `WMIC` | WMIクエリ（ドライブ、OS、メモリ） |
| `SC` | サービス制御（照会、開始、停止） |
| `DRIVERQUERY` | インストール済みドライバーを一覧 |
| `REG` | レジストリ操作（照会、追加、削除） |
| `SETX` | 永続環境変数を設定 |

### ネットワーク

| コマンド | 用途 |
|---------|---------|
| `PING` | ネットワーク接続をテスト |
| `IPCONFIG` | IP構成 |
| `NSLOOKUP` | DNS検索 |
| `NETSTAT` | ネットワーク接続とポート |
| `TRACERT` | ホストへの経路を追跡 |
| `NET USE` | ネットワークドライブを割り当て/切断 |
| `NET USER` | ユーザーアカウントを管理 |
| `NETSH` | ネットワーク構成ユーティリティ |
| `ARP` | ARPキャッシュ管理 |
| `ROUTE` | ルーティングテーブル管理 |
| `CURL` | HTTPリクエスト（Windows 10以降） |
| `SSH` | セキュアシェル（Windows 10以降） |

### スケジュールと自動化

| コマンド | 用途 |
|---------|---------|
| `SCHTASKS` | スケジュールタスクを作成・管理 |
| `TIMEOUT` | N秒待機（Vista以降） |
| `START` | プログラムを非同期で起動 |
| `RUNAS` | 別のユーザーとして実行 |
| `SHUTDOWN` | シャットダウンまたは再起動 |
| `FORFILES` | 日付でファイルを探し、コマンドを実行 |

### シェルユーティリティ

| コマンド | 用途 |
|---------|---------|
| `WHERE` | PATH上の実行可能ファイルを検索 |
| `DOSKEY` | コマンドマクロを作成 |
| `CHOICE` | 1キー入力を促す |
| `MODE` | コンソールサイズとポートを設定 |
| `SUBST` | フォルダーをドライブ文字に割り当て |
| `CHCP` | コンソールコードページを取得または設定 |
| `COLOR` | コンソール色を設定 |
| `TITLE` | コンソールウィンドウのタイトルを設定 |
| `ASSOC` / `FTYPE` | ファイルの種類の関連付け |

## シェル構文と式

### グループ化のための括弧

括弧は複合コマンドを、リダイレクトや条件実行のための1つの単位にします。

```bat
(echo Line 1 & echo Line 2) > output.txt
if exist "data.csv" (
    echo Processing...
    call :process "data.csv"
) else (
    echo No data found.
)
```

### エスケープ文字

キャレット `^` は次の文字をエスケープします。

```bat
echo Total ^& Summary          & REM Outputs: Total & Summary
echo 100%% complete            & REM Outputs: 100% complete (in batch)
echo Line one^
Line two                       & REM Caret escapes the newline
```

パイプの後では3つのキャレットが必要です: `echo x ^^^& y | findstr x`

### ワイルドカード

- `*` は任意の長さの文字列に一致します
- `?` は1文字（またはピリオドを含まないセグメント末尾では0文字）に一致します

```bat
dir *.txt           & REM All .txt files
ren *.jpeg *.jpg    & REM Bulk rename
```

### リダイレクトのまとめ

```bat
command > file.txt          & REM Overwrite stdout to file
command >> file.txt         & REM Append stdout to file
command 2> errors.log       & REM Redirect stderr
command > all.log 2>&1      & REM Merge stderr into stdout
command < input.txt         & REM Read stdin from file
command > NUL 2>&1          & REM Discard all output
```

## 本番品質のバッチファイルを書く

### 標準スクリプト構造

```bat
@echo off
setlocal EnableDelayedExpansion

REM ============================================================
REM  Script: example.bat
REM  Purpose: Describe what this script does
REM ============================================================

call :main %*
exit /b %ERRORLEVEL%

:main
    call :parse_args %*
    if not defined _TARGET (
        echo ERROR: --target is required. 1>&2
        call :usage
        exit /b 1
    )
    echo Processing: %_TARGET%
    exit /b 0

:parse_args
    if "%~1"=="" exit /b 0
    if /i "%~1"=="--target" set "_TARGET=%~2" & shift
    if /i "%~1"=="--help"   call :usage & exit /b 0
    shift
    goto :parse_args

:usage
    echo Usage: %~nx0 --target ^<path^> [--help]
    echo.
    echo Options:
    echo   --target   Path to process (required)
    echo   --help     Show this help message
    exit /b 0
```

### ベストプラクティス

1. **常に `@echo off` と `setlocal` から始める** — 不要な出力と呼び出し元への変数漏洩を防ぎます。
2. **処理前に入力を検証する** — 必須引数とファイルの存在を早期に確認します。`if not defined` と `if not exist` を使います。
3. **パスと変数を引用する** — `"%~1"` と `"%_MY_PATH%"` を使い、空白や特殊文字を安全に扱います。
4. **`exit` ではなく `exit /b` を使う** — 親のコンソールウィンドウが閉じるのを防ぎます。
5. **意味のある終了コードを返す** — 成功には `exit /b 0`、特定の失敗には0以外を返します。
6. **スクリプト相対パスには `%~dp0` を使う** — 呼び出し元の作業ディレクトリに依存せず動作します。
7. **`XCOPY` より `ROBOCOPY` を優先する** — より信頼性が高く、再試行、ミラーリング、ログに対応します。
8. **ループや括弧ブロック内で変数を変更するときは `EnableDelayedExpansion` を使う。**
9. **エラーをstderrへ書く** — `echo ERROR: message 1>&2` により、パイプ処理時もstdoutを汚しません。
10. **コメントには `REM` を使う** — `::` は `FOR` ループ本体内で問題を起こすことがあります。

### セキュリティ上の考慮事項

- **認証情報をバッチファイルに保存しない** — 環境変数、資格情報ストア、またはプロンプトを使います。
- **ユーザー入力を検証する** — `&`、`|`、`>` を含む引用されていない変数はコマンドを注入できます。常に `"%_USER_INPUT%"` のように引用します。
- **`SETLOCAL` を使う** — 変数値が親プロセスへ漏洩するのを防ぎます。
- **ファイルパスをサニタイズする** — 意図しない削除を防ぐため、`DEL`、`RD`、`ROBOCOPY` に渡す前にパスを検証します。
- **機密入力に `SET /P` を使わない** — 入力が表示され、コンソール履歴に保存されます。可能なら専用の資格情報Toolを使います。

## デバッグとトラブルシューティング

| 手法 | 方法 |
|-----------|-----|
| 実行をトレースする | 一時的に `@echo off` を削除するか `@echo on` を使う |
| ステップ実行する | セクション間に `PAUSE` を追加する |
| エラーレベルを確認する | 各コマンドの後に `echo Exit code: %ERRORLEVEL%` を置く |
| 変数を調べる | `set _MY_` で `_MY_` から始まる全変数を一覧する |
| 遅延展開の問題 | `( )` ブロック内の変数が更新されない場合は `!VAR!` 構文を有効にする |
| FORループの `%%` と `%` | バッチファイルでは `%%i`、コマンドラインでは `%i` を使う |
| SET内の空白 | `set name=value` とし、`set name = value` にはしない |
| パイプ内のキャレット | パイプの後では `^^^` で特殊文字をエスケープする |
| SET /A内の括弧 | `if` ブロック内では `^(` と `^)` でエスケープするか引用符を使う |
| 剰余の二重パーセント | バッチファイルでは `set /a r=14 %% 3` を使う |

## クロスプラットフォームと拡張Tool

バッチスクリプトの限界に達した場合、次のToolでcmd.exeの機能を拡張できます。

| Tool | 用途 |
|------|---------|
| **Cygwin** | Windows上の完全なPOSIX環境（grep、sed、awk、ssh） |
| **MSYS2** | 軽量なUnix Toolとパッケージマネージャー（pacman） |
| **WSL** | Windows Subsystem for Linux — ネイティブLinuxバイナリを実行 |
| **GnuWin32** | Windowsネイティブ実行可能ファイルとしての個別GNUユーティリティ |
| **PowerShell** | .NET統合を備えた最新のWindowsスクリプト |

高速な起動、単純なファイル操作、PATH上のCLI Tool、Task Schedulerとの統合が必要な場合はバッチを使います。複雑なデータ処理、REST API、オブジェクト指向スクリプトにはPowerShellまたはWSLを検討してください。

## CMDキーボードショートカット

| ショートカット | 操作 |
|----------|--------|
| `Tab` | ファイル/フォルダー名を自動補完 |
| `Up` / `Down` | コマンド履歴を移動 |
| `F7` | コマンド履歴ポップアップを表示 |
| `F3` | 直前のコマンドを繰り返す |
| `Esc` | 現在の行を消去 |
| `Ctrl+C` | 実行中のコマンドをキャンセル |
| `Alt+F7` | コマンド履歴を消去 |

## 参照ファイル

`references/` フォルダーには詳細なドキュメントがあります。

| ファイル | 内容 |
|------|----------|
| `tools-and-resources.md` | Windows Tool、ユーティリティ、パッケージマネージャー、ターミナル |
| `batch-files-and-functions.md` | サンプルスクリプト、技法、ベストプラクティスへのリンク |
| `windows-commands.md` | A-Z形式の包括的なWindowsコマンドリファレンス |
| `cygwin.md` | CygwinユーザーガイドとFAQ |
| `msys2.md` | MSYS2のインストール、パッケージ、環境 |
| `windows-subsystem-on-linux.md` | WSLのセットアップ、コマンド、ドキュメント |

## アセットテンプレート

`assets/` フォルダーには、テキストファイル形式のバッチファイル用スターターテンプレートがあります。

| テンプレート | 用途 |
|----------|---------|
| `executable.txt` | 引数解析付きのスタンドアロンCLI Tool |
| `library.txt` | CALL可能なラベルを持つ再利用可能な関数ライブラリ |
| `task.txt` | スケジュールタスク/自動化スクリプト |

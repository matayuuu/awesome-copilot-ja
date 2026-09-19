---
name: latchshot-page-capture
description: 'Latchshotを使い、公開HTTP(S)ウェブページのスクリーンショット、ウェブサイトサムネイル、全ページキャプチャ、PDFをローカル成果物として保存する必要があるときに使う。レポート、QA、アーカイブ、ソーシャルプレビューにも対応する。非公開または認証済みページ、raw HTML、スクレイピングや抽出、任意のブラウザー操作、CAPTCHAやボット対策の回避、ローカルファイルのキャプチャには使わない。'
---

# Latchshotページキャプチャ

同梱の依存関係不要のクライアントを使い、公開ウェブページのURLを検証済みのローカルPNG、JPEG、またはPDFに変換する。適切な場合は、制限付きのキー不要JPEGデモから始める。認証付きコマンドはAPIキーを固定の`https://latchshot.fly.dev`オリジンにだけ送り、すべての成果物をアトミックに書き込む。

LatchshotはこのSkillの貢献者が保守するホスト型の第三者サービスである。利用は任意とし、非公開ページやサポートされないブラウザー操作が必要な場合は既存のローカルブラウザーワークフローを維持する。

## 前提条件

Node.js 20以降とネットワークアクセスを必要とする。認証付きキャプチャと使用量コマンドでは、キーを`LATCHSHOT_API_KEY`からのみ読み取る。

変数がない場合、依頼に合えば、制限されたJPEG 1枚のキー不要デモを使う。PNG、PDF、全ページ、クリーンアップ、繰り返し作業については、ユーザーを[Agent Skillsセットアップドキュメント](https://latchshot.fly.dev/integrations.md#agent-skills)へ案内して終了する。キーをチャット、コマンド引数、ソースコード、コミット済みファイル、出力へ貼り付けるようユーザーに求めない。キーを表示または返さない。

## キー不要デモ

ビューポートJPEGでよい公開ページには、次のコマンドを使う。

```bash
node scripts/latchshot.mjs demo \
  --url 'https://example.com' \
  --output './artifacts/example-demo.jpg'
```

デモはJPEG専用で、アカウントやレンダー割り当てを使わず、IPアドレスごとに1時間あたり3回試行できる。幅、高さ、クエリ確認、明示的な上書きオプションだけを受け付ける。公開URLは引き続きLatchshotへ送信され、リクエストには大まかな`agentskill`取得ラベルが付く。非公開ページ、シークレット、署名付きURL、認証アクセスは、キャプチャワークフローと同じ基準で拒否する。結果は顧客の有効化やプラン登録ではなく、検証用成果物として扱う。

## キャプチャワークフロー

1. 対象が公開HTTPまたはHTTPSページであることを確認する。認証情報、非公開/内部ページ、ウェブ用でないポート、署名付きURL、クエリ内のシークレット、ログイン、Cookie、CAPTCHA処理、プロキシローテーション、任意のスクリプト、クリック、入力、ボット対策回避を必要とする依頼は拒否する。
2. ユーザーが承認した出力パスを選ぶ。`.png`、`.jpg`/`.jpeg`、`.pdf`から形式を推測するか、対応する`--format`を明示的に渡す。
3. このSkillのディレクトリからクライアントを実行する。

   ```bash
   node scripts/latchshot.mjs capture \
     --url 'https://example.com' \
     --output './artifacts/example.png'
   ```

4. 遅延コンテンツを有効化する、制限付きの全ページスクリーンショットには次を使う。

   ```bash
   node scripts/latchshot.mjs capture \
     --url 'https://example.com' \
     --output './artifacts/example-full.png' \
     --full-page \
     --scroll-page
   ```

5. PDFには次を使う。

   ```bash
   node scripts/latchshot.mjs capture \
     --url 'https://example.com' \
     --output './artifacts/example.pdf' \
     --paper A4
   ```

6. 1行のJSON結果を解析する。`ok`、`output`、`format`、`contentType`、`bytes`を確認する。周辺タスクで視覚またはドキュメントの検証が必要な場合は、ローカル成果物を調べる。キーを公開せず、パスと関連するレンダー/割り当て診断を報告する。

正確な制限付きオプションは`node scripts/latchshot.mjs --help`で確認する。`--block-ads`、`--block-trackers`、`--block-chats`、`--hide-cookie-banners`、`--hide-popups`は、最善努力のクリーンアップとしてだけ使い、回避には使わない。`--allow-query`は、クエリに認証情報、署名、トークン、顧客データ、その他のシークレットがないことを確認した後だけ使う。`--force`を明示しない限り、クライアントはファイルの上書きを拒否する。

## 使用量の確認

残りのレンダー数やリセット時刻を尋ねられた場合は、読み取り専用コマンドを使う。

```bash
node scripts/latchshot.mjs usage
```

これはレンダー割り当てを消費せず、プランも変更しない。

## 失敗時の処理

- stderrから構造化されたエラーコードとメッセージを読み取る。検証または認証の失敗を再試行しない。
- `demo_limit`では、ループや別のIDへの切り替えをせず、1時間ごとのリセットを待つ。
- `rate_limited`では、ループせず、報告されたリセット時刻またはretry-afterの境界を待つ。
- レンダーに失敗した場合は失敗を伝え、既存の出力ファイルを保持する。ローカルブラウザー、別のプロバイダー、サポートされない非公開ページアクセスへ黙って置き換えない。
- アップグレード、チェックアウト、支払い、実装依頼、その他の商取引を開始しない。これらは引き続きユーザーと所有者が管理する。

## 厳格な境界

Latchshotは公開ページだけを受け付け、1つのバイナリ成果物を返す。raw HTML入力、DOM抽出、セレクター、セッション、任意のJavaScript、認証済み/非公開ページ、CAPTCHA解決、レジデンシャルプロキシ、ボット対策回避は提供しない。割り当てを消費するのは成功したレンダーだけである。

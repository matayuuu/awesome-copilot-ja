---
name: scoutqa-test
description: '「このwebsiteをtestして」「exploratory testingを実行して」「accessibility issueを確認して」「login flowが動くことを検証して」「このpageのbugを見つけて」などの依頼やautomated QA testingの要求で使用します。ScoutQA CLIを使うsmoke test、accessibility audit、e-commerce flow、user flow validationなどのweb application testing scenarioで起動します。web application featureの実装後に正しく動作することをproactively検証する場合にも使用します。'
---
# ScoutQAテストSkill

`scoutqa` CLI を使って web application の AI-powered exploratory testing を実行します。

**ScoutQA を intelligent testing partner として扱います**。自律的に探索し、issue を発見し、feature を検証できます。複数の ScoutQA execution に並列で委譲し、時間を節約しながら coverage を最大化します。

## この Skill を使う場面

次の2つの場面でこの Skill を使います。

1. **ユーザーがテストを依頼した場合** - ユーザーがwebsiteのtestまたはfunctionalityの検証を明示的に求めたとき
2. **先行検証** - web featureの実装後、正しく動作することを確認するため自動的にtestを実行するとき

**Proactive usage の例:**

- login formの実装後 → authentication flowをtest
- form validationの追加後 → validation ruleとerror handlingを検証
- checkout flowの構築後 → end-to-end purchase processをtest
- bugの修正後 → fixが動作し、他のfeatureを壊していないことを検証

**推奨方法**: web featureの実装を終えたら、他のtaskを続けながら動作を検証できるよう、ScoutQA testをbackgroundで先行して開始します。

## Testの実行

### テストの作業手順

このchecklistをコピーして進捗を記録します。

テストの進捗:

- [ ] 明確な期待結果を含む具体的なtest promptを書く
- [ ] scoutqa commandをbackgroundで実行する
- [ ] execution IDとbrowser URLをuserに知らせる
- [ ] resultを抽出して分析する

**Step 1: 具体的なtest promptを書く**

ガイドラインは以下の「効果的なPromptの書き方」を参照します。

**Step 2: scoutqa commandを実行する**

**重要**: execution detail を取得するには Bash tool の timeout parameter（5000ms = 5秒）を使います。

Bash toolを呼ぶときはparameterとして`timeout: 5000`を設定します。

- これはClaude CodeのBash tool組み込みtimeout parameter（Unixの`timeout` commandではない）
- 5秒後、Bash toolはtask IDを返し、processはbackgroundで継続する
- processをkillするUnix `timeout`とは異なり、ここではprocessが継続する
- 最初の5秒でScoutQAのoutputからexecution IDとbrowser URLを取得する
- testはbackground taskとしてScoutQA infrastructure上でremote実行を継続する

```bash
scoutqa --url "https://example.com" --prompt "Your test instructions"
```

最初の数秒でcommandは次を出力します。

- **Execution ID** (e.g., `019b831d-xxx`)
- **Browser URL** (e.g., `https://app.scoutqa.ai/t/019b831d-xxx`)
- testの進捗を示す初期tool call

5秒のtimeout後、Bash toolはtask IDを返し、commandはbackgroundで継続します。test実行中も他のtaskを進められます。timeoutはinitial output（execution IDとbrowser URL）を取得するためだけのもので、testはlocalのbackground taskとScoutQA infrastructure上のremoteの両方で継続します。

**Step 3: execution IDとbrowser URLをユーザーに知らせる**

Bash toolがtask IDを返したら（最初の5秒でexecution detailを取得済み）、userに次を知らせます。

- browserで進捗を監視できるScoutQA execution IDとbrowser URL
- 後でlocal command outputを確認する場合のbackground task ID

他の作業を続けている間も、testはbackgroundで実行されます。

**Step 4: resultを抽出して分析する**

完全なformatは以下の「Resultの提示」を参照します。

### commandのオプション

- `--url`（必須）: testするwebsite URL（`localhost` / `127.0.0.1`対応）
- `--prompt`（必須）: 自然言語のtesting instruction
- `--project-id`（任意）: 追跡用にprojectへ関連付ける
- `-v, --verbose`（任意）: internalを含むすべてのtool callを表示

### ローカルテストのサポート

ScoutQAは`localhost`と`127.0.0.1` URLの自律的なtestに対応し、manual setupは不要です。

```bash
# Seamlessly test a locally running app when you're developing your app
scoutqa --url "http://localhost:3000" --prompt "Test the registration form"
```

### commandの使い分け

**新しいtestを開始?** → `scoutqa --url --prompt`を使用
**既知のissueを検証?** → `scoutqa issue-verify --issue-id <id>`を使用
**executionからissue IDを取得?** → `scoutqa list-issues --execution-id <id>`を使用
**agentに追加contextが必要?** → `scoutqa send-message`を使用（「停止したExecutionへのFollow-up」を参照）

## 効果的なPromptの書き方

手順を指定するのではなく、**何を探索・検証するか**に集中します。test 方法は ScoutQA が自律的に決定します。

**例: user registration flow**

```bash
scoutqa --url "https://example.com" --prompt "
Explore the user registration flow. Test form validation edge cases,
verify error handling, and check accessibility compliance.
"
```

**例: e-commerce checkout**

```bash
scoutqa --url "https://shop.example.com" --prompt "
Test the checkout flow. Verify pricing calculations, cart persistence,
payment options, and mobile responsiveness.
"
```

**例: comprehensive coverageのためのparallel test**

各Bash toolの`timeout` parameterを`5000`（milliseconds）に設定し、1つのmessageで複数のBash tool callを行って複数testをparallelで起動します。

```bash
# Test 1: Authentication & security
scoutqa --url "https://app.example.com" --prompt "
Explore authentication: login/logout, session handling, password reset,
and security edge cases.
"

# Test 2: Core features (runs in parallel)
scoutqa --url "https://app.example.com" --prompt "
Test dashboard and main user workflows. Verify data loading,
CRUD operations, and search functionality.
"

# Test 3: Accessibility (runs in parallel)
scoutqa --url "https://app.example.com" --prompt "
Conduct accessibility audit: WCAG compliance, keyboard navigation,
screen reader support, color contrast.
"
```

**実装**: 3つのBash tool callを含むmessageを1つ送ります。各Bash tool invocationの`timeout` parameterを`5000` millisecondsに設定します。5秒後、各Bash callはtask IDを返し、processはbackgroundで継続します。各testのinitial outputからexecution IDとbrowser URLを取得し、その後も3つすべてがlocal backgroundとScoutQA infrastructure上のremoteでparallelに継続します。

**主なガイドライン:**

- **何をtestするか**を記述し、**どうtestするか**は記述しない（stepはScoutQAが決める）
- goal、edge case、concernに集中する
- 異なるtest areaに対して複数のparallel executionを実行する
- ScoutQAが自律的に探索しissueを発見することを信頼する
- scoutqa commandを呼ぶときはBash toolの`timeout` parameterを常に`5000` millisecondsに設定する（5秒後にcontrolを返し、processはbackgroundで継続）
- parallel testでは1つのmessageで複数のBash tool callを行う
- Bash tool timeoutはUnix timeout commandと異なる（Bash timeoutはbackgroundで継続し、Unix timeoutはprocessをkillする）

### 一般的なテストシナリオ

**デプロイ後のsmoke test:**

```bash
scoutqa --url "$URL" --prompt "
Smoke test: verify critical functionality works after deployment.
Check homepage, navigation, login/logout, and key user flows.
"
```

**accessibility audit（アクセシビリティ監査）:**

```bash
scoutqa --url "$URL" --prompt "
Audit accessibility: WCAG 2.1 AA compliance, keyboard navigation,
screen reader support, color contrast, and semantic HTML.
"
```

**e-commerce testing（e-commerceテスト）:**

```bash
scoutqa --url "$URL" --prompt "
Explore e-commerce functionality: product search/filtering,
cart operations, checkout flow, and pricing calculations.
"
```

**SaaS application（SaaSアプリケーション）:**

```bash
scoutqa --url "$URL" --prompt "
Test SaaS app: authentication, dashboard, CRUD operations,
permissions, and data integrity.
"
```

**form validation（form検証）:**

```bash
scoutqa --url "$URL" --prompt "
Test form validation: edge cases, error handling, required fields,
format validation, and successful submission.
"
```

**mobile responsiveness（モバイル対応）:**

```bash
scoutqa --url "$URL" --prompt "
Check mobile experience: responsive layout, navigation,
touch interactions, and viewport behavior.
"
```

**既知issueの検証:**

```bash
# First, find issue IDs from a previous execution
scoutqa list-issues --execution-id <executionId>

# Then verify the issue (creates a new verification execution automatically)
scoutqa issue-verify --issue-id <issueId>
```

`issue-verify` commandは次を行います。

1. issue用のverification executionを作成
2. execution IDとbrowser URLを表示
3. agentのverification progressをreal-timeでstream
4. resultへのlink付きcompletion summaryを表示

**featureの検証（実装後）:**

```bash
scoutqa --url "$URL" --prompt "
Verify the new [feature name] works correctly. Test core functionality,
edge cases, error handling, and integration with existing features.
"
```

**例: feature coding後のproactive testing**

user registration formの実装後に、動作を自動検証します。

```bash
scoutqa --url "http://localhost:3000/register" --prompt "
Test the newly implemented registration form. Verify:
- Form validation (email format, password strength, required fields)
- Error messages display correctly
- Successful registration flow
- Edge cases (duplicate emails, special characters, etc.)
"
```

これにより、implementationのcontextが新しいうちにissueを直ちに検出できます。

## Issueの一覧表示

以前のexecutionで見つかったissueを確認するには`scoutqa list-issues`を使います。`issue-verify`で使うissue IDの取得に役立ちます。

```bash
scoutqa list-issues --execution-id <executionId>
```

**オプション:**

- `--execution-id`（必須）: Execution ID（`/t/<executionId>` URLまたはCLI outputから取得）

**出力例:**

```
Showing 3 issues:

🔴 019c-abc1
   Login button unresponsive on mobile
   Severity: critical | Category: usability | Status: open

🟠 019c-abc2
   Missing form validation on email field
   Severity: high | Category: functional | Status: open

🟡 019c-abc3
   Color contrast insufficient on footer links
   Severity: medium | Category: accessibility | Status: resolved
```

## resultの提示

### 即時提示（Test 開始後）

scoutqa commandを実行した直後に、executionの詳細をユーザーへ提示します。

```markdown
**ScoutQA Test Started**

Execution ID: `019b831d-xxx`
View Live: https://app.scoutqa.ai/t/019b831d-xxx

The test is running remotely. You can view real-time progress in your browser at the link above while I continue with other tasks.
```

### 最終結果（完了後）

executionが完了したら、次の形式でfindingを提示します。

```markdown
**ScoutQA Test Results**

Execution ID: `ex_abc123`

**Issues Found:**

[High] Accessibility: Missing alt text on logo image

- Impact: Screen readers cannot describe the logo
- Location: Header navigation

[Medium] Usability: Submit button not visible on mobile viewport

- Impact: Users cannot complete form on mobile devices
- Location: Contact form, bottom of page

[Low] Functional: Search returns no results for valid queries

- Impact: Search feature appears broken
- Location: Main search bar

**Summary:** Found 3 issues across accessibility, usability, and functional categories. See full interactive report with screenshots at the URL above.
```

必ず次を含めます。

- **Execution ID** (e.g., `ex_abc123`) for reference
- **見つかったissue**にseverity、category（accessibility、usability、functional）、impact、locationを含める

## 停滞したexecutionへのfollow-up

remote agentが停止したり説明を必要としたりした場合は、`send-message`で続行する。

```bash
# Example: Agent is stuck at login, user provides credentials
scoutqa send-message --execution-id ex_abc123 --prompt "
Use these test credentials: username: testuser@example.com, password: TestPass123
"

# Example: Agent asks which flow to test next
scoutqa send-message --execution-id ex_abc123 --prompt "
Focus on the checkout flow next, skip the wishlist feature
"
```

## test resultの確認

ScoutQA testはScoutQAのinfrastructure上でremote実行されます。短いtimeoutでtestを開始してexecution IDを取得した後:

1. testはremoteで実行を継続します（localのbackgroundではありません）。
2. すぐに他の作業を続けられます。
3. 後でresultを確認するには、test開始時に示されたbrowser URLを開きます。
4. 代わりに`scoutqa get-execution --execution-id <id>`を使ってCLIからresultを取得できます。

**推奨方法**: Bash toolの`timeout` parameterを`5000` millisecondsに設定してtestを開始します。5秒後、testがbackgroundで継続する間にBash toolがtask IDとexecutionの詳細を返します。その後、他の作業を続け、必要に応じてScoutQAのwebsiteまたはCLIでresultを確認できます。

## トラブルシューティング

| Issue                          | 解決策                                                    |
| ------------------------------ | ----------------------------------------------------------- |
| `command not found: scoutqa`   | CLIをインストールする: `npm i -g @scoutqa/cli@latest` |
| auth expired / unauthorized    | `scoutqa auth login`を実行する |
| testが停止または入力を要求する | `scoutqa send-message --execution-id`を使う |
| test resultを確認する          | browser URLまたは`scoutqa get-execution --execution-id`を開く |
| 検証用のissue IDが必要         | `scoutqa list-issues --execution-id <id>`を実行する |

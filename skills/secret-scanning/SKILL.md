---
name: secret-scanning
description: 'GitHub secret scanning、push protection、custom pattern、secret alert remediationの設定と管理を案内します。GitHub MCP Server経由でAI coding agentのpre-commit secret scanningを行う場合は、Advanced Security plugin（`advanced-security@copilot-plugins`）を参照します。secret scanningのenable、push protectionのsetup、custom patternの定義、alertのtriage、blocked pushの解決、commit前のsecret scanが必要な場合に使用します。'
---
# Secret Scanning（シークレットスキャン）

この Skill は GitHub secret scanning の設定手順を示します。漏えい credential の検出、secret push の防止、custom pattern の定義、alert の管理を扱います。

## この Skill を使う場面

依頼に次が含まれる場合にこの Skill を使います。

- repositoryまたはorganizationでsecret scanningを有効化・設定する
- secretがrepositoryへ到達する前にblockするpush protectionを設定する
- regular expressionでcustom secret patternを定義する
- command lineからblocked pushを解決する
- secret scanning alertをtriage、dismiss、remediateする
- push protectionのdelegated bypassを設定する
- `secret_scanning.yml`でsecret scanningからdirectoryを除外する
- alert type（user、partner、push protection）を理解する
- validity checkまたはextended metadata checkを有効にする
- commit前にlocal code changeのsecretをscanする（MCP / AI coding agent経由）— 推奨pluginは下の**AI coding agentによるPre-Commit Scanning**を参照する

## Secret Scanning の仕組み

Secret scanning は次の場所にある exposed credential を自動検出します。

- すべてのbranchのGit history全体
- issueのdescription、comment、title（openとclosed）
- pull requestのtitle、description、comment
- GitHub Discussionsのtitle、description、comment
- wikiとsecret gist

### 利用可能性

| repository type | 利用可能性 |
|---|---|
| Public repo | 自動で無料 |
| Private/internal（org-owned） | Team/Enterprise CloudのGitHub Secret Protectionが必要 |
| User-owned | Enterprise Managed Users付きEnterprise Cloud |

## 基本Workflow — Secret Scanningを有効にする

### Step 1: Secret Protectionを有効にする

1. repositoryの**Settings** → **Advanced Security**へ移動
2. "Secret Protection"の横にある**Enable**をclick
3. **Enable Secret Protection**をclickして確認

organization では security configuration を使って大規模に有効化します。
- Settings → Advanced Security → Global settings → Security configurations

### Step 2: Push Protectionを有効にする

Push protection は repository に到達する前、push process 中に secret を block します。

1. repositoryの**Settings** → **Advanced Security**へ移動
2. Secret Protectionの下で"Push protection"をenable

Push protectionは次の操作でsecretをblockします。
- command lineからのpush
- GitHub UIからのcommit
- file upload（ファイルアップロード）
- REST API request（REST APIリクエスト）
- REST APIのcontent creation endpoint

### Step 3: Exclusionを設定する（任意）

特定directoryのalertをauto-closeするため、`.github/secret_scanning.yml`を作成します。

```yaml
paths-ignore:
  - "docs/**"
  - "test/fixtures/**"
  - "**/*.example"
```

**制限:**
- `paths-ignore`は最大1,000 entry
- fileは1 MB未満
- 除外pathはpush protection checkもskip

**推奨方法:**
- exclusion pathは可能な限り具体的にする
- 各pathを除外する理由を説明するcommentを追加
- exclusionを定期的にreviewし、古いentryを削除
- exclusionについてsecurity teamに知らせる

### Step 4: 追加機能を有効にする（任意）

**Non-provider pattern** — private key、connection string、generic API keyを検出:
- Settings → Advanced Security → "Scan for non-provider patterns"をenableする

**AI-powered generic secret detection** — Copilotでpasswordのようなunstructured secretを検出:
- Settings → Advanced Security → "Use AI detection"をenableする

**Validity check** — 検出secretがactiveか検証:
- Settings → Advanced Security → enable "Validity checks"
- GitHubがprovider APIに対して検出credentialを定期的にtest
- alertに表示されるstatus: `active`、`inactive`、`unknown`

**Extended metadata check** — secret ownerに関する追加context:
- 先にvalidity checkをenableする必要がある
- remediationの優先順位付けと担当teamの特定に役立つ

## 基本Workflow — Blocked Pushを解決する

push protection が command line からの push を block した場合:

### Option A: Secretを削除する

**secretがlatest commitにある場合:**
```bash
# Remove the secret from the file
# Then amend the commit
git commit --amend --all
git push
```

**secretがearlier commitにある場合:**
```bash
# Find the earliest commit containing the secret
git log

# Start interactive rebase before that commit
git rebase -i <COMMIT-ID>~1

# Change 'pick' to 'edit' for the offending commit
# Remove the secret, then:
git add .
git commit --amend
git rebase --continue
git push
```

### Option B: Push Protectionをbypassする

1. push error messageで返されたURLを同じユーザーとして開く
2. bypassの理由を選択する:
   - **It's used in tests** — alertを作成してauto-closeする
   - **It's a false positive** — alertを作成してauto-closeする
   - **I'll fix it later** — open alertを作成する
3. **Allow me to push this secret**をクリックする
4. 3時間以内に再度pushする

### Option C: Bypass privilegeを申請する

delegated bypassが有効でbypass権限がない場合:
1. push errorのURLを開く
2. secretが安全である理由を説明するcommentを追加する
3. **Submit request**をクリックする
4. 承認または拒否のemail notificationを待つ
5. 承認されたらcommitをpushし、拒否されたらsecretを削除する

> bypassとdelegated bypassの詳細なworkflowは`references/push-protection.md`を検索してください。

## Custom Pattern（custom pattern）

regular expression を使って organization-specific secret pattern を定義します。

### Quick Setup（簡易setup）

1. Settings → Advanced Security → Custom patterns → **New pattern**
2. pattern nameとsecret format用のregexを入力する
3. sample test stringを追加する
4. **Save and dry run**をクリックしてテストする（最大1,000件）
5. false positiveがないかresultを確認する
6. **Publish pattern**をクリックする
7. 必要に応じてpatternのpush protectionを有効にする

### Scope（適用範囲）

Custom patternは次の単位で定義できます:
- **Repository level** — そのrepoだけに適用
- **Organization level** — secret scanningが有効なすべてのrepoに適用
- **Enterprise level** — すべてのorganizationに適用

### Copilot-assisted Pattern Generation（Copilot支援pattern生成）

Copilot secret scanningを使い、secret typeの説明文から任意のexample stringを含むregexを生成します。

> custom pattern設定の詳細は`references/custom-patterns.md`を検索してください。

## Alert Management（alert管理）

### Alert Type（alert type）

| type | 説明 | 表示場所 |
|---|---|---|
| **User alerts** | repositoryで見つかったsecret | Security tab |
| **Push protection alerts** | bypassによってpushされたsecret | Security tab（filter: `bypassed: true`） |
| **Partner alerts** | providerへ報告されたsecret | repoには表示されない（providerのみ） |

### Alert List（alert一覧）

- **Default alerts** — 対応provider patternとcustom pattern
- **Generic alerts** — non-provider patternとAI検出secret（repoあたり5,000件まで）

### Remediationの優先順位

1. **credentialを直ちにrotateする** — これが最優先の対応です
2. context（location、commit、author）のためalertを確認する
3. validity statusを確認する: `active`（緊急）、`inactive`（優先度低）、`unknown`
4. 必要ならGit historyから削除する（時間がかかり、rotate後は不要なことが多い）

### Alert を dismiss する

文書化した理由を付けてdismissします:
- **False positive** — 検出された文字列が実際のsecretではない
- **Revoked** — credentialがすでにrevokeされている
- **Used in tests** — secretがtest code内だけにある

> alert type、validity check、REST APIの詳細は`references/alerts-and-remediation.md`を検索してください。

## AI Coding Agent による Pre-Commit Scanning

commit 前に AI coding agent 内で code change の secret を scan するには、`run_secret_scanning` MCP tool と専用 scanning skill を提供する **Advanced Security plugin** を install します。

**GitHub Copilot CLI:**
```bash
/plugin install advanced-security@copilot-plugins
```

**Visual Studio Code:**
- Copilot Chatで**Chat: Plugins**を開き（または`@agentPlugins`を使い）、`advanced-security` pluginをインストールする
- 次にCopilot Chatで`/secret-scanning`を実行する

See: [Advanced Security Plugin — Secret Scanning Skill](https://github.com/github/copilot-plugins/blob/main/plugins/advanced-security/skills/secret-scanning/SKILL.md)

> [GitHub MCP Server経由のAI coding agentにおけるsecret scanning](https://github.blog/changelog/2026-03-17-secret-scanning-in-ai-coding-agents-via-the-github-mcp-server/)で2026年3月に発表されています。

## Reference Files（参照ファイル）

詳細な documentation が必要な場合は、次の reference file を読み込みます。

- `references/push-protection.md` — Push protectionの仕組み、bypass workflow、delegated bypass、user push protection
  - Search patterns: `bypass`, `delegated`, `bypass request`, `command line`, `REST API`, `user push protection`
- `references/custom-patterns.md` — Custom patternの作成、regex syntax、dry run、Copilotによるregex生成、scope
  - Search patterns: `custom pattern`, `regex`, `dry run`, `publish`, `organization`, `enterprise`, `Copilot`
- `references/alerts-and-remediation.md` — alert type、validity check、extended metadata、generic alert、secret削除、REST API
  - Search patterns: `user alert`, `partner alert`, `validity`, `metadata`, `generic`, `remediation`, `git history`, `REST API`

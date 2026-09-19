---
name: security-review
description: 'security researcherのようにcodeを推論し、data flowを追跡してcomponent interactionを理解し、pattern-matching toolが見逃すvulnerabilityを検出するAI-powered codebase security scannerです。security vulnerabilityのscan、bug、SQL injection、XSS、command injection、exposed API key、hardcoded secret、insecure dependency、access control issueの確認や、「自分のcodeは安全か」「security issueをreviewして」「codebaseをauditして」「vulnerabilityを確認して」といった依頼で使用します。JavaScript、TypeScript、Python、Java、PHP、Go、Ruby、Rustのinjection flaw、authentication/access control bug、secret exposure、weak cryptography、insecure dependency、business logic issueを扱います。'
---
# セキュリティレビュー

人間の security researcher のように codebase を推論する AI-powered security scanner です。data flow を追跡し、component interaction を理解し、pattern-matching tool が見逃す vulnerability を検出します。

## この Skill を使う場面

依頼に次が含まれる場合にこの Skill を使います。

- codebaseまたはfileのsecurity vulnerabilityをscanする
- security reviewまたはvulnerability checkを実行する
- SQL injection、XSS、command injection、その他のinjection flawを確認する
- exposed API key、hardcoded secret、credentialをcodeから探す
- dependencyを監査して既知のCVEを確認する
- authentication、authorization、access control logicをreviewする
- insecure cryptographyまたはweak randomnessを検出する
- data flow analysisを実行し、user inputを危険なsinkまで追跡する
- 「自分のcodeは安全か」「このfileをscanして」「repoのvulnerabilityを確認して」のような依頼
- `/security-review`または`/security-review <path>`を実行する

## この Skill の仕組み

pattern を照合する従来の static analysis tool と異なり、この Skill は次を行います。
1. **security researcher のように code を読む** — context、intent、data flow を理解する
2. **file をまたいで trace する** — user input が application 内をどう移動するか追う
3. **finding を自己検証する** — false positive を除くため各 result を再確認する
4. **severity rating を付ける** — CRITICAL / HIGH / MEDIUM / LOW / INFO
5. **targeted patch を提案する** — すべての finding に具体的な fix を含める
6. **human approval を必要とする** — 自動適用せず、常に先にレビューする

## 実行 Workflow

毎回、次のstepを**順番どおり**に実行します。

### Step 1 — Scope Resolution
scan 対象を決めます。
- pathが指定された場合（`/security-review src/auth/`）は、そのscopeだけをscan
- pathがなければrootから**project全体**をscan
- 使用言語とframeworkを特定（package.json、requirements.txt、
  go.mod, Cargo.toml, pom.xml, Gemfile, composer.json, etc.)
- `references/language-patterns.md`を読み、language-specific vulnerability patternを読み込む

### Step 2 — Dependency Audit（依存関係監査）
source code を scan する前に、まず dependency を audit します（すぐ得られる成果）。
- **Node.js**: 既知の脆弱なpackageがないか`package.json` + `package-lock.json`を確認する
- **Python**: `requirements.txt` / `pyproject.toml` / `Pipfile`を確認する
- **Java**: `pom.xml` / `build.gradle`を確認する
- **Ruby**: `Gemfile.lock`を確認する
- **Rust**: `Cargo.toml`を確認する
- **Go**: `go.sum`を確認する
- 既知のCVE、deprecated crypto library、または不自然に古いpinned versionを持つpackageをflag
- curated watchlistは`references/vulnerable-packages.md`を読む

### Step 3 — Secrets & Exposure Scan（secretと露出のscan）
すべての file（config、env、CI/CD、Dockerfile、IaC を含む）を scan して次を探します。
- hardcoded API key、token、password、private key
- 誤ってcommitされた`.env` file
- commentやdebug log内のsecret
- cloud credential（AWS、GCP、Azure、Stripe、Twilioなど）
- credentialを含むdatabase connection string
- 適用するregex patternとentropy heuristicは`references/secret-patterns.md`を読む

### Step 4 — Vulnerability Deep Scan（脆弱性の詳細scan）
これが中心の scan です。単に pattern-match するのではなく code を推論します。
各categoryの詳細は`references/vuln-categories.md`を読む。

**Injection Flaw（インジェクション脆弱性）**
- SQL Injection: string interpolationを使うraw query、ORM misuse、second-order SQLi
- XSS: escapeされていないoutput、dangerouslySetInnerHTML、innerHTML、template injection
- Command Injection: user inputを含むexec/spawn/system
- LDAP、XPath、Header、Log injection

**AuthenticationとAccess Control**
- sensitive endpointのauthentication欠落
- broken object-level authorization（BOLA/IDOR）
- JWT weakness（alg:none、weak secret、expiry validationなし）
- session fixation、CSRF protection欠落
- privilege escalation path（権限昇格経路）
- mass assignment / parameter pollution（過剰な一括代入 / parameter pollution）

**Data Handling（データ処理）**
- log、error message、API response内のsensitive data
- at restまたはin transitのencryption欠落
- insecure deserialization（安全でないデシリアライズ）
- path traversal / directory traversal（path traversal / directory traversal）
- XXE（XML External Entity）processing
- SSRF（Server-Side Request Forgery）

**Cryptography（暗号処理）**
- security用途でのMD5、SHA1、DES使用
- hardcoded IVまたはsalt
- weak random number generation（tokenにMath.random()）
- TLS certificate validation欠落

**Business Logic（ビジネスロジック）**
- race condition（TOCTOU）
- financial calculationのinteger overflow
- sensitive endpointのrate limiting欠落
- predictable resource identifier（推測可能なresource identifier）

### Step 5 — Cross-File Data Flow Analysis（file横断data flow分析）
fileごとのscan後に**holistic review**を行います。
- entry point（HTTP params、headers、body、file upload）からuser-controlled inputをsink（DB query、exec call、HTML output、file write）まで追跡する
- 複数fileを合わせて見た場合にだけ現れるvulnerabilityを特定
- serviceまたはmodule間のinsecure trust boundaryを確認

### Step 6 — Self-Verification Pass（自己検証）
各 finding について次を行います。
1. freshな視点でrelevant codeを読み直す
2. 「これは実際にexploit可能か、見落としたsanitizationがないか」を問う
3. frameworkまたはmiddlewareがupstreamで処理済みか確認する
4. genuine vulnerabilityでないfindingはseverityを下げるか破棄する
5. 最終severityをCRITICAL / HIGH / MEDIUM / LOW / INFOで付ける

### Step 7 — Security Report を生成する
`references/report-format.md` で定義された format で full report を output します。

### Step 8 — Patch を提案する
CRITICAL と HIGH の各 finding について具体的な patch を生成します。
- vulnerable code（before）を示す
- fixed code（after）を示す
- 何をなぜ変更したか説明する
- originalのcode style、variable name、structureを維持する
- fixを説明するcommentをinlineで追加する

明示的に次を記載します: **「各patchを適用前にreviewしてください。まだ何も変更していません。」**

## Severity Guide（severityの基準）

| Severity | 意味 | 例 |
|----------|---------|---------|
| 🔴 CRITICAL | 即時に悪用されるリスクが高く、データ漏えいの可能性が高い | SQLi, RCE, auth bypass |
| 🟠 HIGH | 深刻な脆弱性で、悪用経路が存在する | XSS, IDOR, hardcoded secrets |
| 🟡 MEDIUM | 条件付きまたは組み合わせによって悪用可能 | CSRF, open redirect, weak crypto |
| 🔵 LOW | ベストプラクティス違反で、直接的なリスクは低い | Verbose errors, missing headers |
| ⚪ INFO | 記録する価値はあるがvulnerabilityではない観測事項 | 古いdependency（CVEなし） |

## Output Rules（outputのルール）

- **必ず**最初にfinding summary tableを出す（severityごとの件数）
- **決して**patchを自動適用せず、human review用に提示する
- **必ず**findingごとにconfidence rating（High / Medium / Low）を含める
- **findingは**fileではなくcategoryでgroup化する
- **具体的に**file path、line number、正確なvulnerable code snippetを含める
- riskを平易な日本語で説明する — attackerが何をできるかを示す
- codebaseがcleanなら、scan範囲とともに「脆弱性は見つかりませんでした」と明確に述べる

## Reference Files（reference file）

詳細な detection guidance が必要な場合は、次の reference file を読み込みます。

- `references/vuln-categories.md` — 各vulnerability categoryの検出signal、安全なpattern、深刻度を上げる条件をまとめた詳細資料
  - Search patterns: `SQL injection`, `XSS`, `command injection`, `SSRF`, `BOLA`, `IDOR`, `JWT`, `CSRF`, `secrets`, `cryptography`, `race condition`, `path traversal`
- `references/secret-patterns.md` — regex pattern、entropyベースの検出、CI/CD secret risk
  - Search patterns: `API key`, `token`, `private key`, `connection string`, `entropy`, `.env`, `GitHub Actions`, `Docker`, `Terraform`
- `references/language-patterns.md` — JavaScript、Python、Java、PHP、Go、Ruby、Rustのframework固有vulnerability pattern
  - Search patterns: `Express`, `React`, `Next.js`, `Django`, `Flask`, `FastAPI`, `Spring Boot`, `PHP`, `Go`, `Rails`, `Rust`
- `references/vulnerable-packages.md` — npm、pip、Maven、Rubygems、Cargo、Go module向けの選別済みCVE watchlist
  - Search patterns: `lodash`, `axios`, `jsonwebtoken`, `Pillow`, `log4j`, `nokogiri`, `CVE`
- `references/report-format.md` — finding card、dependency audit、secret scan、patch proposalの形式を定めたsecurity report用structured output template
  - Search patterns: `report`, `format`, `template`, `finding`, `patch`, `summary`, `confidence`

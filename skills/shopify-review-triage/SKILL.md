---
name: shopify-review-triage
description: 'Shopify App Storeの公開review、low-star review、merchant feedbackをtriage、優先順位付け、cluster化し、productまたはsupport briefにまとめたい場合に使用します。「app store reviewをtriageして」「このfeedbackで最初に直すべきものは何か」「1-star reviewをcluster化して」「weekly low-star review briefを書いて」などで起動します。単一Shopify appまたは監視対象competitorを含むportfolioを対象に、incident risk、repeated friction、pricing confusion、feature request、明示的なneeds-human-read bucketを含むP0-P3 briefを作成し、各itemの公開source linkとfirst passまたはhuman-checkedのlabelを保持します。support ticket、order data、その他のprivate merchant dataには使用せず、reviewerへの返信や連絡にも使用しません。'
license: MIT
compatibility: 'Cross-platform. Pure reasoning skill over review rows the user pastes - no network access, scripts, API keys, or system packages. Portable to any client that supports the Agent Skills SKILL.md format.'
metadata:
  version: '1.0'
  author: 'Shopify App Review Brief - independent, not affiliated with or endorsed by Shopify Inc.'
  source: https://alfredtech2026.github.io/shopify-app-review-brief/guides/shopify-app-review-triage.html
---
# Shopify review triage - 公開 low-star review から P0-P3 brief へ

## この Skill の動作

**public** Shopify App Store review text の row を受け取り、product または support owner が行動できる prioritized brief を1つ作成します。各 review の問題の種類、影響の大きさ、最初に行うこと、原文の出典を示します。

独立したShopify app teamとsupportを運営するagency向けです。複数listingと監視対象competitorにlow-star reviewが分散して届き、それらをすべて同じ緊急度として扱う失敗を防ぎます。

以下のrubricはここで発明したものではありません。公開されたrule setをそのまま再現しているため、manual passとこのSkillは同じrowを同じように分類します。sourceは[Provenance](#provenance)を参照してください。

## 厳守ルール

これはstyle preferenceではありません。1つでも破ると、outputはない方がよい状態になります。

1. **公開review textのみ。** support ticket、merchant email、order data、personal contact detail、internal telemetry、listing pageに公開されていないその他のdataは対象外。inputに含まれていれば停止し、該当rowを示して削除を依頼します。
2. **evidenceを決して捏造しない。** 提供されていないreview、rating、date、app name、source URLを追加しません。linkのないrowは`source: not captured`とし、推測したlinkを使いません。
3. **keyword outputはsortでありverdictではない。** rubricだけで生成したものはすべて*first pass - not human-checked*とlabelします。reviewを読み自分のsystemと照合した人だけが*human-checked*へ変更できます。
4. **reviewはcustomer reportであり、検証済みdefectではない。** 「reviewerはeditorにblank screenが表示されたと報告した」と書き、「editorが壊れている」とは書きません。この区別をbriefにも残します。
5. **coverageを主張しない。** briefは提供されたrowだけを対象と明記し、listing、期間、appを網羅したとは言いません。
6. **promiseをしない。** revenue impact、outcome、ranking effect、legal/compliance adviceを記載しません。actionを提案し、結果を予測しません。
7. **draftのみ、誰にも連絡しない。** email送信、developer reply、support ticket、reviewerへのmessage、publishを行いません。draftをteamに返し、送信内容は人が決めます。
8. **reviewerは人です。** 「reviewer」と呼び、名前付け、profile化、推測をしません。

## 1. Row を集める

1行に1 reviewを求めます。full formならbriefに必要なsource linkを保持できます。

```text
rating | app name | review date | public reviews URL | review text
```

短い3-field formも受け付けます。field 1が単独の1-5（任意で`star`または`stars`が続く）ならrating、それ以外ならapp nameとして扱います。

```text
rating | app name | review text
```

この step のルール:

- `#`で始まる行はcommentです。空行はskipします。
- rowにsource URLがなければ、briefまで`source: not captured`を引き継ぎます。rowをdropしたりlinkを捏造したりしません。
- 自分で何かをfetchしません。このSkillにnetwork accessは不要で、支援対象者が既に開いた公開rowを貼り付けます。
- このrubricは**new 1-3-star review**向けです。higher-rated rowも正しくclassifyできます（5-star reviewはfeature requestまたはneeds-human-readになりやすい）が、提供されたものは保持し、low-star signalとは表示しません。

## 2. First pass - rubric を適用する

matching前にreview textをlower-caseし、curly apostrophe（`’`から`'`）をnormalizeします。これにより貼り付けた"won’t load"も`won't load`に一致します。以下のkeywordはapostropheを完全に削除した形でもmatchします。merchantはこのようなcontractionをapostropheなしで入力することが多く、apostropheなしの綴りもcontracted formとまったく同じにclassifyします。

bucket は5つです。各 row には、以下の順で最初に一致した dimension に基づく **primary** bucket をちょうど1つだけ割り当てます。追加の一致は **secondary** として記録し、2つ目の brief item にはしません。

### P0 - Incident risk（インシデントリスク）

purchase path、app activation、merchant dataが現在危険にさらされている可能性があります。放置するとmerchantの損失やteamのinstall数低下につながります。

**推奨action。** 今日中にtest storeで再現を試みます。確認できたらincidentとして扱い、先にfixまたはmitigateし、その後reviewerへ変更内容をreplyします。

**Signal keywords.** `won't load`, `won't open`, `won't close`, `can't close`, `cannot close`, `blank screen`, `broken`, `crash`, `stopped working`, `not working`, `doesn't work`, `does not work`, `checkout`, `losing sales`, `lost sales`, `error`

### P1 - Repeated friction（繰り返す摩擦）

productは動作するものの、同じ苦労がreview間またはopen support themeで繰り返し現れます。signalは形容詞の多さではなく反復です。

**推奨action。** 一致するsupport themeにlogします。同じcomplaintがrow間で繰り返されるなら、新featureより先にUX fixをscheduleします。

**Signal keywords.** `confusing`, `unclear`, `hard to`, `difficult`, `complicated`, `clunky`, `slow`, `couldn't figure`, `could not figure`, `annoying`, `had to contact support`, `setup took`, `too many steps`

### P2 - Pricing confusion（料金の混乱）

merchantが支払うと期待した内容と実際に起きたことが乖離しています。通常はlisting、plan limit、upgrade promptのcopy問題であり、code問題ではありません。

**推奨アクション。** reviewerの期待とlistingのpricing sectionおよびin-app upgrade promptを比較し、内容が乖離する箇所のcopyを明確にします。

**Signal keywords.** `pricing`, `price`, `charged`, `charge`, `billing`, `billed`, `expensive`, `free plan`, `trial`, `refund`, `hidden fee`, `hidden cost`, `paywall`

### P3 - Feature request（機能要望）

merchantがappにない機能、または見つけられなかった機能を望んでいます。log entryとしては有用ですが、それだけで緊急になることはまれです。

**推奨アクション。** reviewへのlinkを付けてfeature-request logに追加します。すでに機能がある場合は、どこで見つけられるかをreviewerへ返信します。

**Signal keywords.** `wish`, `would be great`, `would love`, `please add`, `feature request`, `missing`, `if only`, `would like`, `no option to`, `needs an option`, `hope you add`, `add support for`

### Needs human read（人による確認が必要）

keywordが一致しません。曖昧な不満、sarcasm、複合的な賞賛、contextが必要なstoryです。

**推奨action。** keywordが一致しません。heuristicで推測せず、full reviewを自分で読んでmanualに分類します。

**Priority。** rubricはこのbucketを`P2`とlabelして最後にsortします。このlabelはqueue上の暫定配置でありseverity judgmentではありません。まだ何も判断されていません。

### Tie-break と escalation

1. **最も重大なものを優先。** broken checkoutとbilling surpriseの両方を含むrowは、pricingをsecondaryとしてP0に分類します。1つのreviewを2つのbrief itemに分割しません。
2. **反復でescalate。** 同じfrictionまたはpricing themeが約60日以内に3 review以上で現れたら1 level上げ、何rowが変更の根拠かを記載します。
3. **古いreviewは割り引く。** 1年以上前のreviewはbackgroundであり、recent rowが裏付けない限りcurrent problemのevidenceではありません。headlineではなくcontextとして引用します。
4. **competitor reviewはP0を作らない。** competitorのincidentはroadmap、positioning、copy inputであり、competitor watch sectionに置きます。
5. **迷ったらneeds human read。** rubricが不確実性をpriority labelへ変換しないためのbucketです。

## 3. Human pass（昇格前に検証する）

first pass以降はこのSkillだけでは判断できません。itemをkeyword match以上のものとして提示する前に、teamの人が次を行います。

- source linkでfull original reviewを読む。
- P0 candidateはdevelopment storeで再現を試み、同時期のmatching signalをerror trackerとsupport inboxで確認する。
- 結果を*reproduced*、*not reproduced*、*attempted - notes attached*のいずれかで記録する。

これらの結果を推測せず求めます。結果を得るまで、summary lineを含むすべてのitemを*first pass - not human-checked*のままにします。未検証のP0はcandidateでありincidentではありません。

該当時は既知の制限を明記します。keyword matchingはEnglish-onlyでsarcasmとcontextを見逃し、「checkout」に言及しただけのreviewを誤分類する場合があり、提供されたrowだけを見ます。

## 4. Briefを書く

portfolioごとに1 documentを作り、sectionはrubric orderに従います。すべてのitemにowner、next action、source linkを付けます。ownerのないitemはnoteでありbrief entryではありません。

```markdown
# Low-star review brief - {portfolio or team name} - week of {YYYY-MM-DD}

Scope: {apps monitored} - {competitors watched} - {N} rows supplied, {date range}.
Covers only the rows supplied - no claim of exhaustive coverage.
Reviews are customer reports, not verified defects. Items marked "first pass" are
unverified keyword matches; "human-checked" means a person read the review and checked it.

## P0 - Incident risk
- **{App} - {signal in a few words}** ({rating} stars, {review date}, [source]({public reviews URL}))
  - Reviewer reports: {one sentence, in their words where possible}
  - Status: first pass - not human-checked / human-checked
  - Reproduced: {yes / no / attempted - notes}
  - Next action: {action} - owner {name}, due {date}

## P1 - Repeated friction
- **{App} - {theme}** ({rating} stars, {date}, [source]({public reviews URL}); also seen: {where})
  - Status: first pass - not human-checked / human-checked
  - Next action: {UX or docs change} - owner {name}, due {date}

## P2 - Pricing confusion
- **{App} - {signal}** ({rating} stars, {date}, [source]({public reviews URL}))
  - Expected vs. actual: {one line}
  - Status: first pass - not human-checked / human-checked
  - Next action: {copy or prompt change} - owner {name}, due {date}

## P3 - Feature requests
- **{App} - {request}** ({rating} stars, {date}, [source]({public reviews URL})) - {log it, or already exists so reply with where to find it}

## Needs human read
- **{App}** ({rating} stars, {date}, [source]({public reviews URL})) - {no keyword matched; what a human should look for}

## Competitor watch
- **{Competitor} - {signal}**: {what it implies for our roadmap, copy, or positioning}

## Decisions this week
- {one decision or experiment, with the rows that motivated it}
```

summary lineは件数から始めます。例: *「提供された8 rowをtriage: incident risk 3、repeated friction 2、pricing confusion 1、feature request 1、needs human read 1 - first pass、not human-checked。」*

## 5. 引き渡し前の Self-check

すべての行が真になるまでdeliverしません。

- [ ] すべてのitemが上記rubricのbucketとpriorityだけを示す。
- [ ] すべてのitemにsource linkまたは明示的な`source: not captured`がある。
- [ ] suppliedされていないreview text、rating、date、app name、URLがない。
- [ ] すべての未検証itemが*first pass - not human-checked*と記載され、行われていないhuman checkを主張しない。
- [ ] claimはcodeのfindingではなくreport（「reviewer reports...」）として表現される。
- [ ] scope lineがsupplied row数を示し、coverage claimをしない。
- [ ] revenue、rating、outcome、complianceのpromiseがない。
- [ ] private dataがoutputに残っていない。
- [ ] 何もsend、post、publishされておらず、briefがteam向けdraftである。

## 実例

この8つの架空のrowで、すべてのbucketを確認できます。そのうち2つはfeature-requestとneeds-human-read bucketに入るよう、意図的に4-starと5-starにしています。

```text
1 | Example Popup App | The editor shows a blank screen and the popup won't load. We are losing sales every day.
2 | Example Popup App | The overlay can't close on mobile and it blocks the checkout button.
1 | Example Currency App | Conversion is broken at checkout and we were still billed for the month.
3 | Example Currency App | Setup took hours and the settings screen is confusing. Support was slow to reply.
3 | Example Reviews App | The widget looks fine but the template editor is confusing and hard to use on a tablet.
2 | Example Currency App | We kept getting charged after uninstalling, and the pricing page never mentioned this.
4 | Example Reviews App | Great app, but I wish it could export reviews to CSV. Please add filtering by country.
5 | Example Reviews App | Does what it promises and support replied the same day.
```

これらのrowへのfirst pass:

```text
row 1 -> P0 incident risk
row 2 -> P0 incident risk
row 3 -> P0 incident risk (secondary: pricing confusion)
row 4 -> P1 repeated friction
row 5 -> P1 repeated friction
row 6 -> P2 pricing confusion
row 7 -> P3 feature request
row 8 -> needs human read
```

Row 4と5はどちらも`confusing`にmatchしたため、repeated themeとしてflagされます。2 rowのclusterであり、escalationをtriggerする3 rowにはまだ達していません。Row 3はpricingをsecondaryとして記録した単一のP0 itemであり、2 itemには分割しません。Row 8は何にもmatchせず、未判定のままです。これらのrowにはsource URLがないため、teamがlisting linkを提供するまで各itemは`source: not captured`と表示されます。

## 注意点

- **Shopify App Storeにはreviewごとの安定したpermalinkがありません。** listingのpublic reviews pageを引用し、rating filterを使った場合はそのfilter（`.../reviews?ratings%5B%5D=1`）を残します。review dateとreviewerの冒頭数語でitemを特定し、人が再発見できるようにします。
- **5フィールド形式を優先します。** briefに必要なreview dateとsource URLを保持できます。3フィールドparserは2つ目の`|`以降をすべてreview textへ取り込むため、dateとURLを含むrowも分類できますが、引用されたreview内に表示されます。
- **`checkout`はこの集合で最も誤検出が多いkeywordです。** "we love the checkout upsell"でも反応します。
  根拠が`checkout`という単語だけのP0は、P0 badgeを付けたneeds-human-read rowです。P0へ昇格させず、そのことを明記します。
- **`missing`と`error`はbucketをまたぎます。** "missing a dark mode"はP3で、"settings page errors out"はP0です。primary bucketの順序で衝突を機械的に解決し、human passで誤った箇所を修正します。
- **英語以外のreviewはまったくmatchしません。** needs human readに分類されます。それが正しい結果です。翻訳してkeywordがmatchしたかのように分類しないでください。
- **competitorのP0は自分たちのP0ではありません。** team自身のlistingより深刻な表現でもcompetitor watchに入れます。
- **1 reviewにつき1 itemです。** secondary matchはannotationです。reviewを複数sectionに分けると、同じmerchantを二重に数え、summary lineの件数を水増しします。

## 出典

上記のdimension、priority、keyword list、推奨action、tie-break rule、brief templateは、公開されたmanual triage guideから再現したものです。
<https://alfredtech2026.github.io/shopify-app-review-brief/guides/shopify-app-review-triage.html>

このguideは独立して管理されており、Shopify Inc.またはいずれのapp developerとも提携、承認、スポンサー関係にありません。ShopifyはShopify Inc.の商標です。

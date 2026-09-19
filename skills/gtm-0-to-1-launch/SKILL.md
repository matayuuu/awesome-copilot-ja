---
name: gtm-0-to-1-launch
description: アイデアから最初の顧客まで新製品を立ち上げる。製品のローンチ、アーリーアダプターの発見、ローンチ週のプレイブック作成、採用停滞の診断、報道露出が成長と同義ではないことの理解に使う。3 層診断、2 週間の実験サイクル、5 万インプレッションと 12 件のサインアップに終わったローンチを含む。
license: MIT
metadata:
  author: Smit Patel (https://linkedin.com/in/smitkpatel)
  source: https://github.com/beingsmit/technical-product-gtm
---

# 0-to-1 ローンチ

アイデアから最初の顧客まで新製品を立ち上げる。目的は見出しではなく、あなたなしではいられない 10 人の顧客を見つけることだ。

## 使用する場面

**トリガー:**
- 「この製品をどうローンチすればよいか」
- 「最初の顧客を獲得する戦略」
- 「ローンチしたが誰も使っていない」
- 「Product Hunt と直接アプローチのどちらがよいか」
- 「認知はあるがコンバージョンがない」
- 「うまくいっているかどう判断するか」

**コンテキスト:**
- 新製品のローンチ
- 新製品のように扱う機能ローンチ
- 最初の 10～50 顧客の発見
- プロダクトマーケットフィットの検証
- 初期トラクションが停滞する理由の診断

---

## 中核フレームワーク

### 1. 報道 ≠ 成長（12 件のサインアップに終わったローンチ）

**パターン:**

全面的な報道ツアーを伴う機能ローンチを調整した。TechCrunch、VentureBeat、製品ブログで大々的に告知する日だった。

**結果:**
- 5 万インプレッション
- 12 件のサインアップ
- 2 件のコンバージョン

**失敗した理由:**

Optimized for media buzz, not user value. The feature wasn't ready for self-serve. It needed education, context, hand-holding. Press gives you eyeballs. But eyeballs without activation = vanity.

**より効果的な方法:**

Email 50 target customers directly. "We built [feature] because teams like yours struggle with [problem]. Want early access?" Walk them through setup personally. Get feedback, iterate.

**Result:** 50 emails → 15 replies (30% reply rate) → 8 trials → 4 conversions (50% trial-to-paid).

**教訓:**

Early customers come from direct outreach, not press coverage. Press matters later (Series A announcement, major milestone). For 0-to-1, it's distraction.

---

### 2. 3 層診断（ローンチが停滞する理由）

**The Pattern:**

You launched. You have some awareness. But conversion is weak. The problem lives in one of three layers, and each requires a different intervention.

**Layer 1: Positioning Problem**

Symptoms:
- Messaging sounds like competitors
- Differentiation requires explaining complex technical details
- Buyers see you as interchangeable with alternatives
- Sales conversations get derailed by comparison questions

Diagnosis: You're "fighting an asymmetric war on the wrong front" — competing on features against better-funded companies. Map where competitors claim unique value. Find the position they can't easily copy.

Fix: Stake a claim you can own structurally (not just through product features). Test with outbound messaging before committing product resources.

**Layer 2: Experience Problem**

Symptoms:
- Strong awareness but weak activation
- Users sign up but don't complete first workflow
- Multiple entry points creating decision paralysis
- Documentation is feature-centric, not outcome-centric

Diagnosis: Flexibility without opinionated defaults is a liability, not a feature. Users face the "paradox of choice" — too many options, not enough guidance to the aha moment.

Fix: Identify 2-3 "undeniable use cases" that deliver immediate value. Restrict onboarding to those specific use cases. Gate advanced features behind a mastery path. Rewrite help content around jobs-to-be-done, not feature lists.

**Layer 3: Alignment Problem**

Symptoms:
- Team reports being "out of bandwidth" for customers
- Different functions optimize for different metrics
- Every idea has equal weight (no tiebreaker)
- No clear north star connecting activities to outcomes

Diagnosis: "Exploratory mode" — where every initiative has equal priority — becomes destructive when resources are constrained.

Fix: Define a single shared north star. Use it as tiebreaker for every decision: "Does this help us win a customer?" Cut activities that don't ladder up. Make progress visible weekly, not quarterly.

**How to Use This:**

When a launch stalls, diagnose which layer is broken before throwing resources at it. Fixing experience when the problem is positioning wastes engineering time. Fixing positioning when the problem is internal alignment wastes marketing spend.

---

### 3. 最初の 10 顧客フレームワーク

**原則:** 最初の 10 顧客は売上のためではなく、学習のためにいる。

**学ぶこと:**
1. Does the product actually solve the problem?
2. What's the activation flow? (How do they get value?)
3. What objections come up? (Price, features, integrations?)
4. Who's the real buyer? (Title, role, budget authority?)
5. What's the sales cycle? (Days, weeks, months?)

**見つけ方:**

**Channel 1: Personal Network (first 2-3)**
- "I'm building [X], can I get your feedback?"
- Convert to paying customers (don't give away for free — free users give different feedback than paying ones)

**Channel 2: Direct Outreach (customers 3-20)**
- Build list of 100 target accounts
- Personalize to their specific pain
- Test messaging variants — which angle gets replies?

**Channel 3: Ceiling Moment Targeting (highest-intent)**
- The highest-intent prospects are people who've already adopted a comparable solution and hit its limits
- They've invested in learning a tool, hit its ceiling, and have low switching costs
- Craft outreach around the limitation: "We see teams that outgrow [incumbent] when they need [capability]. That's what we built."
- These convert 3-5x better than cold outreach because they already understand the problem

**Channel 4: Community (developer products)**
- "Built [X] to solve [problem], looking for early users"
- Offer white-glove onboarding
- Best for products where users congregate in Slack/Discord/forums

---

### 4. 2 週間の実験サイクル

**The Pattern:**

Speed in early stages matters more than perfection. The constraint isn't whether you're right — it's how quickly you can test assumptions and iterate.

**How to Execute:**

- Frame every test with clear success criteria before starting
- Test one variable per experiment (messaging, channel, pricing, feature)
- Run for 2 weeks maximum — if it's not showing signal by then, it won't
- If it works, allocate 3x resources within a week
- If it doesn't, kill it and move to the next test
- Document what you learned regardless of outcome

**プレイブックのルール:**

Every successful experiment must become a playbook before scaling. Structure: Goal → Steps → Expected output → Metrics → Risks. If someone unfamiliar can't execute the playbook, it's not documented well enough.

**これが重要な理由:**

One-off wins don't compound. Systematized experiments do. The goal isn't a single launch — it's building a repeatable machine for testing assumptions at speed.

**よくある失敗:**

Over-planning before testing. Waiting for "perfect" conditions before launching. Staying with failing experiments too long because you've invested emotional energy. Make decisions with 70% information.

---

### 5. パートナー主導の市場参入（販売網がない場合）

**The Pattern:**

Rather than entering new markets through direct sales alone, use partnerships with established players to accelerate.

**How to Execute:**

1. Identify market leaders in your target segment
2. Approach with customer problem, not partnership pitch — "What if your users could access [capability]?" shifts from your need to their need
3. Start small: Help them solve one specific problem (narrow integration, not full partnership)
4. Prove value with a 3-6 month pilot before asking for broader commitment
5. Build reference customers together — reduces their risk
6. Leverage their GTM: once integrated, they market to their base

**The Supernode Pattern:**

Position yourself as the integration hub that other tools naturally connect through. You own critical data or workflows that other platforms need. This compounds — each new partner makes you more valuable to the next.

**Category Sequencing:**

Don't pursue partnerships everywhere. Dominate 2-3 categories per quarter:
1. Lead with genuine use cases: "Our users ask for [partner] integration 50x per month"
2. Once you partner with a top player, competitors feel urgency to work with you too
3. After 2-3 successful partnerships in a category, create joint customer stories

**Common Mistake:**

Launching partnerships without clear integration pathways. Expecting partners to drive awareness without support. Treating partnerships as a sales channel rather than platform expansion.

---

### 6. PMF 検証チェックリスト

**Product-market fit is when customers pull you forward, not when you push them.**

**Retention:**
- [ ] 40%+ of Week 1 users return Week 4
- [ ] Usage increasing over time
- [ ] Customers renewing without sales push

**Organic Growth:**
- [ ] Word-of-mouth referrals happening
- [ ] Customers asking "can I add my team?"
- [ ] Inbound interest without paid marketing

**Sales Velocity:**
- [ ] Sales cycles shortening
- [ ] Win rates >30% of trials
- [ ] Customers saying "we need this now"

**Qualitative:**
- [ ] >40% very disappointed if product went away (Sean Ellis test)
- [ ] Customers can articulate what it's for (clear use case)
- [ ] Customers advocating publicly

**If you don't have these, you don't have PMF yet. Don't scale marketing/sales.**

---

## 判断ツリー

### ローンチが停滞している理由は何か

```
Do prospects understand what you are?
├─ No → Layer 1: Positioning problem
│         Fix: Test new messaging before changing product
└─ Yes → Continue...
    │
    Do users activate after signing up?
    ├─ No → Layer 2: Experience problem
    │         Fix: Restrict onboarding to 2-3 use cases, guide to aha moment
    └─ Yes → Continue...
        │
        Is the team aligned on what matters?
        ├─ No → Layer 3: Alignment problem
        │         Fix: Single north star, weekly visibility, cut non-essential
        └─ Yes → Keep iterating, you're on the right track
```

### 報道ローンチか直接アプローチか

```
Self-serve ready? (Users get value in <10 min)
├─ No → Direct outreach only (press won't convert)
└─ Yes → Do you have >$1M funding to announce?
    ├─ Yes → Both (press for awareness, outreach for conversion)
    └─ No → Direct outreach first, press later
```

---

## よくある失敗

**1. Optimizing for headlines instead of activation**
50K impressions and 12 signups. Press ≠ growth.

**2. No target customer list before launch**
Spray-and-pray doesn't work at 0-to-1. Build the list of 100 accounts first.

**3. Flexibility without defaults**
Giving users every option paralyzes them. Pick 2-3 undeniable use cases and guide hard.

**4. Giving product away for free**
Free users give polite feedback. Paying users give honest feedback.

**5. Scaling before learning**
First 10 customers are for learning, not revenue. Document everything.

**6. Over-planning, under-testing**
2-week experiments with clear kill criteria. Move fast, document learnings.

**7. Diagnosing the wrong layer**
Positioning fix when the problem is experience = wasted marketing. Experience fix when the problem is positioning = wasted engineering.

---

## クイックリファレンス

**Three-layer diagnosis:**
Layer 1: Positioning (messaging sounds like competitors) → Test new messaging
Layer 2: Experience (awareness but no activation) → Guide to aha moment
Layer 3: Alignment (team scattered) → Single north star, weekly visibility

**First 10 customers:**
Personal network (2-3) → Direct outreach (3-20) → Ceiling moment targeting (highest intent) → Community (developer products)

**2-week experiment cycle:**
Hypothesis → Success criteria → Test (2 weeks max) → Kill or 3x → Document playbook

**PMF signals:**
40%+ Week 1→4 retention + word-of-mouth + shortening sales cycles + >40% very disappointed

**Partner-led entry:**
Customer problem first → Narrow pilot → Reference customers together → Leverage their GTM

---

## 関連 Skill

- **product-led-growth**: Scaling after initial traction
- **positioning-strategy**: Positioning for launch
- **partnership-architecture**: Partner-led market entry

---

*Based on launching features that optimized for press and got 12 signups from 50K impressions, diagnosing launch stalls across three companies using the three-layer model, and building the 2-week experiment cycle that turned ad hoc testing into a repeatable machine. Also draws on partner-led market entry across multiple geographies and segments. Not theory — lessons from mistaking vanity metrics for growth and learning to diagnose the actual problem.*

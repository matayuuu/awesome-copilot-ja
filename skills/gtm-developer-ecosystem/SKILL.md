---
name: gtm-developer-ecosystem
description: 'エコシステムプログラムを通じて開発者主導の採用を構築・拡大する。オープンとキュレーションの選択、開発者プログラムの構築、プラットフォーム採用の拡大、学生プログラムのパイプライン設計に使う。'
license: MIT
metadata:
  author: Smit Patel (https://linkedin.com/in/smitkpatel)
  source: https://github.com/beingsmit/technical-product-gtm
---

# 開発者エコシステム

Build and scale developer-led adoption through ecosystem programs, community, and partnerships. Focus on what actually drives adoption, not vanity metrics.

## 使用する場面

**トリガー:**
- 「開発者エコシステムをどう構築するか」
- 「品質をキュレーションすべきか、オープンにすべきか」
- 「開発者コミュニティが成長しない」
- 「誰もこちらの API 上に構築していない」
- 「大規模なプラットフォームとどう競争するか」

**コンテキスト:**
- API プラットフォームと開発者ツール
- 拡張性を備えた製品（プラグイン、統合）
- 開発者ファーストの GTM モーション
- プラットフォーム型ビジネスモデル

---

## 中核フレームワーク

### 1. オープンかキュレーションか（マーケットプレイスの判断）

**パターン:**

Running ecosystem at a developer platform. Leadership debate: Open the marketplace to anyone, or curate for quality?

**Quality control camp:** "We need gatekeeping. Otherwise we'll get SEO spam, low-quality integrations, brand damage."

**Open camp:** "Developers route around gatekeepers. Network effects matter more than quality control."

**The decision:** Went open. Quality concerns were real, but we made a bet: control comes from discovery and trust layers, not submission gatekeeping.

**ゲートキーピングの代わりに構築したもの:**

1. **Search and discovery** — Surface high-quality integrations through algorithms, not human curation
2. **Trust signals** — Verified badges, usage stats, health scores
3. **Community curation** — User ratings, collections, recommendations
4. **Moderation** — Remove spam after publication, not block before

**結果:** Network effects won. Thousands of integrations published. Quality surfaced through usage, not through us deciding upfront.

**判断フレームワーク:**
- **Curated** works when: Brand risk high, dozens of partners, can scale human review
- **Open** works when: Hundreds/thousands of potential partners, network effects matter more than quality control

**よくある失敗:**

Defaulting to curated because "we need quality control." This works when you have 10 partners. At 100+, you become the bottleneck. Build discovery and trust systems instead.

---

### 2. 3 年間の学生プログラム

**The Pattern:**

Most developer programs optimize for quick wins. Better approach: Build long-term talent pipeline.

**Year 1: University Partnerships**
- Partner with CS departments
- Curriculum integration (hackathons, coursework)
- Student licenses (free or heavily discounted)
- Metrics: # universities, # students activated

**Year 2: Student Community & Certification**
- Student expert certification program
- Student-led workshops and events
- Campus ambassadors
- Metrics: # certified, # student-led events

**Year 3: Career Bridge**
- Job board connecting students → companies
- Enterprise partnerships (hire certified students)
- Alumni network
- Metrics: # hired, company partnerships

**これが機能する理由:**

Students become enterprise buyers 5-10 years later. You're building brand loyalty before they have purchasing power.

**Common Mistake:**

Treating students as immediate revenue. They're not. They're future enterprise decision-makers.

---

### 3. 開発者の道のり（認知 → 統合 → 支持）

**Stage 1: Awareness**
- How do they discover you?
- Content, search, word-of-mouth, events

**Stage 2: Onboarding**
- First API call in <10 minutes
- Quick-start guides
- Sample code in popular languages

**Stage 3: Integration**
- Building real use cases
- Integration guides
- Support when stuck

**Stage 4: Production**
- Deployed and generating value
- Monitoring usage
- Enterprise upgrade path

**Stage 5: Advocacy**
- Sharing publicly
- Recommending to others
- Contributing back (docs, code, community)

**重要な指標:**
- Time to first API call (onboarding)
- % reaching production (integration success)
- Monthly active developers (engagement)
- Developer NPS (advocacy)

**Common Mistake:**

Measuring vanity metrics (sign-ups, downloads) instead of real engagement (API calls, production deployments).

---

### 4. ドキュメント階層

**Tier 1: Quick Starts (Get to Value Fast)**
- "Hello World" in 5 minutes
- Common use case examples
- Copy-paste code that works

**Tier 2: Guides (Solve Real Problems)**
- Use case-specific tutorials
- Integration patterns
- Best practices

**Tier 3: Reference (Complete API Docs)**
- Every endpoint documented
- Request/response examples
- Error codes and handling

**Tier 4: Conceptual (Understand the System)**
- Architecture overviews
- Design philosophy
- Advanced patterns

**Most developers need:** Tier 1 first, then Tier 2. Very few read Tier 4.

**Common Mistake:**

Starting with Tier 3 (comprehensive API reference). Developers want quick wins first.

---

### 5. Community と Support（どちらを使うか）

**Community (Async, Scalable):**
- Slack/Discord for real-time help
- Forum for searchable Q&A
- GitHub discussions for feature requests
- Best for: Common questions, peer-to-peer help

**Support (Sync, Expensive):**
- Email support for enterprise
- Dedicated Slack channels for partners
- Video calls for complex integrations
- Best for: Paying customers, strategic partners

**振り分け方:**

**Community first:**
- Developer asks question
- Community member answers
- You validate and upvote
- Searchable for future developers

**次の場合は Support にエスカレーションする:**
- No community answer in 24 hours
- Enterprise/paying customer
- Security or compliance issue
- Complex integration requiring custom work

**Common Mistake:**

Providing white-glove support to everyone. Doesn't scale. Build community that helps itself.

---

### 6. 開発者エコシステムのパートナー階層

**Tier 1: Integration Partners (Self-Serve)**
- Build with public API
- You provide: docs, Slack channel, office hours
- They drive their own marketing
- Best for: Ambitious partners with resources

**Tier 2: Strategic Partners (Co-Development)**
- Co-developed integration
- You provide: dedicated channel, co-marketing
- Joint case studies
- Best for: High-impact integrations

**Don't over-tier.** 2 tiers is enough. More creates confusion.

---

## 判断ツリー

### オープンかキュレーションか

```
Is brand damage risk high if low-quality partners join?
├─ Yes (regulated, security) → Curated
└─ No → Continue...
    │
    Can you scale human review?
    ├─ No (hundreds/thousands) → Open + discovery systems
    └─ Yes (dozens) → Curated
```

### Community か Support か

```
Is this a common question?
├─ Yes → Community (forum, Slack, docs)
└─ No → Continue...
    │
    Is requester paying customer?
    ├─ Yes → Support (email, dedicated)
    └─ No → Community (with escalation path)
```

---

## よくある失敗

**1. Building ecosystem before product-market fit**
   - Fix core product first, then build ecosystem

**2. No developer success team**
   - Developers need help to succeed beyond docs

**3. Poor documentation**
   - Foundation of ecosystem, non-negotiable

**4. Treating all developers equally**
   - Tier support by strategic value (paying > free, partners > hobbyists)

**5. No integration quality standards**
   - Low-quality integrations hurt your brand

**6. Measuring only vanity metrics**
   - Track activation and production usage, not just sign-ups

**7. Developer advocates with no technical depth**
   - Hire developers who can code and teach

---

## クイックリファレンス

**Open ecosystem checklist:**
- [ ] Search and discovery (surface quality algorithmically)
- [ ] Trust signals (verified badges, usage stats, ratings)
- [ ] Community curation (user recommendations, collections)
- [ ] Moderation (remove spam after publication)

**Developer journey metrics:**
- Awareness: Traffic, sign-ups
- Onboarding: Time to first API call (<10 min target)
- Integration: % reaching production deployment
- Advocacy: Developer NPS, public sharing

**Documentation hierarchy:**
1. Quick starts (5-min "Hello World")
2. Use case guides (solve real problems)
3. API reference (complete documentation)
4. Conceptual (architecture, philosophy)

**Partner tiers:**
- Tier 1: Self-serve (public API, docs, community)
- Tier 2: Strategic (co-development, co-marketing)

**Student program timeline:**
- Year 1: University partnerships, activation
- Year 2: Certification, student community
- Year 3: Job board, enterprise hiring bridge

---

## 関連 Skill

- **partnership-architecture**: Partner deal structures and co-marketing
- **product-led-growth**: Self-serve activation funnels for developer products
- **0-to-1-launch**: Launching developer products

---

*Based on building developer ecosystems at multiple platform companies, including the open vs curated marketplace decision, student program development (3-year arc building talent pipeline), and partner ecosystem growth. Not theory — patterns from building developer ecosystems that actually drove platform adoption and multi-year brand loyalty.*

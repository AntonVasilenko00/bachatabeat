# BachataBeat — Bachata Music Analyzer (Full Idea Doc)

---

## Overview

A web app for the bachata community where dancers, teachers, and DJs can link their Spotify account (later YouTube and Apple Music), add songs by pasting a link, listen in-app, and manually annotate the full song structure: sync counts (1–2–3–tap), breaks, accents, rhythm changes, and sections. Annotated breakdowns are stored in a database and shared in a community catalog so anyone can browse and listen to songs with their structure visible. The product speaks the language of bachata — counts, taps, breaks — not generic music analysis.

---

## Problem Statement

### Problem

There is no existing resource that breaks down bachata songs by structure and timing. Dancers learn timing by ear or from a teacher in class, but have nothing to reference afterward. Teachers prepare breakdowns ad-hoc, often only in their heads, and repeat the same work for every class. DJs preview songs manually to find breaks and transitions, with no structured view of where things happen. People sometimes scribble notes on paper or in spreadsheets, but nothing is standardized, shareable, or tied to playback.

### Target Audience

- **Social bachata dancers** — Hobbyists who go to socials and classes, want to practice at home but struggle to remember song structure.
- **Performance/competition dancers** — Need precise timing for choreography and performances.
- **Bachata teachers/instructors** — Need to show students song structure before teaching; currently count aloud and prepare mentally each time.
- **Bachata DJs** — Need to know where breaks, accents, and sections are to plan transitions and setlists.

### Pain Points

- No single resource exists for bachata song structure — dancers rely on memory from class or re-learn by ear.
- Teachers spend time re-creating the same breakdowns verbally in every class; nothing is reusable or shareable.
- DJs preview songs one by one with no structured data; building a setlist is manual guesswork.
- Personal notes (paper, spreadsheets) are unstructured, not linked to playback, and not in a format other dancers can use.
- Without a shared catalog, every dancer or teacher has to figure out timing independently.

---

## Solution

### Proposed Solution

A web app that connects to Spotify (v1; YouTube and Apple Music later), lets users add songs by pasting a link, and plays the track in-app. While listening, users manually annotate the timeline: marking sync counts (1–2–3–4, 1–2–3–tap), breaks, accents, rhythm changes, and section boundaries (intro, verse, chorus, bridge, outro). Annotated songs are saved to a database and appear in a community catalog. Other users can browse the catalog, find a song, and listen with the breakdown overlaid on the timeline.

### Unique Selling Proposition (USP)

**Manual, human-curated breakdowns by dancers for dancers.** The breakdown uses bachata terminology (counts, taps, breaks, sections) rather than generic music analysis. The community catalog — built by users — is the core value: a shared, structured view of bachata songs that no other product provides.

### Key Features

- **Account linking:** Connect Spotify (v1); YouTube and Apple Music added later.
- **Add by link:** Paste a song URL; app resolves metadata and enables playback.
- **In-app playback:** Listen to the song in the app, controlled by the annotation flow.
- **Manual annotation:** Mark sync counts, breaks, accents, rhythm changes, and sections on a timeline.
- **Database storage:** Every breakdown is stored with timestamps and labels.
- **Community catalog:** Browse all songs with breakdowns; filter, search, and listen with the breakdown visible.
- **Bachata-native schema:** Counts, taps, breaks, and sections use dancer terminology.

---

## Market Research

### Market Size

- **TAM:** The global dance education and fitness market (which includes partner dance) was roughly $100B+ in 2024. Latin dance (salsa, bachata, kizomba) is a subset. If we narrow to "music/dance tech tools for Latin dance" — a niche — a rough TAM could be $50M–$200M in annual revenue opportunity if every bachata dancer, teacher, and DJ used a paid tool. This is an estimate; no precise data exists for dance-structure tools.
- **SAM:** Bachata dancers, teachers, and DJs who actively seek structured song breakdowns. Bachata has grown sharply (festivals, schools, socials on every continent). A conservative SAM: 500K–2M global users who would consider such a tool, with 20–30% willing to pay. That implies roughly 100K–600K potential paying users.
- **SOM:** Realistic near-term (1–3 years): early adopters in English-speaking bachata communities (US, UK, Europe). Target 5K–20K MAU and 500–3K paying subscribers could yield roughly $30K–$150K ARR at $5–15/mo, depending on conversion and churn.
- **Key assumptions:** Bachata remains popular; no direct competitor launches a similar product; users will pay for convenience and a community catalog; Spotify API remains accessible for integration.

### Competitor Analysis

| Competitor | Strengths | Weaknesses |
|------------|-----------|------------|
| Chordify, Songsterr | Chord/tab detection, music analysis | For guitar/instruments, not dance; no bachata counts, breaks, or sections |
| BPM Counter apps | Simple BPM detection | No structural breakdown; no community catalog; no playback integration |
| YouTube tutorial videos | Teachers explain song structure verbally | Not searchable by song; no shared database; can't browse by structure |
| Personal notes / spreadsheets | Flexible, free | Unstructured, not linked to playback, not shareable, no standard format |
| (No direct competitor) | — | No product combines in-app playback + manual dancer-specific annotation + community catalog for bachata |

**Positioning gaps:** No product offers a community catalog of bachata song breakdowns (counts, breaks, sections) with playback integration. There is clear whitespace for a bachata-specific, community-built tool.

### Trends

**Google Trends queries to run:**

- "bachata dance" — overall interest in bachata
- "bachata lessons" — interest in learning/teaching
- "bachata festival" — interest in events and community
- "bachata music structure" / "bachata counts" — problem-aware searches (may be low volume)
- "dance music analysis" — adjacent solution space

**How to run and interpret:**

- Go to [trends.google.com](https://trends.google.com)
- Set time range to 5 years for long-term trends; 12 months for recent momentum
- Region: Worldwide or compare US, UK, Spain, Latin America
- Compare queries; look for rising interest in bachata, dance education, and music analysis

**Trends summary:** Search interest in bachata has likely grown over the past 5 years, driven by festivals, social media, and online dance content. There is no direct indicator for "bachata song structure" or "dance music breakdown" — the problem may be latent. Validating with customer interviews and a simple landing page is recommended before committing to build.

---

## Validation

### Customer Interviews

**Who to interview:**

- **Bachata teachers/instructors** — Bachata schools, festivals, Instagram (search "bachata teacher"), Facebook groups (Bachata Teachers, Bachata Community), referrals from dancers
- **Social bachata dancers** — Local social dance events, Facebook bachata groups, r/bachata, Instagram/TikTok bachata community
- **Bachata DJs** — Festival DJs, DJ pages on Instagram, bachata DJ groups on Facebook, event organizers

**Key questions (Mom Test–compliant):**

- "When was the last time you needed to know the structure of a bachata song — where the breaks are, where to count — and what did you do?"
- "How often does this come up for you — weekly, monthly, or only sometimes?"
- "What do you currently use to remember or prepare song structure — notes, spreadsheets, memory, YouTube? Walk me through your process."
- "Have you tried any tools or methods for this and stopped? Why did you stop?"
- "How much time do you spend per week or month learning songs, preparing breakdowns, or trying to remember timing?"

**How to summarize feedback:**

| Interviewee | Key Feedback | Problem Confirmed? | Willingness to Pay? |
|-------------|--------------|--------------------|---------------------|
| [Name/role] | [1–2 sentence summary] | Yes / No / Partial | [Signal] |

### Waitlist

**When to set up:** Before any implementation — as soon as you have a name, one-liner, and landing page.

**How to set up:**

- Create a simple landing page (tools: Carrd, Typedream, Framer, Unbounce, or a single HTML page)
- Include: headline ("The bachata song breakdown catalog the community never had"), one-liner ("Add songs, annotate counts and breaks, browse a shared catalog. Made by dancers for dancers."), email capture form, clear CTA ("Join the waitlist" / "Get early access")
- Connect email capture to: Mailchimp, ConvertKit, Buttondown, or a simple Google Form → Sheet

**Metrics to track:**

- Landing page visitors → sign-up conversion rate (target: >10% = strong interest)
- Email open rate on follow-ups (target: >40%)
- Reply rate to follow-up questions (target: >10%)

### Pre-sell

**Why pre-sell:** A sign-up is interest; a payment is validation. Collecting money (or hard commitment) before building is the strongest signal.

**Pre-sell methods:**

- **Paid waitlist:** Charge a small fee ($5–$20) for priority access when the product launches. Tools: Gumroad, Stripe Payment Links, LemonSqueezy.
- **Pre-order / "Buy now":** Add a purchase button for a discounted early-bird annual price (e.g., $49/year instead of $99). Deliver when ready or refund if you don't build.
- **Manual / concierge sales:** Manually create breakdowns for 5–10 songs for the first 5–10 customers. Charge $20–50. Validates willingness to pay and demand for the catalog.
- **Letter of intent:** For teachers/DJs — get written commitment ("I would pay $X/mo for access to a catalog like this").

**Order of operations:**

1. Problem interviews (do people actually have this problem?)
2. Waitlist + landing page (does anyone care enough to sign up?)
3. Pre-sell (will anyone pay before it exists?)
4. → Only then: build.

### Prototype Testing (if applicable)

| What was tested | What worked | What didn't work | What to improve |
|-----------------|-------------|------------------|-----------------|
| [Test 1] | [Result] | [Result] | [Next step] |

### Validation Metrics (Summary)

| Metric | Target | Actual | Signal |
|--------|--------|--------|--------|
| Interview problem confirmation rate | >70% | [TBD] | [Strong/Weak/Unclear] |
| Waitlist sign-up conversion | >10% | [TBD] | [Strong/Weak/Unclear] |
| Pre-sell conversion / payments | >2% of visitors | [TBD] | [Strong/Weak/Unclear] |
| Email open rate | >40% | [TBD] | [Strong/Weak/Unclear] |

---

## Business Model

### Revenue Streams

- **Primary:** Monthly/annual SaaS subscription (freemium). Free tier: browse community catalog, limited plays or songs per month. Paid tier: unlimited catalog access, full annotation tools, offline/saved playlists, priority support.
- **Secondary:** Premium add-ons (e.g., AI-assisted breakdown as future feature), optional tips/donations to breakdown contributors (future).
- **Future potential:** Enterprise tier for dance schools (bulk accounts, white-label catalog), affiliate or partnership revenue from bachata festivals/schools, API access for third-party integrations.

### Pricing Strategy

**Model:** Freemium — free catalog access to drive adoption and community contributions; paid subscription for power users (teachers, DJs, active annotators) who need full features.

**Proposed tiers:**

| Tier | Price | Includes | Target Segment |
|------|-------|----------|----------------|
| Free | $0 | Browse community catalog, listen to up to 10 songs/week with breakdown, read-only | Casual dancers, trial users |
| Pro | $8/mo or $79/yr | Unlimited catalog access, full annotation tools, add songs, save playlists, contribute to catalog, no ads | Teachers, DJs, active dancers |
| (Future: Schools) | Custom | Bulk accounts, admin dashboard, white-label option | Dance schools, festivals |

**Pricing rationale:** $8/mo aligns with niche dance/music tools (Chordify ~$5/mo, Steezy ~$20/mo) and is low enough for individual dancers. Annual discount encourages commitment. Free tier reduces friction and grows the catalog through community contributions.

### Cost Structure

- **Fixed costs:** Hosting (Vercel/Railway/Fly.io ~$20–50/mo), domain (~$15/yr), email (ConvertKit free tier or ~$30/mo), payment processing (Stripe)
- **Variable costs:** Spotify API (free tier sufficient for v1; Extended Queries if needed), compute per playback session, Stripe fees (~2.9% + $0.30 per transaction)
- **Customer acquisition cost (CAC) estimate:** $15–40 per paying customer — organic (content, community) plus light paid (Instagram/Facebook ads to bachata groups)
- **Gross margin estimate:** Target >75% — low variable cost per user; main cost is CAC and infrastructure

### Unit Economics (Summary)

| Metric | Estimate | Notes |
|--------|----------|-------|
| Average Revenue Per User (ARPU) | $6–7/mo | Mix of monthly and annual; annual dilutes to ~$6.50/mo |
| Customer Acquisition Cost (CAC) | $25 | Based on organic + light paid; improves with referrals |
| Lifetime Value (LTV) | $78–150 | Assumes 12–24 month avg lifetime at $6.50/mo; churn 5–8%/mo early |
| LTV:CAC Ratio | 3:1–6:1 | Target >3:1 for healthy SaaS |
| Payback Period | 4–6 months | Time to recover CAC |

---

## Go-to-Market

### Pre-Build Marketing (Do This First)

#### Social Accounts to Create

**Instagram:** Handle @bachatabeat, bio with CTA, link in bio to waitlist, first 3–5 posts (problem hook, behind-the-scenes, social proof, value tip, waitlist CTA).

**Reddit:** r/bachata, r/Salsa, r/Dance. Value-first strategy; share waitlist when relevant.

**X (Twitter):** Handle @bachatabeat, bio, pinned tweet, first 3–5 tweets (problem awareness, building in public, insight, waitlist CTA, engagement question).

#### Waitlist CTA

- **One clear CTA:** "Join the waitlist" / "Get early access"
- **Landing page URL:** Same everywhere — bachatabeat.com or getbachatabeat.com

#### SEO Before Implementation

- **Primary keyword:** "bachata song structure"
- **Landing page:** Title, meta description, H1 optimized
- **Content hooks:** 1 blog post ("How to Learn Bachata Song Structure"), 1 Reddit/Quora answer

### Marketing Plan

**Primary channels:** Community/partnerships, Content/SEO, Social (Instagram, Reddit).

**Tactics:** Post in bachata groups, DM teachers/DJs, concierge validation, 1 blog post every 2 weeks, 3–5 Instagram posts/week.

### Sales Strategy

- **Approach:** PLG + community. Free catalog drives sign-ups; conversion when users hit limits.
- **Pre-build:** Paid waitlist or concierge breakdowns.
- **Post-launch:** Early-bird pricing, onboard teachers/DJs first, in-app prompts for free users.
- **Partnerships:** Festivals, dance schools, YouTube bachata channels.

---

## SWOT Analysis

### Strengths

- Bachata-native positioning; only product with dancer language + playback
- Community-built catalog with network effects
- No direct competitor; first-mover advantage
- Clear user segments (dancers, teachers, DJs)
- Freemium reduces friction

### Weaknesses

- Solo founder; limited capacity
- Music API dependency
- Manual-only in v1; time-consuming annotation
- Niche market
- Cold start; empty catalog at launch

### Opportunities

- Bachata growth (festivals, social, online education)
- Competitor gaps (Chordify/YouTube ignore dance)
- Expand to salsa, kizomba
- AI-assisted breakdown (roadmap)
- Partnership channel (festivals, schools)

### Threats

- Large music platforms could add features
- Free alternatives (YouTube, spreadsheets)
- Catalog quality risk (open contribution)
- Licensing/ToS
- Execution risk (solo founder)

---

## Action Plan

### Next Steps

See [action-plan.md](action-plan.md) for the full task table.

**Phase 1 — Validation (Weeks 1–2):** Conduct 5–10 interviews, set up landing page + waitlist, summarize feedback.

**Phase 2 — Marketing Foundations (Weeks 2–4):** Register domain, create social accounts, launch pre-sell, publish SEO content, drive traffic.

**Phase 3 — Build MVP (Weeks 5–8):** Spotify integration, playback, annotation UI, database, catalog. Only if validation passes.

**Phase 4 — Launch and Iterate (Weeks 9–12):** Beta launch, collect feedback, convert waitlist to paid.

### Milestones

| Milestone | Target Date | Success Criteria |
|-----------|-------------|-------------------|
| Validation complete | Week 2–3 | 5–10 interviews, >70% problem confirmation |
| Waitlist live | Week 2 End | 50+ sign-ups (target 100 by Week 4) |
| First pre-sale | Week 3–4 | 1+ paid waitlist or concierge sale |
| Marketing foundations | Week 4 End | Social accounts, 1 content piece, traffic |
| MVP beta | Week 8 End | Core features, 10–20 beta users |
| First paying customer | Week 10–12 | 1+ converted from waitlist |

### Resources Needed

**Tools:** Carrd/Typedream (landing), ConvertKit (email), Namecheap (domain), Gumroad/Stripe (payments), Vercel/Railway (hosting), Spotify Developer account.

**Skills:** Customer interviewing, landing page setup, content writing, full-stack development.

**Budget (pre-revenue, 3 months):** ~$65–265 (bootstrappable).

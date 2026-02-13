# Business Model

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
|--------|----------|------|
| Average Revenue Per User (ARPU) | $6–7/mo | Mix of monthly and annual; annual dilutes to ~$6.50/mo |
| Customer Acquisition Cost (CAC) | $25 | Based on organic + light paid; improves with referrals |
| Lifetime Value (LTV) | $78–150 | Assumes 12–24 month avg lifetime at $6.50/mo; churn 5–8%/mo early |
| LTV:CAC Ratio | 3:1–6:1 | Target >3:1 for healthy SaaS |
| Payback Period | 4–6 months | Time to recover CAC |

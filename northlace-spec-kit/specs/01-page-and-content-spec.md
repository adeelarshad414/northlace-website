# Northlace website — page-by-page layout and content spec

Each page below lists: purpose, layout sections in order, the
technical-audience content layer, the non-technical-audience content
layer, and the primary call to action. Build agents must implement every
named section — no silent omission, no merging sections to save time.

Acronym rule: every acronym (SRE, CI/CD, IaC, FinOps, etc.) must be spelled
out in full on first appearance on each page, then the acronym may be
used afterward on that same page.

---

## Home (`/`)

**Purpose:** Establish credibility fast, route technical and non-technical
visitors to proof, and capture intent (discovery call or explore services).

1. **Header** — logo, nav (Services, Case studies, About, Careers, Blog),
   "Book a discovery call" button (accent-filled, the one allowed primary
   CTA on the page per design system restraint rule).
2. **Hero**
   - H1: "Every cloud. One standard."
   - Subhead: "Northlace runs the cloud, DevOps, and security operations
     behind growing companies — so engineering teams ship, and leadership
     teams sleep."
   - Primary CTA: "Book a discovery call" → `/contact`
   - Secondary CTA (ghost button): "See how we work" → `/case-studies`
   - No hero image required; if used, must be an abstract
     illustration consistent with the globe/meridian mark — never a stock
     photo of generic "people pointing at a laptop."
3. **Trust strip** — logos/labels of cloud platforms supported (AWS,
   Azure, GCP) and certification badges (Kubernetes ecosystem,
   cloud-vendor partner tiers) presented as plain badges, not claims of
   specific client names unless real client logos with permission exist.
   `TODO-COPY`: replace with actual certification/partner badges once
   confirmed.
4. **Split value section — two audiences, same row**
   - Left column (technical): heading "Built by engineers who've run
     it at scale," 3 bullet points referencing concrete technical depth
     (multi-cloud architecture, Kubernetes operations, security and
     compliance tooling, observability stacks) — no fluff adjectives.
   - Right column (non-technical): heading "Less downtime. Lower cloud
     bills. Fewer 3am calls," 3 bullet points in outcome language
     (uptime, cost reduction, incident reduction) with no acronyms.
5. **Four service pillars grid** (2x2 on desktop, stacked on mobile) —
   Northlace Run, Shield, Ledger, Shift. Each card: icon, name, one-line
   description, "Learn more" link to its `/services/[slug]` page.
6. **Featured case studies** — 3 cards pulled from the case-studies
   content collection (`featured: true` flag), each with: client industry
   (not necessarily named client, if anonymized), one outcome metric,
   link to detail page.
7. **How we work strip** — short 4-step process band: Assess → Design →
   Implement → Operate. Plain text steps, no jargon, this is for the
   non-technical reader primarily.
8. **CTA banner** — repeat primary CTA before footer: "Ready to stop
   firefighting your infrastructure?" → `/contact`.
9. **Footer** — sitemap links, social links, legal links (privacy,
   terms), copyright, "Open source — view this site's source" link to
   the public repo.

---

## Services overview (`/services`)

1. Header (shared)
2. Page intro: H1 "Services," one paragraph explaining the four-pillar
   model in plain language before naming the pillars.
3. Four pillar sections, each with: name, one-paragraph description,
   a bullet list of what's included (using real DevOps/SRE/Security/
   FinOps/IaC/CI-CD/Observability/Migration/Modernization/AI-native
   terminology — but each acronym spelled out on first use on this page),
   and a "See [pillar] in detail" link.
4. CTA banner → `/contact`
5. Footer (shared)

## Service pillar detail (`/services/run`, `/services/shield`,
`/services/ledger`, `/services/shift`)

Each of the four pages shares this structure (content differs per pillar):

1. Header (shared)
2. Hero: pillar name, one-sentence value statement (technical-credible
   but jargon-light), breadcrumb back to `/services`.
3. "What this covers" — bullet list of concrete capabilities. Example
   for Run: continuous integration and continuous delivery (CI/CD)
   pipeline design, infrastructure as code (IaC), site reliability
   engineering (SRE) practices, observability and incident response.
4. "Why it matters" — 2-3 sentences in outcome language for the
   non-technical reader.
5. Related case study callout — 1-2 case studies tagged with this
   pillar, pulled from the content collection by tag, not hardcoded.
6. CTA banner → `/contact`
7. Footer (shared)

---

## Case studies index (`/case-studies`)

1. Header (shared)
2. Intro: H1 "Case studies," one paragraph.
3. Filter control (client-side, no page reload) by service pillar tag.
4. Grid of case study cards: client/industry label, one headline metric,
   pillar tag badges, link to detail.
5. Footer (shared)

## Case study detail (`/case-studies/[slug]`)

Content-collection driven. Schema (see `specs/04-content-schemas.md`)
requires: client/industry label, challenge, approach, outcome metrics
(at least one quantified), pillar tags, optional architecture diagram
image, optional anonymization note if client name withheld.

1. Header (shared)
2. Hero: client/industry name, one-line outcome headline, pillar tags.
3. **Challenge** section — plain language, written for both audiences,
   acronyms spelled out on first use.
4. **Approach** section — can go technical here (architecture decisions,
   specific services/tools used) since this is where the technical
   reader looks for proof.
5. **Outcome** section — quantified metrics presented as stat cards
   (e.g. "40% reduction in deployment time," "99.95% uptime achieved").
   Every number must be a real or clearly placeholder-flagged
   (`TODO-METRIC`) figure — never a fabricated stat presented as real.
6. Optional architecture diagram (static image or inline SVG).
7. CTA banner → `/contact`, contextual copy: "Facing a similar
   challenge? Let's talk."
8. Footer (shared)

---

## About (`/about`)

1. Header (shared)
2. Mission statement — H1 + one paragraph, ties back to "Every cloud.
   One standard." without repeating it verbatim.
3. "How we work" — expands the 4-step process band from home with more
   detail per step.
4. Leadership/team section — `TODO-COPY`: structure only for now (name,
   role, one-line bio, photo placeholder), do not invent biographical
   claims about real people.
5. Values list (3-5 values, each with a one-sentence explanation) —
   must be genuine operating principles, not generic corporate filler
   ("integrity, excellence, innovation" with no substance is explicitly
   disallowed; write values that imply a specific behavior, e.g.
   "we page ourselves before we page you").
6. CTA banner → `/careers` ("We're hiring") and → `/contact`.
7. Footer (shared)

---

## Careers index (`/careers`)

1. Header (shared)
2. H1 "Careers," intro paragraph — "life at Northlace" framing, written
   for a global candidate audience (no single-country employment
   assumptions in copy; specific employment-location details belong in
   each role's own posting, not in this shared intro).
3. "Why Northlace" — 3-4 points (real engineering culture points, not
   generic perks-only language) — at least one point must address how
   the company supports skill growth/certification, consistent with the
   brand's credential-driven identity.
4. Open roles list — pulled from the `careers` content collection,
   filterable by department/location-type (remote/hybrid/onsite) and
   department (Cloud/DevOps, Security, SRE, Platform, etc).
5. Empty state if zero open roles: "No open roles right now. Send us
   your resume anyway." with a mailto or contact-form link — never an
   apology-toned empty state per content voice guidelines.
6. Footer (shared)

## Role detail (`/careers/[slug]`)

1. Header (shared)
2. Role title, department, location-type badge, employment type.
3. About the role — responsibilities.
4. Requirements — split into "must have" and "nice to have."
5. Apply CTA — form (name, email, resume/file upload or link field,
   cover note) posting to the same serverless forms backend as contact.
6. Footer (shared)

---

## Blog index (`/blog`) and post detail (`/blog/[slug]`)

Content-collection driven (`blog` collection). Index: paginated list,
tag filter. Post detail: standard article layout, author byline,
publish date in unambiguous format, reading-time estimate, related-posts
section (same tag).

`TODO-COPY`: no blog posts ship as placeholder lorem ipsum. Either seed
with 1-2 real posts at launch or ship the index with a genuine empty
state ("Nothing published yet — check back soon") rather than fake
content.

---

## Contact (`/contact`)

1. Header (shared)
2. H1 "Let's talk," one short paragraph.
3. Form: name, email (validated format), company, role/title (optional),
   message, and a "What are you looking for?" select (Discovery call /
   General inquiry / Partnership / Press). Submits to serverless
   function; on success show inline confirmation (no page reload
   required); on failure show retry message plus a direct email
   fallback address per Section 7 of the product spec.
4. Company info — general inquiries email, response-time expectation
   ("we reply within 1-2 business days," not a specific timezone-bound
   promise given the global audience).
5. Footer (shared)

---

## 404 (`/404`)

Plain, on-brand. No jokey copy that undermines an enterprise-trust tone.
"This page doesn't exist." + search/nav links back to home and
services. No generic "ghost" or "404 cat" type stock illustration.

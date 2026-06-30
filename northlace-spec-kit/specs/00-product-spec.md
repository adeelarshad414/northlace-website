# Northlace website — product spec

Status: draft v1
Owner: Adeel Arshad
Purpose: Public marketing, careers, and case-study website for Northlace — an
enterprise DevOps/Cloud/SRE/Security/FinOps/AI-native delivery company.
This site is itself a credibility artifact: it is open source and will be
read by prospective enterprise clients and engineering candidates as a proxy
for Northlace's own engineering standards. Build quality, performance, and
test discipline are part of the product, not incidental to it.

## 1. Goals

1. Convert enterprise visitors (technical and non-technical buyers) into
   discovery-call leads.
2. Convert engineering candidates into job applicants.
3. Demonstrate Northlace's own engineering rigor through the build quality
   of the site itself (open source repo, CI green, tests passing, fast,
   accessible).
4. Read credibly to a global audience — no region-specific assumptions in
   copy, imagery, currency, or timezone handling.

## 2. Non-goals (v1)

- No client portal / authenticated area.
- No e-commerce or paid checkout.
- No CMS admin UI — content is authored as Markdown/MDX in the repo via PRs.
- No multi-language i18n in v1 (English only; structure should not preclude
  adding it later — see Section 9).

## 3. Audience

Two primary personas, addressed on every page that makes a claim:

- **Technical buyer / engineering leader** (VP Eng, Head of Platform, SRE
  lead): wants proof of depth — certifications, architecture decisions,
  specific tool/stack mentions, case study technical detail.
- **Non-technical buyer / business stakeholder** (CFO, COO, founder): wants
  outcomes in plain language — uptime, cost savings, risk reduction, time
  to delivery. Allergic to unexplained acronyms.

Tertiary persona: **candidate** evaluating Northlace as an employer via the
careers section.

## 4. Brand inputs (already decided — do not re-derive)

- Name: Northlace
- Tagline (primary): "Every cloud. One standard."
- Color tokens: deep teal `#04342C` (primary), mid teal `#0F6E56` (accent),
  signal teal `#5DCAA5` (highlight), amber `#BA7517` (status/alert utility
  only — never in core brand chrome), warm white `#F1EFE8` (background).
- Service pillars (used as the IA backbone for the Services section):
  - **Northlace Run** — DevOps, SRE, CI/CD, observability
  - **Northlace Shield** — Security, compliance, IaC governance
  - **Northlace Ledger** — FinOps, cloud cost optimization
  - **Northlace Shift** — Migrations, modernization, AI-native workflow adoption
- Logo: globe-with-meridians mark (works as standalone favicon/icon).

These are inputs to the build, not open questions. Do not invent a new
naming system or color palette during implementation.

## 5. Information architecture (sitemap)

```
/                       Home
/services               Services overview
/services/run           Northlace Run detail
/services/shield        Northlace Shield detail
/services/ledger        Northlace Ledger detail
/services/shift         Northlace Shift detail
/case-studies           Case studies index
/case-studies/[slug]    Case study detail (dynamic, content-collection driven)
/about                  Company, mission, leadership
/careers                Careers index ("life at Northlace" + open roles list)
/careers/[slug]         Role detail + apply CTA (dynamic)
/blog                   Blog index
/blog/[slug]            Blog post detail (dynamic)
/contact                Contact form + company info
/404                    Not found
```

Shared chrome: header nav, footer, a persistent but unobtrusive
"Book a discovery call" CTA pattern, consistent SEO/OG meta per page.

## 6. Tech stack (decided)

- **Framework:** Astro (static-first, islands for interactivity)
- **Styling:** Tailwind CSS, mapped to the brand tokens in Section 4
  (no ad hoc hex values in components — see `specs/03-design-tokens.md`)
- **Content:** Astro content collections (Markdown/MDX) for case studies,
  blog posts, and job postings — each with a typed Zod schema
- **Forms:** Contact and apply forms post to a serverless function
  (target: Cloudflare Pages Functions) — no client-side-only form that
  silently drops data
- **Testing:** Vitest (unit/component logic), Playwright (e2e critical
  paths), axe-core (accessibility), Lighthouse CI (performance budget)
- **Hosting:** Cloudflare Pages
- **CI:** GitHub Actions — lint, typecheck, unit tests, e2e tests, a11y
  scan, Lighthouse budget check, all required to pass before merge

## 7. Non-functional requirements

- Lighthouse: Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95,
  SEO ≥ 95 on `/`, `/services`, and one case study detail page.
- WCAG 2.1 AA minimum across all pages.
- No layout shift from web fonts (use `font-display: swap` + size-adjust
  or local fallback metrics).
- Works with JavaScript disabled for all read-only content (Astro
  static-first default) — only the contact/apply forms and any optional
  interactive ROI calculator require JS, and must degrade to a clear
  "email us at [address]" fallback if JS fails.
- All copy must pass a "no unexplained acronym" check on first use per
  page (spell out on first use, e.g. "Site Reliability Engineering (SRE)").
- No region-specific defaults: no currency symbols other than USD unless
  explicitly labeled, no single timezone assumed, date format
  unambiguous (e.g. "12 Mar 2026", never "03/12/2026").

## 8. Definition of done (applies to every page/component)

A page or component is NOT done until:
1. Content matches the approved copy in `specs/02-content-spec.md` (or
   placeholder marked `TODO-COPY` is replaced with real content — no
   lorem ipsum ships to main).
2. Unit tests exist for any non-trivial logic (form validation, content
   collection schema, pricing/ROI calculators if added later).
3. An e2e test exists covering the page's primary user action (e.g.
   home → click primary CTA → contact form → submit).
4. Axe-core reports zero critical/serious violations.
5. Lighthouse budget (Section 7) is met.
6. Page is reviewed against `specs/03-design-tokens.md` — no raw hex,
   no off-brand spacing/type values.
7. Responsive at 360px, 768px, 1024px, 1440px — no horizontal scroll,
   no overlapping text.

## 9. Future-proofing (not built now, but don't block it)

- i18n: content collections should key by slug, not assume English-only
  filenames, so locale folders can be added later without restructuring.
- Client portal: keep auth-free now, but don't hardcode "no auth" in a
  way that requires a rewrite (e.g. don't bake business logic into
  static pages that would later need to be gated).

# Northlace website — task breakdown (phase-gated)

Each phase is a gate: the agent must not begin phase N+1 until every
task in phase N is complete and its acceptance check passes. Report
status at the end of each phase before proceeding. No task is "done" by
writing code that compiles — it is done when its stated acceptance
check passes via an actual test run.

---

## Phase 0 — Project scaffold and tooling

- [ ] 0.1 Initialize Astro project with TypeScript (strict mode on).
- [ ] 0.2 Add Tailwind CSS, wire `tailwind.config` to the tokens in
      `specs/02-design-tokens.md` exactly (color names, type scale,
      spacing). No default Tailwind palette colors used in components
      afterward.
- [ ] 0.3 Add Vitest, configure for unit/component tests.
- [ ] 0.4 Add Playwright, configure for e2e tests, install browsers.
- [ ] 0.5 Add `@axe-core/playwright` for accessibility assertions.
- [ ] 0.6 Add ESLint + Prettier with a config that fails CI on lint
      errors (not just warnings).
- [ ] 0.7 Add Lighthouse CI config with budgets from
      `specs/00-product-spec.md` Section 7.
- [ ] 0.8 Set up GitHub Actions workflow: install → lint → typecheck →
      unit test → build → e2e test → a11y scan → Lighthouse CI. All
      steps required, no `continue-on-error`.
- [ ] 0.9 Write root `README.md` explaining the project, stack, how to
      run locally, how to run the full test suite, and link back to
      this spec kit.

**Acceptance check:** `npm run build` succeeds, CI workflow file is
valid YAML and runs (even if trivially, on an empty scaffold) on a test
push/PR.

---

## Phase 1 — Design tokens and shared chrome

- [ ] 1.1 Implement Tailwind theme extension from
      `specs/02-design-tokens.md` (colors, type scale, spacing).
- [ ] 1.2 Build the logo mark as a reusable SVG component (accepts a
      `variant: "dark" | "light"` prop per the design tokens spec).
- [ ] 1.3 Build `Header` component: logo, nav links, primary CTA button,
      mobile menu (hamburger, accessible — keyboard-operable, traps
      focus correctly when open, closes on Escape).
- [ ] 1.4 Build `Footer` component: sitemap links, social links, legal
      links, open-source repo link, copyright with dynamic year.
- [ ] 1.5 Build `CTABanner` component: configurable heading + button
      text/href, used across multiple pages per content spec.
- [ ] 1.6 Build base `Layout.astro` wiring Header, Footer, SEO/OG meta
      tag injection (title, description, canonical URL, OG image).

**Acceptance check (write tests first, then implement):**
- Unit/component test: mobile menu opens, traps focus, closes on
  Escape and on outside click.
- Unit test: `Layout` renders correct `<title>` and meta description
  from passed props, for at least 2 different prop sets.
- Axe scan on a minimal page using `Layout` + `Header` + `Footer`
  reports zero critical/serious violations.

---

## Phase 2 — Content collections and schemas

- [ ] 2.1 Implement `src/content/config.ts` with all three schemas from
      `specs/03-content-schemas.md` (case-studies, careers, blog).
- [ ] 2.2 Write schema validation tests (valid fixture passes, invalid
      fixture per required field is rejected) for all three collections.
- [ ] 2.3 Implement the reading-time pure function for blog posts with
      unit tests (including 0-word edge case).
- [ ] 2.4 Implement the metric-placeholder lint check (rejects fabricated
      `/X{2,}/`-style or "TBD" metric values in non-draft case studies)
      as a script runnable in CI, with a unit test proving it both
      catches a bad fixture and passes a good one.
- [ ] 2.5 Author 2-3 real (or explicitly `draft: true`) case study
      entries, 1-2 real job postings, and either 1-2 real blog posts or
      ship blog with a genuine empty state per content spec.

**Acceptance check:** `npm run test` covers all of 2.1-2.4 and passes.
No collection entry uses `TODO-COPY` or fabricated metrics outside of
explicitly `draft: true` content.

---

## Phase 3 — Static pages (Home, Services, About, Contact, 404)

Build each page per its section breakdown in
`specs/01-page-and-content-spec.md`. For each page:

- [ ] 3.1 Home (`/`)
- [ ] 3.2 Services overview (`/services`)
- [ ] 3.3 Four service pillar detail pages (`/services/run`, `/shield`,
      `/ledger`, `/shift`)
- [ ] 3.4 About (`/about`)
- [ ] 3.5 Contact (`/contact`) — including the form component and its
      serverless submit handler (see Phase 5)
- [ ] 3.6 404 page

**Acceptance check per page, before moving to the next:**
- Every named section from the content spec is present (no silent
  omission) — verify by diffing rendered section headings against the
  spec's section list.
- Responsive check at 360/768/1024/1440px — no horizontal scroll, no
  overlapping text (Playwright viewport tests).
- Axe scan: zero critical/serious violations.
- Lighthouse budget met on Home at minimum (full budget check happens
  again in Phase 6, but Home must already be close to budget here —
  don't defer performance to the end).

---

## Phase 4 — Dynamic, content-collection-driven pages

- [ ] 4.1 Case studies index (`/case-studies`) with client-side pillar
      filter (no full page reload).
- [ ] 4.2 Case study detail (`/case-studies/[slug]`) — generated from
      collection, including stat cards for outcome metrics.
- [ ] 4.3 Careers index (`/careers`) with department/location-type
      filter and correct empty-state handling.
- [ ] 4.4 Role detail (`/careers/[slug]`) including closed-role banner
      logic for past `closesDate`.
- [ ] 4.5 Blog index (`/blog`) with tag filter and pagination.
- [ ] 4.6 Blog post detail (`/blog/[slug]`) with reading time, related
      posts by tag.

**Acceptance check:**
- Unit test: filter logic (pillar filter, department/location filter,
  tag filter) returns correct subsets for known fixture data, including
  an empty-result case.
- Unit test: closed-role banner renders when `closesDate` is in the
  past, does not render when absent or in the future.
- e2e test: from case studies index, apply a filter, click through to
  a detail page, verify correct content renders.
- Axe scan on one index and one detail page per collection type.

---

## Phase 5 — Forms and serverless backend

- [ ] 5.1 Implement Cloudflare Pages Function (or equivalent serverless
      endpoint) for contact form submission — validates server-side
      (not just client-side), returns structured success/error JSON.
- [ ] 5.2 Implement the same backend pattern for the careers apply form
      (name, email, resume link/upload, cover note).
- [ ] 5.3 Client-side form components: inline validation (email format,
      required fields), accessible error messaging (associated via
      `aria-describedby`, not color-only), success confirmation without
      full page reload, and a no-JS fallback (plain mailto link or
      server-rendered form action) per Section 7 of the product spec.
- [ ] 5.4 Decide and document the actual delivery mechanism for
      submitted form data (e.g. email via a transactional provider, or
      write to a lightweight store) — do not ship a form that silently
      discards submissions. This must be explicit, not assumed.

**Acceptance check:**
- Unit test: server-side validation rejects malformed email, missing
  required fields, with structured error responses.
- e2e test: fill and submit contact form successfully → see
  confirmation; submit with invalid email → see inline error, no
  submission sent.
- e2e test (JS disabled via Playwright context option): form still
  reaches a usable fallback (mailto or working non-JS submit).

---

## Phase 6 — Full QA gate (pre-launch)

- [ ] 6.1 Full Lighthouse CI run across all required pages
      (Home, Services, one case study detail) meeting Section 7 budgets.
- [ ] 6.2 Full axe-core scan across every route in the sitemap — zero
      critical/serious violations anywhere, not just sampled pages.
- [ ] 6.3 Full e2e regression suite covering every primary CTA path:
      home → contact, home → case study → contact, careers → role →
      apply, blog index → post.
- [ ] 6.4 Manual content review pass: confirm zero `TODO-COPY`,
      `TODO-METRIC`, or lorem ipsum strings exist anywhere in the
      production build output (grep check, can be scripted and run in
      CI as a final gate).
- [ ] 6.5 Verify acronym-spelled-out-on-first-use rule (Section 7) by
      spot-checking each page against the content spec.
- [ ] 6.6 Confirm open-source repo hygiene: LICENSE file present,
      CONTRIBUTING.md present, no secrets committed (run a secret-scan
      tool as part of this gate), README accurate.

**Acceptance check:** all of the above pass with zero open items before
this is considered launch-ready. This phase is the final gate — do not
mark the project done with any item in 6.1-6.6 outstanding.

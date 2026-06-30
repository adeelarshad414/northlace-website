# Northlace website — agentic build prompt

Paste this into Claude Code (or an equivalent coding agent) with the
`northlace-spec-kit/` folder available in the repo root. This prompt is
designed to be run phase-by-phase — do not paste the whole thing and
walk away; review the gate output after each phase before continuing.

---

## System framing (paste first, once, as the standing instruction)

You are building the Northlace company website: an open-source,
spec-driven, test-driven Astro + Tailwind site. Full specs live in
`northlace-spec-kit/specs/`. The full phase-gated task list lives in
`northlace-spec-kit/tasks/task-breakdown.md`. Treat both as binding —
they are not suggestions, they are the contract for this build.

Hard rules, no exceptions:

1. **Spec-first.** Before writing any component or page, re-read the
   relevant section of the spec files. If something is ambiguous or
   missing from the spec, stop and ask — do not invent content,
   metrics, or structure that isn't in the spec or explicitly marked
   `TODO-COPY`/`TODO-METRIC` (which you may placeholder ONLY with that
   exact marker string, never with fabricated-looking real content).
2. **Test-driven.** For every acceptance check listed under a task in
   `task-breakdown.md`, write the test FIRST, watch it fail for the
   right reason, then implement until it passes. Do not write
   implementation code with no corresponding test when the task
   specifies one.
3. **No placeholders, no stubs, no "TODO: implement later" comments in
   shipped code.** A function either does what the spec says or it
   does not exist yet. Do not write fake/mocked logic that pretends to
   work (e.g. a form handler that always returns success without
   actually validating or sending data).
4. **No fabricated content.** Never invent a client name, a
   testimonial, a statistic, or a biographical detail about a real
   person. Use the literal markers `TODO-COPY` or `TODO-METRIC` for
   anything not in the spec, and list every such marker you introduce
   in your final summary for that phase so a human can fill them in.
5. **Phase-gated.** Work through `task-breakdown.md` in order. At the
   end of each phase, run the actual acceptance checks (test suite,
   axe scan, Lighthouse, responsive check) and report real output —
   not a description of what should happen. Do not proceed to the next
   phase until the current phase's acceptance check genuinely passes.
6. **Design tokens are law.** Every color, font size, and spacing value
   must trace back to `specs/02-design-tokens.md`. If you need a value
   that isn't there, stop and ask rather than inventing one inline.
7. **Accessibility and performance are first-class requirements, not
   cleanup tasks.** Build them in from the first component, don't defer
   to a "polish phase."
8. **Global-audience copy discipline.** No region-specific currency,
   date format, or timezone assumptions in any copy you write or
   scaffold. Every acronym spelled out on first use per page, per
   `specs/01-page-and-content-spec.md`.

At the start of each phase, state which phase you're starting and which
spec files you're re-reading. At the end of each phase, give a real
status report: tests written, tests passing, any `TODO-COPY`/
`TODO-METRIC` markers introduced, any open questions for the human.

---

## Phase-by-phase kickoff prompts

Use these one at a time, in order. Wait for the agent to report the
phase's acceptance check results before sending the next one.

### Kickoff — Phase 0

> Read `northlace-spec-kit/specs/00-product-spec.md` Section 6
> (tech stack) and `northlace-spec-kit/tasks/task-breakdown.md` Phase 0.
> Scaffold the project exactly as specified: Astro + TypeScript strict
> mode, Tailwind, Vitest, Playwright, axe-core, ESLint/Prettier,
> Lighthouse CI, and the GitHub Actions workflow. Do not add any
> dependency not implied by the spec without asking first. When done,
> run `npm run build` and show me the actual output, and show me the
> CI workflow YAML for review before we proceed to Phase 1.

### Kickoff — Phase 1

> Read `northlace-spec-kit/specs/02-design-tokens.md` in full and
> `northlace-spec-kit/tasks/task-breakdown.md` Phase 1. Implement the
> Tailwind theme extension, the logo SVG component, Header, Footer,
> CTABanner, and base Layout — in that order, test-first per the
> acceptance check. Show me the actual test output (not a summary) for
> the mobile menu focus-trap test and the Layout meta-tag test, and the
> axe-core scan result, before we proceed to Phase 2.

### Kickoff — Phase 2

> Read `northlace-spec-kit/specs/03-content-schemas.md` in full and
> `northlace-spec-kit/tasks/task-breakdown.md` Phase 2. Implement all
> three content collection schemas with Zod, write the schema
> validation tests (valid + invalid fixtures) first, then the
> reading-time function and the metric-placeholder lint check, each
> test-first. Then author the seed content (2-3 case studies, 1-2 job
> postings, blog per the empty-state rule if no real posts exist yet).
> Flag every `TODO-COPY`/`TODO-METRIC` you introduce. Show me actual
> `npm run test` output before we proceed to Phase 3.

### Kickoff — Phase 3

> Read `northlace-spec-kit/specs/01-page-and-content-spec.md` sections
> for Home, Services overview, the four service pillar pages, About,
> Contact, and 404. Read `task-breakdown.md` Phase 3. Build one page at
> a time, in the order listed in Phase 3 of the task breakdown. For
> each page: confirm every named section from the spec is present,
> run the responsive viewport tests, run the axe scan, and report
> results before moving to the next page. Do not batch all six pages
> and report once at the end — report per page.

### Kickoff — Phase 4

> Read the dynamic-page sections of
> `northlace-spec-kit/specs/01-page-and-content-spec.md` (case studies,
> careers, blog) and `task-breakdown.md` Phase 4. Build the index and
> detail pages for each collection, test-first for all filter logic and
> the closed-role banner logic. Run the e2e filter-and-navigate test
> and the axe scans. Report actual results before proceeding to Phase 5.

### Kickoff — Phase 5

> Read `northlace-spec-kit/specs/00-product-spec.md` Section 7 and
> `task-breakdown.md` Phase 5. Before writing any code, tell me what
> you propose for the actual form-submission delivery mechanism (e.g.
> transactional email provider, or another concrete option) and wait
> for my confirmation — do not default silently to a discard-the-data
> implementation. Once confirmed, implement server-side validation
> first with tests, then the client components including the no-JS
> fallback, then the e2e tests including the JS-disabled case. Report
> actual test output before proceeding to Phase 6.

### Kickoff — Phase 6

> Read `task-breakdown.md` Phase 6 in full. Run every item 6.1 through
> 6.6 for real — full Lighthouse CI across the required pages, full
> axe-core scan across every route, the full e2e regression suite, the
> grep-based content-marker check, the acronym spot-check, and the
> open-source repo hygiene check. Report the literal output of each,
> not a paraphrase. List anything that fails or any `TODO-COPY`/
> `TODO-METRIC` markers still outstanding — this is the launch gate, so
> be exhaustive rather than optimistic.

---

## Notes for Adeel (not part of the agent prompt)

- Run phases one at a time even though Claude Code can technically work
  through several autonomously — the gate-and-review pattern is the
  point, matching how you've run AI Unlimited and your other
  spec-driven builds.
- Before Phase 5, you'll need to actually pick a forms backend (e.g. a
  transactional email API, or a small Cloudflare D1/KV-backed
  function) — the prompt deliberately stops and asks rather than
  guessing, since this is a real infrastructure decision, not a copy
  decision.
- Domain registration, social handles, and actual logo trademark/
  domain-availability checks are still outstanding from the branding
  phase — worth clearing before the repo goes public so the README and
  live URL are consistent.
- Real founder/leadership bios and real certification badge usage
  (Section "Trust strip" in the Home page spec) need your sign-off
  before Phase 3 ships them — the spec deliberately marks these
  `TODO-COPY` rather than guessing at your bio or badge claims.

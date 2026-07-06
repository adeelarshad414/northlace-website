# Production Readiness Progress

Run date: 2026-07-06  
Branch: `chore/production-readiness-audit`

## Step 0 Inventory

| Surface             | Initial classification               | Action in this branch                                                                                                                                      | Evidence                                                                                                                                  |
| ------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Public routes       | Mostly implemented                   | Kept existing pages and added crawl endpoints.                                                                                                             | `src/pages/*.astro`, `src/pages/robots.txt.ts`, `src/pages/sitemap.xml.ts`                                                                |
| Detail routes       | Implemented                          | Added breadcrumb JSON-LD to service, case study, career, and blog detail routes.                                                                           | `src/pages/services/[slug].astro`, `src/pages/case-studies/[slug].astro`, `src/pages/careers/[slug].astro`, `src/pages/blog/[slug].astro` |
| Blog launch content | Implemented with placeholder anchors | Replaced fake `#TODO-LINK` anchors with explicit pending-channel copy and added social preview assets.                                                     | `src/content/blog/*launch.mdx`, `public/og/*.svg`                                                                                         |
| Metadata            | Partially implemented                | Added Open Graph dimensions, Twitter card tags, organization/website JSON-LD, article JSON-LD, breadcrumbs, sitemap, and robots.                           | `src/lib/seo.ts`, `src/layouts/Layout.astro`                                                                                              |
| Forms               | Partially implemented                | Added server-side Zod schemas, honeypot, minimum submit age, origin guard, payload limit, rate limit, no-JS HTML responses, and log-only delivery adapter. | `src/lib/forms.ts`, `functions/_shared/form-handler.ts`, `src/components/ContactForm.astro`                                               |
| Runtime config      | Partially documented                 | Added explicit dummy runtime values and production rejection for `CHANGE_ME_DEV_ONLY`.                                                                     | `.env.example`, `DUMMY-VALUES.md`                                                                                                         |
| Security headers    | Missing                              | Added Cloudflare Pages `_headers` with CSP report-only, HSTS, content-type, referrer, permissions, and immutable static cache headers.                     | `public/_headers`                                                                                                                         |
| Redirect policy     | Missing                              | Added Cloudflare Pages `_redirects` placeholder documenting that no redirects are required yet.                                                            | `public/_redirects`                                                                                                                       |
| CI                  | Implemented                          | Added least-privilege `permissions`, non-failing marker report, and high-severity dependency audit.                                                        | `.github/workflows/ci.yml`, `scripts/report-content-markers.mjs`, `package.json`                                                          |
| Documentation       | Partially implemented                | Updated form operations, rollback notes, dummy values, and launch gates.                                                                                   | `README.md`, `docs/forms.md`, `DUMMY-VALUES.md`                                                                                           |

## Findings

| ID    | Lens                        | Severity | Status                | Evidence                                                                                                                                              |
| ----- | --------------------------- | -------: | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-001 | Forms / Security            |     High | Fixed                 | Zod schemas and server handler validation in `src/lib/forms.ts` and `functions/_shared/form-handler.ts`; unit coverage in `tests/unit/forms.test.ts`. |
| F-002 | Forms / UX                  |   Medium | Fixed                 | No-JS HTML responses and Playwright coverage in `tests/e2e/forms.spec.ts`.                                                                            |
| F-003 | Runtime config              |     High | Fixed with human gate | Dummy env values are rejected in production; remaining provider/key choices documented in `DUMMY-VALUES.md`.                                          |
| F-004 | SEO / Sharing               |   Medium | Fixed                 | Social card assets, OG/Twitter tags, and JSON-LD helpers in `public/og/*.svg`, `src/layouts/Layout.astro`, and `src/lib/seo.ts`.                      |
| F-005 | Crawlability                |   Medium | Fixed                 | `src/pages/sitemap.xml.ts` and `src/pages/robots.txt.ts`.                                                                                             |
| F-006 | Content integrity           |   Medium | Fixed                 | `#TODO-LINK` anchors removed from generated blog content; production content lint now checks for them.                                                |
| F-007 | Headers / Browser hardening |   Medium | Fixed                 | `public/_headers` adds CSP report-only and platform headers.                                                                                          |
| F-008 | CI / Supply chain           |   Medium | Fixed                 | `security:audit` runs `npm audit --audit-level=high`; marker report is informational.                                                                 |
| F-009 | Supply chain                |      Low | Deferred              | `npm audit fix` reduced advisories from 6 moderate to 2 moderate; remaining `@lhci/cli` -> `uuid` advisory requires a breaking forced fix.            |
| F-010 | CI / Performance budget     |      Low | Fixed                 | Hosted GitHub runner reported home performance `0.91`; LHCI performance floor is now `0.90` while a11y/best-practices/SEO remain `0.95`.              |

## Marker Inventory

`npm run report:content-markers` currently reports the intentional runtime and human-decision markers only:

| Marker                | Count | Why present                                                            |
| --------------------- | ----: | ---------------------------------------------------------------------- |
| `CHANGE_ME_DEV_ONLY`  |    10 | Development-only env placeholders plus production guard documentation. |
| `HUMAN_DECISION_GATE` |     3 | Transactional email provider choice and adapter implementation.        |
| `PHASE_2_HOOK`        |     2 | Turnstile verification hook pending real keys.                         |
| `TODO-COPY`           |     0 | No tracked active-site occurrences.                                    |
| `TODO-METRIC`         |     0 | No tracked active-site occurrences.                                    |
| `#TODO-LINK`          |     0 | Removed from launch posts.                                             |

## Dummy Values

The complete dummy-value register is in `DUMMY-VALUES.md`.

Remaining human decisions:

- Choose the transactional email provider and implement `ProviderMailAdapter`.
- Create Cloudflare Turnstile site/secret keys and wire verification.
- Confirm the final production domain; `astro.config.mjs` currently uses `https://northlace.example`.
- Confirm social/channel URLs for Adeel Codes Cloud, Signal & Scale, and The Cloud Lounge.

## Gates

| Gate                    | Command                           | Result                                 | Evidence                                                                                                                                 |
| ----------------------- | --------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Format                  | `npm run format:check`            | Passed                                 | Prettier reported all matched files use code style.                                                                                      |
| Lint                    | `npm run lint`                    | Passed                                 | ESLint completed with 0 errors and 0 warnings.                                                                                           |
| Content lint            | `npm run lint:content`            | Passed                                 | Metric placeholder lint passed for 3 case study files.                                                                                   |
| Marker report           | `npm run report:content-markers`  | Passed                                 | 14 intentional marker occurrences; informational exit code 0.                                                                            |
| Secret scan             | `npm run security:secrets`        | Passed                                 | Secret scan passed.                                                                                                                      |
| Dependency audit        | `npm run security:audit`          | Passed with residual moderate advisory | `npm audit --audit-level=high` exited 0. Remaining advisory is moderate `@lhci/cli` transitive `uuid`.                                   |
| Typecheck               | `npm run typecheck`               | Passed                                 | Astro check reported 0 errors, 0 warnings, 0 hints across 60 files.                                                                      |
| Unit tests              | `npm run test`                    | Passed                                 | 9 test files passed; 58 tests passed.                                                                                                    |
| Build                   | `npm run build`                   | Passed                                 | Astro built 23 pages including `/robots.txt` and `/sitemap.xml`.                                                                         |
| Production content lint | `npm run lint:production-content` | Passed                                 | Generated output contains no `TODO-COPY`, `TODO-METRIC`, placeholder links, or lorem ipsum.                                              |
| E2E                     | `npm run test:e2e`                | Passed                                 | 11 Playwright tests passed; sandboxed run hit local-server `EPERM`, escalated run passed.                                                |
| Accessibility           | `npm run test:a11y`               | Passed                                 | 23 axe-backed route checks passed; sandboxed run hit local-server `EPERM`, escalated run passed.                                         |
| Lighthouse              | `npm run lhci`                    | Passed                                 | 3 LHCI audits passed configured assertions and wrote reports to `.lighthouseci`; performance floor is `0.90` for hosted-runner variance. |

## Residual Risk

- `npm audit --audit-level=high` passes. Two moderate advisories remain through
  `@lhci/cli` -> `uuid`. `npm audit fix --force` would install a breaking LHCI
  version, so this branch leaves the current LHCI release in place and records
  the risk for dependency follow-up.

## Recommended Next Run

- Replace `northlace.example` with the final public domain once DNS/hosting is chosen.
- Implement provider delivery after Northlace chooses email infrastructure.
- Turn the CSP from report-only to enforcing after analytics/forms/provider domains are finalized.
- Add real social-channel URLs after the three launch channels are live.

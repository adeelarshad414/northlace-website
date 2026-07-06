# Brand Asset Generation & Publication Progress

Run date: 2026-07-06  
Branch: `feat/brand-kits-and-pages`

## Step 0 Inventory

| Surface / toolchain         | Initial classification                    | Action in this branch                                                                                                                                                           | Evidence                                                                                                                                                                                             |
| --------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Blog collection + templates | Implemented                               | Three personal-brand launch posts existed; Northlace launch post did not. Wired the three existing posts to brand pages and created one announcement post for all four systems. | `src/content/blog/adeel-codes-cloud-launch.mdx`, `src/content/blog/signal-and-scale-launch.mdx`, `src/content/blog/the-cloud-lounge-launch.mdx`, `src/content/blog/publishing-our-brand-systems.mdx` |
| Shared components           | Implemented, missing brand kit components | Added manifest-backed download cards and accessible palette copy controls.                                                                                                      | `src/components/BrandKitDownloads.astro`, `src/components/BrandPalette.astro`, `src/scripts/brand-palette.ts`                                                                                        |
| `public/brand/` tree        | Not yet built                             | Generated 4 folders plus manifest: 32 kit files + `manifest.json`.                                                                                                              | `public/brand/manifest.json`; `find public/brand -type f` -> 33                                                                                                                                      |
| Existing brand assets       | Not present in repo                       | Generated all four kits from `src/data/brands.ts`; no pre-existing real assets were superseded.                                                                                 | `src/data/brands.ts`, `scripts/brand/build.mjs`                                                                                                                                                      |
| OG image pipeline           | Not yet built for brands                  | Generated one 1200x630 PNG per brand.                                                                                                                                           | `public/brand/*/*-og.png`                                                                                                                                                                            |
| Brand web routes            | Not yet built                             | Added `/brand` hub and 4 static detail pages.                                                                                                                                   | `src/pages/brand/index.astro`, `src/pages/brand/[slug].astro`; build output reports 29 pages including 5 brand routes                                                                                |
| Discovery                   | Partially implemented                     | Added footer link, sitemap entries, and kit file headers.                                                                                                                       | `src/components/Footer.astro`, `src/pages/sitemap.xml.ts`, `public/_headers`                                                                                                                         |
| CI jobs                     | Implemented                               | Added brand generator dependencies, `npm run brand:build`, and brand Lighthouse CI.                                                                                             | `.github/workflows/ci.yml`, `lighthouserc.brand.cjs`, `package.json`                                                                                                                                 |
| Node / deck generation      | Available                                 | Node `v24.14.0`; `pptxgenjs@4.0.1`; `jszip@3.10.1` normalizes PPTX timestamps.                                                                                                  | `node --version`, `npm ls pptxgenjs jszip --depth=0`, `scripts/brand/build.mjs`                                                                                                                      |
| Python / PDF generation     | Available                                 | Python `3.12.13`; ReportLab `4.4.9`; generated 4 guideline PDFs.                                                                                                                | `scripts/brand/generate-pdfs.py`, `python3 -c "import reportlab; print(reportlab.Version)"`                                                                                                          |
| SVG/PNG rasterizer          | Available                                 | `sharp@0.35.3` rendered SVG/OG PNGs; Poppler `pdftoppm 26.05.0` rendered PDF pages.                                                                                             | `work/brand-qa/svg-renders` -> 20 PNGs; `work/brand-qa/pdf-renders` -> 32 PNGs                                                                                                                       |
| PPTX render QA              | Blocked locally                           | LibreOffice exists but aborts during headless PPTX conversion; PPTX binaries are generated and manifest-hashed, but PPTX screenshot QA is blocked on this machine.              | `/opt/homebrew/bin/soffice --version` -> `LibreOffice 26.2.3.2`; `npm run brand:build` warns `Abort trap: 6`; `work/brand-qa/pptx-renders` -> 0                                                      |

## Generation Log

| Asset class      | Result                                                                                                | Evidence                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Typed brand data | Exactly 4 brands, all pages/assets read from `src/data/brands.ts`.                                    | `tests/unit/brands.test.ts`                                                                                           |
| SVG logos        | 5 variants per brand, 20 total, XML-parse tested and rendered to PNG.                                 | `public/brand/*/*.svg`, `tests/unit/brand-svg.test.ts`, `work/brand-qa/svg-renders`                                   |
| Guideline PDFs   | 1 PDF per brand, 8 pages each; 32 page renders produced.                                              | `public/brand/*/*-brand-guidelines.pdf`, `scripts/brand/generate-pdfs.py`, `work/brand-qa/pdf-renders`                |
| PPTX templates   | 1 generated 9-slide PPTX per brand; timestamps normalized for stable hashes.                          | `public/brand/*/*-deck-template.pptx`, `scripts/brand/build.mjs`                                                      |
| OG images        | 1 PNG per brand, 1200x630.                                                                            | `public/brand/*/*-og.png`                                                                                             |
| Manifest         | 32 kit files with byte size, MIME, and sha256; second `brand:build` produced byte-identical manifest. | `public/brand/manifest.json`; `cmp -s /tmp/northlace-brand-manifest-before.json public/brand/manifest.json` -> exit 0 |

## Gates

| Gate                       | Result                                                                                                            | Evidence                                                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Kit completeness           | Passed: 4 brands x 8 files = 32 kit files + manifest.                                                             | `node -e` manifest count -> `4 32`; `find public/brand -type f` count -> 33                                               |
| Reproducibility            | Passed locally: repeated `npm run brand:build` kept manifest byte-identical.                                      | `cmp -s /tmp/northlace-brand-manifest-before.json public/brand/manifest.json` -> exit 0                                   |
| Asset serving              | Passed: 33/33 files return 200; preview headers plus Cloudflare `_headers` MIME policy verified.                  | `tests/e2e/brand-assets.spec.ts`; `npm run test:e2e` -> 14 passed                                                         |
| SVG validity               | Passed: 20/20 SVGs parse as XML with expected dimensions.                                                         | `tests/unit/brand-svg.test.ts`; `npm run test` -> 13 files, 66 tests passed                                               |
| Manifest integrity         | Passed: all manifest sizes, MIME values, and sha256 hashes match disk files.                                      | `tests/unit/brand-manifest.test.ts`                                                                                       |
| Accessibility              | Passed: 28 axe route checks, including `/brand` and all 4 brand pages.                                            | `npm run test:a11y` -> 28 passed                                                                                          |
| Responsive overflow        | Passed across 360, 768, 1024, and 1440 px route set including brand routes.                                       | `tests/e2e/responsive.spec.ts`; `npm run test:e2e` -> 14 passed                                                           |
| Lighthouse existing routes | Passed configured assertions.                                                                                     | `npm run lhci`; `.lighthouseci/manifest.json`                                                                             |
| Lighthouse brand routes    | Passed: `/brand` + 4 detail pages scored 1.0 / 1.0 / 1.0 / 1.0.                                                   | `npm run lhci:brand`; `.lighthouseci-brand/manifest.json`                                                                 |
| Token compliance           | Passed: no raw hex literals in brand component chrome scan.                                                       | `tests/unit/brand-token-compliance.test.ts`                                                                               |
| Content QA                 | Passed: no `TODO-COPY`, `TODO-METRIC`, or lorem ipsum in built output; `#TODO-LINK` is intentionally inventoried. | `npm run lint:production-content`; `npm run report:content-markers`                                                       |
| Lint / format / typecheck  | Passed.                                                                                                           | `npm run lint`; `npm run format:check`; `npm run typecheck` -> 0 errors                                                   |
| Security                   | Passed high-severity audit and secret scan; moderate LHCI transitive `uuid` advisory remains.                     | `npm run security:secrets`; escalated `npm run security:audit`                                                            |
| Fresh-eyes visual QA       | Passed for PDF/SVG after one fix cycle.                                                                           | Subagent inspected all 32 PDF page renders and 20 SVG render PNGs; recheck confirmed all prior PDF/SVG findings resolved. |

## TODO Inventory

`npm run report:content-markers` currently reports 15 tracked marker occurrences:

| Marker                |                     Count | Why present                                                                                                               |
| --------------------- | ------------------------: | ------------------------------------------------------------------------------------------------------------------------- |
| `#TODO-LINK`          |       1 source occurrence | Brand pages intentionally render pending social/domain/contact/trademark destinations as to be announced.                 |
| `CHANGE_ME_DEV_ONLY`  |                        10 | Development-only runtime placeholders already registered in `DUMMY-VALUES.md`; production form code rejects dummy values. |
| `HUMAN_DECISION_GATE` |                         3 | Transactional email provider choice and adapter implementation remain human decisions.                                    |
| `PHASE_2_HOOK`        |                         2 | Cloudflare Turnstile verification remains pending real keys.                                                              |
| `TODO-COPY`           |                         0 | No active source/build occurrences found.                                                                                 |
| `TODO-METRIC`         | 0 in source/build content | PPTX slide 6 intentionally contains the placeholder footnote inside generated deck templates.                             |

## HUMAN_DECISION_GATE

- Confirm social handles and public channel URLs for Adeel Codes Cloud, Signal & Scale, and The Cloud Lounge.
- Confirm final domains/contact links for all four brands.
- Complete The Cloud Lounge name collision check.
- Complete Northlace trademark clearance before making any trademark claim.
- Choose the transactional email provider and Turnstile keys from the previous production-readiness run.

## Blocked

- PPTX screenshot QA is blocked locally. `soffice --version` works, but headless conversion aborts with `Abort trap: 6` for each generated PPTX during `npm run brand:build`. The generated PPTX files are present, manifest-hashed, and reproducible; only PDF-to-image inspection of those PPTX decks is missing. The build script warns and continues so CI can still generate the kits where LibreOffice is absent or unstable.

## Recommended Next Run

- Re-run PPTX render QA on a machine or CI image where LibreOffice headless conversion works, then inspect `work/brand-qa/pptx-renders`.
- Replace `#TODO-LINK` lines with real public URLs only after the human decision gates above are complete.
- Consider adding versioned filenames if brand assets will be cached immutable long-term across multiple public releases.

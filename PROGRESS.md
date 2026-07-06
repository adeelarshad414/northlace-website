# Northlace Sales Deck Rebrand & Publication Progress

Run date: 2026-07-06
Branch: `feat/sales-deck-rebrand`
Base dependency: `feat/brand-kits-and-pages`, because this run reads Northlace brand values and logo assets from that branch.

## Step 0 Inventory

| Surface / toolchain     | Initial classification                       | Action in this branch                                                                                                  | Evidence                                                                                                                   |
| ----------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Source deck             | Present outside repo                         | Added committed provenance copy.                                                                                       | `assets/source/application-modernization-cloud-devops-sales-deck.pdf`; `pdfinfo` -> 24 pages, 1280 x 720 pt                |
| Source text layer       | PDF text layer empty                         | Used the matching local PPTX only for extraction, while keeping the PDF as committed provenance.                       | `work/deck-qa/source-text.txt` contains page breaks only; source PPTX extraction produced slides 1-24                      |
| Source visual QA        | Generic light theme with multi-color accents | Rendered all 24 source slides and created contact sheet to identify colors, bars, stripes, and cramped rows to remove. | `work/deck-qa/source-renders`, `work/deck-qa/source-contact-sheet.png`                                                     |
| Content map             | Missing                                      | Added 24/24 source-to-target mapping and 16-slide target structure.                                                    | `docs/deck-content-map.md`                                                                                                 |
| Brand tokens            | Available from data layer                    | Deck generator imports `src/data/brands.ts` instead of duplicating core brand values by hand.                          | `scripts/deck/build-sales-deck.mjs`                                                                                        |
| PPTX generator          | `pptxgenjs` available                        | Added reproducible `npm run deck:build` script.                                                                        | `package.json`, `scripts/deck/build-sales-deck.mjs`                                                                        |
| PDF conversion          | LibreOffice available but sandbox-sensitive  | Conversion succeeds when the deck build runs outside the sandbox; CI installs LibreOffice explicitly.                  | `work/deck-qa/libreoffice-conversion.txt`, `.github/workflows/ci.yml`                                                      |
| Render QA               | Poppler available                            | Generated 16 final slide renders and contact sheet from the LibreOffice PDF.                                           | `work/deck-qa/final-renders`, `work/deck-qa/sales-deck-contact-sheet.png`                                                  |
| Brand manifest          | Existing brand-kit manifest                  | Added sales deck PPTX/PDF with bytes, MIME, and sha256.                                                                | `public/brand/manifest.json`                                                                                               |
| Resource page           | Missing                                      | Added `/resources/modernization-deck` with previews, 3S block, downloads, and JSON-LD.                                 | `src/pages/resources/modernization-deck.astro`                                                                             |
| Cross-links             | Missing                                      | Linked from `/services` and all four pillar pages.                                                                     | `src/pages/services/index.astro`, `src/pages/services/[slug].astro`                                                        |
| SEO / sitemap / headers | Partially implemented                        | Added OG PNG, sitemap entry, immutable preview headers, and Report/DigitalDocument JSON-LD.                            | `public/og/northlace-modernization-deck.png`, `src/pages/sitemap.xml.ts`, `public/_headers`                                |
| CI and gates            | Existing CI                                  | Added deck build, LibreOffice install, resource Lighthouse config, and new unit/e2e checks.                            | `.github/workflows/ci.yml`, `lighthouserc.resources.cjs`, `tests/unit/sales-deck-*.test.ts`, `tests/e2e/resources.spec.ts` |

## Content Map Summary

- Source slides mapped: 24/24.
- Target deck length: 16 slides.
- Preserved source content: executive proposition, market facts, service portfolio, standards/frameworks, 5-phase delivery path, deliverable packs, proof points, ROI model with “How to use this slide,” free-assessment offers, and recommended close.
- Reworked source defects: multi-color accent bars, colored edge stripes, rainbow stat colors, repeated service headers, cramped process rows, truncated headings, and mixed color semantics.
- Required open markers retained: `TODO-COPY`, `TODO-OFFER`, `TODO-PRICE`, `TODO-METRIC`, `HUMAN_DECISION_GATE`, and `#TODO-LINK`.

## QA Findings And Fixes

| Finding                                                                 | Fix                                                                                                                  | Evidence                                                                     |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Source PDF has no usable text layer.                                    | Used the matching local PPTX for extraction only and committed the source PDF for provenance.                        | `docs/deck-content-map.md` source inspection notes                           |
| Source deck used Google-style multi-color accent bars and edge stripes. | New deck uses Northlace Deep Teal, Warm White, Mid Teal, and Signal Teal; red/amber/green are not used decoratively. | `work/deck-qa/theme-and-offer-audit.json` -> `bannedSourceColorHits: []`     |
| Source process rows had tight number/text spacing.                      | Rebuilt the 5-phase path as stable stage blocks.                                                                     | Slide 9 render in `work/deck-qa/final-renders`                               |
| Pricing slide audit required exact phrase casing.                       | Updated slide 14 to include “quick wins found in the assessment routinely fund the pilot.”                           | `scripts/deck/build-sales-deck.mjs`; `tests/unit/sales-deck-outputs.test.ts` |
| Production content lint would scan binary deck files as text.           | Limited production copy scan to text-like extensions.                                                                | `scripts/check-production-content.mjs`                                       |

## Gate Table

| Gate                                  | Status                    | Evidence                                                                                              |
| ------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------- |
| Offer framework present               | Passed                    | `npm run test` -> 15 files, 71 tests passed; `tests/unit/sales-deck-outputs.test.ts` checks the PPTX  |
| Source fidelity 24/24 map             | Passed                    | `npm run test` -> `tests/unit/sales-deck-content-map.test.ts`                                         |
| Theme purity                          | Passed in build script    | `work/deck-qa/theme-and-offer-audit.json` -> no banned source colors                                  |
| No invented facts                     | Passed by marker strategy | Pricing, ICP, guarantees, and proof points remain explicitly marked for human confirmation            |
| Reproducibility                       | Passed                    | `npm run brand:build`, then approved `npm run deck:build`, regenerated PPTX/PDF/previews/manifest     |
| Serving 2/2 files                     | Passed                    | `npm run test:e2e` -> 15 passed; deck PPTX/PDF return 200 with MIME policy                            |
| Resource page axe                     | Passed                    | `npm run test:a11y` -> 29 passed, including `/resources/modernization-deck`                           |
| Resource page Lighthouse 95/95/95/100 | Passed                    | `npm run lhci:resources` -> 0.99 / 1.00 / 1.00 / 1.00                                                 |
| PR open and CI green                  | Passed                    | PR #3 opened: https://github.com/adeelarshad414/northlace-website/pull/3; CI `Verify` passed in 4m32s |

## TODO Inventory

| Marker                | Why present                                                              |
| --------------------- | ------------------------------------------------------------------------ |
| `TODO-COPY`           | ICP needs human tightening for spend band, team size, and sector.        |
| `TODO-OFFER`          | Guarantee terms are illustrative and require business approval.          |
| `TODO-PRICE`          | Pilot pricing and scope bands require confirmation.                      |
| `TODO-METRIC`         | Proof points need client-approved evidence before external distribution. |
| `#TODO-LINK`          | Final public contact link remains pending.                               |
| `HUMAN_DECISION_GATE` | Offer guarantee and gated-download decisions require human confirmation. |

## HUMAN_DECISION_GATE

- Confirm whether the illustrative guarantee on slide 6 should be offered, revised, or removed.
- Confirm pilot pricing, scope bands, and whether `$12K` remains the public entry example.
- Confirm ICP specificity: cloud spend band, team size, sector focus, geography, and buyer priority.
- Confirm whether downloads should remain ungated. Current implementation is ungated by default.
- Attach client-approved proof evidence before any external distribution using the representative case metrics.
- Replace `#TODO-LINK` with a real contact URL when the public destination is approved.

## Blocked

- LibreOffice PDF export aborts inside the sandbox on this macOS machine, but succeeds when the same `npm run deck:build` command is approved outside the sandbox. CI installs LibreOffice so the required PDF path remains part of the automated build.

## Recommended Next Run

- After this PR merges, confirm the human decision gates and run a copy-only pass that removes or resolves `TODO-*` and `HUMAN_DECISION_GATE` markers before client distribution.
- Add client-specific baselines and proof evidence to slide 12 and slide 13 for each sales opportunity.
- Decide whether the resource page should become gated after the first public review cycle.

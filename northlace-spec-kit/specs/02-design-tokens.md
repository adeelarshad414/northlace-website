# Northlace website — design tokens

This file is the single source of truth for visual values. Components
must reference these tokens (via Tailwind theme extension) — no raw hex
values, no arbitrary spacing/font-size values in component code. Any
value not listed here must be added to this file first, then used.

## Color tokens

| Token name         | Hex       | Usage                                          |
|---------------------|-----------|-------------------------------------------------|
| `northlace-900`      | `#04342C` | Primary brand color — header bg, footer bg, dark sections, primary button bg |
| `northlace-700`      | `#0F6E56` | Accent — links, secondary CTAs, active states  |
| `northlace-400`      | `#5DCAA5` | Highlight — badges, success-adjacent accents, hover states on dark bg |
| `northlace-100`      | `#9FE1CB` | Light tint — subtle backgrounds on dark sections |
| `northlace-50`       | `#E1F5EE` | Lightest tint — light-mode badge backgrounds   |
| `surface-warm`       | `#F1EFE8` | Page background (light mode) — never pure white |
| `status-amber`       | `#BA7517` | Utility only — alerts, status indicators on dashboards/case-study stat cards. Never in nav, hero, or core brand chrome. |
| `text-primary`       | `#1A1A18` | Body text on light backgrounds |
| `text-on-dark`       | `#F1EFE8` | Body text on `northlace-900` backgrounds |

Dark mode: if/when implemented, map `surface-warm` → a dark neutral
(not pure black) and invert text-primary/text-on-dark. Not required for
v1 launch but token names must not preclude it (no hardcoded
"light-mode-only" logic in components).

## Typography

- **Font family:** A geometric sans (e.g. Inter or Geist) for all UI
  and body text. No serif anywhere on this site — the serif-for-voice
  convention belongs to Claude's own product surfaces, not to Northlace
  as a brand.
- **Type scale (Tailwind-mapped):**
  - `text-display` — 56px / 1.1 line-height / weight 500 — hero H1 only
  - `text-h1` — 40px / 1.15 / weight 500 — page-level H1
  - `text-h2` — 28px / 1.2 / weight 500 — section headings
  - `text-h3` — 20px / 1.3 / weight 500 — card titles, sub-section headings
  - `text-body` — 16px / 1.7 / weight 400 — default body
  - `text-small` — 14px / 1.6 / weight 400 — captions, metadata
- **Weights:** 400 and 500 only, anywhere on the site. No 600/700/800 —
  use color, size, or spacing for emphasis instead of heavier weight.
- **Letter spacing:** -0.02em on `text-display` and `text-h1` only
  (tightens the wordmark/hero feel); default tracking elsewhere.

## Spacing scale

Use Tailwind's default spacing scale (4px base unit) — no custom
spacing values. Section vertical padding: `py-24` desktop / `py-16`
mobile, standardized across all page sections for visual rhythm.

## Logo usage

- Primary mark: globe-with-meridian-lines icon, paired with "Northlace"
  wordmark in the type scale above, weight 500.
- Minimum clear space around the mark: equal to the height of the mark
  itself, on all sides.
- On dark (`northlace-900`) backgrounds: mark renders in `northlace-400`
  / `northlace-100`, wordmark in `text-on-dark`.
- On light (`surface-warm`) backgrounds: mark renders in `northlace-900`,
  wordmark in `text-primary`.
- Never place the mark on a busy photographic background.
- Favicon: mark only, no wordmark, square crop, exported at 16/32/180px
  (apple-touch-icon) and as an SVG.

## Component-level rules

- **Buttons:** one accent-filled primary button per page (per restraint
  rule) — reserve for the single most important action in that page's
  context (usually "Book a discovery call"). All other buttons are
  outline/ghost style using `northlace-700` border and text.
- **Cards:** `surface-warm` or white background, 1px border using a
  10%-opacity `northlace-900`, 12px border radius, no drop shadow by
  default — shadow only on hover for interactive cards (case study
  cards, service cards).
- **Badges/tags:** background `northlace-50`, text `northlace-700` (or
  on dark sections: background `northlace-900`/20% opacity tint, text
  `northlace-100`).
- **Icons:** Tabler outline icon set, 20-24px, inherit current text
  color — no custom icon illustrations except the logo mark itself and
  any approved abstract hero illustration.

## Explicitly disallowed

- No gradients anywhere in the production UI (gradients are fine only
  in exploratory mockups, never in shipped code).
- No drop shadows except the single hover-state exception above.
- No stock photography of generic "business people" — if imagery is
  used at all, it must be either abstract/geometric (consistent with
  the mark) or real, captioned photography of the actual team/work
  (e.g. a real conference talk photo), never generic stock.

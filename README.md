# Northlace Website

Northlace is a spec-driven Astro site for an enterprise cloud, DevOps, security,
FinOps, and AI-native delivery company. The supplied product, content, design,
and schema specs live in [`northlace-spec-kit/`](./northlace-spec-kit/).

## Stack

- Astro with TypeScript strict mode
- Tailwind CSS mapped to the binding Northlace design tokens
- Vitest for unit tests
- Playwright and axe-core for browser and accessibility checks
- Lighthouse CI for performance, accessibility, best-practices, and SEO budgets
- GitHub Actions for install, lint, typecheck, tests, build, accessibility, and Lighthouse gates
- Cloudflare Pages Functions for contact and application form delivery

## Local Development

Use Node.js 22.12.0 or newer. The repository includes an `.nvmrc` for local
version managers, and CI pins the same minimum Node line.

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

Build the site:

```sh
npm run build
```

## Test Commands

Run unit tests:

```sh
npm run test
```

Run end-to-end tests:

```sh
npm run test:e2e
```

Run the accessibility scan:

```sh
npm run test:a11y
```

Run the full gate:

```sh
npm run test:full
```

## Forms

Contact and application forms post to Cloudflare Pages Functions under
`/api/contact` and `/api/apply`. Delivery currently defaults to a structured
log-only adapter for **verified (mock)** submissions; provider selection is a
documented human decision gate. See [`docs/forms.md`](./docs/forms.md),
[`DUMMY-VALUES.md`](./DUMMY-VALUES.md), and [`.env.example`](./.env.example).

## Operations

Cloudflare Pages provides deployment rollback from the project dashboard:
open the production deployment history, choose a previously green deployment,
and promote it to production. Keep `ENVIRONMENT=production` free of
`CHANGE_ME_DEV_ONLY` values; the form functions reject dummy runtime values in
production mode.

The phase-gated implementation checklist is in
[`northlace-spec-kit/tasks/task-breakdown.md`](./northlace-spec-kit/tasks/task-breakdown.md).

# Contributing

Northlace is a spec-driven Astro site. Keep changes small, tested, and aligned
with the spec kit in `northlace-spec-kit/`.

## Local Checks

Use Node.js 22.12.0 or newer, then run:

```sh
npm install
npm run test:full
```

For content-only edits, at minimum run:

```sh
npm run lint:content
npm run test
npm run build
npm run lint:production-content
```

## Content Rules

- Do not ship `TODO-COPY`, `TODO-METRIC`, or lorem ipsum in production output.
- Do not present fabricated metrics as real numbers.
- Spell out acronyms on first use per page.
- Keep dates unambiguous.

## Pull Requests

Include the checks you ran, the pages affected, and any environment variables
needed for review. Form delivery configuration must stay in platform secrets,
not in committed files.

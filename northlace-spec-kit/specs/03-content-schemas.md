# Northlace website — content collection schemas

All dynamic content lives in Astro content collections under
`src/content/`. Every collection MUST have a Zod schema in
`src/content/config.ts` enforcing the shape below. Build agents must
write the schema BEFORE writing any page that consumes it (schema is the
contract; pages are consumers of the contract — never infer shape from
a single example file).

## Collection: `case-studies`

Path: `src/content/case-studies/[slug].mdx`

```ts
const caseStudySchema = z.object({
  title: z.string(),
  clientLabel: z.string(), // e.g. "Mid-market fintech, EU" — anonymized if needed
  anonymized: z.boolean().default(false),
  summary: z.string().max(200), // used in card grid
  pillars: z.array(z.enum(["run", "shield", "ledger", "shift"])).min(1),
  featured: z.boolean().default(false),
  publishDate: z.date(),
  heroMetric: z.object({
    value: z.string(), // e.g. "40%" or "99.95%"
    label: z.string(), // e.g. "Reduction in deployment time"
  }),
  challenge: z.string(), // markdown body section, can be longer-form in body itself
  approach: z.string(),
  outcomeMetrics: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      })
    )
    .min(1),
  architectureDiagram: z.string().optional(), // path to image asset
  seo: z.object({
    title: z.string().max(60),
    description: z.string().max(160),
  }),
});
```

Validation rules beyond the schema (enforce in tests, not just types):
- `heroMetric.value` and every `outcomeMetrics[].value` must not be a
  fabricated-looking placeholder like "XX%" — content lint test should
  flag any metric value matching `/X{2,}/` or literal "TBD" before
  allowing a build to pass for content NOT marked as draft.
- Draft case studies (not ready for production) must use Astro's
  `draft: true` frontmatter convention so they're excluded from
  production builds but can still be authored/reviewed in PRs.

## Collection: `careers`

Path: `src/content/careers/[slug].mdx`

```ts
const careerSchema = z.object({
  title: z.string(),
  department: z.enum([
    "cloud-devops",
    "sre",
    "platform",
    "security",
    "finops",
    "ai-engineering",
    "other",
  ]),
  locationType: z.enum(["remote", "hybrid", "onsite"]),
  locationDetail: z.string(), // e.g. "Remote, global" or "Hybrid — Lahore, Pakistan"
  employmentType: z.enum(["full-time", "part-time", "contract"]),
  postedDate: z.date(),
  closesDate: z.date().optional(),
  summary: z.string().max(200),
  responsibilities: z.array(z.string()).min(1),
  mustHave: z.array(z.string()).min(1),
  niceToHave: z.array(z.string()).optional(),
  applyEmail: z.string().email().optional(), // fallback if form unavailable
});
```

Validation rules:
- If `closesDate` is in the past, the role must not render in the
  active open-roles list (filter at query time, covered by a unit
  test) — but the page itself can still exist for link integrity / SEO
  with a "this role is now closed" banner rather than a broken 404.

## Collection: `blog`

Path: `src/content/blog/[slug].mdx`

```ts
const blogSchema = z.object({
  title: z.string(),
  publishDate: z.date(),
  author: z.string(),
  tags: z.array(z.string()).min(1),
  summary: z.string().max(200),
  heroImage: z.string().optional(),
  seo: z.object({
    title: z.string().max(60),
    description: z.string().max(160),
  }),
});
```

Validation rules:
- Reading time is computed at build time from word count, not authored
  by hand (avoid drift between actual content length and displayed
  estimate) — implement as a small pure function with a unit test
  (e.g. `getReadingTime(wordCount: number): number`, ~200 wpm assumption,
  tested with at least 3 cases including a 0-word edge case).

## Shared rule across all collections

Every collection schema must be covered by a schema test that:
1. Accepts one valid fixture per collection.
2. Rejects at least one invalid fixture per required field (missing
   title, malformed date, pillar value outside enum, etc).

These tests are part of the "definition of done" in
`specs/00-product-spec.md` Section 8 and must exist before a content
collection is considered implemented — schema without a test that
proves it rejects bad data is not done.

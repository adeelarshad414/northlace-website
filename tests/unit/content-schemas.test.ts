import { describe, expect, it } from "vitest";

import {
  blogSchema,
  careerSchema,
  caseStudySchema,
} from "../../src/content/schemas";

const validCaseStudy = {
  title: "Draft reliability modernization",
  clientLabel: "Enterprise software platform, global",
  anonymized: true,
  draft: true,
  summary: "Draft case study for reliability modernization patterns.",
  pillars: ["run", "shield"],
  featured: true,
  publishDate: new Date("2026-03-12"),
  heroMetric: {
    value: "TODO-METRIC",
    label: "Deployment reliability improvement",
  },
  challenge: "The platform needed more predictable release operations.",
  approach:
    "Northlace redesigned delivery workflows and operational guardrails.",
  outcomeMetrics: [
    {
      value: "TODO-METRIC",
      label: "Incident reduction",
    },
  ],
  seo: {
    title: "Reliability Modernization | Northlace",
    description:
      "A draft Northlace case study about reliability modernization.",
  },
};

const validCareer = {
  title: "Senior Platform Engineer",
  department: "platform",
  locationType: "remote",
  locationDetail: "Remote, global",
  employmentType: "full-time",
  postedDate: new Date("2026-03-12"),
  summary: "Build platform foundations for client-facing cloud operations.",
  responsibilities: ["Design reusable platform patterns."],
  mustHave: ["Production cloud platform experience."],
  niceToHave: ["Kubernetes ecosystem certification."],
  applyEmail: "careers@northlace.example",
};

const validBlog = {
  title: "Operating cloud standards",
  publishDate: new Date("2026-03-12"),
  author: "Northlace",
  tags: ["operations"],
  summary: "A note about consistent cloud operations standards.",
  seo: {
    title: "Operating Cloud Standards",
    description: "Northlace notes on consistent cloud operations standards.",
  },
};

const withoutKey = <T extends Record<string, unknown>>(
  fixture: T,
  key: keyof T,
) => {
  const copy = { ...fixture };
  delete copy[key];
  return copy;
};

describe("content collection schemas", () => {
  it("accepts one valid case study fixture", () => {
    expect(caseStudySchema.safeParse(validCaseStudy).success).toBe(true);
  });

  it.each([
    "title",
    "clientLabel",
    "summary",
    "pillars",
    "publishDate",
    "heroMetric",
    "challenge",
    "approach",
    "outcomeMetrics",
    "seo",
  ] as const)("rejects a case study missing %s", (field) => {
    expect(
      caseStudySchema.safeParse(withoutKey(validCaseStudy, field)).success,
    ).toBe(false);
  });

  it("rejects a case study with a pillar outside the enum", () => {
    expect(
      caseStudySchema.safeParse({ ...validCaseStudy, pillars: ["unknown"] })
        .success,
    ).toBe(false);
  });

  it("accepts one valid career fixture", () => {
    expect(careerSchema.safeParse(validCareer).success).toBe(true);
  });

  it.each([
    "title",
    "department",
    "locationType",
    "locationDetail",
    "employmentType",
    "postedDate",
    "summary",
    "responsibilities",
    "mustHave",
  ] as const)("rejects a career missing %s", (field) => {
    expect(careerSchema.safeParse(withoutKey(validCareer, field)).success).toBe(
      false,
    );
  });

  it("rejects a career with malformed email", () => {
    expect(
      careerSchema.safeParse({ ...validCareer, applyEmail: "not-an-email" })
        .success,
    ).toBe(false);
  });

  it("accepts one valid blog fixture", () => {
    expect(blogSchema.safeParse(validBlog).success).toBe(true);
  });

  it.each([
    "title",
    "publishDate",
    "author",
    "tags",
    "summary",
    "seo",
  ] as const)("rejects a blog post missing %s", (field) => {
    expect(blogSchema.safeParse(withoutKey(validBlog, field)).success).toBe(
      false,
    );
  });

  it("rejects a blog post with a malformed publish date", () => {
    expect(
      blogSchema.safeParse({ ...validBlog, publishDate: "12 Mar 2026" })
        .success,
    ).toBe(false);
  });
});

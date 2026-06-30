import { describe, expect, it } from "vitest";

import { findMetricPlaceholderViolations } from "../../src/lib/metric-placeholders.mjs";

const validDraft = {
  filePath: "src/content/case-studies/draft.mdx",
  data: {
    draft: true,
    heroMetric: { value: "XX%", label: "Draft metric" },
    outcomeMetrics: [{ value: "TBD", label: "Draft outcome" }],
  },
};

const validPublished = {
  filePath: "src/content/case-studies/published.mdx",
  data: {
    draft: false,
    heroMetric: { value: "40%", label: "Reduction in deployment time" },
    outcomeMetrics: [{ value: "99.95%", label: "Uptime achieved" }],
  },
};

describe("metric placeholder lint", () => {
  it("passes published metrics and ignores draft placeholders", () => {
    expect(
      findMetricPlaceholderViolations([validDraft, validPublished]),
    ).toEqual([]);
  });

  it("catches fabricated-looking published metric placeholders", () => {
    const violations = findMetricPlaceholderViolations([
      {
        filePath: "src/content/case-studies/bad.mdx",
        data: {
          draft: false,
          heroMetric: { value: "XX%", label: "Bad metric" },
          outcomeMetrics: [{ value: "TBD", label: "Bad outcome" }],
        },
      },
    ]);

    expect(violations).toEqual([
      'src/content/case-studies/bad.mdx heroMetric.value contains placeholder metric "XX%"',
      'src/content/case-studies/bad.mdx outcomeMetrics[0].value contains placeholder metric "TBD"',
    ]);
  });
});

import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const mapPath = path.join(process.cwd(), "docs", "deck-content-map.md");
const contents = fs.readFileSync(mapPath, "utf8");

describe("sales deck content map", () => {
  it("maps all 24 source slides into the 16-slide Northlace deck", () => {
    const sourceSection = contents
      .split("## Source Slide Mapping")[1]
      .split("## Dropped Or Reworked Elements")[0];
    const mappedRows = sourceSection
      .split("\n")
      .filter((line) => /^\|\s+\d+\s+\|/.test(line));

    expect(mappedRows).toHaveLength(24);
    expect(contents).toContain("Target length: 16 slides.");
  });

  it("preserves required source evidence and open offer markers", () => {
    for (const required of [
      "CNCF Annual Survey 2023",
      "IBM Cost of a Data Breach 2024",
      "DORA 2024",
      "verify figures before client distribution",
      "TODO-COPY",
      "TODO-OFFER",
      "TODO-PRICE",
      "TODO-METRIC",
      "HUMAN_DECISION_GATE",
    ]) {
      expect(contents).toContain(required);
    }
  });
});

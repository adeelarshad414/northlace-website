import { describe, expect, it } from "vitest";

import { getReadingTime } from "../../src/lib/reading-time";

describe("getReadingTime", () => {
  it("returns 0 for a 0-word post", () => {
    expect(getReadingTime(0)).toBe(0);
  });

  it("returns 1 minute for posts up to 200 words", () => {
    expect(getReadingTime(1)).toBe(1);
    expect(getReadingTime(200)).toBe(1);
  });

  it("rounds partial minutes up", () => {
    expect(getReadingTime(201)).toBe(2);
    expect(getReadingTime(600)).toBe(3);
  });
});

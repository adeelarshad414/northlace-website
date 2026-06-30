import { describe, expect, it } from "vitest";

import {
  activeRoles,
  filterBlogPostsByTag,
  filterCareers,
  filterCaseStudiesByPillar,
  isRoleClosed,
} from "../../src/lib/filters";

const caseStudies = [
  { id: "run-shield", pillars: ["run", "shield"] as const },
  { id: "ledger", pillars: ["ledger"] as const },
  { id: "shift", pillars: ["shift"] as const },
];

const roles = [
  {
    id: "platform-remote",
    department: "platform",
    locationType: "remote",
  },
  {
    id: "security-hybrid",
    department: "security",
    locationType: "hybrid",
  },
];

const posts = [
  { id: "announcement", tags: ["announcement", "devops"] },
  { id: "podcast", tags: ["podcast", "ai"] },
];

describe("content filters", () => {
  it("filters case studies by service pillar and handles empty results", () => {
    expect(
      filterCaseStudiesByPillar(caseStudies, "run").map((item) => item.id),
    ).toEqual(["run-shield"]);
    expect(
      filterCaseStudiesByPillar(caseStudies, "ledger").map((item) => item.id),
    ).toEqual(["ledger"]);
    expect(
      filterCaseStudiesByPillar(caseStudies, "all").map((item) => item.id),
    ).toEqual(["run-shield", "ledger", "shift"]);
    expect(
      filterCaseStudiesByPillar(caseStudies, "shield").map((item) => item.id),
    ).toEqual(["run-shield"]);
  });

  it("filters careers by department and location type", () => {
    expect(
      filterCareers(roles, { department: "security" }).map((role) => role.id),
    ).toEqual(["security-hybrid"]);
    expect(
      filterCareers(roles, { locationType: "remote" }).map((role) => role.id),
    ).toEqual(["platform-remote"]);
    expect(
      filterCareers(roles, {
        department: "platform",
        locationType: "hybrid",
      }).map((role) => role.id),
    ).toEqual([]);
  });

  it("filters blog posts by tag and handles empty results", () => {
    expect(
      filterBlogPostsByTag(posts, "announcement").map((post) => post.id),
    ).toEqual(["announcement"]);
    expect(filterBlogPostsByTag(posts, "all").map((post) => post.id)).toEqual([
      "announcement",
      "podcast",
    ]);
    expect(
      filterBlogPostsByTag(posts, "security").map((post) => post.id),
    ).toEqual([]);
  });

  it("detects closed roles and keeps them out of active role lists", () => {
    const now = new Date("2026-06-30T00:00:00Z");
    const future = new Date("2026-12-31T00:00:00Z");
    const past = new Date("2026-01-31T00:00:00Z");

    expect(isRoleClosed(past, now)).toBe(true);
    expect(isRoleClosed(future, now)).toBe(false);
    expect(isRoleClosed(undefined, now)).toBe(false);
    expect(
      activeRoles(
        [
          { department: "platform", locationType: "remote", closesDate: past },
          {
            department: "security",
            locationType: "remote",
            closesDate: future,
          },
          { department: "sre", locationType: "remote" },
        ],
        now,
      ),
    ).toHaveLength(2);
  });
});

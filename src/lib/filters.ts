import type { ServicePillarId } from "../data/services";

export interface CaseStudyFilterItem {
  pillars: readonly ServicePillarId[];
}

export interface CareerFilterItem {
  department: string;
  locationType: string;
  closesDate?: Date;
}

export interface BlogFilterItem {
  tags: string[];
}

export const filterCaseStudiesByPillar = <T extends CaseStudyFilterItem>(
  items: T[],
  pillar: ServicePillarId | "all",
) =>
  pillar === "all"
    ? items
    : items.filter((item) => item.pillars.includes(pillar));

export const filterCareers = <T extends CareerFilterItem>(
  items: T[],
  filters: { department?: string; locationType?: string },
) =>
  items.filter((item) => {
    const departmentMatches =
      !filters.department ||
      filters.department === "all" ||
      item.department === filters.department;
    const locationMatches =
      !filters.locationType ||
      filters.locationType === "all" ||
      item.locationType === filters.locationType;

    return departmentMatches && locationMatches;
  });

export const filterBlogPostsByTag = <T extends BlogFilterItem>(
  items: T[],
  tag: string | "all",
) => (tag === "all" ? items : items.filter((item) => item.tags.includes(tag)));

export const isRoleClosed = (closesDate?: Date, now = new Date()) =>
  Boolean(closesDate && closesDate.getTime() < now.getTime());

export const activeRoles = <T extends CareerFilterItem>(
  items: T[],
  now = new Date(),
) => items.filter((item) => !isRoleClosed(item.closesDate, now));

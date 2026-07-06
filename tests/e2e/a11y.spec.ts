import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/services",
  "/services/run",
  "/services/shield",
  "/services/ledger",
  "/services/shift",
  "/resources/modernization-deck",
  "/case-studies",
  "/case-studies/spec-driven-website-foundation",
  "/case-studies/content-system-launch",
  "/case-studies/shared-chrome-accessibility",
  "/about",
  "/careers",
  "/careers/platform-engineer-cloud-operations",
  "/careers/security-engineer-cloud-governance",
  "/careers/closed-cloud-operator",
  "/blog",
  "/blog/adeel-codes-cloud-launch",
  "/blog/signal-and-scale-launch",
  "/blog/the-cloud-lounge-launch",
  "/brand",
  "/brand/northlace",
  "/brand/adeel-codes-cloud",
  "/brand/signal-and-scale",
  "/brand/the-cloud-lounge",
  "/contact",
  "/privacy",
  "/terms",
  "/404",
];

for (const route of routes) {
  test(`${route} @a11y has no critical or serious accessibility violations`, async ({
    page,
  }) => {
    await page.goto(route);

    const results = await new AxeBuilder({ page }).analyze();
    const seriousViolations = results.violations.filter((violation) =>
      ["critical", "serious"].includes(violation.impact ?? ""),
    );

    expect(seriousViolations).toEqual([]);
  });
}

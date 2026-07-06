import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/services",
  "/services/run",
  "/services/shield",
  "/services/ledger",
  "/services/shift",
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

const widths = [360, 768, 1024, 1440];

test("routes do not create horizontal overflow at required breakpoints", async ({
  page,
}) => {
  for (const width of widths) {
    await page.setViewportSize({ height: 1000, width });

    for (const route of routes) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );

      expect(
        overflow,
        `${route} should not overflow horizontally at ${width}px`,
      ).toBeLessThanOrEqual(1);
    }
  }
});

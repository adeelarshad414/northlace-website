import { expect, test } from "@playwright/test";

test("home page renders the shared chrome scaffold", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Northlace | Every cloud. One standard.");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Every cloud. One standard.",
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Northlace runs cloud, DevOps, and security operations behind growing companies.",
  );
  await expect(
    page.getByRole("link", { name: "Book a discovery call" }).first(),
  ).toHaveAttribute("href", "/contact");
});

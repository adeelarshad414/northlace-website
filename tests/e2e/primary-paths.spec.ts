import { expect, test } from "@playwright/test";

test("primary CTA path: home to contact", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Book a discovery call" })
    .first()
    .click();

  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Let's talk",
  );
});

test("primary CTA path: home to case study to contact", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "See how we work" }).click();
  await page.getByRole("link", { name: "Read detail" }).first().click();
  await page
    .getByRole("link", { name: "Book a discovery call" })
    .last()
    .click();

  await expect(page).toHaveURL(/\/contact$/);
});

test("primary CTA path: careers to role apply form", async ({ page }) => {
  await page.goto("/careers");
  await expect(page.getByText("Cloud Operator, Closed Posting")).toHaveCount(0);
  await page.getByRole("link", { name: "View role" }).first().click();

  await expect(page.getByRole("heading", { name: "Apply" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send application" }),
  ).toBeVisible();
});

test("closed role detail renders a closed-role banner", async ({ page }) => {
  await page.goto("/careers/closed-cloud-operator");

  await expect(page.getByText("This role is now closed.")).toBeVisible();
});

test("primary CTA path: blog index to post", async ({ page }) => {
  await page.goto("/blog");
  await page.getByRole("link", { name: "Read post" }).first().click();

  await expect(page).toHaveURL(/\/blog\//);
  await expect(
    page.locator("article").first().getByRole("heading", { level: 1 }),
  ).toBeVisible();
});

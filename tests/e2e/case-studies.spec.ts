import { expect, test } from "@playwright/test";

test("filters case studies by pillar and opens a matching detail page", async ({
  page,
}) => {
  await page.goto("/case-studies");

  await page.getByRole("button", { name: "Shift" }).click();

  await expect(
    page.getByRole("heading", { name: "Content system launch" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Accessible shared chrome" }),
  ).toBeHidden();

  await page.getByRole("link", { name: "Read detail" }).click();
  await expect(page).toHaveURL(/\/case-studies\/content-system-launch$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Content system launch",
  );
  await expect(page.getByRole("heading", { name: "Outcome" })).toBeVisible();
});

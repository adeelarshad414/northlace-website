import { expect, test } from "@playwright/test";

test("submits the contact form successfully without a full page reload", async ({
  page,
}) => {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        ok: true,
        message: "Thanks. We will reply within 1-2 business days.",
      }),
      contentType: "application/json",
      status: 200,
    });
  });

  await page.goto("/contact");
  await page.waitForTimeout(1600);
  await page.getByLabel("Name").fill("Adeel Arshad");
  await page.getByLabel("Email").fill("adeel@example.com");
  await page
    .getByLabel("What are you looking for?")
    .selectOption("Discovery call");
  await page
    .getByLabel("Message")
    .fill("We need help standardizing cloud operations.");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByRole("status")).toHaveText(
    "Thanks. We will reply within 1-2 business days.",
  );
  await expect(page).toHaveURL(/\/contact$/);
});

test("shows inline contact errors before sending malformed email", async ({
  page,
}) => {
  let submissionCount = 0;
  await page.route("**/api/contact", async (route) => {
    submissionCount += 1;
    await route.abort();
  });

  await page.goto("/contact");
  await page.waitForTimeout(1600);
  await page.getByLabel("Name").fill("Adeel Arshad");
  await page.getByLabel("Email").fill("not-an-email");
  await page
    .getByLabel("What are you looking for?")
    .selectOption("Discovery call");
  await page
    .getByLabel("Message")
    .fill("We need help standardizing cloud operations.");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.locator('[data-error-for="email"]')).toHaveText(
    "Enter a valid email address.",
  );
  expect(submissionCount).toBe(0);
});

test("contact page exposes a usable no-JavaScript fallback", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      body: "<!doctype html><html><body><main><h1>Submission received</h1><p>Thanks. We will reply within 1-2 business days.</p></main></body></html>",
      contentType: "text/html",
      status: 200,
    });
  });

  await page.goto("/contact");
  await page.getByLabel("Name").fill("Adeel Arshad");
  await page.getByLabel("Email").fill("adeel@example.com");
  await page
    .getByLabel("What are you looking for?")
    .selectOption("Discovery call");
  await page
    .getByLabel("Message")
    .fill("We need help standardizing cloud operations.");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(
    page.getByRole("heading", { name: "Submission received" }),
  ).toBeVisible();

  await context.close();
});

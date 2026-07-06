import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

interface ManifestFile {
  mime: string;
  path: string;
}

interface BrandManifest {
  brands: Record<string, { files: ManifestFile[] }>;
}

const manifest = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "public", "brand", "manifest.json"),
    "utf8",
  ),
) as BrandManifest;
const headersFile = fs.readFileSync(
  path.join(process.cwd(), "public", "_headers"),
  "utf8",
);

const files = [
  { mime: "application/json", path: "/brand/manifest.json" },
  ...Object.values(manifest.brands).flatMap((brand) => brand.files),
];

const configuredContentType = (filePath: string) => {
  const extension = path.extname(filePath);
  const pattern = new RegExp(
    String.raw`\/brand\/\*\/\*${extension}\n(?:  .+\n)*?  Content-Type: ([^\n]+)`,
    "m",
  );
  return headersFile.match(pattern)?.[1] ?? "";
};

test("brand kit files return 200 with expected MIME policy", async ({
  request,
}) => {
  expect(files).toHaveLength(33);

  for (const file of files) {
    const response = await request.get(file.path);
    const contentType = response.headers()["content-type"] ?? "";
    const effectiveContentType =
      contentType || configuredContentType(file.path);

    expect(response.status(), file.path).toBe(200);
    expect(effectiveContentType, file.path).toContain(file.mime);
  }
});

test("brand hub links to every brand page and exposes manifest-backed downloads", async ({
  page,
}) => {
  await page.goto("/brand");

  for (const slug of Object.keys(manifest.brands)) {
    await expect(
      page
        .locator(`a[href="/brand/${slug}"]`)
        .filter({ hasText: "guidelines" }),
    ).toBeVisible();
    await expect(
      page.locator(`a[download][href^="/brand/${slug}/"]`),
    ).toHaveCount(8);
  }
});

test("brand palette copy buttons are keyboard operable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          const testWindow = window as Window & { __copiedColor?: string };
          testWindow.__copiedColor = value;
        },
      },
    });
  });

  await page.goto("/brand/northlace");
  const firstCopyButton = page.locator("[data-copy-color]").first();

  await firstCopyButton.press("Enter");

  await expect(firstCopyButton).toHaveText("Copied");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const testWindow = window as Window & { __copiedColor?: string };
        return testWindow.__copiedColor;
      }),
    )
    .toMatch(/^#/);
});

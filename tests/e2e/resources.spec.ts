import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

const downloads = [
  {
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    path: "/brand/northlace/northlace-modernization-sales-deck.pptx",
  },
  {
    mime: "application/pdf",
    path: "/brand/northlace/northlace-modernization-sales-deck.pdf",
  },
];

const previewImages = [1, 2, 3, 4].map(
  (number) =>
    `/resources/modernization-deck/preview-${String(number).padStart(
      2,
      "0",
    )}.png`,
);
const headersFile = fs.readFileSync(
  path.join(process.cwd(), "public", "_headers"),
  "utf8",
);

const configuredContentType = (filePath: string) => {
  const extension = path.extname(filePath);
  const pattern = new RegExp(
    String.raw`\/brand\/\*\/\*${extension}\n(?:  .+\n)*?  Content-Type: ([^\n]+)`,
    "m",
  );
  return headersFile.match(pattern)?.[1] ?? "";
};

test("modernization deck page exposes previews and downloads", async ({
  page,
  request,
}) => {
  await page.goto("/resources/modernization-deck");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Northlace Modernization Sales Deck",
    }),
  ).toBeVisible();
  await expect(page.getByText("Specific Person")).toBeVisible();
  await expect(page.getByText("Specific Problem")).toBeVisible();
  await expect(page.getByText("Specific Way")).toBeVisible();

  for (const download of downloads) {
    const link = page.locator(`a[download][href="${download.path}"]`).first();
    await expect(link).toBeVisible();

    const response = await request.get(download.path);
    const contentType =
      response.headers()["content-type"] ||
      configuredContentType(download.path);
    expect(response.status(), download.path).toBe(200);
    expect(contentType, download.path).toContain(download.mime);
  }

  for (const imagePath of previewImages) {
    await expect(page.locator(`img[src="${imagePath}"]`)).toBeVisible();
    const response = await request.get(imagePath);
    expect(response.status(), imagePath).toBe(200);
    expect(response.headers()["content-type"] ?? "", imagePath).toContain(
      "image/png",
    );
  }
});

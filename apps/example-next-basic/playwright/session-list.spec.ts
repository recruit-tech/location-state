import { describe } from "node:test";
import { expect, test } from "@playwright/test";

describe('"session list" is restored on browser back.', () => {
  describe("In app router", () => {
    [
      ["http://127.0.0.1:3000/static"],
      ["http://127.0.0.1:3000/dynamic"],
    ].forEach(([url]) => {
      test(`browser back on "page: ${url}`, async ({ page }) => {
        // Navigate to the target page.
        await page.goto(url);
        const sessionRegion = page.getByRole("region", {
          name: "session store list",
        });
        // Default list is empty.
        await expect(sessionRegion.getByRole("list")).toHaveCount(0);
        // Click the `session increment` button.
        await sessionRegion
          .getByRole("checkbox", { name: "Display List" })
          .click();
        await expect(sessionRegion.getByRole("list")).toHaveCount(1);
        // Navigate to the top page.
        await page.getByRole("link", { name: "top" }).click();
        await expect(sessionRegion.getByRole("list")).toHaveCount(0);
        // Navigate back to the target page.
        await page.goBack();
        await expect(sessionRegion.getByRole("list")).toHaveCount(1);
      });
    });
  });

  describe("In pages router", () => {
    [
      ["http://127.0.0.1:3000/pages/other"],
      ["http://127.0.0.1:3000/pages/ssr/1"],
      ["http://127.0.0.1:3000/pages/ssg/1"],
    ].forEach(([url]) => {
      test(`browser back on page: ${url}`, async ({ page }) => {
        // Navigate to the target page.
        await page.goto(url);
        const sessionRegion = page.getByRole("region", {
          name: "session store list",
        });
        // Default list is empty.
        await expect(sessionRegion.getByRole("list")).toHaveCount(0);
        // Click the `session increment` button.
        await sessionRegion
          .getByRole("checkbox", { name: "Display List" })
          .click();
        await expect(sessionRegion.getByRole("list")).toHaveCount(1);
        // Navigate to the top page.
        await page.getByRole("link", { name: /^\/pages$/ }).click();
        await expect(sessionRegion.getByRole("list")).toHaveCount(0);
        // Navigate back to the target page.
        await page.goBack();
        await expect(sessionRegion.getByRole("list")).toHaveCount(1);
      });
    });
  });
});

describe('"session list" is restored on reload.', () => {
  describe("In app router", () => {
    [
      ["http://127.0.0.1:3000/static"],
      ["http://127.0.0.1:3000/dynamic"],
    ].forEach(([url]) => {
      test(`reload on "page: ${url}`, async ({ page }) => {
        // Navigate to the target page.
        await page.goto(url);
        const sessionRegion = page.getByRole("region", {
          name: "session store list",
        });
        // Default list is empty.
        await expect(sessionRegion.getByRole("list")).toHaveCount(0);
        // Click the `session increment` button.
        await sessionRegion
          .getByRole("checkbox", { name: "Display List" })
          .click();
        await expect(sessionRegion.getByRole("list")).toHaveCount(1);
        // Navigate back to the target page.
        await page.reload();
        await expect(sessionRegion.getByRole("list")).toHaveCount(1);
      });
    });
  });

  describe("In pages router", () => {
    [
      ["http://127.0.0.1:3000/pages/other"],
      ["http://127.0.0.1:3000/pages/ssr/1"],
      ["http://127.0.0.1:3000/pages/ssg/1"],
    ].forEach(([url]) => {
      test(`reload on page: ${url}`, async ({ page }) => {
        // Navigate to the target page.
        await page.goto(url);
        const sessionRegion = page.getByRole("region", {
          name: "session store list",
        });
        // Default list is empty.
        await expect(sessionRegion.getByRole("list")).toHaveCount(0);
        // Click the `session increment` button.
        await sessionRegion
          .getByRole("checkbox", { name: "Display List" })
          .click();
        await expect(sessionRegion.getByRole("list")).toHaveCount(1);
        // Navigate back to the target page.
        await page.reload();
        await expect(sessionRegion.getByRole("list")).toHaveCount(1);
      });
    });
  });
});

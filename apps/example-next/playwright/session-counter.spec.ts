import { test, expect } from "@playwright/test";
import { describe } from "node:test";

// Safari/Firefox: different from actual behavior
test.skip(({ browserName }) => browserName !== "chromium", "Chromium only!");

describe('"session counter" is restored on browser back.', () => {
  describe("In app router", () => {
    [
      ["http://127.0.0.1:3000/static"],
      ["http://127.0.0.1:3000/dynamic"],
    ].forEach(([url]) => {
      test(`browser back on "page: ${url}`, async ({ page }) => {
        // Navigate to the target page.
        await page.goto(url);
        const sessionRegion = page.getByRole("region", {
          name: "session store counter",
        });
        // Default counter is 0.
        await expect(sessionRegion.getByRole("paragraph")).toHaveText(
          "counter: 0",
        );
        // Click the `session increment` button.
        await sessionRegion.getByRole("button", { name: "increment" }).click();
        await expect(sessionRegion.getByRole("paragraph")).toHaveText(
          "counter: 1",
        );
        // Navigate to the top page.
        await page.getByRole("link", { name: "top" }).click();
        await expect(sessionRegion.getByRole("paragraph")).toHaveText(
          "counter: 0",
        );
        // Navigate back to the target page.
        await page.goBack();
        await expect(sessionRegion.getByRole("paragraph")).toHaveText(
          "counter: 1",
        );
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
          name: "session store counter",
        });
        // Default counter is 0.
        await expect(sessionRegion.getByRole("paragraph")).toHaveText(
          "counter: 0",
        );
        // Click the `session increment` button.
        await sessionRegion.getByRole("button", { name: "increment" }).click();
        await expect(sessionRegion.getByRole("paragraph")).toHaveText(
          "counter: 1",
        );
        // Navigate to the top page.
        await page.getByRole("link", { name: /^\/pages$/ }).click();
        await expect(sessionRegion.getByRole("paragraph")).toHaveText(
          "counter: 0",
        );
        // Navigate back to the target page.
        await page.goBack();
        await expect(sessionRegion.getByRole("paragraph")).toHaveText(
          "counter: 1",
        );
      });
    });
  });
});

describe('"session counter" is restored on reload.', () => {
  describe("In app router", () => {
    [
      ["http://127.0.0.1:3000/static"],
      ["http://127.0.0.1:3000/dynamic"],
    ].forEach(([url]) => {
      test(`reload on "page: ${url}`, async ({ page }) => {
        // Navigate to the target page.
        await page.goto(url);
        const sessionRegion = page.getByRole("region", {
          name: "session store counter",
        });
        // Default counter is 0.
        await expect(sessionRegion.getByRole("paragraph")).toHaveText(
          "counter: 0",
        );
        // Click the `session increment` button.
        await sessionRegion.getByRole("button", { name: "increment" }).click();
        await expect(sessionRegion.getByRole("paragraph")).toHaveText(
          "counter: 1",
        );
        // reload the page.
        await page.reload();
        await expect(sessionRegion.getByRole("paragraph")).toHaveText(
          "counter: 1",
        );
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
          name: "session store counter",
        });
        // Default counter is 0.
        await expect(sessionRegion.getByRole("paragraph")).toHaveText(
          "counter: 0",
        );
        // Click the `session increment` button.
        await sessionRegion.getByRole("button", { name: "increment" }).click();
        await expect(sessionRegion.getByRole("paragraph")).toHaveText(
          "counter: 1",
        );
        // reload the page.
        await page.reload();
        await expect(sessionRegion.getByRole("paragraph")).toHaveText(
          "counter: 1",
        );
      });
    });
  });
});

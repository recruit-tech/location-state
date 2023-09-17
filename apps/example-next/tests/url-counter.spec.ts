import { test, expect } from "@playwright/test";
import { describe } from "node:test";

describe('"url counter" is restored on browser back.', () => {
  describe("In app router", () => {
    [
      ["http://127.0.0.1:3000/static", "Static page"],
      ["http://127.0.0.1:3000/dynamic", "Dynamic page"],
    ].forEach(([url, title]) => {
      test(`browser back on "page: ${url}`, async ({ page }) => {
        // Navigate to the target page.
        await page.goto(url);
        await expect(
          page.getByRole("heading", {
            level: 1,
          }),
        ).toHaveText(title);
        // Click the `url increment` button.
        const urlRegion = page.getByRole("region", {
          name: "url store counter",
        });
        await urlRegion.getByRole("button", { name: "increment" }).click();
        await expect(urlRegion.getByRole("paragraph")).toHaveText("counter: 1");
        // Navigate to the home page.
        await page.getByRole("link", { name: "top" }).click();
        await expect(
          page
            .getByRole("region", {
              name: "url store counter",
            })
            .getByRole("paragraph"),
        ).toHaveText("counter: 0");
        // Navigate back to the target page.
        await page.goBack();
        await expect(urlRegion.getByRole("paragraph")).toHaveText("counter: 1");
        expect(page.url()).toBe(
          `${url}?location-state=%7B%22counter%22%3A1%7D`,
        );
      });
    });
  });

  describe("In pages router", () => {
    [
      ["http://127.0.0.1:3000/pages/other", "Other Page"],
      ["http://127.0.0.1:3000/pages/ssr/1", "SSR Page"],
      ["http://127.0.0.1:3000/pages/ssg/1", "SSG Page"],
    ].forEach(([url, title]) => {
      test(`browser back on page: ${url}`, async ({ page }) => {
        // Navigate to the target page.
        await page.goto(url);
        await expect(
          page.getByRole("heading", {
            level: 1,
          }),
        ).toHaveText(title);
        // Click the `url increment` button.
        const urlRegion = page.getByRole("region", {
          name: "url store counter",
        });
        await urlRegion.getByRole("button", { name: "increment" }).click();
        await expect(urlRegion.getByRole("paragraph")).toHaveText("counter: 1");
        // Navigate to the home page.
        await page.getByRole("link", { name: /^\/pages$/ }).click();
        await expect(
          page
            .getByRole("region", {
              name: "url store counter",
            })
            .getByRole("paragraph"),
        ).toHaveText("counter: 0");
        // Navigate back to the target page.
        await page.goBack();
        await expect(urlRegion.getByRole("paragraph")).toHaveText("counter: 1");
        expect(page.url()).toBe(
          `${url}?location-state=%7B%22counter%22%3A1%7D`,
        );
      });
    });
  });
});

describe('"url counter" is restored on reload.', () => {
  describe("In app router", () => {
    [
      ["http://127.0.0.1:3000/static", "Static page"],
      ["http://127.0.0.1:3000/dynamic", "Dynamic page"],
    ].forEach(([url, title]) => {
      test(`reload on "page: ${url}`, async ({ page }) => {
        // Navigate to the target page.
        await page.goto(url);
        await expect(
          page.getByRole("heading", {
            level: 1,
          }),
        ).toHaveText(title);
        // Click the `url increment` button.
        const urlRegion = page.getByRole("region", {
          name: "url store counter",
        });
        await urlRegion.getByRole("button", { name: "increment" }).click();
        await expect(urlRegion.getByRole("paragraph")).toHaveText("counter: 1");
        // reload the page.
        await page.reload();
        await expect(urlRegion.getByRole("paragraph")).toHaveText("counter: 1");
        expect(page.url()).toBe(
          `${url}?location-state=%7B%22counter%22%3A1%7D`,
        );
      });
    });
  });

  describe("In pages router", () => {
    [
      ["http://127.0.0.1:3000/pages/other", "Other Page"],
      ["http://127.0.0.1:3000/pages/ssr/1", "SSR Page"],
      ["http://127.0.0.1:3000/pages/ssg/1", "SSG Page"],
    ].forEach(([url, title]) => {
      test(`reload on page: ${url}`, async ({ page }) => {
        // Navigate to the target page.
        await page.goto(url);
        await expect(
          page.getByRole("heading", {
            level: 1,
          }),
        ).toHaveText(title);
        // Click the `url increment` button.
        const urlRegion = page.getByRole("region", {
          name: "url store counter",
        });
        await urlRegion.getByRole("button", { name: "increment" }).click();
        await expect(urlRegion.getByRole("paragraph")).toHaveText("counter: 1");
        // reload the page.
        await page.reload();
        await expect(urlRegion.getByRole("paragraph")).toHaveText("counter: 1");
        expect(page.url()).toBe(
          `${url}?location-state=%7B%22counter%22%3A1%7D`,
        );
      });
    });
  });
});

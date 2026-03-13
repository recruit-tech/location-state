import { describe } from "node:test";
import { expect, test } from "@playwright/test";

describe('"url counter" is restored on browser back.', () => {
  [["http://127.0.0.1:3000/static"], ["http://127.0.0.1:3000/dynamic"]].forEach(
    ([url]) => {
      test(`browser back on "page: ${url}`, async ({ page }) => {
        // Navigate to the target page.
        await page.goto(url);
        const urlRegion = page.getByRole("region", {
          name: "url store counter",
        });
        // Default counter is 0.
        await expect(urlRegion.getByRole("paragraph")).toHaveText("counter: 0");
        // Click the `url increment` button.
        await urlRegion.getByRole("button", { name: "increment" }).click();
        await expect(urlRegion.getByRole("paragraph")).toHaveText("counter: 1");
        // Navigate to the top page.
        await page.getByRole("link", { name: "top" }).click();
        await expect(urlRegion.getByRole("paragraph")).toHaveText("counter: 0");
        // Navigate back to the target page.
        await page.goBack();
        await expect(urlRegion.getByRole("paragraph")).toHaveText("counter: 1");
        expect(page.url()).toBe(
          `${url}?location-state=%7B%22counter%22%3A1%7D`,
        );
      });
    },
  );
});

describe('"url counter" is restored on reload.', () => {
  [["http://127.0.0.1:3000/static"], ["http://127.0.0.1:3000/dynamic"]].forEach(
    ([url]) => {
      test(`reload on "page: ${url}`, async ({ page }) => {
        // Navigate to the target page.
        await page.goto(url);
        const urlRegion = page.getByRole("region", {
          name: "url store counter",
        });
        // Default counter is 0.
        await expect(urlRegion.getByRole("paragraph")).toHaveText("counter: 0");
        // Click the `url increment` button.
        await urlRegion.getByRole("button", { name: "increment" }).click();
        await expect(urlRegion.getByRole("paragraph")).toHaveText("counter: 1");
        // reload the page.
        await page.reload();
        await expect(urlRegion.getByRole("paragraph")).toHaveText("counter: 1");
        expect(page.url()).toBe(
          `${url}?location-state=%7B%22counter%22%3A1%7D`,
        );
      });
    },
  );
});

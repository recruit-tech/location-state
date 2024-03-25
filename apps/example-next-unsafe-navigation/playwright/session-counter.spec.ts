import { describe } from "node:test";
import { expect, test } from "@playwright/test";

// Safari/Firefox: different from actual behavior
test.skip(({ browserName }) => browserName !== "chromium", "Chromium only!");

describe('"session counter" is restored on browser back.', () => {
  [["http://127.0.0.1:3000/static"], ["http://127.0.0.1:3000/dynamic"]].forEach(
    ([url]) => {
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
    },
  );
});

describe('"session counter" is restored on reload.', () => {
  [["http://127.0.0.1:3000/static"], ["http://127.0.0.1:3000/dynamic"]].forEach(
    ([url]) => {
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
    },
  );
});

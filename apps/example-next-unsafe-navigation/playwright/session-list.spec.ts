import { test, expect } from "@playwright/test";
import { describe } from "node:test";

// Safari/Firefox: different from actual behavior
test.skip(({ browserName }) => browserName !== "chromium", "Chromium only!");

describe('"session list" is restored on browser back.', () => {
  [["http://127.0.0.1:3000/static"], ["http://127.0.0.1:3000/dynamic"]].forEach(
    ([url]) => {
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
    },
  );
});

describe('"session list" is restored on reload.', () => {
  [["http://127.0.0.1:3000/static"], ["http://127.0.0.1:3000/dynamic"]].forEach(
    ([url]) => {
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
    },
  );
});

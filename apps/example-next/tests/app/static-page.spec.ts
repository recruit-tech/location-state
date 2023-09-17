import { test, expect } from "@playwright/test";

test("`session increment` is restored on browser back.", async ({ page }) => {
  // Navigate to the static page.
  await page.goto("http://127.0.0.1:3000/static");
  await expect(
    page.getByRole("heading", {
      level: 1,
    }),
  ).toHaveText(/Static page/);
  // Click the `session increment` button.
  const sessionRegion = page.getByRole("region", {
    name: "session store counter",
  });
  await sessionRegion
    .getByRole("button", { name: "session increment" })
    .click();
  await expect(sessionRegion.getByRole("paragraph")).toHaveText("counter: 1");
  // Navigate to the home page.
  await page.getByRole("link", { name: "top" }).click();
  await expect(
    page
      .getByRole("region", {
        name: "session store counter",
      })
      .getByRole("paragraph"),
  ).toHaveText("counter: 0");
  // Navigate back to the static page.
  await page.goBack();
  await expect(sessionRegion.getByRole("paragraph")).toHaveText("counter: 1");
});

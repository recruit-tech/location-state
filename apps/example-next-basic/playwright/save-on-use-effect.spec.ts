import { expect, test } from "@playwright/test";

test("restore random id that save on `useEffect()`", async ({ page }) => {
  // Navigate to the target page.
  await page.goto("http://localhost:3000/pages/save-on-use-effect");
  const h1Element = page.getByRole("heading", { level: 1 });
  await expect(h1Element).toHaveText(
    /Save on `useEffect\(\)`, random value: \d+/,
  );
  // Capture the text after useEffect has set the random value.
  const initialH1Text = await h1Element.textContent();
  // Navigate to the top page.
  await page.getByRole("link", { name: /^\/pages$/ }).click();
  await expect(page).toHaveURL("http://localhost:3000/pages");
  // Navigate back to the target page.
  await page.goBack();
  await expect(page).toHaveURL(
    "http://localhost:3000/pages/save-on-use-effect",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    initialH1Text!,
  );
});

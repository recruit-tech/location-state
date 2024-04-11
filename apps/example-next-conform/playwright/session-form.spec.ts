import { describe } from "node:test";
import { expect, test } from "@playwright/test";

// Safari/Firefox: different from actual behavior
test.skip(({ browserName }) => browserName !== "chromium", "Chromium only!");

describe('"simple form" is restored on browser back.', () => {
  test("browser back on simple form", async ({ page }) => {
    // Navigate to the target page.
    await page.goto("http://localhost:3000/session/simple-form");
    const firstName = page.getByRole("textbox", { name: "First name" });
    const lastName = page.getByRole("textbox", { name: "Last name" });
    // Default counter is "".
    await expect(firstName).toHaveValue("");
    await expect(lastName).toHaveValue("");
    // Change `firstName` & `lastName`.
    await firstName.fill("Tanaka");
    await lastName.fill("Taro");
    // Navigate to the top page.
    await page.goto("http://localhost:3000");
    await expect(page.getByRole("heading")).toHaveText("`conform` example");
    // Navigate back to the target page.
    await page.goBack();
    await expect(firstName).toHaveValue("Tanaka");
    await expect(lastName).toHaveValue("Taro");
  });
});

describe('"dynamic form" is restored on browser back.', () => {
  test("browser back on dynamic form", async ({ page }) => {
    // Navigate to the target page.
    await page.goto("http://localhost:3000/session/dynamic-form");
    // Add 2 member fields.
    const addMember = page.getByRole("button", { name: "Add member to last" });
    await addMember.click();
    await addMember.click();
    // Default counter is "".
    const member1Name = page.getByRole("textbox", { name: "name: " }).first();
    const member2Name = page.getByRole("textbox", { name: "name: " }).nth(1);
    await expect(member1Name).toHaveValue("");
    await expect(member2Name).toHaveValue("");
    // Change `firstName` & `lastName`.
    await member1Name.fill("Tanaka");
    // Navigate to the top page.
    await page.goto("http://localhost:3000");
    await expect(page.getByRole("heading")).toHaveText("`conform` example");
    // Navigate back to the target page.
    await page.goBack();
    await expect(member1Name).toHaveValue("Tanaka");
    await expect(member2Name).toHaveValue("");
  });
});
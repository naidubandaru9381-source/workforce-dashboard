import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("logs in and redirects to dashboard", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();

    await page.getByLabel(/email/i).fill("admin@example.com");
    await page.getByLabel(/password/i).fill("Admin@123");

    await page.locator('button[type="submit"]').click();

    // Wait for the protected dashboard to load.
    await expect(page).toHaveURL(/\/dashboard/, {
      timeout: 15_000,
    });

    await expect(
      page.getByRole("heading", {
        name: /dashboard/i,
      }),
    ).toBeVisible({
      timeout: 15_000,
    });
  });
});
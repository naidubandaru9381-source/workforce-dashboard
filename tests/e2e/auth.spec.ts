import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
    test("logs in and redirects to dashboard", async ({ page }) => {
        await page.goto("/login");

        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/password/i)).toBeVisible();

        await page.getByLabel(/email/i).fill("admin@example.com");
        await page.getByLabel(/password/i).fill("Admin@123");

        await Promise.all([
            page.waitForURL(/\/dashboard/, {
                timeout: 20_000,
            }),
            page.locator('button[type="submit"]').click(),
        ]);

        await expect(
            page.getByRole("heading", {
                name: /dashboard/i,
            }),
        ).toBeVisible({
            timeout: 15_000,
        });
    });
});

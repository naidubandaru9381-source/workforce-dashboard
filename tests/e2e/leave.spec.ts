import { test, expect } from "@playwright/test";

test.describe("Leave management", () => {
  test("submits and approves a leave request", async ({ page }) => {
    test.setTimeout(90_000);

    // Login
    await page.goto("/login");

    await expect(page).toHaveURL(/\/login/);

    await expect(page.getByLabel(/email/i)).toBeVisible({
      timeout: 15_000,
    });

    await expect(page.getByLabel(/password/i)).toBeVisible({
      timeout: 15_000,
    });

    await page.getByLabel(/email/i).fill("admin@example.com");
    await page.getByLabel(/password/i).fill("Admin@123");

    await page.locator('button[type="submit"]').click();

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

    // Open Leave Management
    await page.goto("/leave", {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });

    await expect(page).toHaveURL(/\/leave/, {
      timeout: 15_000,
    });

    await expect(
      page.getByRole("heading", {
        name: /leave management/i,
      }),
    ).toBeVisible({
      timeout: 15_000,
    });

    // Fill leave form
    await page.locator("#startDate").fill("2026-11-23");
    await page.locator("#endDate").fill("2026-11-24");

    await page
      .locator("#reason")
      .fill("Personal work for E2E testing");

    // Wait for the create API request
    const createLeaveResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/leave-requests") &&
        response.request().method() === "POST",
    );

    // Submit leave request
    await page
      .getByRole("button", {
        name: "Submit Leave Request",
      })
      .click();

   const response = await createLeaveResponse;

const responseBody = await response.text();
const requestBody = response.request().postData();

expect(
  response.status(),
  [
    `Leave creation failed.`,
    `Status: ${response.status()}`,
    `URL: ${response.url()}`,
    `Request body: ${requestBody ?? "EMPTY"}`,
    `Response body: ${responseBody || "EMPTY"}`,
  ].join("\n"),
).toBe(201);

    // Wait for the leave request list to refresh
   // Wait for the newly created request to appear in the table
const leaveRow = page
  .locator("tr")
  .filter({
    hasText: "Personal work for E2E testing",
  });

await expect(leaveRow).toBeVisible({
  timeout: 30_000,
});

    // Verify pending status
    await expect(
      leaveRow.getByText("pending"),
    ).toBeVisible();

    // Approve the request
    await leaveRow
      .getByRole("button", {
        name: "Approve",
      })
      .click();

    // Verify approved status
    await expect(
      leaveRow.getByText("approved"),
    ).toBeVisible({
      timeout: 15_000,
    });

    // Verify reviewed state
    await expect(
      leaveRow.getByText("Reviewed"),
    ).toBeVisible({
      timeout: 15_000,
    });
  });
});
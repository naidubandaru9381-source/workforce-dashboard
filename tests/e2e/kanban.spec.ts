
import { test, expect } from "@playwright/test";

test.describe("Kanban optimistic rollback", () => {
  test("rolls back a failed task move", async ({ page }) => {
    test.setTimeout(120_000);

    // ============================================================
    // 1. LOGIN
    // ============================================================

    await page.goto("/login");

    await expect(
      page.getByLabel(/email/i),
    ).toBeVisible();

    await expect(
      page.getByLabel(/password/i),
    ).toBeVisible();

    await page
      .getByLabel(/email/i)
      .fill("admin@example.com");

    await page
      .getByLabel(/password/i)
      .fill("Admin@123");

    await page
      .locator('button[type="submit"]')
      .click();

    await expect(page).toHaveURL(
      /\/dashboard/,
      {
        timeout: 30_000,
      },
    );

    // ============================================================
    // 2. OPEN PROJECT
    // ============================================================

    await page.goto(
      "/projects/project-1",
      {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      },
    );

    await expect(page).toHaveURL(
      /\/projects\/project-1/,
      {
        timeout: 30_000,
      },
    );

    // Wait until loading finishes.
    await expect(
      page.getByText(
        "Loading project...",
        {
          exact: true,
        },
      ),
    ).not.toBeVisible({
      timeout: 60_000,
    });

    // Make sure the page did not fail.
    await expect(
      page.getByText(
        "Failed to load project.",
        {
          exact: true,
        },
      ),
    ).not.toBeVisible({
      timeout: 5_000,
    });

    // ============================================================
    // 3. FIND KANBAN COLUMNS
    // ============================================================

    const todoColumn =
      page.getByRole("region", {
        name: "To Do tasks",
        exact: true,
      });

    const inProgressColumn =
      page.getByRole("region", {
        name: "In Progress tasks",
        exact: true,
      });

    await expect(
      todoColumn,
    ).toBeVisible({
      timeout: 60_000,
    });

    await expect(
      inProgressColumn,
    ).toBeVisible({
      timeout: 60_000,
    });

    // ============================================================
    // 4. FIND TASK 200
    // ============================================================

    const task =
      page.getByTestId(
        "task-card-task-200",
      );

    await expect(
      task,
    ).toBeVisible({
      timeout: 60_000,
    });

    // Verify task starts in To Do.
    await expect(
      todoColumn,
    ).toContainText(
      "Workforce task 200",
      {
        timeout: 10_000,
      },
    );

    await expect(
      inProgressColumn,
    ).not.toContainText(
      "Workforce task 200",
      {
        timeout: 10_000,
      },
    );

    // ============================================================
    // 5. WAIT FOR FAILED PATCH REQUEST
    // ============================================================

    const failedPatchPromise =
      page.waitForResponse(
        (response) => {
          if (
            !response.url().includes(
              "/api/tasks/task-200",
            )
          ) {
            return false;
          }

          if (
            response.request().method() !==
            "PATCH"
          ) {
            return false;
          }

          return true;
        },
        {
          timeout: 30_000,
        },
      );

    // ============================================================
    // 6. GET CURRENT SCREEN COORDINATES
    // ============================================================

    await task.scrollIntoViewIfNeeded();

    const taskBox =
      await task.boundingBox();

    if (!taskBox) {
      throw new Error(
        "Could not get task bounding box.",
      );
    }

    const columnBox =
      await inProgressColumn.boundingBox();

    if (!columnBox) {
      throw new Error(
        "Could not get In Progress column bounding box.",
      );
    }

    const taskX =
      taskBox.x +
      taskBox.width / 2;

    const taskY =
      taskBox.y +
      taskBox.height / 2;

    const columnX =
      columnBox.x +
      columnBox.width / 2;

    const columnY =
      columnBox.y + 100;

    // ============================================================
    // 7. PERFORM MOUSE DRAG
    // ============================================================

    await page.mouse.move(
      taskX,
      taskY,
    );

    await page.waitForTimeout(200);

    await page.mouse.down();

    await page.waitForTimeout(300);

    // Move beyond dnd-kit's activation distance.
    await page.mouse.move(
      taskX + 20,
      taskY + 20,
      {
        steps: 10,
      },
    );

    await page.waitForTimeout(500);

    // Move to destination.
    await page.mouse.move(
      columnX,
      columnY,
      {
        steps: 50,
      },
    );

    await page.waitForTimeout(1_000);

    await page.mouse.up();

    // ============================================================
    // 8. VERIFY PATCH REQUEST
    // ============================================================

    const patchResponse =
      await failedPatchPromise;

    expect(
      patchResponse.status(),
    ).toBe(409);

    // ============================================================
    // 9. VERIFY ROLLBACK TOAST
    // ============================================================

    await expect(
      page.getByText(
        "Task move failed. The change was rolled back.",
        {
          exact: true,
        },
      ),
    ).toBeVisible({
      timeout: 15_000,
    });

    // ============================================================
    // 10. VERIFY TASK RETURNED TO TODO
    // ============================================================

    await expect(
      todoColumn,
    ).toContainText(
      "Workforce task 200",
      {
        timeout: 15_000,
      },
    );

    await expect(
      inProgressColumn,
    ).not.toContainText(
      "Workforce task 200",
      {
        timeout: 15_000,
      },
    );
  });
});

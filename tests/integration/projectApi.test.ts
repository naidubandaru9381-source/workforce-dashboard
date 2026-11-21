import { configureStore } from "@reduxjs/toolkit";

import { baseApi } from "@/store/api/baseApi";
import { projectApi } from "@/features/projects/projectApi";
import authReducer from "@/features/auth/authSlice";

describe("projectApi optimistic updates", () => {
    const projectId = "project-001";
    const taskId = "task-001";

    const initialTask = {
        id: taskId,
        projectId,
        title: "Test Task",
        description: "Test task description",
        status: "todo" as const,
        priority: "medium" as const,
        assigneeId: "user-001",
        assigneeName: "Test User",
        dueDate: "2026-12-01",
        createdAt: "2026-11-01T00:00:00.000Z",
        updatedAt: "2026-11-01T00:00:00.000Z",
    };

    function createTestStore() {
        return configureStore({
            reducer: {
                auth: authReducer,
                [baseApi.reducerPath]:
                    baseApi.reducer,
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(
                    baseApi.middleware,
                ),
        });
    }

    it("rolls back an optimistic task status update when the server request fails", async () => {
        const store = createTestStore();

        store.dispatch(
            projectApi.util.upsertQueryData(
                "getProjectTasks",
                projectId,
                {
                    data: [initialTask],
                    total: 1,
                },
            ),
        );

        await new Promise((resolve) =>
            setTimeout(resolve, 0),
        );

        const updatePromise =
            store.dispatch(
                projectApi.endpoints.updateTask.initiate({
                    id: taskId,
                    projectId,
                    data: {
                        status: "in_progress",
                    },
                }),
            );

        const stateAfterOptimisticUpdate =
            baseApi.endpoints.getProjectTasks.select(
                projectId,
            )(store.getState());

        expect(
            stateAfterOptimisticUpdate.data?.data[0]
                .status,
        ).toBe("in_progress");

        await updatePromise;

        const stateAfterRollback =
            baseApi.endpoints.getProjectTasks.select(
                projectId,
            )(store.getState());

        expect(
            stateAfterRollback.data?.data[0].status,
        ).toBe("todo");
    });
});
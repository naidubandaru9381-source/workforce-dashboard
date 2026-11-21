import { baseApi } from "@/store/api/baseApi";
import type { Project } from "@/types/project";
import type { Task, TaskActivity, TaskComment } from "@/types/task";

interface ProjectsResponse {
    data: Project[];
    total: number;
}

interface ProjectTasksResponse {
    data: Task[];
    total: number;
}

interface CommentsResponse {
    data: TaskComment[];
    total: number;
}

interface ActivityResponse {
    data: TaskActivity[];
    total: number;
}

interface UpdateTaskRequest {
    id: string;
    projectId: string;
    data: Partial<Task>;
}

interface AddCommentRequest {
    taskId: string;
    content: string;
}

export const projectApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // =========================
        // PROJECTS
        // =========================

        getProjects: builder.query<ProjectsResponse, void>({
            query: () => ({
                url: "/projects",
            }),
            providesTags: ["Project"],
        }),

        // =========================
        // SINGLE PROJECT
        // =========================

        getProject: builder.query<Project, string>({
            query: (id) => ({
                url: `/projects/${id}`,
            }),
            providesTags: (_result, _error, id) => [
                {
                    type: "Project",
                    id,
                },
            ],
        }),

        // =========================
        // PROJECT TASKS
        // =========================

        getProjectTasks: builder.query<ProjectTasksResponse, string>({
            query: (projectId) => ({
                url: `/projects/${projectId}/tasks`,
            }),
            providesTags: (_result, _error, projectId) => [
                {
                    type: "Task",
                    id: projectId,
                },
            ],
        }),

        // =========================
        // UPDATE TASK
        // =========================

        updateTask: builder.mutation<Task, UpdateTaskRequest>({
            query: ({ id, data }) => ({
                url: `/tasks/${id}`,
                method: "PATCH",
                body: data,
            }),

            async onQueryStarted(
                { id, projectId, data },
                { dispatch, queryFulfilled },
            ) {
                const patchResult = dispatch(
                    projectApi.util.updateQueryData(
                        "getProjectTasks",
                        projectId,
                        (draft) => {
                            const task = draft.data.find(
                                (item) => item.id === id,
                            );

                            if (task && data.status) {
                                task.status = data.status;
                            }
                        },
                    ),
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();

                    console.error(
                        "Task update failed. Optimistic update rolled back.",
                    );
                }
            },
        }),

        // =========================
        // GET COMMENTS
        // =========================

        getTaskComments: builder.query<CommentsResponse, string>({
            query: (taskId) => ({
                url: `/tasks/${taskId}/comments`,
            }),

            providesTags: (_result, _error, taskId) => [
                {
                    type: "TaskComment",
                    id: taskId,
                },
            ],
        }),

        // =========================
        // ADD COMMENT
        // =========================

        addTaskComment: builder.mutation<TaskComment, AddCommentRequest>({
            query: ({ taskId, content }) => ({
                url: `/tasks/${taskId}/comments`,
                method: "POST",
                body: {
                    content,
                },
            }),

            async onQueryStarted(
                { taskId, content },
                { dispatch, queryFulfilled },
            ) {
                const temporaryComment: TaskComment = {
                    id: `temp-${Date.now()}`,
                    taskId,
                    userId: "user-001",
                    userName: "Current User",
                    content,
                    createdAt: new Date().toISOString(),
                };

                const patchResult = dispatch(
                    projectApi.util.updateQueryData(
                        "getTaskComments",
                        taskId,
                        (draft) => {
                            draft.data.unshift(temporaryComment);

                            draft.total += 1;
                        },
                    ),
                );

                try {
                    const { data } = await queryFulfilled;

                    dispatch(
                        projectApi.util.updateQueryData(
                            "getTaskComments",
                            taskId,
                            (draft) => {
                                const index = draft.data.findIndex(
                                    (comment) =>
                                        comment.id === temporaryComment.id,
                                );

                                if (index !== -1) {
                                    draft.data[index] = data;
                                }
                            },
                        ),
                    );
                } catch {
                    patchResult.undo();

                    console.error(
                        "Comment failed. Optimistic comment rolled back.",
                    );
                }
            },

            invalidatesTags: (_result, _error, { taskId }) => [
                {
                    type: "TaskActivity",
                    id: taskId,
                },
            ],
        }),

        // =========================
        // GET ACTIVITY
        // =========================

        getTaskActivity: builder.query<ActivityResponse, string>({
            query: (taskId) => ({
                url: `/tasks/${taskId}/activity`,
            }),

            providesTags: (_result, _error, taskId) => [
                {
                    type: "TaskActivity",
                    id: taskId,
                },
            ],
        }),
    }),
});

export const {
    useGetProjectsQuery,
    useGetProjectQuery,
    useGetProjectTasksQuery,
    useUpdateTaskMutation,
    useGetTaskCommentsQuery,
    useAddTaskCommentMutation,
    useGetTaskActivityQuery,
} = projectApi;

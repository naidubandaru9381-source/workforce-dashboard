import { http, HttpResponse, delay } from "msw";
import type {
  TaskComment,
  TaskActivity,
} from "@/types/task";
import { generateProjects, generateTasks } from "@/mocks/data/seed";
import { validateMockAccessToken } from "./auth.utils";

const projects = generateProjects(25);
const tasks = generateTasks(20000);
const comments: TaskComment[] = [];
const activities: TaskActivity[] = [];

export const projectHandlers = [
  // GET /projects
  http.get("/api/projects", async ({ request }) => {
    validateMockAccessToken(request.headers.get("authorization"));

    await delay(400);

    return HttpResponse.json({
      data: projects,
      total: projects.length,
    });
  }),

  // GET /projects/:id
  http.get("/api/projects/:id", async ({ params, request }) => {
    validateMockAccessToken(request.headers.get("authorization"));

    await delay(400);

    const project = projects.find(
      (item) => item.id === params.id,
    );

    if (!project) {
      return HttpResponse.json(
        {
          status: "error",
          message: "Project not found",
        },
        { status: 404 },
      );
    }

    return HttpResponse.json(project);
  }),

  // GET /projects/:id/tasks
  http.get("/api/projects/:id/tasks", async ({ params, request }) => {
    validateMockAccessToken(request.headers.get("authorization"));

    await delay(500);

    const projectId = String(params.id);

    const projectTasks = tasks.filter(
      (task) => task.projectId === projectId,
    );

    return HttpResponse.json({
      data: projectTasks,
      total: projectTasks.length,
    });
  }),

  // PATCH /tasks/:id
 // PATCH /tasks/:id
 // GET /tasks/:id/comments
http.get(
  "/api/tasks/:id/comments",
  async ({ params, request }) => {
    validateMockAccessToken(
      request.headers.get("authorization"),
    );

    await delay(300);

    const taskId = String(params.id);

    const taskComments = comments.filter(
      (comment) => comment.taskId === taskId,
    );

    return HttpResponse.json({
      data: taskComments,
      total: taskComments.length,
    });
  },
),
// POST /tasks/:id/comments
http.post(
  "/api/tasks/:id/comments",
  async ({ params, request }) => {
    validateMockAccessToken(
      request.headers.get("authorization"),
    );

    await delay(400);

    const taskId = String(params.id);

    const task = tasks.find(
      (item) => item.id === taskId,
    );

    if (!task) {
      return HttpResponse.json(
        {
          status: "error",
          message: "Task not found",
        },
        { status: 404 },
      );
    }

    const body = (await request.json()) as {
      content?: string;
    };

    if (!body.content?.trim()) {
      return HttpResponse.json(
        {
          status: "error",
          message: "Comment is required",
        },
        { status: 422 },
      );
    }

    const comment: TaskComment = {
      id: `comment-${Date.now()}`,
      taskId,
      userId: "user-001",
      userName: "Current User",
      content: body.content.trim(),
      createdAt: new Date().toISOString(),
    };

    comments.unshift(comment);

    const activity: TaskActivity = {
      id: `activity-${Date.now()}`,
      taskId,
      userId: "user-001",
      userName: "Current User",
      action: "comment_added",
      description: "Added a comment",
      createdAt: new Date().toISOString(),
    };

    activities.unshift(activity);

    return HttpResponse.json(comment, {
      status: 201,
    });
  },
),
// GET /tasks/:id/activity
http.get(
  "/api/tasks/:id/activity",
  async ({ params, request }) => {
    validateMockAccessToken(
      request.headers.get("authorization"),
    );

    await delay(300);

    const taskId = String(params.id);

    const taskActivities = activities.filter(
      (activity) => activity.taskId === taskId,
    );

    return HttpResponse.json({
      data: taskActivities,
      total: taskActivities.length,
    });
  },
),
http.patch("/api/tasks/:id", async ({ params, request }) => {
  validateMockAccessToken(request.headers.get("authorization"));

  await delay(500);

  const taskId = String(params.id);

  const task = tasks.find(
    (item) => item.id === taskId,
  );

  if (!task) {
    return HttpResponse.json(
      {
        status: "error",
        message: "Task not found",
      },
      { status: 404 },
    );
  }

  const body = (await request.json()) as {
    status?: string;
    title?: string;
    description?: string;
    priority?: string;
    assigneeId?: string;
    dueDate?: string;
  };

  // =====================================
  // CONTROLLED FAILURE FOR TESTING
  // =====================================

  if (taskId === "task-200") {
    return HttpResponse.json(
      {
        status: "error",
        message:
          "Task update failed. Simulated server conflict.",
      },
      { status: 409 },
    );
  }

  // =====================================
  // STATUS VALIDATION
  // =====================================

  if (body.status) {
    const allowedStatuses = [
      "todo",
      "in_progress",
      "in_review",
      "done",
    ];

    if (!allowedStatuses.includes(body.status)) {
      return HttpResponse.json(
        {
          status: "error",
          message: "Invalid task status",
        },
        { status: 422 },
      );
    }

    task.status = body.status as typeof task.status;
  }

  // =====================================
  // OTHER FIELDS
  // =====================================

  if (body.title !== undefined) {
    task.title = body.title;
  }

  if (body.description !== undefined) {
    task.description = body.description;
  }

  if (body.priority !== undefined) {
    task.priority =
      body.priority as typeof task.priority;
  }

  if (body.assigneeId !== undefined) {
    task.assigneeId = body.assigneeId;
  }

  if (body.dueDate !== undefined) {
    task.dueDate = body.dueDate;
  }

  task.updatedAt = new Date().toISOString();

  return HttpResponse.json(task);
}),
];
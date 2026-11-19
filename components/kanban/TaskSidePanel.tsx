"use client";

import { useState } from "react";

import {
  useAddTaskCommentMutation,
  useGetTaskActivityQuery,
  useGetTaskCommentsQuery,
} from "@/features/projects/projectApi";

import type { Task } from "@/types/task";

interface TaskSidePanelProps {
  task: Task | null;
  onClose: () => void;
}

export default function TaskSidePanel({
  task,
  onClose,
}: TaskSidePanelProps) {
  const [comment, setComment] = useState("");

  const {
    data: commentsData,
    isLoading: commentsLoading,
    isError: commentsError,
  } = useGetTaskCommentsQuery(
    task?.id ?? "",
    {
      skip: !task,
    },
  );

  const {
    data: activityData,
    isLoading: activityLoading,
    isError: activityError,
  } = useGetTaskActivityQuery(
    task?.id ?? "",
    {
      skip: !task,
    },
  );

  const [addTaskComment, { isLoading: isAddingComment }] =
    useAddTaskCommentMutation();

  if (!task) {
    return null;
  }

  const handleAddComment = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedComment = comment.trim();

    if (!trimmedComment) {
      return;
    }

    try {
      await addTaskComment({
        taskId: task.id,
        content: trimmedComment,
      }).unwrap();

      setComment("");
    } catch (error) {
      console.error(
        "Failed to add comment:",
        error,
      );
    }
  };

  return (
    <>
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close task details"
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-black/30"
      />

      {/* Side panel */}
      <aside
        aria-label="Task details"
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Task details
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              {task.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md px-3 py-2 text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Task information */}
          <section>
            <h3 className="text-sm font-semibold">
              Details
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {task.description ||
                "No description available."}
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-gray-500">
                  Status
                </p>

                <p className="mt-1 text-sm font-medium capitalize">
                  {task.status.replace(
                    "_",
                    " ",
                  )}
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs text-gray-500">
                  Priority
                </p>

                <p className="mt-1 text-sm font-medium capitalize">
                  {task.priority}
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs text-gray-500">
                  Assignee
                </p>

                <p className="mt-1 text-sm font-medium">
                  {task.assigneeId}
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs text-gray-500">
                  Due date
                </p>

                <p className="mt-1 text-sm font-medium">
                  {new Date(
                    task.dueDate,
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </section>

          {/* Comments */}
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                Comments
              </h3>

              <span className="text-xs text-gray-500">
                {commentsData?.total ?? 0}
              </span>
            </div>

            {/* Add comment */}
            <form
              onSubmit={handleAddComment}
              className="mt-3"
            >
              <label
                htmlFor="task-comment"
                className="sr-only"
              >
                Add a comment
              </label>

              <textarea
                id="task-comment"
                value={comment}
                onChange={(event) =>
                  setComment(event.target.value)
                }
                placeholder="Write a comment..."
                rows={3}
                className="w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={
                    isAddingComment ||
                    !comment.trim()
                  }
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAddingComment
                    ? "Adding..."
                    : "Add comment"}
                </button>
              </div>
            </form>

            {/* Comment list */}
            <div className="mt-4 space-y-3">
              {commentsLoading && (
                <p className="text-sm text-gray-500">
                  Loading comments...
                </p>
              )}

              {commentsError && (
                <p className="text-sm text-red-600">
                  Failed to load comments.
                </p>
              )}

              {!commentsLoading &&
                !commentsError &&
                commentsData?.data.length ===
                  0 && (
                  <p className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
                    No comments yet.
                  </p>
                )}

              {commentsData?.data.map(
                (item) => (
                  <article
                    key={item.id}
                    className="rounded-lg border p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">
                        {item.userName}
                      </p>

                      <time className="text-xs text-gray-500">
                        {new Date(
                          item.createdAt,
                        ).toLocaleString()}
                      </time>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                      {item.content}
                    </p>
                  </article>
                ),
              )}
            </div>
          </section>

          {/* Activity */}
          <section className="mt-8">
            <h3 className="text-sm font-semibold">
              Activity
            </h3>

            <div className="mt-4 space-y-3">
              {activityLoading && (
                <p className="text-sm text-gray-500">
                  Loading activity...
                </p>
              )}

              {activityError && (
                <p className="text-sm text-red-600">
                  Failed to load activity.
                </p>
              )}

              {!activityLoading &&
                !activityError &&
                activityData?.data.length ===
                  0 && (
                  <p className="text-sm text-gray-500">
                    No activity yet.
                  </p>
                )}

              {activityData?.data.map(
                (item) => (
                  <div
                    key={item.id}
                    className="border-l-2 border-gray-200 pl-4"
                  >
                    <p className="text-sm font-medium">
                      {item.description}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {item.userName} ·{" "}
                      {new Date(
                        item.createdAt,
                      ).toLocaleString()}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
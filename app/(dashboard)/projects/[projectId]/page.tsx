"use client";

import { useEffect, useState } from "react";
import Toast from "@/components/ui/Toast";
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { useParams } from "next/navigation";

import {
    useGetProjectQuery,
    useGetProjectTasksQuery,
    useUpdateTaskMutation,
} from "@/features/projects/projectApi";

import type { Task } from "@/types/task";

import KanbanColumn from "@/components/kanban/KanbanColumn";
import TaskSidePanel from "@/components/kanban/TaskSidePanel";

const columns: {
    status: Task["status"];
    title: string;
}[] = [
        {
            status: "todo",
            title: "To Do",
        },
        {
            status: "in_progress",
            title: "In Progress",
        },
        {
            status: "in_review",
            title: "In Review",
        },
        {
            status: "done",
            title: "Done",
        },
    ];

export default function ProjectDetailsPage() {
    const params = useParams();

    const projectId = String(params.projectId);

    // =========================
    // PROJECT API
    // =========================
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error" | "info";
    } | null>(null);

    const {
        data: project,
        isLoading: projectLoading,
        isError: projectError,
    } = useGetProjectQuery(projectId);

    // =========================
    // PAGE VISIBILITY
    // =========================

    const [isPageVisible, setIsPageVisible] =
        useState(true);

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsPageVisible(
                document.visibilityState === "visible",
            );
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange,
        );

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
        };
    }, []);

    // =========================
    // ACTIVE DRAGGED TASK
    // =========================

    const [activeTaskId, setActiveTaskId] =
        useState<string | null>(null);

    // =========================
    // TASKS API
    // =========================

    const {
        data: tasksData,
        isLoading: tasksLoading,
        isError: tasksError,
    } = useGetProjectTasksQuery(
        projectId,
        {
            pollingInterval: activeTaskId
                ? 0
                : 15000,

            skipPollingIfUnfocused: true,
        },
    );

    // =========================
    // UPDATE TASK
    // =========================

    const [updateTask] =
        useUpdateTaskMutation();

    // =========================
    // SELECTED TASK
    // =========================

    const [selectedTask, setSelectedTask] =
        useState<Task | null>(null);

    // =========================
    // DRAG SENSORS
    // =========================

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),

        useSensor(KeyboardSensor, {
            coordinateGetter:
                sortableKeyboardCoordinates,
        }),
    );

    // =========================
    // LOADING
    // =========================

    if (projectLoading || tasksLoading) {
        return (
            <main className="p-4 sm:p-6">
                <p>Loading project...</p>
            </main>
        );
    }

    // =========================
    // ERROR
    // =========================

    if (
        projectError ||
        tasksError ||
        !project ||
        !tasksData
    ) {
        return (
            <main className="p-4 sm:p-6">
                <p className="text-red-600">
                    Failed to load project.
                </p>
            </main>
        );
    }

    const displayedTasks = tasksData.data;

    // =========================
    // DRAG START
    // =========================

    const handleDragStart = (
        event: DragStartEvent,
    ) => {
        const taskId = String(event.active.id);

        setActiveTaskId(taskId);

        console.log(
            "Started dragging task:",
            taskId,
        );
    };

    // =========================
    // DRAG END
    // =========================

    const handleDragEnd = async (
        event: DragEndEvent,
    ) => {
        const { active, over } = event;

        /*
         * Polling can resume after the drag
         * has finished processing.
         */
        setActiveTaskId(null);

        if (!over) {
            return;
        }

        const taskId = String(active.id);
        const newStatus = String(over.id);

        // =========================
        // FIND TASK
        // =========================

        const task = displayedTasks.find(
            (item) => item.id === taskId,
        );

        if (!task) {
            console.log(
                "Task not found:",
                taskId,
            );

            return;
        }

        // =========================
        // VALIDATE DESTINATION
        // =========================

        const validStatuses = columns.map(
            (column) => column.status,
        );

        if (
            !validStatuses.includes(
                newStatus as Task["status"],
            )
        ) {
            console.log(
                "Invalid destination:",
                newStatus,
            );

            return;
        }

        // =========================
        // SAME COLUMN
        // =========================

        if (task.status === newStatus) {
            return;
        }

        console.log("Moving task:", {
            taskId,
            from: task.status,
            to: newStatus,
        });

        try {
            // =========================
            // OPTIMISTIC UPDATE
            // =========================

            await updateTask({
                id: task.id,
                projectId,
                data: {
                    status:
                        newStatus as Task["status"],
                },
            }).unwrap();

            console.log(
                "Task moved successfully",
            );
            setToast({
                message: "Task moved successfully.",
                type: "success",
            });
        } catch (error) {
            /*
             * RTK Query's onQueryStarted()
             * already rolls back the cache.
             */

            console.error(
                "Task move failed:",
                error,
            );
            setToast({
                message:
                    "Task move failed. The change was rolled back.",
                type: "error",
            });
            console.log(
                "Task move rolled back",
            );
        }
    };

    // =========================
    // DRAG CANCEL
    // =========================

    const handleDragCancel = () => {
        setActiveTaskId(null);

        console.log(
            "Task drag cancelled",
        );
    };

    return (
        <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
            {/* =========================
          PROJECT HEADER
          ========================= */}

            <div className="mb-6">
                <h1 className="text-2xl font-bold">
                    {project.name}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    {project.description}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>
                        Total tasks:{" "}
                        {displayedTasks.length}
                    </span>

                    <span
                        className={`rounded-full px-2 py-1 text-xs ${isPageVisible
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                    >
                        {isPageVisible
                            ? "Live updates"
                            : "Updates paused"}
                    </span>

                    {activeTaskId && (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                            Dragging task
                        </span>
                    )}
                </div>
            </div>

            {/* =========================
          KANBAN BOARD
          ========================= */}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div className="grid gap-4 lg:grid-cols-4">
                    {columns.map((column) => {
                        const columnTasks =
                            displayedTasks.filter(
                                (task) =>
                                    task.status ===
                                    column.status,
                            );

                        return (
                            <KanbanColumn
                                key={column.status}
                                status={column.status}
                                title={column.title}
                                tasks={columnTasks}
                                onOpenTask={setSelectedTask}
                            />
                        );
                    })}
                </div>
            </DndContext>

            {/* =========================
          TASK SIDE PANEL
          ========================= */}

            <TaskSidePanel
                task={selectedTask}
                onClose={() =>
                    setSelectedTask(null)
                }
            />
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </main>
    );
}
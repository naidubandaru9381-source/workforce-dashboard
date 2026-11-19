"use client";

import { useDroppable } from "@dnd-kit/core";

import type { Task } from "@/types/task";

import TaskCard from "./TaskCard";

interface KanbanColumnProps {
  status: Task["status"];
  title: string;
  tasks: Task[];
  onOpenTask: (task: Task) => void;
}

export default function KanbanColumn({
  status,
  title,
  tasks,
  onOpenTask,
}: KanbanColumnProps) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: status,
  });

  return (
    <section
      ref={setNodeRef}
      aria-label={`${title} tasks`}
      className={`min-h-[500px] rounded-lg p-3 transition ${
        isOver
          ? "bg-blue-50 ring-2 ring-blue-300"
          : "bg-gray-100"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">
          {title}
        </h2>

        <span className="rounded-full bg-white px-2 py-1 text-xs text-gray-600">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onOpen={onOpenTask}
          />
        ))}
      </div>
    </section>
  );
}
"use client";

import {
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import type { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onOpen: (task: Task) => void;
}

export default function TaskCard({
  task,
  onOpen,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(
      transform,
    ),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          onOpen(task);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open task ${task.title}`}
      className="cursor-pointer touch-none rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md active:cursor-grabbing"
    >
      <h3 className="font-medium">
        {task.title}
      </h3>

      <p className="mt-2 text-sm text-gray-600">
        {task.description}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-gray-500">
        <span className="capitalize">
          {task.priority}
        </span>

        <span>
          {task.assigneeId}
        </span>
      </div>
    </article>
  );
}
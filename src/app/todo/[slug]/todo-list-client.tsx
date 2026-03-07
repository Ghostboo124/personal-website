"use client";

import { useMutation, useQuery } from "convex/react";
import {
  Archive,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Plus,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

interface TodoListClientProps {
  userId: Id<"users">;
  viewerUserId?: Id<"users">;
  isOwner: boolean;
  isTodoPublic: boolean;
  sessionToken?: string;
}

export function TodoListClient({
  userId,
  viewerUserId,
  isOwner,
  isTodoPublic: initialIsTodoPublic,
  sessionToken,
}: TodoListClientProps) {
  const router = useRouter();
  const tasksResult = useQuery(api.todo.getbyUserId, { userId, viewerUserId });
  const toggleTask = useMutation(api.todo.toggleTask);
  const archiveTask = useMutation(api.todo.archiveTask);
  const deleteTask = useMutation(api.todo.deleteTask);
  const createTask = useMutation(api.todo.createTask);
  const toggleVisibility = useMutation(api.todo.toggleTodoVisibility);

  const [showArchived, setShowArchived] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [isTodoPublic, setIsTodoPublic] = useState(initialIsTodoPublic);

  const handleCreateTask = async () => {
    if (!newTaskText.trim()) return;

    await createTask({ taskText: newTaskText, userId, sessionToken });
    setNewTaskText("");
    setIsCreating(false);
  };

  const handleToggleVisibility = async () => {
    const result = await toggleVisibility({ userId, sessionToken });
    if (result.ok && result.isTodoPublic !== undefined) {
      setIsTodoPublic(result.isTodoPublic);
      router.refresh();
    }
  };

  if (!tasksResult) {
    return (
      <div className="flex flex-1 w-full items-center justify-center">
        <p className="text-ctp-subtext0">Loading tasks...</p>
      </div>
    );
  }

  if (tasksResult.isPrivate) {
    return (
      <div className="flex flex-1 w-full items-center justify-center">
        <p className="text-ctp-subtext0">This todo list is private</p>
      </div>
    );
  }

  const tasks = tasksResult.tasks ?? [];
  const activeTasks = tasks.filter((t) => !t.isArchived);
  const archivedTasks = tasks.filter((t) => t.isArchived);
  const displayedTasks = showArchived ? archivedTasks : activeTasks;

  return (
    <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left text-ctp-text self-center w-full">
      {/* Action Buttons */}
      <div className="flex gap-2 w-full justify-between flex-wrap">
        <div className="flex gap-2">
          {isOwner && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-ctp-green text-ctp-base rounded-lg hover:bg-ctp-green/80 transition-colors font-semibold"
              type="button"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          )}

          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 px-4 py-2 bg-ctp-surface1 text-ctp-text rounded-lg hover:bg-ctp-surface2 transition-colors"
            type="button"
          >
            <Archive className="w-4 h-4" />
            {showArchived
              ? "Show Active"
              : `Show Archived (${archivedTasks.length})`}
          </button>
        </div>

        {isOwner && (
          <button
            onClick={handleToggleVisibility}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isTodoPublic
                ? "bg-ctp-blue text-ctp-base hover:bg-ctp-blue/80"
                : "bg-ctp-surface1 text-ctp-text hover:bg-ctp-surface2"
            }`}
            type="button"
            title={isTodoPublic ? "Make private" : "Make public"}
          >
            {isTodoPublic ? (
              <>
                <Eye className="w-4 h-4" />
                Public
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                Private
              </>
            )}
          </button>
        )}
      </div>

      {/* New Task Input */}
      {isCreating && isOwner && (
        <div className="w-full bg-ctp-surface0 rounded-lg p-4 border border-ctp-surface1">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
              placeholder="Enter task description..."
              className="flex-1 px-3 py-2 bg-ctp-surface1 text-ctp-text rounded border border-ctp-surface2 focus:outline-none focus:border-ctp-green"
              // biome-ignore lint/a11y/noAutofocus: intentional for UX
              autoFocus
            />
            <button
              onClick={handleCreateTask}
              className="px-4 py-2 bg-ctp-green text-ctp-base rounded hover:bg-ctp-green/80 transition-colors font-semibold"
              type="button"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewTaskText("");
              }}
              className="px-3 py-2 bg-ctp-surface1 text-ctp-text rounded hover:bg-ctp-surface2 transition-colors"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <div className="bg-ctp-surface0 rounded-lg shadow-lg overflow-hidden border border-ctp-surface1 w-full">
        <table className="w-full">
          <thead className="bg-ctp-surface1">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-ctp-subtext1 uppercase tracking-wider w-16">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-ctp-subtext1 uppercase tracking-wider">
                Task
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-ctp-subtext1 uppercase tracking-wider w-48">
                Created
              </th>
              {isOwner &&
                (showArchived ? (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-ctp-subtext1 uppercase tracking-wider w-24">
                    Delete
                  </th>
                ) : (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-ctp-subtext1 uppercase tracking-wider w-24">
                    Archive
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ctp-surface1">
            {displayedTasks.map((task) => (
              <tr
                key={task._id}
                className="hover:bg-ctp-surface1/50 transition-colors"
              >
                <td className="px-6 py-4">
                  {isOwner ? (
                    <button
                      onClick={() =>
                        toggleTask({ taskId: task._id, sessionToken })
                      }
                      className="flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer"
                      type="button"
                      disabled={showArchived}
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-ctp-green" />
                      ) : (
                        <Circle className="w-6 h-6 text-ctp-overlay0" />
                      )}
                    </button>
                  ) : task.isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-ctp-green" />
                  ) : (
                    <Circle className="w-6 h-6 text-ctp-overlay0" />
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-sm ${task.isCompleted ? "text-ctp-overlay2 line-through" : "text-ctp-text"}`}
                  >
                    {task.text}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-ctp-subtext0">
                    {new Date(task._creationTime).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </td>
                {isOwner &&
                  (showArchived ? (
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          deleteTask({ taskId: task._id, sessionToken })
                        }
                        className="flex items-center justify-center transition-opacity hover:opacity-70 cursor-pointer text-ctp-red"
                        type="button"
                        title="Delete task"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </td>
                  ) : (
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          archiveTask({ taskId: task._id, sessionToken })
                        }
                        disabled={!task.isCompleted}
                        className={`flex items-center justify-center transition-opacity ${
                          task.isCompleted
                            ? "hover:opacity-70 cursor-pointer text-ctp-yellow"
                            : "opacity-30 cursor-not-allowed text-ctp-overlay0"
                        }`}
                        type="button"
                        title={
                          task.isCompleted
                            ? "Archive task"
                            : "Complete task first"
                        }
                      >
                        <Archive className="w-5 h-5" />
                      </button>
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>

        {displayedTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-ctp-subtext0">
              {showArchived ? "No archived tasks" : "No tasks yet"}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      {!showArchived && (
        <div className="mt-4 text-sm text-ctp-subtext0 self-center">
          <span className="font-semibold text-ctp-text">
            {activeTasks.filter((t) => t.isCompleted).length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-ctp-text">
            {activeTasks.length}
          </span>{" "}
          tasks completed
        </div>
      )}
    </div>
  );
}

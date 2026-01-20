"use client";

import { useMutation, useQuery } from "convex/react";
import { Archive, CheckCircle2, Circle, Plus, X } from "lucide-react";
import { useState } from "react";
import { Footer } from "@/components/footer";
import { Titlebar } from "@/components/titlebar";
import { api } from "../../../convex/_generated/api";

export default function Todo() {
  const tasks = useQuery(api.tasks.get);
  const toggleTask = useMutation(api.tasks.toggleTask);
  const archiveTask = useMutation(api.tasks.archiveTask);
  const createTask = useMutation(api.tasks.createTask);

  const [showArchived, setShowArchived] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");

  const handleCreateTask = async () => {
    if (!newTaskText.trim()) return;

    await createTask({ taskText: newTaskText });
    setNewTaskText("");
    setIsCreating(false);
  };

  if (tasks === undefined) {
    return (
      <div className="dark frappe flex flex-col min-h-screen items-center justify-center font-sans bg-ctp-base">
        <Titlebar />
        <main className="flex flex-1 overflow-auto w-full max-w-3xl flex-col items-center justify-center">
          <p className="text-ctp-text">Loading tasks...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const activeTasks = tasks.filter((t) => !t.isArchived);
  const archivedTasks = tasks.filter((t) => t.isArchived);
  const displayedTasks = showArchived ? archivedTasks : activeTasks;

  return (
    <div className="dark frappe flex flex-col min-h-screen items-center justify-center font-sans bg-ctp-base">
      <Titlebar />
      <main className="flex flex-1 overflow-auto w-full max-w-3xl flex-col items-center justify-center py-4 px-16 bg-ctp-base sm:items-start">
        <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left text-ctp-text self-center w-full">
          {/* Action Buttons */}
          <div className="flex gap-2 w-full justify-between">
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-ctp-green text-ctp-base rounded-lg hover:bg-ctp-green/80 transition-colors font-semibold"
              type="button"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>

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

          {/* New Task Input */}
          {isCreating && (
            <div className="w-full bg-ctp-surface0 rounded-lg p-4 border border-ctp-surface1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
                  placeholder="Enter task description..."
                  className="flex-1 px-3 py-2 bg-ctp-surface1 text-ctp-text rounded border border-ctp-surface2 focus:outline-none focus:border-ctp-green"
                  // biome-ignore lint/a11y/noAutofocus: false
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
                  {!showArchived && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-ctp-subtext1 uppercase tracking-wider w-24">
                      Archive
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-ctp-surface1">
                {displayedTasks.map((task) => (
                  <tr
                    key={task._id}
                    className="hover:bg-ctp-surface1/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleTask({ taskId: task._id })}
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
                        {new Date(task._creationTime).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </td>
                    {!showArchived && (
                      <td className="px-6 py-4">
                        <button
                          onClick={() => archiveTask({ taskId: task._id })}
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
                    )}
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
      </main>
      <Footer />
    </div>
  );
}

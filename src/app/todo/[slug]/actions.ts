"use server";

import { fetchMutation } from "convex/nextjs";
import { cookies } from "next/headers";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export async function serverToggleTask(
  taskId: Id<"todo_list">,
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionId")?.value;

  if (!sessionToken) {
    return { ok: false, error: "Session token not found" };
  }

  const result = await fetchMutation(api.todo.toggleTask, {
    taskId,
    sessionToken,
  });

  return result;
}

export async function serverCreateTask(
  taskText: string,
  userId: Id<"users">,
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionId")?.value;

  if (!sessionToken) {
    return { ok: false, error: "Session token not found" };
  }

  const result = await fetchMutation(api.todo.createTask, {
    taskText,
    userId,
    sessionToken,
  });

  return result;
}

export async function serverArchiveTask(
  taskId: Id<"todo_list">,
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionId")?.value;

  if (!sessionToken) {
    return { ok: false, error: "Session token not found" };
  }

  const result = await fetchMutation(api.todo.archiveTask, {
    taskId,
    sessionToken,
  });

  return result;
}

export async function serverDeleteTask(
  taskId: Id<"todo_list">,
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionId")?.value;

  if (!sessionToken) {
    return { ok: false, error: "Session token not found" };
  }

  const result = await fetchMutation(api.todo.deleteTask, {
    taskId,
    sessionToken,
  });

  return result;
}

export async function serverToggleTodoVisibility(
  userId: Id<"users">,
): Promise<{ ok: boolean; isTodoPublic?: boolean; error?: string }> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionId")?.value;

  if (!sessionToken) {
    return { ok: false, error: "Session token not found" };
  }

  const result = await fetchMutation(api.todo.toggleTodoVisibility, {
    userId,
    sessionToken,
  });

  return result;
}

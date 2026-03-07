import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUserId, verifyUserOwnership } from "./auth";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("todo_list").collect();
  },
});

export const getbyUserId = query({
  args: { userId: v.id("users"), viewerUserId: v.optional(v.id("users")) },
  handler: async (
    ctx,
    { userId, viewerUserId },
  ): Promise<{
    ok: boolean;
    tasks?: Doc<"todo_list">[];
    isPrivate?: boolean;
  }> => {
    const user = await ctx.db.get(userId);

    if (!user) {
      return { ok: false };
    }

    const isTodoPublic = user.isTodoPublic ?? true;
    const isOwner = viewerUserId === userId;

    if (!isTodoPublic && !isOwner) {
      return { ok: true, tasks: [], isPrivate: true };
    }

    const tasks = await ctx.db
      .query("todo_list")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    return { ok: true, tasks, isPrivate: false };
  },
});

export const toggleTask = mutation({
  args: { taskId: v.id("todo_list"), sessionToken: v.string() },
  handler: async (
    ctx,
    { taskId, sessionToken },
  ): Promise<{ ok: boolean; error?: string }> => {
    const userId = await getAuthenticatedUserId(ctx, sessionToken);
    if (!userId) {
      return { ok: false, error: "Unauthorized" };
    }

    const task = await ctx.db.get(taskId);

    if (!task) {
      return { ok: false, error: "Task could not be found" };
    }

    if (task.userId !== userId) {
      return { ok: false, error: "Unauthorized" };
    }

    await ctx.db.patch(taskId, { isCompleted: !task.isCompleted });
    return { ok: true };
  },
});

export const createTask = mutation({
  args: { taskText: v.string(), userId: v.id("users"), sessionToken: v.string() },
  handler: async (
    ctx,
    { taskText, userId, sessionToken },
  ): Promise<{ ok: boolean; taskId?: Id<"todo_list">; error?: string }> => {
    const isOwner = await verifyUserOwnership(ctx, sessionToken, userId);
    if (!isOwner) {
      return { ok: false, error: "Unauthorized" };
    }

    const taskId = await ctx.db.insert("todo_list", {
      text: taskText,
      isCompleted: false,
      isArchived: false,
      userId,
    });

    return { ok: true, taskId };
  },
});

export const archiveTask = mutation({
  args: { taskId: v.id("todo_list"), sessionToken: v.string() },
  handler: async (
    ctx,
    { taskId, sessionToken },
  ): Promise<{ ok: boolean; error?: string }> => {
    const userId = await getAuthenticatedUserId(ctx, sessionToken);
    if (!userId) {
      return { ok: false, error: "Unauthorized" };
    }

    const task = await ctx.db.get(taskId);

    if (!task) {
      return { ok: false, error: "Task could not be found" };
    }

    if (task.userId !== userId) {
      return { ok: false, error: "Unauthorized" };
    }

    if (task.isArchived) {
      return { ok: false, error: "Task is already archived" };
    }

    await ctx.db.patch(taskId, { isArchived: true });

    return { ok: true };
  },
});

export const deleteTask = mutation({
  args: { taskId: v.id("todo_list"), sessionToken: v.string() },
  handler: async (
    ctx,
    { taskId, sessionToken },
  ): Promise<{ ok: boolean; error?: string }> => {
    const userId = await getAuthenticatedUserId(ctx, sessionToken);
    if (!userId) {
      return { ok: false, error: "Unauthorized" };
    }

    const task = await ctx.db.get(taskId);

    if (!task) {
      return { ok: false, error: "Task could not be found" };
    }

    if (task.userId !== userId) {
      return { ok: false, error: "Unauthorized" };
    }

    if (!task.isArchived) {
      return { ok: false, error: "Task is not archived, could not delete" };
    }

    await ctx.db.delete(taskId);

    return { ok: true };
  },
});

export const toggleTodoVisibility = mutation({
  args: { userId: v.id("users"), sessionToken: v.string() },
  handler: async (
    ctx,
    { userId, sessionToken },
  ): Promise<{ ok: boolean; isTodoPublic?: boolean; error?: string }> => {
    const isOwner = await verifyUserOwnership(ctx, sessionToken, userId);
    if (!isOwner) {
      return { ok: false, error: "Unauthorized" };
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      return { ok: false, error: "User not found" };
    }

    const currentVisibility = user.isTodoPublic ?? true;
    const newVisibility = !currentVisibility;

    await ctx.db.patch(userId, { isTodoPublic: newVisibility });

    return { ok: true, isTodoPublic: newVisibility };
  },
});

export const getTodoVisibility = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }): Promise<boolean> => {
    const user = await ctx.db.get(userId);
    return user?.isTodoPublic ?? true;
  },
});

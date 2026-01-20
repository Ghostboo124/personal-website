import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("todo_list").collect();
  },
});

export const toggleTask = mutation({
  args: { taskId: v.id("todo_list") },
  handler: async (
    ctx,
    { taskId },
  ): Promise<{ ok: boolean; error?: string }> => {
    const task = await ctx.db.get(taskId);

    if (!task) {
      return { ok: false, error: "Task could not be found" }; // TODO: Proper logging for errors
    }

    await ctx.db.patch(taskId, { isCompleted: !task.isCompleted });
    return { ok: true };
  },
});

export const createTask = mutation({
  args: { taskText: v.string() },
  handler: async (
    ctx,
    { taskText },
  ): Promise<{ ok: boolean; taskId?: Id<"todo_list">; error?: string }> => {
    await ctx.db.insert("todo_list", {
      text: taskText,
      isCompleted: false,
      isArchived: false,
    });
    return { ok: true };
  },
});

export const archiveTask = mutation({
  args: { taskId: v.id("todo_list") },
  handler: async (
    ctx,
    { taskId },
  ): Promise<{ ok: boolean; error?: string }> => {
    const task = await ctx.db.get(taskId);

    if (!task) {
      return { ok: false, error: "Task could not be found" }; // TODO: Proper logging for errors
    }

    if (task.isArchived) {
      return { ok: false, error: "Task is already archived" }; // TODO: Proper logging for errors
    }

    await ctx.db.patch(taskId, { isArchived: true });

    return { ok: true };
  },
});

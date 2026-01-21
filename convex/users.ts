import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const updateUser = mutation({
  args: {
    username: v.string(),
    name: v.string(),
    email: v.string(),
    oauth_method: v.string(),
  },
  handler: async (
    ctx,
    { username, name, email, oauth_method },
  ): Promise<{ ok: boolean; userId?: Id<"users">; error?: string }> => {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (existingUser) {
      const oauth_methods = existingUser.oauth_methods;

      if (!oauth_method.includes(oauth_method)) {
        oauth_methods.push(oauth_method);
      }

      await ctx.db.patch(existingUser._id, {
        name,
        username,
        oauth_methods,
        updated_at: Date.now(),
      });

      return { ok: true, userId: existingUser._id };
    }

    // Check if username is taken
    const username_db = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (username_db) {
      return { ok: false, error: "Username already exists" };
    }

    const userId = await ctx.db.insert("users", {
      username,
      name,
      email: normalizedEmail,
      oauth_methods: [oauth_method],
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    return { ok: true, userId };
  },
});

export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (
    ctx,
    { userId },
  ): Promise<{ ok: boolean; error?: string }> => {
    const user = await ctx.db.get(userId);

    if (!user) {
      return { ok: false, error: "Task could not be found" };
    }

    await ctx.db.delete(userId);

    return { ok: true };
  },
});

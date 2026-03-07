import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { verifyUserOwnership } from "./auth";

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (
    ctx,
    { userId },
  ): Promise<{ ok: boolean; error?: string; user?: Doc<"users"> }> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", userId))
      .first();

    if (!user) {
      return { ok: false, error: "Could not find user" };
    }

    return { ok: true, user };
  },
});

export const updateUser = mutation({
  args: {
    username: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    oauth_method: v.string(),
  },
  handler: async (
    ctx,
    { username, name, email, oauth_method },
  ): Promise<{ ok: boolean; userId?: Id<"users">; error?: string }> => {
    let existingUser = null;

    // Try to find user by email if provided
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
        .first();
    }

    // If not found by email, try to find by username
    if (!existingUser) {
      existingUser = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", username))
        .first();
    }

    if (existingUser) {
      const oauth_methods = existingUser.oauth_methods;

      if (!oauth_methods.includes(oauth_method)) {
        oauth_methods.push(oauth_method);
      }

      await ctx.db.patch(existingUser._id, {
        oauth_methods,
        updated_at: Date.now(),
      });

      return { ok: true, userId: existingUser._id };
    }

    // Check if username is taken by another user
    const username_db = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (username_db) {
      return { ok: false, error: "Username already exists" };
    }

    const normalizedEmail = email
      ? email.toLowerCase().trim()
      : `${username}@www.lexy.boo`;

    const userId = await ctx.db.insert("users", {
      username,
      name: name,
      email: normalizedEmail,
      oauth_methods: [oauth_method],
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    return { ok: true, userId };
  },
});

export const getUserIdByUsername = query({
  args: { username: v.string() },
  handler: async (
    ctx,
    { username },
  ): Promise<{ ok: boolean; error?: string; userId?: Id<"users"> }> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (!user) {
      return { ok: false, error: "Could not find user with that username" };
    }

    return { ok: true, userId: user._id };
  },
});

export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    username: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { userId, username, name, email, sessionToken },
  ): Promise<{ ok: boolean; error?: string }> => {
    if (sessionToken) {
      const isOwner = await verifyUserOwnership(ctx, sessionToken, userId);
      if (!isOwner) {
        return { ok: false, error: "Unauthorized" };
      }
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      return { ok: false, error: "User not found" };
    }

    const updates: Partial<{
      username: string;
      name: string;
      email: string;
      updated_at: number;
    }> = {
      updated_at: Date.now(),
    };

    if (username !== undefined && username !== user.username) {
      const existingUsername = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", username))
        .first();

      if (existingUsername && existingUsername._id !== userId) {
        return { ok: false, error: "Username already taken" };
      }
      updates.username = username;
    }

    if (name !== undefined) {
      updates.name = name;
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== user.email) {
        const existingEmail = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
          .first();

        if (existingEmail && existingEmail._id !== userId) {
          return { ok: false, error: "Email already in use" };
        }
        updates.email = normalizedEmail;
      }
    }

    await ctx.db.patch(userId, updates);

    return { ok: true };
  },
});

export const deleteUser = mutation({
  args: { userId: v.id("users"), sessionToken: v.optional(v.string()) },
  handler: async (
    ctx,
    { userId, sessionToken },
  ): Promise<{ ok: boolean; error?: string }> => {
    if (sessionToken) {
      const isOwner = await verifyUserOwnership(ctx, sessionToken, userId);
      if (!isOwner) {
        return { ok: false, error: "Unauthorized" };
      }
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      return { ok: false, error: "User not found" };
    }

    await ctx.db.delete(userId);

    return { ok: true };
  },
});

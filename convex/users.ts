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

/**
 * Creates or updates a user during OAuth login.
 * Does NOT auto-link to existing users by email/username to prevent account takeover.
 * Always checks if OAuth method already exists on the user before adding it.
 */
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
  ): Promise<{
    ok: boolean;
    userId?: Id<"users">;
    error?: string;
    linkedMethods?: string[];
  }> => {
    // Only link to existing user if they already have this OAuth method
    // This ensures we don't auto-link to unverified accounts
    let existingUser = null;

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
        .first();

      // If found by email, verify they already have this OAuth method
      // If not, this is a different user and we should not link
      if (existingUser && !existingUser.oauth_methods.includes(oauth_method)) {
        existingUser = null;
      }
    }

    // If still not found, check by username AND oauth_method combination
    if (!existingUser) {
      const userByUsername = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", username))
        .first();

      if (userByUsername?.oauth_methods.includes(oauth_method)) {
        existingUser = userByUsername;
      }
    }

    // Update existing user if they already use this OAuth method
    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name,
        email: email ? email.toLowerCase().trim() : existingUser.email,
        updated_at: Date.now(),
      });

      return { ok: true, userId: existingUser._id };
    }

    // Prevent account takeover by not allowing new OAuth method to link to existing account
    // Check if email is already registered with a different OAuth method
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const emailExists = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
        .first();

      if (emailExists) {
        return {
          ok: false,
          error: "account_exists_with_different_method",
          linkedMethods: emailExists.oauth_methods,
          userId: emailExists._id,
        };
      }
    }

    // Check if username is taken
    const username_db = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (username_db) {
      return { ok: false, error: "Username already exists" };
    }

    // Create new user
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

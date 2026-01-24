import { v } from "convex/values";
import { uuidv7 } from "uuidv7";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const auth = mutation({
  args: { userId: v.id("users"), ipAddress: v.string(), userAgent: v.string() },
  handler: async (
    ctx,
    { userId, ipAddress, userAgent },
  ): Promise<{ ok: boolean; error?: string; token?: string }> => {
    const userInfo = await ctx.db.get(userId);

    if (!userInfo) {
      return { ok: false, error: "User could not be found" };
    }

    const oldSession = await ctx.db
      .query("sessions")
      .withIndex("by_info", (q) =>
        q
          .eq("userAgent", userAgent)
          .eq("ipAddress", ipAddress)
          .eq("userId", userId),
      )
      .first();

    const token: string = uuidv7();

    if (oldSession) {
      await ctx.db.patch("sessions", oldSession._id, {
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        token,
      });

      return { ok: true, token };
    }

    await ctx.db.insert("sessions", {
      token,
      userId,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      ipAddress,
      userAgent,
    });

    return { ok: true, token };
  },
});

export const checkAuthStatus = query({
  args: {
    sessionToken: v.string(),
    ipAddress: v.string(),
    userAgent: v.string(),
  },
  handler: async (
    ctx,
    { sessionToken, ipAddress, userAgent },
  ): Promise<{
    ok: boolean;
    reauthNeeded: boolean;
    error?: string;
    userId?: string;
  }> => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", sessionToken))
      .first();

    if (!session) {
      return {
        ok: false,
        reauthNeeded: true,
        error: "Could not find session with that session token",
      };
    }

    if (session.expiresAt < Date.now()) {
      return {
        ok: false,
        reauthNeeded: true,
        error: "Session has expired",
      };
    }

    if (session.ipAddress !== ipAddress || session.userAgent !== userAgent) {
      return {
        ok: false,
        reauthNeeded: false,
        error: "IP Address or User Agent is different to stored ones",
      };
    }

    return { ok: true, reauthNeeded: false, userId: session.userId };
  },
});

export const getUserSessions = query({
  args: { userId: v.string() },
  handler: async (
    ctx,
    { userId },
  ): Promise<{ ok: boolean; error?: string; sessions?: Doc<"sessions">[] }> => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_uid", (q) => q.eq("userId", userId))
      .collect();

    return { ok: true, sessions };
  },
});

export const revokeSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (
    ctx,
    { sessionId },
  ): Promise<{ ok: boolean; error?: string }> => {
    const session = await ctx.db.get(sessionId);

    if (!session) {
      return { ok: false, error: "Session not found" };
    }

    await ctx.db.delete(sessionId);

    return { ok: true };
  },
});

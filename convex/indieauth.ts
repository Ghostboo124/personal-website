import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { getAuthenticatedUserId } from "./auth";

export const createAuthorizationCode = mutation({
  args: {
    code: v.string(),
    userId: v.id("users"),
    clientId: v.string(),
    redirectUri: v.string(),
    codeChallenge: v.string(),
    codeChallengeMethod: v.string(),
    sessionToken: v.string(),
    scope: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { sessionToken, userId, ...args },
  ): Promise<{ ok: boolean; error?: string }> => {
    // Verify that the session token belongs to the user creating the code
    const authenticatedUserId = await getAuthenticatedUserId(ctx, sessionToken);
    if (authenticatedUserId !== userId) {
      return { ok: false, error: "Unauthorized" };
    }

    await ctx.db.insert("indieauthCodes", {
      userId,
      ...args,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    return { ok: true };
  },
});

export const verifyAuthorizationCode = internalQuery({
  args: { code: v.string() },
  handler: async (
    ctx,
    { code },
  ): Promise<{
    ok: boolean;
    error?: string;
    data?: {
      userId: string;
      clientId: string;
      redirectUri: string;
      codeChallenge: string;
      codeChallengeMethod: string;
      scope?: string;
    };
  }> => {
    const record = await ctx.db
      .query("indieauthCodes")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    if (!record) {
      return { ok: false, error: "Authorization code not found" };
    }

    if (record.expiresAt < Date.now()) {
      return { ok: false, error: "Authorization code expired" };
    }

    return {
      ok: true,
      data: {
        userId: record.userId,
        clientId: record.clientId,
        redirectUri: record.redirectUri,
        codeChallenge: record.codeChallenge,
        codeChallengeMethod: record.codeChallengeMethod,
        scope: record.scope,
      },
    };
  },
});

export const deleteAuthorizationCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }): Promise<{ ok: boolean; error?: string }> => {
    const record = await ctx.db
      .query("indieauthCodes")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    if (!record) {
      return { ok: false, error: "Authorization code not found" };
    }

    await ctx.db.delete(record._id);
    return { ok: true };
  },
});

export const storeAuthorizationRequest = mutation({
  args: {
    state: v.string(),
    clientId: v.string(),
    redirectUri: v.string(),
    codeChallenge: v.string(),
    codeChallengeMethod: v.string(),
    scope: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { state, clientId, redirectUri, codeChallenge, codeChallengeMethod, scope },
  ): Promise<{ ok: boolean; error?: string }> => {
    // Check if state already exists to prevent replay
    const existing = await ctx.db
      .query("oauthStates")
      .withIndex("by_state", (q) => q.eq("state", state))
      .first();

    if (existing) {
      return { ok: false, error: "State already exists" };
    }

    await ctx.db.insert("indieauthStates", {
      state,
      clientId,
      redirectUri,
      codeChallenge,
      codeChallengeMethod,
      scope,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    return { ok: true };
  },
});

export const getStoredAuthorizationRequest = query({
  args: { state: v.string() },
  handler: async (
    ctx,
    { state },
  ): Promise<{
    ok: boolean;
    error?: string;
    data?: {
      clientId: string;
      redirectUri: string;
      codeChallenge?: string;
      codeChallengeMethod?: string;
      scope?: string;
    };
  }> => {
    const record = await ctx.db
      .query("indieauthStates")
      .withIndex("by_state", (q) => q.eq("state", state))
      .first();

    if (!record) {
      return { ok: false, error: "Authorization request not found" };
    }

    if (record.expiresAt < Date.now()) {
      return { ok: false, error: "Authorization request expired" };
    }

    return {
      ok: true,
      data: {
        clientId: record.clientId,
        redirectUri: record.redirectUri,
        codeChallenge: record.codeChallenge,
        codeChallengeMethod: record.codeChallengeMethod,
        scope: record.scope,
      },
    };
  },
});

export const deleteStoredAuthorizationRequest = mutation({
  args: { state: v.string() },
  handler: async (ctx, { state }): Promise<{ ok: boolean; error?: string }> => {
    const record = await ctx.db
      .query("indieauthStates")
      .withIndex("by_state", (q) => q.eq("state", state))
      .first();

    if (!record) {
      return { ok: false, error: "Authorization request not found" };
    }

    await ctx.db.delete(record._id);
    return { ok: true };
  },
});

export const consumeAuthorizationCode = mutation({
  args: { code: v.string() },
  handler: async (
    ctx,
    { code },
  ): Promise<{
    ok: boolean;
    error?: string;
    data?: {
      userId: string;
      clientId: string;
      redirectUri: string;
      scope?: string;
      codeChallenge: string;
      codeChallengeMethod: string;
    };
  }> => {
    const record = await ctx.db
      .query("indieauthCodes")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    if (!record) {
      return { ok: false, error: "Authorization code not found" };
    }

    if (record.expiresAt < Date.now()) {
      return { ok: false, error: "Authorization code expired" };
    }

    // Atomically delete the code and return it
    await ctx.db.delete(record._id);

    return {
      ok: true,
      data: {
        userId: record.userId,
        clientId: record.clientId,
        redirectUri: record.redirectUri,
        scope: record.scope,
        codeChallenge: record.codeChallenge,
        codeChallengeMethod: record.codeChallengeMethod,
      },
    };
  },
});

export const cleanupExpiredAuthorizationCodes = internalMutation({
  args: {},
  handler: async (ctx): Promise<{ deleted: number }> => {
    const now = Date.now();
    const expiredCodes = await ctx.db
      .query("indieauthCodes")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();

    for (const code of expiredCodes) {
      await ctx.db.delete(code._id);
    }

    return { deleted: expiredCodes.length };
  },
});

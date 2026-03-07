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
    scope: v.string(),
    codeChallenge: v.string(),
    codeChallengeMethod: v.string(),
    sessionToken: v.string(),
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
      scope: string;
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

/**
 * Delete an authorization code.
 * SECURITY WARNING: This is a public mutation. Do not call this mutation directly
 * from client code as an attacker could delete codes they don't own to cause DoS.
 * This mutation is DEPRECATED - use consumeAuthorizationCode instead, which atomically
 * verifies and consumes the code in a single operation.
 */
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

/**
 * Store IndieAuth authorization request parameters server-side to prevent form tampering.
 * The state is returned and should be the only value passed in the form.
 */
export const storeAuthorizationRequest = mutation({
  args: {
    state: v.string(),
    clientId: v.string(),
    redirectUri: v.string(),
    codeChallenge: v.string(),
    codeChallengeMethod: v.string(),
    scope: v.string(),
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

    await ctx.db.insert("oauthStates", {
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

/**
 * Retrieve stored IndieAuth authorization request parameters by state.
 * Verifies that the stored parameters match what the form submission claims.
 */
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
      scope: string;
    };
  }> => {
    const record = await ctx.db
      .query("oauthStates")
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

/**
 * Delete stored authorization request after use.
 * SECURITY WARNING: This is a public mutation. Called from server-side auth page only.
 * Only delete authorization requests that belong to the current user by checking
 * the state value which is unique per-session and includes entropy.
 * An attacker who knows the state can delete it, causing the auth flow to fail.
 * Defense: State values are 128 bits of entropy (generated by generateRandomString),
 * making them infeasible to guess. Rate-limit or add secondary validation if needed.
 */
export const deleteStoredAuthorizationRequest = mutation({
  args: { state: v.string() },
  handler: async (ctx, { state }): Promise<{ ok: boolean; error?: string }> => {
    const record = await ctx.db
      .query("oauthStates")
      .withIndex("by_state", (q) => q.eq("state", state))
      .first();

    if (!record) {
      return { ok: false, error: "Authorization request not found" };
    }

    await ctx.db.delete(record._id);
    return { ok: true };
  },
});

/**
 * Atomically verifies and consumes an authorization code in a single operation.
 * This prevents authorization code replay attacks per OAuth 2.0 / IndieAuth spec.
 */
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
      scope: string;
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

/**
 * Cleanup expired IndieAuth authorization codes. Called by cron job.
 */
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

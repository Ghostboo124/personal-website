import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createAuthorizationCode = mutation({
  args: {
    code: v.string(),
    userId: v.id("users"),
    clientId: v.string(),
    redirectUri: v.string(),
    scope: v.string(),
    codeChallenge: v.string(),
    codeChallengeMethod: v.string(),
  },
  handler: async (ctx, args): Promise<{ ok: boolean; error?: string }> => {
    await ctx.db.insert("indieauthCodes", {
      ...args,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    return { ok: true };
  },
});

export const verifyAuthorizationCode = query({
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

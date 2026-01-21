import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const saveState = mutation({
  args: {
    state: v.string(),
    clientId: v.string(),
    redirectUri: v.string(),
    scope: v.string(),
    codeChallenge: v.optional(v.string()),
    codeVerifier: v.optional(v.string()),
    codeChallengeMethod: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    await ctx.db.insert("oauthStates", {
      ...args,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    return { ok: true };
  },
});

export const verifyState = query({
  args: { state: v.string() },
  handler: async (
    ctx,
    { state },
  ): Promise<{
    ok: boolean;
    error?: string;
    record?: Doc<"oauthStates">;
  }> => {
    const record = await ctx.db
      .query("oauthStates")
      .withIndex("by_state", (q) => q.eq("state", state))
      .first();

    if (!record) {
      return { ok: false, error: "State could not be found in database" };
    }

    if (record.expiresAt < Date.now()) {
      return { ok: false, error: "State record expired" };
    }

    return { ok: true, record };
  },
});

export const getOauthState = query({
  args: {
    state: v.optional(v.string()),
    codeChallenge: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { state, codeChallenge },
  ): Promise<{
    ok: boolean;
    error?: string;
    oauth_state?: Doc<"oauthStates">;
  }> => {
    if (!(state || codeChallenge)) {
      return { ok: false, error: "A state or code challenge must be provided" };
    }

    if (state) {
      const oauth_state = await ctx.db
        .query("oauthStates")
        .withIndex("by_state", (q) => q.eq("state", state))
        .first();

      if (!oauth_state) {
        return { ok: false, error: "State could not be found in database" };
      }

      if (oauth_state.expiresAt < Date.now()) {
        return { ok: false, error: "OAuth Code expired" };
      }

      return { ok: true, oauth_state };
    }

    const oauth_state = await ctx.db
      .query("oauthStates")
      .withIndex("by_code", (q) => q.eq("codeChallenge", codeChallenge))
      .first();

    if (!oauth_state) {
      return { ok: false, error: "State could not be found in database" };
    }

    if (oauth_state.expiresAt < Date.now()) {
      return { ok: false, error: "OAuth Code expired" };
    }

    return { ok: true, oauth_state };
  },
});

export const deleteState = mutation({
  args: { stateId: v.id("oauthStates") },
  handler: async (
    ctx,
    { stateId },
  ): Promise<{ ok: boolean; error?: string }> => {
    const state = await ctx.db.get(stateId);

    if (!state) {
      return { ok: false, error: "State could not be found in database" };
    }

    await ctx.db.delete(stateId);
    return { ok: true };
  },
});

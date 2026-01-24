import { uuidv7 } from "uuidv7";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

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

// export const checkAuthStatus = query({})

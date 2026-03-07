import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

/**
 * Verifies a session token and returns the authenticated userId
 * Returns null if the session is invalid or expired
 */
export async function getAuthenticatedUserId(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string,
): Promise<Id<"users"> | null> {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", sessionToken))
    .first();

  if (!session) {
    return null;
  }

  if (session.expiresAt < Date.now()) {
    return null;
  }

  return session.userId;
}

/**
 * Validates that the session token belongs to the specified userId
 */
export async function verifyUserOwnership(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string,
  userId: Id<"users"> | string,
): Promise<boolean> {
  const authenticatedUserId = await getAuthenticatedUserId(ctx, sessionToken);
  return authenticatedUserId === userId;
}

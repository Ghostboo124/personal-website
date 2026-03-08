import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  indieauthCodes: defineTable({
    code: v.string(),
    userId: v.id("users"),
    clientId: v.string(),
    redirectUri: v.string(),
    scope: v.string(),
    codeChallenge: v.string(),
    codeChallengeMethod: v.string(),
    expiresAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_userId", ["userId"]),
  todo_list: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
    isArchived: v.boolean(),
    userId: v.id("users"),
  })
    .index("by_completed", ["isCompleted"])
    .index("by_userId", ["userId"]),
  users: defineTable({
    username: v.string(),
    name: v.string(),
    email: v.string(),
    oauth_methods: v.array(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
    isTodoPublic: v.optional(v.boolean()),
  })
    .index("by_username", ["username"])
    .index("by_email", ["email"])
    .index("by_oauth", ["oauth_methods"]),
  oauthStates: defineTable({
    state: v.string(),
    clientId: v.string(),
    redirectUri: v.string(),
    scope: v.string(),
    expiresAt: v.number(),
    codeChallenge: v.optional(v.string()),
    codeVerifier: v.optional(v.string()),
    codeChallengeMethod: v.optional(v.string()),
  })
    .index("by_state", ["state"])
    .index("by_code", ["codeChallenge", "codeVerifier"]),
  sessions: defineTable({
    token: v.string(),
    userId: v.id("users"),
    expiresAt: v.number(),
    ipAddress: v.string(),
    userAgent: v.string(),
  })
    .index("by_uid", ["userId"])
    .index("by_token", ["token"])
    .index("by_info", ["userAgent", "ipAddress", "userId"])
    .index("by_expiry", ["expiresAt"]),
});

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  todo_list: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
    isArchived: v.boolean(),
  }).index("by_completed", ["isCompleted"]),
  users: defineTable({
    username: v.string(),
    name: v.string(),
    email: v.string(),
    oauth_methods: v.array(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
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
});

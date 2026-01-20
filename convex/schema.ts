import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  todo_list: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
    isArchived: v.boolean(),
  }).index("by_completed", ["isCompleted"]),
});

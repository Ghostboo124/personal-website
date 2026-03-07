# AGENTS.md

## Planning

If a user asks you to plan a given change out, you should start off by generating a PLAN.md in the root of the project. This should include a list of the steps you are going to take, after you complete each step you are going to mark each step as completed. order the steps you need to take in order of importance.

You should ask for any clarifications you need, and pause to let the user check through your PLAN.md before you continue.

If PLAN.md already exists, delete it and create a new one.

## Strict guidelines

**Never** run the dev server, assume it is already running
**Always** run typechecking and linting and fix all issues found during those steps, including ones not related to your changes

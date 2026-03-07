"use server";

import { fetchMutation, fetchQuery } from "convex/nextjs";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";

export type AuthResult =
  | {
      ok: true;
      user: Doc<"users">;
      sessions: Doc<"sessions">[];
      currentSessionToken: string;
    }
  | {
      ok: false;
      reauthNeeded: boolean;
      error: string;
    };

export async function getAuthenticatedUser(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const sessionToken = cookieStore.get("sessionId")?.value;

  if (!sessionToken) {
    return { ok: false, reauthNeeded: true, error: "No session token found" };
  }

  const ipAddress =
    headerStore.get("x-forwarded-for")?.split(",")[0].trim() || "Unknown";
  const userAgent = headerStore.get("user-agent") || "Unknown";

  const authStatus = await fetchQuery(api.session.checkAuthStatus, {
    sessionToken,
    ipAddress,
    userAgent,
  });

  if (!authStatus.ok) {
    return {
      ok: false,
      reauthNeeded: authStatus.reauthNeeded,
      error: authStatus.error || "Authentication failed",
    };
  }

  const userResult = await fetchQuery(api.users.getUser, {
    userId: authStatus.userId as Id<"users">,
  });

  if (!userResult.ok || !userResult.user) {
    return { ok: false, reauthNeeded: true, error: "User not found" };
  }

  const sessionsResult = await fetchQuery(api.session.getUserSessions, {
    userId: authStatus.userId as Id<"users">,
    sessionToken,
  });

  return {
    ok: true,
    user: userResult.user,
    sessions: sessionsResult.sessions || [],
    currentSessionToken: sessionToken,
  };
}

export async function updateProfile(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const authResult = await getAuthenticatedUser();

  if (!authResult.ok) {
    redirect("/auth/login");
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionId")?.value;

  if (!sessionToken) {
    return { ok: false, error: "Session token not found" };
  }

  const username = formData.get("username") as string | null;
  const name = formData.get("name") as string | null;
  const email = formData.get("email") as string | null;

  const result = await fetchMutation(api.users.updateUserProfile, {
    userId: authResult.user._id,
    username: username || undefined,
    name: name || undefined,
    email: email || undefined,
    sessionToken,
  });

  return result;
}

export async function revokeSession(
  sessionId: string,
): Promise<{ ok: boolean; error?: string }> {
  const authResult = await getAuthenticatedUser();

  if (!authResult.ok) {
    redirect("/auth/login");
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionId")?.value;

  if (!sessionToken) {
    return { ok: false, error: "Session token not found" };
  }

  const result = await fetchMutation(api.session.revokeSession, {
    sessionId: sessionId as Id<"sessions">,
    sessionToken,
  });

  if (result.ok) {
    revalidatePath("/auth/profile");
  }

  return result;
}

export async function isLoggedIn(): Promise<boolean> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const sessionToken = cookieStore.get("sessionId")?.value;

  if (!sessionToken) {
    return false;
  }

  const ipAddress =
    headerStore.get("x-forwarded-for")?.split(",")[0].trim() || "Unknown";
  const userAgent = headerStore.get("user-agent") || "Unknown";

  const authStatus = await fetchQuery(api.session.checkAuthStatus, {
    sessionToken,
    ipAddress,
    userAgent,
  });

  return authStatus.ok;
}

export async function toggleTodoVisibility(): Promise<{
  ok: boolean;
  isTodoPublic?: boolean;
  error?: string;
}> {
  const authResult = await getAuthenticatedUser();

  if (!authResult.ok) {
    redirect("/auth/login");
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionId")?.value;

  if (!sessionToken) {
    return { ok: false, error: "Session token not found" };
  }

  const result = await fetchMutation(api.todo.toggleTodoVisibility, {
    userId: authResult.user._id,
    sessionToken,
  });

  if (result.ok) {
    revalidatePath("/auth/profile");
  }

  return result;
}

export async function deleteAccount(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const authResult = await getAuthenticatedUser();

  if (!authResult.ok) {
    redirect("/auth/login");
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionId")?.value;

  if (!sessionToken) {
    return { ok: false, error: "Session token not found" };
  }

  // Revoke all sessions BEFORE deleting the user
  const sessionsResult = await fetchQuery(api.session.getUserSessions, {
    userId: authResult.user._id,
    sessionToken,
  });

  if (sessionsResult.sessions) {
    for (const session of sessionsResult.sessions) {
      await fetchMutation(api.session.revokeSession, {
        sessionId: session._id,
        sessionToken,
      });
    }
  }

  // Now delete the user
  const result = await fetchMutation(api.users.deleteUser, {
    userId: authResult.user._id,
    sessionToken,
  });

  if (!result.ok) {
    return result;
  }

  // Clear cookie and redirect
  const cookieStore2 = await cookies();
  cookieStore2.delete("sessionId");
  redirect("/auth/login");
}

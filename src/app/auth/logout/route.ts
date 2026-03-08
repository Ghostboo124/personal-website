import { fetchMutation } from "convex/nextjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

/**
 * POST-only logout endpoint to prevent CSRF attacks
 * GET requests from third-party sites cannot trigger logout
 */
export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await fetchMutation(api.session.revokeSessionByToken, {
    sessionToken: sessionId,
  });

  // Clear the cookie
  cookieStore.delete("sessionId");

  revalidatePath("/", "layout");
  redirect("/");
}

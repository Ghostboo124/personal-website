import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { getAuthenticatedUser } from "./actions";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const authResult = await getAuthenticatedUser();

  if (!authResult.ok) {
    if (authResult.reauthNeeded) {
      redirect("/auth/login");
    }

    return (
      <div className="dark frappe min-h-screen flex items-center justify-center bg-ctp-base p-4">
        <div className="w-full max-w-md bg-ctp-mantle backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-ctp-red mb-4">
              Authentication Error
            </h1>
            <p className="text-ctp-subtext0 mb-6">{authResult.error}</p>
            <a
              href="/auth/login"
              className="inline-block px-6 py-3 bg-ctp-lavender hover:bg-ctp-lavender/80 text-ctp-base font-semibold rounded-lg transition-colors"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  const isTodoPublic = await fetchQuery(api.todo.getTodoVisibility, {
    userId: authResult.user._id,
  });

  return (
    <ProfileClient
      user={authResult.user}
      sessions={authResult.sessions}
      currentSessionToken={authResult.currentSessionToken}
      isTodoPublic={isTodoPublic}
    />
  );
}

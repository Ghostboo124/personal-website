import { fetchQuery } from "convex/nextjs";
import { cookies, headers } from "next/headers";
import { Footer } from "@/components/footer";
import { Titlebar } from "@/components/titlebar";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { TodoListClient } from "./todo-list-client";

async function getViewerUserIdAndToken(): Promise<{
  userId?: Id<"users">;
  sessionToken?: string;
}> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const sessionToken = cookieStore.get("sessionId")?.value;
  if (!sessionToken) return {};

  const ipAddress =
    headerStore.get("x-forwarded-for")?.split(",")[0].trim() || "Unknown";
  const userAgent = headerStore.get("user-agent") || "Unknown";

  const authStatus = await fetchQuery(api.session.checkAuthStatus, {
    sessionToken,
    ipAddress,
    userAgent,
  });

  if (!authStatus.ok || !authStatus.userId) return {};

  return {
    userId: authStatus.userId as Id<"users">,
    sessionToken,
  };
}

export default async function Page(props: PageProps<"/todo/[slug]">) {
  let { slug } = await props.params;
  slug = decodeURIComponent(slug);

  const userResult = await fetchQuery(api.users.getUserIdByUsername, {
    username: slug,
  });

  if (!userResult.ok) {
    return (
      <div className="dark frappe flex flex-col min-h-screen items-center justify-center font-sans bg-ctp-base">
        <Titlebar />
        <main className="flex flex-1 overflow-auto w-full max-w-3xl flex-col items-center justify-center">
          <p className="text-ctp-text">An error has occured while loading</p>
          <p className="text-ctp-text">{userResult.error!}</p>
        </main>
        <Footer />
      </div>
    );
  }

  const pageUserId = userResult.userId!;
  const { userId: viewerUserId, sessionToken } =
    await getViewerUserIdAndToken();
  const isOwner = viewerUserId === pageUserId;

  const isTodoPublic = await fetchQuery(api.todo.getTodoVisibility, {
    userId: pageUserId,
  });

  if (!isTodoPublic && !isOwner) {
    return (
      <div className="dark frappe flex flex-col min-h-screen font-sans bg-ctp-base">
        <Titlebar />
        <main className="flex flex-1 w-full flex-col items-center justify-center">
          <p className="text-ctp-text text-lg">This todo list is private</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dark frappe flex flex-col min-h-screen items-center justify-center font-sans bg-ctp-base">
      <Titlebar />
      <main className="flex flex-1 overflow-auto w-full max-w-3xl flex-col items-center justify-center py-4 px-16 bg-ctp-base sm:items-start">
        <TodoListClient
          userId={pageUserId}
          viewerUserId={viewerUserId}
          isOwner={isOwner}
          isTodoPublic={isTodoPublic}
          sessionToken={sessionToken}
        />
      </main>
      <Footer />
    </div>
  );
}

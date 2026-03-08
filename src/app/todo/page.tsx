export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/app/auth/profile/actions";

export default async function TodoPage() {
  const authResult = await getAuthenticatedUser();

  if (!authResult.ok) {
    redirect("/auth/login");
  }

  redirect(`/todo/${authResult.user.username}`);
}

import { redirect } from "next/navigation";
import { isLoggedIn } from "../profile/actions";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await isLoggedIn()) {
    redirect("/auth/profile");
  }

  return <LoginForm />;
}

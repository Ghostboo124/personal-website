import { redirect } from "next/navigation";

export default function Auth() {
  redirect("/auth/login");
}

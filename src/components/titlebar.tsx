import { isLoggedIn } from "@/app/auth/profile/actions";
import { TitlebarClient } from "./titlebar-client";

export async function Titlebar() {
  const loggedIn = await isLoggedIn();
  return <TitlebarClient loggedIn={loggedIn} />;
}

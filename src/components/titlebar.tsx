import Link from "next/link";
import { isLoggedIn } from "@/app/auth/profile/actions";
import { Button } from "./button";

export async function Titlebar() {
  const loggedIn = await isLoggedIn();

  return (
    <header className="flex-none p-4 w-full bg-ctp-crust text-ctp-text text-center ">
      <nav className="flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-semibold text-ctp-text hover:text-ctp-mauve transition-colors"
          aria-label="Link back to home page saying 'Lexy'"
        >
          Lexy
        </Link>
        <Link
          href={loggedIn ? "/auth/profile" : "/auth/login"}
          aria-label={loggedIn ? "Link to profile page" : "Link to login page"}
        >
          <Button
            variant="outline"
            className="text-lg bg-ctp-mantle text-ctp-mauve"
          >
            {loggedIn ? "Profile" : "Login"}
          </Button>
        </Link>
      </nav>
    </header>
  );
}

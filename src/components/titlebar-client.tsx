"use client";

import Link from "next/link";
import { Button } from "./button";
import { LogoutButton } from "./logout-button";

export function TitlebarClient({ loggedIn }: { loggedIn: boolean }) {
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

        <div>
          <Link
            href="/todo"
            className="text-lg text-ctp-text hover:text-ctp-mauve transition-colors"
            aria-label="Link to To-Do app saying 'To-Do List'"
          >
            To-Do List
          </Link>
        </div>

        <div>
          <Link
            href={loggedIn ? "/auth/profile" : "/auth/login"}
            aria-label={
              loggedIn ? "Link to profile page" : "Link to login page"
            }
            className="p-1"
          >
            <Button
              variant="outline"
              className="text-lg bg-ctp-mantle text-ctp-mauve"
            >
              {loggedIn ? "Profile" : "Login"}
            </Button>
          </Link>
          {loggedIn && (
            <span className="p-1">
              <LogoutButton />
            </span>
          )}
        </div>
      </nav>
    </header>
  );
}

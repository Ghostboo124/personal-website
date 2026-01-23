import Link from "next/link";
import { Button } from "./button";

export function Titlebar() {
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
        <Link href="/auth" aria-label="Link to auth page saying 'Login'">
          <Button
            variant="outline"
            className="text-lg bg-ctp-mantle text-ctp-mauve"
          >
            Login
          </Button>
        </Link>
      </nav>
    </header>
  );
}

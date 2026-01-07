import Link from "next/link";

export function Titlebar() {
  return (
    <header className="flex-none p-4 w-full bg-ctp-crust text-ctp-text text-center ">
      <nav className="flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-semibold text-ctp-text hover:text-ctp-mauve transition-colors"
        >
          Lexy
        </Link>
      </nav>
    </header>
  );
}

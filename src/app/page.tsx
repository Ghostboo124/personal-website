import Link from "next/link";
import { Button } from "@/components/button";
import { Titlebar } from "@/components/titlebar";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center font-sans bg-zinc-900">
      <Titlebar />
      <main className="flex flex-1 overflow-auto w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-zinc-900 sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-zinc-50">
            Personal Website
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-400">
            This is Alex's (Ghostboo124) personal website
          </p>
          <h2 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-zinc-50">
            Profiles
          </h2>
          <ul className="list-disc">
            <li>
              <Link rel="me" href="https://codeberg.org/Ghostboo124">
                <Button variant="link" size="sm">
                  Codeberg
                </Button>
              </Link>
            </li>
            <li>
              <Link rel="me authn" href="https://github.com/Ghostboo124">
                <Button variant="link" size="sm">
                  GitHub
                </Button>
              </Link>
            </li>
            <li>
              <Link rel="me authn" href="https://www.last.fm/user/Ghostboo124">
                <Button variant="link" size="sm">
                  Last.fm
                </Button>
              </Link>
            </li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}

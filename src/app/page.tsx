import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/button";
import { Footer } from "@/components/footer";
import { Titlebar } from "@/components/titlebar";

export default function Home() {
  return (
    <div className="dark frappe flex flex-col min-h-screen items-center justify-center font-sans bg-ctp-base">
      <Titlebar />
      <main className="flex flex-1 overflow-auto w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-ctp-base sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-ctp-text">
            Lexy's Personal Website
          </h1>
          <p className="max-w-md text-lg leading-8 text-ctp-text">
            This is Lexy's (Ghostboo124) personal website
          </p>
          <h2 className="max-w-xs text-2xl font-semibold leading-10 tracking-tight text-ctp-subtext0">
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
      <div className="flex flex-col gap-2 text-ctp-text text-sm text-center">
        <h2 className="bg-background p-2 font-mono text-lg">88x31s</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 mx-auto bg-background w-fit">
          {[
            {
              name: "Trans Flag with She/Her pronouns",
              image: "/buttons/pronouns_sheher.gif",
            },
            {
              name: "Omnisexual Flag",
              image: "/buttons/omnisexual.png",
            },
            {
              name: "Pride Flag",
              image: "/buttons/pride-flag.png",
            },
            {
              name: "Hack Club",
              url: "https://hack.club",
              image: "/buttons/hackclub.gif",
            },
            {
              name: "Catppuccin",
              url: "https://catppuccin.com",
              image: "/buttons/ctp.webp",
            },
            {
              name: "Ultrafastparrot Cult",
              url: "https://ultrafastparrot.net",
              image: "/buttons/ultrafastparrot.gif",
            },
            {
              name: "Last.fm",
              url: "https://last.fm",
              image: "/buttons/lastfm-01.png",
            },
            {
              name: "Spotify",
              url: "https://spotify.com",
              image: "/buttons/spotify.gif",
            },
            {
              name: "Next.js",
              url: "https://nextjs.org",
              image: "/buttons/next.gif",
            },
            {
              name: "Neovim",
              url: "https://neovim.io",
              image: "/buttons/neovim.gif",
            },
            {
              name: "Made on GNU/Linux",
              url: "https://archlinux.org",
              image: "/buttons/madeon_linux.gif",
            },
            {
              name: "Best viewed with any browser",
              url: "https://anybrowser.org/campaign/",
              image: "/buttons/bestviewedanybrowser.gif",
            },
            {
              name: "CC-BY-NC-SA",
              url: "https://creativecommons.org/share-your-work/cclicenses/#CC%20BY-NC-SA:~:text=CC%20BY%2DNC%2DSA",
              image: "/buttons/cc-by-nc-sa.gif",
            },
            {
              name: "Chrome and IE are bad",
              image: "/buttons/chrome-ie-bad.gif",
            },
            {
              name: "CSS is Difficult",
              image: "/buttons/css-is-diff.gif",
            },
          ].map((item) => (
            <div key={item.name} className="flex flex-row w-full">
              {item.url ? (
                <Link
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    loading="lazy"
                    src={item.image}
                    alt={item.name}
                    className="w-[88px] h-[31px]"
                    width={88}
                    height={31}
                  />
                </Link>
              ) : (
                <Image
                  loading="lazy"
                  src={item.image}
                  alt={item.name}
                  className="w-[88px] h-[31px]"
                  width={88}
                  height={31}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-row gap-2 text-ctp-text text-sm text-center">
        <div className="flex flex-col bg-background sm:w-fit w-full">
          <div className="bg-background p-2 font-mono text-lg">Webrings</div>
          {[
            {
              name: "ultrafastparrot",
              url: "https://ultrafastparrot.net",
              next: "https://ultrafastparrot.net/next/lex",
              prev: "https://ultrafastparrot.net/prev/lex",
              image: "/webrings/ultrafastparrot.gif",
              width: 40,
              height: 40,
            },
            {
              name: "catppuccin",
              url: "https://ctp-webr.ing/",
              next: "https://ctp-webr.ing/lex/next",
              prev: "https://ctp-webr.ing/lex/previous",
            },
            {
              name: "webmaster-keyring",
              url: "https://webmasterwebring.netlify.app",
              next: "https://webmasterwebring.netlify.app?lex-next",
              prev: "https://webmasterwebring.netlify.app?lex-previous",
              image: "/webrings/webmaster.png",
              width: 88,
              height: 31,
            },
          ].map((item) => (
            <div key={item.name} className="flex flex-row w-full">
              <Button
                variant="ghost"
                size="icon"
                className="duration-200 ease-out hover:bg-card active:brightness-75"
                asChild
              >
                <Link
                  key={item.name}
                  href={item.prev}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">Previous</span>
                  <ArrowLeft />
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="duration-200 ease-out hover:bg-card active:brightness-75 grow"
                asChild
              >
                <Link
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.image ? (
                    <Image
                      loading="lazy"
                      src={item.image}
                      alt={item.name}
                      style={{ width: item.width, height: item.height }}
                      width={item.width || 40}
                      height={item.height || 40}
                    />
                  ) : (
                    item.name
                  )}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="duration-200 ease-out hover:bg-card active:brightness-75"
                asChild
              >
                <Link
                  key={item.name}
                  href={item.next}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">Next</span>
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

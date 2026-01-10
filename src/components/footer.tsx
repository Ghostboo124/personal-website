import Link from "@/components/custom-link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/button";

export function Footer() {
  return (
    <>
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
              name: "Catpuccin",
              url: "https://catpuccin.com",
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
          ].map((item, index) => (
            <div className="flex flex-row w-full" key={index}>
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
            // {
            //   name: "webmaster-keyring",
            //   url: "https://webmasterwebring.netlify.app",
            //   next: "https://webmasterwebring.netlify.app?lex-next",
            //   prev: "https://webmasterwebring.netlify.app?lex-previous",
            //   image: "/webrings/webmaster.png",
            //   width: 88,
            //   height: 31,
            // },
          ].map((item, index) => (
            <div className="flex flex-row w-full" key={index}>
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
                <Link href={item.url}>
                  {item.image ? (
                    <Image
                      loading="lazy"
                      src={item.image}
                      alt={item.name}
                      className={"w-[" + item.width + "px]"}
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
                <Link href={item.next}>
                  <span className="sr-only">Next</span>
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
      <footer className="flex-none p-4 w-full bg-ctp-mantle text-ctp-text text-center">
        <div className="flex flex-col gap-2 text-sm text-ctp-subtext0">
          <p>© 2026 Lexy</p>
          <p className="text-xs text-ctp-overlay0">
            Built with Next.js, Tailwind CSS, and Shadcn UI with PostHog for
            analytics.
          </p>
        </div>
      </footer>
    </>
  );
}

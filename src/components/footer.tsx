import Link from "@/components/custom-link";
import { ArrowLeft, ArrowRight, Mail, Omega } from "lucide-react";
import { Button } from "@/components/button";

export function Footer() {
  return (
    <>
      <div className="flex flex-row gap-2 text-ctp-text text-sm text-center">
        <div className="flex flex-col bg-background sm:w-fit w-full">
          <div className="bg-background p-2 font-mono text-lg">Webrings</div>
          {[
            {
              name: "ultrafastparrot",
              url: "https://ultrafastparrot.net",
              next: "https://ultrafastparrot.net/next/lex",
              prev: "https://ultrafastparrot.net/prev/lex",
              image: "https://ultrafastparrot.net/ultrafastparrot.gif",
              width: 40,
            },
            // {
            //   name: "catppuccin",
            //   url: "https://ctp-webr.ing/",
            //   next: "https://ctp-webr.ing/lex/next",
            //   prev: "https://ctp-webr.ing/lex/prev",
            // },
          ].map((item, index) => (
            <div className="flex flex-row w-full" key={index}>
              <Button
                variant="ghost"
                size="icon"
                className="duration-200 ease-out hover:bg-card active:brightness-75"
                asChild
              >
                <Link href={item.prev}>
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
                    <img
                      src={item.image}
                      alt={item.name}
                      width={item.width || 40}
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

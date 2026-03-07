import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothCursor } from "@/components/smooth-cursor";
import { ConvexClientProvider, PostHogProvider } from "./providers";

// import { register } from "../instrumentation";

// register();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lexy's Personal Website",
  description:
    "Lexy's personal website built with Next.js, Tailwind CSS, Shadcn UI, PostHog, and Convex",
  applicationName: "Lexy's Website",
  authors: [{ name: "Lexy", url: "https://personal.apcoding.com.au" }],
  creator: "Lexy Perkins",
  generator: "Next.js",
  keywords: [
    "Lexy",
    "Lexy Perkins",
    "Lex",
    "Lex Perkins",
    "Ghostboo124",
    "_Ghostboo__",
  ],
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      "max-video-preview": 0,
      "max-image-preview": "standard",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="indieauth-metadata"
          href="/.well-known/oauth-authorization-server"
        />
        <link rel="canonical" href="https://personal.apcoding.com.au/" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <PostHogProvider>
          <ConvexClientProvider>
            {children}
            <SmoothCursor disableRotation={false} />
          </ConvexClientProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}

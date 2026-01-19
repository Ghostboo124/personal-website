import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothCursor } from "@/components/smooth-cursor";
import { PostHogProvider, ConvexClientProvider } from "./providers";
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
  title: "Personal Website",
  description: "Alex's Personal Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="indieauth-metadata"
          href="/.well-known/oauth-authorization-server"
        />
        <link rel="canonical" href="https://personal.apcoding.com.au/" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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

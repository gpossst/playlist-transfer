import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import localFont from "next/font/local";
import Image from "next/image";
import AdSense from "./components/AdSense";
import AppleMusic from "./components/AppleMusic";
import { Analytics } from "@vercel/analytics/react";

const inter = Fredoka({ subsets: ["latin"] });
const cooperBlack = localFont({
  src: "./fonts/CooperBlack-Std.otf",
  variable: "--font-cooper",
});

export const metadata: Metadata = {
  title: "Playlist Transfer - Transfer Music Between Streaming Services",
  description:
    "Easily transfer your playlists between Spotify and Apple Music. A free tool to move playlistsacross platforms.",
  keywords:
    "playlist transfer, spotify to apple music, music transfer, playlist converter, spotify playlist, apple music playlist",
  openGraph: {
    title: "Playlist Transfer - Move Music Between Services",
    description:
      "Free tool to transfer playlists between Spotify and Apple Music",
    type: "website",
    url: "https://playlist-transfer.com",
    images: [
      {
        url: "/static/images/p.png",
        width: 64,
        height: 64,
        alt: "Playlist Transfer Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Playlist Transfer",
    description: "Transfer your music playlists between streaming services",
    creator: "@imgarrettpost",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/static/images/p.png" />
        <AdSense pId="pub-3984797860990299" />
        <AppleMusic />
      </head>
      <body
        className={`${cooperBlack.variable} ${inter.className} flex flex-col min-h-screen`}
      >
        <div className="p-4 flex justify-center">
          <Link href={"/"}>
            <Image
              src={`/static/images/p.png`}
              alt={"Playlist Transfer Logo"}
              width="64"
              height="64"
            />
          </Link>
        </div>
        <div className="flex-grow">{children}</div>
        <Analytics />
        {/* Footer without special styling */}
        <div className="text-center p-4">
          This is a website by{" "}
          <a
            className="hover:underline font-semibold text-lg"
            href="https://garrett.one/"
            rel="author"
          >{` Garrett Post`}</a>
          . If you have any feedback, DM me{" "}
          <a
            className="hover:underline font-semibold text-lg"
            href="https://x.com/imgarrettpost"
            rel="noopener noreferrer"
          >{` here`}</a>
          . Advertisements keep our site free!
        </div>
      </body>
    </html>
  );
}

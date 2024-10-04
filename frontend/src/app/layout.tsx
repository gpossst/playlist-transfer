import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import localFont from "next/font/local";
import Image from "next/image";

const inter = Fredoka({ subsets: ["latin"] });
const cooperBlack = localFont({
  src: "./fonts/CooperBlack-Std.otf",
  variable: "--font-cooper",
});

export const metadata: Metadata = {
  title: "Playlist Transfer",
  description: "A website by Garrett Post",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cooperBlack.variable} ${inter.className} flex flex-col min-h-screen`}
      >
        <div className="p-4 flex justify-center">
          <Link href={"/"}>
            <Image
              src={`/static/images/p.png`}
              alt={"Logo"}
              width="64"
              height="64"
            />
          </Link>
        </div>
        <div className="flex-grow">{children}</div>
        {/* Footer without special styling */}
        <div className="text-center p-4">
          This is a website by{" "}
          <a
            className="hover:underline font-semibold text-lg"
            href="https://garrett.one/"
          >{` Garrett Post`}</a>
          .
        </div>
      </body>
    </html>
  );
}
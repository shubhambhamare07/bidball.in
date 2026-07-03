import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bidball.vercel.app"),
  title: "bidball.vercel.app",
  description: "Real-time multiplayer football auction game. Build your dream squad, outbid your rivals, and become the ultimate football manager.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "bidball.vercel.app",
    description: "Real-time multiplayer football auction game. Build your dream squad, outbid your rivals, and become the ultimate football manager.",
    type: "website",
    locale: "en_US",
    siteName: "bidball.vercel.app",
    images: [
      {
        url: "/logo.jpg",
        width: 1024,
        height: 1024,
        alt: "bidball.vercel.app Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "bidball.vercel.app",
    description: "Real-time multiplayer football auction game. Build your dream squad, outbid your rivals, and become the ultimate football manager.",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

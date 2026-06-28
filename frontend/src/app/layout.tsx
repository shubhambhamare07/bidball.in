import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Football Auction 2026",
  description: "Real-time Multiplayer World Cup Football Auction Game",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Football Auction 2026",
    description: "Real-time Multiplayer World Cup Football Auction Game",
    type: "website",
    locale: "en_US",
    siteName: "Football Auction 2026",
  },
  twitter: {
    card: "summary_large_image",
    title: "Football Auction 2026",
    description: "Real-time Multiplayer World Cup Football Auction Game",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

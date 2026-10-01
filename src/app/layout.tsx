import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GridMotion } from "@/components/grid-motion";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WalletProvider } from "@/lib/wallet";
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
  title: {
    default: "Proof of Ship",
    template: "%s · Proof of Ship",
  },
  description:
    "Launch a pump.fun coin. Lock creator fees. Holders vote pay or burn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col font-sans antialiased`}
      >
        <WalletProvider>
          <GridMotion />
          <SiteHeader />
          <main className="relative z-10 min-w-0 flex-1 px-5 pb-10 pt-6 md:px-8 md:pb-14 md:pt-8">{children}</main>
          <SiteFooter />
        </WalletProvider>
      </body>
    </html>
  );
}

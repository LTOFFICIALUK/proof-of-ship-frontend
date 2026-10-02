import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GridMotion } from "@/components/grid-motion";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ToastHost } from "@/components/toast";
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
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Proof of Ship",
    description: "Launch a pump.fun coin. Lock creator fees. Holders vote pay or burn.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#111112",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-dvh flex-col font-sans antialiased`}
      >
        <WalletProvider>
          <div className="flex min-h-dvh flex-col">
            <GridMotion />
            <SiteHeader />
            <main className="relative z-10 min-w-0 flex-1 px-4 pb-10 pt-5 md:px-8 md:pb-14 md:pt-8">{children}</main>
            <SiteFooter />
            <ToastHost />
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}

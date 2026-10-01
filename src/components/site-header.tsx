"use client";

import Link from "next/link";
import { ConnectWallet } from "@/components/connect-wallet";
import { btnPrimary, focusRing } from "@/components/surface";

export const SiteHeader = () => {
  return (
    <header className="sticky top-4 z-30 mx-auto mt-4 w-[min(1080px,calc(100%-1.5rem))] overflow-hidden rounded-[28px] bg-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.06] backdrop-blur-2xl sm:rounded-full md:w-[min(1080px,calc(100%-2.5rem))]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2 sm:flex-nowrap sm:px-4">
        <Link
          href="/"
          className="mr-auto shrink-0 text-[15px] font-semibold tracking-[-0.02em] text-[var(--ink)]"
          aria-label="Proof of Ship home"
        >
          Proof of Ship
        </Link>
        <nav className="order-3 flex w-full min-w-0 items-center justify-between gap-3 text-[14px] text-[var(--ink)] sm:order-none sm:w-auto sm:justify-end sm:gap-5">
          <Link className={`whitespace-nowrap text-[var(--muted)] transition hover:text-[var(--ink)] ${focusRing}`} href="/coins">
            Coins
          </Link>
          <Link className={`whitespace-nowrap text-[var(--muted)] transition hover:text-[var(--ink)] ${focusRing}`} href="/feed">
            Feed
          </Link>
          <Link className={`whitespace-nowrap text-[var(--muted)] transition hover:text-[var(--ink)] ${focusRing}`} href="/how">
            How it works
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/launch" className={`${btnPrimary} whitespace-nowrap px-4 py-1.5 text-[13px]`}>
            Launch
          </Link>
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
};

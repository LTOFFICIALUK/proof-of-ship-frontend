"use client";

import Link from "next/link";
import { ConnectWallet } from "@/components/connect-wallet";
import { btnPrimary, focusRing } from "@/components/surface";

export const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-30 min-w-0 border-b border-black/[0.06] bg-[#f5f5f7]/95 px-5 backdrop-blur-2xl md:px-8">
      <div className="mx-auto flex min-h-12 max-w-[980px] flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2">
        <Link
          href="/"
          className="shrink-0 text-[15px] font-semibold tracking-[-0.02em] text-[var(--ink)]"
          aria-label="Proof of Ship home"
        >
          Proof of Ship
        </Link>
        <nav className="flex items-center gap-4 text-[14px] text-[var(--ink)] sm:gap-6">
          <Link className={`text-[var(--muted)] transition hover:text-[var(--ink)] ${focusRing}`} href="/coins">
            Coins
          </Link>
          <Link className={`text-[var(--muted)] transition hover:text-[var(--ink)] ${focusRing}`} href="/feed">
            Feed
          </Link>
          <Link className={`text-[var(--muted)] transition hover:text-[var(--ink)] ${focusRing}`} href="/how">
            How it works
          </Link>
          <Link href="/launch" className={`${btnPrimary} px-4 py-1.5 text-[13px]`}>
            Launch
          </Link>
          <ConnectWallet />
        </nav>
      </div>
    </header>
  );
};

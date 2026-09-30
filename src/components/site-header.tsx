"use client";

import Link from "next/link";
import { btnPay } from "@/components/surface";

export const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-30 min-w-0 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_72%,transparent)] px-5 backdrop-blur-xl md:px-8">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-3 py-3.5">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 font-serif text-xl tracking-tight text-[var(--ink)] sm:text-2xl"
          aria-label="Proof of Ship home"
        >
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--pay)]/35 bg-[var(--pay)]/10 text-sm text-[var(--pay)]"
          >
            P
          </span>
          Proof of Ship
        </Link>
        <nav className="flex items-center gap-3 text-sm text-[var(--muted)] sm:gap-5">
          <Link className="transition hover:text-[var(--ink)]" href="/feed">
            Feed
          </Link>
          <Link className="transition hover:text-[var(--ink)]" href="/how">
            How it works
          </Link>
          <Link href="/launch" className={`${btnPay} px-3.5 py-2 sm:px-4`}>
            Launch
          </Link>
        </nav>
      </div>
    </header>
  );
};

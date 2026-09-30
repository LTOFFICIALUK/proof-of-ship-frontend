"use client";

import Link from "next/link";

export const SiteHeader = () => {
  return (
    <header className="border-b border-[var(--line)] px-5 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link
          href="/"
          className="font-serif text-2xl tracking-tight text-[var(--ink)]"
          aria-label="Proof of Ship home"
        >
          Proof of Ship
        </Link>
        <nav className="flex items-center gap-4 text-sm text-[var(--muted)]">
          <Link className="hover:text-[var(--ink)]" href="/feed">
            Feed
          </Link>
          <Link className="hover:text-[var(--ink)]" href="/how">
            How it works
          </Link>
          <Link
            href="/launch"
            className="rounded-full bg-[var(--pay)] px-4 py-2 font-medium text-black"
          >
            Launch
          </Link>
        </nav>
      </div>
    </header>
  );
};

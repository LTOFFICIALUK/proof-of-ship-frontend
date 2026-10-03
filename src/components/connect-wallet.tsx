"use client";

import Link from "next/link";
import { shortWallet, useWallet } from "@/lib/wallet";
import { btnGhost, btnPrimary } from "@/components/surface";

export const ConnectWallet = () => {
  const { wallet, busy, connect, disconnect } = useWallet();

  if (wallet) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/me" className={`${btnGhost} px-3 py-1.5 text-[13px]`} aria-label="Your profile">
          {shortWallet(wallet)}
        </Link>
        <button type="button" onClick={() => void disconnect()} className={`${btnGhost} px-3 py-1.5 text-[13px]`} aria-label="Sign out">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void connect()}
      disabled={busy}
      className={`${btnPrimary} px-3 py-1.5 text-[13px]`}
      aria-label="Connect wallet"
      aria-busy={busy}
    >
      <span className="whitespace-nowrap">{busy ? "Connecting" : "Connect wallet"}</span>
    </button>
  );
};

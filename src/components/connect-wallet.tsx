"use client";

import Link from "next/link";
import { shortWallet, useWallet } from "@/lib/wallet";
import { btnGhost, btnPrimary } from "@/components/surface";

export const ConnectWallet = () => {
  const { wallet, busy, connect } = useWallet();

  if (wallet) {
    return (
      <Link href="/me" className={`${btnGhost} px-3 py-1.5 text-[13px]`} aria-label="Your profile">
        {shortWallet(wallet)}
      </Link>
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

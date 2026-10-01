"use client";

import { shortWallet, useWallet } from "@/lib/wallet";
import { btnGhost, btnPrimary } from "@/components/surface";

export const ConnectWallet = () => {
  const { wallet, busy, error, connect, disconnect } = useWallet();

  if (wallet) {
    return (
      <button type="button" onClick={() => void disconnect()} className={`${btnGhost} px-3 py-1.5 text-[13px]`} aria-label="Disconnect wallet">
        {shortWallet(wallet)}
      </button>
    );
  }

  return (
    <span className="inline-flex flex-col items-end">
      <button type="button" onClick={() => void connect()} disabled={busy} className={`${btnPrimary} px-3 py-1.5 text-[13px]`}>
        <span className="whitespace-nowrap">{busy ? "Connecting" : "Connect wallet"}</span>
      </button>
      {error ? <span className="mt-1 max-w-40 text-right text-[11px] text-[var(--burn)]">{error}</span> : null}
    </span>
  );
};

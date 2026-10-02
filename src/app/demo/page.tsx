"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatSol } from "@/lib/format";
import { shortWallet } from "@/lib/wallet";
import { pageTitle, panel } from "@/components/surface";

type CoinCard = {
  mint: string;
  name: string;
  symbol: string;
  status: string;
  xHandle: string;
  promise: string;
  balanceSol: number;
  releasedSol: number;
  burnedSol: number;
};

const statusLabel = (status: string) => {
  if (status === "active") return "Active";
  if (status === "lapsed") return "Lapsed";
  if (status === "abandoned") return "Abandoned";
  return status;
};

export default function DemoPage() {
  const [coins, setCoins] = useState<CoinCard[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api<{ projects: CoinCard[] }>("/v1/projects?scope=demo");
        setCoins(data.projects);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load coins");
      }
    };
    void load();
  }, []);

  return (
    <div className="mx-auto max-w-[980px] pt-2">
      <h1 className={pageTitle}>Demo coins</h1>
      <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-[var(--muted)]">
        These coins are fixtures. They are not on pump.fun, and the vault numbers are not on chain.
      </p>
      {error ? <p className="mt-6 text-[var(--burn)]">{error}</p> : null}
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {coins.map((coin) => (
          <li key={coin.mint}>
            <Link href={`/c/${coin.mint}`} className={`${panel} block p-5`}>
              <p className="text-[18px] font-semibold tracking-[-0.03em]">{coin.name}</p>
              <p className="mt-1 font-mono text-[14px] text-[var(--muted)]">
                ${coin.symbol} · {shortWallet(coin.mint)}
              </p>
              <p className="mt-1 text-[13px] text-[var(--muted)]">@{coin.xHandle}</p>
              <p className="mt-3 text-[14px]">{statusLabel(coin.status)}</p>
              <p className="mt-2 text-[14px] text-[var(--muted)]">{formatSol(coin.balanceSol)} SOL in the vault</p>
            </Link>
          </li>
        ))}
      </ul>
      {!error && coins.length === 0 ? (
        <p className={`${panel} mt-8 p-8 text-[17px] text-[var(--muted)]`}>No demo coins yet.</p>
      ) : null}
    </div>
  );
}

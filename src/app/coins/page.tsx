"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PumpMark } from "@/components/pump-mark";
import { api } from "@/lib/api";
import { formatSol } from "@/lib/format";
import { pageTitle, panel } from "@/components/surface";

type CoinCard = {
  mint: string;
  slug: string;
  name: string;
  symbol: string;
  status: string;
  xHandle: string;
  balanceSol: number;
};

export default function CoinsPage() {
  const [coins, setCoins] = useState<CoinCard[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api<{ projects: CoinCard[] }>("/v1/projects");
        setCoins(data.projects);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load coins");
      }
    };
    void load();
  }, []);

  return (
    <div className="mx-auto max-w-[980px] pt-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={pageTitle}>Coins</h1>
          <p className="mt-3 max-w-xl text-[17px] text-[var(--muted)]">
            Every coin launched here is a pump.fun coin. Open one to read the promise and join the holder chat.
          </p>
        </div>
        <PumpMark label="Launched on pump.fun" />
      </div>
      {error ? <p className="mt-6 text-[var(--burn)]">{error}</p> : null}
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {coins.map((coin) => (
          <li key={coin.mint}>
            <Link href={`/coins/${coin.slug}`} className={`${panel} block p-5 transition hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[20px] font-semibold tracking-[-0.03em]">{coin.name}</p>
                  <p className="mt-1 text-[14px] text-[var(--muted)]">
                    ${coin.symbol} · @{coin.xHandle}
                  </p>
                </div>
                <PumpMark label="" />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[13px]">
                <span className="rounded-full bg-black/[0.05] px-3 py-1 font-medium">{coin.status}</span>
                <span className="text-[var(--muted)]">{formatSol(coin.balanceSol)} SOL in the vault</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {!error && coins.length === 0 ? (
        <p className={`${panel} mt-8 p-8 text-[17px] text-[var(--muted)]`}>No coins yet.</p>
      ) : null}
    </div>
  );
}

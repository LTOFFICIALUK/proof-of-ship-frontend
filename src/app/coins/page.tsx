"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatSol } from "@/lib/format";
import { shortWallet } from "@/lib/wallet";
import { pageTitle, panel } from "@/components/surface";

type CoinCard = {
  mint: string;
  slug: string;
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
  if (status === "active") {
    return "Active";
  }
  if (status === "lapsed") {
    return "Lapsed";
  }
  if (status === "abandoned") {
    return "Abandoned";
  }
  return status;
};

const Mini = ({ label, value, tone = "" }: { label: string; value: string; tone?: string }) => (
  <div className="min-w-0">
    <p className="text-[12px] text-[var(--muted)]">{label}</p>
    <p className={`mt-0.5 truncate text-[15px] font-semibold tracking-[-0.02em] ${tone}`}>{value}</p>
  </div>
);

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
    <div className="mx-auto max-w-[980px] pt-2">
      <h1 className={pageTitle}>Coins</h1>
      <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-[var(--muted)]">
        Open a coin to read the promise and join the holder chat.
      </p>
      {error ? <p className="mt-6 text-[var(--burn)]">{error}</p> : null}
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {coins.map((coin) => (
          <li key={coin.mint}>
            <Link
              href={`/c/${coin.mint}`}
              className={`${panel} flex h-full flex-col p-4 transition hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:p-5`}
            >
              <div className="flex items-start gap-3">
                <div
                  aria-hidden="true"
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-[#f5f5f7] text-[18px] font-semibold text-[var(--muted)]"
                >
                  {coin.symbol.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate text-[18px] font-semibold tracking-[-0.03em]">{coin.name}</p>
                    <span className="shrink-0 rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[12px] font-medium">
                      {statusLabel(coin.status)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[14px] text-[var(--muted)]">
                    ${coin.symbol}
                    <span className="px-1.5">·</span>
                    <span className="font-mono">{shortWallet(coin.mint)}</span>
                  </p>
                  <p className="mt-1 truncate text-[13px] text-[var(--muted)]">@{coin.xHandle}</p>
                </div>
              </div>
              {coin.promise ? (
                <p className="mt-4 line-clamp-2 text-[15px] leading-relaxed">{coin.promise}</p>
              ) : null}
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-black/[0.06] pt-4">
                <Mini label="Vault" value={`${formatSol(coin.balanceSol)} SOL`} />
                <Mini label="Paid" value={`${formatSol(coin.releasedSol)} SOL`} tone="text-[var(--pay)]" />
                <Mini label="Burned" value={`${formatSol(coin.burnedSol)} SOL`} tone="text-[var(--burn)]" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {!error && coins.length === 0 ? (
        <p className={`${panel} mt-8 p-8 text-[17px] text-[var(--muted)]`}>
          No live coins yet.{" "}
          <Link href="/demo" className="text-[var(--ink)] underline">
            Open the demo coins
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}

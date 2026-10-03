"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type BurnRow } from "@/lib/api";
import { formatSol, formatStamp, formatTokens } from "@/lib/format";
import { num, panel, textLink } from "@/components/surface";

const TxLink = ({ sig, label }: { sig: string | null; label: string }) => {
  if (!sig) {
    return <span className="text-[var(--muted)]">{label}: Pending</span>;
  }
  return (
    <a
      className={`${textLink} ${num}`}
      href={`https://solscan.io/tx/${sig}`}
      target="_blank"
      rel="noreferrer"
    >
      {label} on Solscan
    </a>
  );
};

export const BurnsList = () => {
  const [burns, setBurns] = useState<BurnRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const data = await api<{ burns: BurnRow[] }>("/v1/burns?scope=live");
        if (!stop) {
          setBurns(data.burns);
          setNowMs(Date.now());
        }
      } catch (err) {
        if (!stop) {
          setError(err instanceof Error ? err.message : "Could not load burns");
        }
      } finally {
        if (!stop) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      stop = true;
    };
  }, []);

  if (error) {
    return <p className="mt-6 text-[var(--burn)]">{error}</p>;
  }
  if (loading && burns.length === 0) {
    return <p className="mt-6 text-[var(--muted)]">Loading</p>;
  }
  if (burns.length === 0) {
    return <p className={`${panel} mt-6 p-8 text-[17px] text-[var(--muted)]`}>No burns yet.</p>;
  }

  return (
    <ul className="mt-6 space-y-3">
      {burns.map((burn) => {
        const stamp = formatStamp(burn.atMs, nowMs);
        const tokenAmount = formatTokens(burn.tokens);
        return (
          <li key={burn.id} className={`${panel} p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
              <p className="text-[16px] font-semibold tracking-[-0.02em]">
                <Link href={`/c/${burn.mint}`} className={`${textLink} text-[var(--ink)]`}>
                  {burn.name || "Coin"} <span className="text-[var(--muted)]">${burn.symbol}</span>
                </Link>
              </p>
              <p className={`shrink-0 text-[16px] font-semibold ${num}`}>{formatSol(burn.amountSol)} SOL</p>
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink)]">{burn.reason}</p>
            <p className={`mt-2 text-[14px] text-[var(--muted)] ${num}`}>
              {tokenAmount === "Pending" ? "Tokens burned: Pending" : `Burned ${tokenAmount} $${burn.tokenSymbol}`}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
              <TxLink sig={burn.buySig} label="Buy" />
              <TxLink sig={burn.burnSig} label="Burn" />
              <time dateTime={new Date(burn.atMs).toISOString()} title={stamp.title} className={`text-[var(--muted)] ${num}`}>
                {stamp.label}
              </time>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

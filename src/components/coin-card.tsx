"use client";

import Link from "next/link";
import { useState } from "react";
import type { CoinCard as CoinCardData } from "@/lib/api";
import { formatIn, formatSol, formatStamp, promiseLabel } from "@/lib/format";
import { shortWallet } from "@/lib/wallet";
import { RecordChips, StatusBlock } from "@/components/status-block";
import { focusRing, num, panel } from "@/components/surface";
import { VerifiedTick } from "@/components/verified-tick";

const countdown = (coin: CoinCardData, nowMs: number) => {
  const current = coin.current;
  if (!current) {
    return "";
  }
  if (current.status === "vote_open" && current.voteEndMs) {
    return `Vote ends ${formatIn(current.voteEndMs, nowMs)}`;
  }
  if (current.status === "pending") {
    return `Due ${formatIn(current.deadlineMs, nowMs)}`;
  }
  return coin.closedAtMs ? `Closed ${formatStamp(coin.closedAtMs, nowMs).label}` : promiseLabel(current.status);
};

const CoinImage = ({ coin }: { coin: CoinCardData }) => {
  const [failed, setFailed] = useState(false);
  if (coin.image && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={coin.image}
        alt=""
        onError={() => setFailed(true)}
        className="h-12 w-12 shrink-0 rounded-[16px] bg-[#f5f5f7] object-cover"
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-[#f5f5f7] text-[18px] font-semibold text-[var(--muted)]"
    >
      {coin.symbol.slice(0, 1)}
    </div>
  );
};

export const CoinCard = ({ coin, nowMs }: { coin: CoinCardData; nowMs: number }) => (
  <Link
    href={`/c/${coin.mint}`}
    aria-label={`${coin.name}, $${coin.symbol}`}
    className={`${panel} flex h-full flex-col p-4 transition hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:p-5 ${focusRing}`}
  >
    <div className="flex items-start gap-3">
      <CoinImage coin={coin} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="truncate text-[18px] font-semibold tracking-[-0.03em]">{coin.name}</p>
          {coin.current ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[12px] font-medium">
              <StatusBlock status={coin.current.status} size={8} />
              {promiseLabel(coin.current.status)}
            </span>
          ) : null}
        </div>
        <p className="mt-1 truncate text-[14px] text-[var(--muted)]">
          ${coin.symbol}
          <span className="px-1.5">·</span>
          <span className={num}>{shortWallet(coin.mint)}</span>
        </p>
        <p className="mt-1 flex items-center gap-1 truncate text-[13px] text-[var(--muted)]">
          @{coin.xHandle}
          <VerifiedTick verified={coin.verified} />
        </p>
      </div>
    </div>
    {coin.current ? (
      <p className="mt-4 line-clamp-2 text-[15px] leading-relaxed">{coin.current.text}</p>
    ) : null}
    <div className="flex-1" />
    <div className="mt-4 flex items-end justify-between gap-3 border-t border-black/[0.06] pt-4">
      <div className="min-w-0">
        <p className="text-[12px] text-[var(--muted)]">Vault</p>
        <p className={`mt-0.5 text-[15px] font-semibold ${num}`}>{formatSol(coin.balanceSol)} SOL</p>
      </div>
      <div className="min-w-0 text-right">
        <p className={`text-[12px] text-[var(--muted)] ${num}`}>{countdown(coin, nowMs)}</p>
        <div className="mt-1.5 flex justify-end">
          <RecordChips record={coin.record} />
        </div>
      </div>
    </div>
  </Link>
);

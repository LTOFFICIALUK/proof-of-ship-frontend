"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type CoinCard as CoinCardData, type CoinList, type SiteStats, type TopBuilder } from "@/lib/api";
import { formatCount, formatSol } from "@/lib/format";
import { CoinCard } from "@/components/coin-card";
import { focusRing, num, panel, textLink } from "@/components/surface";
import { Misted } from "@/components/text-mist";
import { VerifiedTick } from "@/components/verified-tick";

type Rows = {
  launched: CoinCardData[];
  voting: CoinCardData[];
  shipped: CoinCardData[];
  burned: CoinCardData[];
};

const ROWS: { id: keyof Rows; title: string; empty: string }[] = [
  { id: "launched", title: "Coins", empty: "No coins yet." },
  { id: "voting", title: "Voting now", empty: "No votes are open right now." },
  { id: "shipped", title: "Recently shipped", empty: "Nothing has shipped yet." },
  { id: "burned", title: "Recently burned", empty: "Nothing has burned yet." },
];

const LinkArrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-1.5 h-3.5 w-3.5 shrink-0 text-[var(--muted)] transition group-hover:text-[var(--ink)]">
    <path
      d="M4.5 11.5 L11.5 4.5 M6.5 4.5 H11.5 V9.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StripItem = ({ label, value, href }: { label: string; value: string; href?: string }) => {
  const body = (
    <>
      <span className="flex items-start justify-between gap-2">
        <span className={`truncate text-[20px] font-semibold tracking-[-0.03em] sm:text-[24px] ${num}`}>{value}</span>
        {href ? <LinkArrow /> : null}
      </span>
      <span className="mt-1 block text-[12px] text-[var(--muted)]">{label}</span>
    </>
  );
  if (!href) {
    return <div className="min-w-0 px-4 py-4 sm:px-5">{body}</div>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${label}, ${value}. Opens in a new tab`}
      className={`group min-w-0 px-4 py-4 transition hover:bg-black/[0.03] sm:px-5 ${focusRing}`}
    >
      {body}
    </a>
  );
};

export const LiveStrip = () => {
  const [stats, setStats] = useState<SiteStats | null>(null);

  useEffect(() => {
    void api<SiteStats>("/v1/stats?scope=live")
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const value = (render: (data: SiteStats) => string) => (stats ? render(stats) : "Pending");

  return (
    <section aria-label="Live totals" className={`${panel} mx-auto mt-4 max-w-[980px] overflow-hidden`}>
      <div className="grid grid-cols-2 sm:grid-cols-5 [&>*]:border-black/[0.06] [&>*:nth-child(even)]:border-l sm:[&>*+*]:border-l [&>*:nth-child(n+3)]:border-t sm:[&>*:nth-child(n+3)]:border-t-0">
        <StripItem label="Coins launched" value={value((data) => formatCount(data.launched))} />
        <StripItem label="SOL locked in vaults" value={value((data) => formatSol(data.lockedSol))} />
        <StripItem label="SOL paid to builders" value={value((data) => formatSol(data.paidSol))} />
        <StripItem label="SOL burned" value={value((data) => formatSol(data.burnedSol))} href="/burns" />
        <StripItem
          label="Promises shipped and missed"
          value={value((data) => `${formatCount(data.shipped)} / ${formatCount(data.missed)}`)}
        />
      </div>
    </section>
  );
};

export const HomeRows = () => {
  const [rows, setRows] = useState<Rows | null>(null);
  const [builders, setBuilders] = useState<TopBuilder[]>([]);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const load = async () => {
      const [launched, voting, shipped, burned, top] = await Promise.all([
        api<CoinList>("/v1/coins?filter=all&scope=live"),
        api<CoinList>("/v1/coins?filter=voting&scope=live"),
        api<CoinList>("/v1/coins?filter=shipped&scope=live"),
        api<CoinList>("/v1/coins?filter=burned&scope=live"),
        api<{ builders: TopBuilder[] }>("/v1/builders?scope=live"),
      ]);
      setRows({
        launched: launched.coins.slice(0, 4),
        voting: voting.coins.slice(0, 4),
        shipped: shipped.coins.slice(0, 4),
        burned: burned.coins.slice(0, 4),
      });
      setBuilders(top.builders.slice(0, 5));
      setNowMs(Date.now());
    };
    void load().catch(() => setRows({ launched: [], voting: [], shipped: [], burned: [] }));
  }, []);

  return (
    <div className="mx-auto mt-16 max-w-[980px] space-y-12">
      {ROWS.map((row) => (
        <section key={row.id} aria-labelledby={`row-${row.id}`}>
          <Misted cover>
            <div className="flex items-baseline justify-between gap-4">
              <h2 id={`row-${row.id}`} className="text-[24px] font-semibold tracking-[-0.03em]">
                {row.title}
              </h2>
              <Link href="/coins" className={`${textLink} text-[14px]`}>
                All coins
              </Link>
            </div>
          </Misted>
          {rows && rows[row.id].length ? (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {rows[row.id].map((coin) => (
                <li key={coin.mint}>
                  <CoinCard coin={coin} nowMs={nowMs} />
                </li>
              ))}
            </ul>
          ) : (
            <p className={`${panel} mt-4 p-6 text-[15px] text-[var(--muted)]`}>
              {rows ? row.empty : "Loading"}
            </p>
          )}
        </section>
      ))}
      <section aria-labelledby="row-builders">
        <Misted cover>
          <h2 id="row-builders" className="text-[24px] font-semibold tracking-[-0.03em]">
            Top builders
          </h2>
        </Misted>
        {builders.length ? (
          <ol className={`${panel} mt-4 divide-y divide-black/[0.06] overflow-hidden`}>
            {builders.map((builder, index) => (
              <li key={builder.handle}>
                <Link
                  href={`/b/${builder.handle}`}
                  className={`flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-black/[0.02] ${focusRing}`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className={`w-5 text-[14px] text-[var(--muted)] ${num}`}>{index + 1}</span>
                    <span className="truncate text-[16px] font-medium">@{builder.handle}</span>
                    <VerifiedTick verified={builder.verified} />
                  </span>
                  <span className={`shrink-0 text-[14px] text-[var(--muted)] ${num}`}>
                    {builder.shipped} shipped
                    {builder.onTimePct === null ? "" : `, ${builder.onTimePct}% on time`}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className={`${panel} mt-4 p-6 text-[15px] text-[var(--muted)]`}>
            No builder has finished a promise yet.
          </p>
        )}
      </section>
    </div>
  );
};

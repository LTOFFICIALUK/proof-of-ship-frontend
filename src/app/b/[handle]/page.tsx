"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type BuilderView } from "@/lib/api";
import { formatSol, formatStamp, formatTokens, promiseLabel } from "@/lib/format";
import { num, pageTitle, panel, textLink } from "@/components/surface";
import { RecordChips, StatusBlock } from "@/components/status-block";
import { Misted } from "@/components/text-mist";
import { VerifiedTick } from "@/components/verified-tick";

export default function BuilderPage() {
  const params = useParams<{ handle: string }>();
  const [builder, setBuilder] = useState<BuilderView | null>(null);
  const [error, setError] = useState("");
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const load = async () => {
      try {
        setBuilder(await api<BuilderView>(`/v1/builders/${params.handle}`));
        setNowMs(Date.now());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load builder");
      }
    };
    void load();
  }, [params.handle]);

  if (error) {
    return (
      <Misted className="mx-auto max-w-3xl">
        <p className="text-[var(--burn)]">{error}</p>
      </Misted>
    );
  }
  if (!builder) {
    return (
      <Misted className="mx-auto max-w-3xl">
        <p className="text-[var(--muted)]">Loading</p>
      </Misted>
    );
  }

  const stats = [
    { label: "Shipped", value: String(builder.stats.shipped) },
    { label: "Missed", value: String(builder.stats.missed) },
    { label: "Burned", value: String(builder.stats.burned) },
    { label: "Rolled over", value: String(builder.stats.rolled) },
    { label: "On time", value: builder.stats.onTimePct === null ? "Pending" : `${builder.stats.onTimePct}%` },
    { label: "SOL paid", value: `${formatSol(builder.stats.earnedSol)} SOL` },
    { label: "$POS bought", value: formatTokens(builder.stats.posBought) },
    { label: "SOL burned", value: `${formatSol(builder.stats.burnedSol)} SOL` },
    { label: "Coins", value: `${builder.stats.launches} launched, ${builder.stats.abandoned} abandoned` },
  ];

  return (
    <div className="mx-auto max-w-[720px] pt-4">
      <Misted cover>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={`${pageTitle} inline-flex items-center gap-2`}>
            @{builder.handle}
            <VerifiedTick verified={builder.verified} />
          </h1>
          <p className="mt-2 break-all font-mono text-[13px] text-[var(--muted)]">{builder.wallet}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/b/${builder.handle}/badge.svg`} alt={`${builder.handle} badge`} className="h-7" />
      </div>
      </Misted>
      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`${panel} p-4`}>
            <p className="text-sm text-[var(--muted)]">{stat.label}</p>
            <p className={`mt-2 text-[20px] font-semibold tracking-[-0.03em] ${num}`}>{stat.value}</p>
          </div>
        ))}
      </section>
      <Misted cover className="mt-10">
        <h2 className="text-[22px] font-semibold tracking-[-0.03em]">Coins</h2>
      </Misted>
      <ul className="mt-4 space-y-3">
        {builder.projects.map((project) => (
          <li key={project.mint}>
            <Link
              href={`/c/${project.mint}`}
              className={`${panel} flex flex-wrap items-center justify-between gap-3 p-4 transition hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:p-5`}
            >
              <span>
                {project.name} <span className="text-[var(--muted)]">(${project.symbol})</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <RecordChips record={project.record} />
                <span className="rounded-full bg-black/[0.05] px-3 py-1 text-[13px] font-medium text-[var(--ink)]">
                  {project.status}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Misted cover className="mt-10">
        <h2 className="text-[22px] font-semibold tracking-[-0.03em]">Promise record</h2>
      </Misted>
      <ol className="mt-4 space-y-3">
        {builder.timeline.map((item) => (
          <li key={`${item.mint}-${item.idx}`} className={`${panel} p-4 sm:p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href={`/c/${item.mint}`} className={`${textLink} text-[var(--ink)]`}>
                {item.name} <span className="text-[var(--muted)]">${item.symbol}</span>
              </Link>
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium">
                <StatusBlock status={item.status} size={8} />
                {promiseLabel(item.status)}
              </span>
            </div>
            <p className="mt-2 text-[16px]">{item.text}</p>
            <p className={`mt-1 text-[13px] text-[var(--muted)] ${num}`}>
              {item.closedAtMs ? formatStamp(item.closedAtMs, nowMs).label : formatStamp(item.postedAtMs, nowMs).label}
            </p>
            {item.proofUrl ? (
              <a className={`${textLink} mt-2 inline-block text-[13px]`} href={item.proofUrl} target="_blank" rel="noreferrer">
                Proof
              </a>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

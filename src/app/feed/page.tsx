"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type FeedEvent } from "@/lib/api";
import { describeEvent, feedLabel, formatStamp } from "@/lib/format";
import { FilterTabs } from "@/components/filter-tabs";
import { num, pageTitle, panel, textLink } from "@/components/surface";
import { Misted } from "@/components/text-mist";

type Filter = "all" | "shipped" | "burned" | "coins" | "promises";

const TABS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "shipped", label: "Shipped" },
  { id: "burned", label: "Burned" },
  { id: "coins", label: "New coins" },
  { id: "promises", label: "New promises" },
];

const tone = (kind: string) => {
  if (kind === "vote_pay") {
    return "text-[var(--pay)]";
  }
  if (["vote_burn", "miss", "burn", "lapse", "abandon"].includes(kind)) {
    return "text-[var(--burn)]";
  }
  return "text-[var(--muted)]";
};

export default function FeedPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    let stop = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api<{ events: FeedEvent[] }>(`/v1/feed?filter=${filter}`);
        if (!stop) {
          setEvents(data.events);
          setNowMs(Date.now());
        }
      } catch (err) {
        if (!stop) {
          setError(err instanceof Error ? err.message : "Could not load feed");
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
  }, [filter]);

  return (
    <div className="mx-auto max-w-[720px] pt-4">
      <Misted cover>
        <h1 className={pageTitle}>Ship feed</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-[var(--muted)]">
          Every launch, promise, pay, and burn, newest first. Pay pays the builder in SOL. Burn buys $POS.
        </p>
      </Misted>
      <div className="mt-8">
        <FilterTabs tabs={TABS} value={filter} label="Filter events" panelId="feed-results" onChange={setFilter} />
      </div>
      <div id="feed-results" role="tabpanel" aria-labelledby={`feed-results-tab-${filter}`} aria-busy={loading}>
        {error ? (
          <Misted>
            <p className="mt-6 text-[var(--burn)]">{error}</p>
          </Misted>
        ) : null}
        <ul className="mt-5 space-y-3">
          {events.map((event) => {
            const stamp = formatStamp(event.atMs, nowMs);
            return (
              <li key={event.id} className={`${panel} p-5`}>
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                  <p className={`text-[13px] font-medium ${tone(event.kind)}`}>{feedLabel(event.kind)}</p>
                  <time
                    dateTime={new Date(event.atMs).toISOString()}
                    title={stamp.title}
                    className={`shrink-0 text-[13px] text-[var(--muted)] ${num}`}
                  >
                    {stamp.label}
                  </time>
                </div>
                <p className="mt-2 text-[16px] font-semibold tracking-[-0.02em]">
                  <Link href={`/c/${event.mint}`} className={`${textLink} text-[var(--ink)]`}>
                    {event.name || "Coin"} <span className="text-[var(--muted)]">${event.symbol}</span>
                  </Link>
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-[var(--ink)]">{describeEvent(event)}</p>
                <p className="mt-2 text-[13px] text-[var(--muted)]">
                  {event.sig ? (
                    <a
                      className={`${textLink} ${num}`}
                      href={`https://solscan.io/tx/${event.sig}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View transaction
                    </a>
                  ) : (
                    "Transaction: Pending"
                  )}
                </p>
              </li>
            );
          })}
        </ul>
        {!loading && !error && events.length === 0 ? (
          <p className={`${panel} mt-5 p-8 text-[17px] text-[var(--muted)]`}>No events yet.</p>
        ) : null}
        {loading && events.length === 0 ? (
          <Misted>
            <p className="mt-6 text-[var(--muted)]">Loading</p>
          </Misted>
        ) : null}
      </div>
    </div>
  );
}

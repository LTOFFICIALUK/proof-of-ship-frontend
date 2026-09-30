"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type FeedEvent } from "@/lib/api";
import { feedLabel, formatWhen } from "@/lib/format";
import { pageTitle, panel } from "@/components/surface";

export default function FeedPage() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api<{ events: FeedEvent[] }>("/v1/feed");
        setEvents(data.events);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load feed");
      }
    };
    void load();
  }, []);

  return (
    <div className="mx-auto max-w-[720px] pt-4">
      <h1 className={pageTitle}>Ship feed</h1>
      {error ? <p className="mt-6 text-[var(--burn)]">{error}</p> : null}
      <ul className="mt-8 space-y-3">
        {events.map((event) => (
          <li key={event.id}>
            <Link
              href={`/c/${event.mint}`}
              className={`${panel} block p-5 transition hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] font-medium text-[var(--link)]">{feedLabel(event.kind)}</p>
                  <p className="mt-1 font-mono text-[13px] text-[var(--ink)]">
                    {event.mint.slice(0, 8)}…{event.mint.slice(-4)}
                  </p>
                </div>
                <p className="shrink-0 text-[13px] text-[var(--muted)]">{formatWhen(event.atMs)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {!error && events.length === 0 ? (
        <p className={`${panel} mt-8 p-8 text-[17px] text-[var(--muted)]`}>No events yet.</p>
      ) : null}
    </div>
  );
}

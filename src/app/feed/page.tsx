"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type FeedEvent } from "@/lib/api";
import { feedLabel, formatWhen } from "@/lib/format";

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
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-4xl">Ship feed</h1>
      {error ? <p className="mt-6 text-[var(--burn)]">{error}</p> : null}
      <ul className="mt-8 space-y-3">
        {events.map((event) => (
          <li
            key={event.id}
            className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4"
          >
            <p className="text-sm text-[var(--stamp)]">{feedLabel(event.kind)}</p>
            <Link className="mt-1 block font-mono text-sm" href={`/c/${event.mint}`}>
              {event.mint.slice(0, 8)}…{event.mint.slice(-4)}
            </Link>
            <p className="mt-2 text-sm text-[var(--muted)]">{formatWhen(event.atMs)}</p>
          </li>
        ))}
      </ul>
      {!error && events.length === 0 ? (
        <p className="mt-8 text-[var(--muted)]">No events yet.</p>
      ) : null}
    </div>
  );
}

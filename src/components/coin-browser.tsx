"use client";

import { useEffect, useState } from "react";
import { api, type CoinCard as CoinCardData, type CoinList } from "@/lib/api";
import { CoinCard } from "@/components/coin-card";
import { FilterTabs } from "@/components/filter-tabs";
import { btnGhost, panel } from "@/components/surface";
import { Misted } from "@/components/text-mist";

type Filter = "voting" | "due" | "shipped" | "burned" | "all";

const TABS: { id: Filter; label: string; empty: string }[] = [
  { id: "voting", label: "Voting now", empty: "No votes are open right now." },
  { id: "due", label: "Due soon", empty: "No promises are waiting for proof." },
  { id: "shipped", label: "Recently shipped", empty: "Nothing has shipped yet." },
  { id: "burned", label: "Recently burned", empty: "Nothing has burned yet." },
  { id: "all", label: "All", empty: "No coins yet." },
];

export const CoinBrowser = ({ scope }: { scope: "live" | "demo" }) => {
  const [filter, setFilter] = useState<Filter>("all");
  const [coins, setCoins] = useState<CoinCardData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const query = new URLSearchParams({ filter, page: String(page) });
        if (scope === "demo") {
          query.set("scope", "demo");
        }
        const data = await api<CoinList>(`/v1/coins?${query.toString()}`);
        if (stop) {
          return;
        }
        setCoins((previous) => (page === 1 ? data.coins : [...previous, ...data.coins]));
        setHasMore(data.hasMore);
      } catch (err) {
        if (!stop) {
          setError(err instanceof Error ? err.message : "Could not load coins");
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
  }, [filter, page, scope]);

  const handleSelect = (next: Filter) => {
    if (next === filter) {
      return;
    }
    setCoins([]);
    setPage(1);
    setFilter(next);
  };

  const active = TABS.find((tab) => tab.id === filter) ?? TABS[TABS.length - 1];

  return (
    <div>
      <div className="mt-8">
        <FilterTabs tabs={TABS} value={filter} label="Filter coins" panelId="coin-results" onChange={handleSelect} />
      </div>
      <div id="coin-results" role="tabpanel" aria-labelledby={`coin-results-tab-${filter}`} aria-busy={loading}>
        {error ? (
          <Misted>
            <p className="mt-6 text-[var(--burn)]">{error}</p>
          </Misted>
        ) : null}
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {coins.map((coin) => (
            <li key={coin.mint}>
              <CoinCard coin={coin} nowMs={nowMs} />
            </li>
          ))}
        </ul>
        {!loading && !error && coins.length === 0 ? (
          <p className={`${panel} mt-5 p-8 text-[17px] text-[var(--muted)]`}>
            {active.empty}
            {scope === "live" && filter === "all" ? " Launch a coin to see it here." : null}
          </p>
        ) : null}
        {loading && coins.length === 0 ? (
          <Misted>
            <p className="mt-6 text-[var(--muted)]">Loading</p>
          </Misted>
        ) : null}
        {hasMore ? (
          <div className="mt-6 flex justify-center">
            <button type="button" className={btnGhost} disabled={loading} onClick={() => setPage((value) => value + 1)}>
              {loading ? "Loading" : "Show more"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, type ProjectView } from "@/lib/api";

const DAY = 24 * 60 * 60 * 1000;

export default function LaunchPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [promise, setPromise] = useState("");
  const [days, setDays] = useState("7");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setBusy(true);
    try {
      const deadlineMs = Date.now() + Number(days) * DAY;
      const project = await api<ProjectView>("/v1/projects", {
        method: "POST",
        body: JSON.stringify({
          wallet: wallet.trim(),
          xHandle: xHandle.trim(),
          name: name.trim(),
          symbol: symbol.trim(),
          promises: [{ text: promise.trim(), deadlineMs }],
        }),
      });
      router.push(`/c/${project.mint}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Launch failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-serif text-4xl">Launch</h1>
      <p className="mt-3 text-[var(--muted)]">
        One promise is enough. You can add more after. Deadline must be within
        14 days.
      </p>
      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <label className="block text-sm">
          Wallet
          <input
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2"
            value={wallet}
            onChange={(event) => setWallet(event.target.value)}
            required
            aria-label="Wallet"
          />
        </label>
        <label className="block text-sm">
          X handle
          <input
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2"
            value={xHandle}
            onChange={(event) => setXHandle(event.target.value)}
            required
            aria-label="X handle"
          />
        </label>
        <label className="block text-sm">
          Coin name
          <input
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            aria-label="Coin name"
          />
        </label>
        <label className="block text-sm">
          Ticker
          <input
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2"
            value={symbol}
            onChange={(event) => setSymbol(event.target.value)}
            required
            aria-label="Ticker"
          />
        </label>
        <label className="block text-sm">
          First promise
          <textarea
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2"
            value={promise}
            onChange={(event) => setPromise(event.target.value)}
            required
            rows={3}
            aria-label="First promise"
          />
        </label>
        <label className="block text-sm">
          Days until vote
          <input
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2"
            type="number"
            min={1}
            max={14}
            value={days}
            onChange={(event) => setDays(event.target.value)}
            aria-label="Days until vote"
          />
        </label>
        {error ? <p className="text-[var(--burn)]">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-[var(--pay)] px-6 py-3 font-medium text-black disabled:opacity-50"
        >
          {busy ? "Launching" : "Launch"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, type ProjectView } from "@/lib/api";
import { btnPrimary, field, labelClass, pageTitle, panel } from "@/components/surface";

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
    <div className="mx-auto max-w-[560px] pt-4">
      <h1 className={pageTitle}>Launch</h1>
      <p className="mt-3 text-[17px] leading-relaxed text-[var(--muted)]">
        One promise is enough. You can add more after. Deadline must be within
        14 days.
      </p>
      <form
        className={`${panel} mt-8 space-y-5 p-6 md:p-8`}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <label className={labelClass}>
          Wallet
          <input
            className={field}
            value={wallet}
            onChange={(event) => setWallet(event.target.value)}
            required
            aria-label="Wallet"
          />
        </label>
        <label className={labelClass}>
          X handle
          <input
            className={field}
            value={xHandle}
            onChange={(event) => setXHandle(event.target.value)}
            required
            aria-label="X handle"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <label className={labelClass}>
            Coin name
            <input
              className={field}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              aria-label="Coin name"
            />
          </label>
          <label className={labelClass}>
            Ticker
            <input
              className={field}
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              required
              aria-label="Ticker"
            />
          </label>
        </div>
        <label className={labelClass}>
          First promise
          <textarea
            className={field}
            value={promise}
            onChange={(event) => setPromise(event.target.value)}
            required
            rows={3}
            aria-label="First promise"
          />
        </label>
        <label className={labelClass}>
          Days until vote
          <input
            className={field}
            type="number"
            min={1}
            max={14}
            value={days}
            onChange={(event) => setDays(event.target.value)}
            aria-label="Days until vote"
          />
        </label>
        {error ? <p className="text-sm text-[var(--burn)]">{error}</p> : null}
        <button type="submit" disabled={busy} className={`${btnPrimary} mt-2 px-6 py-3 text-[17px]`}>
          {busy ? "Launching" : "Launch"}
        </button>
      </form>
    </div>
  );
}

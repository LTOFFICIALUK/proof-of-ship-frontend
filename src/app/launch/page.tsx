"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, type ProjectView } from "@/lib/api";
import { useWallet } from "@/lib/wallet";
import { ConnectWallet } from "@/components/connect-wallet";
import { btnPrimary, field, labelClass, pageTitle, panel } from "@/components/surface";

const DAY = 24 * 60 * 60 * 1000;

export default function LaunchPage() {
  const router = useRouter();
  const { wallet, xHandle, refresh } = useWallet();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [promise, setPromise] = useState("");
  const [days, setDays] = useState("7");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLinkX = async () => {
    setError("");
    try {
      const data = await api<{ url: string }>("/v1/x/connect");
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open X");
    }
  };

  const handleSubmit = async () => {
    setError("");
    setBusy(true);
    try {
      await refresh();
      const deadlineMs = Date.now() + Number(days) * DAY;
      const project = await api<ProjectView>("/v1/projects", {
        method: "POST",
        body: JSON.stringify({
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
        One promise is enough. You can add more after. Deadline must be within 14 days.
      </p>
      <p className="mt-3 text-[15px] text-[var(--muted)]">on pump.fun</p>
      <p className="mt-2 text-[15px] text-[var(--muted)]">
        This launch is a demo until the on chain launch is ready. It will not create a pump.fun coin yet.
      </p>
      <form
        className={`${panel} mt-8 space-y-5 p-4 sm:p-6 md:p-8`}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <div>
          <p className={labelClass}>Wallet</p>
          {wallet ? (
            <p className="mt-2 font-mono text-[15px]">{wallet}</p>
          ) : (
            <div className="mt-2">
              <ConnectWallet />
            </div>
          )}
        </div>
        <div>
          <p className={labelClass}>X</p>
          {xHandle ? (
            <p className="mt-2 text-[15px]">@{xHandle}</p>
          ) : (
            <button type="button" onClick={() => void handleLinkX()} className={`${btnPrimary} mt-2 px-4 py-2 text-[14px]`} disabled={!wallet}>
              Link X
            </button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <label className={labelClass}>
            Coin name
            <input className={field} value={name} onChange={(event) => setName(event.target.value)} required aria-label="Coin name" />
          </label>
          <label className={labelClass}>
            Ticker
            <input className={field} value={symbol} onChange={(event) => setSymbol(event.target.value)} required aria-label="Ticker" />
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
          Days until the deadline
          <input
            className={`${field} max-w-[8rem]`}
            type="number"
            min={3}
            max={14}
            value={days}
            onChange={(event) => setDays(event.target.value)}
            aria-label="Days until the deadline"
          />
        </label>
        {error ? <p className="text-sm text-[var(--burn)]">{error}</p> : null}
        <button type="submit" disabled={busy || !wallet || !xHandle} className={`${btnPrimary} mt-2 px-6 py-3 text-[17px]`}>
          {busy ? "Launching" : "Launch"}
        </button>
      </form>
    </div>
  );
}

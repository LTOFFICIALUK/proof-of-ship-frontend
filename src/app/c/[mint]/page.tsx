"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type ProjectView } from "@/lib/api";
import { formatSol, formatWhen, promiseLabel } from "@/lib/format";

export default function ShipPage() {
  const params = useParams<{ mint: string }>();
  const mint = params.mint;
  const [project, setProject] = useState<ProjectView | null>(null);
  const [error, setError] = useState("");
  const [wallet, setWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [nextPromise, setNextPromise] = useState("");
  const [nextDays, setNextDays] = useState("7");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setProject(await api<ProjectView>(`/v1/projects/${mint}`));
  };

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load coin");
    });
    // mint is the route param
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mint]);

  const handleVote = async (side: "pay" | "burn") => {
    setBusy(true);
    setError("");
    try {
      await api(`/v1/projects/${mint}/vote`, {
        method: "POST",
        body: JSON.stringify({ wallet: wallet.trim(), side, amount }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vote failed");
    } finally {
      setBusy(false);
    }
  };

  const handleAppend = async () => {
    setBusy(true);
    setError("");
    try {
      await api(`/v1/projects/${mint}/promises`, {
        method: "POST",
        body: JSON.stringify({
          wallet: wallet.trim(),
          text: nextPromise.trim(),
          deadlineMs: Date.now() + Number(nextDays) * 24 * 60 * 60 * 1000,
        }),
      });
      setNextPromise("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add promise");
    } finally {
      setBusy(false);
    }
  };

  if (!project && !error) {
    return <p className="mx-auto max-w-3xl text-[var(--muted)]">Loading</p>;
  }
  if (!project) {
    return <p className="mx-auto max-w-3xl text-[var(--burn)]">{error}</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm uppercase tracking-[0.2em] text-[var(--stamp)]">
        ${project.symbol} · {project.status}
      </p>
      <h1 className="mt-2 font-serif text-4xl">{project.name}</h1>
      <p className="mt-2 text-[var(--muted)]">
        Builder{" "}
        <Link className="text-[var(--ink)] underline" href={`/b/${project.xHandle}`}>
          @{project.xHandle}
        </Link>
      </p>
      <p className="mt-1 break-all font-mono text-xs text-[var(--muted)]">{project.mint}</p>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4">
          <p className="text-sm text-[var(--muted)]">Vault</p>
          <p className="font-serif text-3xl">{formatSol(project.vault.balanceSol)} SOL</p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4">
          <p className="text-sm text-[var(--muted)]">Paid to builder</p>
          <p className="font-serif text-3xl text-[var(--pay)]">
            {formatSol(project.vault.releasedSol)} SOL
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4">
          <p className="text-sm text-[var(--muted)]">Burned</p>
          <p className="font-serif text-3xl text-[var(--burn)]">
            {formatSol(project.vault.burnedSol)} SOL
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Promises</h2>
        <ul className="mt-4 space-y-3">
          {project.promises.map((item) => (
            <li
              key={item.idx}
              className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4"
            >
              <div className="flex justify-between gap-3 text-sm text-[var(--muted)]">
                <span>{promiseLabel(item.status)}</span>
                <span>{formatWhen(item.deadlineMs)}</span>
              </div>
              <p className="mt-2">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {project.vote ? (
        <section className="mt-10 rounded-2xl border border-[var(--pay)]/40 bg-[var(--paper)] p-5">
          <h2 className="font-serif text-2xl">Vote open</h2>
          <p className="mt-2 text-[var(--muted)]">
            Pay {project.vote.payWeight} · Burn {project.vote.burnWeight} · Closes{" "}
            {formatWhen(project.vote.endMs)}
          </p>
          <label className="mt-4 block text-sm">
            Your wallet
            <input
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2"
              value={wallet}
              onChange={(event) => setWallet(event.target.value)}
              aria-label="Voter wallet"
            />
          </label>
          <label className="mt-3 block text-sm">
            Coins to lock
            <input
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              aria-label="Vote amount"
            />
          </label>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleVote("pay")}
              className="rounded-full bg-[var(--pay)] px-5 py-2 font-medium text-black"
            >
              Vote pay
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleVote("burn")}
              className="rounded-full bg-[var(--burn)] px-5 py-2 font-medium text-black"
            >
              Vote burn
            </button>
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Add the next promise</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Builder wallet required. If the last vote is done, you have 7 days.
        </p>
        <label className="mt-3 block text-sm">
          Builder wallet
          <input
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2"
            value={wallet}
            onChange={(event) => setWallet(event.target.value)}
            aria-label="Builder wallet"
          />
        </label>
        <textarea
          className="mt-3 w-full rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2"
          value={nextPromise}
          onChange={(event) => setNextPromise(event.target.value)}
          aria-label="Next promise"
          rows={3}
        />
        <input
          className="mt-3 w-24 rounded-xl border border-[var(--line)] bg-black/40 px-3 py-2"
          type="number"
          min={1}
          max={14}
          value={nextDays}
          onChange={(event) => setNextDays(event.target.value)}
          aria-label="Days until next vote"
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleAppend()}
          className="ml-3 rounded-full border border-[var(--line)] px-5 py-2"
        >
          Post promise
        </button>
      </section>

      {error ? <p className="mt-4 text-[var(--burn)]">{error}</p> : null}
    </div>
  );
}

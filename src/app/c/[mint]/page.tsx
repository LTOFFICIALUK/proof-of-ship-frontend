"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type ProjectView } from "@/lib/api";
import { formatSol, formatWhen, promiseLabel } from "@/lib/format";
import { PumpMark } from "@/components/pump-mark";
import { HolderChat } from "@/components/holder-chat";
import { btnBurn, btnGhost, btnPay, field, labelClass, pageTitle, panel, textLink } from "@/components/surface";

const promiseTone = (status: string) => {
  if (status === "paid" || status === "vote_open") {
    return "text-[var(--pay)]";
  }
  if (status === "burned") {
    return "text-[var(--burn)]";
  }
  if (status === "pending") {
    return "text-[var(--ink)]";
  }
  return "text-[var(--muted)]";
};

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

  const payWeight = Number(project.vote?.payWeight ?? 0);
  const burnWeight = Number(project.vote?.burnWeight ?? 0);
  const weightTotal = payWeight + burnWeight;
  const payShare = weightTotal === 0 ? 50 : (payWeight / weightTotal) * 100;

  return (
    <div className="mx-auto max-w-[720px] pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[15px] font-medium text-[var(--muted)]">${project.symbol}</p>
        <PumpMark />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className={pageTitle}>{project.name}</h1>
        <span className="rounded-full bg-black/[0.05] px-3 py-1 text-[13px] font-medium text-[var(--ink)]">
          {project.status}
        </span>
      </div>
      <p className="mt-3 text-[17px] text-[var(--muted)]">
        Builder{" "}
        <Link className={textLink} href={`/b/${project.xHandle}`}>
          @{project.xHandle}
        </Link>
      </p>
      <p className="mt-2 break-all font-mono text-[12px] text-[var(--muted)]">{project.mint}</p>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className={`${panel} p-4`}>
          <p className="text-sm text-[var(--muted)]">Vault</p>
          <p className="mt-2 text-[28px] font-semibold tracking-[-0.03em]">{formatSol(project.vault.balanceSol)} SOL</p>
        </div>
        <div className={`${panel} p-4`}>
          <p className="text-sm text-[var(--muted)]">Paid to builder</p>
          <p className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-[var(--pay)]">
            {formatSol(project.vault.releasedSol)} SOL
          </p>
        </div>
        <div className={`${panel} p-4`}>
          <p className="text-sm text-[var(--muted)]">Burned</p>
          <p className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-[var(--burn)]">
            {formatSol(project.vault.burnedSol)} SOL
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[22px] font-semibold tracking-[-0.03em]">Promises</h2>
        <ul className="mt-4 space-y-3">
          {project.promises.map((item) => (
            <li key={item.idx} className={`${panel} p-4`}>
              <div className="flex justify-between gap-3 text-sm">
                <span className={promiseTone(item.status)}>{promiseLabel(item.status)}</span>
                <span className="text-[var(--muted)]">{formatWhen(item.deadlineMs)}</span>
              </div>
              <p className="mt-2 leading-relaxed">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {project.vote ? (
        <section className={`${panel} mt-10 p-4 sm:p-6 md:p-8`}>
          <h2 className="text-[22px] font-semibold tracking-[-0.03em]">Vote open</h2>
          <p className="mt-2 break-all text-[var(--muted)]">
            Pay {project.vote.payWeight} · Burn {project.vote.burnWeight} · Closes{" "}
            {formatWhen(project.vote.endMs)}
          </p>
          {weightTotal === 0 ? (
            <div className="mt-4 h-1.5 rounded-full bg-black/[0.06]" />
          ) : (
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--burn)]">
              <div className="h-full bg-[var(--pay)]" style={{ width: `${payShare}%` }} />
            </div>
          )}
          <label className={`${labelClass} mt-5`}>
            Your wallet
            <input
              className={field}
              value={wallet}
              onChange={(event) => setWallet(event.target.value)}
              aria-label="Voter wallet"
            />
          </label>
          <label className={`${labelClass} mt-3`}>
            Coins to lock
            <input
              className={field}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              aria-label="Vote amount"
            />
          </label>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleVote("pay")}
              className={`${btnPay} px-5 py-2.5`}
            >
              Vote pay
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleVote("burn")}
              className={btnBurn}
            >
              Vote burn
            </button>
          </div>
        </section>
      ) : null}

      <section className={`${panel} mt-10 p-5 md:p-6`}>
        <h2 className="text-[22px] font-semibold tracking-[-0.03em]">Add the next promise</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Builder wallet required. If the last vote is done, you have 7 days.
        </p>
        <label className={`${labelClass} mt-4`}>
          Builder wallet
          <input
            className={field}
            value={wallet}
            onChange={(event) => setWallet(event.target.value)}
            aria-label="Builder wallet"
          />
        </label>
        <textarea
          className={`${field} mt-3`}
          value={nextPromise}
          onChange={(event) => setNextPromise(event.target.value)}
          aria-label="Next promise"
          rows={3}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            className={`${field} mt-0 w-24`}
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
            className={btnGhost}
          >
            Post promise
          </button>
        </div>
      </section>

      <div className="mt-10">
        <HolderChat mint={project.mint} />
      </div>

      {error ? <p className="mt-4 text-[var(--burn)]">{error}</p> : null}
    </div>
  );
}

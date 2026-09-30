"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { HolderChat } from "@/components/holder-chat";
import { PumpMark } from "@/components/pump-mark";
import { api, type ProjectView, type PromiseView } from "@/lib/api";
import { formatNet, formatSol, formatWhen, promiseLabel } from "@/lib/format";
import { useWallet } from "@/lib/wallet";
import { btnBurn, btnGhost, btnPay, pageTitle, panel, textLink } from "@/components/surface";
import { ConnectWallet } from "@/components/connect-wallet";

const netTone = (value: number | null | undefined) => {
  if (value == null || value === 0) {
    return "text-[var(--ink)]";
  }
  return value > 0 ? "text-[var(--pay)]" : "text-[var(--burn)]";
};

const canVote = (status: string) => status === "pending" || status === "vote_open" || status === "no_quorum";

export default function CoinPage() {
  const params = useParams<{ slug: string }>();
  const { wallet } = useWallet();
  const [project, setProject] = useState<ProjectView | null>(null);
  const [error, setError] = useState("");
  const [busyIdx, setBusyIdx] = useState<number | null>(null);

  const load = useCallback(async () => {
    const query = wallet ? `?wallet=${encodeURIComponent(wallet)}` : "";
    setProject(await api<ProjectView>(`/v1/coins/${params.slug}${query}`));
  }, [params.slug, wallet]);

  useEffect(() => {
    let stop = false;
    const run = async () => {
      try {
        await load();
      } catch (err) {
        if (!stop) {
          setError(err instanceof Error ? err.message : "Could not load coin");
        }
      }
    };
    void run();
    const timer = window.setInterval(() => {
      void run();
    }, 8000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [load]);

  const handleVote = async (item: PromiseView, side: "up" | "down") => {
    if (!project || !wallet) {
      return;
    }
    setBusyIdx(item.idx);
    setError("");
    try {
      const next = await api<ProjectView>(`/v1/projects/${project.mint}/promises/${item.idx}/vote`, {
        method: "POST",
        body: JSON.stringify({ wallet, side }),
      });
      setProject(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vote failed");
    } finally {
      setBusyIdx(null);
    }
  };

  if (error && !project) {
    return <p className="mx-auto max-w-3xl text-[var(--burn)]">{error}</p>;
  }
  if (!project) {
    return <p className="mx-auto max-w-3xl text-[var(--muted)]">Loading</p>;
  }

  return (
    <div className="mx-auto grid max-w-[1120px] items-start gap-6 pt-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <PumpMark label="Launched on pump.fun" />
        <p className="mt-4 text-[15px] font-medium text-[var(--muted)]">${project.symbol}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className={pageTitle}>{project.name}</h1>
          <span className="rounded-full bg-black/[0.05] px-3 py-1 text-[13px] font-medium">{project.status}</span>
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

        <section className="mt-8">
          <h2 className="text-[22px] font-semibold tracking-[-0.03em]">Promises</h2>
          <p className="mt-2 text-[15px] text-[var(--muted)]">
            Any holder can vote. Your weight is the share of supply you hold. Selling removes that vote. A positive share pays the builder.
          </p>
          {!wallet ? (
            <div className="mt-4">
              <ConnectWallet />
            </div>
          ) : null}
          <ul className="mt-4 space-y-3">
            {project.promises.map((item) => (
              <li key={item.idx} className={`${panel} p-4`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span>{promiseLabel(item.status)}</span>
                      <span className="text-[var(--muted)]">{formatWhen(item.deadlineMs)}</span>
                    </div>
                    <p className="mt-2 leading-relaxed">{item.text}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-[28px] font-semibold tracking-[-0.03em] ${netTone(item.netPct)}`}>
                      {formatNet(item.netPct)}
                    </p>
                    <p className="text-[12px] text-[var(--muted)]">of supply</p>
                  </div>
                </div>
                {canVote(item.status) && wallet ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      aria-pressed={item.yourSide === "up"}
                      disabled={busyIdx === item.idx}
                      onClick={() => void handleVote(item, "up")}
                      className={item.yourSide === "up" ? btnPay : btnGhost}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      aria-pressed={item.yourSide === "down"}
                      disabled={busyIdx === item.idx}
                      onClick={() => void handleVote(item, "down")}
                      className={item.yourSide === "down" ? btnBurn : btnGhost}
                    >
                      Down
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
        {error ? <p className="mt-4 text-[var(--burn)]">{error}</p> : null}
      </div>
      <aside className="lg:sticky lg:top-20">
        <HolderChat mint={project.mint} />
      </aside>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { HolderChat } from "@/components/holder-chat";
import { PumpMark } from "@/components/pump-mark";
import { api, type ProjectView, type PromiseView } from "@/lib/api";
import { formatCount, formatNet, formatSol, formatUsd, formatWhen, promiseLabel } from "@/lib/format";
import { useWallet } from "@/lib/wallet";
import { btnBurn, btnGhost, btnPay, panel, textLink } from "@/components/surface";
import { ConnectWallet } from "@/components/connect-wallet";

const netTone = (value: number | null | undefined) => {
  if (value == null || value === 0) {
    return "text-[var(--ink)]";
  }
  return value > 0 ? "text-[var(--pay)]" : "text-[var(--burn)]";
};

const canVote = (status: string) => status === "pending" || status === "vote_open" || status === "no_quorum";

const statusLabel = (status: string) => {
  if (status === "active") {
    return "Active";
  }
  if (status === "lapsed") {
    return "Lapsed";
  }
  if (status === "abandoned") {
    return "Abandoned";
  }
  return status;
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="text-[13px] text-[var(--muted)]">{label}</p>
    <p className="mt-1 truncate text-[22px] font-semibold tracking-[-0.03em]">{value}</p>
  </div>
);

export default function CoinPage() {
  const params = useParams<{ slug: string }>();
  const { wallet } = useWallet();
  const [project, setProject] = useState<ProjectView | null>(null);
  const [error, setError] = useState("");
  const [busyIdx, setBusyIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [imageReady, setImageReady] = useState("");

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

  useEffect(() => {
    const src = project?.market?.image;
    if (!src) {
      setImageReady("");
      return;
    }
    const probe = new window.Image();
    probe.onload = () => setImageReady(src);
    probe.onerror = () => setImageReady("");
    probe.src = src;
  }, [project?.market?.image]);

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

  const handleCopy = async () => {
    if (!project) {
      return;
    }
    try {
      await navigator.clipboard.writeText(project.mint);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  if (error && !project) {
    return <p className="mx-auto max-w-3xl text-[var(--burn)]">{error}</p>;
  }
  if (!project) {
    return <p className="mx-auto max-w-3xl text-[var(--muted)]">Loading</p>;
  }

  const market = project.market;
  const image = imageReady || null;

  return (
    <div className="mx-auto grid max-w-[1220px] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="space-y-8">
        <section className={`${panel} p-6 md:p-8`}>
          <div className="flex items-start gap-5">
            <div
              role="img"
              aria-label={`${project.name} logo`}
              className="grid h-[88px] w-[88px] shrink-0 place-items-center overflow-hidden rounded-[24px] bg-[#f5f5f7] bg-cover bg-center text-[28px] font-semibold text-[var(--muted)]"
              style={image ? { backgroundImage: `url(${image})` } : undefined}
            >
              {image ? null : project.symbol.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <PumpMark label="Launched on pump.fun" />
                <span className="rounded-full bg-black/[0.05] px-3 py-1 text-[13px] font-medium">
                  {statusLabel(project.status)}
                </span>
              </div>
              <h1 className="mt-3 break-words text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] md:text-[44px]">
                {project.name}
              </h1>
              <p className="mt-2 text-[16px] font-medium text-[var(--muted)]">${project.symbol}</p>
            </div>
          </div>

          <p className="mt-6 text-[16px] text-[var(--muted)]">
            Builder{" "}
            <Link className={textLink} href={`/b/${project.xHandle}`}>
              @{project.xHandle}
            </Link>
          </p>

          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#f5f5f7] px-4 py-3">
            <span className="text-[13px] font-medium text-[var(--muted)]">CA</span>
            <span className="min-w-0 flex-1 truncate font-mono text-[13px]" title={project.mint}>
              {project.mint}
            </span>
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium ring-1 ring-black/10"
              aria-label="Copy contract address"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {market?.website ? (
              <a className="rounded-full bg-[#f5f5f7] px-4 py-2 text-[14px] font-medium" href={market.website} target="_blank" rel="noreferrer">
                Website
              </a>
            ) : (
              <span className="rounded-full bg-[#f5f5f7] px-4 py-2 text-[14px] font-medium text-[var(--muted)]">Website Pending</span>
            )}
            {market?.x ? (
              <a className="rounded-full bg-[#f5f5f7] px-4 py-2 text-[14px] font-medium" href={market.x} target="_blank" rel="noreferrer">
                X
              </a>
            ) : (
              <span className="rounded-full bg-[#f5f5f7] px-4 py-2 text-[14px] font-medium text-[var(--muted)]">X Pending</span>
            )}
            <a
              className="rounded-full bg-[#f5f5f7] px-4 py-2 text-[14px] font-medium"
              href={`https://pump.fun/coin/${project.mint}`}
              target="_blank"
              rel="noreferrer"
            >
              pump.fun
            </a>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            <Stat label="Market cap" value={formatUsd(market?.marketCapUsd)} />
            <Stat label="ATH" value={formatUsd(market?.athUsd)} />
            <Stat label="Volume" value={formatUsd(market?.volumeUsd)} />
            <Stat label="Holders" value={formatCount(market?.holders)} />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className={`${panel} p-6`}>
            <p className="text-[13px] text-[var(--muted)]">Vault</p>
            <p className="mt-2 text-[28px] font-semibold tracking-[-0.03em]">{formatSol(project.vault.balanceSol)} SOL</p>
          </div>
          <div className={`${panel} p-6`}>
            <p className="text-[13px] text-[var(--muted)]">Paid to builder</p>
            <p className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-[var(--pay)]">
              {formatSol(project.vault.releasedSol)} SOL
            </p>
          </div>
          <div className={`${panel} p-6`}>
            <p className="text-[13px] text-[var(--muted)]">Burned</p>
            <p className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-[var(--burn)]">
              {formatSol(project.vault.burnedSol)} SOL
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-[28px] font-semibold tracking-[-0.03em]">Promises</h2>
          <p className="mt-2 max-w-[46rem] text-[16px] leading-relaxed text-[var(--muted)]">
            Any holder can vote. Your weight is the share of supply you hold. Selling removes that vote. A positive share pays the builder.
          </p>
          {!wallet ? (
            <div className="mt-4">
              <ConnectWallet />
            </div>
          ) : null}
          <ul className="mt-5 space-y-4">
            {project.promises.map((item) => (
              <li key={item.idx} className={`${panel} p-6`}>
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-3 text-[14px]">
                      <span className="font-medium">{promiseLabel(item.status)}</span>
                      <span className="text-[var(--muted)]">{formatWhen(item.deadlineMs)}</span>
                    </div>
                    <p className="mt-3 text-[17px] leading-relaxed">{item.text}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-[32px] font-semibold tracking-[-0.03em] ${netTone(item.netPct)}`}>
                      {formatNet(item.netPct)}
                    </p>
                    <p className="text-[12px] text-[var(--muted)]">of supply</p>
                  </div>
                </div>
                {canVote(item.status) && wallet ? (
                  <div className="mt-5 flex flex-wrap gap-2">
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
        {error ? <p className="text-[var(--burn)]">{error}</p> : null}
      </div>
      <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7.5rem)]">
        <HolderChat mint={project.mint} />
      </aside>
    </div>
  );
}

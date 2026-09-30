"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { HolderChat } from "@/components/holder-chat";
import { PumpMark } from "@/components/pump-mark";
import { api, type ProjectView, type PromiseView } from "@/lib/api";
import { formatCount, formatNet, formatSol, formatUsd, formatWhen, promiseLabel } from "@/lib/format";
import { shortWallet, useWallet } from "@/lib/wallet";
import { btnBurn, btnGhost, btnPay, textLink } from "@/components/surface";
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

const mist =
  "pointer-events-none absolute -inset-x-8 -inset-y-8 -z-10 bg-[#f5f5f7]/50 backdrop-blur-2xl [mask-image:radial-gradient(ellipse_125%_85%_at_center,black_68%,transparent_100%)]";

const Stat = ({ label, value, tone = "" }: { label: string; value: string; tone?: string }) => (
  <div className="min-w-0">
    <p className="text-[13px] leading-tight text-[var(--muted)]">{label}</p>
    <p className={`mt-1 truncate text-[22px] font-semibold tracking-[-0.03em] ${tone}`}>{value}</p>
  </div>
);

const IconLink = ({
  href,
  label,
  children,
}: {
  href: string | null;
  label: string;
  children: ReactNode;
}) => {
  const className =
    "grid h-9 w-9 place-items-center rounded-full text-[var(--ink)] transition hover:bg-black/[0.04] disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent";
  if (!href) {
    return (
      <button type="button" className={`${className} opacity-35`} disabled aria-label={label}>
        {children}
      </button>
    );
  }
  return (
    <a className={className} href={href} target="_blank" rel="noreferrer" aria-label={label}>
      {children}
    </a>
  );
};

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
      <div className="space-y-10">
        <section className="relative px-1 py-2">
          <div aria-hidden="true" className={mist} />
          <div className="flex items-start gap-5">
            <div
              role="img"
              aria-label={`${project.name} logo`}
              className="grid h-[88px] w-[88px] shrink-0 place-items-center overflow-hidden rounded-[24px] bg-white bg-cover bg-center text-[28px] font-semibold text-[var(--muted)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              style={image ? { backgroundImage: `url(${image})` } : undefined}
            >
              {image ? null : project.symbol.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="rounded-full bg-black/[0.05] px-3 py-1 text-[13px] font-medium">
                {statusLabel(project.status)}
              </span>
              <h1 className="mt-3 break-words text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] md:text-[44px]">
                {project.name}
              </h1>
              <div className="mt-2 flex items-center gap-1.5">
                <p className="text-[16px] font-medium text-[var(--muted)]">${project.symbol}</p>
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  className="grid h-7 w-7 place-items-center rounded-full text-[var(--muted)] hover:bg-black/[0.05] hover:text-[var(--ink)]"
                  aria-label={copied ? "Copied" : "Copy contract address"}
                >
                  {copied ? (
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M10.5 5.5V3.8A1.3 1.3 0 0 0 9.2 2.5H3.8A1.3 1.3 0 0 0 2.5 3.8v5.4A1.3 1.3 0 0 0 3.8 10.5H5.5" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-3 text-[15px] text-[var(--muted)]">
                Builder{" "}
                <Link className={`${textLink} font-mono`} href={`/b/${project.xHandle}`} title={project.builderWallet}>
                  {shortWallet(project.builderWallet)}
                </Link>
              </p>
              <div className="mt-4 flex items-center gap-1">
                <IconLink href={market?.website ?? null} label={market?.website ? "Website" : "Website pending"}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M2 8h12M8 1.8c1.6 1.7 2.4 3.8 2.4 6.2S9.6 12.5 8 14.2C6.4 12.5 5.6 10.4 5.6 8S6.4 3.5 8 1.8Z" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </IconLink>
                <IconLink href={market?.x ?? null} label={market?.x ? "X" : "X pending"}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M9.5 6.8 14.7 1h-1.2L9 6 5.4 1H1.2l5.5 7.3L1.2 15h1.2L7.2 9.7 11 15h4.2L9.5 6.8Zm-1.3 1.5-.6-.8L2.9 1.9h1.9l3.6 4.7.6.8 4.3 5.7h-1.9L8.2 8.3Z" />
                  </svg>
                </IconLink>
                <a
                  href={`https://pump.fun/coin/${project.mint}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open on pump.fun"
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/[0.04]"
                >
                  <PumpMark label="" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
            <Stat label="Market cap" value={formatUsd(market?.marketCapUsd)} />
            <Stat label="ATH" value={formatUsd(market?.athUsd)} />
            <Stat label="Volume" value={formatUsd(market?.volumeUsd)} />
            <Stat label="Holders" value={formatCount(market?.holders)} />
            <Stat label="Vault" value={`${formatSol(project.vault.balanceSol)} SOL`} />
            <Stat label="Paid to builder" value={`${formatSol(project.vault.releasedSol)} SOL`} tone="text-[var(--pay)]" />
            <Stat label="Burned" value={`${formatSol(project.vault.burnedSol)} SOL`} tone="text-[var(--burn)]" />
          </div>
        </section>

        <section className="relative">
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
              <li key={item.idx} className="relative px-1 py-4">
                <div aria-hidden="true" className={mist} />
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

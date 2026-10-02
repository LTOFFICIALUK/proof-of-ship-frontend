"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { HolderChat } from "@/components/holder-chat";
import { api, type ProjectView, type PromiseView } from "@/lib/api";
import { formatCount, formatDue, formatNet, formatSol, formatUsd, promiseLabel } from "@/lib/format";
import { shortWallet, useWallet } from "@/lib/wallet";
import { btnBurn, btnGhost, btnPay, field, panel, textLink } from "@/components/surface";
import { ConnectWallet } from "@/components/connect-wallet";

const netTone = (value: number | null | undefined) => {
  if (value == null || value === 0) {
    return "text-[var(--ink)]";
  }
  return value > 0 ? "text-[var(--pay)]" : "text-[var(--burn)]";
};

const canVote = (status: string) => status === "vote_open";

const statusMark = (status: string) => {
  if (status === "paid") {
    return "bg-[var(--pay)]";
  }
  if (status === "burned" || status === "missed") {
    return "bg-[var(--burn)]";
  }
  if (status === "rolled") {
    return "border border-[var(--ink)] bg-transparent";
  }
  return "bg-[#c9c9c5]";
};

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

const Stat = ({ label, value, tone = "" }: { label: string; value: string; tone?: string }) => (
  <div className="min-w-0 px-4 py-3 sm:px-5 sm:py-4">
    <p className="text-[12px] text-[var(--muted)]">{label}</p>
    <p className={`mt-1 truncate text-[18px] font-semibold tracking-[-0.03em] sm:text-[20px] ${tone}`}>{value}</p>
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
  const params = useParams<{ mint: string }>();
  const { wallet } = useWallet();
  const [project, setProject] = useState<ProjectView | null>(null);
  const [error, setError] = useState("");
  const [busyIdx, setBusyIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [imageReady, setImageReady] = useState("");

  const load = useCallback(async () => {
    setProject(await api<ProjectView>(`/v1/projects/${params.mint}`));
  }, [params.mint]);

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
        body: JSON.stringify({ side }),
      });
      setProject(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vote failed");
    } finally {
      setBusyIdx(null);
    }
  };

  const handleShip = async (idx: number) => {
    setBusyIdx(idx);
    setError("");
    try {
      const next = await api<ProjectView>(`/v1/projects/${project?.mint}/promises/${idx}/proof`, {
        method: "POST",
        body: JSON.stringify({ url: proofUrl.trim(), note: proofNote.trim() }),
      });
      setProject(next);
      setProofUrl("");
      setProofNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark this as shipped");
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
    <div className="mx-auto grid max-w-[1180px] items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0 space-y-5">
        <section className={`${panel} overflow-hidden`}>
          <div className="flex items-start gap-4 p-4 sm:gap-5 sm:p-6 md:p-7">
            <div
              role="img"
              aria-label={`${project.name} logo`}
              className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[18px] bg-[#f5f5f7] bg-cover bg-center text-[22px] font-semibold text-[var(--muted)] sm:h-20 sm:w-20 sm:rounded-[22px] sm:text-[26px]"
              style={image ? { backgroundImage: `url(${image})` } : undefined}
            >
              {image ? null : project.symbol.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-start justify-between gap-3">
                <h1 className="min-w-0 break-words text-[28px] font-semibold leading-none tracking-[-0.04em] sm:text-[32px] md:text-[40px]">
                  {project.name}
                </h1>
                <span className="mt-1 shrink-0 rounded-full bg-[#f5f5f7] px-3 py-1 text-[13px] font-medium">
                  {statusLabel(project.status)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px]">
                <span className="inline-flex items-center gap-1 font-medium text-[var(--muted)]">
                  ${project.symbol}
                  <span className="font-mono text-[14px]">{shortWallet(project.mint)}</span>
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
                </span>
                <Link className={`${textLink} text-[14px]`} href={`/b/${project.xHandle}`}>
                  @{project.xHandle}
                </Link>
                <span className="inline-flex items-center">
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
                    className="px-2 text-[13px] text-[var(--muted)] hover:text-[var(--ink)]"
                  >
                    on pump.fun
                  </a>
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 border-t border-black/[0.06] sm:grid-cols-4 sm:[&>*+*]:border-l sm:[&>*+*]:border-black/[0.06] [&>*:nth-child(n+3)]:border-t [&>*:nth-child(n+3)]:border-black/[0.06] sm:[&>*:nth-child(n+3)]:border-t-0 [&>*:nth-child(even)]:border-l [&>*:nth-child(even)]:border-black/[0.06]">
            <Stat label="Market cap" value={formatUsd(market?.marketCapUsd)} />
            <Stat label="ATH" value={formatUsd(market?.athUsd)} />
            <Stat label="Volume" value={formatUsd(market?.volumeUsd)} />
            <Stat label="Holders" value={formatCount(market?.holders)} />
          </div>
          <div className="grid grid-cols-1 border-t border-black/[0.06] sm:grid-cols-3 sm:[&>*+*]:border-l sm:[&>*+*]:border-black/[0.06] [&>*+*]:border-t [&>*+*]:border-black/[0.06] sm:[&>*+*]:border-t-0">
            <Stat label="Vault" value={`${formatSol(project.vault.balanceSol)} SOL`} />
            <Stat label="Paid to builder" value={`${formatSol(project.vault.releasedSol)} SOL`} tone="text-[var(--pay)]" />
            <Stat label="Burned" value={`${formatSol(project.vault.burnedSol)} SOL`} tone="text-[var(--burn)]" />
          </div>
        </section>

        <section className={`${panel} p-4 sm:p-6 md:p-7`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-[22px] font-semibold tracking-[-0.03em]">Promises</h2>
              <p className="mt-1 max-w-[36rem] text-[15px] leading-relaxed text-[var(--muted)]">
                Holders vote after proof is posted. The split stays hidden until the vote ends. A win pays or burns 60 percent of the vault.
              </p>
            </div>
            {!wallet ? <ConnectWallet /> : null}
          </div>
          <ul className="mt-5 divide-y divide-black/[0.06] border-t border-black/[0.06]">
            {project.promises.map((item) => (
              <li key={item.idx} className="py-5">
                <div className="flex items-start justify-between gap-3 sm:gap-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-3 text-[13px]">
                      <span className={`mt-0.5 inline-block h-2.5 w-2.5 ${statusMark(item.status)}`} aria-hidden="true" />
                      <span className="font-medium">{promiseLabel(item.status)}</span>
                      <span className="font-mono text-[var(--muted)]">{formatDue(item.deadlineMs, project.nowMs)}</span>
                    </div>
                    <p className="mt-2 text-[17px] leading-relaxed">{item.text}</p>
                    {item.proofUrl ? (
                      <a className={`${textLink} mt-2 inline-block text-[14px]`} href={item.proofUrl} target="_blank" rel="noreferrer">
                        Proof
                      </a>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`font-mono text-[22px] font-semibold tracking-[-0.03em] sm:text-[28px] ${netTone(item.netPct)}`}>
                      {item.status === "vote_open" ? `${(item.turnoutPct ?? 0).toFixed(2)}%` : formatNet(item.netPct)}
                    </p>
                    <p className="text-[12px] text-[var(--muted)]">{item.status === "vote_open" ? "turnout" : "of supply"}</p>
                  </div>
                </div>
                {item.status === "pending" && wallet === project.builderWallet ? (
                  <form
                    className="mt-4 space-y-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handleShip(item.idx);
                    }}
                  >
                    <input
                      className={field}
                      value={proofUrl}
                      onChange={(event) => setProofUrl(event.target.value)}
                      placeholder="Proof link"
                      aria-label="Proof link"
                      required
                    />
                    <textarea
                      className={field}
                      value={proofNote}
                      onChange={(event) => setProofNote(event.target.value)}
                      placeholder="What shipped"
                      aria-label="What shipped"
                      rows={2}
                    />
                    <button type="submit" className={btnPay} disabled={busyIdx === item.idx}>
                      Mark as shipped
                    </button>
                  </form>
                ) : null}
                {canVote(item.status) && wallet && wallet !== project.builderWallet ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      aria-pressed={item.yourSide === "up"}
                      disabled={busyIdx === item.idx}
                      onClick={() => void handleVote(item, "up")}
                      className={item.yourSide === "up" ? btnPay : btnGhost}
                    >
                      Pay the builder
                    </button>
                    <button
                      type="button"
                      aria-pressed={item.yourSide === "down"}
                      disabled={busyIdx === item.idx}
                      onClick={() => void handleVote(item, "down")}
                      className={item.yourSide === "down" ? btnBurn : btnGhost}
                    >
                      Burn it
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
        {error ? <p className="text-[var(--burn)]">{error}</p> : null}
      </div>
      <aside className="min-h-0 lg:h-full">
        <HolderChat mint={project.mint} />
      </aside>
    </div>
  );
}

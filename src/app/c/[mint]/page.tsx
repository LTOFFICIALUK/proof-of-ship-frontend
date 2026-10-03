"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { HolderChat } from "@/components/holder-chat";
import { api, type ProjectView, type PromiseView } from "@/lib/api";
import { formatCount, formatDue, formatNet, formatSol, formatTokens, formatUsd, promiseLabel } from "@/lib/format";
import { shortWallet, useWallet } from "@/lib/wallet";
import { btnBurn, btnGhost, btnPay, btnPrimary, field, labelClass, panel, textLink } from "@/components/surface";
import { ConnectWallet } from "@/components/connect-wallet";
import { toast } from "@/components/toast";
import { Misted } from "@/components/text-mist";

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

const ProofForm = ({
  idx,
  busy,
  onShip,
}: {
  idx: number;
  busy: boolean;
  onShip: (idx: number, url: string, note: string) => Promise<void>;
}) => {
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        void onShip(idx, url, note);
      }}
    >
      <label className={labelClass}>
        Proof link
        <input className={field} value={url} onChange={(event) => setUrl(event.target.value)} required aria-label="Proof link" />
      </label>
      <label className={labelClass}>
        What shipped
        <textarea className={field} value={note} onChange={(event) => setNote(event.target.value)} rows={2} aria-label="What shipped" />
      </label>
      <button type="submit" className={btnPay} disabled={busy}>
        Mark as shipped
      </button>
    </form>
  );
};

export default function CoinPage() {
  const params = useParams<{ mint: string }>();
  const { wallet, signBytes, ensureSession } = useWallet();
  const [project, setProject] = useState<ProjectView | null>(null);
  const [error, setError] = useState("");
  const [busyIdx, setBusyIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [imageReady, setImageReady] = useState("");
  const [reason, setReason] = useState("");
  const [nextTitle, setNextTitle] = useState("");
  const [nextDone, setNextDone] = useState("");
  const [nextHours, setNextHours] = useState("24");
  const [abandonStep, setAbandonStep] = useState(false);
  const [voteNotice, setVoteNotice] = useState<null | "pay" | "burn">(null);

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
    const src = project?.profile?.image || project?.market?.image;
    if (!src) {
      setImageReady("");
      return;
    }
    const probe = new window.Image();
    probe.onload = () => setImageReady(src);
    probe.onerror = () => setImageReady("");
    probe.src = src;
  }, [project?.market?.image, project?.profile?.image]);

  const handleVote = async (item: PromiseView, side: "pay" | "burn") => {
    if (!project || !wallet) {
      return;
    }
    setBusyIdx(item.idx);
    setError("");
    try {
      const signedIn = await ensureSession();
      if (!signedIn) {
        return;
      }
      const prompt = await api<{ nonce: string; message: string }>(
        `/v1/coins/${project.mint}/promises/${item.idx}/vote-message?side=${side}`,
      );
      const signature = await signBytes(prompt.message);
      const next = await api<ProjectView>(`/v1/coins/${project.mint}/promises/${item.idx}/vote`, {
        method: "POST",
        body: JSON.stringify({
          side,
          reason: reason.trim() || undefined,
          nonce: prompt.nonce,
          signature,
        }),
      });
      setProject(next);
      setVoteNotice(side);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Vote failed";
      setError(message);
      toast.error(message);
    } finally {
      setBusyIdx(null);
    }
  };

  const handleShip = async (idx: number, url: string, note: string) => {
    setBusyIdx(idx);
    setError("");
    try {
      const signedIn = await ensureSession();
      if (!signedIn) {
        return;
      }
      const next = await api<ProjectView>(`/v1/coins/${project?.mint}/promises/${idx}/proof`, {
        method: "POST",
        body: JSON.stringify({ url: url.trim(), note: note.trim() }),
      });
      setProject(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark this as shipped");
    } finally {
      setBusyIdx(null);
    }
  };

  const handleNextPromise = async () => {
    if (!project) {
      return;
    }
    setBusyIdx(-1);
    setError("");
    try {
      const signedIn = await ensureSession();
      if (!signedIn) {
        return;
      }
      const next = await api<ProjectView>(`/v1/coins/${project.mint}/promises`, {
        method: "POST",
        body: JSON.stringify({
          title: nextTitle.trim(),
          doneLooksLike: nextDone.trim(),
          proofType: "link",
          deadlineMs: Date.now() + Number(nextHours) * 60 * 60 * 1000,
        }),
      });
      setProject(next);
      setNextTitle("");
      setNextDone("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post the next promise");
    } finally {
      setBusyIdx(null);
    }
  };

  const handleAbandon = async () => {
    if (!project) {
      return;
    }
    setBusyIdx(-2);
    setError("");
    try {
      const next = await api<ProjectView>(`/v1/projects/${project.mint}/abandon`, {
        method: "POST",
        body: "{}",
      });
      setProject(next);
      setAbandonStep(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not abandon this coin");
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
    return (
      <Misted className="mx-auto max-w-3xl">
        <p className="text-[var(--burn)]">{error}</p>
      </Misted>
    );
  }
  if (!project) {
    return (
      <Misted className="mx-auto max-w-3xl">
        <p className="text-[var(--muted)]">Loading</p>
      </Misted>
    );
  }

  const market = project.market;
  const image = imageReady || null;
  const viewer = project.viewer;
  const isBuilder = Boolean(viewer?.isBuilder);
  const listedWebsite = project.profile.website || market?.website || null;
  const website = (() => {
    if (!listedWebsite) {
      return null;
    }
    try {
      const path = new URL(listedWebsite).pathname.replace(/\/$/, "");
      if (path === `/c/${project.mint}`) {
        return null;
      }
    } catch {
      return listedWebsite;
    }
    return listedWebsite;
  })();
  const xUrl = market?.x || (project.xHandle ? `https://x.com/${project.xHandle}` : null);
  const openVote = project.promises.find((item) => item.status === "vote_open");
  const waitingProof = project.promises.find((item) => item.status === "pending");
  const canPostNext = isBuilder && !waitingProof && !openVote && project.status !== "abandoned";

  const voteCopy = voteNotice === "burn" ? "You voted not to pay." : "You voted to pay the builder.";

  return (
    <div className="mx-auto grid max-w-[1180px] items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      {voteNotice ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#f3f3f1]/80 px-4 backdrop-blur-md">
          <div className={`${panel} w-full max-w-[420px] px-8 py-10 text-center`} role="dialog" aria-modal="true" aria-labelledby="vote-done-title">
            <p id="vote-done-title" className="text-[22px] font-semibold tracking-[-0.03em]">
              {voteCopy}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">Your vote is counted. You can change it until the vote ends.</p>
            <button type="button" className={`${btnPrimary} mt-6`} onClick={() => setVoteNotice(null)} autoFocus>
              Done
            </button>
          </div>
        </div>
      ) : null}
      <div className="min-w-0 space-y-5">
        {project.status === "lapsed" ? (
          <p className={`${panel} px-5 py-4 text-[15px] text-[var(--burn)]`}>
            No new promise in 7 days. Fees buy and burn $POS until the builder posts one.
          </p>
        ) : null}
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
                <div className="mt-1 flex shrink-0 flex-wrap justify-end gap-2">
                  <span className="rounded-full bg-[#f5f5f7] px-3 py-1 text-[13px] font-medium">
                    {statusLabel(project.status)}
                  </span>
                  <span
                    className="rounded-full bg-[#f5f5f7] px-3 py-1 text-[13px] font-medium"
                    aria-label={`Dev supply locked: ${formatTokens(project.devLock)} $${project.symbol}`}
                    title="Dev supply still locked. A Pay unlocks 20 percent of what remains. A Burn burns 20 percent of what remains."
                  >
                    {formatTokens(project.devLock)} ${project.symbol} locked
                  </span>
                </div>
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
                  <IconLink href={website} label={website ? "Website" : "Website pending"}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M2 8h12M8 1.8c1.6 1.7 2.4 3.8 2.4 6.2S9.6 12.5 8 14.2C6.4 12.5 5.6 10.4 5.6 8S6.4 3.5 8 1.8Z" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  </IconLink>
                  <IconLink href={xUrl} label={xUrl ? "X" : "X pending"}>
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
                  <a
                    href={`https://dexscreener.com/solana/${project.mint}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 text-[13px] text-[var(--muted)] hover:text-[var(--ink)]"
                  >
                    DexScreener
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
          <div className="grid grid-cols-2 border-t border-black/[0.06] sm:grid-cols-4 sm:[&>*+*]:border-l sm:[&>*+*]:border-black/[0.06] [&>*:nth-child(n+3)]:border-t [&>*:nth-child(n+3)]:border-black/[0.06] sm:[&>*:nth-child(n+3)]:border-t-0 [&>*:nth-child(even)]:border-l [&>*:nth-child(even)]:border-black/[0.06]">
            <Stat
              label="Vault"
              value={project.vault.balanceSol === 0 ? "Fees land here as the coin trades." : `${formatSol(project.vault.balanceSol)} SOL`}
            />
            <Stat
              label="Paid to builder"
              value={`${formatSol(project.vault.releasedSol)} SOL`}
              tone="text-[var(--pay)]"
            />
            <Stat label="Burned" value={`${formatSol(project.vault.burnedSol)} SOL`} tone="text-[var(--burn)]" />
            <Stat label="Runway paid" value={`${formatSol(project.vault.runwaySol)} SOL`} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-black/[0.06] px-5 py-3 text-[13px] text-[var(--muted)]">
            <span>
              Dev bag locked: {formatTokens(project.devLock)}. Unlocked: {formatTokens(project.devUnlocked)}.
            </span>
            <span>
              Trading fees {formatSol(project.vault.tradingFeesSol ?? 0)} SOL.
              {project.status === "abandoned" && (project.vault.tradingFeesUnspentSol ?? 0) > 0
                ? ` ${formatSol(project.vault.tradingFeesUnspentSol ?? 0)} SOL from this coin is waiting to buy and burn $POS.`
                : ""}
            </span>
            <span>
              $POS:{" "}
              <a className={textLink} href={`https://solscan.io/token/${project.vault.posMint}`} target="_blank" rel="noreferrer">
                {shortWallet(project.vault.posMint)}
              </a>
              {project.vault.posBought !== "0"
                ? `. ${formatTokens(project.vault.posBought)} bought`
                : project.vault.posBucketSol > 0
                  ? `. ${formatSol(project.vault.posBucketSol)} SOL queued`
                  : ""}
            </span>
            <span>
              Vault address:{" "}
              {project.chain.vault ? (
                <a className={textLink} href={`https://solscan.io/account/${project.chain.vault}`} target="_blank" rel="noreferrer">
                  {shortWallet(project.chain.vault)}
                </a>
              ) : (
                "Pending"
              )}
            </span>
            <span>
              Fee config:{" "}
              {project.chain.feeConfig ? (
                <a className={textLink} href={`https://solscan.io/account/${project.chain.feeConfig}`} target="_blank" rel="noreferrer">
                  {shortWallet(project.chain.feeConfig)}
                </a>
              ) : (
                "Pending"
              )}
            </span>
            <span>
              Revoke:{" "}
              {project.chain.revokeSig ? (
                <a className={textLink} href={`https://solscan.io/tx/${project.chain.revokeSig}`} target="_blank" rel="noreferrer">
                  {shortWallet(project.chain.revokeSig)}
                </a>
              ) : (
                "Pending"
              )}
            </span>
            <a className={textLink} href={`/api/v1/coins/${project.mint}/card.svg`} target="_blank" rel="noreferrer">
              Share card
            </a>
          </div>
        </section>

        {isBuilder ? (
          <section className={`${panel} space-y-5 p-4 sm:p-6`}>
            <h2 className="text-[22px] font-semibold tracking-[-0.03em]">Builder</h2>
            {canPostNext ? (
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleNextPromise();
                }}
              >
                <p className="text-[15px] text-[var(--muted)]">Post the next promise. The timer is 7 days from the last close.</p>
                <label className={labelClass}>
                  Promise title
                  <input className={field} value={nextTitle} onChange={(event) => setNextTitle(event.target.value)} required aria-label="Next promise title" />
                </label>
                <label className={labelClass}>
                  What done looks like
                  <textarea className={field} value={nextDone} onChange={(event) => setNextDone(event.target.value)} rows={2} aria-label="What done looks like" />
                </label>
                <label className={labelClass}>
                  Hours until the deadline
                  <input className={`${field} max-w-[8rem]`} type="number" min={0.5} max={720} step={0.5} value={nextHours} onChange={(event) => setNextHours(event.target.value)} aria-label="Hours until the deadline" />
                </label>
                <button type="submit" className={btnPay} disabled={busyIdx === -1}>
                  Post next promise
                </button>
              </form>
            ) : (
              <p className="text-[15px] text-[var(--muted)]">
                {project.status === "abandoned" ? "This coin is abandoned." : "Close the open promise before you post another."}
              </p>
            )}
            {project.status !== "abandoned" ? (
              abandonStep ? (
                <div className="space-y-3">
                  <p className="text-[15px] text-[var(--burn)]">This buys and burns $POS with the whole vault and cannot be undone.</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={btnBurn} disabled={busyIdx === -2} onClick={() => void handleAbandon()}>
                      Confirm abandon
                    </button>
                    <button type="button" className={btnGhost} onClick={() => setAbandonStep(false)}>
                      Keep shipping
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" className={btnGhost} onClick={() => setAbandonStep(true)}>
                  Abandon
                </button>
              )
            ) : null}
          </section>
        ) : null}

        <section className={`${panel} p-4 sm:p-6 md:p-7`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-[22px] font-semibold tracking-[-0.03em]">Promises</h2>
              <p className="mt-1 max-w-[36rem] text-[15px] leading-relaxed text-[var(--muted)]">
                Holders vote after proof is posted. The split stays hidden until the vote ends. Pay pays the builder 60 percent of the vault in SOL and unlocks 20 percent of the remaining dev bag. Burn spends that same slice on $POS.
              </p>
            </div>
            {!wallet ? <ConnectWallet /> : null}
          </div>
          {openVote && viewer && !isBuilder ? (
            <p className="mt-4 text-[14px] text-[var(--muted)]">
              {viewer.excluded
                ? "Not eligible. Builders and excluded wallets cannot vote."
                : `Your eligible weight is the lowest of your 3 balances: ${formatTokens(viewer.weight)}.`}
            </p>
          ) : null}
          <ul className="mt-5 divide-y divide-black/[0.06] border-t border-black/[0.06]">
            {project.promises.map((item) => (
              <li key={item.idx} className="py-5">
                <div className="flex items-start justify-between gap-3 sm:gap-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-3 text-[13px]">
                      <span className={`mt-0.5 inline-block h-2.5 w-2.5 ${statusMark(item.status)}`} aria-hidden="true" />
                      <span className="font-medium">
                        {item.status === "pending" ? "Waiting for the developer to mark this done" : promiseLabel(item.status)}
                      </span>
                      <span className="font-mono text-[var(--muted)]">{formatDue(item.deadlineMs, project.nowMs)}</span>
                    </div>
                    <p className="mt-2 text-[17px] leading-relaxed">{item.text}</p>
                    {item.doneLooksLike ? <p className="mt-1 text-[14px] text-[var(--muted)]">Done looks like: {item.doneLooksLike}</p> : null}
                    {item.proofUrl ? (
                      <a className={`${textLink} mt-2 inline-block text-[14px]`} href={item.proofUrl} target="_blank" rel="noreferrer">
                        Proof
                      </a>
                    ) : null}
                    {item.status !== "pending" && item.status !== "vote_open" ? (
                      <p className="mt-2 text-[13px] text-[var(--muted)]">
                        <a className={textLink} href={`/api/v1/coins/${project.mint}/promises/${item.idx}/tally?download=1`}>
                          Download tally.json
                        </a>
                      </p>
                    ) : null}
                  </div>
                  {item.status === "pending" ? null : (
                    <div className="shrink-0 text-right">
                      <p className={`font-mono text-[22px] font-semibold tracking-[-0.03em] sm:text-[28px] ${item.netPct && item.netPct > 0 ? "text-[var(--pay)]" : item.netPct && item.netPct < 0 ? "text-[var(--burn)]" : "text-[var(--ink)]"}`}>
                        {item.status === "vote_open" ? `${(item.turnoutPct ?? 0).toFixed(2)}%` : formatNet(item.netPct)}
                      </p>
                      <p className="text-[12px] text-[var(--muted)]">{item.status === "vote_open" ? "turnout" : "of supply"}</p>
                    </div>
                  )}
                </div>
                {item.status === "pending" && isBuilder ? <ProofForm idx={item.idx} busy={busyIdx === item.idx} onShip={handleShip} /> : null}
                {canVote(item.status) && wallet && !isBuilder && !viewer?.excluded ? (
                  <div className="mt-4 space-y-3">
                    <label className={labelClass}>
                      Optional reason
                      <input className={field} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={140} aria-label="Optional reason" />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        aria-pressed={item.yourSide === "pay"}
                        disabled={busyIdx === item.idx}
                        onClick={() => void handleVote(item, "pay")}
                        className={item.yourSide === "pay" ? btnPay : btnGhost}
                        aria-label="Pay the builder in SOL"
                      >
                        Pay the builder
                      </button>
                      <button
                        type="button"
                        aria-pressed={item.yourSide === "burn"}
                        disabled={busyIdx === item.idx}
                        onClick={() => void handleVote(item, "burn")}
                        className={item.yourSide === "burn" ? btnBurn : btnGhost}
                        aria-label="Do not pay. Buy $POS"
                      >
                        Do not pay
                      </button>
                    </div>
                    <p className="text-[13px] text-[var(--muted)]">
                      Pay sends SOL to the builder. Do not pay buys $POS.
                    </p>
                    {item.yourSide ? (
                      <p className="text-[14px] font-medium">
                        {item.yourSide === "pay" ? "You voted to pay the builder." : "You voted not to pay."}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
        {error ? (
          <Misted>
            <p className="text-[var(--burn)]">{error}</p>
          </Misted>
        ) : null}
      </div>
      <aside className="min-h-0 lg:h-full">
        <HolderChat mint={project.mint} />
      </aside>
    </div>
  );
}

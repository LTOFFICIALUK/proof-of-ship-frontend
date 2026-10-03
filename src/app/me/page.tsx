"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type ProfileView } from "@/lib/api";
import { formatDue, formatSol, formatStamp, formatTokens, promiseLabel } from "@/lib/format";
import { shortWallet, useWallet } from "@/lib/wallet";
import { ConnectWallet } from "@/components/connect-wallet";
import { RecordChips, StatusBlock } from "@/components/status-block";
import { btnGhost, num, pageTitle, panel, textLink } from "@/components/surface";
import { Misted } from "@/components/text-mist";
import { VerifiedTick } from "@/components/verified-tick";

const dueLabel = (dueMs: number | null, nowMs: number) => {
  if (!dueMs) {
    return "";
  }
  return dueMs > nowMs ? formatDue(dueMs, nowMs) : formatStamp(dueMs, nowMs).label;
};

export default function ProfilePage() {
  const { wallet, disconnect } = useWallet();
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!wallet) {
      setProfile(null);
      setError("");
      return;
    }
    let stop = false;
    const load = async () => {
      try {
        const next = await api<ProfileView>(`/v1/wallets/${wallet}`);
        if (!stop) {
          setProfile(next);
          setError("");
        }
      } catch (err) {
        if (!stop) {
          setError(err instanceof Error ? err.message : "Could not load your profile");
        }
      }
    };
    void load();
    return () => {
      stop = true;
    };
  }, [wallet]);

  if (!wallet) {
    return (
      <Misted className="mx-auto max-w-[720px] pt-8">
        <h1 className={pageTitle}>Your profile</h1>
        <p className="mt-3 text-[17px] text-[var(--muted)]">Connect a wallet to see your coins, earnings, promises, and votes.</p>
        <div className="mt-6">
          <ConnectWallet />
        </div>
      </Misted>
    );
  }

  if (error) {
    return (
      <Misted className="mx-auto max-w-[720px] pt-8">
        <p className="text-[var(--burn)]">{error}</p>
      </Misted>
    );
  }

  if (!profile) {
    return (
      <Misted className="mx-auto max-w-[720px] pt-8">
        <p className="text-[var(--muted)]">Loading</p>
      </Misted>
    );
  }

  const nowMs = profile.nowMs || Date.now();
  const stats = [
    { label: "SOL paid", value: `${formatSol(profile.stats.earnedSol)} SOL` },
    { label: "Runway", value: `${formatSol(profile.stats.runwaySol)} SOL` },
    { label: "In vaults", value: `${formatSol(profile.stats.vaultSol)} SOL` },
    { label: "Burned", value: `${formatSol(profile.stats.burnedSol)} SOL` },
    { label: "$POS bought", value: formatTokens(profile.stats.posBought) },
    { label: "On time", value: profile.stats.onTimePct === null ? "Pending" : `${profile.stats.onTimePct}%` },
    { label: "Shipped", value: String(profile.stats.shipped) },
    { label: "Missed", value: String(profile.stats.missed) },
  ];

  return (
    <div className="mx-auto max-w-[880px] pt-4">
      <Misted cover>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className={`${pageTitle} inline-flex items-center gap-2`}>
              {profile.handle ? `@${profile.handle}` : "Your profile"}
              <VerifiedTick verified={profile.verified} />
            </h1>
            <p className="mt-2 break-all font-mono text-[13px] text-[var(--muted)]">{profile.wallet}</p>
            {profile.stats.devLock !== "0" || profile.stats.devUnlocked !== "0" ? (
              <p className={`mt-2 text-[14px] text-[var(--muted)] ${num}`}>
                Dev bag unlocked {formatTokens(profile.stats.devUnlocked)}. {formatTokens(profile.stats.devLock)} still locked.
              </p>
            ) : null}
          </div>
          <button type="button" onClick={() => void disconnect()} className={`${btnGhost} px-4 py-1.5 text-[13px]`} aria-label="Sign out">
            Sign out
          </button>
        </div>
      </Misted>

      {profile.attention.length ? (
        <section className="mt-8">
          <h2 className="text-[22px] font-semibold tracking-[-0.03em]">To do</h2>
          <ul className="mt-4 space-y-3">
            {profile.attention.map((item) => {
              const href = item.kind === "verify" ? "/launch" : `/c/${item.mint}`;
              const when = dueLabel(item.dueMs, nowMs);
              return (
                <li key={`${item.kind}-${item.mint}-${item.text}`}>
                  <Link href={href} className={`${panel} block p-4 transition hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:p-5`}>
                    <p className="text-[16px]">{item.text}</p>
                    <p className={`mt-1 text-[13px] text-[var(--muted)] ${num}`}>
                      {item.symbol ? `$${item.symbol}` : "Launch"}
                      {when ? <span className="px-1.5">·</span> : null}
                      {when}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`${panel} p-4`}>
            <p className="text-sm text-[var(--muted)]">{stat.label}</p>
            <p className={`mt-2 text-[20px] font-semibold tracking-[-0.03em] ${num}`}>{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-[22px] font-semibold tracking-[-0.03em]">Launches</h2>
          <Link href="/launch" className={`${textLink} text-[14px]`}>
            Launch a coin
          </Link>
        </div>
        {profile.projects.length === 0 ? (
          <p className="mt-4 text-[15px] text-[var(--muted)]">No coins yet. Launch one and the vault, promises, and payouts show up here.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {profile.projects.map((project) => (
              <li key={project.mint}>
                <Link
                  href={`/c/${project.mint}`}
                  className={`${panel} block p-4 transition hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:p-5`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[16px] font-medium">
                      {project.name} <span className="text-[var(--muted)]">${project.symbol}</span>
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <RecordChips record={project.record} />
                      <span className="rounded-full bg-black/[0.05] px-3 py-1 text-[13px] font-medium">{project.status}</span>
                    </span>
                  </div>
                  {project.current ? (
                    <p className="mt-2 text-[15px]">
                      <StatusBlock status={project.current.status} />
                      <span className="ml-2">{project.current.text}</span>
                      <span className="ml-2 text-[13px] text-[var(--muted)]">{promiseLabel(project.current.status)}</span>
                    </p>
                  ) : null}
                  <p className={`mt-3 text-[13px] text-[var(--muted)] ${num}`}>
                    Paid {formatSol(project.paidSol)} SOL
                    <span className="px-1.5">·</span>
                    Runway {formatSol(project.runwaySol)} SOL
                    <span className="px-1.5">·</span>
                    Vault {formatSol(project.balanceSol)} SOL
                    {project.nextDueAtMs ? (
                      <>
                        <span className="px-1.5">·</span>
                        Next promise {dueLabel(project.nextDueAtMs, nowMs)}
                      </>
                    ) : null}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-[22px] font-semibold tracking-[-0.03em]">Promises</h2>
        {profile.timeline.length === 0 ? (
          <p className="mt-4 text-[15px] text-[var(--muted)]">No promises yet.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {profile.timeline.map((item) => (
              <li key={`${item.mint}-${item.idx}`} className={`${panel} p-4 sm:p-5`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link href={`/c/${item.mint}`} className={`${textLink} text-[var(--ink)]`}>
                    {item.name} <span className="text-[var(--muted)]">${item.symbol}</span>
                  </Link>
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-medium">
                    <StatusBlock status={item.status} size={8} />
                    {promiseLabel(item.status)}
                  </span>
                </div>
                <p className="mt-2 text-[16px]">{item.text}</p>
                <p className={`mt-1 text-[13px] text-[var(--muted)] ${num}`}>
                  {item.closedAtMs ? `Closed ${formatStamp(item.closedAtMs, nowMs).label}` : dueLabel(item.deadlineMs, nowMs) || "Open"}
                </p>
                {item.proofUrl ? (
                  <a className={`${textLink} mt-2 inline-block text-[13px]`} href={item.proofUrl} target="_blank" rel="noreferrer">
                    Proof
                  </a>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-[22px] font-semibold tracking-[-0.03em]">Votes</h2>
        {profile.votes.length === 0 ? (
          <p className="mt-4 text-[15px] text-[var(--muted)]">No votes yet. Hold a coin, then vote pay or burn when a promise is due.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {profile.votes.map((vote) => (
              <li key={`${vote.mint}-${vote.promiseIdx}`} className={`${panel} p-4 sm:p-5`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link href={`/c/${vote.mint}`} className={`${textLink} text-[var(--ink)]`}>
                    {vote.name || shortWallet(vote.mint)} <span className="text-[var(--muted)]">{vote.symbol ? `$${vote.symbol}` : ""}</span>
                  </Link>
                  <span className={`text-[13px] font-medium ${vote.side === "pay" ? "text-[var(--pay)]" : "text-[var(--burn)]"}`}>
                    {vote.side === "pay" ? "Pay" : "Burn"}
                  </span>
                </div>
                <p className="mt-2 text-[16px]">{vote.text || "Promise"}</p>
                {vote.reason ? <p className="mt-1 text-[14px] text-[var(--muted)]">{vote.reason}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

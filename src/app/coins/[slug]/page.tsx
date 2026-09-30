"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { HolderChat } from "@/components/holder-chat";
import { PumpMark } from "@/components/pump-mark";
import { api, type ProjectView } from "@/lib/api";
import { formatSol, formatWhen, promiseLabel } from "@/lib/format";
import { pageTitle, panel, textLink } from "@/components/surface";

export default function CoinPage() {
  const params = useParams<{ slug: string }>();
  const [project, setProject] = useState<ProjectView | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setProject(await api<ProjectView>(`/v1/coins/${params.slug}`));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load coin");
      }
    };
    void load();
  }, [params.slug]);

  if (error) {
    return <p className="mx-auto max-w-3xl text-[var(--burn)]">{error}</p>;
  }
  if (!project) {
    return <p className="mx-auto max-w-3xl text-[var(--muted)]">Loading</p>;
  }

  return (
    <div className="mx-auto max-w-[760px] pt-4">
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
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-[22px] font-semibold tracking-[-0.03em]">Promises</h2>
          <Link className={textLink} href={`/c/${project.mint}`}>
            Vote on this coin
          </Link>
        </div>
        <ul className="mt-4 space-y-3">
          {project.promises.map((item) => (
            <li key={item.idx} className={`${panel} p-4`}>
              <div className="flex justify-between gap-3 text-sm">
                <span>{promiseLabel(item.status)}</span>
                <span className="text-[var(--muted)]">{formatWhen(item.deadlineMs)}</span>
              </div>
              <p className="mt-2 leading-relaxed">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8">
        <HolderChat mint={project.mint} />
      </div>
    </div>
  );
}

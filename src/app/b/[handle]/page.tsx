"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type BuilderView } from "@/lib/api";
import { formatSol } from "@/lib/format";
import { pageTitle, panel } from "@/components/surface";

export default function BuilderPage() {
  const params = useParams<{ handle: string }>();
  const [builder, setBuilder] = useState<BuilderView | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setBuilder(await api<BuilderView>(`/v1/builders/${params.handle}`));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load builder");
      }
    };
    void load();
  }, [params.handle]);

  if (error) {
    return <p className="mx-auto max-w-3xl text-[var(--burn)]">{error}</p>;
  }
  if (!builder) {
    return <p className="mx-auto max-w-3xl text-[var(--muted)]">Loading</p>;
  }

  const stats = [
    { label: "Paid", value: String(builder.stats.paid) },
    { label: "Burned", value: String(builder.stats.burned) },
    { label: "Abandoned", value: String(builder.stats.abandoned) },
    { label: "Earned", value: `${formatSol(builder.stats.earnedSol)} SOL` },
  ];

  return (
    <div className="mx-auto max-w-[720px] pt-4">
      <h1 className={pageTitle}>@{builder.handle}</h1>
      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`${panel} p-4`}>
            <p className="text-sm text-[var(--muted)]">{stat.label}</p>
            <p className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">{stat.value}</p>
          </div>
        ))}
      </section>
      <ul className="mt-8 space-y-3">
        {builder.projects.map((project) => (
          <li key={project.mint}>
            <Link
              href={`/c/${project.mint}`}
              className={`${panel} flex flex-wrap items-center justify-between gap-3 p-4 transition hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:p-5`}
            >
              <span>
                {project.name}{" "}
                <span className="text-[var(--muted)]">(${project.symbol})</span>
              </span>
              <span className="rounded-full bg-black/[0.05] px-3 py-1 text-[13px] font-medium text-[var(--ink)]">
                {project.status}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

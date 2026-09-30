"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type BuilderView } from "@/lib/api";
import { formatSol } from "@/lib/format";
import { eyebrow, panel } from "@/components/surface";

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
    <div className="mx-auto max-w-3xl">
      <p className={eyebrow}>Builder</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">@{builder.handle}</h1>
      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`${panel} p-4`}>
            <p className="text-sm text-[var(--muted)]">{stat.label}</p>
            <p className="mt-2 font-serif text-2xl">{stat.value}</p>
          </div>
        ))}
      </section>
      <ul className="mt-8 space-y-3">
        {builder.projects.map((project) => (
          <li key={project.mint}>
            <Link
              href={`/c/${project.mint}`}
              className={`${panel} flex items-center justify-between gap-4 p-4 transition hover:border-[var(--stamp)]/40`}
            >
              <span>
                {project.name}{" "}
                <span className="text-[var(--muted)]">(${project.symbol})</span>
              </span>
              <span className="text-xs uppercase tracking-[0.16em] text-[var(--stamp)]">
                {project.status}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

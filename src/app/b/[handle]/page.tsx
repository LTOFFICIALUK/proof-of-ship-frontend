"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type BuilderView } from "@/lib/api";
import { formatSol } from "@/lib/format";

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

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-4xl">@{builder.handle}</h1>
      <p className="mt-4 text-[var(--muted)]">
        Paid {builder.stats.paid} · Burned {builder.stats.burned} · Abandoned{" "}
        {builder.stats.abandoned} · Earned {formatSol(builder.stats.earnedSol)} SOL
      </p>
      <ul className="mt-8 space-y-3">
        {builder.projects.map((project) => (
          <li key={project.mint}>
            <Link
              href={`/c/${project.mint}`}
              className="block rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4"
            >
              {project.name} (${project.symbol}) · {project.status}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { focusRing, num } from "@/components/surface";

type View = "today" | "after";

const views: { id: View; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "after", label: "After recommit" },
];

const shares = [
  {
    id: "vault",
    value: "75%",
    label: "Vault",
    body: "Locked. Holders vote pay or burn.",
    width: "75%",
    fill: "bg-[var(--ink)]",
    delay: "0ms",
  },
  {
    id: "runway",
    value: "15%",
    label: "Runway",
    body: "Paid to the builder as it lands.",
    width: "15%",
    fill: "bg-[#6e6e73]",
    delay: "120ms",
  },
  {
    id: "platform",
    value: "10%",
    label: "Platform",
    body: "Proof of Ship.",
    width: "10%",
    fill: "bg-[#c9c9c5]",
    delay: "240ms",
  },
] as const;

const LockMark = () => (
  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
    <rect x="3" y="7.2" width="10" height="7.3" rx="1.6" fill="currentColor" />
    <path
      d="M5.2 7.2V5.1a2.8 2.8 0 1 1 5.6 0v2.1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const Stem = ({ className = "" }: { className?: string }) => (
  <div aria-hidden="true" className={`mx-auto h-7 w-px bg-black/15 ${className}`} />
);

export const RecommitVisual = () => {
  const [view, setView] = useState<View>("today");
  const after = view === "after";

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      setView("after");
      return;
    }
    const timer = window.setTimeout(() => setView("after"), 1100);
    return () => window.clearTimeout(timer);
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = views[(index + step + views.length) % views.length];
    setView(next.id);
  };

  return (
    <figure className="overflow-hidden">
      <div className="flex flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:pt-6">
        <p className="text-[13px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
          Where creator fees go
        </p>
        <div
          role="tablist"
          aria-label="Fee split view"
          className="flex w-fit rounded-full bg-[#f5f5f7] p-1"
        >
          {views.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`recommit-view-tab-${item.id}`}
              aria-selected={view === item.id}
              aria-controls="recommit-view-panel"
              tabIndex={view === item.id ? 0 : -1}
              onClick={() => setView(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition",
                focusRing,
                view === item.id
                  ? "bg-[var(--ink)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--ink)]",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        id="recommit-view-panel"
        role="tabpanel"
        aria-labelledby={`recommit-view-tab-${view}`}
        className="px-5 pb-6 pt-6 sm:px-8 sm:pb-8"
      >
        <div className="flex flex-col items-center">
          <p className={`text-[22px] font-semibold tracking-[-0.03em] ${num}`}>100%</p>
          <p className="mt-1 text-[13px] text-[var(--muted)]">Creator fees from here on</p>
          <Stem />
          <div
            className={cn(
              "rounded-full px-3 py-1 text-[12px] font-medium",
              after ? "bg-[var(--ink)] text-white" : "bg-[#eee] text-[var(--muted)]",
            )}
          >
            {after ? "One fee change, then locked" : "No vault yet"}
          </div>
          <Stem />
        </div>

        {after ? (
          <div>
            <div className="flex h-3 overflow-hidden rounded-full" aria-hidden="true">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className={`bar-fill h-full ${share.fill}`}
                  style={{ width: share.width, animationDelay: share.delay }}
                />
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">
              {shares.map((share) => (
                <div key={share.id} className="rounded-[18px] bg-[#f5f5f7] p-4">
                  <p className={`text-[28px] font-semibold tracking-[-0.04em] ${num}`}>{share.value}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[15px] font-semibold tracking-[-0.02em]">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${share.fill}`} aria-hidden="true" />
                    {share.id === "vault" ? <LockMark /> : null}
                    {share.label}
                  </p>
                  <p className="mt-1 text-[13px] leading-snug text-[var(--muted)]">{share.body}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-[420px] rounded-[18px] bg-[#f5f5f7] p-5 text-center sm:p-6">
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-white">
              <div className="bar-fill h-full w-full rounded-full bg-[#c9c9c5]" />
            </div>
            <p className={`text-[28px] font-semibold tracking-[-0.04em] ${num}`}>100%</p>
            <p className="mt-1 text-[15px] font-semibold tracking-[-0.02em]">Builder wallet</p>
            <p className="mt-1 text-[13px] leading-snug text-[var(--muted)]">
              Fees land with the builder. Holders have no vote.
            </p>
          </div>
        )}

        {after ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] bg-[#eef8f1] px-4 py-4">
              <p className="text-[13px] font-medium text-[var(--pay)]">Pay wins</p>
              <p className="mt-1 text-[15px] leading-snug text-[var(--ink)]">
                60% of the vault is paid to the builder in SOL. The rest waits for the next promise.
              </p>
            </div>
            <div className="rounded-[18px] bg-[#fdf1f0] px-4 py-4">
              <p className="text-[13px] font-medium text-[var(--burn)]">Burn wins</p>
              <p className="mt-1 text-[15px] leading-snug text-[var(--ink)]">
                60% of the vault buys $POS. The rest waits for the next promise.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <figcaption className="border-t border-black/[0.06] px-5 py-4 text-[13px] leading-relaxed text-[var(--muted)] sm:px-8">
        {after
          ? "The one allowed fee change sets this split and revokes the admin. After that, you cannot change it, and neither can we."
          : "A live pump.fun coin can still send every creator fee to the builder until that one fee change is used."}
      </figcaption>
    </figure>
  );
};

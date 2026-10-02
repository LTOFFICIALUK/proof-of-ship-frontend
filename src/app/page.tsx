import Link from "next/link";
import { HomeRows, LiveStrip } from "@/components/home-live";
import { btnGhost, btnPrimary, display, num, panel } from "@/components/surface";
import { TextMist } from "@/components/text-mist";

const steps = [
  {
    title: "Promise",
    body: "Post one promise with a deadline 3 to 14 days out, and say what done looks like.",
  },
  {
    title: "Proof",
    body: "Ship it and post the proof link. That opens a 48 hour holder vote. No proof by the deadline is a miss.",
  },
  {
    title: "Holders decide",
    body: "Pay spends 60 percent of the vault to buy $POS for the builder, and unlocks 20 percent of the remaining dev bag. Burn spends that same slice to buy the coin and burn it. The rest waits for the next promise.",
  },
];

const split = [
  { value: "75%", label: "Vault" },
  { value: "15%", label: "Runway" },
  { value: "10%", label: "Platform" },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[980px]">
      <section className="relative mx-auto max-w-[860px] px-1 pb-10 pt-6 text-center md:px-10 md:pb-20 md:pt-16">
        <TextMist className="inset-x-0 -inset-y-6 md:-inset-x-6 md:-inset-y-8" />
        <p className="text-[17px] font-medium text-[var(--muted)]">Ship or burn</p>
        <h1 className={`mt-3 ${display}`}>The dev cannot take the fees and leave.</h1>
        <p className="mx-auto mt-5 max-w-[540px] text-[19px] leading-[1.45] text-[var(--muted)]">
          Launch a pump.fun coin. Most creator fees lock in a vault. Holders vote
          pay or burn. No computer grades the work. The crowd with coins decides.
        </p>
        <p className="mt-6 text-[15px] text-[var(--muted)]">on pump.fun</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/launch" className={`${btnPrimary} px-6 py-3 text-[17px]`}>
            Launch a coin
          </Link>
          <Link href="/coins" className={`${btnGhost} px-6 py-3 text-[17px]`}>
            See the coins
          </Link>
          <Link href="/feed" className={`${btnGhost} px-6 py-3 text-[17px]`}>
            Watch the feed
          </Link>
        </div>
      </section>

      <LiveStrip />

      <section className={`${panel} mx-auto mt-16 max-w-[760px] overflow-hidden`}>
        <div className="grid grid-cols-3">
          {split.map((item, index) => (
            <div
              key={item.label}
              className={`px-2 py-5 text-center sm:px-4 sm:py-7 ${index > 0 ? "border-l border-black/[0.06]" : ""}`}
            >
              <p className={`text-[22px] font-semibold tracking-[-0.03em] sm:text-[40px] ${num}`}>{item.value}</p>
              <p className="mt-1 text-[13px] text-[var(--muted)]">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="divide-y divide-black/[0.06] border-t border-black/[0.06] px-4 sm:px-8">
          {steps.map((step) => (
            <div key={step.title} className="grid gap-2 py-7 sm:grid-cols-[180px_1fr] sm:items-baseline sm:gap-8">
              <h2 className="text-[22px] font-semibold tracking-[-0.03em]">{step.title}</h2>
              <p className="text-[17px] leading-relaxed text-[var(--muted)]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <HomeRows />
    </div>
  );
}

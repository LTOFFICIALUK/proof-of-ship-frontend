import Link from "next/link";
import { PumpMark } from "@/components/pump-mark";
import { btnGhost, btnPrimary, display, panel } from "@/components/surface";

const steps = [
  {
    title: "Lock",
    body: "75 percent of creator fees sit in a vault. 15 percent is runway. 10 percent is the platform.",
  },
  {
    title: "Promise",
    body: "Start with one promise. Add more anytime. Miss the next one and leftover fees burn.",
  },
  {
    title: "Vote",
    body: "Holders lock coins to vote. More pay than burn: the vault pays the dev. More burn: that SOL buys and burns the coin.",
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
      <section className="relative mx-auto max-w-[820px] px-4 pt-8 text-center md:pt-14">
        <div aria-hidden="true" className="absolute inset-x-0 -top-4 bottom-0 -z-10 rounded-[36px] bg-[#f5f5f7]" />
        <p className="text-[17px] font-medium text-[var(--muted)]">Ship or burn</p>
        <h1 className={`mt-3 ${display}`}>The dev cannot take the fees and leave.</h1>
        <p className="mx-auto mt-5 max-w-[540px] text-[19px] leading-[1.45] text-[var(--muted)]">
          Launch a pump.fun coin. Most creator fees lock in a vault. Holders vote
          pay or burn. No computer grades the work. The crowd with coins decides.
        </p>
        <div className="mt-6 flex justify-center">
          <PumpMark label="Launched on pump.fun" />
        </div>
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

      <section className={`${panel} mx-auto mt-16 max-w-[760px] overflow-hidden`}>
        <div className="grid grid-cols-3">
          {split.map((item, index) => (
            <div
              key={item.label}
              className={`px-4 py-7 text-center ${index > 0 ? "border-l border-black/[0.06]" : ""}`}
            >
              <p className="text-[28px] font-semibold tracking-[-0.03em] sm:text-[40px]">{item.value}</p>
              <p className="mt-1 text-[13px] text-[var(--muted)]">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="divide-y divide-black/[0.06] border-t border-black/[0.06] px-6 sm:px-8">
          {steps.map((step) => (
            <div key={step.title} className="grid gap-2 py-7 sm:grid-cols-[140px_1fr] sm:items-baseline sm:gap-8">
              <h2 className="text-[22px] font-semibold tracking-[-0.03em]">{step.title}</h2>
              <p className="text-[17px] leading-relaxed text-[var(--muted)]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

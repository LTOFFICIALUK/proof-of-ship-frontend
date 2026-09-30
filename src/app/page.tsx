import Link from "next/link";
import { btnGhost, btnPay, eyebrow, panel } from "@/components/surface";

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

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className={`${panel} relative overflow-hidden px-6 py-10 md:px-10 md:py-14`}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--pay)]/10 blur-3xl"
        />
        <p className={`mb-5 ${eyebrow}`}>Ship or burn</p>
        <h1 className="max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight md:text-7xl">
          The dev cannot take the fees and leave.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
          Launch a pump.fun coin. Most creator fees lock in a vault. Holders vote
          pay or burn. No computer grades the work. The crowd with coins decides.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/launch" className={btnPay}>
            Launch a coin
          </Link>
          <Link href="/feed" className={btnGhost}>
            Watch the feed
          </Link>
        </div>
        <div className="mt-10 max-w-md">
          <div className="flex h-2 overflow-hidden rounded-full bg-white/5">
            <div className="w-[75%] bg-[var(--pay)]" />
            <div className="w-[15%] bg-[var(--stamp)]" />
            <div className="w-[10%] bg-white/25" />
          </div>
          <div className="mt-3 flex justify-between gap-2 text-[10px] uppercase tracking-[0.12em] text-[var(--muted)] sm:text-[11px]">
            <span>75 vault</span>
            <span>15 runway</span>
            <span>10 platform</span>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {steps.map((card, index) => (
          <div key={card.title} className={`${panel} p-6`}>
            <p className={eyebrow}>0{index + 1}</p>
            <h2 className="mt-3 font-serif text-2xl">{card.title}</h2>
            <p className="mt-3 leading-relaxed text-[var(--muted)]">{card.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

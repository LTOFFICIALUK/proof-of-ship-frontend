import type { Metadata } from "next";
import Link from "next/link";
import { RecommitVisual } from "@/components/recommit-visual";
import { btnGhost, btnPrimary, num, pageTitle, panel } from "@/components/surface";
import { Misted } from "@/components/text-mist";

export const metadata: Metadata = {
  title: "Recommit",
  description:
    "Existing pump.fun coins get one allowed fee change. Recommit turns that change into a vault. Pay pays the builder in SOL. Burn buys $POS.",
};

const steps = [
  {
    title: "Prove you launched it.",
    body: "The wallet that created the coin has to sign. That is the only wallet that can spend the fee change. Nobody can recommit a coin for you.",
  },
  {
    title: "Spend the one change.",
    body: "We set the same split a new launch uses: 75% vault, 15% runway, 10% platform. The admin is then revoked. The split cannot change again.",
  },
  {
    title: "Post a promise.",
    body: "Write what you will ship and when, from 30 minutes to 30 days out. From that point the coin follows the same vote loop as a new Proof of Ship launch.",
  },
  {
    title: "Holders vote.",
    body: "Pay pays the builder in SOL. Burn buys $POS. No computer grades the work. The crowd with coins decides. A missed next promise burns leftover fees into the project coin.",
  },
];

const rules = [
  {
    title: "One change",
    body: "pump.fun lets a coin change creator fee sharing once. Recommit is that change. If the coin already set a split, this path is closed.",
  },
  {
    title: "Future fees only",
    body: "This does not take back fees you already took. Only creator fees after the change go into the vault split.",
  },
  {
    title: "Same vote rules",
    body: "After recommit, pay still pays the builder in SOL, and burn still buys $POS. The vault, promises, and quorum work the same as a coin launched here.",
  },
];

const paths = [
  {
    title: "Launch a new coin",
    body: "The vault is in place from the first creator fee. You can do this now.",
    href: "/launch",
    action: "Launch",
    open: true,
  },
  {
    title: "Recommit a live coin",
    body: "For a pump.fun coin that is already live, if the one fee change is still unused. Opens after Season 0.",
    href: "/recommit",
    action: "Not open yet",
    open: false,
  },
];

export default function RecommitPage() {
  return (
    <div className="mx-auto max-w-[860px] pt-4">
      <Misted cover className="max-w-[640px]">
        <p className="text-[15px] font-medium text-[var(--muted)]">Ships after Season 0</p>
        <h1 className={`mt-3 ${pageTitle}`}>Turn the one fee change into a vault.</h1>
        <p className="mt-4 text-[18px] leading-relaxed text-[var(--muted)]">
          Existing pump.fun coins can change creator fee sharing once. Recommit spends that change on the Proof of Ship split. New fees lock. Holders vote pay or burn. Pay pays the builder in SOL. Burn buys $POS.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/launch" className={`${btnPrimary} px-6 py-3 text-[16px]`}>
            Launch a coin
          </Link>
          <Link href="/how" className={`${btnGhost} px-6 py-3 text-[16px]`}>
            How votes work
          </Link>
        </div>
      </Misted>

      <section className={`${panel} mt-10`}>
        <RecommitVisual />
      </section>

      <section className="mt-14">
        <Misted>
          <h2 className="text-[22px] font-semibold tracking-[-0.03em]">How recommit works</h2>
        </Misted>
        <ol className="mt-6 divide-y divide-black/[0.06] border-y border-black/[0.06]">
          {steps.map((step, index) => (
            <li key={step.title} className="grid gap-2 py-7 sm:grid-cols-[56px_1fr] sm:gap-6">
              <span className={`font-semibold text-[var(--muted)] ${num}`}>0{index + 1}</span>
              <p className="text-[17px] leading-relaxed text-[var(--muted)]">
                <strong className="font-semibold text-[var(--ink)]">{step.title}</strong> {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        {rules.map((rule) => (
          <div key={rule.title} className={`${panel} p-5 sm:p-6`}>
            <h2 className="text-[17px] font-semibold tracking-[-0.02em]">{rule.title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">{rule.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-2">
        {paths.map((path) => (
          <div key={path.title} className={`${panel} flex flex-col p-6 sm:p-7`}>
            <p className="text-[13px] font-medium text-[var(--muted)]">
              {path.open ? "Open now" : "After Season 0"}
            </p>
            <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em]">{path.title}</h2>
            <p className="mt-2 flex-1 text-[16px] leading-relaxed text-[var(--muted)]">{path.body}</p>
            {path.open ? (
              <Link href={path.href} className={`${btnPrimary} mt-6 self-start`}>
                {path.action}
              </Link>
            ) : (
              <p className="mt-6 text-[14px] font-medium text-[var(--muted)]">{path.action}</p>
            )}
          </div>
        ))}
      </section>

      <Misted className="mt-14 max-w-[640px]">
        <h2 className="text-[22px] font-semibold tracking-[-0.03em]">Who this is for</h2>
        <p className="mt-3 text-[17px] leading-relaxed text-[var(--muted)]">
          Creators of live pump.fun coins who still have the one fee change unused, and who want holders to control the vault instead of taking fees with no vote.
        </p>
        <p className="mt-4 text-[17px] leading-relaxed text-[var(--muted)]">
          If you want the vault from day one, launch a new coin. Season 0 is those launches. Recommit comes after that.
        </p>
      </Misted>
    </div>
  );
}

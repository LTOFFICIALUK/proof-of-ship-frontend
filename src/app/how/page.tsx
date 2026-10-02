import { Misted } from "@/components/text-mist";
import { pageTitle } from "@/components/surface";

const steps = [
  {
    title: "Launch.",
    body: "Sign in with your wallet and your X account. Launch a pump.fun coin with one promise: what you'll ship and when, 3 to 14 days out.",
  },
  {
    title: "Fees lock.",
    body: "Creator fees split on chain at launch: 75% to the coin's vault, 15% to you as runway, 10% to the platform. The split can't be changed by you or by us. You can't withdraw the vault.",
  },
  {
    title: "Show your proof.",
    body: "When you've shipped, post proof: a link, a repo, a demo. That opens a 48 hour vote. No proof by the deadline means 60% of the vault buys the coin and burns it.",
  },
  {
    title: "Holders decide.",
    body: "Holders vote pay or burn. Your vote counts the lowest amount you held from when the promise was posted until the vote closes. Builders can't vote on their own coins. The result is hidden until the vote ends.",
  },
  {
    title: "Pay or burn.",
    body: "If pay wins, 60% of the vault buys $POS for the builder, and 20% of the remaining dev bag unlocks. If burn wins, 60% buys the coin and burns it. The other 40% stays for the next promise. A tie, or a vote where under 2% of eligible supply turns out, rolls the 60% over to the next promise.",
  },
  {
    title: "Keep shipping.",
    body: "The builder has 7 days to post the next promise. If they don't, the vault and new fees burn. A builder can walk away at any time, and the whole vault burns.",
  },
];

export default function HowPage() {
  return (
    <Misted cover className="mx-auto max-w-[720px] pt-4">
      <h1 className={pageTitle}>How it works</h1>
      <ol className="mt-8 divide-y divide-black/[0.06] border-y border-black/[0.06]">
        {steps.map((step, index) => (
          <li key={step.title} className="grid gap-2 py-7 sm:grid-cols-[56px_1fr] sm:gap-6">
            <span className="font-mono text-[17px] font-semibold text-[var(--muted)]">0{index + 1}</span>
            <p className="text-[17px] leading-relaxed text-[var(--muted)]">
              <strong className="font-semibold text-[var(--ink)]">{step.title}</strong> {step.body}
            </p>
          </li>
        ))}
      </ol>
    </Misted>
  );
}

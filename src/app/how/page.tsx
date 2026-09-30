import { pageTitle } from "@/components/surface";

const steps = [
  {
    title: "Launch.",
    body: "Connect a wallet and an X handle. Write at least one promise with a date.",
  },
  {
    title: "Fees lock.",
    body: "Creator fees split 75 vault, 15 runway, 10 platform. The vault cannot be withdrawn by the dev.",
  },
  {
    title: "Holders vote.",
    body: "When the date hits, a 48 hour vote opens. Coins lock until it ends. You need about 2 percent of supply to vote for it to count.",
  },
  {
    title: "Pay or burn.",
    body: "Pay sends the vault to the dev. Burn buys the coin and burns it. A tie burns.",
  },
  {
    title: "Keep promising.",
    body: "After a vote the dev has 7 days to post the next promise. If they do not, leftover fees and new fees burn.",
  },
];

export default function HowPage() {
  return (
    <div className="mx-auto max-w-[720px] pt-4">
      <h1 className={pageTitle}>How it works</h1>
      <ol className="mt-8 divide-y divide-black/[0.06] border-y border-black/[0.06]">
        {steps.map((step, index) => (
          <li key={step.title} className="grid gap-2 py-7 sm:grid-cols-[56px_1fr] sm:gap-6">
            <span className="text-[17px] font-semibold text-[var(--muted)]">0{index + 1}</span>
            <p className="text-[17px] leading-relaxed text-[var(--muted)]">
              <strong className="font-semibold text-[var(--ink)]">{step.title}</strong> {step.body}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function HowPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-4xl">How it works</h1>
      <ol className="mt-8 space-y-6 text-[var(--muted)]">
        <li>
          <strong className="text-[var(--ink)]">1. Launch.</strong> Connect a
          wallet and an X handle. Write at least one promise with a date.
        </li>
        <li>
          <strong className="text-[var(--ink)]">2. Fees lock.</strong> Creator
          fees split 75 vault, 15 runway, 10 platform. The vault cannot be
          withdrawn by the dev.
        </li>
        <li>
          <strong className="text-[var(--ink)]">3. Holders vote.</strong> When
          the date hits, a 48 hour vote opens. Coins lock until it ends. You
          need about 2 percent of supply to vote for it to count.
        </li>
        <li>
          <strong className="text-[var(--ink)]">4. Pay or burn.</strong> Pay
          sends the vault to the dev. Burn buys the coin and burns it. A tie
          burns.
        </li>
        <li>
          <strong className="text-[var(--ink)]">5. Keep promising.</strong> After
          a vote the dev has 7 days to post the next promise. If they do not,
          leftover fees and new fees burn.
        </li>
      </ol>
    </div>
  );
}

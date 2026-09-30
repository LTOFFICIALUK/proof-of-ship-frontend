import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <p className="mb-4 text-sm uppercase tracking-[0.2em] text-[var(--stamp)]">
        Ship or burn
      </p>
      <h1 className="max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
        The dev cannot take the fees and leave.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-[var(--muted)]">
        Launch a pump.fun coin. Most creator fees lock in a vault. Holders vote
        pay or burn. No computer grades the work. The crowd with coins decides.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/launch"
          className="rounded-full bg-[var(--pay)] px-6 py-3 font-medium text-black"
        >
          Launch a coin
        </Link>
        <Link
          href="/feed"
          className="rounded-full border border-[var(--line)] px-6 py-3"
        >
          Watch the feed
        </Link>
      </div>
      <section className="mt-16 grid gap-4 md:grid-cols-3">
        {[
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
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6"
          >
            <h2 className="font-serif text-2xl">{card.title}</h2>
            <p className="mt-3 text-[var(--muted)]">{card.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

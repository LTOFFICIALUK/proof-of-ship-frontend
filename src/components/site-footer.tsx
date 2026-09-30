import Link from "next/link";

export const SiteFooter = () => {
  return (
    <footer className="relative z-10 mt-auto min-w-0 border-t border-[var(--line)] px-5 py-8 text-sm text-[var(--muted)] md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>Ship or burn. Creator fees stay locked until holders vote.</p>
        <nav className="flex gap-5">
          <Link className="transition hover:text-[var(--ink)]" href="/how">
            How it works
          </Link>
          <Link className="transition hover:text-[var(--ink)]" href="/feed">
            Feed
          </Link>
          <Link className="transition hover:text-[var(--ink)]" href="/launch">
            Launch
          </Link>
        </nav>
      </div>
    </footer>
  );
};

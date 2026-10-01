import Link from "next/link";
import { focusRing } from "@/components/surface";

export const SiteFooter = () => {
  return (
    <footer className="relative z-10 mt-auto min-w-0 border-t border-black/[0.06] px-5 py-8 text-[12px] text-[var(--muted)] md:px-8">
      <div className="mx-auto flex max-w-[980px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>Ship or burn. Creator fees stay locked until holders vote.</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          <Link className={`transition hover:text-[var(--ink)] ${focusRing}`} href="/coins">
            Coins
          </Link>
          <Link className={`transition hover:text-[var(--ink)] ${focusRing}`} href="/how">
            How it works
          </Link>
          <Link className={`transition hover:text-[var(--ink)] ${focusRing}`} href="/feed">
            Feed
          </Link>
          <Link className={`transition hover:text-[var(--ink)] ${focusRing}`} href="/launch">
            Launch
          </Link>
        </nav>
      </div>
    </footer>
  );
};

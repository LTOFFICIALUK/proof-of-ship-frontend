import Link from "next/link";
import { Logo } from "@/components/logo";
import { focusRing } from "@/components/surface";
import { Misted } from "@/components/text-mist";

export const SiteFooter = () => {
  return (
    <footer className="relative z-10 mt-auto min-w-0 shrink-0 border-t border-black/[0.06] px-5 py-8 text-[12px] text-[var(--muted)] md:px-8">
      <Misted className="mx-auto max-w-[980px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Logo size={22} />
            <p>Ship or burn. Creator fees stay locked until holders vote.</p>
          </div>
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
            <Link className={`transition hover:text-[var(--ink)] ${focusRing}`} href="/recommit">
              Recommit
            </Link>
            <Link className={`transition hover:text-[var(--ink)] ${focusRing}`} href="/terms">
              Terms
            </Link>
            <Link className={`transition hover:text-[var(--ink)] ${focusRing}`} href="/privacy">
              Privacy
            </Link>
            <a
              className={`transition hover:text-[var(--ink)] ${focusRing}`}
              href="https://x.com/useproofofship"
              target="_blank"
              rel="noreferrer"
              aria-label="Proof of Ship on X"
            >
              @useproofofship
            </a>
          </nav>
        </div>
      </Misted>
    </footer>
  );
};

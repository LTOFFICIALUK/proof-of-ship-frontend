import Link from "next/link";
import { btnGhost, panel } from "@/components/surface";

export default function NotFound() {
  return (
    <div className={`${panel} mx-auto max-w-xl p-8`}>
      <h1 className="font-serif text-5xl tracking-tight">Page missing</h1>
      <p className="mt-3 text-[var(--muted)]">That route is not here.</p>
      <Link href="/" className={`${btnGhost} mt-6`}>
        Back home
      </Link>
    </div>
  );
}

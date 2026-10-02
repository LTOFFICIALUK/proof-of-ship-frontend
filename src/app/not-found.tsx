import Link from "next/link";
import { btnPrimary, pageTitle } from "@/components/surface";
import { Misted } from "@/components/text-mist";

export default function NotFound() {
  return (
    <Misted cover className="mx-auto max-w-[560px] pt-10 text-center">
      <h1 className={pageTitle}>Page missing</h1>
      <p className="mt-3 text-[17px] text-[var(--muted)]">That route is not here.</p>
      <Link href="/" className={`${btnPrimary} mt-6`}>
        Back home
      </Link>
    </Misted>
  );
}

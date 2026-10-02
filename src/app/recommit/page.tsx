import Link from "next/link";
import { pageTitle, panel, textLink } from "@/components/surface";
import { Misted } from "@/components/text-mist";

export default function RecommitPage() {
  return (
    <div className="mx-auto max-w-[720px] pt-4">
      <Misted cover>
        <h1 className={pageTitle}>Recommit</h1>
      </Misted>
      <section className={`${panel} mt-8 space-y-4 p-6 sm:p-8`}>
        <p className="text-[17px] leading-relaxed text-[var(--muted)]">
          Existing pump.fun coins get one allowed fee change. Recommit turns that change into a vault split so holders can vote pay or burn on later promises.
        </p>
        <p className="text-[17px] leading-relaxed text-[var(--muted)]">
          This path ships after Season 0. Launch a new coin if you want the vault from day one.
        </p>
        <p>
          <Link href="/launch" className={textLink}>
            Launch a coin
          </Link>
        </p>
      </section>
    </div>
  );
}

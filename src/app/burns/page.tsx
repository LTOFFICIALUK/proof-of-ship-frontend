import type { Metadata } from "next";
import { BurnsList } from "@/components/burns-list";
import { pageTitle } from "@/components/surface";
import { Misted } from "@/components/text-mist";

export const metadata: Metadata = {
  title: "Burns",
  description: "Every buy and burn, with the SOL spent, the reason, and the Solscan transactions.",
};

export default function BurnsPage() {
  return (
    <div className="mx-auto max-w-[720px] pt-4">
      <Misted cover>
        <h1 className={pageTitle}>Burns</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-[var(--muted)]">
          Each row is one coin. It shows the SOL spent, why it burned, how many tokens were destroyed, and the buy and burn transactions on Solscan.
        </p>
      </Misted>
      <BurnsList />
    </div>
  );
}

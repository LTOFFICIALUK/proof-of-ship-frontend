import { CoinBrowser } from "@/components/coin-browser";
import { pageTitle } from "@/components/surface";
import { Misted } from "@/components/text-mist";

export default function CoinsPage() {
  return (
    <div className="mx-auto max-w-[980px] pt-2">
      <Misted cover>
        <h1 className={pageTitle}>Coins</h1>
        <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-[var(--muted)]">
          Every coin has one open promise. Open a coin to read it, check the proof, and vote.
        </p>
      </Misted>
      <CoinBrowser scope="live" />
    </div>
  );
}

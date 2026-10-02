import { CoinBrowser } from "@/components/coin-browser";
import { pageTitle } from "@/components/surface";

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-[980px] pt-2">
      <h1 className={pageTitle}>Demo coins</h1>
      <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-[var(--muted)]">
        These coins are fixtures. They are not on pump.fun, and the vault numbers are not on chain.
      </p>
      <CoinBrowser scope="demo" />
    </div>
  );
}

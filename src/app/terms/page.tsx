import type { Metadata } from "next";
import { LegalBlock, LegalPage } from "@/components/legal";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for using Proof of Ship.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms" updated="3 Oct 2026">
      <LegalBlock title="The product">
        <p>
          Proof of Ship lets a builder launch a pump.fun coin with most creator fees locked in a vault. Holders of that
          coin vote pay or burn. The product does not grade the work. The crowd with coins decides.
        </p>
        <p>
          Season 0 launches may stay off pump.fun until the vault program is live. A demo launch still follows these
          rules on this site.
        </p>
      </LegalBlock>
      <LegalBlock title="Who can use it">
        <p>
          You need a Solana wallet and an X account to launch. You must be able to enter a binding agreement. If you
          cannot, do not use the site.
        </p>
      </LegalBlock>
      <LegalBlock title="Your wallet and your X">
        <p>
          You hold your own keys. We do not hold them. Signing a message proves you control a wallet. Linking X proves
          you control that handle. One X account can be verified for one wallet.
        </p>
        <p>You are responsible for what you sign, what you post, and what happens in that wallet.</p>
      </LegalBlock>
      <LegalBlock title="The fee split">
        <p>
          Creator fees split 75% to the vault, 15% to the builder as runway, and 10% to the platform. You cannot change
          that split. You cannot withdraw the vault.
        </p>
        <p>
          A pay vote pays 60% of the vault to the builder in SOL and unlocks 20% of the remaining locked bag. A burn vote
          spends that same slice to buy $POS, mint H49xNgg1hMV6LqXK6if2g8CYnrvp7CxQ5SJTnDRwPoS. A miss or an abandon
          spends that same slice to buy the project coin and burn it. A lapse spends leftover vault SOL on $POS. The rest
          stays for the next promise.
        </p>
      </LegalBlock>
      <LegalBlock title="Promises and votes">
        <p>
          A builder posts a promise with a deadline from 30 minutes to 30 days out. Proof before the deadline opens a 48 hour holder
          vote. No proof by the deadline is a miss. About 2% of eligible supply must vote for the vote to count.
        </p>
        <p>
          After a close, the builder has 7 days to post the next promise. If they do not, leftover vault fees and new
          vault fees buy $POS. A builder can walk away at any time, and the vault burns into the project coin.
        </p>
      </LegalBlock>
      <LegalBlock title="What we are not">
        <p>
          This is not financial advice. Coins can go to zero. pump.fun, Phantom, X, and Solana are separate products
          with their own rules. We do not control them.
        </p>
      </LegalBlock>
      <LegalBlock title="Changes">
        <p>
          We can change the site, these terms, and Season 0 rules. If a rule on chain and a rule on this page disagree,
          the chain wins once the vault program is live.
        </p>
      </LegalBlock>
    </LegalPage>
  );
}

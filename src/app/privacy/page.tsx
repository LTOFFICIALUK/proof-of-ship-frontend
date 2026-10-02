import type { Metadata } from "next";
import { LegalBlock, LegalPage } from "@/components/legal";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Proof of Ship collects and how it is used.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy" updated="2 Oct 2026">
      <LegalBlock title="What we collect">
        <p>If you only browse, we load public coin and feed data. We do not need a wallet for that.</p>
        <p>If you connect a wallet we store a session cookie and your public Solana address.</p>
        <p>If you verify X we store your X user id and handle. We ask X for read access so we can see who you are.</p>
        <p>
          If you launch, vote, chat, or post proof we store what you submit: names, tickers, images, promise text,
          proof links, votes, and chat messages.
        </p>
      </LegalBlock>
      <LegalBlock title="Why we collect it">
        <p>
          The wallet proves who can launch, vote, or post. The X handle is the public builder name on the coin. Images,
          promises, votes, and chat are the product. The session cookie keeps you signed in.
        </p>
      </LegalBlock>
      <LegalBlock title="What we do not do">
        <p>We do not sell this data. We do not ask for your seed phrase. We do not take custody of your keys.</p>
      </LegalBlock>
      <LegalBlock title="Who else sees it">
        <p>
          Coins, promises, votes, and builder handles are public. Wallet addresses used on chain are public. Hosting
          and the database see what the site needs to run. Phantom and X see what you approve in their prompts.
        </p>
      </LegalBlock>
      <LegalBlock title="Cookies">
        <p>
          A session cookie named pos_session is set when you sign in with your wallet. It is http only. It lasts 24
          hours or until you disconnect.
        </p>
      </LegalBlock>
      <LegalBlock title="How long we keep it">
        <p>
          Launch records, votes, and public profile data stay as part of the product history. You can disconnect your
          wallet to end the session. Unlinking X later is not a delete of coins already launched under that handle.
        </p>
      </LegalBlock>
      <LegalBlock title="Contact">
        <p>Questions about this page can go through the site or the Proof of Ship X account that owns the app.</p>
      </LegalBlock>
    </LegalPage>
  );
}

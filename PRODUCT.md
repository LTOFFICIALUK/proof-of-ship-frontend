# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Builders launch a pump.fun coin and post promises. Holders of that coin vote pay or burn. Both are primary. A builder is trying to launch with creator fees locked so the market can trust the work. A holder is trying to decide, with coins at stake, whether those fees are paid or burned.

## Product Purpose

Proof of Ship lets a builder launch a normal pump.fun coin while most creator fees stay locked. Holders vote when a promise comes due. Success means the dev cannot take the fees and leave: the crowd with coins decides pay or burn.

## Positioning

Creator fees are locked in a vault the builder cannot withdraw. Holders lock coins to vote. More pay than burn sends the vault to the builder. More burn, or a tie, buys the coin and burns it. No computer grades the work.

## Operating Context

The builder connects a wallet and an X handle, writes at least one promise with a deadline, and can add more later. When a deadline hits, a 48 hour vote opens. Coins stay locked until it ends. About 2 percent of supply must vote for the vote to count. After a vote, the builder has 7 days to post the next promise. If they do not, leftover fees and new fees burn.

## Capabilities and Constraints

Confirmed split: 75 percent of creator fees sit in the vault, 15 percent is runway, 10 percent is the platform. The vault cannot be withdrawn by the dev. One or more promises, not a fixed count. A missed next promise burns leftover and new fees. No quorum leaves the SOL in the vault. Wallet entry, voting, and promise posting stay as they are unless a later product decision changes them.

## Brand Commitments

The name is Proof of Ship. The voice is plain. Public copy does not use hyphens. The line holders should remember is ship or burn.

## Evidence on Hand

The working concept is `PROOF_OF_SHIP_CONCEPT.md` in the parent workspace. The live interface is the Next.js app in this repo: home, launch, feed, how it works, coin, and builder. There are no customer quotes, press clips, or performance stats cleared for the interface. Do not invent them.

## Product Principles

1. Holders with coins decide. The product does not grade the work.
2. Fees stay locked until a vote, or they burn when the builder stops promising.
3. Say the rule in plain language. Do not dress the mechanism up.
4. Show vault, paid, and burned as separate facts.
5. Do not invent proof the product does not have.

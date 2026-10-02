# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Builders launch a pump.fun coin and post promises. Holders of that coin vote pay or burn. Both are primary. A builder is trying to launch with creator fees locked so the market can trust the work. A holder is trying to decide, with coins at stake, whether those fees are paid or burned.

## Product Purpose

Proof of Ship lets a builder launch a normal pump.fun coin while most creator fees stay locked. Holders vote when a promise comes due. Success means the dev cannot take the fees and leave: the crowd with coins decides pay or burn.

## Positioning

Creator fees are locked in a vault the builder cannot withdraw. Holders vote after proof is posted. More pay than burn spends 60 percent of the vault to buy $POS for the builder, and unlocks 20 percent of the remaining dev bag. More burn than pay spends that same slice to buy the coin and burn it. A tie rolls the slice. No computer grades the work.

## Operating Context

The builder connects a wallet and an X handle, writes one promise with a deadline, and can add another after the open one closes. Posting proof before the deadline opens a 48 hour vote. No proof by the deadline burns 60 percent of the vault. About 2 percent of supply must vote for the vote to count. The first miss extends the vote 24 hours. After a close, the builder has 7 days to post the next promise. If they do not, leftover fees and new fees burn. SOL already queued to buy $POS is not pulled back into that burn.

## Capabilities and Constraints

Confirmed split: 75 percent of creator fees sit in the vault, 15 percent is runway, 10 percent is the platform. The vault cannot be withdrawn by the dev. A pay or burn moves 60 percent of the vault. The rest stays. Pay buys $POS, mint H49xNgg1hMV6LqXK6if2g8CYnrvp7CxQ5SJTnDRwPoS. Burn, a miss, a lapse, and an abandon buy and burn the project coin. A Jupiter quote does not count as a completed $POS buy. The mint was not tradable on 2 Oct 2026, so that SOL stays queued and the crank retries. Wallet entry, voting, and promise posting stay as they are unless a later product decision changes them.

## Brand Commitments

The name is Proof of Ship. The voice is plain. Public copy does not use hyphens. The line holders should remember is ship or burn.

## Evidence on Hand

The working concept is `PROOF_OF_SHIP_CONCEPT.md` in the parent workspace. The live interface is the Next.js app in this repo: home, launch, feed, how it works, coin, and builder. There are no customer quotes, press clips, or performance stats cleared for the interface. Do not invent them.

## Product Principles

1. Holders with coins decide. The product does not grade the work.
2. Fees stay locked until a vote, or they burn when the builder stops promising.
3. Say the rule in plain language. Do not dress the mechanism up.
4. Show the vault, $POS queued or bought, and burned SOL as separate facts.
5. Do not invent proof the product does not have.

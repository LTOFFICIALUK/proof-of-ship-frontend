# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Builders launch a pump.fun coin and post promises. Holders of that coin vote pay or burn. Both are primary. A builder is trying to launch with creator fees locked so the market can trust the work. A holder is trying to decide, with coins at stake, whether those fees are paid in SOL or used to buy and burn $POS.

## Product Purpose

Proof of Ship lets a builder launch a normal pump.fun coin while most creator fees stay locked. Holders vote when a promise comes due. Success means the dev cannot take the fees and leave: the crowd with coins decides pay or burn.

## Positioning

Creator fees are locked in a vault the builder cannot withdraw. Holders vote after proof is posted. More pay than burn pays 60 percent of the vault to the builder in SOL, and unlocks 20 percent of the remaining dev bag. More burn than pay spends that same slice to buy and burn $POS. A miss, a lapse, or an abandon also buys and burns $POS. A tie rolls the slice. No computer grades the work. None of these paths buy the project coin.

## Operating Context

The builder connects a wallet and an X handle, writes one promise with a deadline from 30 minutes to 30 days out, and can add another after the open one closes. Posting proof before the deadline opens a 48 hour vote. No proof by the deadline buys and burns $POS with 60 percent of the vault. About 2 percent of supply must vote for the vote to count. The first miss extends the vote 24 hours. After a close, the builder has 7 days to post the next promise. If they do not, leftover fees and new fees buy and burn $POS. SOL already queued for $POS still buys and burns $POS.

## Capabilities and Constraints

pump.fun pays 100 percent of creator fees to the vault wallet we control. We then send 15 percent to the builder as runway, keep 10 percent as platform, and hold 75 percent in the vault. The vault cannot be withdrawn by the dev. A pay or burn moves 60 percent of the vault. The rest stays. Pay pays the builder in SOL. Burn buys and burns $POS, mint H49xNgg1hMV6LqXK6if2g8CYnrvp7CxQ5SJTnDRwPoS. A miss, a lapse, and an abandon buy and burn that same mint. A Jupiter quote does not count as a completed $POS buy. The mint was not tradable on 2 Oct 2026, so that SOL stays queued and the crank retries. The builder stays the pump.fun creator. Fee sharing on that mint is 10,000 bps to the vault. Vault, platform, and crank wallets are live. Every contract address ends in PoS, taken from the mint bank. Wallet entry, voting, and promise posting stay as they are unless a later product decision changes them.

## Brand Commitments

The name is Proof of Ship. The voice is plain. Public copy does not use hyphens. The line holders should remember is ship or burn.

## Evidence on Hand

The working concept is `PROOF_OF_SHIP_CONCEPT.md` in the parent workspace. The live interface is the Next.js app in this repo: home, launch, feed, how it works, coin, and builder. There are no customer quotes, press clips, or performance stats cleared for the interface. Do not invent them.

## Product Principles

1. Holders with coins decide. The product does not grade the work.
2. Fees stay locked until a vote, or they buy and burn $POS when the builder stops promising.
3. Say the rule in plain language. Do not dress the mechanism up.
4. Show the vault, SOL paid to the builder, $POS queued or bought, and burned SOL as separate facts.
5. Do not invent proof the product does not have.

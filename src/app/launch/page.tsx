"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type ProjectView } from "@/lib/api";
import { formatDue } from "@/lib/format";
import { shortWallet, useWallet } from "@/lib/wallet";
import { ConnectWallet } from "@/components/connect-wallet";
import { DeadlinePicker } from "@/components/deadline-picker";
import { ImageDrop } from "@/components/image-drop";
import { Logo } from "@/components/logo";
import { btnGhost, btnPrimary, field, focusRing, labelClass, num, pageTitle, panel } from "@/components/surface";
import { Misted } from "@/components/text-mist";
import { toast } from "@/components/toast";
import { VerifiedTick } from "@/components/verified-tick";

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

const PROOF = [
  { id: "link", label: "Link" },
  { id: "repo", label: "Repo or release" },
  { id: "program", label: "Deployed program" },
  { id: "app", label: "App listing" },
  { id: "video", label: "Demo video" },
] as const;

type ProofId = (typeof PROOF)[number]["id"];

type LaunchBody = {
  name: string;
  symbol: string;
  description: string;
  image: string;
  website: string;
  linkPage: boolean;
  github: string;
  devBuyBps: number;
  promise: {
    title: string;
    doneLooksLike: string;
    proofType: ProofId;
    deadlineMs: number;
  };
};

const pad = (value: number) => String(value).padStart(2, "0");

const localInput = (ms: number) => {
  const date = new Date(ms);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const countClass = "mt-1 text-right text-[12px] text-[var(--muted)]";

const LaunchPreview = ({
  body,
  xHandle,
  imageFailed,
  onImageError,
}: {
  body: LaunchBody;
  xHandle: string;
  imageFailed: boolean;
  onImageError: () => void;
}) => {
  const showImage = Boolean(body.image) && !imageFailed;
  const due = Number.isFinite(body.promise.deadlineMs)
    ? formatDue(body.promise.deadlineMs)
    : "Pick a deadline";
  const proof = PROOF.find((item) => item.id === body.promise.proofType)?.label ?? "Link";
  return (
    <aside className="lg:sticky lg:top-28">
      <div className={`${panel} overflow-hidden`}>
        <p className="px-5 pt-4 text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
          Launch preview
        </p>
        <div className="flex items-start gap-4 p-5 pt-3">
          <div
            className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[18px] bg-[#f5f5f7] text-[22px] font-semibold text-[var(--muted)]"
            aria-hidden="true"
          >
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={body.image} alt="" onError={onImageError} className="h-full w-full object-cover" />
            ) : (
              (body.symbol || body.name || "?").slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[22px] font-semibold tracking-[-0.03em]">
              {body.name || <span className="text-[var(--muted)]">Coin name</span>}
            </p>
            <p className="mt-1 truncate text-[14px] text-[var(--muted)]">
              ${body.symbol || "TICKER"}
            </p>
            <p className="mt-1 flex items-center gap-1 truncate text-[13px] text-[var(--muted)]">
              {xHandle ? `@${xHandle}` : "@handle"}
              <VerifiedTick verified={Boolean(xHandle)} />
            </p>
          </div>
        </div>
        <div className="border-t border-black/[0.06] px-5 py-4">
          <p className="text-[12px] text-[var(--muted)]">First promise</p>
          <p className="mt-1 text-[15px] leading-relaxed">
            {body.promise.title || <span className="text-[var(--muted)]">What you will ship</span>}
          </p>
          {body.promise.doneLooksLike ? (
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">{body.promise.doneLooksLike}</p>
          ) : null}
          <p className={`mt-3 text-[13px] text-[var(--muted)] ${num}`}>
            {due}
            <span className="px-1.5">·</span>
            {proof}
          </p>
        </div>
        <div className="grid grid-cols-3 border-t border-black/[0.06]">
          {[
            { value: "75%", label: "Vault" },
            { value: "15%", label: "Runway" },
            { value: "10%", label: "Platform" },
          ].map((item, index) => (
            <div
              key={item.label}
              className={`px-2 py-4 text-center ${index > 0 ? "border-l border-black/[0.06]" : ""}`}
            >
              <p className={`text-[18px] font-semibold tracking-[-0.03em] ${num}`}>{item.value}</p>
              <p className="mt-0.5 text-[11px] text-[var(--muted)]">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-end justify-between gap-3 border-t border-black/[0.06] px-5 py-4">
          <div>
            <p className="text-[12px] text-[var(--muted)]">Vault</p>
            <p className={`mt-0.5 text-[15px] font-semibold ${num}`}>0 SOL</p>
          </div>
          <p className="text-right text-[12px] text-[var(--muted)]">
            {body.devBuyBps ? `Dev buy ${body.devBuyBps / 100}%. Stays locked` : "No extra buy"}
            <span className="block">on pump.fun</span>
          </p>
        </div>
      </div>
    </aside>
  );
};

export default function LaunchPage() {
  const router = useRouter();
  const { wallet, xHandle, busy: walletBusy, connect, ensureSession, refresh, signTransactions } = useWallet();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [website, setWebsite] = useState("");
  const [linkPage, setLinkPage] = useState(true);
  const [github, setGithub] = useState("");
  const [devBuy, setDevBuy] = useState("0");
  const [title, setTitle] = useState("");
  const [doneLooksLike, setDoneLooksLike] = useState("");
  const [proofType, setProofType] = useState<ProofId>("link");
  const [deadline, setDeadline] = useState(() => localInput(Date.now() + 7 * DAY));
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const body: LaunchBody = useMemo(
    () => ({
      name: name.trim(),
      symbol: symbol.trim(),
      description: description.trim(),
      image: image.trim(),
      website: website.trim(),
      linkPage,
      github: github.trim(),
      devBuyBps: Math.round(Number(devBuy) * 100),
      promise: {
        title: title.trim(),
        doneLooksLike: doneLooksLike.trim(),
        proofType,
        deadlineMs: new Date(deadline).getTime(),
      },
    }),
    [deadline, description, devBuy, doneLooksLike, github, image, linkPage, name, proofType, symbol, title, website],
  );

  useEffect(() => {
    setImageFailed(false);
  }, [image]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const x = params.get("x");
    if (x === "linked") {
      toast.ok("X is verified.");
      void refresh();
    }
    if (x === "failed") {
      toast.error("Could not verify X. Try again.");
    }
    if (x) {
      const url = new URL(window.location.href);
      url.searchParams.delete("x");
      window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    }
  }, [refresh]);

  const handleLinkX = async () => {
    if (!wallet) {
      toast.error("Connect a wallet first.");
      return;
    }
    const signedIn = await ensureSession();
    if (!signedIn) {
      return;
    }
    try {
      const data = await api<{ url: string }>("/v1/x/connect");
      window.location.assign(data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open X");
    }
  };

  const handleSubmit = async () => {
    if (!body.name || !body.symbol) {
      toast.error("Add a name and a ticker.");
      return;
    }
    if (!body.image) {
      toast.error("Add a coin image.");
      return;
    }
    if (!body.promise.title) {
      toast.error("Add what you will ship.");
      return;
    }
    if ((body.website && !/^https:\/\//.test(body.website)) || (body.github && !/^https:\/\//.test(body.github))) {
      toast.error("Links must start with https://");
      return;
    }
    const windowMs = body.promise.deadlineMs - Date.now();
    if (!Number.isFinite(body.promise.deadlineMs) || windowMs < 30 * MINUTE || windowMs > 30 * DAY) {
      toast.error("Pick a deadline from 30 minutes to 30 days out.");
      return;
    }
    if (!agreed) {
      toast.error("Tick the box to confirm you understand the vault rules.");
      return;
    }
    if (!wallet || !xHandle) {
      toast.error("Sign in with your wallet and verify X first.");
      return;
    }
    setBusy(true);
    try {
      const signedIn = await ensureSession();
      if (!signedIn) {
        return;
      }
      await refresh();
      const prepared = await api<{ mode: string; mint: string; transactions: string[] }>("/v1/launch/prepare", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setConfirming(true);
      let opened = false;
      const openCoin = (mint: string) => {
        if (!mint || opened) {
          return;
        }
        opened = true;
        router.push(`/c/${mint}`);
      };
      const transactions: string[] = [];
      for (const preparedTx of prepared.transactions) {
        const [signedTx] = await signTransactions([preparedTx]);
        if (!signedTx) {
          throw new Error("Phantom did not return the transaction.");
        }
        transactions.push(signedTx);
      }
      const submitted = await api<{ mint: string; buyTransaction?: string | null }>("/v1/launch/submit", {
        method: "POST",
        body: JSON.stringify({ ...body, transactions }),
      });
      openCoin(submitted.mint);
      toast.ok("Coin is live.");
      if (submitted.buyTransaction) {
        try {
          const [signedBuy] = await signTransactions([submitted.buyTransaction]);
          if (!signedBuy) {
            throw new Error("Phantom did not return the dev buy.");
          }
          await api(`/v1/launch/${submitted.mint}/buy`, {
            method: "POST",
            body: JSON.stringify({ transaction: signedBuy }),
          });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Coin is live. The dev buy did not land.");
        }
      }
    } catch (err) {
      setConfirming(false);
      toast.error(err instanceof Error ? err.message : "Launch failed");
    } finally {
      setBusy(false);
    }
  };

  const cta = !wallet ? "Connect wallet" : !xHandle ? "Verify X" : busy ? "Launching" : "Sign and launch";
  const ctaBusy = busy || walletBusy || confirming;

  return (
    <div className="mx-auto max-w-[1080px] pt-2">
      {confirming ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#f3f3f1]/80 px-4 backdrop-blur-md">
          <div className={`${panel} max-w-[420px] px-8 py-10 text-center`}>
            <div className="flex justify-center">
              <Logo size={48} state="loading" />
            </div>
            <p className="mt-5 text-[22px] font-semibold tracking-[-0.03em]">Confirming on chain</p>
            <p className="mt-2 text-[15px] text-[var(--muted)]">
              Phantom asks once. You pay the launch cost to the platform wallet. That wallet creates the coin and locks creator fees to the vault.
              {body.devBuyBps ? " Your dev buy stays locked. It is not sent to your wallet." : ""}
            </p>
          </div>
        </div>
      ) : null}

      <Misted cover>
        <h1 className={pageTitle}>Launch</h1>
        <p className="mt-3 max-w-[560px] text-[17px] leading-relaxed text-[var(--muted)]">
          Name the coin, drop an image, write one promise, then launch. Every contract address ends in PoS.
        </p>
      </Misted>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form
          noValidate
          className={`${panel} space-y-8 p-5 sm:p-7 md:p-8`}
          onSubmit={(event) => {
            event.preventDefault();
            if (!wallet) {
              void connect();
              return;
            }
            if (!xHandle) {
              void handleLinkX();
              return;
            }
            void handleSubmit();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#f5f5f7] px-4 py-3">
              <p className={labelClass}>Wallet</p>
              <div className="mt-2 flex min-h-[36px] items-center">
                {wallet ? (
                  <p className="break-all font-mono text-[14px]">{shortWallet(wallet)}</p>
                ) : (
                  <ConnectWallet />
                )}
              </div>
            </div>
            <div className="rounded-2xl bg-[#f5f5f7] px-4 py-3">
              <p className={labelClass}>X</p>
              <div className="mt-2 flex min-h-[36px] items-center">
                {xHandle ? (
                  <p className="text-[14px]">@{xHandle}</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleLinkX()}
                    className={`${wallet ? btnPrimary : btnGhost} px-4 py-1.5 text-[13px]`}
                    disabled={walletBusy}
                  >
                    Verify X
                  </button>
                )}
              </div>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-[18px] font-semibold tracking-[-0.03em]">Coin</h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <ImageDrop
                value={image}
                onChange={setImage}
                onError={(message) => toast.error(message)}
              />
              <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-[1fr_8.5rem]">
                <label className={labelClass}>
                  Coin name
                  <input
                    className={field}
                    value={name}
                    maxLength={32}
                    onChange={(event) => setName(event.target.value.slice(0, 32))}
                    required
                    aria-label="Coin name"
                    placeholder="Name"
                  />
                </label>
                <label className={labelClass}>
                  Ticker
                  <input
                    className={`${field} uppercase`}
                    value={symbol}
                    maxLength={10}
                    onChange={(event) =>
                      setSymbol(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))
                    }
                    required
                    aria-label="Ticker"
                    placeholder="TICKER"
                  />
                </label>
              </div>
            </div>
            <p className="text-[12px] text-[var(--muted)]">PNG, JPG, WEBP, or GIF. Drag, click, or paste.</p>
            <label className={labelClass}>
              Description
              <textarea
                className={field}
                value={description}
                onChange={(event) => setDescription(event.target.value.slice(0, 500))}
                rows={3}
                maxLength={500}
                aria-label="Description"
                placeholder="What this coin is for"
              />
              <span className={countClass}>{description.length}/500</span>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Website
                <input
                  className={field}
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  aria-label="Website"
                  placeholder="https://"
                />
              </label>
              <label className={labelClass}>
                GitHub
                <input
                  className={field}
                  value={github}
                  onChange={(event) => setGithub(event.target.value)}
                  aria-label="GitHub"
                  placeholder="https://"
                />
              </label>
            </div>
            <label className="flex items-start gap-3 text-[15px] leading-relaxed">
              <input
                type="checkbox"
                className="mt-1"
                checked={linkPage && !website.trim()}
                disabled={Boolean(website.trim())}
                onChange={(event) => setLinkPage(event.target.checked)}
                aria-label="Add this coin page to the token"
              />
              <span>
                {website.trim()
                  ? "Your website is the link on the token."
                  : "Add this coin page to the token. Pump and trackers use it as the website."}
              </span>
            </label>
          </section>

          <section className="space-y-4">
            <h2 className="text-[18px] font-semibold tracking-[-0.03em]">Promise</h2>
            <label className={labelClass}>
              What you will ship
              <input
                className={field}
                value={title}
                onChange={(event) => setTitle(event.target.value.slice(0, 80))}
                required
                maxLength={80}
                aria-label="Promise title"
                placeholder="Ship a public demo"
              />
              <span className={countClass}>{title.length}/80</span>
            </label>
            <label className={labelClass}>
              What done looks like
              <textarea
                className={field}
                value={doneLooksLike}
                onChange={(event) => setDoneLooksLike(event.target.value.slice(0, 500))}
                rows={4}
                maxLength={500}
                aria-label="What done looks like"
                placeholder="A live link anyone can open"
              />
              <span className={countClass}>{doneLooksLike.length}/500</span>
            </label>
            <div>
              <p className={labelClass}>Proof type</p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Proof type">
                {PROOF.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProofType(item.id)}
                    className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition duration-200 ${focusRing} ${
                      proofType === item.id
                        ? "bg-[var(--ink)] text-white"
                        : "bg-[#f5f5f7] text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                    aria-pressed={proofType === item.id}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className={labelClass}>Deadline, 30 minutes to 30 days</p>
                <DeadlinePicker
                  valueMs={new Date(deadline).getTime()}
                  minMs={Date.now() + 30 * MINUTE}
                  maxMs={Date.now() + 30 * DAY}
                  onChange={(ms) => setDeadline(localInput(ms))}
                />
              </div>
              <label className={labelClass}>
                Dev buy, 0 to 5 percent
                <div className="mt-2 flex items-center gap-3 rounded-xl bg-[#f5f5f7] px-4 py-3 ring-1 ring-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-[var(--ink)]/25">
                  <input
                    className="w-full accent-[var(--ink)]"
                    type="range"
                    min={0}
                    max={5}
                    step={0.1}
                    value={devBuy}
                    onChange={(event) => setDevBuy(event.target.value)}
                    aria-label="Dev buy"
                  />
                  <span className={`w-12 shrink-0 text-right text-[15px] font-medium ${num}`}>{devBuy}%</span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
                  A dev buy stays locked. It is not sent to your wallet. A Pay unlocks 20 percent of what is still locked. A Burn burns 20 percent of what is still locked. A lapse burns the rest. An abandon keeps what is still locked for 30 days. If you do not come back, those tokens are sold and the SOL buys and burns $POS.
                </p>
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-[18px] font-semibold tracking-[-0.03em]">Launch</h2>
            <p className="text-[15px] leading-relaxed text-[var(--muted)]">
              Your coin gets a contract address ending in PoS. Creator fees land in the vault we control. We send you 15% as runway. We hold 75% until holders vote. Pay pays you in SOL. Burn buys $POS.
              {body.devBuyBps ? ` You buy ${body.devBuyBps / 100}% at launch. That supply stays locked and is not sent to your wallet.` : ""}
            </p>
            <p className="text-[15px] leading-relaxed text-[var(--ink)]">
              Phantom asks once. You pay the launch cost to the platform wallet. That wallet creates the coin and locks creator fees to the vault.
              {body.devBuyBps ? " Your dev buy stays locked. It is not sent to your wallet." : ""}
            </p>
            <label className="flex items-start gap-3 text-[15px] leading-relaxed">
              <input
                type="checkbox"
                className="mt-1"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                aria-label="Creator fees go to the vault we control. I cannot withdraw it."
              />
              <span>Creator fees go to the vault we control. I cannot withdraw it.</span>
            </label>
            <button type="submit" disabled={ctaBusy} className={`${btnPrimary} w-full py-3.5 text-[16px]`}>
              {cta}
            </button>
          </section>
        </form>

        <LaunchPreview
          body={body}
          xHandle={xHandle}
          imageFailed={imageFailed}
          onImageError={() => setImageFailed(true)}
        />
      </div>
    </div>
  );
}

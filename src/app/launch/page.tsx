"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type ProjectView } from "@/lib/api";
import { useWallet } from "@/lib/wallet";
import { ConnectWallet } from "@/components/connect-wallet";
import { Logo } from "@/components/logo";
import { btnGhost, btnPrimary, field, labelClass, pageTitle, panel } from "@/components/surface";
import { Misted } from "@/components/text-mist";

const DAY = 24 * 60 * 60 * 1000;

const PROOF = [
  { id: "link", label: "Link" },
  { id: "repo", label: "Repo or release" },
  { id: "program", label: "Deployed program" },
  { id: "app", label: "App listing" },
  { id: "video", label: "Demo video" },
] as const;

const STEPS = ["Sign in", "Coin", "Promise", "Review"] as const;

type ProofId = (typeof PROOF)[number]["id"];

type LaunchBody = {
  name: string;
  symbol: string;
  description: string;
  image: string;
  website: string;
  github: string;
  devBuyBps: number;
  promise: {
    title: string;
    doneLooksLike: string;
    proofType: ProofId;
    deadlineMs: number;
  };
};

const dateValue = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export default function LaunchPage() {
  const router = useRouter();
  const { wallet, xHandle, refresh } = useWallet();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [website, setWebsite] = useState("");
  const [github, setGithub] = useState("");
  const [devBuy, setDevBuy] = useState("0");
  const [title, setTitle] = useState("");
  const [doneLooksLike, setDoneLooksLike] = useState("");
  const [proofType, setProofType] = useState<ProofId>("link");
  const [deadline, setDeadline] = useState(dateValue(Date.now() + 7 * DAY));
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const minDate = dateValue(Date.now() + 3 * DAY);
  const maxDate = dateValue(Date.now() + 14 * DAY);

  const body: LaunchBody = useMemo(
    () => ({
      name: name.trim(),
      symbol: symbol.trim(),
      description: description.trim(),
      image: image.trim(),
      website: website.trim(),
      github: github.trim(),
      devBuyBps: Math.round(Number(devBuy) * 100),
      promise: {
        title: title.trim(),
        doneLooksLike: doneLooksLike.trim(),
        proofType,
        deadlineMs: new Date(`${deadline}T23:59:00.000Z`).getTime(),
      },
    }),
    [deadline, description, devBuy, doneLooksLike, github, image, name, proofType, symbol, title, website],
  );

  const handleLinkX = async () => {
    setError("");
    try {
      const data = await api<{ url: string }>("/v1/x/connect");
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open X");
    }
  };

  const handleNext = () => {
    setError("");
    if (step === 0 && (!wallet || !xHandle)) {
      setError("Sign in with your wallet and link X first.");
      return;
    }
    if (step === 1 && (!body.name || !body.symbol)) {
      setError("Add a name and a ticker.");
      return;
    }
    if (step === 2 && !body.promise.title) {
      setError("Add what you will ship.");
      return;
    }
    setStep((value) => Math.min(value + 1, 3));
  };

  const handleSubmit = async () => {
    setError("");
    if (!agreed) {
      setError("Tick the box to confirm you understand the vault rules.");
      return;
    }
    setBusy(true);
    try {
      await refresh();
      await api("/v1/launch/build", { method: "POST", body: JSON.stringify(body) });
      setConfirming(true);
      const submitted = await api<{ mint: string; project?: ProjectView }>("/v1/launch/submit", {
        method: "POST",
        body: JSON.stringify(body),
      });
      router.push(`/c/${submitted.mint}`);
    } catch (err) {
      setConfirming(false);
      setError(err instanceof Error ? err.message : "Launch failed");
    } finally {
      setBusy(false);
    }
  };

  if (confirming) {
    return (
      <div className={`${panel} mx-auto max-w-[560px] p-8 text-center`}>
        <div className="flex justify-center">
          <Logo size={48} state="loading" />
        </div>
        <p className="mt-5 text-[22px] font-semibold tracking-[-0.03em]">Confirming on chain</p>
        <p className="mt-2 text-[15px] text-[var(--muted)]">This demo launch stays off pump.fun until the vault program is live.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[560px] pt-4">
      <Misted cover>
        <h1 className={pageTitle}>Launch</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-[var(--muted)]">
          Season 0. Sign in, write one promise, then review the fee split. on pump.fun
        </p>
      </Misted>
      <ol className="mt-6 flex flex-wrap gap-2 text-[13px]" aria-label="Launch steps">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={
              index === step
                ? "rounded-full bg-[var(--ink)] px-3 py-1 font-medium text-white"
                : "rounded-full bg-[#f5f5f7] px-3 py-1 text-[var(--muted)]"
            }
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>
      <form
        className={`${panel} mt-6 space-y-5 p-4 sm:p-6 md:p-8`}
        onSubmit={(event) => {
          event.preventDefault();
          if (step < 3) {
            handleNext();
            return;
          }
          void handleSubmit();
        }}
      >
        {step === 0 ? (
          <>
            <div>
              <p className={labelClass}>Wallet</p>
              {wallet ? <p className="mt-2 break-all font-mono text-[15px]">{wallet}</p> : <div className="mt-2"><ConnectWallet /></div>}
            </div>
            <div>
              <p className={labelClass}>X</p>
              {xHandle ? (
                <p className="mt-2 text-[15px]">@{xHandle}</p>
              ) : (
                <button type="button" onClick={() => void handleLinkX()} className={`${btnPrimary} mt-2 px-4 py-2 text-[14px]`} disabled={!wallet}>
                  Link X
                </button>
              )}
            </div>
          </>
        ) : null}
        {step === 1 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
              <label className={labelClass}>
                Coin name
                <input className={field} value={name} onChange={(event) => setName(event.target.value)} required aria-label="Coin name" />
              </label>
              <label className={labelClass}>
                Ticker
                <input className={field} value={symbol} onChange={(event) => setSymbol(event.target.value)} required aria-label="Ticker" />
              </label>
            </div>
            <label className={labelClass}>
              Description
              <textarea className={field} value={description} onChange={(event) => setDescription(event.target.value)} rows={3} aria-label="Description" />
            </label>
            <label className={labelClass}>
              Image URL
              <input className={field} value={image} onChange={(event) => setImage(event.target.value)} aria-label="Image URL" />
            </label>
            <label className={labelClass}>
              Website
              <input className={field} value={website} onChange={(event) => setWebsite(event.target.value)} aria-label="Website" />
            </label>
            <label className={labelClass}>
              GitHub
              <input className={field} value={github} onChange={(event) => setGithub(event.target.value)} aria-label="GitHub" />
            </label>
            <label className={labelClass}>
              Dev buy, 0 to 3 percent
              <input className={`${field} max-w-[8rem]`} type="number" min={0} max={3} step={0.1} value={devBuy} onChange={(event) => setDevBuy(event.target.value)} aria-label="Dev buy" />
            </label>
          </>
        ) : null}
        {step === 2 ? (
          <>
            <label className={labelClass}>
              Promise title
              <input className={field} value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={80} aria-label="Promise title" />
            </label>
            <label className={labelClass}>
              What done looks like
              <textarea className={field} value={doneLooksLike} onChange={(event) => setDoneLooksLike(event.target.value)} rows={4} maxLength={500} aria-label="What done looks like" />
            </label>
            <label className={labelClass}>
              Proof type
              <select className={field} value={proofType} onChange={(event) => setProofType(event.target.value as ProofId)} aria-label="Proof type">
                {PROOF.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Deadline
              <input className={`${field} max-w-[12rem]`} type="date" min={minDate} max={maxDate} value={deadline} onChange={(event) => setDeadline(event.target.value)} aria-label="Deadline" />
            </label>
          </>
        ) : null}
        {step === 3 ? (
          <>
            <p className="text-[15px] leading-relaxed">
              ${body.symbol || "TICKER"} launches as a demo until the vault program is live. The split still reads as 75 vault, 15 runway, 10 platform.
            </p>
            <ol className="space-y-3 text-[15px] leading-relaxed text-[var(--muted)]">
              <li>Create the coin on pump.fun, creator is your wallet.</li>
              <li>Create the fee sharing config.</li>
              <li>Lock 7,500 / 1,500 / 1,000 and revoke admin.</li>
              <li>{body.devBuyBps ? `Buy ${body.devBuyBps / 100}% of supply.` : "Skip the extra buy."}</li>
              <li>Register the first promise on the vault.</li>
            </ol>
            <label className="flex items-start gap-3 text-[15px] leading-relaxed">
              <input
                type="checkbox"
                className="mt-1"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                aria-label="I understand I cannot change the fee split and cannot withdraw the vault."
              />
              <span>I understand I cannot change the fee split and cannot withdraw the vault.</span>
            </label>
          </>
        ) : null}
        {error ? <p className="text-sm text-[var(--burn)]">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          {step > 0 ? (
            <button type="button" className={btnGhost} onClick={() => setStep((value) => value - 1)}>
              Back
            </button>
          ) : null}
          <button type="submit" disabled={busy || (step === 0 && (!wallet || !xHandle))} className={btnPrimary}>
            {step < 3 ? "Next" : busy ? "Launching" : "Sign and launch"}
          </button>
        </div>
      </form>
    </div>
  );
}

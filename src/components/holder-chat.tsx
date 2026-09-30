"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatWhen } from "@/lib/format";
import { useWallet, shortWallet } from "@/lib/wallet";
import { btnPrimary, field, panel } from "@/components/surface";

type ChatMessage = {
  id: string;
  wallet: string;
  text: string;
  atMs: number;
};

type ChatPayload = {
  messages: ChatMessage[];
  holds: boolean | null;
};

export const HolderChat = ({ mint }: { mint: string }) => {
  const { wallet, busy: connecting, error: walletError, connect } = useWallet();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [holds, setHolds] = useState<boolean | null>(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const query = wallet ? `?wallet=${encodeURIComponent(wallet)}` : "";
        const data = await api<ChatPayload>(`/v1/projects/${mint}/messages${query}`);
        if (!stop) {
          setMessages(data.messages);
          setHolds(wallet ? data.holds : false);
        }
      } catch (err) {
        if (!stop) {
          setError(err instanceof Error ? err.message : "Could not load chat");
        }
      }
    };
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 4000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [mint, wallet]);

  const canSend = Boolean(wallet) && holds === true;

  const handleSend = async () => {
    if (!canSend || !text.trim()) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api(`/v1/projects/${mint}/messages`, {
        method: "POST",
        body: JSON.stringify({ wallet, text: text.trim() }),
      });
      setText("");
      const data = await api<ChatPayload>(
        `/v1/projects/${mint}/messages?wallet=${encodeURIComponent(wallet)}`,
      );
      setMessages(data.messages);
      setHolds(data.holds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
    } finally {
      setBusy(false);
    }
  };

  const handleGate = () => {
    if (!wallet) {
      void connect();
    }
  };

  const gateLabel = !wallet
    ? connecting
      ? "Connecting"
      : "Connect wallet to send"
    : holds === null
      ? "Could not read your balance"
      : "Hold some supply to send";

  return (
    <section className={`${panel} p-5 md:p-6`}>
      <h2 className="text-[22px] font-semibold tracking-[-0.03em]">Holder chat</h2>
      <p className="mt-2 text-[15px] text-[var(--muted)]">
        Anyone can read this thread. Hold some supply to send.
      </p>
      <ul className="mt-5 max-h-80 space-y-3 overflow-y-auto">
        {messages.map((message) => (
          <li key={message.id} className="rounded-2xl bg-[#f5f5f7] px-4 py-3">
            <div className="flex items-center justify-between gap-3 text-[12px] text-[var(--muted)]">
              <span className="font-mono">{shortWallet(message.wallet)}</span>
              <span>{formatWhen(message.atMs)}</span>
            </div>
            <p className="mt-1 text-[15px] leading-relaxed">{message.text}</p>
          </li>
        ))}
      </ul>
      {messages.length === 0 ? <p className="mt-4 text-[15px] text-[var(--muted)]">No messages yet.</p> : null}
      <form
        className="mt-4 flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend();
        }}
      >
        <label className="sr-only" htmlFor="holder-chat">
          Message
        </label>
        <input
          id="holder-chat"
          className={`${field} mt-0 disabled:cursor-not-allowed disabled:opacity-50`}
          value={text}
          maxLength={280}
          disabled={!canSend}
          onChange={(event) => setText(event.target.value)}
          aria-label="Message"
          placeholder="Write to holders"
        />
        {canSend ? (
          <button type="submit" disabled={busy || !text.trim()} className={btnPrimary}>
            {busy ? "Sending" : "Send"}
          </button>
        ) : (
          <button
            type="button"
            disabled={Boolean(wallet) || connecting}
            onClick={handleGate}
            className={btnPrimary}
          >
            {gateLabel}
          </button>
        )}
      </form>
      {walletError ? <p className="mt-3 text-[14px] text-[var(--burn)]">{walletError}</p> : null}
      {error ? <p className="mt-3 text-[14px] text-[var(--burn)]">{error}</p> : null}
    </section>
  );
};

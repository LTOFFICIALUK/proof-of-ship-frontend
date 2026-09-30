"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatWhen } from "@/lib/format";
import { shortWallet, useWallet } from "@/lib/wallet";
import { btnPrimary, field, panel } from "@/components/surface";
import { ConnectWallet } from "@/components/connect-wallet";

type ChatMessage = {
  id: string;
  wallet: string;
  text: string;
  atMs: number;
};

export const HolderChat = ({ mint }: { mint: string }) => {
  const { wallet } = useWallet();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const data = await api<{ messages: ChatMessage[] }>(`/v1/projects/${mint}/messages`);
        if (!stop) {
          setMessages(data.messages);
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
  }, [mint]);

  const handleSend = async () => {
    if (!wallet || !text.trim()) {
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
      const data = await api<{ messages: ChatMessage[] }>(`/v1/projects/${mint}/messages`);
      setMessages(data.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`${panel} p-5 md:p-6`}>
      <h2 className="text-[22px] font-semibold tracking-[-0.03em]">Holder chat</h2>
      <p className="mt-2 text-[15px] text-[var(--muted)]">
        Connect a wallet to talk. The thread stays open for everyone to read.
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
      {wallet ? (
        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row"
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
            className={`${field} mt-0`}
            value={text}
            maxLength={280}
            onChange={(event) => setText(event.target.value)}
            aria-label="Message"
            placeholder="Write to holders"
          />
          <button type="submit" disabled={busy || !text.trim()} className={btnPrimary}>
            {busy ? "Sending" : "Send"}
          </button>
        </form>
      ) : (
        <div className="mt-5">
          <ConnectWallet />
        </div>
      )}
      {error ? <p className="mt-3 text-[14px] text-[var(--burn)]">{error}</p> : null}
    </section>
  );
};

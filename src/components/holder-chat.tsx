"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { formatWhen } from "@/lib/format";
import { useWallet, shortWallet } from "@/lib/wallet";
import { btnPrimary, panel } from "@/components/surface";

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

const allowedHost = (host: string) => {
  const name = host.replace(/^www\./, "");
  return name === "x.com" || name === "twitter.com" || name === "github.com";
};

const MessageText = ({ text, mine }: { text: string; mine: boolean }) => {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <p
      className={
        mine
          ? "rounded-[20px] rounded-br-md bg-[var(--ink)] px-4 py-2.5 text-left text-[15px] leading-relaxed text-white"
          : "rounded-[20px] rounded-bl-md bg-[#f5f5f7] px-4 py-2.5 text-[15px] leading-relaxed"
      }
    >
      {parts.map((part, index) => {
        if (!/^https?:\/\//.test(part)) {
          return <span key={index}>{part}</span>;
        }
        try {
          const url = new URL(part);
          if (allowedHost(url.hostname)) {
            return (
              <a key={index} href={url.toString()} className="underline" target="_blank" rel="noreferrer">
                {url.toString()}
              </a>
            );
          }
        } catch {
          return <span key={index}>{part}</span>;
        }
        return <span key={index}>{part.replace(/^https?:\/\//, "")}</span>;
      })}
    </p>
  );
};

export const HolderChat = ({ mint }: { mint: string }) => {
  const { wallet, busy: connecting, error: walletError, connect } = useWallet();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [holds, setHolds] = useState<boolean | null>(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const data = await api<ChatPayload>(`/v1/projects/${mint}/messages`);
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

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread || !stickRef.current) {
      return;
    }
    thread.scrollTop = thread.scrollHeight;
  }, [messages]);

  const canSend = Boolean(wallet) && holds === true;

  const handleSend = async () => {
    if (!canSend || !text.trim()) {
      return;
    }
    setBusy(true);
    setError("");
    stickRef.current = true;
    try {
      await api(`/v1/projects/${mint}/messages`, {
        method: "POST",
        body: JSON.stringify({ text: text.trim() }),
      });
      setText("");
      const data = await api<ChatPayload>(`/v1/projects/${mint}/messages`);
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

  const handleScroll = () => {
    const thread = threadRef.current;
    if (!thread) {
      return;
    }
    stickRef.current = thread.scrollHeight - thread.scrollTop - thread.clientHeight < 48;
  };

  const gateLabel = !wallet
    ? connecting
      ? "Connecting"
      : "Connect wallet to send"
    : holds === null
      ? "Could not read your balance"
      : "Hold some supply to send";

  return (
    <section className={`${panel} flex h-auto min-h-[24rem] flex-col overflow-hidden lg:h-full lg:min-h-0`}>
      <header className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-4">
        <div>
          <h2 className="text-[18px] font-semibold tracking-[-0.03em]">Holder chat</h2>
          <p className="mt-1 text-[13px] text-[var(--muted)]">Anyone can read. Holders can send.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-3 py-1 text-[12px] font-medium">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--pay)] opacity-60 motion-reduce:animate-none" />
            <span className="relative h-2 w-2 rounded-full bg-[var(--pay)]" />
          </span>
          Live
        </span>
      </header>
      <div
        ref={threadRef}
        onScroll={handleScroll}
        className="flex min-h-40 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 lg:min-h-0"
        aria-live="polite"
        aria-label="Holder messages"
      >
        {messages.length === 0 ? (
          <p className="m-auto text-center text-[15px] text-[var(--muted)]">No messages yet.</p>
        ) : (
          messages.map((message) => {
            const mine = Boolean(wallet) && message.wallet === wallet;
            return (
              <div key={message.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                <div className={mine ? "max-w-[85%] text-right" : "max-w-[85%]"}>
                  <p className="mb-1 px-1 text-[11px] text-[var(--muted)]">
                    {mine ? "You" : shortWallet(message.wallet)}
                    <span className="px-1">·</span>
                    {formatWhen(message.atMs)}
                  </p>
                  <MessageText text={message.text} mine={mine} />
                  {wallet ? (
                    <button
                      type="button"
                      className="mt-1 px-1 text-[11px] text-[var(--muted)] underline"
                      onClick={() => {
                        void api(`/v1/projects/${mint}/messages/${message.id}/report`, {
                          method: "POST",
                          body: "{}",
                        }).catch((err: unknown) => {
                          setError(err instanceof Error ? err.message : "Could not report that message");
                        });
                      }}
                    >
                      Report
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
      <form
        className="border-t border-black/[0.06] p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend();
        }}
      >
        <label className="sr-only" htmlFor="holder-chat">
          Message
        </label>
        <div className="flex items-center gap-2">
          <input
            id="holder-chat"
            className="min-w-0 flex-1 rounded-full bg-[#f5f5f7] px-4 py-3 text-[15px] text-[var(--ink)] outline-none ring-1 ring-transparent placeholder:text-[var(--muted)] focus:bg-white focus:ring-2 focus:ring-[var(--ink)]/20 disabled:cursor-not-allowed disabled:opacity-50"
            value={text}
            maxLength={280}
            disabled={!canSend}
            onChange={(event) => setText(event.target.value)}
            aria-label="Message"
            placeholder="Write to holders"
          />
          {canSend ? (
            <button type="submit" disabled={busy || !text.trim()} className={`${btnPrimary} shrink-0 px-4`}>
              {busy ? "Sending" : "Send"}
            </button>
          ) : null}
        </div>
        {canSend ? null : (
          <button
            type="button"
            disabled={Boolean(wallet) || connecting}
            onClick={handleGate}
            className={`${btnPrimary} mt-3 w-full`}
          >
            {gateLabel}
          </button>
        )}
        {walletError ? <p className="mt-3 text-[14px] text-[var(--burn)]">{walletError}</p> : null}
        {error ? <p className="mt-3 text-[14px] text-[var(--burn)]">{error}</p> : null}
      </form>
    </section>
  );
};

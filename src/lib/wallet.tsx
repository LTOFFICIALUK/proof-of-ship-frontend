"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import { toast } from "@/components/toast";

type SolanaProvider = {
  isPhantom?: boolean;
  isConnected?: boolean;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect?: () => Promise<void>;
  signMessage?: (message: Uint8Array, display?: "utf8" | "hex") => Promise<{ signature: Uint8Array } | Uint8Array>;
  publicKey?: { toString: () => string } | null;
};

type PhantomWindow = Window & {
  solana?: SolanaProvider;
  phantom?: { solana?: SolanaProvider };
};

type WalletContextValue = {
  wallet: string;
  xHandle: string;
  busy: boolean;
  error: string;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
  signBytes: (text: string) => Promise<string>;
};

const PHANTOM_DOWNLOAD = "https://phantom.app/download";

const signInMessage = (wallet: string, nonce: string, issued: string) =>
  `proofofship.fun wants you to sign in with your Solana account:\n${wallet}\n\nNonce: ${nonce}\nIssued: ${issued}`;

const asBytes = (value: unknown): Uint8Array => {
  if (value instanceof Uint8Array) {
    return value;
  }
  if (ArrayBuffer.isView(value)) {
    const view = value as ArrayBufferView;
    return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  }
  if (Array.isArray(value)) {
    return Uint8Array.from(value as number[]);
  }
  if (value && typeof value === "object") {
    const record = value as { signature?: unknown; data?: unknown };
    if (record.signature) {
      return asBytes(record.signature);
    }
    if (Array.isArray(record.data)) {
      return Uint8Array.from(record.data as number[]);
    }
  }
  throw new Error("Wallet returned a signature we could not read.");
};

const toBase64 = (bytes: Uint8Array) => {
  let raw = "";
  for (let i = 0; i < bytes.length; i += 1) {
    raw += String.fromCharCode(bytes[i]!);
  }
  return btoa(raw);
};

const isRejected = (err: unknown) => {
  if (!err || typeof err !== "object") {
    return false;
  }
  const code = "code" in err ? Number((err as { code?: number }).code) : 0;
  const message = "message" in err ? String((err as { message?: unknown }).message) : "";
  return code === 4001 || /user rejected|declined|cancelled|canceled|denied/i.test(message);
};

const walletMessage = (err: unknown, fallback: string) => {
  if (isRejected(err)) {
    return "Wallet request was declined.";
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  if (err && typeof err === "object" && "message" in err && (err as { message?: unknown }).message) {
    return String((err as { message: unknown }).message);
  }
  return fallback;
};

const provider = (): SolanaProvider | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const win = window as PhantomWindow;
  const phantom = win.phantom?.solana;
  if (phantom && phantom.isPhantom !== false) {
    return phantom;
  }
  if (win.solana?.isPhantom) {
    return win.solana;
  }
  return win.solana ?? null;
};

const waitForProvider = (ms = 1200) =>
  new Promise<SolanaProvider | null>((resolve) => {
    const found = provider();
    if (found) {
      resolve(found);
      return;
    }
    const start = Date.now();
    let settled = false;
    const finish = (value: SolanaProvider | null) => {
      if (settled) {
        return;
      }
      settled = true;
      window.removeEventListener("phantom#initialized", onReady);
      window.clearInterval(timer);
      resolve(value);
    };
    const onReady = () => {
      const next = provider();
      if (next) {
        finish(next);
      }
    };
    window.addEventListener("phantom#initialized", onReady);
    const timer = window.setInterval(() => {
      const next = provider();
      if (next) {
        finish(next);
        return;
      }
      if (Date.now() - start >= ms) {
        finish(null);
      }
    }, 80);
  });

const publicKeyOf = (current: SolanaProvider) => current.publicKey?.toString() ?? "";

const signWithProvider = async (current: SolanaProvider, encoded: Uint8Array) => {
  if (!current.signMessage) {
    throw new Error("This wallet cannot sign a message. Open Phantom and try again.");
  }
  try {
    return asBytes(await current.signMessage(encoded, "utf8"));
  } catch (err) {
    if (isRejected(err)) {
      throw err;
    }
    return asBytes(await current.signMessage(encoded));
  }
};

const WalletContext = createContext<WalletContextValue | null>(null);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    const me = await api<{ wallet: string | null; xHandle: string | null }>("/v1/me");
    setWallet(me.wallet ?? "");
    setXHandle(me.xHandle ?? "");
  };

  useEffect(() => {
    void refresh().catch(() => undefined);
  }, []);

  const connect = async () => {
    setError("");
    const current = (await waitForProvider()) ?? provider();
    if (!current) {
      const message = "No wallet found. Install Phantom, then try again.";
      setError(message);
      toast.error(message);
      window.open(PHANTOM_DOWNLOAD, "_blank", "noopener,noreferrer");
      return false;
    }
    setBusy(true);
    try {
      let next = publicKeyOf(current);
      if (!next) {
        const result = await current.connect();
        next = result.publicKey.toString();
      }
      const live = provider() ?? current;
      const nonce = await api<{ nonce: string }>("/v1/auth/nonce");
      const issued = new Date().toISOString();
      const message = signInMessage(next, nonce.nonce, issued);
      const bytes = await signWithProvider(live, new TextEncoder().encode(message));
      if (bytes.length !== 64) {
        throw new Error("Wallet returned a signature we could not read.");
      }
      const session = await api<{ wallet: string; xHandle: string | null }>("/v1/auth/verify", {
        method: "POST",
        body: JSON.stringify({ message, signature: toBase64(bytes) }),
      });
      setWallet(session.wallet);
      setXHandle(session.xHandle ?? "");
      setError("");
      return true;
    } catch (err) {
      const message = walletMessage(err, "Could not connect the wallet.");
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const signBytes = async (text: string) => {
    const current = (await waitForProvider()) ?? provider();
    if (!current) {
      throw new Error("No wallet found. Install Phantom, then try again.");
    }
    let next = publicKeyOf(current);
    if (!next) {
      const result = await current.connect();
      next = result.publicKey.toString();
    }
    const live = provider() ?? current;
    const bytes = await signWithProvider(live, new TextEncoder().encode(text));
    if (bytes.length !== 64) {
      throw new Error("Wallet returned a signature we could not read.");
    }
    return toBase64(bytes);
  };

  const disconnect = async () => {
    setError("");
    await api("/v1/auth/logout", { method: "POST", body: "{}" }).catch(() => undefined);
    const current = provider();
    if (current?.disconnect) {
      await current.disconnect().catch(() => undefined);
    }
    setWallet("");
    setXHandle("");
  };

  return (
    <WalletContext.Provider value={{ wallet, xHandle, busy, error, connect, disconnect, refresh, signBytes }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const value = useContext(WalletContext);
  if (!value) {
    throw new Error("Wallet provider missing");
  }
  return value;
};

export const shortWallet = (wallet: string) =>
  wallet ? `${wallet.slice(0, 4)}…${wallet.slice(-4)}` : "";

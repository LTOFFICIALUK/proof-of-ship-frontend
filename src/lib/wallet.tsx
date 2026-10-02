"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";

type SolanaProvider = {
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect?: () => Promise<void>;
  signMessage?: (message: Uint8Array) => Promise<{ signature: Uint8Array } | Uint8Array>;
  publicKey?: { toString: () => string } | null;
};

type WalletContextValue = {
  wallet: string;
  xHandle: string;
  busy: boolean;
  error: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
};

const signInMessage = (wallet: string, nonce: string, issued: string) =>
  `proofofship.fun wants you to sign in with your Solana account:\n${wallet}\n\nNonce: ${nonce}\nIssued: ${issued}`;

const toBase64 = (bytes: Uint8Array) => {
  let raw = "";
  bytes.forEach((byte) => {
    raw += String.fromCharCode(byte);
  });
  return btoa(raw);
};

const WalletContext = createContext<WalletContextValue | null>(null);

const provider = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const solana = (window as Window & { solana?: SolanaProvider; phantom?: { solana?: SolanaProvider } }).phantom
    ?.solana;
  return solana ?? (window as Window & { solana?: SolanaProvider }).solana ?? null;
};

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
    const current = provider();
    if (!current?.signMessage) {
      setError("No wallet found. Install Phantom, then try again.");
      return;
    }
    setBusy(true);
    try {
      const result = await current.connect();
      const next = result.publicKey.toString();
      const nonce = await api<{ nonce: string }>("/v1/auth/nonce");
      const issued = new Date().toISOString();
      const message = signInMessage(next, nonce.nonce, issued);
      const signed = await current.signMessage(new TextEncoder().encode(message));
      const bytes = signed instanceof Uint8Array ? signed : signed.signature;
      const session = await api<{ wallet: string; xHandle: string | null }>("/v1/auth/verify", {
        method: "POST",
        body: JSON.stringify({ message, signature: toBase64(bytes) }),
      });
      setWallet(session.wallet);
      setXHandle(session.xHandle ?? "");
    } catch {
      setError("Wallet connection was cancelled.");
    } finally {
      setBusy(false);
    }
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
    <WalletContext.Provider value={{ wallet, xHandle, busy, error, connect, disconnect, refresh }}>
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

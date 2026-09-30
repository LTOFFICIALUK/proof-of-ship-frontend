"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type SolanaProvider = {
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect?: () => Promise<void>;
  publicKey?: { toString: () => string } | null;
};

type WalletContextValue = {
  wallet: string;
  busy: boolean;
  error: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
};

const STORAGE_KEY = "pos.wallet";

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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.sessionStorage.getItem(STORAGE_KEY) ?? "";
    if (saved) {
      setWallet(saved);
    }
    const current = provider();
    if (!current) {
      return;
    }
    void current
      .connect({ onlyIfTrusted: true })
      .then((result) => {
        const next = result.publicKey.toString();
        setWallet(next);
        window.sessionStorage.setItem(STORAGE_KEY, next);
      })
      .catch(() => undefined);
  }, []);

  const connect = async () => {
    setError("");
    const current = provider();
    if (!current) {
      setError("No wallet found. Install Phantom, then try again.");
      return;
    }
    setBusy(true);
    try {
      const result = await current.connect();
      const next = result.publicKey.toString();
      setWallet(next);
      window.sessionStorage.setItem(STORAGE_KEY, next);
    } catch {
      setError("Wallet connection was cancelled.");
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setError("");
    const current = provider();
    if (current?.disconnect) {
      await current.disconnect().catch(() => undefined);
    }
    setWallet("");
    window.sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <WalletContext.Provider value={{ wallet, busy, error, connect, disconnect }}>
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

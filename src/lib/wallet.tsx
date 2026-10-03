"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
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
  signTransaction?: (transaction: PhantomTransaction) => Promise<PhantomTransaction>;
  signAllTransactions?: (transactions: PhantomTransaction[]) => Promise<PhantomTransaction[]>;
  request?: (args: { method: string; params?: Record<string, unknown> }) => Promise<unknown>;
  publicKey?: { toString: () => string } | null;
};

type PhantomTransaction = { serialize: () => Uint8Array };

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
  ensureSession: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
  signBytes: (text: string) => Promise<string>;
  signTransactions: (encoded: string[]) => Promise<string[]>;
};

const PHANTOM_DOWNLOAD = "https://phantom.app/download";

const loginMessage = (wallet: string, nonce: string, issued: string) =>
  `Proof of Ship\n${wallet}\n\nNonce: ${nonce}\nIssued: ${issued}`;

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

const errText = (err: unknown) => {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  if (err && typeof err === "object" && "message" in err && (err as { message?: unknown }).message) {
    return String((err as { message: unknown }).message);
  }
  return "";
};

const errCode = (err: unknown) => {
  if (err && typeof err === "object" && "code" in err) {
    return Number((err as { code?: number }).code);
  }
  return 0;
};

const isRejected = (err: unknown) => {
  const message = errText(err);
  const code = errCode(err);
  return code === 4001 || /user rejected|declined|cancelled|canceled|denied/i.test(message);
};

const isInvalidFormat = (err: unknown) => {
  const message = errText(err);
  const code = errCode(err);
  return code === -32000 || /invalid formatting|invalid input|cannot be shown/i.test(message);
};

const walletMessage = (err: unknown, fallback: string) => {
  if (isRejected(err)) {
    return "Wallet request was declined.";
  }
  if (isInvalidFormat(err)) {
    return "Phantom could not read the sign in message. Refresh and try again.";
  }
  return errText(err) || fallback;
};

const provider = (): SolanaProvider | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const win = window as PhantomWindow;
  if (win.phantom?.solana) {
    return win.phantom.solana;
  }
  if (win.solana?.isPhantom) {
    return win.solana;
  }
  return null;
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
  if (current.signMessage) {
    try {
      return asBytes(await current.signMessage(encoded, "utf8"));
    } catch (err) {
      if (isRejected(err)) {
        throw err;
      }
      return asBytes(await current.signMessage(encoded));
    }
  }
  if (current.request) {
    return asBytes(
      await current.request({
        method: "signMessage",
        params: { message: encoded, display: "utf8" },
      }),
    );
  }
  throw new Error("This wallet cannot sign a message. Open Phantom and try again.");
};

const WalletContext = createContext<WalletContextValue | null>(null);

const SIGNED_OUT = "pos.signedOut";

const mustSignAgain = () => {
  try {
    return sessionStorage.getItem(SIGNED_OUT) === "1";
  } catch {
    return false;
  }
};

const rememberSignOut = () => {
  try {
    sessionStorage.setItem(SIGNED_OUT, "1");
  } catch {
    // Private browsing can block storage. The in memory flag still applies.
  }
};

const clearSignOut = () => {
  try {
    sessionStorage.removeItem(SIGNED_OUT);
  } catch {
    // Ignore storage failures.
  }
};

const missingWallet = () => {
  const message = "No wallet found. Install Phantom, then try again.";
  toast.error(message);
  window.open(PHANTOM_DOWNLOAD, "_blank", "noopener,noreferrer");
  return message;
};

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [authed, setAuthed] = useState(false);
  const phantomAddress = useRef("");
  const signedOut = useRef(false);
  const authedRef = useRef(false);
  const sessionTask = useRef<Promise<boolean> | null>(null);

  const remember = (address: string) => {
    phantomAddress.current = address;
    setWallet(address);
  };

  const markAuthed = (value: boolean) => {
    authedRef.current = value;
    setAuthed(value);
  };

  const signIn = async (address: string) => {
    const current = provider();
    if (!current) {
      return false;
    }
    const nonce = await api<{ nonce: string }>("/v1/auth/nonce");
    const issued = new Date().toISOString();
    const message = loginMessage(address, nonce.nonce, issued);
    const bytes = await signWithProvider(current, new TextEncoder().encode(message));
    if (bytes.length !== 64) {
      throw new Error("Wallet returned a signature we could not read.");
    }
    const signedIn = await api<{ wallet: string; xHandle: string | null }>("/v1/auth/verify", {
      method: "POST",
      body: JSON.stringify({ message, signature: toBase64(bytes) }),
    });
    remember(signedIn.wallet);
    setXHandle(signedIn.xHandle ?? "");
    markAuthed(true);
    return true;
  };

  const beginSession = (address: string) => {
    if (authedRef.current && phantomAddress.current === address) {
      return Promise.resolve(true);
    }
    if (!sessionTask.current) {
      sessionTask.current = signIn(address)
        .catch(() => false)
        .finally(() => {
          sessionTask.current = null;
        });
    }
    return sessionTask.current;
  };

  const refresh = async () => {
    const me = await api<{ wallet: string | null; xHandle: string | null }>("/v1/me");
    if (signedOut.current) {
      markAuthed(false);
      setWallet("");
      setXHandle("");
      return;
    }
    if (me.wallet) {
      remember(me.wallet);
      markAuthed(true);
    } else {
      markAuthed(false);
      setWallet(phantomAddress.current);
    }
    setXHandle(me.xHandle ?? "");
  };

  useEffect(() => {
    signedOut.current = mustSignAgain();
    void refresh().catch(() => undefined);
  }, []);

  const connect = async () => {
    const ready = provider();
    const pending = ready ? ready.connect({ onlyIfTrusted: false }) : null;
    if (!pending) {
      const found = await waitForProvider(250);
      if (!found) {
        setError(missingWallet());
        return false;
      }
      return settle(found.connect({ onlyIfTrusted: false }));
    }
    return settle(pending);
  };

  const settle = async (pending: ReturnType<SolanaProvider["connect"]>) => {
    setError("");
    setBusy(true);
    try {
      const result = await pending;
      signedOut.current = false;
      clearSignOut();
      const address = result.publicKey.toString();
      remember(address);
      void beginSession(address);
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

  const ensureSession = async () => {
    const current = provider();
    const address = phantomAddress.current || (current ? publicKeyOf(current) : "");
    if (authedRef.current && address) {
      return true;
    }
    if (sessionTask.current) {
      const ready = await sessionTask.current;
      if (ready) {
        return true;
      }
    }
    const next = address || (current ? publicKeyOf(current) : "");
    if (!current || !next) {
      setError(missingWallet());
      return false;
    }
    const ready = await beginSession(next);
    if (!ready) {
      const message = "Could not save the wallet session.";
      setError(message);
      toast.error(message);
    }
    return ready;
  };

  const signBytes = async (text: string) => {
    const current = provider() ?? (await waitForProvider(250));
    if (!current) {
      throw new Error("No wallet found. Install Phantom, then try again.");
    }
    const known = publicKeyOf(current);
    const session = current.connect();
    if (!known) {
      await session;
    } else {
      void session.catch(() => undefined);
    }
    const live = provider() ?? current;
    const bytes = await signWithProvider(live, new TextEncoder().encode(text));
    if (bytes.length !== 64) {
      throw new Error("Wallet returned a signature we could not read.");
    }
    return toBase64(bytes);
  };

  const signTransactions = async (encoded: string[]) => {
    const current = provider() ?? (await waitForProvider(250));
    if (!current) {
      throw new Error("No wallet found. Install Phantom, then try again.");
    }
    if (!current.signTransaction && !current.signAllTransactions) {
      throw new Error("This wallet cannot sign a transaction. Open Phantom and try again.");
    }
    const { Transaction, VersionedTransaction } = await import("@solana/web3.js");
    const fromBase64 = (value: string) => {
      const raw = atob(value);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i += 1) {
        bytes[i] = raw.charCodeAt(i);
      }
      return bytes;
    };
    const toBase64Bytes = (bytes: Uint8Array) => {
      let raw = "";
      for (let i = 0; i < bytes.length; i += 1) {
        raw += String.fromCharCode(bytes[i]!);
      }
      return btoa(raw);
    };
    const transactions = encoded.map((item) => VersionedTransaction.deserialize(fromBase64(item)));
    if (!current.signTransaction) {
      throw new Error("This wallet cannot sign a transaction. Open Phantom and try again.");
    }
    const signed: string[] = [];
    for (const transaction of transactions) {
      const next = await current.signTransaction(transaction);
      signed.push(toBase64Bytes(next.serialize()));
    }
    return signed;
  };

  const disconnect = async () => {
    signedOut.current = true;
    rememberSignOut();
    sessionTask.current = null;
    phantomAddress.current = "";
    setError("");
    markAuthed(false);
    setWallet("");
    setXHandle("");
    const current = provider();
    const dropped = current?.disconnect?.() ?? Promise.resolve();
    await Promise.all([
      dropped.catch(() => undefined),
      api("/v1/auth/logout", { method: "POST", body: "{}" }).catch(() => undefined),
    ]);
  };

  return (
    <WalletContext.Provider value={{ wallet, xHandle, busy, error, connect, ensureSession, disconnect, refresh, signBytes, signTransactions }}>
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

export type PromiseStatus =
  | "pending"
  | "vote_open"
  | "paid"
  | "burned"
  | "rolled"
  | "missed"
  | "no_quorum";

export type VoteSide = "pay" | "burn";

export type PromiseView = {
  idx: number;
  text: string;
  doneLooksLike: string;
  proofType: string;
  postedAtMs: number;
  deadlineMs: number;
  status: PromiseStatus;
  quorumFails: number;
  resultNet: number | null;
  proofUrl: string;
  proofNote: string;
  proofAtMs: number | null;
  closedAtMs: number | null;
  upPct: number | null;
  downPct: number | null;
  netPct: number | null;
  turnoutPct: number | null;
  voters: number;
  yourSide: VoteSide | null;
};

export type ProjectView = {
  mint: string;
  slug: string;
  name: string;
  symbol: string;
  builderWallet: string;
  xHandle: string;
  verified: boolean;
  demo: boolean;
  status: string;
  nowMs: number;
  rolloverStreak: number;
  profile: {
    description: string;
    website: string;
    github: string;
    image: string;
    devBuyBps: number;
  };
  chain: {
    vault: string;
    feeConfig: string;
    revokeSig: string;
  };
  vault: {
    accountedSol: number;
    releasedSol: number;
    burnedSol: number;
    burnBucketSol: number;
    balanceSol: number;
    runwaySol: number;
    accounted: string;
    released: string;
    burned: string;
    balance: string;
  };
  nextDueAtMs: number | null;
  market?: {
    image: string | null;
    website: string | null;
    x: string | null;
    marketCapUsd: number | null;
    athUsd: number | null;
    volumeUsd: number | null;
    holders: number | null;
  };
  promises: PromiseView[];
  vote: {
    promiseIdx: number;
    startMs: number;
    endMs: number;
    extended: boolean;
    quorum: string;
  } | null;
  viewer: {
    wallet: string;
    isBuilder: boolean;
    excluded: boolean;
    balance: string | null;
    weight: string;
    weightPct: number;
  } | null;
};

export type CoinCard = {
  mint: string;
  slug: string;
  name: string;
  symbol: string;
  status: string;
  xHandle: string;
  verified: boolean;
  image: string;
  builderWallet: string;
  promise: string;
  current: {
    idx: number;
    text: string;
    status: PromiseStatus;
    deadlineMs: number;
    voteEndMs: number | null;
  } | null;
  record: PromiseStatus[];
  balanceSol: number;
  releasedSol: number;
  burnedSol: number;
  launchedAtMs: number;
  closedAtMs: number;
};

export type CoinList = {
  filter: string;
  page: number;
  total: number;
  hasMore: boolean;
  coins: CoinCard[];
};

export type FeedEvent = {
  id: string;
  mint: string;
  name: string;
  symbol: string;
  xHandle: string;
  kind: string;
  promise: string;
  amountSol: number | null;
  detail: Record<string, string | number | boolean>;
  atMs: number;
  sig: string | null;
  slot: number | null;
};

export type BuilderRecord = {
  shipped: number;
  missed: number;
  burned: number;
  rolled: number;
  resolved: number;
  onTimePct: number | null;
  earnedSol: number;
  burnedSol: number;
  launches: number;
  abandoned: number;
};

export type BuilderView = {
  handle: string;
  wallet: string;
  verified: boolean;
  stats: BuilderRecord;
  projects: CoinCard[];
  timeline: {
    mint: string;
    name: string;
    symbol: string;
    idx: number;
    text: string;
    status: PromiseStatus;
    deadlineMs: number;
    postedAtMs: number;
    closedAtMs: number | null;
    proofUrl: string;
  }[];
};

export type TopBuilder = BuilderRecord & { handle: string; verified: boolean };

export type SiteStats = {
  launched: number;
  lockedSol: number;
  paidSol: number;
  burnedSol: number;
  shipped: number;
  missed: number;
};

const apiError = async (response: Response) => {
  try {
    const body = (await response.json()) as {
      error?: { message?: string };
      message?: string;
    };
    return body.error?.message || body.message || "Request failed";
  } catch {
    return "Request failed";
  }
};

export const api = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const url = path.startsWith("/v1") ? `/api${path}` : path;
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(await apiError(response));
  }
  return response.json() as Promise<T>;
};

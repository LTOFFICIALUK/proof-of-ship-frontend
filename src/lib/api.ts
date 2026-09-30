export type PromiseView = {
  idx: number;
  text: string;
  deadlineMs: number;
  status: string;
  quorumFails: number;
};

export type ProjectView = {
  mint: string;
  name: string;
  symbol: string;
  builderWallet: string;
  xHandle: string;
  status: string;
  nowMs: number;
  vault: {
    accountedSol: number;
    releasedSol: number;
    burnedSol: number;
    balanceSol: number;
    runwaySol: number;
    accounted: string;
    released: string;
    burned: string;
    balance: string;
  };
  nextDueAtMs: number | null;
  promises: PromiseView[];
  vote: {
    promiseIdx: number;
    endMs: number;
    payWeight: string;
    burnWeight: string;
    locked: string;
    quorum: string;
    turnoutBps: number;
  } | null;
};

export type FeedEvent = {
  id: string;
  mint: string;
  kind: string;
  detail: Record<string, string | number | boolean>;
  atMs: number;
};

export type BuilderView = {
  handle: string;
  wallet: string;
  stats: {
    paid: number;
    burned: number;
    abandoned: number;
    launches: number;
    earnedSol: number;
  };
  projects: {
    mint: string;
    name: string;
    symbol: string;
    status: string;
  }[];
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

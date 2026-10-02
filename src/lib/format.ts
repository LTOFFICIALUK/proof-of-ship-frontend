export const formatNet = (value: number | null | undefined) => {
  if (value == null || !Number.isFinite(value)) {
    return "Pending";
  }
  const abs = Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (value > 0) {
    return `+${abs}%`;
  }
  if (value < 0) {
    return `−${abs}%`;
  }
  return "0%";
};

export const formatUsd = (value: number | null | undefined) => {
  if (value == null || !Number.isFinite(value)) {
    return "Pending";
  }
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}K`;
  }
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

export const formatCount = (value: number | null | undefined) => {
  if (value == null || !Number.isFinite(value)) {
    return "Pending";
  }
  return Math.round(value).toLocaleString();
};

export const formatSol = (value: number) => {
  if (!Number.isFinite(value)) {
    return "0";
  }
  if (value === 0) {
    return "0";
  }
  if (value < 0.001) {
    return value.toExponential(2);
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
};

export const formatStamp = (ms: number, now = Date.now()) => {
  const date = new Date(ms);
  const title = date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const delta = now - ms;
  const abs = Math.abs(delta);
  if (delta < 0 || abs >= 7 * 24 * 60 * 60 * 1000) {
    return { label: title, title };
  }
  if (abs < 60_000) {
    return { label: "Just now", title };
  }
  const minutes = Math.round(abs / 60_000);
  if (minutes < 60) {
    return { label: `${minutes} min ago`, title };
  }
  const hours = Math.round(abs / 3_600_000);
  if (hours < 48) {
    return { label: `${hours} hours ago`, title };
  }
  return { label: `${Math.round(hours / 24)} days ago`, title };
};

export const formatWhen = (ms: number, now = Date.now()) => formatStamp(ms, now).label;

export const formatDue = (ms: number, now = Date.now()) => {
  const delta = ms - now;
  if (delta <= 0) {
    return formatStamp(ms, now).label;
  }
  const hours = Math.floor(delta / 3_600_000);
  const minutes = Math.floor((delta % 3_600_000) / 60_000);
  if (hours < 48) {
    return `${hours}h ${minutes}m left`;
  }
  return `${Math.floor(hours / 24)} days left`;
};

export const formatPct = (value: number | null | undefined) => {
  if (value == null || !Number.isFinite(value)) {
    return "Pending";
  }
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
};

const TOKEN_DECIMALS = 1_000_000;

export const formatTokens = (raw: string | null | undefined) => {
  if (!raw || !/^[0-9]+$/.test(raw)) {
    return "Pending";
  }
  const value = Number(BigInt(raw) / BigInt(TOKEN_DECIMALS));
  return value.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 2 });
};

export const formatIn = (ms: number, now = Date.now()) => {
  const delta = ms - now;
  if (delta <= 0) {
    return formatStamp(ms, now).label;
  }
  const hours = Math.floor(delta / 3_600_000);
  const minutes = Math.floor((delta % 3_600_000) / 60_000);
  if (hours < 48) {
    return `in ${hours}h ${minutes}m`;
  }
  return `in ${Math.floor(hours / 24)} days`;
};

export const promiseLabel = (status: string) => {
  if (status === "vote_open") {
    return "Voting";
  }
  if (status === "no_quorum") {
    return "No quorum";
  }
  if (status === "paid") {
    return "Shipped";
  }
  if (status === "burned") {
    return "Burned";
  }
  if (status === "pending") {
    return "Open";
  }
  if (status === "rolled") {
    return "Rolled over";
  }
  if (status === "missed") {
    return "Missed";
  }
  return status;
};

export const feedLabel = (kind: string) => {
  if (kind === "launch") {
    return "Launched";
  }
  if (kind === "vote_pay") {
    return "Holders voted pay";
  }
  if (kind === "vote_burn") {
    return "Holders voted not to pay";
  }
  if (kind === "vote_roll") {
    return "Vote rolled over";
  }
  if (kind === "miss") {
    return "Missed. Slice burned";
  }
  if (kind === "inflow") {
    return "Fees landed";
  }
  if (kind === "lapse") {
    return "Lapsed. Fees buy $POS";
  }
  if (kind === "abandon") {
    return "Abandoned";
  }
  if (kind === "promise") {
    return "New promise";
  }
  if (kind === "vote_open") {
    return "Vote opened";
  }
  if (kind === "no_quorum") {
    return "No quorum";
  }
  if (kind === "burn") {
    return "Buyback burn";
  }
  if (kind === "pos") {
    return "Bought $POS";
  }
  return kind;
};

const solText = (amount: number | null) =>
  amount === null ? "" : `${formatSol(amount)} SOL`;

export const describeEvent = (event: {
  kind: string;
  amountSol: number | null;
  promise: string;
}) => {
  const sol = solText(event.amountSol);
  const promise = event.promise ? ` "${event.promise}"` : "";
  if (event.kind === "launch") {
    return "Launched with its first promise.";
  }
  if (event.kind === "promise") {
    return `Posted a new promise${promise}.`;
  }
  if (event.kind === "vote_open") {
    return `Marked${promise} as shipped. Holders are voting.`;
  }
  if (event.kind === "vote_pay") {
    return sol
      ? `Holders voted pay. ${sol} is paid to the builder. 20 percent of the remaining dev bag unlocks.`
      : "Holders voted pay. The vault slice is paid to the builder in SOL.";
  }
  if (event.kind === "pos") {
    return sol ? `${sol} bought $POS.` : "Bought $POS.";
  }
  if (event.kind === "vote_burn") {
    return sol ? `Holders voted not to pay. ${sol} set to buy $POS.` : "Holders voted not to pay.";
  }
  if (event.kind === "vote_roll") {
    return event.amountSol ? `Rolled over twice. ${sol} set to burn.` : "The vote rolled over to the next promise.";
  }
  if (event.kind === "miss") {
    return sol ? `Missed the deadline. ${sol} set to burn.` : "Missed the deadline.";
  }
  if (event.kind === "burn") {
    return sol ? `${sol} bought the coin and burned it.` : "Bought the coin and burned it.";
  }
  if (event.kind === "lapse") {
    return sol
      ? `No new promise in 7 days. ${sol} set to buy $POS.`
      : "No new promise in 7 days. Vault fees buy $POS.";
  }
  if (event.kind === "abandon") {
    return "The builder abandoned the coin. The vault burns.";
  }
  if (event.kind === "no_quorum") {
    return "Turnout was under 2 percent. The vote got 24 more hours.";
  }
  return feedLabel(event.kind);
};

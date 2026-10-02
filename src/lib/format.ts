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

export const promiseLabel = (status: string) => {
  if (status === "vote_open") {
    return "Vote open";
  }
  if (status === "no_quorum") {
    return "No quorum";
  }
  if (status === "paid") {
    return "Paid";
  }
  if (status === "burned") {
    return "Burned";
  }
  if (status === "pending") {
    return "Pending";
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
    return "Holders voted burn";
  }
  if (kind === "inflow") {
    return "Fees landed";
  }
  if (kind === "lapse") {
    return "Lapsed. Fees burn";
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
  return kind;
};

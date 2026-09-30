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

export const formatWhen = (ms: number) =>
  new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

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

type LogoState = "idle" | "loading" | "shipped" | "burned";

export const Logo = ({
  size = 32,
  state = "idle",
  title = "Proof of Ship",
}: {
  size?: number;
  state?: LogoState;
  title?: string;
}) => {
  const proven = state === "shipped" ? "#3DBE74" : state === "burned" ? "#FF6B57" : "#FFFFFF";
  const pending = state === "shipped" ? "#FFFFFF" : "#4A4A4D";
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={title} className="shrink-0">
      <title>{title}</title>
      <rect width="100" height="100" rx="22" fill="#111112" />
      <rect x="22" y="56" width="22" height="22" fill={pending} />
      <rect x="56" y="56" width="22" height="22" fill={proven} />
    </svg>
  );
};

export type LogoState = "idle" | "loading" | "shipped" | "burned";

type LogoProps = {
  size?: number;
  state?: LogoState;
  inverse?: boolean;
  title?: string;
};

const LOGO_STYLE = (proven: string) => `
  .pos-logo rect { transition: fill 240ms cubic-bezier(.2,.7,.2,1), opacity 400ms ease; }
  .pos-logo--shipped .pos-logo__proven { transition-delay: 220ms; }
  .pos-logo--burned .pos-logo__proven { opacity: .55; transition-delay: 300ms; }
  .pos-logo--loading .pos-logo__pending { animation: pos-blink 1.1s steps(1,end) infinite; }
  @keyframes pos-blink { 50% { fill: ${proven}; } }
  @media (prefers-reduced-motion: reduce) { .pos-logo rect { transition: none; animation: none !important; } }
`;

export const Logo = ({ size = 32, state = "idle", inverse = false, title = "Proof of Ship" }: LogoProps) => {
  const tile = inverse ? "#FFFFFF" : "#111112";
  const proven = inverse ? "#111112" : "#FFFFFF";
  const pending = inverse ? "#C9C9C5" : "#4A4A4D";
  const provenFill = state === "shipped" ? "#3DBE74" : state === "burned" ? "#FF6B57" : proven;
  const pendingFill = state === "shipped" ? proven : pending;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={`pos-logo pos-logo--${state} shrink-0`}
    >
      <title>{title}</title>
      <rect width="100" height="100" rx="22" fill={tile} />
      <rect className="pos-logo__pending" x="22" y="56" width="22" height="22" style={{ fill: pendingFill }} />
      <rect className="pos-logo__proven" x="56" y="56" width="22" height="22" style={{ fill: provenFill }} />
      <style>{LOGO_STYLE(proven)}</style>
    </svg>
  );
};

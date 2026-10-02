export const VerifiedTick = ({ verified }: { verified: boolean }) => {
  if (!verified) {
    return null;
  }
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      role="img"
      aria-label="X account verified"
      className="inline-block shrink-0 text-[var(--link)]"
    >
      <title>X account verified</title>
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <path d="M4.8 8.2 7 10.4l4.2-4.6" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

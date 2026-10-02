import type { ReactNode } from "react";

export const TextMist = ({ className = "" }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={`pointer-events-none absolute -z-10 bg-[#f3f3f1]/88 backdrop-blur-2xl [mask-image:radial-gradient(ellipse_at_center,black_64%,transparent_90%)] ${className}`}
  />
);

export const Misted = ({
  children,
  className = "",
  cover = false,
}: {
  children: ReactNode;
  className?: string;
  cover?: boolean;
}) => (
  <div className={`relative ${className}`}>
    {cover ? (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-3 -inset-y-4 -z-10 rounded-[28px] bg-[#f3f3f1]/90 backdrop-blur-2xl sm:-inset-x-8 sm:-inset-y-6"
      />
    ) : (
      <TextMist className="-inset-x-3 -inset-y-3 sm:-inset-x-7 sm:-inset-y-5" />
    )}
    {children}
  </div>
);

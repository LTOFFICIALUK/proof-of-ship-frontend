import type { ReactNode } from "react";

const heroMist =
  "pointer-events-none absolute -z-10 bg-[#f5f5f7]/45 backdrop-blur-2xl [mask-image:radial-gradient(ellipse_at_center,black_42%,transparent_78%)]";

export const TextMist = ({ className = "" }: { className?: string }) => (
  <div aria-hidden="true" className={`${heroMist} ${className}`} />
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
    <TextMist
      className={
        cover
          ? "-inset-x-2 -inset-y-6 sm:-inset-x-10 sm:-inset-y-8 [mask-image:radial-gradient(ellipse_80%_80%_at_center,black_46%,transparent_80%)]"
          : "-inset-x-2 -inset-y-5 sm:-inset-x-10 sm:-inset-y-7"
      }
    />
    {children}
  </div>
);

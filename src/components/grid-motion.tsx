"use client";

import { useEffect, useRef } from "react";

const ROWS = 4;
const COLS = 8;

const words = [
  "Ship",
  "Pay",
  "Burn",
  "Vault",
  "Vote",
  "Lock",
  "Promise",
  "Holders",
  "Fees",
  "SOL",
  "Crowd",
  "Builder",
];

const washes = [
  "bg-white",
  "bg-[#f7f7f8]",
  "bg-[#eef8f1]",
  "bg-white",
  "bg-[#fdf1f0]",
  "bg-[#f3f3f5]",
  "bg-white",
  "bg-[#f7f7f8]",
];

export const GridMotion = () => {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mouseX = useRef(0.5);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      return;
    }

    const offsets = Array.from({ length: ROWS }, () => 0);

    const handleMouseMove = (event: MouseEvent) => {
      mouseX.current = event.clientX / Math.max(window.innerWidth, 1);
    };

    let frame = 0;
    const tick = (time: number) => {
      rowRefs.current.forEach((row, index) => {
        if (!row) {
          return;
        }
        const direction = index % 2 === 0 ? 1 : -1;
        const drift = Math.sin(time / 6500 + index * 0.6) * 22;
        const target = ((mouseX.current - 0.5) * 260 + drift) * direction;
        const ease = 0.035 + (index % 4) * 0.018;
        offsets[index] += (target - offsets[index]) * ease;
        row.style.transform = `translate3d(${offsets[index]}px, 0, 0)`;
      });
      frame = window.requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", handleMouseMove);
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 [perspective:900px]">
        <div
          className="absolute left-1/2 top-[40%] w-[1680px]"
          style={{ transform: "translate(-50%, -46%) rotateX(16deg) rotateZ(-8deg)" }}
        >
          {Array.from({ length: ROWS }, (_, rowIndex) => (
            <div
              key={rowIndex}
              ref={(element) => {
                rowRefs.current[rowIndex] = element;
              }}
              className="mb-4 flex justify-center gap-4 will-change-transform"
            >
              {Array.from({ length: COLS }, (_, colIndex) => {
                const word = words[(rowIndex * COLS + colIndex) % words.length];
                const wash = washes[(rowIndex + colIndex) % washes.length];
                return (
                  <div
                    key={colIndex}
                    className={`flex h-[118px] w-[210px] shrink-0 items-end rounded-[18px] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05] ${wash}`}
                  >
                    <span className="text-[15px] font-medium tracking-[-0.01em] text-black/35">
                      {word}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_32%,rgba(245,245,247,0.78)_0%,rgba(245,245,247,0.42)_36%,rgba(245,245,247,0.05)_68%)]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#f5f5f7]" />
    </div>
  );
};

"use client";

import { useEffect, useRef } from "react";

const ROWS = 4;
const COLS = 7;

export const GridMotion = () => {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mouseX = useRef(0.5);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      mouseX.current = event.clientX / window.innerWidth;
    };

    let frame = 0;
    const tick = (time: number) => {
      rowRefs.current.forEach((row, index) => {
        if (!row) {
          return;
        }
        const direction = index % 2 === 0 ? 1 : -1;
        const drift = Math.sin(time / 9000 + index * 0.7) * 10;
        const follow = (mouseX.current - 0.5) * 36 * direction;
        row.style.transform = `translate3d(${drift + follow}px, 0, 0)`;
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
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-[-8%] opacity-80 [perspective:1400px]">
        <div className="absolute inset-x-0 top-[6%] origin-center [transform:rotateX(62deg)_scale(1.08)]">
          {Array.from({ length: ROWS }, (_, rowIndex) => (
            <div
              key={rowIndex}
              ref={(element) => {
                rowRefs.current[rowIndex] = element;
              }}
              className="mb-3 flex justify-center gap-3 will-change-transform"
            >
              {Array.from({ length: COLS }, (_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-24 w-40 shrink-0 rounded-2xl border border-white/[0.07] bg-white/[0.018] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--bg)_62%)]" />
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(200,240,74,0.07),transparent_68%)]" />
    </div>
  );
};

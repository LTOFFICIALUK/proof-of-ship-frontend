"use client";

import { useRef, type KeyboardEvent } from "react";
import { focusRing } from "@/components/surface";
import { Misted } from "@/components/text-mist";

type Tab<T extends string> = { id: T; label: string };

export const FilterTabs = <T extends string>({
  tabs,
  value,
  label,
  panelId,
  onChange,
}: {
  tabs: Tab<T>[];
  value: T;
  label: string;
  panelId: string;
  onChange: (next: T) => void;
}) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + step + tabs.length) % tabs.length;
    onChange(tabs[nextIndex].id);
    refs.current[nextIndex]?.focus();
  };

  return (
    <Misted cover>
    <div
      role="tablist"
      aria-label={label}
      className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
    >
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={(node) => {
            refs.current[index] = node;
          }}
          type="button"
          role="tab"
          id={`${panelId}-tab-${tab.id}`}
          aria-selected={tab.id === value}
          aria-controls={panelId}
          tabIndex={tab.id === value ? 0 : -1}
          onClick={() => onChange(tab.id)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-medium transition ${focusRing} ${
            tab.id === value
              ? "bg-[var(--ink)] text-white"
              : "text-[var(--muted)] hover:bg-black/[0.05] hover:text-[var(--ink)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
    </Misted>
  );
};

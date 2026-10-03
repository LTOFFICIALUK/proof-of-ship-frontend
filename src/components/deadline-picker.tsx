"use client";

import { useEffect, useRef, useState } from "react";
import { focusRing, num } from "@/components/surface";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;
const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const pad = (value: number) => String(value).padStart(2, "0");

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const dayWindow = (day: Date, minMs: number, maxMs: number) => {
  const start = startOfDay(day);
  const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 0, 0).getTime();
  const from = Math.max(start, minMs);
  const to = Math.min(end, maxMs);
  if (from > to) {
    return null;
  }
  return { from, to };
};

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const monthLabel = (year: number, month: number) =>
  new Date(year, month, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });

const fieldLabel = (ms: number) =>
  new Date(ms).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

type DeadlinePickerProps = {
  valueMs: number;
  minMs: number;
  maxMs: number;
  onChange: (ms: number) => void;
};

export const DeadlinePicker = ({ valueMs, minMs, maxMs, onChange }: DeadlinePickerProps) => {
  const selected = new Date(valueMs);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ year: selected.getFullYear(), month: selected.getMonth() });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const minDate = new Date(minMs);
  const maxDate = new Date(maxMs);
  const viewStart = new Date(view.year, view.month, 1).getTime();
  const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1).getTime();
  const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1).getTime();

  const shiftMonth = (delta: number) => {
    const next = new Date(view.year, view.month + delta, 1).getTime();
    if (next < minMonth || next > maxMonth) {
      return;
    }
    const date = new Date(next);
    setView({ year: date.getFullYear(), month: date.getMonth() });
  };

  const chooseDay = (day: Date) => {
    const range = dayWindow(day, minMs, maxMs);
    if (!range) {
      return;
    }
    const candidate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), selected.getHours(), selected.getMinutes(), 0, 0);
    let ms = candidate.getTime();
    if (ms < range.from) {
      ms = range.from;
    }
    if (ms > range.to) {
      ms = range.to;
    }
    onChange(ms);
  };

  const chooseTime = (hour: number, minute: number) => {
    const range = dayWindow(selected, minMs, maxMs);
    if (!range) {
      return;
    }
    const ms = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), hour, minute, 0, 0).getTime();
    if (ms < range.from || ms > range.to) {
      return;
    }
    onChange(ms);
  };

  const firstWeekday = (new Date(view.year, view.month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: Array<Date | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(view.year, view.month, index + 1)),
  ];

  const timeOk = (hour: number, minute: number) => {
    const range = dayWindow(selected, minMs, maxMs);
    if (!range || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return false;
    }
    const ms = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), hour, minute, 0, 0).getTime();
    return ms >= range.from && ms <= range.to;
  };

  return (
    <div ref={rootRef} className="relative mt-2">
      <button
        type="button"
        className={`flex w-full items-center justify-between rounded-xl bg-[#f5f5f7] px-4 py-3 text-left text-[16px] text-[var(--ink)] ring-1 ring-transparent transition duration-200 hover:bg-white ${focusRing} ${
          open ? "bg-white ring-2 ring-[var(--ink)]/25" : ""
        }`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Deadline, ${fieldLabel(valueMs)}`}
        onClick={() => {
          setView({ year: selected.getFullYear(), month: selected.getMonth() });
          setOpen((current) => !current);
        }}
      >
        <span className={num}>{fieldLabel(valueMs)}</span>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0 text-[var(--ink)]">
          <rect x="2" y="3.5" width="14" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M2 7.2h14M6 2.2v2.6M12 2.2v2.6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="Choose a deadline"
          className="absolute left-0 z-50 mt-2 w-[min(100%,320px)] rounded-[22px] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.06]"
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              className={`grid h-8 w-8 place-items-center rounded-full text-[18px] text-[var(--ink)] hover:bg-[#f5f5f7] disabled:opacity-30 ${focusRing}`}
              aria-label="Previous month"
              disabled={viewStart <= minMonth}
              onClick={() => shiftMonth(-1)}
            >
              ‹
            </button>
            <p className="text-[15px] font-semibold tracking-[-0.02em]">{monthLabel(view.year, view.month)}</p>
            <button
              type="button"
              className={`grid h-8 w-8 place-items-center rounded-full text-[18px] text-[var(--ink)] hover:bg-[#f5f5f7] disabled:opacity-30 ${focusRing}`}
              aria-label="Next month"
              disabled={viewStart >= maxMonth}
              onClick={() => shiftMonth(1)}
            >
              ›
            </button>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-[var(--muted)]" aria-hidden="true">
            {WEEKDAYS.map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1" role="grid" aria-label={monthLabel(view.year, view.month)}>
            {cells.map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} />;
              }
              const enabled = dayWindow(day, minMs, maxMs) !== null;
              const active = sameDay(day, selected);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  role="gridcell"
                  disabled={!enabled}
                  aria-label={`${WEEKDAY_NAMES[(day.getDay() + 6) % 7]} ${day.getDate()} ${monthLabel(day.getFullYear(), day.getMonth())}`}
                  aria-pressed={active}
                  className={`grid h-9 w-full place-items-center rounded-full text-[14px] ${num} ${focusRing} ${
                    active
                      ? "bg-[var(--ink)] text-white"
                      : enabled
                        ? "text-[var(--ink)] hover:bg-[#f5f5f7]"
                        : "cursor-not-allowed text-[var(--muted)] opacity-35"
                  }`}
                  onClick={() => chooseDay(day)}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-black/[0.06] pt-4">
            <TimeStep
              label="Hour"
              value={pad(selected.getHours())}
              onDecrease={() => chooseTime(selected.getHours() - 1, selected.getMinutes())}
              onIncrease={() => chooseTime(selected.getHours() + 1, selected.getMinutes())}
              decreaseDisabled={!timeOk(selected.getHours() - 1, selected.getMinutes())}
              increaseDisabled={!timeOk(selected.getHours() + 1, selected.getMinutes())}
            />
            <TimeStep
              label="Minute"
              value={pad(selected.getMinutes())}
              onDecrease={() => chooseTime(selected.getHours(), selected.getMinutes() - 1)}
              onIncrease={() => chooseTime(selected.getHours(), selected.getMinutes() + 1)}
              decreaseDisabled={!timeOk(selected.getHours(), selected.getMinutes() - 1)}
              increaseDisabled={!timeOk(selected.getHours(), selected.getMinutes() + 1)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

const TimeStep = ({
  label,
  value,
  onDecrease,
  onIncrease,
  decreaseDisabled,
  increaseDisabled,
}: {
  label: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseDisabled: boolean;
  increaseDisabled: boolean;
}) => (
  <div>
    <p className="text-[12px] font-medium text-[var(--muted)]">{label}</p>
    <div className="mt-1 flex items-center justify-between rounded-xl bg-[#f5f5f7] px-1 py-1">
      <button
        type="button"
        className={`grid h-8 w-8 place-items-center rounded-full text-[18px] text-[var(--ink)] hover:bg-white disabled:opacity-30 ${focusRing}`}
        aria-label={`Earlier ${label.toLowerCase()}`}
        disabled={decreaseDisabled}
        onClick={onDecrease}
      >
        −
      </button>
      <span className={`text-[15px] font-medium ${num}`}>{value}</span>
      <button
        type="button"
        className={`grid h-8 w-8 place-items-center rounded-full text-[18px] text-[var(--ink)] hover:bg-white disabled:opacity-30 ${focusRing}`}
        aria-label={`Later ${label.toLowerCase()}`}
        disabled={increaseDisabled}
        onClick={onIncrease}
      >
        +
      </button>
    </div>
  </div>
);

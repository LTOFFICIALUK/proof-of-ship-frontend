"use client";

import { useSyncExternalStore } from "react";
import { panel } from "@/components/surface";

type ToastTone = "ok" | "error";

type ToastItem = {
  id: number;
  tone: ToastTone;
  message: string;
};

const empty: ToastItem[] = [];
let nextId = 1;
let toasts: ToastItem[] = empty;
const listeners = new Set<() => void>();
const timers = new Map<number, number>();

const emit = () => {
  listeners.forEach((fn) => fn());
};

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

const getSnapshot = () => toasts;
const getServerSnapshot = () => empty;

export const dismissToast = (id: number) => {
  const timer = timers.get(id);
  if (timer) {
    window.clearTimeout(timer);
    timers.delete(id);
  }
  toasts = toasts.filter((item) => item.id !== id);
  emit();
};

const push = (tone: ToastTone, message: string) => {
  const id = nextId;
  nextId += 1;
  toasts = [...toasts, { id, tone, message }];
  emit();
  if (typeof window !== "undefined") {
    timers.set(
      id,
      window.setTimeout(() => {
        dismissToast(id);
      }, 4600),
    );
  }
};

export const toast = {
  ok: (message: string) => push("ok", message),
  error: (message: string) => push("error", message),
};

export const ToastHost = () => {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!items.length) {
    return null;
  }
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[5.75rem] z-[80] flex flex-col items-center gap-2 px-4 sm:top-28">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => dismissToast(item.id)}
          className={`${panel} toast-enter pointer-events-auto min-w-[16rem] max-w-[min(100%,24rem)] px-4 py-3 text-center text-[14px] leading-snug shadow-[0_12px_40px_rgba(0,0,0,0.12)] ${
            item.tone === "error" ? "text-[var(--burn)]" : "text-[var(--ink)]"
          }`}
          role={item.tone === "error" ? "alert" : "status"}
          aria-label={item.message}
        >
          {item.message}
        </button>
      ))}
    </div>
  );
};

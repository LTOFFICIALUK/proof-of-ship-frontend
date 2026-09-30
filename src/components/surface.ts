export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]";

export const panel =
  "rounded-[22px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]";

export const field =
  "mt-2 w-full rounded-xl bg-[#f5f5f7] px-4 py-3 text-[16px] text-[var(--ink)] outline-none ring-1 ring-transparent transition duration-200 placeholder:text-[var(--muted)] focus:bg-white focus:ring-2 focus:ring-[var(--ink)]/25";

export const labelClass = "block text-[13px] font-medium text-[var(--muted)]";

export const btnPrimary =
  `inline-flex items-center justify-center rounded-full bg-[var(--ink)] px-5 py-2.5 text-[14px] font-medium text-white transition duration-200 hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;

export const btnPay =
  `inline-flex items-center justify-center rounded-full bg-[var(--pay)] px-5 py-2.5 text-[14px] font-medium text-white transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;

export const btnBurn =
  `inline-flex items-center justify-center rounded-full bg-[var(--burn)] px-5 py-2.5 text-[14px] font-medium text-white transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;

export const btnGhost =
  `inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-[14px] font-medium text-[var(--ink)] shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/10 transition duration-200 hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;

export const textLink =
  `rounded-sm text-[var(--link)] underline-offset-2 hover:underline ${focusRing}`;

export const eyebrow = "text-[15px] font-medium text-[var(--muted)]";

export const display =
  "text-[40px] font-semibold leading-[1.05] tracking-[-0.04em] text-[var(--ink)] sm:text-[64px]";

export const pageTitle =
  "break-words text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] text-[var(--ink)] sm:text-[48px]";

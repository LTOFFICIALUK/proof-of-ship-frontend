import type { ReactNode } from "react";
import { Misted } from "@/components/text-mist";
import { pageTitle } from "@/components/surface";

export const LegalBlock = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="py-7">
    <h2 className="text-[22px] font-semibold tracking-[-0.03em]">{title}</h2>
    <div className="mt-3 space-y-3 text-[17px] leading-relaxed text-[var(--muted)]">{children}</div>
  </section>
);

export const LegalPage = ({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) => (
  <Misted cover className="mx-auto max-w-[720px] pt-4">
    <h1 className={pageTitle}>{title}</h1>
    <p className="mt-3 text-[15px] text-[var(--muted)]">Updated {updated}</p>
    <div className="mt-6 divide-y divide-black/[0.06] border-y border-black/[0.06]">{children}</div>
  </Misted>
);

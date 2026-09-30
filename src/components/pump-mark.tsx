import Image from "next/image";

export const PumpMark = ({ label = "pump.fun" }: { label?: string }) => {
  return (
    <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--ink)]">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#1D3934]">
        <Image src="/pump-logomark.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
      </span>
      {label ? <span>{label}</span> : null}
    </span>
  );
};

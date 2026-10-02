import { promiseLabel } from "@/lib/format";

const blockTone = (status: string) => {
  if (status === "paid") {
    return "bg-[var(--pay)]";
  }
  if (status === "burned" || status === "missed") {
    return "bg-[var(--burn)]";
  }
  if (status === "rolled") {
    return "border-[1.5px] border-[var(--ink)] bg-transparent";
  }
  return "bg-[#c9c9c5]";
};

export const StatusBlock = ({ status, size = 10 }: { status: string; size?: number }) => (
  <span
    aria-hidden="true"
    className={`inline-block shrink-0 ${blockTone(status)}`}
    style={{ width: size, height: size }}
  />
);

export const RecordChips = ({ record }: { record: string[] }) => {
  if (!record.length) {
    return null;
  }
  const label = record.map((status, index) => `Promise ${index + 1}: ${promiseLabel(status)}`).join(". ");
  return (
    <span role="img" aria-label={label} title={label} className="inline-flex flex-wrap items-center gap-1">
      {record.map((status, index) => (
        <StatusBlock key={`${status}-${index}`} status={status} size={9} />
      ))}
    </span>
  );
};

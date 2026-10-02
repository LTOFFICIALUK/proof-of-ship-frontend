const ROWS = 4;
const COLS = 8;

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
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden">
      <div className="absolute inset-0 [perspective:900px]">
        <div
          className="absolute left-1/2 top-[18%] w-[1680px]"
          style={{ transform: "translate(-50%, -20%) rotateX(18deg) rotateZ(-8deg)" }}
        >
          {Array.from({ length: ROWS }, (_, rowIndex) => (
            <div key={rowIndex} className="mb-4 flex justify-center gap-4">
              {Array.from({ length: COLS }, (_, colIndex) => {
                const wash = washes[(rowIndex + colIndex) % washes.length];
                return (
                  <div
                    key={colIndex}
                    className={`flex h-[118px] w-[210px] shrink-0 items-end rounded-[18px] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05] ${wash}`}
                  >
                    <span className="grid h-8 w-8 grid-cols-2 gap-1 rounded-[7px] bg-[#111112] p-1.5">
                      <span className="col-start-1 row-start-2 bg-[#4A4A4D]" />
                      <span className="col-start-2 row-start-2 bg-white" />
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(243,243,241,0.96)_0%,rgba(243,243,241,0.82)_18%,rgba(243,243,241,0.2)_46%,transparent_68%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-b from-transparent via-[#f3f3f1]/80 to-[#f3f3f1]" />
    </div>
  );
};

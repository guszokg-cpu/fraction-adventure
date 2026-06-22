import { Card } from "@/components/ui/Card";

const L = 24;
const R = 296;
const Y = 46;
const SCALE = (R - L) / 3;
const px = (v: number) => L + v * SCALE;

const MARKERS = [
  { value: 1.5, label: "1½", color: "#ec4899", above: true },
  { value: 7 / 3, label: "2⅓", color: "#a855f7", above: false }
];

export function MixedNumberLineCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">5</span>
          <h2 className="text-xl font-extrabold">บนเส้นจำนวน</h2>
        </div>
      </div>
      <div className="p-5">
        <p className="mb-3 text-center text-sm font-bold text-slate-600">
          จำนวนคละอยู่ระหว่างจำนวนเต็มบนเส้นจำนวน
        </p>
        <div className="rounded-xl bg-pink-50/60 p-3">
          <svg viewBox="0 0 320 90" className="w-full" aria-label="เส้นจำนวน 0 ถึง 3">
            {/* Main line */}
            <line x1={L - 6} y1={Y} x2={R + 6} y2={Y} stroke="#312e81" strokeWidth={2} />
            {/* Arrow */}
            <polygon points={`${R + 10},${Y} ${R + 4},${Y - 5} ${R + 4},${Y + 5}`} fill="#312e81" />

            {/* Whole-number ticks + labels */}
            {[0, 1, 2, 3].map((n) => (
              <g key={n}>
                <line x1={px(n)} y1={Y - 7} x2={px(n)} y2={Y + 7} stroke="#312e81" strokeWidth={2} />
                <text x={px(n)} y={Y + 20} textAnchor="middle" fontSize={13} fill="#312e81" fontWeight="bold">
                  {n}
                </text>
              </g>
            ))}

            {/* Markers */}
            {MARKERS.map((m) => {
              const x = px(m.value);
              const pillY = m.above ? Y - 28 : Y + 32;
              return (
                <g key={m.label}>
                  <line
                    x1={x} y1={Y - 18} x2={x} y2={Y + 18}
                    stroke={m.color} strokeWidth={1.5} strokeDasharray="3 2"
                  />
                  <circle cx={x} cy={Y} r={6} fill={m.color} stroke="white" strokeWidth={2} />
                  <rect x={x - 20} y={pillY - 10} width={40} height={18} rx={9} fill={m.color} />
                  <text x={x} y={pillY + 4} textAnchor="middle" fontSize={11} fill="white" fontWeight="bold">
                    {m.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-bold">
          <div className="rounded-lg bg-pink-50 py-2 text-pink-600">
            1½ อยู่ระหว่าง 1 กับ 2
          </div>
          <div className="rounded-lg bg-fuchsia-50 py-2 text-fuchsia-700">
            2⅓ อยู่ระหว่าง 2 กับ 3
          </div>
        </div>
      </div>
    </Card>
  );
}

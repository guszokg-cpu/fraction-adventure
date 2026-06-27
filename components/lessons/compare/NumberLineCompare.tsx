import { Card } from "@/components/ui/Card";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";

const LEFT = 30;
const RIGHT = 290;
const USABLE = RIGHT - LEFT;
const BASE_Y = 60;

type Point = {
  value: number;
  label: string;
  color: string;
  /** วางป้ายไว้ด้านบน (true) หรือด้านล่าง (false) ของเส้น */
  above: boolean;
};

const points: Point[] = [
  { value: 1 / 3, label: "1/3", color: "#10b981", above: false },
  { value: 1 / 2, label: "1/2", color: "#0ea5e9", above: true }
];

export function NumberLineCompare() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">3</span>
          <h2 className="text-xl font-extrabold">เปรียบเทียบบนเส้นจำนวน</h2>
        </div>
      </div>

      <div className="p-5">
        <div className="rounded-2xl bg-emerald-50/60 p-4">
          <svg viewBox="0 0 320 96" className="mx-auto h-36 w-full max-w-2xl" role="img" aria-label="เส้นจำนวนแสดง 1/3 และ 1/2">
            <line
              x1={LEFT - 14}
              y1={BASE_Y}
              x2={RIGHT + 14}
              y2={BASE_Y}
              stroke="#334155"
              strokeWidth={2.4}
              strokeLinecap="round"
            />
            <polygon points={`${LEFT - 14},${BASE_Y} ${LEFT - 6},${BASE_Y - 4.5} ${LEFT - 6},${BASE_Y + 4.5}`} fill="#334155" />
            <polygon points={`${RIGHT + 14},${BASE_Y} ${RIGHT + 6},${BASE_Y - 4.5} ${RIGHT + 6},${BASE_Y + 4.5}`} fill="#334155" />

            {[0, 1].map((whole) => {
              const x = LEFT + whole * USABLE;
              return (
                <g key={whole}>
                  <line x1={x} y1={BASE_Y - 11} x2={x} y2={BASE_Y + 11} stroke="#334155" strokeWidth={2.2} />
                  <text x={x} y={BASE_Y + 26} textAnchor="middle" fontSize={13} fontWeight={800} fill="#1e1b4b">
                    {whole}
                  </text>
                </g>
              );
            })}

            {points.map((point) => {
              const x = LEFT + point.value * USABLE;
              const labelY = point.above ? BASE_Y - 20 : BASE_Y + 26;
              const lineY2 = point.above ? BASE_Y - 12 : BASE_Y + 12;
              const [pn, pd] = point.label.split("/");
              return (
                <g key={point.label}>
                  <line x1={x} y1={BASE_Y} x2={x} y2={lineY2} stroke={point.color} strokeWidth={2} strokeDasharray="3 3" />
                  <circle cx={x} cy={BASE_Y} r={7} fill={point.color} stroke="#ffffff" strokeWidth={2.4} />
                  <rect x={x - 11} y={labelY - 15} width={22} height={24} rx={6} fill={point.color} />
                  <text x={x} y={labelY - 5} textAnchor="middle" fontSize={9} fontWeight={800} fill="#ffffff">
                    {pn}
                  </text>
                  <line x1={x - 6} y1={labelY - 2} x2={x + 6} y2={labelY - 2} stroke="#ffffff" strokeWidth={1} />
                  <text x={x} y={labelY + 8} textAnchor="middle" fontSize={9} fontWeight={800} fill="#ffffff">
                    {pd}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <p className="mt-4 flex flex-wrap items-center justify-center gap-1 text-center text-sm font-bold text-slate-600">
          จุด <StackedFraction numerator={1} denominator={2} className="text-sm" toneClassName="text-sky-600" /> อยู่ทางขวาของจุด{" "}
          <StackedFraction numerator={1} denominator={3} className="text-sm" toneClassName="text-emerald-600" /> แสดงว่า{" "}
          <StackedFraction numerator={1} denominator={2} className="text-sm" toneClassName="text-sky-600" /> มีค่ามากกว่า
        </p>

        <div className="mt-3 flex items-center justify-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
          <span className="text-base font-extrabold">สรุป:</span>
          <StackedFraction numerator={1} denominator={2} className="text-xl" toneClassName="text-emerald-700" />
          <span className="text-2xl font-extrabold">&gt;</span>
          <StackedFraction numerator={1} denominator={3} className="text-xl" toneClassName="text-emerald-700" />
        </div>
      </div>
    </Card>
  );
}

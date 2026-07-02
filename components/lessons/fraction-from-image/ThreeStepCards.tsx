import { Search, Paintbrush, PencilLine, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";

/** วงกลมแบ่ง 4 ส่วน ใส่เลขกำกับแต่ละส่วน — ใช้เฉพาะการ์ดขั้นที่ 1 เพื่อสอนการนับส่วนทั้งหมด */
function NumberedCircle() {
  const positions = [
    { n: 1, x: 68, y: 32 },
    { n: 2, x: 68, y: 68 },
    { n: 3, x: 32, y: 68 },
    { n: 4, x: 32, y: 32 },
  ];
  return (
    <svg viewBox="0 0 100 100" className="h-36 w-36" role="img" aria-label="วงกลมแบ่ง 4 ส่วน นับครบทุกส่วน">
      <circle cx={50} cy={50} r={46} fill="#eef2ff" stroke="#312e81" strokeWidth={1.5} />
      <line x1={50} y1={4} x2={50} y2={96} stroke="#312e81" strokeWidth={1.5} />
      <line x1={4} y1={50} x2={96} y2={50} stroke="#312e81" strokeWidth={1.5} />
      {positions.map((p) => (
        <text
          key={p.n}
          x={p.x}
          y={p.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={16}
          fontWeight={800}
          fill="#4338ca"
        >
          {p.n}
        </text>
      ))}
    </svg>
  );
}

export function ThreeStepCards() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {/* ขั้นที่ 1 */}
      <Card className="rounded-2xl border-sky-100">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sky-500 text-white">
            <Search size={16} />
          </span>
          <h3 className="text-lg font-extrabold text-brand-900">ขั้นที่ 1 นับจำนวนส่วนทั้งหมด</h3>
        </div>
        <div className="mt-4 flex justify-center">
          <NumberedCircle />
        </div>
        <p className="mt-4 text-center text-base font-bold leading-relaxed text-slate-600">
          วงกลมถูกแบ่งเป็น 4 ส่วนเท่า ๆ กัน ดังนั้นตัวส่วนคือ 4
        </p>
        <div className="mt-3 rounded-xl bg-sky-50 px-4 py-2.5 text-center text-lg font-extrabold text-sky-700">
          ตัวส่วน = 4
        </div>
      </Card>

      {/* ขั้นที่ 2 */}
      <Card className="rounded-2xl border-emerald-100">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
            <Paintbrush size={16} />
          </span>
          <h3 className="text-lg font-extrabold text-brand-900">ขั้นที่ 2 นับจำนวนส่วนที่ระบายสี</h3>
        </div>
        <div className="mt-4 flex justify-center">
          <FractionShape numerator={3} denominator={4} shape="circle" tone="emerald" className="h-36 w-36" />
        </div>
        <p className="mt-4 text-center text-base font-bold leading-relaxed text-slate-600">
          มีส่วนที่ระบายสี 3 ส่วน ดังนั้นตัวเศษคือ 3
        </p>
        <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-2.5 text-center text-lg font-extrabold text-emerald-700">
          ตัวเศษ = 3
        </div>
      </Card>

      {/* ขั้นที่ 3 */}
      <Card className="rounded-2xl border-violet-100">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-500 text-white">
            <PencilLine size={16} />
          </span>
          <h3 className="text-lg font-extrabold text-brand-900">ขั้นที่ 3 เขียนเป็นเศษส่วน</h3>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="flex flex-col items-center leading-none">
            <span className="text-6xl font-extrabold text-rose-500">3</span>
            <span className="my-1.5 h-1.5 w-14 rounded-full bg-slate-300" />
            <span className="text-6xl font-extrabold text-brand-600">4</span>
          </div>
          <div className="flex flex-col gap-4 text-sm font-extrabold">
            <div className="flex items-center gap-1 text-rose-600">
              <ArrowRight size={14} className="shrink-0" />
              ตัวเศษ
            </div>
            <div className="flex items-center gap-1 text-brand-600">
              <ArrowRight size={14} className="shrink-0" />
              ตัวส่วน
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-base font-bold leading-relaxed text-slate-600">
          เขียนจำนวนส่วนที่ระบายสีไว้ด้านบน และจำนวนส่วนทั้งหมดไว้ด้านล่าง
        </p>
        <div className="mt-3 rounded-xl bg-violet-50 px-4 py-2.5 text-center text-lg font-extrabold text-violet-700">
          เขียนได้เป็น 3/4
        </div>
      </Card>
    </div>
  );
}

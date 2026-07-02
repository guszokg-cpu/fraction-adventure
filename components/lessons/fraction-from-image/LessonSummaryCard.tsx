import { Card } from "@/components/ui/Card";
import { FractionText } from "@/components/fractions/FractionText";

const STEPS = [
  "นับส่วนทั้งหมดก่อน → เป็นตัวส่วน",
  "นับส่วนที่ระบายสี → เป็นตัวเศษ",
  "เขียนเป็นเศษส่วน → ตัวเศษ / ตัวส่วน",
];

export function LessonSummaryCard() {
  return (
    <Card className="rounded-2xl border-amber-100 bg-gradient-to-br from-amber-50 to-violet-50">
      <h3 className="flex items-center gap-2 text-xl font-extrabold text-amber-700">
        <span>🏆</span> สรุปท้ายบท
      </h3>
      <p className="mt-1 text-base font-bold text-amber-700">จำง่าย ๆ เลย!</p>

      <ol className="mt-4 space-y-2.5">
        {STEPS.map((text, i) => (
          <li
            key={i}
            className="flex items-center gap-3 rounded-xl bg-white/80 px-4 py-3 text-base font-bold text-slate-700 shadow-sm"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-500 text-sm font-extrabold text-white">
              {i + 1}
            </span>
            {text}
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3 rounded-xl bg-white px-5 py-4 text-center shadow-sm">
        <span className="text-base font-extrabold text-slate-600">เศษส่วน =</span>
        <FractionText numerator="ส่วนที่ระบายสี" denominator="ส่วนทั้งหมด" className="text-lg" toneClassName="text-violet-700" />
      </div>
    </Card>
  );
}

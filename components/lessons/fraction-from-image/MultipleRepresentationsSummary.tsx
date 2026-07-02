import { Card } from "@/components/ui/Card";
import { FractionText } from "@/components/fractions/FractionText";

const POINTS = [
  "เศษส่วนเดียวกันอาจแสดงด้วยภาพต่างกันได้",
  "ให้ดูที่จำนวนส่วนที่ระบายและจำนวนส่วนทั้งหมด",
  "ถ้าสองอย่างนี้เท่ากัน เศษส่วนก็เท่ากัน",
  "คำอ่านต้องมีคำว่า “เศษ” นำหน้า เช่น 3/4 อ่านว่า เศษสามส่วนสี่",
];

export function MultipleRepresentationsSummary() {
  return (
    <Card className="rounded-2xl border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-extrabold text-emerald-700">
            <span>✅</span> จำให้แม่น
          </h3>
          <ul className="mt-3 space-y-2">
            {POINTS.map((text, i) => (
              <li
                key={i}
                className="flex items-center gap-2.5 rounded-xl bg-white px-4 py-2.5 text-base font-bold text-slate-700 shadow-sm"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-xs font-extrabold text-white">
                  ✓
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center gap-3">
          <span className="text-6xl" aria-hidden>
            🐻
          </span>
          <div className="rounded-xl bg-white px-5 py-3 text-center shadow-sm">
            <div className="text-xs font-extrabold uppercase tracking-wide text-slate-400">สูตรจำง่าย ๆ</div>
            <div className="mt-1.5 flex items-center justify-center gap-2">
              <span className="text-base font-extrabold text-slate-600">เศษส่วน =</span>
              <FractionText numerator="ส่วนที่ระบาย" denominator="ส่วนทั้งหมด" className="text-base" toneClassName="text-emerald-700" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

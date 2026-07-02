import { Card } from "@/components/ui/Card";

const POINTS = [
  "เศษส่วนใช้บอกจำนวนส่วนของ 1 หน่วย",
  "ต้องแบ่ง 1 หน่วยเป็นส่วนเท่า ๆ กันก่อน",
  "ตัวเศษ = จำนวนส่วนที่เลือก",
  "ตัวส่วน = จำนวนส่วนทั้งหมดที่เท่ากัน",
  "ถ้าแบ่งไม่เท่ากัน ยังไม่ใช่เศษส่วนที่ถูกต้อง",
];

export function EqualPartsSummary() {
  return (
    <Card className="rounded-2xl border-amber-100 bg-gradient-to-br from-amber-50 to-violet-50">
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-extrabold text-amber-700">
            <span>⭐</span> สรุปสำคัญ
          </h3>
          <ul className="mt-3 space-y-2">
            {POINTS.map((text, i) => (
              <li
                key={i}
                className="flex items-center gap-2.5 rounded-xl bg-white/70 px-4 py-2.5 text-base font-bold text-slate-700"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-violet-500 text-xs font-extrabold text-white">
                  ✓
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="max-w-[200px] rounded-2xl rounded-br-none bg-white px-4 py-3 text-center text-sm font-bold text-slate-600 shadow-sm">
            เท่ากันก่อน แล้วค่อยนับส่วน!
          </div>
          <span className="text-6xl" aria-hidden>
            🐻
          </span>
        </div>
      </div>
    </Card>
  );
}

import { Card } from "@/components/ui/Card";

const POINTS = [
  "ตัวเศษ = จำนวนส่วนที่เลือกหรือระบายสี",
  "ตัวส่วน = จำนวนส่วนทั้งหมด",
  "ทุกส่วนต้องเท่ากันก่อน จึงเขียนเป็นเศษส่วนได้",
];

export function FractionRememberCard() {
  return (
    <Card className="rounded-2xl border-emerald-100 bg-emerald-50/50">
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

        <div className="flex flex-col items-center gap-2">
          <div className="max-w-[200px] rounded-2xl rounded-br-none bg-white px-4 py-3 text-center text-sm font-bold text-slate-600 shadow-sm">
            นับส่วนทั้งหมดก่อน แล้วค่อยนับส่วนที่ระบายสีนะ!
          </div>
          <span className="text-6xl" aria-hidden>
            🐰
          </span>
        </div>
      </div>
    </Card>
  );
}

import { AlertTriangle, X } from "lucide-react";
import { Card } from "@/components/ui/Card";

const MISTAKES = [
  "นับส่วนที่ไม่เท่ากัน แล้วเขียนเป็นเศษส่วน",
  "สลับตัวเศษกับตัวส่วน",
  "นับจำนวนส่วนผิด",
  "ลืมดูว่าส่วนทั้งหมดแบ่งเท่ากันหรือไม่",
];

export function CommonMistakesCard() {
  return (
    <Card className="rounded-2xl border-orange-200 bg-orange-50/50">
      <h3 className="flex items-center gap-2 text-xl font-extrabold text-orange-600">
        <AlertTriangle size={22} />
        ระวัง! ข้อผิดพลาดที่พบบ่อย
      </h3>
      <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {MISTAKES.map((text, i) => (
          <li
            key={i}
            className="flex items-center gap-2.5 rounded-xl bg-white px-4 py-2.5 text-base font-bold text-slate-700 shadow-sm"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose-400 text-white">
              <X size={14} />
            </span>
            {text}
          </li>
        ))}
      </ul>
    </Card>
  );
}

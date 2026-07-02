import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { UnequalCircle, UnequalBar } from "@/components/lessons/shared/UnequalShapes";

const ROWS = [
  {
    Visual: UnequalCircle,
    className: "h-24 w-24 shrink-0",
    text: "แต่ละส่วนมีขนาดไม่เท่ากัน จึงยังเขียนเป็นเศษส่วนไม่ได้อย่างถูกต้อง",
  },
  {
    Visual: UnequalBar,
    className: "h-14 w-44 shrink-0",
    text: "ต้องแบ่งใหม่ให้แต่ละส่วนเท่ากันก่อน",
  },
];

export function EqualPartsIncorrectExamples() {
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-xl font-extrabold text-orange-600">
        <AlertTriangle size={22} className="text-orange-500" />
        ตัวอย่างที่ยังไม่ถูกต้อง
      </h3>

      {ROWS.map((row, i) => (
        <Card key={i} className="rounded-2xl border-orange-200 bg-orange-50/40">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <row.Visual className={row.className} />
            <div className="text-4xl font-extrabold text-orange-400">?</div>
            <p className="flex-1 text-center text-base font-bold text-slate-600 sm:text-left">{row.text}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

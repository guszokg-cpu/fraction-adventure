import { Card } from "@/components/ui/Card";
import { FractionText } from "@/components/fractions/FractionText";
import { readThaiFraction } from "@/lib/thaiNumber";

export function MultipleRepresentationsIntro() {
  return (
    <Card className="overflow-hidden rounded-3xl border-violet-100 bg-gradient-to-br from-violet-50 to-white">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
        <div className="flex flex-col items-center gap-2">
          <FractionText numerator={3} denominator={4} className="text-7xl" toneClassName="text-violet-700" />
          <div className="rounded-full bg-violet-100 px-4 py-1.5 text-sm font-extrabold text-violet-700">
            อ่านว่า {readThaiFraction(3, 4)}
          </div>
        </div>

        <div className="flex flex-col gap-3 text-base font-bold">
          <div className="rounded-xl bg-rose-50 px-4 py-2.5 text-rose-600">ตัวเศษ 3 = ส่วนที่ระบาย</div>
          <div className="rounded-xl bg-brand-50 px-4 py-2.5 text-brand-700">ตัวส่วน 4 = ส่วนทั้งหมด</div>
        </div>

        <div className="flex max-w-[220px] items-start gap-3">
          <div className="rounded-2xl rounded-bl-none bg-white px-4 py-3 text-center text-sm font-bold text-slate-600 shadow-sm">
            รูปร่างเปลี่ยนได้ แต่ความหมายของเศษส่วนยังเหมือนเดิม
          </div>
          <span className="text-5xl" aria-hidden>
            🐻
          </span>
        </div>
      </div>
    </Card>
  );
}

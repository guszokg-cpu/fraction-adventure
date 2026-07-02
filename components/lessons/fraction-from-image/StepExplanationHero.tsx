import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";

export function StepExplanationHero() {
  return (
    <Card className="overflow-hidden rounded-3xl border-violet-100 bg-gradient-to-br from-violet-50 to-white p-0">
      <div className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-5 text-white">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">
          2
        </span>
        <div>
          <h2 className="text-2xl font-extrabold">อธิบายทีละขั้น</h2>
          <p className="mt-0.5 text-sm font-bold text-violet-100">การเขียนเศษส่วน ทำได้ 3 ขั้นง่าย ๆ</p>
        </div>
      </div>

      <div className="p-6">
        <div className="rounded-2xl bg-amber-50 px-5 py-3 text-center text-base font-bold text-amber-700">
          ให้นับส่วนทั้งหมดก่อน แล้วนับส่วนที่ระบายสี จากนั้นจึงเขียนเป็นเศษส่วน
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
          <FractionShape numerator={3} denominator={4} shape="circle" tone="pink" className="h-40 w-40 shrink-0" />

          <FractionText numerator={3} denominator={4} className="text-7xl" toneClassName="text-violet-700" />

          <div className="flex flex-col gap-3 text-base font-bold">
            <div className="rounded-xl bg-rose-50 px-4 py-2.5 text-rose-600">ตัวเศษ = ส่วนที่ระบายสี</div>
            <div className="rounded-xl bg-brand-50 px-4 py-2.5 text-brand-700">ตัวส่วน = ส่วนทั้งหมด</div>
          </div>

          <span className="hidden text-5xl sm:block" aria-hidden>
            🧒
          </span>
        </div>
      </div>
    </Card>
  );
}

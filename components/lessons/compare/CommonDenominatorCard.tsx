import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";

export function CommonDenominatorCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">4</span>
          <h2 className="text-xl font-extrabold">ทำส่วนให้เท่ากัน</h2>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-center gap-3 text-lg font-extrabold text-brand-900">
          เปรียบเทียบ
          <StackedFraction numerator={1} denominator={2} className="text-2xl" toneClassName="text-sky-600" />
          กับ
          <StackedFraction numerator={3} denominator={4} className="text-2xl" toneClassName="text-emerald-600" />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-brand-100 bg-white p-4">
            <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-extrabold text-emerald-700">
              ขั้นที่ 1
            </div>
            <p className="mt-2 text-sm font-bold text-slate-600">ทำตัวส่วนของ 1/2 ให้เป็น 4 โดยคูณบนล่างด้วย 2</p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xl font-extrabold text-brand-900">
              <StackedFraction numerator={1} denominator={2} className="text-xl" toneClassName="text-sky-600" />
              <span>=</span>
              <StackedFraction numerator={2} denominator={4} className="text-xl" toneClassName="text-sky-600" />
            </div>
          </div>

          <div className="rounded-xl border border-brand-100 bg-white p-4">
            <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-extrabold text-emerald-700">
              ขั้นที่ 2
            </div>
            <p className="mt-2 text-sm font-bold text-slate-600">เมื่อตัวส่วนเท่ากันแล้ว เปรียบเทียบตัวเศษได้เลย</p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xl font-extrabold text-brand-900">
              <StackedFraction numerator={2} denominator={4} className="text-xl" toneClassName="text-sky-600" />
              <span>กับ</span>
              <StackedFraction numerator={3} denominator={4} className="text-xl" toneClassName="text-emerald-600" />
            </div>
          </div>

          <div className="rounded-xl border border-brand-100 bg-white p-4">
            <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-extrabold text-emerald-700">
              ขั้นที่ 3
            </div>
            <p className="mt-2 text-sm font-bold text-slate-600">2 น้อยกว่า 3 ดังนั้น 2/4 น้อยกว่า 3/4</p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xl font-extrabold text-brand-900">
              <StackedFraction numerator={2} denominator={4} className="text-xl" toneClassName="text-sky-600" />
              <span className="text-2xl">&lt;</span>
              <StackedFraction numerator={3} denominator={4} className="text-xl" toneClassName="text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-3">
            <FractionShape numerator={2} denominator={4} shape="bar" tone="sky" className="h-12 w-40" />
            <StackedFraction numerator={2} denominator={4} className="text-lg" toneClassName="text-sky-600" />
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-3">
            <FractionShape numerator={3} denominator={4} shape="bar" tone="emerald" className="h-12 w-40" />
            <StackedFraction numerator={3} denominator={4} className="text-lg" toneClassName="text-emerald-600" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
          <span className="text-base font-extrabold">สรุป:</span>
          <StackedFraction numerator={1} denominator={2} className="text-xl" toneClassName="text-emerald-700" />
          <span className="text-2xl font-extrabold">&lt;</span>
          <StackedFraction numerator={3} denominator={4} className="text-xl" toneClassName="text-emerald-700" />
        </div>
      </div>
    </Card>
  );
}

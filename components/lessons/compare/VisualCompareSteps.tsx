import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";

const steps = [
  {
    id: "first",
    badge: "ขั้นที่ 1",
    title: "ดูภาพแรก",
    numerator: 1,
    denominator: 2,
    tone: "sky" as const,
    toneClass: "text-sky-600"
  },
  {
    id: "second",
    badge: "ขั้นที่ 2",
    title: "ดูภาพที่สอง",
    numerator: 1,
    denominator: 3,
    tone: "emerald" as const,
    toneClass: "text-emerald-600"
  }
];

export function VisualCompareSteps() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">2</span>
          <h2 className="text-xl font-extrabold">เปรียบเทียบจากภาพ (คิดทีละขั้น)</h2>
        </div>
      </div>

      <div className="p-5">
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.id} className="rounded-xl border border-brand-100 bg-white p-4 text-center">
              <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-extrabold text-emerald-700">
                {step.badge}
              </div>
              <h3 className="mt-2 text-base font-extrabold text-brand-900">{step.title}</h3>
              <FractionShape
                numerator={step.numerator}
                denominator={step.denominator}
                tone={step.tone}
                className="mx-auto my-3 h-24 w-24"
              />
              <StackedFraction
                numerator={step.numerator}
                denominator={step.denominator}
                className="text-2xl"
                toneClassName={step.toneClass}
              />
            </div>
          ))}

          <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-center">
            <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-extrabold text-emerald-700">
              ขั้นที่ 3
            </div>
            <h3 className="mt-2 text-base font-extrabold text-brand-900">ใครระบายมากกว่า?</h3>
            <p className="mt-2 text-sm font-bold text-slate-600">
              ภาพแรกระบายครึ่งหนึ่ง มากกว่าภาพที่สองที่ระบายเพียง 1 ใน 3 ส่วน
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
          <span className="text-base font-extrabold">สรุป:</span>
          <StackedFraction numerator={1} denominator={2} className="text-xl" toneClassName="text-emerald-700" />
          <span className="text-2xl font-extrabold">&gt;</span>
          <StackedFraction numerator={1} denominator={3} className="text-xl" toneClassName="text-emerald-700" />
        </div>
      </div>
    </Card>
  );
}

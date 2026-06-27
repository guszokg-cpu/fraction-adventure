import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader, StepBadge } from "@/components/lessons/add/FractionMath";

export function DifferentDenominatorAddCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={3} title="บวกเศษส่วน (ตัวส่วนไม่เท่ากัน)" />
      <div className="p-4">
        <div className="text-center text-2xl font-extrabold text-slate-950">
          <FractionStack top={1} bottom={2} /> <span className="mx-2">+</span> <FractionStack top={1} bottom={3} />{" "}
          <span className="mx-2">= ?</span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-xl bg-white p-3 text-center ring-1 ring-blue-100">
            <StepBadge>ขั้นที่ 1 หา ค.ร.น.</StepBadge>
            <div className="mt-4 text-xl font-extrabold text-brand-900">2, 3 → 6</div>
          </div>
          <div className="rounded-xl bg-white p-3 text-center ring-1 ring-blue-100">
            <StepBadge>ขั้นที่ 2 ทำส่วนให้เท่ากัน</StepBadge>
            <div className="mt-3 space-y-2 text-lg font-extrabold text-brand-900">
              <div>
                <FractionStack top={1} bottom={2} /> = <FractionStack top={3} bottom={6} />
              </div>
              <div>
                <FractionStack top={1} bottom={3} /> = <FractionStack top={2} bottom={6} />
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-3 text-center ring-1 ring-blue-100">
            <StepBadge>ขั้นที่ 3 บวกตัวเศษ</StepBadge>
            <div className="mt-3 text-lg font-extrabold text-brand-900">
              <FractionStack top={3} bottom={6} /> + <FractionStack top={2} bottom={6} /> ={" "}
              <FractionStack top={5} bottom={6} className="text-pink-600" />
            </div>
          </div>
          <div className="rounded-xl bg-white p-3 text-center ring-1 ring-blue-100">
            <StepBadge>ขั้นที่ 4 คำตอบ</StepBadge>
            <div className="mt-2 flex justify-center gap-2">
              <FractionShape numerator={3} denominator={6} shape="circle" tone="pink" className="h-16 w-16" />
              <FractionShape numerator={2} denominator={6} shape="circle" tone="emerald" className="h-16 w-16" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-pink-600">
              <FractionStack top={5} bottom={6} />
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-center text-sm font-bold text-indigo-700">
          ตัวส่วนไม่เท่ากัน ต้องทำตัวส่วนให้เท่ากันก่อน แล้วจึงบวกตัวเศษ
        </div>
      </div>
    </Card>
  );
}

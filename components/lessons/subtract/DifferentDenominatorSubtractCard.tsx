import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader, StepBadge } from "@/components/lessons/subtract/SubtractMath";

export function DifferentDenominatorSubtractCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={3} title="ลบตัวส่วนไม่เท่ากัน" />
      <div className="p-4">
        <div className="text-center text-2xl font-extrabold text-slate-950">
          <FractionStack top={3} bottom={4} /> <span className="mx-2">-</span> <FractionStack top={1} bottom={2} />{" "}
          <span className="mx-2">= ?</span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-xl bg-white p-3 text-center ring-1 ring-emerald-100">
            <StepBadge>ขั้นที่ 1 หา ค.ร.น.</StepBadge>
            <div className="mt-4 text-xl font-extrabold text-brand-900">4 และ 2 = 4</div>
          </div>
          <div className="rounded-xl bg-white p-3 text-center ring-1 ring-emerald-100">
            <StepBadge>ขั้นที่ 2 ทำส่วนให้เท่ากัน</StepBadge>
            <div className="mt-3 text-xl font-extrabold text-brand-900">
              <FractionStack top={1} bottom={2} /> = <FractionStack top={2} bottom={4} />
            </div>
          </div>
          <div className="rounded-xl bg-white p-3 text-center ring-1 ring-emerald-100">
            <StepBadge>ขั้นที่ 3 ลบ</StepBadge>
            <div className="mt-3 text-lg font-extrabold text-brand-900">
              <FractionStack top={3} bottom={4} /> - <FractionStack top={2} bottom={4} /> ={" "}
              <FractionStack top={1} bottom={4} className="text-emerald-700" />
            </div>
          </div>
          <div className="rounded-xl bg-white p-3 text-center ring-1 ring-emerald-100">
            <StepBadge>ขั้นที่ 4 ตอบ</StepBadge>
            <div className="mt-2 flex justify-center gap-2">
              <FractionShape numerator={3} denominator={4} shape="circle" tone="emerald" className="h-16 w-16" />
              <FractionShape numerator={1} denominator={2} shape="circle" tone="pink" className="h-16 w-16" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-emerald-700">
              <FractionStack top={1} bottom={4} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader, StepBadge } from "@/components/lessons/multiply/MultiplyMath";

export function MixedMultiplyCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={6} title="จำนวนคละ × เศษส่วน" />
      <div className="p-4">
        <div className="text-center text-2xl font-extrabold text-slate-950">
          1 <FractionStack top={1} bottom={2} /> × <FractionStack top={2} bottom={3} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-orange-50 p-3 text-center">
            <StepBadge>ขั้นที่ 1</StepBadge>
            <div className="mt-4 text-lg font-extrabold text-brand-900">
              1 <FractionStack top={1} bottom={2} /> = <FractionStack top={3} bottom={2} />
            </div>
          </div>
          <div className="rounded-xl bg-orange-50 p-3 text-center">
            <StepBadge>ขั้นที่ 2</StepBadge>
            <div className="mt-4 text-lg font-extrabold text-brand-900">
              <FractionStack top={3} bottom={2} /> × <FractionStack top={2} bottom={3} /> ={" "}
              <FractionStack top={6} bottom={6} />
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-center">
            <StepBadge>ขั้นที่ 3</StepBadge>
            <div className="mt-4 text-4xl font-extrabold text-emerald-700">1</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

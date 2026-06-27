import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader, StepBadge } from "@/components/lessons/multiply/MultiplyMath";

export function MultiplyStepsCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={3} title="วิธีทำทีละขั้น" />
      <div className="p-4">
        <div className="mb-4 text-center text-2xl font-extrabold text-slate-950">
          <FractionStack top={2} bottom={3} /> × <FractionStack top={3} bottom={4} />
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl bg-orange-50 p-3 text-center">
            <StepBadge>ขั้นที่ 1</StepBadge>
            <div className="mt-4 text-xl font-extrabold text-brand-900">2 × 3 = 6</div>
            <div className="text-xs font-bold text-slate-500">คูณตัวเศษ</div>
          </div>
          <div className="rounded-xl bg-orange-50 p-3 text-center">
            <StepBadge>ขั้นที่ 2</StepBadge>
            <div className="mt-4 text-xl font-extrabold text-brand-900">3 × 4 = 12</div>
            <div className="text-xs font-bold text-slate-500">คูณตัวส่วน</div>
          </div>
          <div className="rounded-xl bg-orange-50 p-3 text-center">
            <StepBadge>ขั้นที่ 3</StepBadge>
            <div className="mt-4 text-2xl font-extrabold text-orange-600">
              <FractionStack top={6} bottom={12} />
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-center">
            <StepBadge>ขั้นที่ 4</StepBadge>
            <div className="mt-4 text-2xl font-extrabold text-emerald-700">
              <FractionStack top={6} bottom={12} /> = <FractionStack top={1} bottom={2} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader, StepBadge } from "@/components/lessons/divide/DivideMath";

export function DivideStepsCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={3} title="วิธีทำทีละขั้น" />
      <div className="p-4">
        <div className="mb-4 text-center text-2xl font-extrabold text-slate-950">
          <FractionStack top={1} bottom={2} /> ÷ <FractionStack top={1} bottom={4} />
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          <div className="rounded-xl bg-violet-50 p-3 text-center">
            <StepBadge>ขั้นที่ 1</StepBadge>
            <p className="mt-4 text-sm font-extrabold text-brand-900">เปลี่ยนหารเป็นคูณ</p>
          </div>
          <div className="rounded-xl bg-violet-50 p-3 text-center">
            <StepBadge>ขั้นที่ 2</StepBadge>
            <div className="mt-3 text-lg font-extrabold text-brand-900">
              <FractionStack top={1} bottom={4} /> → <FractionStack top={4} bottom={1} />
            </div>
          </div>
          <div className="rounded-xl bg-violet-50 p-3 text-center">
            <StepBadge>ขั้นที่ 3</StepBadge>
            <div className="mt-3 text-lg font-extrabold text-brand-900">
              <FractionStack top={1} bottom={2} /> × <FractionStack top={4} bottom={1} />
            </div>
          </div>
          <div className="rounded-xl bg-violet-50 p-3 text-center">
            <StepBadge>ขั้นที่ 4</StepBadge>
            <div className="mt-4 text-2xl font-extrabold text-violet-700">
              <FractionStack top={4} bottom={2} />
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-center">
            <StepBadge>ขั้นที่ 5</StepBadge>
            <div className="mt-4 text-4xl font-extrabold text-emerald-700">2</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

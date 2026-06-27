import { Card } from "@/components/ui/Card";
import { FractionStack, MiniFractionBar, SectionHeader, StepBadge } from "@/components/lessons/subtract/SubtractMath";

export function MixedNumberSubtractCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={5} title="ลบจำนวนคละ" />
      <div className="p-4">
        <div className="text-center text-2xl font-extrabold text-slate-950">
          2 <FractionStack top={3} bottom={4} /> <span className="mx-2">-</span> 1{" "}
          <FractionStack top={1} bottom={4} /> <span className="mx-2">= ?</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-emerald-50 p-3 text-center">
            <StepBadge>ขั้นที่ 1 ลบจำนวนเต็ม</StepBadge>
            <div className="mt-4 text-xl font-extrabold text-brand-900">2 - 1 = 1</div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-center">
            <StepBadge>ขั้นที่ 2 ลบเศษส่วน</StepBadge>
            <div className="mt-3 flex items-center justify-center gap-2">
              <MiniFractionBar numerator={3} denominator={4} tone="emerald" label={<FractionStack top={3} bottom={4} className="text-sm" />} className="w-24" />
              <span className="font-extrabold">-</span>
              <MiniFractionBar numerator={1} denominator={4} tone="pink" label={<FractionStack top={1} bottom={4} className="text-sm" />} className="w-24" />
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-center">
            <StepBadge>ขั้นที่ 3 คำตอบ</StepBadge>
            <div className="mt-4 text-3xl font-extrabold text-emerald-700">
              1 <FractionStack top={2} bottom={4} /> = 1 <FractionStack top={1} bottom={2} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

import { Card } from "@/components/ui/Card";
import { FractionStack, MiniFractionBar, SectionHeader, StepBadge } from "@/components/lessons/add/FractionMath";

export function MixedNumberAddCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={4} title="บวกจำนวนคละ" />
      <div className="p-4">
        <div className="text-center text-2xl font-extrabold text-slate-950">
          1 <FractionStack top={1} bottom={4} /> <span className="mx-2">+</span> 2{" "}
          <FractionStack top={2} bottom={4} /> <span className="mx-2">= ?</span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-blue-50 p-3 text-center">
            <StepBadge>ขั้นที่ 1 บวกจำนวนเต็ม</StepBadge>
            <div className="mt-4 text-xl font-extrabold text-brand-900">1 + 2 = 3</div>
          </div>
          <div className="rounded-xl bg-blue-50 p-3 text-center">
            <StepBadge>ขั้นที่ 2 บวกเศษส่วน</StepBadge>
            <div className="mt-3 flex items-center justify-center gap-2 text-lg font-extrabold text-brand-900">
              <MiniFractionBar numerator={1} denominator={4} tone="violet" label={<FractionStack top={1} bottom={4} className="text-sm" />} className="w-24" />
              <span>+</span>
              <MiniFractionBar numerator={2} denominator={4} tone="violet" label={<FractionStack top={2} bottom={4} className="text-sm" />} className="w-24" />
            </div>
          </div>
          <div className="rounded-xl bg-blue-50 p-3 text-center">
            <StepBadge>ขั้นที่ 3 คำตอบ</StepBadge>
            <div className="mt-4 text-4xl font-extrabold text-pink-600">
              3 <FractionStack top={3} bottom={4} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

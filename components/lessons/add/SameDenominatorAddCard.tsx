import { Card } from "@/components/ui/Card";
import { FractionStack, MiniFractionBar, SectionHeader, StepBadge } from "@/components/lessons/add/FractionMath";

export function SameDenominatorAddCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={2} title="บวกเศษส่วน (ตัวส่วนเท่ากัน)" />
      <div className="p-4">
        <div className="text-center text-2xl font-extrabold text-slate-950">
          <FractionStack top={2} bottom={5} /> <span className="mx-2">+</span> <FractionStack top={1} bottom={5} />{" "}
          <span className="mx-2">= ?</span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-blue-50 p-3 text-center">
            <StepBadge>ขั้นที่ 1</StepBadge>
            <MiniFractionBar numerator={2} denominator={5} tone="sky" label={<FractionStack top={2} bottom={5} />} className="mt-3" />
          </div>
          <div className="rounded-xl bg-blue-50 p-3 text-center">
            <StepBadge>ขั้นที่ 2</StepBadge>
            <MiniFractionBar numerator={1} denominator={5} tone="sky" label={<FractionStack top={1} bottom={5} />} className="mt-3" />
          </div>
          <div className="rounded-xl bg-blue-50 p-3 text-center">
            <StepBadge>ขั้นที่ 3 รวมกัน</StepBadge>
            <MiniFractionBar numerator={3} denominator={5} tone="sky" label={<FractionStack top={3} bottom={5} />} className="mt-3" />
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-center text-lg font-extrabold text-blue-700">
          ดังนั้น <FractionStack top={2} bottom={5} /> + <FractionStack top={1} bottom={5} /> ={" "}
          <FractionStack top={3} bottom={5} className="text-blue-800" />
        </div>
        <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-700">
          ตัวส่วนเท่ากัน บวกเฉพาะตัวเศษ ตัวส่วนคงเดิม
        </p>
      </div>
    </Card>
  );
}

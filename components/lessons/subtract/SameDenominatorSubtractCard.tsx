import { Card } from "@/components/ui/Card";
import { CrossOutBar, FractionStack, MiniFractionBar, SectionHeader, StepBadge } from "@/components/lessons/subtract/SubtractMath";

export function SameDenominatorSubtractCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={2} title="ลบตัวส่วนเท่ากัน" />
      <div className="p-4">
        <div className="text-center text-2xl font-extrabold text-slate-950">
          <FractionStack top={4} bottom={5} /> <span className="mx-2">-</span> <FractionStack top={2} bottom={5} />{" "}
          <span className="mx-2">=</span> <FractionStack top={2} bottom={5} className="text-emerald-700" />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-emerald-50 p-3 text-center">
            <StepBadge>ขั้นที่ 1 มี 4/5</StepBadge>
            <MiniFractionBar numerator={4} denominator={5} tone="emerald" label="มีอยู่ 4 ส่วน" className="mt-3" />
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-center">
            <StepBadge>ขั้นที่ 2 เอาออก 2/5</StepBadge>
            <CrossOutBar filled={4} removed={2} denominator={5} className="mt-4" />
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-center">
            <StepBadge>ขั้นที่ 3 เหลือ 2/5</StepBadge>
            <MiniFractionBar numerator={2} denominator={5} tone="emerald" label="เหลือ 2 ส่วน" className="mt-3" />
          </div>
        </div>

        <p className="mt-4 rounded-xl bg-lime-50 px-4 py-3 text-center text-sm font-bold text-emerald-700">
          ตัวส่วนเท่ากัน ลบเฉพาะตัวเศษ ตัวส่วนคงเดิม
        </p>
      </div>
    </Card>
  );
}

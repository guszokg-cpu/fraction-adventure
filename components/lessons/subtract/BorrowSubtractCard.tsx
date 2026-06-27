import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader, StepBadge } from "@/components/lessons/subtract/SubtractMath";

export function BorrowSubtractCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={6} title="กรณีต้องยืม" />
      <div className="p-4">
        <div className="text-center text-2xl font-extrabold text-slate-950">
          2 <FractionStack top={1} bottom={4} /> <span className="mx-2">-</span> 1{" "}
          <FractionStack top={3} bottom={4} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-white p-3 text-center ring-1 ring-emerald-100">
            <StepBadge>ยืม 1 จาก 2</StepBadge>
            <div className="mt-4 text-xl font-extrabold text-brand-900">
              2 <FractionStack top={1} bottom={4} /> → 1 <FractionStack top={5} bottom={4} />
            </div>
          </div>
          <div className="rounded-xl bg-white p-3 text-center ring-1 ring-emerald-100">
            <StepBadge>ค่อยลบส่วน</StepBadge>
            <div className="mt-4 text-xl font-extrabold text-brand-900">
              <FractionStack top={5} bottom={4} /> - <FractionStack top={3} bottom={4} /> ={" "}
              <FractionStack top={2} bottom={4} />
            </div>
          </div>
          <div className="rounded-xl bg-white p-3 text-center ring-1 ring-emerald-100">
            <StepBadge>ตอบ</StepBadge>
            <div className="mt-4 text-3xl font-extrabold text-emerald-700">
              <FractionStack top={2} bottom={4} /> = <FractionStack top={1} bottom={2} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

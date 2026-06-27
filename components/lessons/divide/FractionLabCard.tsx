import { Card } from "@/components/ui/Card";
import { FractionStack, MiniFractionBar, SectionHeader, SegmentBar, StepBadge } from "@/components/lessons/divide/DivideMath";

export function FractionLabCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={2} title="ห้องทดลองเศษส่วน" />
      <div className="p-4">
        <div className="text-center text-2xl font-extrabold text-slate-950">
          <FractionStack top={1} bottom={2} /> ÷ <FractionStack top={1} bottom={4} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-violet-50 p-3 text-center">
            <StepBadge>ขั้นที่ 1</StepBadge>
            <MiniFractionBar numerator={1} denominator={2} tone="pink" label={<span className="inline-flex items-center gap-1">มี <FractionStack top={1} bottom={2} className="text-xs" /></span>} className="mt-3" />
          </div>
          <div className="rounded-xl bg-violet-50 p-3 text-center">
            <StepBadge>ขั้นที่ 2</StepBadge>
            <div className="mt-4">
              <SegmentBar filled={2} denominator={4} />
            </div>
            <p className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-slate-600">เอา <FractionStack top={1} bottom={4} className="text-xs" /> มาวางทาบ</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-center">
            <StepBadge>ขั้นที่ 3</StepBadge>
            <div className="mt-4 text-4xl font-extrabold text-emerald-700">2 ชิ้น</div>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-violet-50 px-4 py-3 text-center text-lg font-extrabold text-violet-700">
          ใน <FractionStack top={1} bottom={2} /> มี <FractionStack top={1} bottom={4} /> อยู่ 2 ชิ้น ตอบ 2
        </div>
      </div>
    </Card>
  );
}

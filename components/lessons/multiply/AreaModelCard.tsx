import { Card } from "@/components/ui/Card";
import { AreaModelGrid, FractionStack, SectionHeader, StepBadge } from "@/components/lessons/multiply/MultiplyMath";

export function AreaModelCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={2} title="พื้นที่ซ้อนกัน Area Model" />
      <div className="grid gap-5 p-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-3 text-center text-2xl font-extrabold text-slate-950">
            <FractionStack top={2} bottom={3} /> × <FractionStack top={3} bottom={4} />
          </div>
          <AreaModelGrid />
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs font-extrabold">
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-sky-700">สีฟ้า = <FractionStack top={2} bottom={3} className="text-xs" /></span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-700">สีส้ม = <FractionStack top={3} bottom={4} className="text-xs" /></span>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-700">สีม่วง = พื้นที่ซ้อน</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl bg-white p-4 ring-1 ring-orange-100">
            <StepBadge>นับพื้นที่ซ้อน</StepBadge>
            <div className="mt-3 text-3xl font-extrabold text-orange-600">6 ช่อง</div>
            <p className="mt-1 text-sm font-bold text-slate-600">จากทั้งหมด 12 ช่อง</p>
          </div>
          <div className="rounded-xl bg-orange-50 p-4 text-center text-2xl font-extrabold text-orange-700">
            <FractionStack top={6} bottom={12} /> = <FractionStack top={1} bottom={2} />
          </div>
        </div>
      </div>
    </Card>
  );
}

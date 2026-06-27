import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader, SegmentBar } from "@/components/lessons/divide/DivideMath";

export function WhyFlipCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={4} title="ทำไมต้องกลับเศษส่วน?" />
      <div className="grid gap-4 p-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-4 ring-1 ring-violet-100">
          <div className="text-center text-lg font-extrabold text-brand-900">เข้าใจจากภาพ</div>
          <div className="mt-4">
            <SegmentBar filled={2} denominator={4} />
          </div>
          <p className="mt-3 text-center text-sm font-bold text-slate-600">
            ใน 1/2 มี 1/4 อยู่ 2 ครั้ง
          </p>
        </div>
        <div className="rounded-xl bg-violet-50 p-4 text-center ring-1 ring-violet-100">
          <div className="text-lg font-extrabold text-brand-900">เทียบกับสูตร</div>
          <div className="mt-4 text-2xl font-extrabold text-violet-700">
            <FractionStack top={1} bottom={2} /> × <FractionStack top={4} bottom={1} /> = 2
          </div>
          <p className="mt-3 text-sm font-bold text-slate-600">ไม่ได้จำสูตรอย่างเดียว แต่เข้าใจจากภาพก่อน</p>
        </div>
      </div>
    </Card>
  );
}

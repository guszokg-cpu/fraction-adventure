import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader, SegmentBar } from "@/components/lessons/divide/DivideMath";

export function LiveExperimentCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={7} title="เครื่องทดลองสด" />
      <div className="p-4">
        <div className="text-center text-2xl font-extrabold text-slate-950">
          <FractionStack top={3} bottom={4} /> ÷ <FractionStack top={1} bottom={8} />
        </div>
        <div className="mt-4">
          <SegmentBar filled={6} denominator={8} />
        </div>
        <div className="mt-4 rounded-xl bg-violet-50 px-4 py-3 text-center text-xl font-extrabold text-violet-700">
          ใน <FractionStack top={3} bottom={4} /> มี <FractionStack top={1} bottom={8} /> อยู่ 6 ชิ้น ตอบ 6
        </div>
      </div>
    </Card>
  );
}

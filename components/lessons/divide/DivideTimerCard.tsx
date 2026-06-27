import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/lessons/divide/DivideMath";

export function DivideTimerCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={10} title="เกมจับเวลา 60 วินาที" />
      <div className="p-4 text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-4 border-violet-400 bg-white text-3xl font-extrabold text-brand-900 shadow-inner">
          60
        </div>
        <div className="mt-3 text-sm font-bold text-slate-600">หารให้ไว เก็บรางวัลบทที่ 13</div>
        <button className="mt-4 rounded-xl bg-violet-600 px-5 py-2 text-sm font-extrabold text-white hover:bg-violet-700">
          เริ่มเกม
        </button>
      </div>
    </Card>
  );
}

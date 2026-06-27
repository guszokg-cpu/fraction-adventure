import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/lessons/multiply/MultiplyMath";

export function MultiplyTimerCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={9} title="เกมจับเวลา 60 วินาที" />
      <div className="p-4 text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-4 border-orange-400 bg-white text-3xl font-extrabold text-brand-900 shadow-inner">
          60
        </div>
        <div className="mt-3 text-sm font-bold text-slate-600">คูณให้ไว แล้วสะสมถ้วยรางวัล</div>
        <div className="mt-3 inline-flex rounded-xl bg-orange-50 px-4 py-2 text-lg font-extrabold text-orange-700">
          คะแนนปัจจุบัน 8/10 🏆
        </div>
      </div>
    </Card>
  );
}

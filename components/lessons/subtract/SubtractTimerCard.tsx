import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/lessons/subtract/SubtractMath";

export function SubtractTimerCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={9} title="เกมจับเวลา 60 วินาที" />
      <div className="p-4 text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-4 border-sky-400 bg-white text-3xl font-extrabold text-brand-900 shadow-inner">
          60
        </div>
        <div className="mt-3 text-sm font-bold text-slate-600">ตอบให้ไว เก็บคะแนนดาว</div>
        <div className="mt-3 inline-flex rounded-xl bg-emerald-50 px-4 py-2 text-lg font-extrabold text-emerald-700">
          คะแนนปัจจุบัน 7/10 ⭐
        </div>
      </div>
    </Card>
  );
}

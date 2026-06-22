import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { toPercent } from "@/lib/progress";
import type { LessonMissionItem } from "@/types/lessonContent";

type LessonMissionCardProps = {
  missions: LessonMissionItem[];
};

export function LessonMissionCard({ missions }: LessonMissionCardProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between bg-gradient-to-r from-brand-700 to-violet-600 px-5 py-4 text-white">
        <h2 className="text-xl font-extrabold">ภารกิจหน้านี้</h2>
        <span className="text-2xl">🎯</span>
      </div>
      <div className="space-y-4 p-5">
        {missions.map((mission) => (
          <div key={mission.id} className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-50 text-2xl">{mission.icon}</div>
            <div className="flex-1">
              <div className="flex justify-between gap-3 text-sm font-extrabold text-slate-700">
                <span>{mission.title}</span>
                <span className="text-brand-700">
                  {mission.current}/{mission.target}
                </span>
              </div>
              <ProgressBar value={toPercent(mission.current, mission.target)} className="mt-2 h-2" />
            </div>
          </div>
        ))}
        <button className="flex w-full items-center justify-center gap-1 text-sm font-extrabold text-brand-600 hover:text-brand-700">
          ดูภารกิจทั้งหมด
          <ChevronRight size={16} />
        </button>
      </div>
    </Card>
  );
}

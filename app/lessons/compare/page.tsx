import { AppShell } from "@/components/layout/AppShell";
import { CompareContent } from "@/components/lessons/compare/CompareContent";
import { CompareTipsPanel } from "@/components/lessons/compare/CompareTipsPanel";
import { LessonMissionCard } from "@/components/lessons/LessonMissionCard";
import { compareMissions } from "@/data/lessonCompare";

export default function ComparePage() {
  return (
    <AppShell
      title="เปรียบเทียบเศษส่วน"
      eyebrow="Lesson 6"
      description="รู้ว่าใครมากกว่า ใครน้อยกว่า หรือเท่ากัน"
      activePath="/lessons/compare"
      aside={
        <div className="space-y-4">
          <CompareTipsPanel />
          <LessonMissionCard missions={compareMissions} />
        </div>
      }
    >
      <CompareContent />
    </AppShell>
  );
}

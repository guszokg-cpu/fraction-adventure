import { AppShell } from "@/components/layout/AppShell";
import { NumberLineContent } from "@/components/lessons/number-line/NumberLineContent";
import { LessonMissionCard } from "@/components/lessons/LessonMissionCard";
import { LessonTipsCard } from "@/components/lessons/LessonTipsCard";
import { numberLineExamples, numberLineMissions, numberLineTips } from "@/data/lessonNumberLine";

export default function NumberLinePage() {
  return (
    <AppShell
      title="เศษส่วนบนเส้นจำนวน"
      eyebrow="Lesson 5"
      description="ระบุและวางตำแหน่งเศษส่วนบนเส้นจำนวน"
      activePath="/lessons/number-line"
      aside={
        <div className="space-y-4">
          <LessonTipsCard tips={numberLineTips} examples={numberLineExamples} />
          <LessonMissionCard missions={numberLineMissions} />
        </div>
      }
    >
      <NumberLineContent />
    </AppShell>
  );
}

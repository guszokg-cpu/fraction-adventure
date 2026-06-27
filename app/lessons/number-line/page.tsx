import { AppShell } from "@/components/layout/AppShell";
import { NumberLineContent } from "@/components/lessons/number-line/NumberLineContent";
import { LessonMissionCard } from "@/components/lessons/LessonMissionCard";
import { LessonTipsCard } from "@/components/lessons/LessonTipsCard";
import { numberLineExamples, numberLineMeta, numberLineMissions, numberLineTips } from "@/data/lessonNumberLine";

export default function NumberLinePage() {
  return (
    <AppShell
      title="เศษส่วนบนเส้นจำนวน"
      eyebrow="Lesson 4"
      description="ระบุและวางตำแหน่งเศษส่วนบนเส้นจำนวน"
      activePath="/lessons/number-line"
      heroImage={numberLineMeta.heroImage}
      themeColor={numberLineMeta.themeColor}
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

import { AppShell } from "@/components/layout/AppShell";
import { NumberLineContent } from "@/components/lessons/number-line/NumberLineContent";
import { LessonMissionCard } from "@/components/lessons/LessonMissionCard";
import { LessonTipsCard } from "@/components/lessons/LessonTipsCard";
import { LessonTipsImageWrapper } from "@/components/lessons/shared/LessonTipsImageWrapper";
import { LessonWorksheetsPanel } from "@/components/lessons/shared/LessonWorksheetsPanel";
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
          <LessonTipsImageWrapper lessonSlug="number-line">
            <LessonTipsCard tips={numberLineTips} examples={numberLineExamples} />
          </LessonTipsImageWrapper>
          <LessonMissionCard missions={numberLineMissions} />
          <LessonWorksheetsPanel lessonSlug="number-line" />
        </div>
      }
    >
      <NumberLineContent />
    </AppShell>
  );
}

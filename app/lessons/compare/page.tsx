import { AppShell } from "@/components/layout/AppShell";
import { CompareContent } from "@/components/lessons/compare/CompareContent";
import { CompareTipsPanel } from "@/components/lessons/compare/CompareTipsPanel";
import { LessonTipsImageWrapper } from "@/components/lessons/shared/LessonTipsImageWrapper";
import { LessonWorksheetsPanel } from "@/components/lessons/shared/LessonWorksheetsPanel";
import { compareMeta } from "@/data/lessonCompare";

export default function ComparePage() {
  return (
    <AppShell
      title="เปรียบเทียบเศษส่วน"
      eyebrow="Lesson 5"
      description="รู้ว่าใครมากกว่า ใครน้อยกว่า หรือเท่ากัน"
      activePath="/lessons/compare"
      heroImage={compareMeta.heroImage}
      themeColor={compareMeta.themeColor}
      aside={
        <div className="space-y-4">
          <LessonTipsImageWrapper lessonSlug="compare">
            <CompareTipsPanel />
          </LessonTipsImageWrapper>
          <LessonWorksheetsPanel lessonSlug="compare" />
        </div>
      }
    >
      <CompareContent />
    </AppShell>
  );
}

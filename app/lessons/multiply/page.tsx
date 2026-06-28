import { AppShell } from "@/components/layout/AppShell";
import { MultiplyLessonContent } from "@/components/lessons/multiply/MultiplyLessonContent";
import { MultiplyTipsPanel } from "@/components/lessons/multiply/MultiplyTipsPanel";
import { LessonTipsImageWrapper } from "@/components/lessons/shared/LessonTipsImageWrapper";
import { LessonWorksheetsPanel } from "@/components/lessons/shared/LessonWorksheetsPanel";
import { multiplyLessonMeta } from "@/data/lessonMultiply";

export default function MultiplyPage() {
  return (
    <AppShell
      title="คูณเศษส่วน"
      eyebrow="Lesson 11"
      description="การคูณคือการหา 'ส่วนของส่วน'"
      activePath="/lessons/multiply"
      heroImage={multiplyLessonMeta.heroImage}
      themeColor={multiplyLessonMeta.themeColor}
      aside={
        <div className="space-y-4">
          <LessonTipsImageWrapper lessonSlug="multiply">
            <MultiplyTipsPanel />
          </LessonTipsImageWrapper>
          <LessonWorksheetsPanel lessonSlug="multiply" />
        </div>
      }
    >
      <MultiplyLessonContent />
    </AppShell>
  );
}

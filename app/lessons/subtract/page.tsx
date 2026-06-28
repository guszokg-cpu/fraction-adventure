import { AppShell } from "@/components/layout/AppShell";
import { SubtractLessonContent } from "@/components/lessons/subtract/SubtractLessonContent";
import { SubtractTipsPanel } from "@/components/lessons/subtract/SubtractTipsPanel";
import { LessonTipsImageWrapper } from "@/components/lessons/shared/LessonTipsImageWrapper";
import { LessonWorksheetsPanel } from "@/components/lessons/shared/LessonWorksheetsPanel";
import { subtractLessonMeta } from "@/data/lessonSubtract";

export default function SubtractPage() {
  return (
    <AppShell
      title="ลบเศษส่วน"
      eyebrow="Lesson 10"
      description="การลบคือการเอาส่วนออก เหลือเท่าไร"
      activePath="/lessons/subtract"
      heroImage={subtractLessonMeta.heroImage}
      themeColor={subtractLessonMeta.themeColor}
      aside={
        <div className="space-y-4">
          <LessonTipsImageWrapper lessonSlug="subtract">
            <SubtractTipsPanel />
          </LessonTipsImageWrapper>
          <LessonWorksheetsPanel lessonSlug="subtract" />
        </div>
      }
    >
      <SubtractLessonContent />
    </AppShell>
  );
}

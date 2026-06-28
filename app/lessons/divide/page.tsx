import { AppShell } from "@/components/layout/AppShell";
import { DivideLessonContent } from "@/components/lessons/divide/DivideLessonContent";
import { DivideTipsPanel } from "@/components/lessons/divide/DivideTipsPanel";
import { LessonTipsImageWrapper } from "@/components/lessons/shared/LessonTipsImageWrapper";
import { LessonWorksheetsPanel } from "@/components/lessons/shared/LessonWorksheetsPanel";
import { divideLessonMeta } from "@/data/lessonDivide";

export default function DividePage() {
  return (
    <AppShell
      title="หารเศษส่วน"
      eyebrow="Lesson 12"
      description="การหารคือการถามว่า มีอยู่เท่านี้ แบ่งได้กี่กลุ่ม"
      activePath="/lessons/divide"
      heroImage={divideLessonMeta.heroImage}
      themeColor={divideLessonMeta.themeColor}
      aside={
        <div className="space-y-4">
          <LessonTipsImageWrapper lessonSlug="divide">
            <DivideTipsPanel />
          </LessonTipsImageWrapper>
          <LessonWorksheetsPanel lessonSlug="divide" />
        </div>
      }
    >
      <DivideLessonContent />
    </AppShell>
  );
}

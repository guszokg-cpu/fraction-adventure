import { AppShell } from "@/components/layout/AppShell";
import { ReadWriteContent } from "@/components/lessons/read-write/ReadWriteContent";
import { LessonTipsCard } from "@/components/lessons/LessonTipsCard";
import { LessonTipsImageWrapper } from "@/components/lessons/shared/LessonTipsImageWrapper";
import { LessonWorksheetsPanel } from "@/components/lessons/shared/LessonWorksheetsPanel";
import { readWriteExamples, readWriteMeta, readWriteTips } from "@/data/lessonReadWrite";

export default function ReadWritePage() {
  return (
    <AppShell
      title="ประเภทของเศษส่วน"
      eyebrow="Lesson 2"
      description="เรียนรู้เศษส่วนแท้ เศษเกิน และจำนวนคละ"
      activePath="/lessons/read-write"
      heroImage={readWriteMeta.heroImage}
      themeColor={readWriteMeta.themeColor}
      aside={
        <div className="space-y-4">
          <LessonTipsImageWrapper lessonSlug="read-write">
            <LessonTipsCard tips={readWriteTips} examples={readWriteExamples} />
          </LessonTipsImageWrapper>
          <LessonWorksheetsPanel lessonSlug="read-write" />
        </div>
      }
    >
      <ReadWriteContent />
    </AppShell>
  );
}

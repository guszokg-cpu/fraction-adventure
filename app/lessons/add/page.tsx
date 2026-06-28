import { AppShell } from "@/components/layout/AppShell";
import { AddLessonContent } from "@/components/lessons/add/AddLessonContent";
import { AddTipsPanel } from "@/components/lessons/add/AddTipsPanel";
import { LessonTipsImageWrapper } from "@/components/lessons/shared/LessonTipsImageWrapper";
import { LessonWorksheetsPanel } from "@/components/lessons/shared/LessonWorksheetsPanel";
import { addLessonMeta } from "@/data/lessonAdd";

export default function AddPage() {
  return (
    <AppShell
      title="บวกเศษส่วน"
      eyebrow="Lesson 9"
      description="การบวกคือการนำส่วนมารวมกัน"
      activePath="/lessons/add"
      heroImage={addLessonMeta.heroImage}
      themeColor={addLessonMeta.themeColor}
      aside={
        <div className="space-y-4">
          <LessonTipsImageWrapper lessonSlug="add">
            <AddTipsPanel />
          </LessonTipsImageWrapper>
          <LessonWorksheetsPanel lessonSlug="add" />
        </div>
      }
    >
      <AddLessonContent />
    </AppShell>
  );
}

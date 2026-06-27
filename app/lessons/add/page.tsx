import { AppShell } from "@/components/layout/AppShell";
import { AddLessonContent } from "@/components/lessons/add/AddLessonContent";
import { AddTipsPanel } from "@/components/lessons/add/AddTipsPanel";
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
      aside={<AddTipsPanel />}
    >
      <AddLessonContent />
    </AppShell>
  );
}

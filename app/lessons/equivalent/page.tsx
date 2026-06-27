import { AppShell } from "@/components/layout/AppShell";
import { EquivalentLessonContent } from "@/components/lessons/equivalent/EquivalentLessonContent";
import { EquivalentTipsPanel } from "@/components/lessons/equivalent/EquivalentTipsPanel";
import { equivalentLessonMeta } from "@/data/lessonEquivalent";

export default function EquivalentPage() {
  return (
    <AppShell
      title="เศษส่วนที่เท่ากัน"
      eyebrow="Lesson 6"
      description="เศษส่วนต่างรูป แต่มีค่าเท่ากัน"
      activePath="/lessons/equivalent"
      heroImage={equivalentLessonMeta.heroImage}
      themeColor={equivalentLessonMeta.themeColor}
      aside={<EquivalentTipsPanel />}
    >
      <EquivalentLessonContent />
    </AppShell>
  );
}

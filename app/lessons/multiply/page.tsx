import { AppShell } from "@/components/layout/AppShell";
import { MultiplyLessonContent } from "@/components/lessons/multiply/MultiplyLessonContent";
import { MultiplyTipsPanel } from "@/components/lessons/multiply/MultiplyTipsPanel";
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
      aside={<MultiplyTipsPanel />}
    >
      <MultiplyLessonContent />
    </AppShell>
  );
}

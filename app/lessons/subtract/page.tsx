import { AppShell } from "@/components/layout/AppShell";
import { SubtractLessonContent } from "@/components/lessons/subtract/SubtractLessonContent";
import { SubtractTipsPanel } from "@/components/lessons/subtract/SubtractTipsPanel";
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
      aside={<SubtractTipsPanel />}
    >
      <SubtractLessonContent />
    </AppShell>
  );
}

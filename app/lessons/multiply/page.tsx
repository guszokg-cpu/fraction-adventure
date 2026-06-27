import { AppShell } from "@/components/layout/AppShell";
import { MultiplyLessonContent } from "@/components/lessons/multiply/MultiplyLessonContent";
import { MultiplyTipsPanel } from "@/components/lessons/multiply/MultiplyTipsPanel";

export default function MultiplyPage() {
  return (
    <AppShell
      title="คูณเศษส่วน"
      eyebrow="บทเรียนที่ 12 จาก 14"
      description="การคูณคือการหา “ส่วนของส่วน”"
      activePath="/lessons/multiply"
      aside={<MultiplyTipsPanel />}
    >
      <MultiplyLessonContent />
    </AppShell>
  );
}

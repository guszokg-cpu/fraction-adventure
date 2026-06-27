import { AppShell } from "@/components/layout/AppShell";
import { EquivalentLessonContent } from "@/components/lessons/equivalent/EquivalentLessonContent";
import { EquivalentTipsPanel } from "@/components/lessons/equivalent/EquivalentTipsPanel";

export default function EquivalentPage() {
  return (
    <AppShell
      title="เศษส่วนที่เท่ากัน"
      eyebrow="บทเรียนที่ 7 จาก 14"
      description="เศษส่วนต่างรูป แต่มีค่าเท่ากัน"
      activePath="/lessons/equivalent"
      aside={<EquivalentTipsPanel />}
    >
      <EquivalentLessonContent />
    </AppShell>
  );
}

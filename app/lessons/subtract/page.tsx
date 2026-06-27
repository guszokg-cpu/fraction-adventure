import { AppShell } from "@/components/layout/AppShell";
import { SubtractLessonContent } from "@/components/lessons/subtract/SubtractLessonContent";
import { SubtractTipsPanel } from "@/components/lessons/subtract/SubtractTipsPanel";

export default function SubtractPage() {
  return (
    <AppShell
      title="ลบเศษส่วน"
      eyebrow="บทเรียนที่ 11 จาก 14"
      description="การลบคือการเอาส่วนออก เหลือเท่าไร"
      activePath="/lessons/subtract"
      aside={<SubtractTipsPanel />}
    >
      <SubtractLessonContent />
    </AppShell>
  );
}

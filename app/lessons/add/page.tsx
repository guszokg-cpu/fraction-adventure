import { AppShell } from "@/components/layout/AppShell";
import { AddLessonContent } from "@/components/lessons/add/AddLessonContent";
import { AddTipsPanel } from "@/components/lessons/add/AddTipsPanel";

export default function AddPage() {
  return (
    <AppShell
      title="บวกเศษส่วน"
      eyebrow="บทเรียนที่ 10 จาก 14"
      description="การบวกคือการนำส่วนมารวมกัน"
      activePath="/lessons/add"
      aside={<AddTipsPanel />}
    >
      <AddLessonContent />
    </AppShell>
  );
}

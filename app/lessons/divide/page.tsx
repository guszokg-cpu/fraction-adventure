import { AppShell } from "@/components/layout/AppShell";
import { DivideLessonContent } from "@/components/lessons/divide/DivideLessonContent";
import { DivideTipsPanel } from "@/components/lessons/divide/DivideTipsPanel";

export default function DividePage() {
  return (
    <AppShell
      title="หารเศษส่วน"
      eyebrow="บทเรียนที่ 13 จาก 14"
      description="การหารคือการถามว่า “มีอยู่เท่านี้ แบ่งได้กี่กลุ่ม”"
      activePath="/lessons/divide"
      aside={<DivideTipsPanel />}
    >
      <DivideLessonContent />
    </AppShell>
  );
}

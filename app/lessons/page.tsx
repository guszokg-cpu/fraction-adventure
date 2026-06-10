import { AppShell } from "@/components/layout/AppShell";
import { LessonGrid } from "@/components/learning/LessonGrid";

export default function LessonsPage() {
  return (
    <AppShell
      title="บทเรียนเศษส่วน"
      eyebrow="Lesson Library"
      description="เลือกบทเรียนตามเส้นทางการเรียนรู้"
      activePath="/lessons"
    >
      <LessonGrid />
    </AppShell>
  );
}

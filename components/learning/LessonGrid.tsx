import Link from "next/link";
import { CheckCircle, Lock, PlayCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { mockLessons } from "@/data/mockLessons";

export function LessonGrid() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {mockLessons.map((lesson) => (
        <Card key={lesson.id} className={lesson.status === "current" ? "ring-4 ring-accent-400/40" : ""}>
          <div className="flex items-start justify-between">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-4xl">{lesson.icon}</div>
            {lesson.status === "completed" && <CheckCircle className="text-emerald-500" />}
            {lesson.status === "current" && <PlayCircle className="text-accent-500" />}
            {lesson.status === "locked" && <Lock className="text-slate-400" />}
          </div>
          <div className="mt-4 text-sm font-extrabold text-brand-600">ด่าน {lesson.order}</div>
          <h3 className="mt-1 text-xl font-extrabold text-brand-900">{lesson.title}</h3>
          <p className="mt-1 min-h-12 text-sm font-medium text-slate-600">{lesson.subtitle}</p>
          <div className="mt-4 flex items-center justify-between text-sm font-bold">
            <span>{lesson.gradeRange}</span>
            <span>{"⭐".repeat(lesson.stars)}{"☆".repeat(3 - lesson.stars)}</span>
          </div>
          <ProgressBar value={lesson.progress} className="mt-3 h-2" />
          <Link
            href="/lessons"
            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-brand-600 text-sm font-extrabold text-white"
          >
            {lesson.status === "locked" ? "ยังไม่ปลดล็อก" : "เปิดบทเรียน"}
          </Link>
        </Card>
      ))}
    </div>
  );
}

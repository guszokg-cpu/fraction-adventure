import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { mockLessons } from "@/data/mockLessons";

const LESSON_HREFS: Record<string, string> = {
  "intro-fraction": "/lessons/fraction-intro",
  "read-write": "/lessons/read-write",
  "picture-fraction": "/lessons/fraction-from-image",
  "number-line": "/lessons/number-line",
  "compare": "/lessons/compare",
  "equivalent": "/lessons/equivalent",
  "simplify-expand": "/lessons/simplify-expand",
  "mixed-improper": "/lessons/mixed-improper",
  "add-fractions": "/lessons/add",
  "subtract-fractions": "/lessons/subtract",
  "multiply-fractions": "/lessons/multiply",
  "divide-fractions": "/lessons/divide",
};

export function LessonGrid() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {mockLessons.map((lesson) => {
        const href = LESSON_HREFS[lesson.id] ?? "/lessons";

        return (
          <Card key={lesson.id}>
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-4xl">{lesson.icon}</div>
            <div className="mt-4 text-sm font-extrabold text-brand-600">ด่าน {lesson.order}</div>
            <h3 className="mt-1 text-xl font-extrabold text-brand-900">{lesson.title}</h3>
            <p className="mt-1 min-h-12 text-sm font-medium text-slate-600">{lesson.subtitle}</p>
            <div className="mt-3 text-sm font-bold text-slate-500">{lesson.gradeRange}</div>
            <Link
              href={href}
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-brand-600 text-sm font-extrabold text-white transition hover:bg-brand-700"
            >
              เปิดบทเรียน
            </Link>
          </Card>
        );
      })}
    </div>
  );
}

import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { mockLessons } from "@/data/mockLessons";

const lessonHref: Record<string, string> = {
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

export function ContinueLessonCard() {
  const lesson = mockLessons.find((l) => l.status === "current");
  if (!lesson) return null;

  const href = lessonHref[lesson.id] ?? "#";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl shadow-sky-100/80">
      {/* Faint background icon */}
      <div className="pointer-events-none absolute right-56 top-0 select-none text-[180px] leading-none opacity-[0.035]">
        {lesson.icon}
      </div>

      {/* Header strip */}
      <div className="border-b border-sky-50 bg-sky-50/70 px-6 py-2.5">
        <span className="text-sm font-extrabold text-sky-700">🎯 เรียนต่อจากครั้งล่าสุด</span>
      </div>

      <div className="flex items-center gap-6 px-6 py-5">
        {/* Lesson icon box */}
        <div className="grid h-28 w-28 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 text-6xl shadow-inner ring-4 ring-amber-100/80">
          {lesson.icon}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-600 px-3 py-0.5 text-sm font-extrabold text-white shadow-sm">
              ด่าน {lesson.order}
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-brand-900">{lesson.title}</h2>
          <p className="mt-0.5 text-sm font-bold text-slate-500">{lesson.subtitle}</p>
          <div className="mt-3 max-w-[280px]">
            <div className="mb-1.5 flex items-center justify-between text-xs font-extrabold">
              <span className="text-slate-500">ความคืบหน้า</span>
              <span className="text-brand-700">{lesson.progress}%</span>
            </div>
            <ProgressBar value={lesson.progress} className="h-2.5" />
          </div>
        </div>

        {/* Balloon mascot + CTA */}
        <div className="flex shrink-0 flex-col items-center gap-2">
          <div className="relative select-none">
            <div className="text-6xl">🎈</div>
            <div className="-mt-3 text-4xl">🐰</div>
          </div>
          <Link href={href}>
            <button className="flex h-12 items-center gap-2 rounded-xl bg-amber-400 px-5 font-extrabold text-amber-900 shadow-md shadow-amber-200 transition hover:-translate-y-0.5 hover:bg-amber-500 active:translate-y-0">
              <PlayCircle size={20} />
              เริ่มเรียนต่อ
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

import { CheckCircle, Lock, MapPin, PlayCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { mockLessons } from "@/data/mockLessons";
import { cn } from "@/lib/cn";
import type { Lesson } from "@/types/lesson";

const colorClasses: Record<Lesson["color"], string> = {
  sky: "bg-sky-50 border-sky-200",
  violet: "bg-violet-50 border-violet-200",
  green: "bg-emerald-50 border-emerald-200",
  amber: "bg-amber-50 border-amber-200",
  pink: "bg-pink-50 border-pink-200",
  slate: "bg-slate-50 border-slate-200"
};

const markerClasses: Record<Lesson["status"], string> = {
  completed: "bg-emerald-500 text-white",
  current: "bg-accent-400 text-brand-900",
  locked: "bg-slate-300 text-slate-600"
};

export function LearningMap() {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100 p-6">
      <div className="absolute inset-x-8 top-1/2 hidden h-2 -translate-y-1/2 rounded-full bg-white/70 xl:block" />
      <div className="absolute bottom-6 left-8 text-5xl">🏝️</div>
      <div className="absolute right-8 top-8 text-5xl">🎈</div>

      <div className="relative mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-900">Learning Map</h2>
          <p className="text-sm font-bold text-slate-600">ผ่านด่าน 1-7 แล้ว ด่าน 8 กำลังเรียน</p>
        </div>
        <div className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-brand-700 shadow-sm">
          8 / 14 ด่าน
        </div>
      </div>

      <div className="relative grid grid-cols-7 gap-4">
        {mockLessons.map((lesson) => (
          <article
            key={lesson.id}
            className={cn(
              "relative min-h-[168px] rounded-2xl border p-4 text-center shadow-md shadow-sky-900/5 transition",
              colorClasses[lesson.color],
              lesson.status === "current" && "scale-[1.04] border-accent-400 bg-white shadow-xl shadow-accent-400/25 ring-4 ring-accent-400/30",
              lesson.status === "locked" && "opacity-80"
            )}
          >
            {lesson.status === "current" && (
              <div className="absolute -right-3 -top-5 text-4xl">
                <MapPin className="fill-accent-400 text-accent-500 drop-shadow" size={42} />
              </div>
            )}
            <div className={cn("mx-auto grid h-9 w-9 place-items-center rounded-full text-sm font-extrabold", markerClasses[lesson.status])}>
              {lesson.order}
            </div>
            <div className="mt-3 grid h-14 place-items-center text-4xl font-extrabold text-brand-900">{lesson.icon}</div>
            <h3 className="mt-2 min-h-10 text-sm font-extrabold leading-tight text-brand-900">{lesson.title}</h3>
            <div className="mt-2 flex items-center justify-center gap-1 text-lg">
              {"⭐".repeat(lesson.stars)}
              <span className="text-slate-300">{"★".repeat(3 - lesson.stars)}</span>
            </div>
            <div className="mt-2 flex justify-center">
              {lesson.status === "completed" && <CheckCircle className="text-emerald-500" size={22} />}
              {lesson.status === "current" && <PlayCircle className="text-accent-500" size={24} />}
              {lesson.status === "locked" && <Lock className="text-slate-400" size={22} />}
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}

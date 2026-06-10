import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { mockLessons } from "@/data/mockLessons";

export function ContinueLessonCard() {
  const currentLesson = mockLessons.find((lesson) => lesson.status === "current");

  if (!currentLesson) {
    return null;
  }

  return (
    <Card className="relative overflow-hidden border-sky-100 bg-white/95 p-0">
      <div className="absolute right-8 top-6 text-8xl opacity-10">{currentLesson.icon}</div>
      <div className="grid grid-cols-[140px_1fr_190px] items-center gap-6 p-6">
        <div className="grid h-32 w-32 place-items-center rounded-full bg-sky-100 text-6xl ring-8 ring-white">
          {currentLesson.icon}
        </div>
        <div>
          <div className="mb-2 inline-flex rounded-full bg-brand-600 px-4 py-1 text-sm font-extrabold text-white">
            ด่าน {currentLesson.order}
          </div>
          <h2 className="text-3xl font-extrabold text-brand-900">{currentLesson.title}</h2>
          <p className="mt-1 text-base font-bold text-slate-600">{currentLesson.subtitle}</p>
          <div className="mt-5 flex items-center gap-4">
            <div className="w-72">
              <div className="mb-2 flex justify-between text-sm font-extrabold text-slate-600">
                <span>ความคืบหน้า</span>
                <span>{currentLesson.progress}%</span>
              </div>
              <ProgressBar value={currentLesson.progress} />
            </div>
            <span className="text-xl">{"⭐".repeat(currentLesson.stars)}{"☆".repeat(3 - currentLesson.stars)}</span>
          </div>
        </div>
        <Button className="h-14 rounded-xl text-lg shadow-lg shadow-brand-600/20">
          <PlayCircle size={22} />
          เริ่มเรียนต่อ
        </Button>
      </div>
    </Card>
  );
}

import { Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";
import type { LessonMeta } from "@/types/lessonContent";

type LessonProgressHeaderProps = {
  meta: LessonMeta;
};

export function LessonProgressHeader({ meta }: LessonProgressHeaderProps) {
  const stars = Array.from({ length: meta.maxStars }, (_, i) => i < meta.stars);

  return (
    <Card className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="min-w-[260px] flex-1">
        <div className="flex items-center justify-between text-sm font-extrabold text-brand-700">
          <span>
            บทเรียนที่ {meta.order} จาก {meta.total}
          </span>
          <span>{meta.progress}%</span>
        </div>
        <ProgressBar value={meta.progress} className="mt-2" />
      </div>
      <div className="flex items-center gap-1.5">
        {stars.map((filled, i) => (
          <Star
            key={i}
            size={26}
            className={cn(filled ? "fill-accent-400 text-accent-400" : "fill-slate-200 text-slate-200")}
          />
        ))}
      </div>
    </Card>
  );
}

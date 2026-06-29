import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { LessonMeta } from "@/types/lessonContent";

type LessonProgressHeaderProps = {
  meta: LessonMeta;
  lessonSlug?: string;
};

export function LessonProgressHeader({ meta }: LessonProgressHeaderProps) {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="min-w-[260px] flex-1">
        <div className="flex items-center justify-between text-sm font-extrabold text-brand-700">
          <span>บทเรียนที่ {meta.order} จาก {meta.total}</span>
          <span>{meta.progress}%</span>
        </div>
        <ProgressBar value={meta.progress} className="mt-2" />
      </div>
    </Card>
  );
}

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { LessonMeta } from "@/types/lessonContent";

type LessonActionBarProps = {
  meta: LessonMeta;
};

export function LessonActionBar({ meta }: LessonActionBarProps) {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-3">
      <Link href={meta.prevHref}>
        <Button variant="secondary" className="border-rose-200 text-rose-600 hover:bg-rose-50">
          <ArrowLeft size={18} />
          ย้อนกลับ
        </Button>
      </Link>

      <Link href={meta.nextHref}>
        <Button className="bg-violet-600 hover:bg-violet-700">
          ไปต่อ: {meta.nextLabel}
          <ArrowRight size={18} />
        </Button>
      </Link>
    </Card>
  );
}

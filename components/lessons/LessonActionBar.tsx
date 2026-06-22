import Link from "next/link";
import { ArrowLeft, ArrowRight, PencilLine, Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { LessonMeta } from "@/types/lessonContent";

type LessonActionBarProps = {
  meta: LessonMeta;
  practiceCount?: number;
};

export function LessonActionBar({ meta, practiceCount = 5 }: LessonActionBarProps) {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-3">
      <Link href={meta.prevHref}>
        <Button variant="secondary" className="border-rose-200 text-rose-600 hover:bg-rose-50">
          <ArrowLeft size={18} />
          ย้อนกลับ
        </Button>
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        {/* ฝึกทำ และ บันทึกคะแนน จะเชื่อมต่อระบบจริงใน Phase ถัดไป (Exercises and Games) */}
        <Button>
          <PencilLine size={18} />
          ฝึกทำ {practiceCount} ข้อ
        </Button>
        <Button variant="success">
          <Save size={18} />
          บันทึกคะแนน
        </Button>
        <Link href={meta.nextHref}>
          <Button className="bg-violet-600 hover:bg-violet-700">
            ไปต่อ: {meta.nextLabel}
            <ArrowRight size={18} />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

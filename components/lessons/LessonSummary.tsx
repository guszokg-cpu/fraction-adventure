import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type Props = {
  points: ReactNode[];
  gradient?: string;
  mascot?: string;
};

/** การ์ดสรุปท้ายบท — ทบทวนสิ่งที่ได้เรียนเพื่อปิดบทเรียนอย่างมีความหมาย */
export function LessonSummary({
  points,
  gradient = "bg-gradient-to-r from-indigo-600 to-violet-500",
  mascot = "🎓",
}: Props) {
  return (
    <Card className="overflow-hidden p-0">
      <div className={cn("flex items-center gap-2 px-4 py-2.5 text-white", gradient)}>
        <span className="text-xl">{mascot}</span>
        <h2 className="text-lg font-extrabold">สรุปสิ่งที่ได้เรียนวันนี้</h2>
      </div>
      <ul className="grid gap-2 p-4 sm:grid-cols-2">
        {points.map((p, i) => (
          <li
            key={i}
            className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 ring-1 ring-slate-100"
          >
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={18} />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

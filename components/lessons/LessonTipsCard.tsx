import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import type { LessonExample, LessonTip } from "@/types/lessonContent";

type LessonTipsCardProps = {
  tips: LessonTip[];
  examples: LessonExample[];
};

export function LessonTipsCard({ tips, examples }: LessonTipsCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-brand-900">จำง่าย ๆ</h2>
        <Lightbulb className="text-accent-500" size={22} />
      </div>

      <ul className="mt-4 space-y-2.5">
        {tips.map((tip) => (
          <li key={tip.id} className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <span className="text-base">{tip.icon}</span>
            <span>{tip.text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 text-sm font-extrabold text-brand-600">ตัวอย่าง</div>
      <div className="mt-3 space-y-3">
        {examples.map((example) => (
          <div key={example.id} className="flex items-center gap-3 rounded-lg bg-brand-50/70 px-3 py-2">
            <FractionShape
              numerator={example.numerator}
              denominator={example.denominator}
              tone={example.tone}
              className="h-11 w-11"
            />
            <div className="inline-flex flex-col items-center text-2xl font-extrabold leading-none text-brand-900">
              <span>{example.numerator}</span>
              <span className="my-0.5 h-0.5 w-full min-w-[1.2rem] rounded-full bg-current" />
              <span>{example.denominator}</span>
            </div>
            <div className="text-sm font-bold text-slate-600">{example.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

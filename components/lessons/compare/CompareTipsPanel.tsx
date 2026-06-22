import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { compareTipCases } from "@/data/lessonCompare";

export function CompareTipsPanel() {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-brand-900">เทคนิคจำง่าย ๆ</h2>
        <Lightbulb className="text-accent-500" size={22} />
      </div>

      <div className="mt-4 space-y-3">
        {compareTipCases.map((item) => (
          <div key={item.id} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
            <div className="text-sm font-extrabold text-emerald-700">{item.title}</div>
            <p className="mt-1 text-xs font-bold leading-relaxed text-slate-600">{item.rule}</p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <StackedFraction
                numerator={item.left.numerator}
                denominator={item.left.denominator}
                className="text-lg"
                toneClassName="text-brand-900"
              />
              <span className="text-xl font-extrabold text-emerald-600">{item.sign}</span>
              <StackedFraction
                numerator={item.right.numerator}
                denominator={item.right.denominator}
                className="text-lg"
                toneClassName="text-brand-900"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs font-extrabold">
        <div className={cn("rounded-lg bg-rose-50 px-2 py-2 text-rose-600")}>ทางซ้าย = ค่าน้อยกว่า</div>
        <div className={cn("rounded-lg bg-emerald-50 px-2 py-2 text-emerald-700")}>ทางขวา = ค่ามากกว่า</div>
      </div>
    </Card>
  );
}

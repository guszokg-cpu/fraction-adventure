import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader } from "@/components/lessons/subtract/SubtractMath";

export function SubtractVisualCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={4} title="ภาพแสดงการลบ" />
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-center gap-5">
          <div className="text-center">
            <FractionShape numerator={3} denominator={4} shape="circle" tone="emerald" className="h-24 w-24" />
            <div className="mt-2 text-sm font-extrabold text-emerald-700">
              ก่อน: <FractionStack top={3} bottom={4} />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-brand-700">-</span>
          <div className="text-center">
            <FractionShape numerator={1} denominator={2} shape="circle" tone="pink" className="h-24 w-24" />
            <div className="mt-2 text-sm font-extrabold text-rose-600">
              เอาออก: <FractionStack top={1} bottom={2} />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-brand-700">→</span>
          <div className="text-center">
            <FractionShape numerator={1} denominator={4} shape="circle" tone="sky" className="h-24 w-24" />
            <div className="mt-2 text-sm font-extrabold text-sky-700">
              เหลือ: <FractionStack top={1} bottom={4} />
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-extrabold text-emerald-700">
          <FractionStack top={3} bottom={4} /> - <FractionStack top={1} bottom={2} /> ={" "}
          <FractionStack top={1} bottom={4} />
        </div>
      </div>
    </Card>
  );
}

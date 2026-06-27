import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader } from "@/components/lessons/add/FractionMath";

export function AddVisualModelCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={5} title="ซ้อนภาพพื้นที่รวม" />
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-center gap-5">
          <div className="text-center">
            <FractionShape numerator={1} denominator={2} shape="circle" tone="pink" className="h-28 w-28" />
            <div className="mt-2 text-sm font-extrabold text-pink-600">
              สีชมพู = <FractionStack top={1} bottom={2} />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-brand-700">+</span>
          <div className="text-center">
            <FractionShape numerator={1} denominator={3} shape="circle" tone="emerald" className="h-28 w-28" />
            <div className="mt-2 text-sm font-extrabold text-emerald-700">
              สีเขียว = <FractionStack top={1} bottom={3} />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-brand-700">=</span>
          <div className="text-center">
            <FractionShape numerator={5} denominator={6} shape="circle" tone="violet" className="h-28 w-28" />
            <div className="mt-2 text-sm font-extrabold text-violet-700">
              พื้นที่รวม = <FractionStack top={5} bottom={6} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

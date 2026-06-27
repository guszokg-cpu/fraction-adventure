import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader } from "@/components/lessons/equivalent/EquivalentMath";

const examples = [
  { id: "circle", title: "วงกลม", numerator: 1, denominator: 2, shape: "circle" as const },
  { id: "bar", title: "แท่ง", numerator: 2, denominator: 4, shape: "bar" as const },
  { id: "grid", title: "ตาราง", numerator: 4, denominator: 8, shape: "grid" as const }
];

export function EquivalentVisualCompareCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={2} title="เปรียบเทียบด้วยภาพหลายแบบ" />
      <div className="grid gap-4 p-4 md:grid-cols-3">
        {examples.map((example) => (
          <div key={example.id} className="rounded-xl bg-white p-4 text-center ring-1 ring-teal-100">
            <FractionShape
              numerator={example.numerator}
              denominator={example.denominator}
              shape={example.shape}
              tone="violet"
              className="mx-auto h-28 w-32"
            />
            <div className="mt-3 text-sm font-bold text-slate-500">{example.title}</div>
            <div className="flex justify-center text-3xl font-extrabold text-violet-700">
              <FractionStack top={example.numerator} bottom={example.denominator} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

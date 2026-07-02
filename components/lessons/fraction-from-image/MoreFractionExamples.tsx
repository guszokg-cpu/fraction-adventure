import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import type { FractionShapeKind, FractionTone } from "@/types/lessonContent";

type Example = {
  label: string;
  shape: FractionShapeKind;
  tone: FractionTone;
  numerator: number;
  denominator: number;
  shapeClassName: string;
};

const EXAMPLES: Example[] = [
  { label: "ตัวอย่าง A", shape: "bar", tone: "violet", numerator: 2, denominator: 5, shapeClassName: "h-16 w-48" },
  { label: "ตัวอย่าง B", shape: "grid", tone: "sky", numerator: 6, denominator: 8, shapeClassName: "h-32 w-32" },
  { label: "ตัวอย่าง C", shape: "circle", tone: "accent", numerator: 1, denominator: 6, shapeClassName: "h-32 w-32" },
];

export function MoreFractionExamples() {
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-xl font-extrabold text-brand-900">
        <span>⭐</span> ลองดูตัวอย่างอื่น
      </h3>

      <div className="grid gap-5 md:grid-cols-3">
        {EXAMPLES.map((ex) => (
          <Card key={ex.label} className="rounded-2xl border-slate-200 text-center">
            <div className="mb-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-extrabold text-slate-600">
              {ex.label}
            </div>
            <div className="flex justify-center">
              <FractionShape
                numerator={ex.numerator}
                denominator={ex.denominator}
                shape={ex.shape}
                tone={ex.tone}
                className={ex.shapeClassName}
              />
            </div>
            <div className="mt-4 space-y-1 text-sm font-bold text-slate-600">
              <p>ส่วนทั้งหมด = {ex.denominator} ส่วน</p>
              <p>ส่วนที่ระบายสี = {ex.numerator} ส่วน</p>
            </div>
            <div className="mt-4 flex justify-center">
              <FractionText numerator={ex.numerator} denominator={ex.denominator} className="text-4xl" toneClassName="text-brand-800" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

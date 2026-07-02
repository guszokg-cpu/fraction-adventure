import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack } from "@/components/fractions/FractionStack";
import type { FractionShapeKind, FractionTone } from "@/types/lessonContent";

type Row = { shape: FractionShapeKind; tone: FractionTone; n: number; d: number; text: string };

const ROWS: Row[] = [
  { shape: "circle", tone: "accent", n: 1, d: 4, text: "ทุกส่วนมีขนาดเท่ากัน จึงเขียนเป็นเศษส่วนได้" },
  { shape: "bar", tone: "emerald", n: 2, d: 5, text: "แต่ละช่องมีขนาดเท่ากัน จึงนับส่วนที่ระบายได้" },
];

export function EqualPartsCorrectExamples() {
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-xl font-extrabold text-emerald-700">
        <CheckCircle2 size={22} className="text-emerald-500" />
        ตัวอย่างที่ถูกต้อง
      </h3>

      {ROWS.map((row, i) => (
        <Card key={i} className="rounded-2xl border-emerald-100 bg-emerald-50/30">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <FractionShape
              numerator={row.n}
              denominator={row.d}
              shape={row.shape}
              tone={row.tone}
              className={row.shape === "bar" ? "h-14 w-44 shrink-0" : "h-24 w-24 shrink-0"}
            />
            <div className="text-4xl font-extrabold leading-none text-emerald-700">
              <FractionStack top={row.n} bottom={row.d} />
            </div>
            <p className="flex-1 text-center text-base font-bold text-slate-600 sm:text-left">{row.text}</p>
            <CheckCircle2 size={28} className="shrink-0 text-emerald-500" />
          </div>
        </Card>
      ))}
    </div>
  );
}

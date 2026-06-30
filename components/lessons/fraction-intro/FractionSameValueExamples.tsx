import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack } from "@/components/fractions/FractionStack";
import type { FractionShapeKind, FractionTone } from "@/types/lessonContent";

const ITEMS: { shape: FractionShapeKind; label: string; tone: FractionTone }[] = [
  { shape: "pizza", label: "พิซซ่า", tone: "accent" },
  { shape: "watermelon", label: "แตงโม", tone: "pink" },
  { shape: "chocolate", label: "ช็อกโกแลต", tone: "accent" },
  { shape: "grid", label: "ตาราง", tone: "violet" },
];

export function FractionSameValueExamples() {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
      <h3 className="text-lg font-extrabold text-brand-900">ภาพต่างกัน แต่เป็นเศษส่วนได้เหมือนกัน</h3>
      <p className="mt-1 text-sm font-bold text-slate-500">
        ถ้าเลือกจำนวนส่วนเท่ากัน จากจำนวนส่วนทั้งหมดเท่ากัน
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <div
            key={item.shape}
            className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-center"
          >
            <span className="rounded-full bg-violet-100 px-3 py-0.5 text-xs font-extrabold text-violet-700">3/4</span>
            <FractionShape
              numerator={3}
              denominator={4}
              shape={item.shape}
              tone={item.tone}
              className="my-2 h-20 w-20"
            />
            <div className="text-sm font-bold text-slate-600">{item.label}</div>
          </div>
        ))}
      </div>

      <p className="mt-4 flex flex-wrap items-center justify-center gap-1.5 rounded-xl bg-violet-50 px-4 py-3 text-center text-sm font-bold text-violet-700">
        ไม่ว่าจะเป็นรูปอะไร ถ้าเลือก 3 ส่วน จากทั้งหมด 4 ส่วนเท่ากัน เขียนเป็น
        <FractionStack top={3} bottom={4} className="text-base" />
        ได้เหมือนกัน
      </p>
    </section>
  );
}

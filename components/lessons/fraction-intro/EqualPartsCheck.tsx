import { FractionShape } from "@/components/fractions/FractionShape";
import { UnequalCircle } from "@/components/lessons/shared/UnequalShapes";

export function EqualPartsCheck() {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
      <h3 className="text-lg font-extrabold text-brand-900">ถูกหรือผิด? แบ่งเท่ากันไหม</h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {/* แบ่งเท่ากัน */}
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-sm font-extrabold text-emerald-700">
            <span>✅</span> แบ่งเท่ากัน
          </div>
          <FractionShape numerator={2} denominator={4} shape="circle" tone="sky" className="mx-auto my-3 h-24 w-24" />
          <p className="text-xs font-bold text-emerald-700">แต่ละส่วนเท่ากัน</p>
          <p className="text-[11px] font-bold text-slate-500">เขียนเป็นเศษส่วนได้</p>
        </div>

        {/* แบ่งไม่เท่ากัน */}
        <div className="rounded-xl border-2 border-rose-200 bg-rose-50/50 p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-sm font-extrabold text-rose-600">
            <span>❌</span> แบ่งไม่เท่ากัน
          </div>
          <UnequalCircle className="mx-auto my-3 h-24 w-24" />
          <p className="text-xs font-bold text-rose-600">แต่ละส่วนไม่เท่ากัน</p>
          <p className="text-[11px] font-bold text-slate-500">ยังเขียนเป็นเศษส่วนไม่ได้</p>
        </div>
      </div>
    </section>
  );
}

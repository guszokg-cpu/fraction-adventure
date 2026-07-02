import { Card } from "@/components/ui/Card";
import { FractionText } from "@/components/fractions/FractionText";

type Props = { numerator: number; denominator: number };

export function FractionObservationSummary({ numerator, denominator }: Props) {
  return (
    <Card className="rounded-2xl border-sky-100 bg-sky-50/40">
      <h3 className="flex items-center gap-2 text-xl font-extrabold text-brand-900">
        <span>🔍</span> สังเกตให้ดี
      </h3>

      <div className="mt-4 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <span className="text-2xl">💗</span>
          <p className="mt-1 text-sm font-bold text-slate-600">ตัวเศษเท่ากัน</p>
          <p className="text-2xl font-extrabold text-rose-500">{numerator} ส่วนที่ระบาย</p>
        </div>

        <span className="mx-auto text-2xl font-extrabold text-slate-300">+</span>

        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <span className="text-2xl">⚖️</span>
          <p className="mt-1 text-sm font-bold text-slate-600">ตัวส่วนเท่ากัน</p>
          <p className="text-2xl font-extrabold text-sky-600">{denominator} ส่วนทั้งหมด</p>
        </div>

        <span className="mx-auto text-2xl font-extrabold text-slate-300">=</span>

        <div className="rounded-2xl bg-emerald-50 p-4 text-center shadow-sm">
          <span className="text-2xl">✅</span>
          <p className="mt-1 text-sm font-bold text-emerald-700">ดังนั้นทุกภาพเขียนเป็น</p>
          <div className="mt-1 flex justify-center">
            <FractionText numerator={numerator} denominator={denominator} className="text-3xl" toneClassName="text-emerald-700" />
          </div>
          <p className="text-xs font-bold text-emerald-600">เหมือนกัน</p>
        </div>
      </div>
    </Card>
  );
}

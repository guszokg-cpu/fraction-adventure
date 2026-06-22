import { Lightbulb } from "lucide-react";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";

export function MixedTipsPanel() {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-brand-900">เทคนิคจำง่าย</h2>
        <Lightbulb className="text-accent-500" size={22} />
      </div>

      {/* เศษเกิน → จำนวนคละ */}
      <div className="mt-4 rounded-xl border border-pink-100 bg-pink-50/50 p-4">
        <div className="rounded-lg bg-pink-500 px-3 py-1 text-center text-sm font-extrabold text-white">
          เศษเกิน → จำนวนคละ
        </div>
        <p className="mt-2 text-xs font-bold text-slate-600">หารก่อน</p>
        <p className="mt-0.5 text-xs text-slate-500">ตัวอย่าง: 7/3</p>
        <div className="mt-2 space-y-1 text-sm font-bold text-pink-700">
          <p>7 ÷ 3 = 2 เศษ 1</p>
          <div className="flex items-center gap-1.5">
            <span>→</span>
            <FractionText numerator={7} denominator={3} className="text-base" toneClassName="text-pink-600" />
            <span>=</span>
            <span className="text-xl">2</span>
            <FractionText numerator={1} denominator={3} className="text-base" toneClassName="text-pink-600" />
          </div>
        </div>
      </div>

      {/* จำนวนคละ → เศษเกิน */}
      <div className="mt-3 rounded-xl border border-fuchsia-100 bg-fuchsia-50/50 p-4">
        <div className="rounded-lg bg-fuchsia-600 px-3 py-1 text-center text-sm font-extrabold text-white">
          จำนวนคละ → เศษเกิน
        </div>
        <p className="mt-2 text-xs font-bold text-slate-600">คูณก่อน บวกทีหลัง</p>
        <p className="mt-0.5 text-xs text-slate-500">ตัวอย่าง: 2 1/3</p>
        <div className="mt-2 space-y-1 text-sm font-bold text-fuchsia-700">
          <p>2 × 3 = 6</p>
          <p>6 + 1 = 7</p>
          <div className="flex items-center gap-1.5">
            <span>→</span>
            <span className="text-xl">2</span>
            <FractionText numerator={1} denominator={3} className="text-base" toneClassName="text-fuchsia-600" />
            <span>=</span>
            <FractionText numerator={7} denominator={3} className="text-base" toneClassName="text-fuchsia-600" />
          </div>
        </div>
      </div>

      {/* Bear mascot */}
      <div className="mt-4 flex items-center gap-3 rounded-xl bg-amber-50 p-3">
        <span className="text-3xl">🐻</span>
        <p className="text-xs font-bold leading-relaxed text-amber-700">
          ถ้าตัวเศษมากกว่าตัวส่วน แสดงว่ามากกว่า 1 หน่วยครับ!
        </p>
      </div>
    </Card>
  );
}

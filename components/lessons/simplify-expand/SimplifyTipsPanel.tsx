import { Lightbulb } from "lucide-react";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";

export function SimplifyTipsPanel() {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-brand-900">เทคนิคจำง่าย</h2>
        <Lightbulb className="text-accent-500" size={22} />
      </div>

      <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50/50 p-4">
        <div className="text-sm font-extrabold text-orange-600">ขยาย (คูณ)</div>
        <p className="mt-1 text-xs font-bold text-slate-600">คูณบน คูณล่าง ด้วยจำนวนเดียวกัน</p>
        <div className="mt-2 flex items-center justify-center gap-2 text-lg">
          <FractionText numerator={1} denominator={2} className="text-lg" toneClassName="text-pink-600" />
          <span className="font-extrabold text-slate-500">×</span>
          <FractionText numerator={3} denominator={3} className="text-lg" toneClassName="text-orange-600" />
          <span className="font-extrabold text-slate-500">=</span>
          <FractionText numerator={3} denominator={6} className="text-lg" toneClassName="text-pink-600" />
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-orange-100 bg-orange-50/50 p-4">
        <div className="text-sm font-extrabold text-orange-600">ย่อ (หาร)</div>
        <p className="mt-1 text-xs font-bold text-slate-600">หารบน หารล่าง ด้วยจำนวนเดียวกัน</p>
        <div className="mt-2 flex items-center justify-center gap-2 text-lg">
          <FractionText numerator={8} denominator={12} className="text-lg" toneClassName="text-pink-600" />
          <span className="font-extrabold text-slate-500">÷</span>
          <FractionText numerator={4} denominator={4} className="text-lg" toneClassName="text-orange-600" />
          <span className="font-extrabold text-slate-500">=</span>
          <FractionText numerator={2} denominator={3} className="text-lg" toneClassName="text-emerald-600" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl bg-amber-50 p-3">
        <span className="text-3xl">🐰</span>
        <p className="text-xs font-bold leading-relaxed text-amber-700">
          คูณพร้อมกัน หารพร้อมกัน ค่าเดิมไม่เปลี่ยนครับ!
        </p>
      </div>
    </Card>
  );
}

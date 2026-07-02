import { CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { UnequalCircle } from "@/components/lessons/shared/UnequalShapes";

export function EqualPartsCompare() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-extrabold text-brand-900">เปรียบเทียบให้เห็นชัด</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-2xl border-emerald-200 bg-emerald-50/40 text-center">
          <div className="flex items-center justify-center gap-2 text-lg font-extrabold text-emerald-700">
            <CheckCircle2 size={20} /> ถูกต้อง
          </div>
          <FractionShape numerator={2} denominator={4} shape="circle" tone="emerald" className="mx-auto my-4 h-28 w-28" />
          <p className="text-base font-bold text-emerald-700">ทุกส่วนเท่ากัน</p>
          <p className="text-base font-bold text-emerald-700">เขียนเป็นเศษส่วนได้</p>
        </Card>

        <Card className="rounded-2xl border-orange-200 bg-orange-50/40 text-center">
          <div className="flex items-center justify-center gap-2 text-lg font-extrabold text-orange-600">
            <XCircle size={20} /> ยังไม่ถูก
          </div>
          <UnequalCircle className="mx-auto my-4 h-28 w-28" />
          <p className="text-base font-bold text-orange-600">ขนาดแต่ละส่วนไม่เท่ากัน</p>
          <p className="text-base font-bold text-orange-600">ยังไม่ควรเขียนเป็นเศษส่วน</p>
        </Card>
      </div>

      <div className="flex items-center justify-center gap-2 rounded-xl bg-violet-50 px-5 py-3.5 text-center text-base font-bold text-violet-700">
        <span>⭐</span> จำง่าย ๆ: ถ้าจะเขียนเป็นเศษส่วนได้ ต้องแบ่งเป็นส่วนเท่า ๆ กันก่อน
      </div>
    </div>
  );
}

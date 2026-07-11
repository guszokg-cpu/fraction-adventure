import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack } from "@/components/fractions/FractionStack";
import { UnequalCircle } from "@/components/lessons/shared/UnequalShapes";
import { cn } from "@/lib/cn";

function SummaryBox({
  icon,
  title,
  children,
  className,
}: {
  icon: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border-2 bg-white p-4 sm:p-5", className)}>
      <p className="flex items-center gap-2 text-base font-extrabold text-slate-700 sm:text-lg">
        <span className="text-xl">{icon}</span> {title}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function IntroSummaryCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-2 bg-gradient-to-r from-brand-700 to-indigo-500 px-4 py-2.5 text-white">
        <span className="text-xl">📖</span>
        <h2 className="text-lg font-extrabold">สรุปบทเรียน: รู้จักเศษส่วน</h2>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-2">
        {/* 1. นิยาม */}
        <SummaryBox icon="⭐" title="เศษส่วนคืออะไร" className="border-brand-100 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-center gap-5">
            <FractionShape numerator={3} denominator={4} shape="pizza" tone="accent" className="h-28 w-28" />
            <FractionStack
              top={<span className="text-rose-500">3</span>}
              bottom={<span className="text-brand-600">4</span>}
              className="text-5xl font-extrabold"
            />
            <p className="max-w-sm text-sm font-bold leading-relaxed text-slate-600 sm:text-base">
              จำนวนที่บอกว่าเราเลือก<span className="text-rose-600">บางส่วน</span>จาก 1 หน่วย
              ที่แบ่งเป็น<span className="text-brand-700">ส่วนเท่า ๆ กัน</span> —
              พิซซ่าตัด 4 ชิ้นเท่ากัน หยิบ 3 ชิ้น = เศษสามส่วนสี่
            </p>
          </div>
        </SummaryBox>

        {/* 2. เศษ/ส่วน */}
        <SummaryBox icon="🔢" title="ตัวเศษ กับ ตัวส่วน" className="border-rose-100">
          <div className="space-y-2 text-sm font-extrabold sm:text-base">
            <div className="rounded-xl bg-rose-50 px-4 py-2.5 text-rose-600">
              🎨 ตัวเศษ (ข้างบน) = ส่วนที่เลือกหรือระบาย
            </div>
            <div className="rounded-xl bg-brand-50 px-4 py-2.5 text-brand-700">
              🍰 ตัวส่วน (ข้างล่าง) = ส่วนทั้งหมดที่แบ่ง
            </div>
            <p className="pt-1 text-center text-sm font-bold text-slate-500">
              อ่านตัวเศษก่อน แล้วตามด้วยตัวส่วน เช่น &ldquo;เศษสามส่วนสี่&rdquo;
            </p>
          </div>
        </SummaryBox>

        {/* 3. กฎแบ่งเท่า */}
        <SummaryBox icon="⚖️" title="กฎสำคัญ: ต้องแบ่งเท่า ๆ กัน" className="border-emerald-100">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <FractionShape numerator={1} denominator={4} shape="circle" tone="emerald" className="mx-auto h-20 w-20" />
              <p className="mt-1 text-sm font-extrabold text-emerald-700">✅ เท่ากัน — ใช้ได้</p>
            </div>
            <div className="text-center">
              <UnequalCircle className="mx-auto h-20 w-20" />
              <p className="mt-1 text-sm font-extrabold text-rose-600">❌ ไม่เท่า — ยังใช้ไม่ได้</p>
            </div>
          </div>
        </SummaryBox>

        {/* 4. กรณีพิเศษ */}
        <SummaryBox icon="💡" title="กรณีพิเศษที่ควรรู้" className="border-sky-100">
          <div className="flex flex-wrap items-center justify-center gap-6 text-center">
            <div>
              <FractionStack top={4} bottom={4} className="text-2xl font-extrabold text-emerald-700" />
              <p className="mt-1 text-xs font-bold text-slate-600">ระบายครบทุกส่วน<br />= 1 หน่วยเต็ม</p>
            </div>
            <div>
              <FractionStack top={0} bottom={5} className="text-2xl font-extrabold text-slate-500" />
              <p className="mt-1 text-xs font-bold text-slate-600">ยังไม่ระบายเลย<br />= ศูนย์</p>
            </div>
          </div>
        </SummaryBox>

        {/* 5. กับดัก */}
        <SummaryBox icon="⚠️" title="กับดักที่เจอบ่อย" className="border-rose-100 bg-rose-50/40 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">❌</span>
              <FractionShape numerator={3} denominator={4} shape="bar" tone="pink" className="h-9 w-28" />
              <span className="text-slate-400">=</span>
              <FractionStack top={4} bottom={3} className="text-xl font-extrabold text-rose-600" />
              <span className="text-xs font-bold text-rose-500">(สลับบน-ล่าง — ผิด!)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <FractionShape numerator={3} denominator={4} shape="bar" tone="emerald" className="h-9 w-28" />
              <span className="text-slate-400">=</span>
              <FractionStack top={3} bottom={4} className="text-xl font-extrabold text-emerald-700" />
              <span className="text-xs font-bold text-emerald-600">(ระบาย 3 จาก 4 — ถูก)</span>
            </div>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-rose-600 sm:text-base">
            ส่วนที่ระบายอยู่ข้างบนเสมอ ส่วนทั้งหมดอยู่ข้างล่างเสมอ
          </p>
        </SummaryBox>
      </div>
    </Card>
  );
}

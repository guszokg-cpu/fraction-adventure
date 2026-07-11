import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { FractionStack } from "@/components/lessons/divide/DivideMath";
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

/** แถบวัด 4 ช่อง แสดง 1/2 ÷ 1/4 = 2 ชิ้น */
function MiniMeasure() {
  return (
    <div className="mx-auto grid w-40 grid-cols-4 gap-1">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className={cn(
            "grid h-9 place-items-center rounded border-2 text-xs font-extrabold",
            i < 2 ? "border-violet-500 bg-pink-200 text-violet-700" : "border-slate-200 bg-white text-transparent"
          )}
        >
          {i < 2 ? i + 1 : ""}
        </div>
      ))}
    </div>
  );
}

export function DivideSummaryCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-2 bg-gradient-to-r from-violet-700 to-purple-500 px-4 py-2.5 text-white">
        <span className="text-xl">➗</span>
        <h2 className="text-lg font-extrabold">สรุปบทเรียน: หารเศษส่วน</h2>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-2">
        {/* 1. กฎทอง */}
        <SummaryBox icon="⭐" title="กฎทอง: คงตัวหน้า กลับตัวหลัง แล้วคูณ" className="border-violet-100 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-center gap-3 text-2xl font-extrabold sm:text-3xl">
            <FractionStack top={1} bottom={2} className="text-pink-600" />
            <span className="text-slate-400">÷</span>
            <FractionStack top={1} bottom={4} className="text-violet-600" />
            <span className="text-slate-400">=</span>
            <FractionStack top={1} bottom={2} className="text-pink-600" />
            <span className="text-slate-400">×</span>
            <FractionStack top={4} bottom={1} className="text-emerald-600" />
            <span className="text-slate-400">=</span>
            <FractionStack top={4} bottom={2} className="text-purple-700" />
            <span className="text-slate-400">=</span>
            <span className="text-emerald-700">2</span>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-slate-600 sm:text-base">
            เศษส่วนที่กลับหัว–ท้ายเรียกว่า <span className="text-emerald-700">ส่วนกลับ</span>
          </p>
        </SummaryBox>

        {/* 2. โมเดลวัด */}
        <SummaryBox icon="📏" title="ทำไมถึงเป็นแบบนั้น: นับชิ้น" className="border-pink-100">
          <MiniMeasure />
          <p className="mt-3 text-center text-sm font-bold text-slate-600">
            ใน <FractionStack top={1} bottom={2} className="mx-1 inline-flex text-sm text-pink-600" /> มี{" "}
            <FractionStack top={1} bottom={4} className="mx-1 inline-flex text-sm text-violet-600" /> อยู่ 2 ชิ้น → ตอบ 2
          </p>
        </SummaryBox>

        {/* 3. คูณ vs หาร */}
        <SummaryBox icon="⚖️" title="คูณ vs หาร" className="border-amber-100">
          <div className="space-y-2 text-center text-lg font-extrabold sm:text-xl">
            <p className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-rose-500">คูณ → เล็กลง:</span>
              <FractionStack top={1} bottom={2} className="text-slate-600" />
              <span className="text-slate-400">×</span>
              <FractionStack top={1} bottom={4} className="text-slate-600" />
              <span className="text-slate-400">=</span>
              <FractionStack top={1} bottom={8} className="text-rose-600" />
            </p>
            <p className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-emerald-600">หาร → ใหญ่ขึ้น:</span>
              <FractionStack top={1} bottom={2} className="text-slate-600" />
              <span className="text-slate-400">÷</span>
              <FractionStack top={1} bottom={4} className="text-slate-600" />
              <span className="text-slate-400">=</span>
              <span className="text-emerald-700">2</span>
            </p>
          </div>
          <p className="mt-2 text-center text-sm font-bold text-slate-600">หารด้วยเศษส่วน (น้อยกว่า 1) ผลลัพธ์จะใหญ่ขึ้น</p>
        </SummaryBox>

        {/* 4. จำนวนเต็ม/คละ */}
        <SummaryBox icon="🔢" title="จำนวนเต็ม & จำนวนคละ" className="border-sky-100">
          <ul className="space-y-2 text-sm font-bold text-slate-600 sm:text-base">
            <li className="flex items-start gap-2">
              <span className="text-violet-600">•</span> จำนวนเต็ม = ตัวส่วนเท่ากับ 1 → 2 = 2/1
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-600">•</span> จำนวนคละ → แปลงเป็นเศษเกินก่อนหารเสมอ
            </li>
          </ul>
        </SummaryBox>

        {/* 5. กับดัก */}
        <SummaryBox icon="⚠️" title="กับดัก: กลับตัวหลังเท่านั้น!" className="border-rose-100 bg-rose-50/40 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <div className="flex items-center gap-2 text-xl font-extrabold sm:text-2xl">
              <span className="text-2xl">❌</span>
              <FractionStack top={2} bottom={1} className="text-rose-600" />
              <span className="text-slate-400">×</span>
              <FractionStack top={1} bottom={4} className="text-rose-600" />
              <span className="text-sm font-bold text-rose-500">(กลับตัวหน้า — ผิด!)</span>
            </div>
            <div className="flex items-center gap-2 text-xl font-extrabold sm:text-2xl">
              <span className="text-2xl">✅</span>
              <FractionStack top={1} bottom={2} className="text-emerald-700" />
              <span className="text-slate-400">×</span>
              <FractionStack top={4} bottom={1} className="text-emerald-700" />
              <span className="text-sm font-bold text-emerald-600">(กลับตัวหลัง — ถูก)</span>
            </div>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-rose-600 sm:text-base">
            คงตัวหน้าไว้เหมือนเดิม กลับเฉพาะตัวหลัง แล้วเปลี่ยน ÷ เป็น ×
          </p>
        </SummaryBox>
      </div>
    </Card>
  );
}

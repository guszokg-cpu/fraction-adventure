import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { FractionStack } from "@/components/lessons/multiply/MultiplyMath";
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

/** ตารางพื้นที่ย่อ 3×4 แสดง 2/3 × 3/4 */
function MiniArea() {
  return (
    <div className="mx-auto grid w-24 grid-cols-4 overflow-hidden rounded-lg border-2 border-orange-700">
      {Array.from({ length: 12 }, (_, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const inRow = row < 2;
        const inCol = col < 3;
        return (
          <div
            key={i}
            className={cn(
              "aspect-square border border-orange-900/30 bg-white",
              inRow && "bg-sky-200",
              inCol && "bg-amber-200",
              inRow && inCol && "bg-violet-400"
            )}
          />
        );
      })}
    </div>
  );
}

export function MultiplySummaryCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-400 px-4 py-2.5 text-white">
        <span className="text-xl">✖️</span>
        <h2 className="text-lg font-extrabold">สรุปบทเรียน: คูณเศษส่วน</h2>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-2">
        {/* 1. กฎทอง */}
        <SummaryBox icon="⭐" title="กฎทอง: เศษ × เศษ, ส่วน × ส่วน" className="border-orange-100 xl:col-span-2">
          <div className="flex items-center justify-center gap-3 text-2xl font-extrabold sm:text-3xl">
            <FractionStack top={2} bottom={3} className="text-sky-600" />
            <span className="text-slate-400">×</span>
            <FractionStack top={3} bottom={4} className="text-amber-600" />
            <span className="text-slate-400">=</span>
            <span className="flex flex-col items-center leading-none text-orange-700">
              <span>2×3</span>
              <span className="my-1 h-0.5 w-full rounded-full bg-current" />
              <span>3×4</span>
            </span>
            <span className="text-slate-400">=</span>
            <FractionStack top={6} bottom={12} className="text-orange-700" />
            <span className="text-slate-400">=</span>
            <FractionStack top={1} bottom={2} className="text-emerald-700" />
          </div>
          <p className="mt-3 text-center text-sm font-bold text-slate-600 sm:text-base">คูณตรง ๆ ได้เลย แล้วทำผลลัพธ์ให้เป็นอย่างต่ำ</p>
        </SummaryBox>

        {/* 2. โมเดลพื้นที่ */}
        <SummaryBox icon="🟪" title="ทำไมถึงเป็นแบบนั้น: พื้นที่ซ้อน" className="border-violet-100">
          <MiniArea />
          <p className="mt-3 text-center text-sm font-bold text-slate-600">
            ช่องม่วง (ซ้อนกัน) = 6 จาก 12 ช่อง = <span className="text-violet-700">พื้นที่ที่คูณกัน</span>
          </p>
        </SummaryBox>

        {/* 3. ตัดทอน */}
        <SummaryBox icon="✂️" title="ตัดทอนก่อนคูณ ช่วยให้เลขเล็ก" className="border-emerald-100">
          <div className="space-y-1.5 text-center text-lg font-extrabold sm:text-xl">
            <p className="flex flex-wrap items-center justify-center gap-2">
              <FractionStack top={2} bottom={3} className="text-slate-600" />
              <span className="text-slate-400">×</span>
              <FractionStack top={9} bottom={10} className="text-slate-600" />
              <span className="text-sm font-bold text-slate-400">(ตัด 3↔9 ด้วย 3)</span>
            </p>
            <p className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-slate-400">=</span>
              <FractionStack top={2} bottom={1} className="text-emerald-600" />
              <span className="text-slate-400">×</span>
              <FractionStack top={3} bottom={10} className="text-emerald-600" />
              <span className="text-slate-400">=</span>
              <FractionStack top={3} bottom={5} className="text-emerald-700" />
            </p>
          </div>
        </SummaryBox>

        {/* 4. จำนวนเต็ม/คละ */}
        <SummaryBox icon="🔢" title="จำนวนเต็ม & จำนวนคละ" className="border-sky-100">
          <ul className="space-y-2 text-sm font-bold text-slate-600 sm:text-base">
            <li className="flex items-start gap-2">
              <span className="text-sky-600">•</span> จำนวนเต็ม = ตัวส่วนเท่ากับ 1 → 3 = 3/1
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-600">•</span> จำนวนคละ → แปลงเป็นเศษเกินก่อนคูณเสมอ
            </li>
          </ul>
        </SummaryBox>

        {/* 5. กับดัก */}
        <SummaryBox icon="⚠️" title="กับดัก: อย่าทำแบบการบวก!" className="border-rose-100 bg-rose-50/40 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <div className="flex items-center gap-2 text-xl font-extrabold sm:text-2xl">
              <span className="text-2xl">❌</span>
              <span className="text-sm font-bold text-rose-500">ทำส่วนให้เท่ากันก่อน / บวกตัวเศษ</span>
            </div>
            <div className="flex items-center gap-2 text-xl font-extrabold sm:text-2xl">
              <span className="text-2xl">✅</span>
              <FractionStack top={1} bottom={2} className="text-emerald-700" />
              <span className="text-slate-400">×</span>
              <FractionStack top={1} bottom={3} className="text-emerald-700" />
              <span className="text-emerald-600">=</span>
              <FractionStack top={1} bottom={6} className="text-emerald-700" />
            </div>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-rose-600 sm:text-base">
            การคูณ<span className="font-extrabold">ไม่ต้อง</span>ทำตัวส่วนให้เท่ากัน — คูณตรง ๆ เลย (ต่างจากบวก/ลบ)
          </p>
        </SummaryBox>
      </div>
    </Card>
  );
}

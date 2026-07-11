import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack, NumberLineEquivalent } from "@/components/lessons/equivalent/EquivalentMath";
import { cn } from "@/lib/cn";

/** ตัวคูณ/ตัวหารกำกับทั้งเศษและส่วน (ซ้อนบน-ล่างให้ตรงเส้นเศษส่วน) */
function MiniFactor({ symbol, value, className }: { symbol: string; value: number; className?: string }) {
  return (
    <span className={cn("inline-flex flex-col items-center gap-1.5 align-middle text-base font-extrabold sm:text-lg", className)}>
      <span>
        {symbol}
        {value}
      </span>
      <span>
        {symbol}
        {value}
      </span>
    </span>
  );
}

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

export function EquivalentSummaryCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-violet-500 px-4 py-2.5 text-white">
        <span className="text-xl">🔁</span>
        <h2 className="text-lg font-extrabold">สรุปบทเรียน: เศษส่วนที่เท่ากัน</h2>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-2">
        {/* 1. กฎทองสองข้อ */}
        <SummaryBox icon="⭐" title="กฎทอง: คูณหรือหาร ทั้งเศษและส่วน" className="border-emerald-100 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <FractionStack top={1} bottom={2} className="text-2xl text-emerald-700 sm:text-3xl" />
                <MiniFactor symbol="×" value={3} className="text-emerald-600" />
                <span className="text-2xl font-extrabold text-slate-400">=</span>
                <FractionStack top={3} bottom={6} className="text-2xl text-emerald-700 sm:text-3xl" />
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 sm:text-sm">
                ขยาย: คูณบนล่างด้วยจำนวนเดียวกัน
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <FractionStack top={6} bottom={8} className="text-2xl text-amber-600 sm:text-3xl" />
                <MiniFactor symbol="÷" value={2} className="text-amber-500" />
                <span className="text-2xl font-extrabold text-slate-400">=</span>
                <FractionStack top={3} bottom={4} className="text-2xl text-amber-600 sm:text-3xl" />
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-600 sm:text-sm">
                ย่อ: หารบนล่างด้วยจำนวนเดียวกัน
              </span>
            </div>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-slate-600 sm:text-base">
            ทำแบบนี้แล้ว <span className="text-emerald-700">ค่าของเศษส่วนไม่เปลี่ยนเลย</span>
          </p>
        </SummaryBox>

        {/* 2. ภาพพิสูจน์ */}
        <SummaryBox icon="🖼️" title="ภาพพิสูจน์: พื้นที่ระบายเท่ากันเสมอ" className="border-violet-100">
          <div className="space-y-2.5">
            {[
              { n: 1, d: 2 },
              { n: 2, d: 4 },
              { n: 4, d: 8 },
            ].map((f) => (
              <div key={f.d} className="grid grid-cols-[1fr_3.5rem] items-center gap-3">
                <FractionShape numerator={f.n} denominator={f.d} shape="bar" tone="violet" className="h-9 w-full" />
                <FractionStack top={f.n} bottom={f.d} className="justify-self-center text-lg text-violet-700" />
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-sm font-bold text-slate-600">
            แบ่งไม่เหมือนกัน แต่ส่วนที่ระบายใหญ่เท่ากัน จึงเท่ากัน
          </p>
        </SummaryBox>

        {/* 3. เช็คเร็วด้วยคูณไขว้ */}
        <SummaryBox icon="✖️" title="เช็คเร็วด้วยการคูณไขว้" className="border-sky-100">
          <div className="flex items-center justify-center gap-4">
            <FractionStack top={2} bottom={3} className="text-2xl text-sky-700 sm:text-3xl" />
            <span className="text-2xl font-extrabold text-slate-300">?</span>
            <FractionStack top={4} bottom={6} className="text-2xl text-sky-700 sm:text-3xl" />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-base font-extrabold sm:text-lg">
            <span className="text-emerald-600">2 × 6 = 12</span>
            <span className="text-slate-400">และ</span>
            <span className="text-sky-600">4 × 3 = 12</span>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-slate-600">
            ผลคูณไขว้เท่ากัน → <span className="text-emerald-700">เท่ากันแน่นอน</span> ไม่ต้องวาดรูป
          </p>
        </SummaryBox>

        {/* 4. เศษส่วนอย่างต่ำ */}
        <SummaryBox icon="🏆" title="เศษส่วนอย่างต่ำ" className="border-amber-100">
          <div className="flex items-center justify-center gap-3">
            <FractionStack top={8} bottom={12} className="text-2xl text-amber-600 sm:text-3xl" />
            <MiniFactor symbol="÷" value={4} className="text-amber-500" />
            <span className="text-2xl font-extrabold text-slate-400">=</span>
            <FractionStack top={2} bottom={3} className="text-2xl text-amber-600 sm:text-3xl" />
            <span className="text-2xl">🏆</span>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-slate-600">
            ย่อจนหารบนล่างพร้อมกันไม่ได้อีก เรียกว่า <span className="text-amber-600">เศษส่วนอย่างต่ำ</span>
          </p>
        </SummaryBox>

        {/* 5. บนเส้นจำนวน */}
        <SummaryBox icon="📏" title="บนเส้นจำนวนก็เห็นได้" className="border-teal-100">
          <NumberLineEquivalent />
          <p className="mt-2 text-center text-sm font-bold text-slate-600">
            เศษส่วนที่เท่ากันอยู่<span className="text-teal-700">ตำแหน่งเดียวกัน</span>บนเส้นจำนวนเสมอ
          </p>
        </SummaryBox>

        {/* 6. กับดัก */}
        <SummaryBox icon="⚠️" title="ระวังกับดัก: ห้ามบวก!" className="border-rose-100 bg-rose-50/40 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">❌</span>
              <FractionStack top={1} bottom={2} className="text-2xl text-rose-600 sm:text-3xl" />
              <MiniFactor symbol="+" value={1} className="text-rose-400" />
              <span className="text-2xl font-extrabold text-rose-500">≠</span>
              <FractionStack top={2} bottom={3} className="text-2xl text-rose-600 sm:text-3xl" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <FractionStack top={1} bottom={2} className="text-2xl text-emerald-700 sm:text-3xl" />
              <MiniFactor symbol="×" value={2} className="text-emerald-600" />
              <span className="text-2xl font-extrabold text-emerald-600">=</span>
              <FractionStack top={2} bottom={4} className="text-2xl text-emerald-700 sm:text-3xl" />
            </div>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-rose-600 sm:text-base">
            บวกจำนวนเดียวกันทั้งบนล่าง ค่าจะเปลี่ยนทันที — ต้องคูณหรือหารเท่านั้น
          </p>
        </SummaryBox>
      </div>
    </Card>
  );
}

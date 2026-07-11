import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
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

function Mixed({ whole, num, den, className, tone = "text-fuchsia-600" }: { whole: number; num: number; den: number; className?: string; tone?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      <span className={cn("font-extrabold", tone)}>{whole}</span>
      <FractionText numerator={num} denominator={den} className="text-[0.8em]" toneClassName={tone} />
    </span>
  );
}

export function MixedSummaryCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-fuchsia-600 px-4 py-2.5 text-white">
        <span className="text-xl">🍕</span>
        <h2 className="text-lg font-extrabold">สรุปบทเรียน: จำนวนคละและเศษเกิน</h2>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-2">
        {/* 1. นิยามสองแบบ ของเดียวกัน */}
        <SummaryBox icon="🍕" title="ของเดียวกัน เขียนได้ 2 แบบ" className="border-pink-100 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <FractionShape numerator={4} denominator={4} shape="circle" tone="pink" className="h-16 w-16" />
              <FractionShape numerator={1} denominator={4} shape="circle" tone="violet" className="h-16 w-16" />
            </div>
            <span className="text-2xl font-extrabold text-slate-300">=</span>
            <FractionText numerator={5} denominator={4} className="text-3xl sm:text-4xl" toneClassName="text-pink-600" />
            <span className="text-2xl font-extrabold text-slate-300">=</span>
            <Mixed whole={1} num={1} den={4} className="text-3xl sm:text-4xl" />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm font-bold text-slate-600 sm:text-base">
            <span>
              <span className="font-extrabold text-pink-600">เศษเกิน</span> = ตัวเศษ ≥ ตัวส่วน (เกิน 1 เต็ม)
            </span>
            <span>
              <span className="font-extrabold text-fuchsia-600">จำนวนคละ</span> = จำนวนเต็ม + เศษส่วนแท้
            </span>
          </div>
        </SummaryBox>

        {/* 2. เศษเกิน → คละ */}
        <SummaryBox icon="➗" title="เศษเกิน → จำนวนคละ: ใช้หาร" className="border-pink-100">
          <div className="space-y-2 text-center">
            <p className="text-xl font-extrabold text-slate-700 sm:text-2xl">
              7 ÷ 3 = <span className="text-pink-600">2</span> เศษ <span className="text-fuchsia-600">1</span>
            </p>
            <p className="flex items-center justify-center gap-2 text-xl font-extrabold sm:text-2xl">
              <FractionText numerator={7} denominator={3} className="text-xl sm:text-2xl" toneClassName="text-pink-600" />
              <span className="text-slate-400">=</span>
              <Mixed whole={2} num={1} den={3} className="text-xl sm:text-2xl" />
            </p>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-slate-600">ผลหารเป็นจำนวนเต็ม เศษที่เหลือเป็นตัวเศษ ตัวส่วนคงเดิม</p>
        </SummaryBox>

        {/* 3. คละ → เศษเกิน */}
        <SummaryBox icon="✖️" title="จำนวนคละ → เศษเกิน: คูณแล้วบวก" className="border-fuchsia-100">
          <div className="space-y-2 text-center">
            <p className="text-xl font-extrabold text-slate-700 sm:text-2xl">
              (2 × 3) + 1 = <span className="text-pink-600">7</span>
            </p>
            <p className="flex items-center justify-center gap-2 text-xl font-extrabold sm:text-2xl">
              <Mixed whole={2} num={1} den={3} className="text-xl sm:text-2xl" />
              <span className="text-slate-400">=</span>
              <FractionText numerator={7} denominator={3} className="text-xl sm:text-2xl" toneClassName="text-pink-600" />
            </p>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-slate-600">จำนวนเต็ม × ตัวส่วน แล้วบวกตัวเศษ ตัวส่วนคงเดิม</p>
        </SummaryBox>

        {/* 4. บนเส้นจำนวน */}
        <SummaryBox icon="📏" title="บนเส้นจำนวน: จุดเดียวกัน" className="border-teal-100">
          <svg viewBox="0 0 320 92" className="w-full" role="img" aria-label="เส้นจำนวน 0 ถึง 2">
            <line x1={20} y1={52} x2={300} y2={52} stroke="#312e81" strokeWidth={3} />
            {[0, 1, 2].map((n) => (
              <g key={n}>
                <line x1={20 + n * 140} y1={44} x2={20 + n * 140} y2={60} stroke="#312e81" strokeWidth={3} />
                <text x={20 + n * 140} y={80} textAnchor="middle" fontSize={16} fontWeight={800} fill="#312e81">
                  {n}
                </text>
              </g>
            ))}
            <circle cx={20 + 1.25 * 140} cy={52} r={8} fill="#ec4899" stroke="#fff" strokeWidth={2.5} />
            <rect x={20 + 1.25 * 140 - 34} y={8} width={68} height={24} rx={12} fill="#c026d3" />
            <text x={20 + 1.25 * 140} y={25} textAnchor="middle" fontSize={14} fontWeight={800} fill="#fff">
              1¼ = 5/4
            </text>
          </svg>
          <p className="mt-2 text-center text-sm font-bold text-slate-600">
            จำนวนคละอยู่<span className="text-teal-700">ระหว่างจำนวนเต็ม</span> — 1¼ กับ 5/4 คือจุดเดียวกัน
          </p>
        </SummaryBox>

        {/* 5. กับดัก */}
        <SummaryBox icon="⚠️" title="ระวังกับดัก: ลืมบวกตัวเศษ!" className="border-rose-100 bg-rose-50/40 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">❌</span>
              <Mixed whole={2} num={1} den={3} className="text-xl sm:text-2xl" tone="text-rose-600" />
              <span className="text-lg font-extrabold text-slate-400">→ 2×3 =</span>
              <FractionText numerator={6} denominator={3} className="text-xl sm:text-2xl" toneClassName="text-rose-600" />
              <span className="text-sm font-bold text-rose-500">(หายไป 1 ชิ้น!)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <Mixed whole={2} num={1} den={3} className="text-xl sm:text-2xl" tone="text-emerald-700" />
              <span className="text-lg font-extrabold text-slate-400">→ 2×3+1 =</span>
              <FractionText numerator={7} denominator={3} className="text-xl sm:text-2xl" toneClassName="text-emerald-700" />
            </div>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-rose-600 sm:text-base">
            คูณเสร็จแล้วต้องบวกตัวเศษด้วยเสมอ อย่าลืมชิ้นสุดท้าย!
          </p>
        </SummaryBox>
      </div>
    </Card>
  );
}

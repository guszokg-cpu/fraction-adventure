import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { CrossOutBar, FractionStack } from "@/components/lessons/subtract/SubtractMath";
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

export function SubtractSummaryCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-green-500 px-4 py-2.5 text-white">
        <span className="text-xl">➖</span>
        <h2 className="text-lg font-extrabold">สรุปบทเรียน: ลบเศษส่วน</h2>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-2">
        {/* 1. ส่วนเท่ากัน */}
        <SummaryBox icon="✅" title="ส่วนเท่ากัน: ลบตัวเศษได้เลย" className="border-emerald-100">
          <div className="flex items-center justify-center gap-3 text-xl font-extrabold sm:text-2xl">
            <FractionStack top={4} bottom={5} className="text-emerald-600" />
            <span className="text-slate-400">−</span>
            <FractionStack top={2} bottom={5} className="text-rose-500" />
            <span className="text-slate-400">=</span>
            <FractionStack top={2} bottom={5} className="text-emerald-700" />
          </div>
          <div className="mx-auto mt-3 max-w-xs">
            <CrossOutBar filled={4} removed={2} denominator={5} />
          </div>
          <p className="mt-3 text-center text-sm font-bold text-slate-600">ขีดฆ่าชิ้นที่เอาออก แล้วนับที่เหลือ — ตัวส่วนคงเดิม</p>
        </SummaryBox>

        {/* 2. ส่วนต่างกัน */}
        <SummaryBox icon="🔧" title="ส่วนต่างกัน: ทำส่วนให้เท่าก่อน" className="border-teal-100">
          <div className="space-y-2 text-center text-lg font-extrabold sm:text-xl">
            <p className="flex flex-wrap items-center justify-center gap-2">
              <FractionStack top={3} bottom={4} className="text-emerald-600" />
              <span className="text-slate-400">−</span>
              <FractionStack top={1} bottom={2} className="text-rose-500" />
              <span className="text-slate-400">→ ค.ร.น. = 4 →</span>
            </p>
            <p className="flex flex-wrap items-center justify-center gap-2">
              <FractionStack top={3} bottom={4} className="text-emerald-600" />
              <span className="text-slate-400">−</span>
              <FractionStack top={2} bottom={4} className="text-rose-500" />
              <span className="text-slate-400">=</span>
              <FractionStack top={1} bottom={4} className="text-emerald-700" />
            </p>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-slate-600">หา ค.ร.น. → แปลงทั้งคู่ → แล้วค่อยลบตัวเศษ</p>
        </SummaryBox>

        {/* 3. การยืม */}
        <SummaryBox icon="🏦" title="จำนวนคละ: เศษไม่พอลบ → ยืม!" className="border-amber-100">
          <div className="space-y-1.5 text-center text-base font-extrabold text-slate-700 sm:text-lg">
            <p className="flex flex-wrap items-center justify-center gap-1.5">
              2<FractionStack top={1} bottom={4} className="inline-flex text-[0.8em] text-emerald-600" /> − 1
              <FractionStack top={3} bottom={4} className="inline-flex text-[0.8em] text-rose-500" />
              <span className="text-rose-500">→ 1 ลบ 3 ไม่ได้!</span>
            </p>
            <p className="flex flex-wrap items-center justify-center gap-1.5">
              ยืม: 2<FractionStack top={1} bottom={4} className="inline-flex text-[0.8em] text-emerald-600" /> = 1
              <FractionStack top={5} bottom={4} className="inline-flex text-[0.8em] text-amber-600" />
              <span className="text-slate-400">→</span>
              <FractionStack top={5} bottom={4} className="inline-flex text-[0.8em] text-amber-600" /> −{" "}
              <FractionStack top={3} bottom={4} className="inline-flex text-[0.8em] text-rose-500" /> ={" "}
              <FractionStack top={2} bottom={4} className="inline-flex text-[0.8em] text-emerald-700" />
              <span>, 1−1 = 0 → ตอบ</span>
              <FractionStack top={1} bottom={2} className="inline-flex text-[0.8em] text-emerald-700" />
            </p>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-slate-600">ยืม 1 เต็มมาแตกเป็นชิ้นเพิ่มให้ตัวเศษ แล้วจำนวนเต็มลดลง 1</p>
        </SummaryBox>

        {/* 4. เช็คลิสต์ */}
        <SummaryBox icon="📋" title="เช็คก่อนส่งคำตอบ" className="border-lime-100">
          <ul className="space-y-2 text-sm font-bold text-slate-600 sm:text-base">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✔</span> ตัวส่วนเท่ากันแล้วหรือยัง?
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✔</span> เศษตัวตั้งพอลบไหม? ถ้าไม่พอ ยืมหรือยัง?
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✔</span> ยืมแล้วอย่าลืมลดจำนวนเต็มลง 1
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✔</span> คำตอบย่อเป็นอย่างต่ำแล้วหรือยัง? 🏆
            </li>
          </ul>
        </SummaryBox>

        {/* 5. กับดัก */}
        <SummaryBox icon="⚠️" title="กับดักอันดับ 1: ลบตัวส่วนด้วย!" className="border-rose-100 bg-rose-50/40 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <div className="flex items-center gap-2 text-xl font-extrabold sm:text-2xl">
              <span className="text-2xl">❌</span>
              <FractionStack top={4} bottom={5} className="text-rose-600" />
              <span className="text-slate-400">−</span>
              <FractionStack top={2} bottom={5} className="text-rose-600" />
              <span className="text-rose-500">=</span>
              <FractionStack top={2} bottom={0} className="text-rose-600" />
            </div>
            <div className="flex items-center gap-2 text-xl font-extrabold sm:text-2xl">
              <span className="text-2xl">✅</span>
              <FractionStack top={4} bottom={5} className="text-emerald-700" />
              <span className="text-slate-400">−</span>
              <FractionStack top={2} bottom={5} className="text-emerald-700" />
              <span className="text-emerald-600">=</span>
              <FractionStack top={2} bottom={5} className="text-emerald-700" />
            </div>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-rose-600 sm:text-base">
            ถ้าลบตัวส่วน จะได้ส่วนเป็น 0 ซึ่งไม่มีความหมาย — ตัวส่วนบอกขนาดของชิ้น ไม่ได้ถูกลบ
          </p>
        </SummaryBox>
      </div>
    </Card>
  );
}

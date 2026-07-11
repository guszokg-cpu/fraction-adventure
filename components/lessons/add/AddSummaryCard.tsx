import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { FractionStack, TwoToneBar } from "@/components/lessons/add/FractionMath";
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

export function AddSummaryCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-700 to-sky-500 px-4 py-2.5 text-white">
        <span className="text-xl">➕</span>
        <h2 className="text-lg font-extrabold">สรุปบทเรียน: บวกเศษส่วน</h2>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-2">
        {/* 1. ส่วนเท่ากัน */}
        <SummaryBox icon="✅" title="ส่วนเท่ากัน: บวกตัวเศษได้เลย" className="border-sky-100">
          <div className="flex items-center justify-center gap-3 text-xl font-extrabold sm:text-2xl">
            <FractionStack top={2} bottom={5} className="text-sky-600" />
            <span className="text-slate-400">+</span>
            <FractionStack top={1} bottom={5} className="text-violet-600" />
            <span className="text-slate-400">=</span>
            <FractionStack top={3} bottom={5} className="text-blue-700" />
          </div>
          <div className="mx-auto mt-3 max-w-xs">
            <TwoToneBar a={2} b={1} denominator={5} className="h-9 w-full" />
          </div>
          <p className="mt-3 text-center text-sm font-bold text-slate-600">ชิ้นขนาดเดียวกัน เทรวมกันได้ทันที ตัวส่วนคงเดิม</p>
        </SummaryBox>

        {/* 2. ส่วนต่างกัน */}
        <SummaryBox icon="🔧" title="ส่วนต่างกัน: ทำส่วนให้เท่าก่อน" className="border-violet-100">
          <div className="space-y-2 text-center text-lg font-extrabold sm:text-xl">
            <p className="flex flex-wrap items-center justify-center gap-2">
              <FractionStack top={1} bottom={2} className="text-sky-600" />
              <span className="text-slate-400">+</span>
              <FractionStack top={1} bottom={3} className="text-violet-600" />
              <span className="text-slate-400">→ ค.ร.น. = 6 →</span>
            </p>
            <p className="flex flex-wrap items-center justify-center gap-2">
              <FractionStack top={3} bottom={6} className="text-sky-600" />
              <span className="text-slate-400">+</span>
              <FractionStack top={2} bottom={6} className="text-violet-600" />
              <span className="text-slate-400">=</span>
              <FractionStack top={5} bottom={6} className="text-blue-700" />
            </p>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-slate-600">หา ค.ร.น. → แปลงทั้งคู่ → แล้วค่อยบวกตัวเศษ</p>
        </SummaryBox>

        {/* 3. จำนวนคละ */}
        <SummaryBox icon="🍕" title="จำนวนคละ: แยกบวก แล้วอย่าลืมทด" className="border-amber-100">
          <div className="space-y-1.5 text-center text-base font-extrabold text-slate-700 sm:text-lg">
            <p>
              1<FractionStack top={3} bottom={4} className="mx-1 inline-flex text-[0.8em] text-sky-600" /> + 1
              <FractionStack top={2} bottom={4} className="mx-1 inline-flex text-[0.8em] text-violet-600" /> → เต็ม: 1+1=2, เศษ:{" "}
              <FractionStack top={5} bottom={4} className="mx-1 inline-flex text-[0.8em] text-rose-500" />
            </p>
            <p>
              เศษเกิน 1 → ทด: 2+1 = 3 เหลือ{" "}
              <FractionStack top={1} bottom={4} className="mx-1 inline-flex text-[0.8em] text-amber-600" /> → คำตอบ 3
              <FractionStack top={1} bottom={4} className="mx-1 inline-flex text-[0.8em] text-amber-600" />
            </p>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-slate-600">บวกจำนวนเต็มแยก บวกเศษแยก — เศษรวมเกิน 1 ต้องทด</p>
        </SummaryBox>

        {/* 4. เช็คลิสต์ */}
        <SummaryBox icon="📋" title="เช็คก่อนส่งคำตอบ" className="border-emerald-100">
          <ul className="space-y-2 text-sm font-bold text-slate-600 sm:text-base">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✔</span> ตัวส่วนเท่ากันแล้วหรือยัง?
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✔</span> บวกเฉพาะตัวเศษใช่ไหม?
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✔</span> คำตอบย่อเป็นอย่างต่ำแล้วหรือยัง? 🏆
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">✔</span> ถ้าเป็นเศษเกิน เขียนเป็นจำนวนคละได้ไหม?
            </li>
          </ul>
        </SummaryBox>

        {/* 5. กับดัก */}
        <SummaryBox icon="⚠️" title="กับดักอันดับ 1: บวกตัวส่วนด้วย!" className="border-rose-100 bg-rose-50/40 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <div className="flex items-center gap-2 text-xl font-extrabold sm:text-2xl">
              <span className="text-2xl">❌</span>
              <FractionStack top={1} bottom={4} className="text-rose-600" />
              <span className="text-slate-400">+</span>
              <FractionStack top={2} bottom={4} className="text-rose-600" />
              <span className="text-rose-500">=</span>
              <FractionStack top={3} bottom={8} className="text-rose-600" />
            </div>
            <div className="flex items-center gap-2 text-xl font-extrabold sm:text-2xl">
              <span className="text-2xl">✅</span>
              <FractionStack top={1} bottom={4} className="text-emerald-700" />
              <span className="text-slate-400">+</span>
              <FractionStack top={2} bottom={4} className="text-emerald-700" />
              <span className="text-emerald-600">=</span>
              <FractionStack top={3} bottom={4} className="text-emerald-700" />
            </div>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-rose-600 sm:text-base">
            ตัวส่วนบอก &ldquo;ขนาดของชิ้น&rdquo; — ชิ้นไม่ได้เปลี่ยนขนาดตอนเอามารวมกัน จึงห้ามบวกตัวส่วนเด็ดขาด
          </p>
        </SummaryBox>
      </div>
    </Card>
  );
}

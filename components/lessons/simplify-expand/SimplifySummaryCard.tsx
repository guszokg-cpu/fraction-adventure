import type { ReactNode } from "react";
import { Crown } from "lucide-react";
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

export function SimplifySummaryCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-white">
        <span className="text-xl">🔎</span>
        <h2 className="text-lg font-extrabold">สรุปบทเรียน: เศษส่วนอย่างต่ำ</h2>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-2">
        {/* 1. นิยาม + ครอบครัว */}
        <SummaryBox icon="👑" title="เศษส่วนอย่างต่ำคืออะไร" className="border-amber-100 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { n: 2, d: 4 },
              { n: 4, d: 8 },
              { n: 1, d: 2 },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <FractionShape numerator={f.n} denominator={f.d} shape="bar" tone="pink" className="h-10 w-24" />
                <FractionText numerator={f.n} denominator={f.d} className="text-xl text-pink-600" />
                {f.n === 1 && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-700">
                    <Crown size={10} /> หัวหน้า
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-sm font-bold text-slate-600 sm:text-base">
            ในครอบครัวเศษส่วนเท่ากัน ตัวที่<span className="text-amber-700">เล็กที่สุด หารต่อไม่ได้อีก</span>คือ{" "}
            <span className="text-emerald-700">เศษส่วนอย่างต่ำ</span>
          </p>
        </SummaryBox>

        {/* 2. วิธีย่อทีละขั้น */}
        <SummaryBox icon="🧪" title="ย่อทีละขั้น" className="border-orange-100">
          <div className="flex flex-wrap items-center justify-center gap-2 text-lg font-extrabold text-brand-900 sm:text-xl">
            <FractionText numerator={12} denominator={18} className="text-lg text-orange-600 sm:text-xl" />
            <span>÷2=</span>
            <FractionText numerator={6} denominator={9} className="text-lg text-orange-600 sm:text-xl" />
            <span>÷3=</span>
            <FractionText numerator={2} denominator={3} className="text-lg text-emerald-600 sm:text-xl" />
          </div>
          <p className="mt-3 text-center text-sm font-bold text-slate-600">หารทั้งเศษและส่วนด้วยจำนวนเดียวกัน ทำได้หลายรอบจนหารต่อไม่ได้อีก</p>
        </SummaryBox>

        {/* 3. ทางลัด ห.ร.ม. */}
        <SummaryBox icon="⚡" title="ทางลัด ห.ร.ม." className="border-emerald-100">
          <div className="flex items-center justify-center gap-3 text-lg font-extrabold text-brand-900 sm:text-xl">
            <FractionText numerator={12} denominator={18} className="text-lg text-orange-600 sm:text-xl" />
            <span>÷6=</span>
            <FractionText numerator={2} denominator={3} className="text-lg text-emerald-600 sm:text-xl" />
          </div>
          <p className="mt-3 text-center text-sm font-bold text-slate-600">
            ห.ร.ม. ของ 12 และ 18 คือ 6 — หารทีเดียวถึงเศษส่วนอย่างต่ำเลย ไม่ต้องหารหลายรอบ
          </p>
        </SummaryBox>

        {/* 4. เช็คให้ชัวร์ */}
        <SummaryBox icon="✅" title="เช็คให้ชัวร์ว่าอย่างต่ำหรือยัง" className="border-sky-100">
          <p className="text-center text-sm font-bold text-slate-600">
            ถ้าหาจำนวนที่หารทั้งเศษและส่วนได้ลงตัวพร้อมกัน<span className="text-rose-600">ไม่เจอแล้ว</span> (นอกจาก 1)
            แปลว่าเป็น<span className="text-emerald-700">เศษส่วนอย่างต่ำ</span>
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <FractionText numerator={2} denominator={3} className="text-2xl text-emerald-600" />
            <span className="text-2xl">🏆</span>
          </div>
        </SummaryBox>

        {/* 5. กับดัก */}
        <SummaryBox icon="⚠️" title="ระวังกับดัก: ย่อไม่สุด" className="border-rose-100 bg-rose-50/40 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">❌</span>
              <FractionText numerator={12} denominator={18} className="text-xl text-rose-600 sm:text-2xl" />
              <span className="text-xl font-extrabold text-slate-400">÷2</span>
              <span className="text-xl font-extrabold text-rose-500">→</span>
              <FractionText numerator={6} denominator={9} className="text-xl text-rose-600 sm:text-2xl" />
              <span className="text-sm font-bold text-rose-500">(ยังย่อได้อีก!)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <FractionText numerator={12} denominator={18} className="text-xl text-emerald-700 sm:text-2xl" />
              <span className="text-xl font-extrabold text-slate-400">÷6</span>
              <span className="text-xl font-extrabold text-emerald-600">→</span>
              <FractionText numerator={2} denominator={3} className="text-xl text-emerald-700 sm:text-2xl" />
            </div>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-rose-600 sm:text-base">
            หารครั้งเดียวแล้วอย่าเพิ่งหยุด — เช็คทุกครั้งว่ายังหารต่อได้อีกไหม
          </p>
        </SummaryBox>
      </div>
    </Card>
  );
}

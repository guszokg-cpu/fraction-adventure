import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FractionStack } from "@/components/lessons/subtract/SubtractMath";
import { Card } from "@/components/ui/Card";

export function SubtractTipsPanel() {
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-emerald-700 to-green-500 px-4 py-3 text-white">
          <h2 className="text-lg font-extrabold">เทคนิคจำง่าย</h2>
        </div>
        <div className="space-y-4 p-4">
          <div className="rounded-xl bg-emerald-50 p-3">
            <div className="font-extrabold text-emerald-700">ตัวส่วนเท่ากัน</div>
            <p className="mt-1 text-sm font-bold text-slate-700">ลบเฉพาะตัวเศษ ตัวส่วนคงเดิม</p>
          </div>
          <div className="rounded-xl bg-sky-50 p-3">
            <div className="font-extrabold text-sky-700">ตัวส่วนไม่เท่ากัน</div>
            <p className="mt-1 text-sm font-bold text-slate-700">ทำส่วนให้เท่ากันก่อน แล้วค่อยลบ</p>
          </div>
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-center">
            <div className="text-4xl">🐰</div>
            <p className="mt-2 text-sm font-extrabold text-rose-600">ห้ามลบตัวส่วนนะ!</p>
          </div>
        </div>
      </Card>

      <Card className="border-rose-200 bg-rose-50/80">
        <h2 className="text-lg font-extrabold text-rose-600">ข้อผิดพลาดที่พบบ่อย</h2>
        <div className="mt-3 grid gap-3 text-center">
          <div className="rounded-xl bg-white p-3 text-sm font-extrabold text-rose-600">
            ❌ <FractionStack top={3} bottom={4} /> - <FractionStack top={1} bottom={2} /> ={" "}
            <FractionStack top={2} bottom={2} />
            <div className="mt-1">ไม่ถูกต้อง!</div>
          </div>
          <div className="rounded-xl bg-white p-3 text-sm font-extrabold text-emerald-700">
            ✅ <FractionStack top={3} bottom={4} /> - <FractionStack top={2} bottom={4} /> ={" "}
            <FractionStack top={1} bottom={4} />
            <div className="mt-1">ถูกต้อง!</div>
          </div>
        </div>
      </Card>

      <Card className="bg-emerald-50">
        <div className="text-center text-sm font-extrabold text-emerald-700">ต่อไปบทที่ 12</div>
        <div className="mt-2 flex items-center justify-center gap-3 text-2xl font-extrabold text-brand-900">
          <FractionStack top={1} bottom={2} /> × <FractionStack top={1} bottom={3} /> = ?
        </div>
        <p className="mt-2 text-center text-sm font-bold text-slate-600">ต่อไป... การคูณเศษส่วน</p>
        <Link
          href="/lessons/multiply"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-emerald-700"
        >
          ไปบทถัดไป
          <ArrowRight size={16} />
        </Link>
      </Card>
    </div>
  );
}

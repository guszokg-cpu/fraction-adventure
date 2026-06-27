import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LessonMissionCard } from "@/components/lessons/LessonMissionCard";
import { Card } from "@/components/ui/Card";
import { multiplyLessonMissions } from "@/data/lessonMultiply";
import { FractionStack } from "@/components/lessons/multiply/MultiplyMath";

export function MultiplyTipsPanel() {
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-orange-600 to-amber-400 px-4 py-3 text-white">
          <h2 className="text-lg font-extrabold">เทคนิคจำง่าย</h2>
        </div>
        <div className="space-y-4 p-4">
          <div className="rounded-xl bg-orange-50 p-3 text-center">
            <div className="font-extrabold text-orange-700">สูตรคูณเศษส่วน</div>
            <div className="mt-3 text-2xl font-extrabold text-slate-950">
              <FractionStack top="a" bottom="b" /> × <FractionStack top="c" bottom="d" /> ={" "}
              <FractionStack top="ac" bottom="bd" />
            </div>
            <p className="mt-2 text-sm font-extrabold text-slate-700">บนคูณบน ล่างคูณล่าง</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
            <div className="text-4xl">🐻‍🏫</div>
            <p className="mt-2 text-sm font-extrabold text-orange-700">เข้าใจภาพก่อน แล้วค่อยใช้สูตร!</p>
          </div>
        </div>
      </Card>

      <Card className="border-rose-200 bg-rose-50/80">
        <h2 className="text-lg font-extrabold text-rose-600">ข้อผิดพลาดที่พบบ่อย</h2>
        <div className="mt-3 grid gap-3 text-center">
          <div className="rounded-xl bg-white p-3 text-sm font-extrabold text-rose-600">
            ❌ <FractionStack top={1} bottom={2} /> × <FractionStack top={1} bottom={3} /> ={" "}
            <FractionStack top={2} bottom={5} />
          </div>
          <div className="rounded-xl bg-white p-3 text-sm font-extrabold text-emerald-700">
            ✅ <FractionStack top={1} bottom={2} /> × <FractionStack top={1} bottom={3} /> ={" "}
            <FractionStack top={1} bottom={6} />
          </div>
        </div>
      </Card>

      <div>
        <LessonMissionCard missions={multiplyLessonMissions} />
        <div className="rounded-b-xl border border-t-0 border-brand-100 bg-white px-5 pb-4 text-center text-sm font-extrabold text-brand-700">
          ผ่านเกณฑ์ 80% ขึ้นไป รับ 3 ดาว
        </div>
      </div>

      <Card className="bg-orange-50">
        <div className="text-center text-sm font-extrabold text-orange-700">ต่อไปบทที่ 13</div>
        <div className="mt-2 flex items-center justify-center gap-3 text-2xl font-extrabold text-brand-900">
          <FractionStack top={1} bottom={2} /> ÷ <FractionStack top={1} bottom={4} /> = ?
        </div>
        <p className="mt-2 text-center text-sm font-bold text-slate-600">ต่อไป... การหารเศษส่วน</p>
        <Link
          href="/lessons/divide"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-extrabold text-white hover:bg-orange-600"
        >
          ไปบทถัดไป
          <ArrowRight size={16} />
        </Link>
      </Card>
    </div>
  );
}

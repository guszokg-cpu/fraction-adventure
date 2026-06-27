import { FractionStack } from "@/components/lessons/add/FractionMath";
import { LessonMissionCard } from "@/components/lessons/LessonMissionCard";
import { Card } from "@/components/ui/Card";
import { addLessonMissions } from "@/data/lessonAdd";

export function AddTipsPanel() {
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-blue-700 to-sky-500 px-4 py-3 text-white">
          <h2 className="text-lg font-extrabold">เทคนิคจำง่าย</h2>
        </div>
        <div className="space-y-4 p-4">
          <div>
            <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-extrabold text-blue-700">
              กรณีตัวส่วนเท่ากัน
            </div>
            <p className="mt-2 text-sm font-bold text-slate-700">บวกเฉพาะตัวเศษ ตัวส่วนคงเดิม</p>
            <div className="mt-2 text-center text-lg font-extrabold text-slate-950">
              <FractionStack top={2} bottom={7} /> + <FractionStack top={3} bottom={7} /> ={" "}
              <FractionStack top={5} bottom={7} />
            </div>
          </div>
          <div>
            <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-extrabold text-blue-700">
              กรณีตัวส่วนไม่เท่ากัน
            </div>
            <p className="mt-2 text-sm font-bold text-slate-700">ทำส่วนให้เท่ากันก่อน แล้วบวกตัวเศษ</p>
            <div className="mt-2 text-center text-sm font-extrabold text-slate-950">
              <FractionStack top={1} bottom={2} /> + <FractionStack top={1} bottom={3} /> ={" "}
              <FractionStack top={3} bottom={6} /> + <FractionStack top={2} bottom={6} /> ={" "}
              <FractionStack top={5} bottom={6} />
            </div>
          </div>
          <div>
            <div className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-sm font-extrabold text-rose-600">
              กรณีจำนวนคละ
            </div>
            <p className="mt-2 text-sm font-bold text-slate-700">บวกจำนวนเต็มก่อน แล้วบวกเศษส่วน</p>
            <div className="mt-2 text-center text-base font-extrabold text-slate-950">
              1 <FractionStack top={1} bottom={4} /> + 2 <FractionStack top={2} bottom={4} /> = 3{" "}
              <FractionStack top={3} bottom={4} />
            </div>
          </div>
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-center">
            <div className="text-4xl">🐰</div>
            <p className="mt-2 text-sm font-extrabold text-rose-600">อย่าลืมนะ! ห้ามบวกตัวส่วน!</p>
          </div>
        </div>
      </Card>

      <div>
        <LessonMissionCard missions={addLessonMissions} />
        <div className="rounded-b-xl border border-t-0 border-brand-100 bg-white px-5 pb-4 text-center text-sm font-extrabold text-brand-700">
          ผ่านเกณฑ์ 80% ขึ้นไป รับ 3 ดาว
        </div>
      </div>

      <Card className="border-amber-200 bg-amber-50/80">
        <h2 className="text-lg font-extrabold text-amber-700">ข้อผิดพลาดที่พบบ่อย</h2>
        <div className="mt-3 grid gap-3 text-center">
          <div className="rounded-xl bg-white p-3 text-sm font-extrabold text-rose-600">
            ❌ <FractionStack top={1} bottom={2} /> + <FractionStack top={1} bottom={2} /> ={" "}
            <FractionStack top={2} bottom={4} />
            <div className="mt-1">ไม่ถูกต้อง!</div>
          </div>
          <div className="rounded-xl bg-white p-3 text-sm font-extrabold text-emerald-700">
            ✅ <FractionStack top={1} bottom={2} /> + <FractionStack top={1} bottom={2} /> ={" "}
            <FractionStack top={2} bottom={2} /> = 1
            <div className="mt-1">ถูกต้อง!</div>
          </div>
        </div>
        <p className="mt-3 text-sm font-bold text-amber-800">
          บวกตัวส่วนไม่ได้ ต้องบวกเฉพาะตัวเศษเมื่อส่วนเท่ากัน
        </p>
      </Card>

      <Card className="text-center">
        <div className="text-5xl">🐻‍🏫</div>
        <p className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-sm font-extrabold text-blue-700">
          รวมส่วนให้เท่ากันก่อนนะครับ!
        </p>
      </Card>
    </div>
  );
}

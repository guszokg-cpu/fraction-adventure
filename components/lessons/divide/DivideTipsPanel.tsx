import { LessonMissionCard } from "@/components/lessons/LessonMissionCard";
import { Card } from "@/components/ui/Card";
import { divideLessonMissions } from "@/data/lessonDivide";
import { FractionStack } from "@/components/lessons/divide/DivideMath";

export function DivideTipsPanel() {
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-violet-700 to-purple-500 px-4 py-3 text-white">
          <h2 className="text-lg font-extrabold">เทคนิคจำง่าย 3 ขั้น</h2>
        </div>
        <div className="grid grid-cols-3 divide-x divide-violet-100 text-center">
          {["คงตัวหน้า", "กลับตัวหลัง", "เปลี่ยนเป็นคูณ"].map((text, index) => (
            <div key={text} className="p-3">
              <div className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-violet-600 font-extrabold text-white">
                {index + 1}
              </div>
              <div className="mt-2 text-xs font-extrabold text-brand-900">{text}</div>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4 text-center text-lg font-extrabold text-violet-700">
          <FractionStack top={2} bottom={3} /> ÷ <FractionStack top={1} bottom={4} /> ={" "}
          <FractionStack top={2} bottom={3} /> × <FractionStack top={4} bottom={1} />
        </div>
      </Card>

      <Card className="border-rose-200 bg-rose-50/80">
        <h2 className="text-lg font-extrabold text-rose-600">ข้อผิดพลาดที่พบบ่อย</h2>
        <div className="mt-3 grid gap-3 text-center">
          <div className="rounded-xl bg-white p-3 text-sm font-extrabold text-rose-600">
            ❌ <FractionStack top={1} bottom={2} /> ÷ <FractionStack top={1} bottom={4} /> ={" "}
            <FractionStack top={1} bottom={8} />
          </div>
          <div className="rounded-xl bg-white p-3 text-sm font-extrabold text-emerald-700">
            ✅ <FractionStack top={1} bottom={2} /> ÷ <FractionStack top={1} bottom={4} /> ={" "}
            <FractionStack top={1} bottom={2} /> × <FractionStack top={4} bottom={1} /> = 2
          </div>
        </div>
      </Card>

      <div>
        <LessonMissionCard missions={divideLessonMissions} />
        <div className="rounded-b-xl border border-t-0 border-brand-100 bg-white px-5 pb-4 text-center text-sm font-extrabold text-brand-700">
          ผ่านเกณฑ์ 80% ขึ้นไป รับ 3 ดาว
        </div>
      </div>

      <Card className="bg-violet-50 text-center">
        <h2 className="text-lg font-extrabold text-violet-700">ยินดีด้วย! ผ่านบทที่ 13 แล้ว</h2>
        <p className="mt-2 text-sm font-bold text-slate-600">ปลดล็อก “เมืองเศษส่วน” แผนที่รวม 12 ด่าน</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm font-extrabold">
          <div className="rounded-xl bg-white p-3">🪙<br />เหรียญ</div>
          <div className="rounded-xl bg-white p-3">⭐<br />ดาวพิเศษ</div>
          <div className="rounded-xl bg-white p-3">📜<br />ใบประกาศ PDF</div>
        </div>
        <button className="mt-4 rounded-xl bg-violet-600 px-5 py-2 text-sm font-extrabold text-white">
          รับรางวัล
        </button>
      </Card>
    </div>
  );
}

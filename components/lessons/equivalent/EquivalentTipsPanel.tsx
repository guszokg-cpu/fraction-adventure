import { Card } from "@/components/ui/Card";
import { FractionStack } from "@/components/lessons/equivalent/EquivalentMath";

export function EquivalentTipsPanel() {
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-teal-600 to-violet-500 px-4 py-3 text-white">
          <h2 className="text-lg font-extrabold">จำง่าย ๆ</h2>
        </div>
        <div className="space-y-3 p-4">
          <div className="rounded-xl bg-teal-50 p-3 text-center text-sm font-extrabold text-teal-700">
            คูณหรือหารทั้งตัวเศษและตัวส่วนด้วยจำนวนเดียวกัน ค่าเศษส่วนจะเท่าเดิม
          </div>
          <div className="text-center text-xl font-extrabold text-brand-900">
            <FractionStack top={1} bottom={2} /> = <FractionStack top={2} bottom={4} /> ={" "}
            <FractionStack top={4} bottom={8} />
          </div>
        </div>
      </Card>

      <Card className="border-rose-200 bg-rose-50/80">
        <h2 className="text-lg font-extrabold text-rose-600">ข้อผิดพลาดที่พบบ่อย</h2>
        <div className="mt-3 grid gap-3 text-center">
          <div className="rounded-xl bg-white p-3 text-sm font-extrabold text-rose-600">
            ❌ <FractionStack top={1} bottom={2} /> = <FractionStack top={2} bottom={3} />
            <div className="mt-1">ผิด เพราะบวกบนล่างอย่างละ 1</div>
          </div>
          <div className="rounded-xl bg-white p-3 text-sm font-extrabold text-emerald-700">
            ✅ <FractionStack top={1} bottom={2} /> = <FractionStack top={2} bottom={4} />
            <div className="mt-1">ถูก เพราะคูณบนล่างด้วย 2</div>
          </div>
        </div>
      </Card>

      <Card className="text-center">
        <div className="text-5xl">🐰</div>
        <p className="mt-3 rounded-xl bg-violet-50 px-4 py-3 text-sm font-extrabold text-violet-700">
          ห้ามบวกตัวเศษและตัวส่วนเพื่อสร้างเศษส่วนที่เท่ากันนะครับ!
        </p>
      </Card>
    </div>
  );
}

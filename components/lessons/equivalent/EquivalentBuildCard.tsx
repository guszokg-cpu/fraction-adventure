import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader } from "@/components/lessons/equivalent/EquivalentMath";

export function EquivalentBuildCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={3} title="สร้างเศษส่วนที่เท่ากัน" />
      <div className="grid gap-4 p-4 md:grid-cols-2">
        <div className="rounded-xl bg-teal-50 p-4 text-center">
          <div className="text-xl font-extrabold text-brand-900">
            <FractionStack top={1} bottom={2} /> × <FractionStack top={2} bottom={2} /> ={" "}
            <FractionStack top={2} bottom={4} />
          </div>
          <p className="mt-2 text-sm font-bold text-slate-600">คูณตัวเศษและตัวส่วนด้วย 2</p>
        </div>
        <div className="rounded-xl bg-violet-50 p-4 text-center">
          <div className="text-xl font-extrabold text-brand-900">
            <FractionStack top={1} bottom={2} /> × <FractionStack top={3} bottom={3} /> ={" "}
            <FractionStack top={3} bottom={6} />
          </div>
          <p className="mt-2 text-sm font-bold text-slate-600">คูณตัวเศษและตัวส่วนด้วย 3</p>
        </div>
      </div>
      <div className="mx-4 mb-4 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-extrabold text-amber-700">
        คูณบนล่างด้วยจำนวนเดียวกัน ค่าเศษส่วนจะเท่าเดิม
      </div>
    </Card>
  );
}

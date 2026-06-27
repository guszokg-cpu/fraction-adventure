import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader } from "@/components/lessons/equivalent/EquivalentMath";

export function EquivalentReduceCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={4} title="ย่อกลับ ค่าไม่เปลี่ยน" />
      <div className="p-4">
        <div className="rounded-xl bg-white p-5 text-center ring-1 ring-teal-100">
          <div className="text-3xl font-extrabold text-brand-900">
            <FractionStack top={6} bottom={8} /> ÷ <FractionStack top={2} bottom={2} /> ={" "}
            <FractionStack top={3} bottom={4} />
          </div>
          <p className="mt-3 text-sm font-bold text-slate-600">หารตัวเศษและตัวส่วนด้วยจำนวนเดียวกัน ค่าไม่เปลี่ยน</p>
        </div>
      </div>
    </Card>
  );
}

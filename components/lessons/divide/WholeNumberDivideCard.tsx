import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader } from "@/components/lessons/divide/DivideMath";

export function WholeNumberDivideCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={5} title="จำนวนเต็ม ÷ เศษส่วน" />
      <div className="p-4">
        <div className="text-center text-2xl font-extrabold text-slate-950">
          2 ÷ <FractionStack top={1} bottom={4} />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {[1, 2].map((tray) => (
            <div key={tray} className="rounded-xl bg-amber-50 p-3 text-center ring-1 ring-amber-100">
              <FractionShape numerator={4} denominator={4} shape="circle" tone="accent" className="h-24 w-24" />
              <div className="mt-2 text-sm font-extrabold text-amber-700">พิซซ่าถาดที่ {tray}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-violet-50 px-4 py-3 text-center text-2xl font-extrabold text-violet-700">
          2 ถาด แบ่งเป็นชิ้นละ <FractionStack top={1} bottom={4} /> นับได้ 8 ชิ้น ตอบ 8
        </div>
      </div>
    </Card>
  );
}

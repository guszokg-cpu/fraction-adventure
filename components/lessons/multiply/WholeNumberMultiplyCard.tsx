import { Card } from "@/components/ui/Card";
import { FractionStack, MiniFractionBar, SectionHeader } from "@/components/lessons/multiply/MultiplyMath";

export function WholeNumberMultiplyCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={5} title="จำนวนเต็ม × เศษส่วน" />
      <div className="p-4">
        <div className="text-center text-2xl font-extrabold text-slate-950">
          3 × <FractionStack top={2} bottom={5} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((group) => (
            <MiniFractionBar key={group} numerator={2} denominator={5} tone="emerald" label={`กลุ่มที่ ${group}: 2/5`} />
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-orange-50 px-4 py-3 text-center text-2xl font-extrabold text-orange-700">
          รวมเป็น <FractionStack top={6} bottom={5} /> = 1 <FractionStack top={1} bottom={5} />
        </div>
      </div>
    </Card>
  );
}

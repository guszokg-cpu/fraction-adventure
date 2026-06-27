import { Card } from "@/components/ui/Card";
import { FractionStack, MiniFractionBar, SectionHeader } from "@/components/lessons/divide/DivideMath";

export function MultiplyVsDivideCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={8} title="เปรียบเทียบ คูณ vs หาร" />
      <div className="grid gap-4 p-4 md:grid-cols-2">
        <div className="rounded-xl bg-rose-50 p-4 text-center">
          <div className="text-lg font-extrabold text-rose-600">คูณ: เล็กลง</div>
          <MiniFractionBar numerator={1} denominator={8} tone="pink" className="mt-3" />
          <div className="mt-3 text-xl font-extrabold text-brand-900">
            <FractionStack top={1} bottom={2} /> × <FractionStack top={1} bottom={4} /> ={" "}
            <FractionStack top={1} bottom={8} />
          </div>
        </div>
        <div className="rounded-xl bg-amber-50 p-4 text-center">
          <div className="text-lg font-extrabold text-amber-700">หาร: ใหญ่ขึ้น</div>
          <MiniFractionBar numerator={2} denominator={2} tone="accent" className="mt-3" />
          <div className="mt-3 text-xl font-extrabold text-brand-900">
            <FractionStack top={1} bottom={2} /> ÷ <FractionStack top={1} bottom={4} /> = 2
          </div>
        </div>
      </div>
    </Card>
  );
}

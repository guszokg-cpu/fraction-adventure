import { Card } from "@/components/ui/Card";
import { FractionStack, MiniFractionBar, SectionHeader } from "@/components/lessons/equivalent/EquivalentMath";

export function EquivalentConceptCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={1} title="เศษส่วนที่เท่ากันคืออะไร?" />
      <div className="p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <MiniFractionBar numerator={1} denominator={2} label={<FractionStack top={1} bottom={2} />} tone="emerald" />
          <MiniFractionBar numerator={2} denominator={4} label={<FractionStack top={2} bottom={4} />} tone="emerald" />
          <MiniFractionBar numerator={3} denominator={6} label={<FractionStack top={3} bottom={6} />} tone="emerald" />
        </div>
        <div className="mt-4 rounded-xl bg-teal-50 px-4 py-3 text-center text-lg font-extrabold text-teal-700">
          <FractionStack top={1} bottom={2} /> = <FractionStack top={2} bottom={4} /> ={" "}
          <FractionStack top={3} bottom={6} />
        </div>
        <p className="mt-3 text-center text-sm font-bold text-slate-600">
          แม้แบ่งไม่เท่ากัน แต่ส่วนที่ระบายมีขนาดเท่ากัน จึงเป็นเศษส่วนที่เท่ากัน
        </p>
      </div>
    </Card>
  );
}

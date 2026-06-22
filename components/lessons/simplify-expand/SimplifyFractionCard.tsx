import { Volume2 } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";

const chain = [
  { numerator: 8, denominator: 12 },
  { numerator: 4, denominator: 6 },
  { numerator: 2, denominator: 3 }
];

export function SimplifyFractionCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">2</span>
          <h2 className="text-xl font-extrabold">ย่อเศษส่วน (หาร)</h2>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {chain.map((item, index) => (
            <div key={`${item.numerator}-${item.denominator}`} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-orange-50/70 p-4">
                <FractionShape numerator={item.numerator} denominator={item.denominator} shape="bar" tone="pink" className="h-10 w-40" />
                <FractionText numerator={item.numerator} denominator={item.denominator} className="text-2xl" toneClassName="text-pink-600" />
              </div>
              {index < chain.length - 1 && (
                <div className="flex flex-col items-center text-orange-600">
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-extrabold">÷ 2</span>
                  <span className="text-2xl font-extrabold">→</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xl font-extrabold text-brand-900">
          <FractionText numerator={8} denominator={12} className="text-xl" toneClassName="text-pink-600" />
          <span>÷ 2 =</span>
          <FractionText numerator={4} denominator={6} className="text-xl" toneClassName="text-pink-600" />
          <span>÷ 2 =</span>
          <FractionText numerator={2} denominator={3} className="text-xl" toneClassName="text-emerald-600" />
        </div>

        <div className="mt-4 flex items-center justify-center gap-3 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-700">
          <span>หารตัวเศษ และตัวส่วน ด้วยจำนวนเดียวกัน ค่าเท่าเดิม</span>
          <Volume2 size={18} className="shrink-0 text-amber-600" />
        </div>
      </div>
    </Card>
  );
}

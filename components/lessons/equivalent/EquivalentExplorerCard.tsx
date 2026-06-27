"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { FractionStack, MiniFractionBar, SectionHeader } from "@/components/lessons/equivalent/EquivalentMath";

const multipliers = [2, 3, 4];

export function EquivalentExplorerCard() {
  const [multiplier, setMultiplier] = useState(2);
  const result = useMemo(() => ({ top: 1 * multiplier, bottom: 2 * multiplier }), [multiplier]);

  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={5} title="เครื่องมือทดลองสร้างเศษส่วนที่เท่ากัน" />
      <div className="grid gap-4 p-4 md:grid-cols-[1fr_1.2fr]">
        <div className="rounded-xl bg-teal-50 p-4 text-center">
          <div className="text-sm font-extrabold text-teal-700">เศษส่วนตั้งต้น</div>
          <div className="mt-3 text-4xl font-extrabold text-brand-900">
            <FractionStack top={1} bottom={2} />
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {multipliers.map((item) => (
              <button
                key={item}
                onClick={() => setMultiplier(item)}
                className={`rounded-xl px-4 py-2 text-sm font-extrabold ${
                  multiplier === item ? "bg-violet-600 text-white" : "bg-white text-violet-700 ring-1 ring-violet-100"
                }`}
              >
                ×{item}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 text-center ring-1 ring-teal-100">
          <MiniFractionBar numerator={result.top} denominator={result.bottom} label={<FractionStack top={result.top} bottom={result.bottom} className="text-sm" />} tone="violet" />
          <div className="mt-4 text-xl font-extrabold text-violet-700">
            <FractionStack top={1} bottom={2} /> × <FractionStack top={multiplier} bottom={multiplier} /> ={" "}
            <FractionStack top={result.top} bottom={result.bottom} />
          </div>
        </div>
      </div>
    </Card>
  );
}

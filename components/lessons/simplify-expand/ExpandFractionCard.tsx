"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { expandMultipliers } from "@/data/lessonSimplifyExpand";

const BASE = { numerator: 1, denominator: 2 };

export function ExpandFractionCard() {
  const [multiplier, setMultiplier] = useState(2);
  const result = {
    numerator: BASE.numerator * multiplier,
    denominator: BASE.denominator * multiplier
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">1</span>
          <h2 className="text-xl font-extrabold">ขยายเศษส่วน (คูณ)</h2>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {expandMultipliers.map((value) => (
            <button
              key={value}
              onClick={() => setMultiplier(value)}
              className={cn(
                "h-11 rounded-xl border px-5 text-base font-extrabold transition",
                value === multiplier
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-orange-200 bg-white text-orange-600 hover:bg-orange-50"
              )}
            >
              ×{value}
            </button>
          ))}
        </div>

        <div className="mt-5 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-orange-50/70 p-4">
            <FractionShape numerator={BASE.numerator} denominator={BASE.denominator} shape="bar" tone="pink" className="h-12 w-48" />
            <FractionText numerator={BASE.numerator} denominator={BASE.denominator} className="text-3xl" toneClassName="text-pink-600" />
          </div>

          <div className="flex items-center justify-center gap-2 text-2xl font-extrabold text-slate-500">
            <span>×</span>
            <FractionText numerator={multiplier} denominator={multiplier} className="text-xl" toneClassName="text-orange-600" />
            <span>=</span>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-2xl bg-orange-50/70 p-4">
            <FractionShape numerator={result.numerator} denominator={result.denominator} shape="bar" tone="pink" className="h-12 w-48" />
            <FractionText numerator={result.numerator} denominator={result.denominator} className="text-3xl" toneClassName="text-pink-600" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-700">
          <span>คูณตัวเศษ และตัวส่วน ด้วยจำนวนเดียวกัน ค่าเท่าเดิม</span>
          <Volume2 size={18} className="shrink-0 text-amber-600" />
        </div>
      </div>
    </Card>
  );
}

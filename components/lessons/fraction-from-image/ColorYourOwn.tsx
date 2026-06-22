"use client";

import { useState } from "react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

const denominatorOptions = [2, 3, 4, 5, 6, 8];

export function ColorYourOwn() {
  const [denominator, setDenominator] = useState(8);
  const [numerator, setNumerator] = useState(5);
  const numeratorOptions = Array.from({ length: denominator + 1 }, (_, index) => index);

  function chooseDenominator(value: number) {
    setDenominator(value);
    setNumerator((current) => Math.min(current, value));
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">4</span>
          <h2 className="text-xl font-extrabold">ลองระบายเอง</h2>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_260px]">
        <div className="space-y-5">
          <div>
            <div className="text-sm font-extrabold text-brand-700">เลือกจำนวนส่วนทั้งหมด</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {denominatorOptions.map((value) => (
                <button
                  key={value}
                  onClick={() => chooseDenominator(value)}
                  className={cn(
                    "h-10 w-10 rounded-lg border text-sm font-extrabold transition",
                    value === denominator
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-brand-100 bg-white text-brand-700 hover:bg-brand-50"
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-extrabold text-brand-700">เลือกจำนวนส่วนที่ระบาย</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {numeratorOptions.map((value) => (
                <button
                  key={value}
                  onClick={() => setNumerator(value)}
                  className={cn(
                    "h-10 w-10 rounded-lg border text-sm font-extrabold transition",
                    value === numerator
                      ? "border-pink-500 bg-pink-500 text-white"
                      : "border-brand-100 bg-white text-brand-700 hover:bg-brand-50"
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
            {numerator}/{denominator} หมายถึง ระบายสี {numerator} ส่วน จากทั้งหมด {denominator} ส่วนที่เท่ากัน
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-brand-100 bg-brand-50/50 p-5">
          <FractionShape numerator={numerator} denominator={denominator} shape="bar" tone="accent" className="h-24 w-56" />
          <div className="mt-4 text-5xl font-extrabold text-pink-600">
            {numerator}/{denominator}
          </div>
        </div>
      </div>
    </Card>
  );
}

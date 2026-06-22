"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { NumberLineStrip } from "@/components/lessons/number-line/NumberLineStrip";

const denominatorOptions = [2, 3, 4, 5, 6, 8];

export function NumberLineBuilder() {
  const [denominator, setDenominator] = useState(4);
  const [numerator, setNumerator] = useState(3);
  const numeratorOptions = Array.from({ length: denominator + 1 }, (_, index) => index);

  function chooseDenominator(value: number) {
    setDenominator(value);
    setNumerator((current) => Math.min(current, value));
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">4</span>
          <h2 className="text-xl font-extrabold">ลองวางจุดเอง</h2>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[260px_1fr]">
        <div className="space-y-5">
          <div>
            <div className="text-sm font-extrabold text-brand-700">เลือกตัวส่วน (จำนวนช่อง)</div>
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
            <div className="text-sm font-extrabold text-brand-700">เลือกตัวเศษ (นับกี่ช่อง)</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {numeratorOptions.map((value) => (
                <button
                  key={value}
                  onClick={() => setNumerator(value)}
                  className={cn(
                    "h-10 w-10 rounded-lg border text-sm font-extrabold transition",
                    value === numerator
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-brand-100 bg-white text-brand-700 hover:bg-brand-50"
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
            {numerator}/{denominator} หมายถึง นับจาก 0 ไป {numerator} ช่อง จากทั้งหมด {denominator} ช่องที่เท่ากัน
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-brand-100 bg-teal-50/40 p-5">
          <NumberLineStrip
            denominator={denominator}
            marker={numerator}
            tone="emerald"
            className="h-36 w-full max-w-lg"
          />
          <div className="mt-3 text-5xl font-extrabold text-emerald-600">
            {numerator}/{denominator}
          </div>
        </div>
      </div>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { MousePointerClick } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { FractionStack } from "@/components/fractions/FractionStack";
import { DraggableNumberLine } from "@/components/lessons/number-line/DraggableNumberLine";

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
      <div className="flex items-center gap-3 bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-5 text-white">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">3</span>
        <div>
          <h2 className="text-2xl font-extrabold">สร้างเส้นจำนวน</h2>
          <p className="mt-0.5 text-sm font-bold text-teal-100">เลือกตัวส่วนกับตัวเศษ หรือลากจุดบนเส้นเองได้เลย</p>
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

          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
            <FractionStack top={numerator} bottom={denominator} className="text-base" />
            หมายถึง นับจาก 0 ไป {numerator} ช่อง จากทั้งหมด {denominator} ช่องที่เท่ากัน
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-brand-100 bg-teal-50/40 p-5">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
            <MousePointerClick size={14} /> คลิกหรือลากจุดบนเส้นเพื่อเลื่อน
          </div>
          <DraggableNumberLine
            denominator={denominator}
            value={numerator}
            onChange={setNumerator}
            tone="emerald"
            className="w-full max-w-lg"
          />
          <div className="mt-3 flex justify-center text-5xl font-extrabold text-emerald-600">
            <FractionStack top={numerator} bottom={denominator} />
          </div>
        </div>
      </div>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack } from "@/components/fractions/FractionStack";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { builderDenominators, builderShapes } from "@/data/lessonFractionIntro";
import type { FractionShapeKind } from "@/types/lessonContent";

export function FractionBuilder() {
  const [denominator, setDenominator] = useState(6);
  const [numerator, setNumerator] = useState(4);
  const [shape, setShape] = useState<FractionShapeKind>("circle");

  const numeratorOptions = Array.from({ length: denominator + 1 }, (_, i) => i);

  function handleDenominator(next: number) {
    setDenominator(next);
    if (numerator > next) {
      setNumerator(next);
    }
  }

  return (
    <Card>
      <div className="flex items-center gap-2">
        <span className="text-xl font-extrabold text-brand-900">ทดลองสร้างเศษส่วน</span>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">ปรับค่าแล้วดูผลทันที</span>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <div>
            <div className="text-sm font-extrabold text-brand-700">
              1. เลือกจำนวนส่วนทั้งหมด (ตัวส่วน — แบ่งเท่า ๆ กัน)
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {builderDenominators.map((value) => (
                <button
                  key={value}
                  onClick={() => handleDenominator(value)}
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
            <div className="text-sm font-extrabold text-brand-700">2. เลือกจำนวนส่วนที่ระบาย (ตัวเศษ — ส่วนที่เลือก)</div>
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

          <div>
            <div className="text-sm font-extrabold text-brand-700">3. เลือกรูปแบบภาพ</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {builderShapes.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setShape(item.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-extrabold transition",
                    item.id === shape
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-brand-100 bg-white text-slate-600 hover:bg-brand-50"
                  )}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-brand-100 bg-brand-50/50 p-5">
          <FractionShape
            numerator={numerator}
            denominator={denominator}
            shape={shape}
            tone="emerald"
            className="h-40 w-40"
          />
          <div className="mt-4 flex justify-center text-5xl font-extrabold leading-none text-emerald-600">
            <FractionStack top={numerator} bottom={denominator} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-1 rounded-lg bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-700">
        <FractionStack top={numerator} bottom={denominator} className="text-base" />
        หมายถึง ระบาย {numerator} ส่วน จากทั้งหมด {denominator} ส่วนที่เท่า ๆ กัน
      </div>
    </Card>
  );
}

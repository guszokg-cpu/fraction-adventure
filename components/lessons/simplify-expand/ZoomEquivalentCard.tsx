"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { zoomSteps } from "@/data/lessonSimplifyExpand";

export function ZoomEquivalentCard() {
  const [level, setLevel] = useState(0);
  const current = zoomSteps[level];

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">3</span>
          <h2 className="text-xl font-extrabold">ซูมภาพ (ค่าไม่เปลี่ยน)</h2>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {zoomSteps.map((step, index) => (
            <div key={`${step.numerator}-${step.denominator}`} className="flex items-center gap-2">
              <button
                onClick={() => setLevel(index)}
                className={cn(
                  "rounded-xl border px-3 py-2 transition",
                  index === level ? "border-orange-500 bg-orange-50" : "border-orange-200 bg-white hover:bg-orange-50"
                )}
              >
                <FractionText
                  numerator={step.numerator}
                  denominator={step.denominator}
                  className="text-xl"
                  toneClassName={index === level ? "text-orange-600" : "text-slate-500"}
                />
              </button>
              {index < zoomSteps.length - 1 && <span className="text-xl font-extrabold text-slate-400">→</span>}
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl bg-orange-50/70 p-5">
          <FractionShape numerator={current.numerator} denominator={current.denominator} shape="bar" tone="pink" className="h-16 w-full max-w-md" />
          <FractionText numerator={current.numerator} denominator={current.denominator} className="text-4xl" toneClassName="text-pink-600" />
        </div>

        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            onClick={() => setLevel((value) => Math.max(0, value - 1))}
            disabled={level === 0}
            className="grid h-11 w-11 place-items-center rounded-full border border-orange-200 bg-white text-orange-600 transition hover:bg-orange-50 disabled:opacity-40"
            aria-label="ย่อ"
          >
            <Minus size={20} />
          </button>
          <span className="text-sm font-extrabold text-amber-700">แบ่งเพิ่มขึ้น แต่พื้นที่สีเท่าเดิม</span>
          <button
            onClick={() => setLevel((value) => Math.min(zoomSteps.length - 1, value + 1))}
            disabled={level === zoomSteps.length - 1}
            className="grid h-11 w-11 place-items-center rounded-full border border-orange-200 bg-white text-orange-600 transition hover:bg-orange-50 disabled:opacity-40"
            aria-label="แบ่งเพิ่ม"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </Card>
  );
}

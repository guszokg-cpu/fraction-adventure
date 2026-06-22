"use client";

import { useState } from "react";
import { BarChart3, CheckCircle, Lightbulb, Volume2, XCircle } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";

const signs = [">", "<", "="] as const;
type Sign = (typeof signs)[number];

const correctSign: Sign = ">"; // 1/2 > 1/3

export function CompareQuestionCard() {
  const [selected, setSelected] = useState<Sign | null>(null);
  const isCorrect = selected === correctSign;

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">1</span>
          <h2 className="text-xl font-extrabold">ใครมากกว่า?</h2>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-emerald-50/70 p-5 sm:gap-8">
          <div className="flex flex-col items-center gap-2">
            <FractionShape numerator={1} denominator={2} tone="sky" className="h-28 w-28" />
            <StackedFraction numerator={1} denominator={2} className="text-3xl" toneClassName="text-sky-600" />
          </div>

          <div className="text-4xl font-extrabold text-slate-400">?</div>

          <div className="flex flex-col items-center gap-2">
            <FractionShape numerator={1} denominator={3} tone="emerald" className="h-28 w-28" />
            <StackedFraction numerator={1} denominator={3} className="text-3xl" toneClassName="text-emerald-600" />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          {signs.map((sign) => {
            const active = selected === sign;
            return (
              <button
                key={sign}
                onClick={() => setSelected(sign)}
                aria-label={`เลือกเครื่องหมาย ${sign}`}
                className={cn(
                  "grid h-14 w-14 place-items-center rounded-xl border text-3xl font-extrabold transition",
                  !active && "border-brand-100 bg-white text-brand-700 hover:bg-brand-50",
                  active && isCorrect && "border-emerald-300 bg-emerald-500 text-white",
                  active && !isCorrect && "border-rose-300 bg-rose-50 text-rose-600"
                )}
              >
                {sign}
              </button>
            );
          })}
        </div>

        {selected && (
          <div
            className={cn(
              "mx-auto mt-4 flex max-w-md items-center justify-center gap-3 rounded-xl px-4 py-3 text-base font-extrabold",
              isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            )}
          >
            {isCorrect ? <CheckCircle size={22} /> : <XCircle size={22} />}
            {isCorrect ? (
              <span className="flex items-center gap-2">
                เฉลย:
                <StackedFraction numerator={1} denominator={2} className="text-xl" toneClassName="text-emerald-700" />
                <span className="text-2xl">&gt;</span>
                <StackedFraction numerator={1} denominator={3} className="text-xl" toneClassName="text-emerald-700" />
              </span>
            ) : (
              <span>ลองดูภาพอีกครั้ง ภาพซ้ายระบายมากกว่า คำตอบที่ถูกคือ &gt;</span>
            )}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 text-sm font-bold text-emerald-700 hover:bg-emerald-50">
            <BarChart3 size={18} />
            ดูแผนภาพ
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 text-sm font-bold text-emerald-700 hover:bg-emerald-50">
            <Lightbulb size={18} />
            วิธีคิด
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 text-sm font-bold text-emerald-700 hover:bg-emerald-50">
            <Volume2 size={18} />
            ฟังคำอธิบาย
          </button>
        </div>
      </div>
    </Card>
  );
}

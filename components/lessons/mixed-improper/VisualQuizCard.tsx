"use client";

import { useState } from "react";
import { CheckCircle, Volume2, XCircle } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type Choice = { id: string; whole?: number; num: number; den: number; correct: boolean };

const CHOICES: Choice[] = [
  { id: "A", num: 1, den: 2, correct: false },
  { id: "B", whole: 1, num: 1, den: 2, correct: true },
  { id: "C", num: 2, den: 2, correct: false },
  { id: "D", num: 3, den: 2, correct: false }
];

export function VisualQuizCard() {
  const [selected, setSelected] = useState<string | null>(null);
  const chosen = CHOICES.find((c) => c.id === selected);

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">6</span>
            <h2 className="text-xl font-extrabold">ดูภาพ ตอบคำถาม</h2>
          </div>
          <button className="flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1 text-xs font-bold hover:bg-white/30">
            <Volume2 size={14} />
            ฟัง
          </button>
        </div>
      </div>
      <div className="p-5">
        {/* Image: 1 full + 1/2 */}
        <div className="flex items-center justify-center gap-4 rounded-2xl bg-pink-50/60 p-4">
          <FractionShape numerator={2} denominator={2} tone="pink" className="h-20 w-20" />
          <span className="text-2xl font-extrabold text-slate-400">+</span>
          <FractionShape numerator={1} denominator={2} tone="pink" className="h-20 w-20" />
        </div>

        <p className="mt-4 text-center text-base font-extrabold text-brand-900">ภาพนี้คือจำนวนใด?</p>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {CHOICES.map((choice) => {
            const active = selected === choice.id;
            return (
              <button
                key={choice.id}
                onClick={() => setSelected(choice.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 transition",
                  !active && "border-pink-100 bg-white text-brand-900 hover:bg-pink-50",
                  active && choice.correct && "border-emerald-300 bg-emerald-50 text-emerald-700",
                  active && !choice.correct && "border-rose-300 bg-rose-50 text-rose-600"
                )}
              >
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-extrabold",
                    !active && "bg-pink-100 text-pink-600",
                    active && choice.correct && "bg-emerald-500 text-white",
                    active && !choice.correct && "bg-rose-400 text-white"
                  )}
                >
                  {choice.id}
                </span>
                <span className="flex items-center gap-0.5">
                  {choice.whole !== undefined && (
                    <span className="text-xl font-extrabold">{choice.whole}</span>
                  )}
                  <FractionText
                    numerator={choice.num}
                    denominator={choice.den}
                    className="text-xl"
                    toneClassName="text-inherit"
                  />
                </span>
              </button>
            );
          })}
        </div>

        {selected && (
          <div
            className={cn(
              "mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold",
              chosen?.correct ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            )}
          >
            {chosen?.correct ? <CheckCircle size={20} /> : <XCircle size={20} />}
            {chosen?.correct
              ? "ถูกต้อง! 1 วงเต็ม + ½ วง = 1½"
              : "ลองดูอีกครั้ง นับ 1 วงเต็ม + ครึ่งวง = 1½"}
          </div>
        )}
      </div>
    </Card>
  );
}

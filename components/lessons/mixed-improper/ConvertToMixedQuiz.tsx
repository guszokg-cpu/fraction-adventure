"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type Option = { whole: number; num: number; den: number; correct: boolean };
type Question = { id: string; num: number; den: number; options: Option[] };

// 9/4 = 2 R 1 → 2 1/4    11/3 = 3 R 2 → 3 2/3
const QUESTIONS: Question[] = [
  {
    id: "q1",
    num: 9,
    den: 4,
    options: [
      { whole: 2, num: 1, den: 4, correct: true },
      { whole: 1, num: 3, den: 4, correct: false },
      { whole: 2, num: 3, den: 4, correct: false }
    ]
  },
  {
    id: "q2",
    num: 11,
    den: 3,
    options: [
      { whole: 3, num: 1, den: 3, correct: false },
      { whole: 3, num: 2, den: 3, correct: true },
      { whole: 2, num: 1, den: 3, correct: false }
    ]
  }
];

export function ConvertToMixedQuiz() {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">7</span>
          <h2 className="text-xl font-extrabold">แปลงเศษเกินเป็นจำนวนคละ</h2>
        </div>
      </div>
      <div className="space-y-4 p-5">
        {QUESTIONS.map((q, qi) => {
          const sel = answers[q.id];
          return (
            <div key={q.id} className="rounded-xl border border-pink-100 bg-pink-50/40 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-pink-500 text-xs font-extrabold text-white">
                  {qi + 1}
                </span>
                <div className="flex items-center gap-2">
                  <FractionText numerator={q.num} denominator={q.den} className="text-2xl" toneClassName="text-pink-700" />
                  <span className="font-bold text-slate-500">=</span>
                  <span className="text-xl font-extrabold text-slate-400">?</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt, oi) => {
                  const active = sel === oi;
                  return (
                    <button
                      key={oi}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                      className={cn(
                        "flex items-center gap-0.5 rounded-lg border px-3 py-2 font-extrabold transition",
                        !active && "border-pink-200 bg-white text-brand-900 hover:bg-pink-50",
                        active && opt.correct && "border-emerald-300 bg-emerald-50 text-emerald-700",
                        active && !opt.correct && "border-rose-300 bg-rose-50 text-rose-600"
                      )}
                    >
                      {active && opt.correct && <CheckCircle size={14} className="mr-1 shrink-0" />}
                      <span className="text-lg">{opt.whole}</span>
                      <FractionText
                        numerator={opt.num}
                        denominator={opt.den}
                        className="text-base"
                        toneClassName="text-inherit"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

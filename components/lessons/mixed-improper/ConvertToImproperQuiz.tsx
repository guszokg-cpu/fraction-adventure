"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type Option = { num: number; den: number; correct: boolean };
type Question = { id: string; whole: number; num: number; den: number; options: Option[] };

// 2 2/5 = 2×5+2 = 12/5    3 1/4 = 3×4+1 = 13/4
const QUESTIONS: Question[] = [
  {
    id: "q1",
    whole: 2,
    num: 2,
    den: 5,
    options: [
      { num: 12, den: 5, correct: true },
      { num: 11, den: 5, correct: false },
      { num: 7, den: 5, correct: false }
    ]
  },
  {
    id: "q2",
    whole: 3,
    num: 1,
    den: 4,
    options: [
      { num: 14, den: 4, correct: false },
      { num: 13, den: 4, correct: true },
      { num: 15, den: 4, correct: false }
    ]
  }
];

export function ConvertToImproperQuiz() {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">8</span>
          <h2 className="text-xl font-extrabold">แปลงจำนวนคละเป็นเศษเกิน</h2>
        </div>
      </div>
      <div className="space-y-4 p-5">
        {QUESTIONS.map((q, qi) => {
          const sel = answers[q.id];
          return (
            <div key={q.id} className="rounded-xl border border-fuchsia-100 bg-fuchsia-50/40 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-fuchsia-500 text-xs font-extrabold text-white">
                  {qi + 1}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-extrabold text-fuchsia-700">{q.whole}</span>
                  <FractionText numerator={q.num} denominator={q.den} className="text-2xl" toneClassName="text-fuchsia-700" />
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
                        "rounded-lg border px-3 py-2 font-extrabold transition",
                        !active && "border-fuchsia-200 bg-white text-brand-900 hover:bg-fuchsia-50",
                        active && opt.correct && "border-emerald-300 bg-emerald-50 text-emerald-700",
                        active && !opt.correct && "border-rose-300 bg-rose-50 text-rose-600"
                      )}
                    >
                      <div className="flex items-center gap-1">
                        {active && opt.correct && <CheckCircle size={14} className="shrink-0" />}
                        <FractionText
                          numerator={opt.num}
                          denominator={opt.den}
                          className="text-lg"
                          toneClassName="text-inherit"
                        />
                      </div>
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

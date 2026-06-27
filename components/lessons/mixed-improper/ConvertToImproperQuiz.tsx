"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, Shuffle } from "lucide-react";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { randomMixed, wrongImproperOpts } from "@/lib/randomFraction";
import type { ImproperOpt } from "@/lib/randomFraction";

type Question = { id: string; whole: number; num: number; den: number; options: ImproperOpt[] };

function makeQuestion(id: string): Question {
  const { whole, num, den } = randomMixed(2, 6);
  const result = whole * den + num;
  return { id, whole, num, den, options: wrongImproperOpts(result, den) };
}

function makeQuestions(): Question[] {
  return ["q1", "q2"].map(makeQuestion);
}

export function ConvertToImproperQuiz() {
  // null = ยังไม่ mount (SSR) ป้องกัน hydration mismatch จาก Math.random()
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  useEffect(() => { setQuestions(makeQuestions()); }, []);

  const randomize = useCallback(() => {
    setQuestions(makeQuestions());
    setAnswers({});
  }, []);

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-3 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">8</span>
            <h2 className="text-xl font-extrabold">แปลงจำนวนคละเป็นเศษเกิน</h2>
          </div>
          <button
            onClick={randomize}
            className="flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-extrabold transition hover:bg-white/30"
          >
            <Shuffle size={13} />
            สุ่มใหม่
          </button>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {!questions && (
          <div className="flex h-24 items-center justify-center text-sm text-slate-400">กำลังโหลด...</div>
        )}
        {questions?.map((q, qi) => {
          const sel = answers[q.id];
          return (
            <div key={q.id} className="rounded-xl border border-fuchsia-100 bg-fuchsia-50/40 p-4">
              {/* Question */}
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

              {/* Options */}
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
                        active && opt.correct  && "border-emerald-300 bg-emerald-50 text-emerald-700",
                        active && !opt.correct && "border-rose-300 bg-rose-50 text-rose-600",
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

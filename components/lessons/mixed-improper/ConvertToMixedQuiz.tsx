"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, Shuffle } from "lucide-react";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { randomImproper, wrongMixedOpts } from "@/lib/randomFraction";
import type { MixedOpt } from "@/lib/randomFraction";

type Question = { id: string; num: number; den: number; options: MixedOpt[] };

function makeQuestion(id: string): Question {
  const { num, den } = randomImproper(2, 6);
  const whole = Math.floor(num / den);
  const remainder = num % den;
  return { id, num, den, options: wrongMixedOpts(whole, remainder, den) };
}

function makeQuestions(): Question[] {
  return ["q1", "q2"].map(makeQuestion);
}

export function ConvertToMixedQuiz() {
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
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">7</span>
            <h2 className="text-xl font-extrabold">แปลงเศษเกินเป็นจำนวนคละ</h2>
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
            <div key={q.id} className="rounded-xl border border-pink-100 bg-pink-50/40 p-4">
              {/* Question */}
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

              {/* Options */}
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
                        active && opt.correct  && "border-emerald-300 bg-emerald-50 text-emerald-700",
                        active && !opt.correct && "border-rose-300 bg-rose-50 text-rose-600",
                      )}
                    >
                      {active && opt.correct && <CheckCircle size={14} className="mr-1 shrink-0" />}
                      <span className="text-lg">{opt.whole}</span>
                      {opt.num > 0 && (
                        <FractionText
                          numerator={opt.num}
                          denominator={opt.den}
                          className="text-base"
                          toneClassName="text-inherit"
                        />
                      )}
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

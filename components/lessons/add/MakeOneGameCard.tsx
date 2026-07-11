"use client";

import { useState } from "react";
import { Check, Shuffle, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader, TwoToneBar } from "@/components/lessons/add/FractionMath";
import { FractionShape } from "@/components/fractions/FractionShape";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

type Round = { a: number; den: number; options: number[] };

function makeRound(): Round {
  const den = randInt(4, 10);
  const a = randInt(1, den - 1);
  const correct = den - a;
  const seen = new Set([correct]);
  const wrongs: number[] = [];
  const candidates = shuffle([correct + 1, correct - 1, a, den, correct + 2]);
  for (const c of candidates) {
    if (c < 1 || c > den + 2 || seen.has(c)) continue;
    seen.add(c);
    wrongs.push(c);
    if (wrongs.length === 3) break;
  }
  return { a, den, options: shuffle([correct, ...wrongs]) };
}

export function MakeOneGameCard() {
  const [round, setRound] = useState<Round>(() => makeRound());
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const { a, den, options } = round;
  const correct = den - a;
  const answered = picked !== null;
  const pickedCorrect = answered && options[picked] === correct;

  function choose(i: number) {
    if (answered) return;
    setPicked(i);
    setScore((s) => ({ correct: s.correct + (options[i] === correct ? 1 : 0), total: s.total + 1 }));
  }

  function next() {
    setRound(makeRound());
    setPicked(null);
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-sky-500 px-4 py-2.5 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-sm font-extrabold">4</span>
          <h2 className="text-lg font-extrabold">เกมเติมให้เต็ม 1 🎯</h2>
        </div>
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">
          ถูก {score.correct}/{score.total}
        </span>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {/* โจทย์ */}
        <div className="flex items-center justify-center gap-3 rounded-2xl bg-blue-50 px-4 py-4 text-3xl font-extrabold sm:text-4xl">
          <FractionStack top={a} bottom={den} className="text-sky-600" />
          <span className="text-slate-400">+</span>
          {answered ? (
            <FractionStack top={correct} bottom={den} className="text-violet-600" />
          ) : (
            <FractionStack top="?" bottom={den} className="text-violet-400" />
          )}
          <span className="text-slate-400">=</span>
          <span className="text-blue-700">1</span>
        </div>

        {/* บาร์: ส่วนที่มีแล้ว + ช่องว่างที่ต้องเติม */}
        <div className="mx-auto max-w-xl">
          {answered ? (
            <TwoToneBar a={a} b={correct} denominator={den} className="h-11 w-full sm:h-12" />
          ) : (
            <FractionShape numerator={a} denominator={den} shape="bar" tone="sky" className="h-11 w-full sm:h-12" />
          )}
          <p className="mt-2 text-center text-sm font-bold text-slate-500">
            {answered ? "สีม่วงคือชิ้นที่เติมเข้าไปจนเต็มแท่งพอดี" : `มีแล้ว ${a} ช่อง จากทั้งหมด ${den} ช่อง — ขาดอีกกี่ช่องถึงจะเต็ม?`}
          </p>
        </div>

        {/* ตัวเลือก */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {options.map((o, i) => {
            const isCorrectOpt = o === correct;
            const isPicked = picked === i;
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={answered}
                className={cn(
                  "flex min-h-16 items-center justify-center rounded-2xl border-2 bg-white p-3 transition",
                  !answered && "border-slate-200 hover:border-blue-300 hover:bg-blue-50",
                  answered && isCorrectOpt && "border-emerald-400 bg-emerald-50",
                  answered && !isCorrectOpt && isPicked && "border-rose-400 bg-rose-50",
                  answered && !isCorrectOpt && !isPicked && "border-slate-100 opacity-60"
                )}
              >
                <FractionStack top={o} bottom={den} className="text-2xl text-slate-700 sm:text-3xl" />
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="space-y-3">
            <div
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-extrabold sm:text-lg",
                pickedCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-50 text-rose-600"
              )}
            >
              {pickedCorrect ? <Check size={20} className="shrink-0" /> : <X size={20} className="shrink-0" />}
              {pickedCorrect ? "ถูกต้อง!" : "ยังไม่ถูก"} — {a} + {correct} = {den} พอดี ({den}/{den} = 1 เต็ม)
            </div>
            <div className="flex justify-center">
              <button
                onClick={next}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-blue-700 active:scale-[0.98] sm:text-base"
              >
                <Shuffle size={16} /> ข้อต่อไป
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

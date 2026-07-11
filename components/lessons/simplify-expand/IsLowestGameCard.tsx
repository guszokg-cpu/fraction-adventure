"use client";

import { useState } from "react";
import { Check, Shuffle, X } from "lucide-react";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { gcd, simplifyFraction } from "@/lib/fractionUtils";
import { randInt } from "@/lib/randomFraction";

type Fraction = { numerator: number; denominator: number };

const LOWEST_POOL: Fraction[] = [
  { numerator: 1, denominator: 2 },
  { numerator: 1, denominator: 3 },
  { numerator: 2, denominator: 3 },
  { numerator: 1, denominator: 4 },
  { numerator: 3, denominator: 4 },
  { numerator: 2, denominator: 5 },
  { numerator: 3, denominator: 5 },
  { numerator: 1, denominator: 6 },
  { numerator: 5, denominator: 6 },
  { numerator: 3, denominator: 7 },
];

function makeRound(): Fraction {
  const base = LOWEST_POOL[randInt(0, LOWEST_POOL.length - 1)];
  if (Math.random() < 0.5) return base;
  const k = randInt(2, 4);
  return { numerator: base.numerator * k, denominator: base.denominator * k };
}

export function IsLowestGameCard() {
  const [current, setCurrent] = useState<Fraction>(() => makeRound());
  const [picked, setPicked] = useState<"lowest" | "reducible" | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const isLowest = gcd(current.numerator, current.denominator) === 1;
  const answered = picked !== null;
  const guessCorrect = answered && (picked === "lowest") === isLowest;
  const reduced = simplifyFraction(current.numerator, current.denominator);

  function choose(guess: "lowest" | "reducible") {
    if (answered) return;
    setPicked(guess);
    setScore((s) => ({ correct: s.correct + ((guess === "lowest") === isLowest ? 1 : 0), total: s.total + 1 }));
  }

  function next() {
    setCurrent(makeRound());
    setPicked(null);
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">4</span>
          <h2 className="text-xl font-extrabold">อย่างต่ำหรือยัง?</h2>
        </div>
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">
          ถูก {score.correct}/{score.total}
        </span>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex items-center justify-center rounded-2xl bg-orange-50/70 p-6">
          <FractionText numerator={current.numerator} denominator={current.denominator} className="text-5xl text-brand-900 sm:text-6xl" />
        </div>

        {!answered ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => choose("lowest")}
              className="h-14 rounded-xl bg-emerald-600 px-6 text-base font-extrabold text-white shadow-md transition hover:bg-emerald-700 active:scale-[0.98] sm:text-lg"
            >
              อย่างต่ำแล้ว ✅
            </button>
            <button
              onClick={() => choose("reducible")}
              className="h-14 rounded-xl bg-amber-500 px-6 text-base font-extrabold text-white shadow-md transition hover:bg-amber-600 active:scale-[0.98] sm:text-lg"
            >
              ยังย่อได้อีก ➗
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-base font-extrabold sm:text-lg",
                guessCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-50 text-rose-600"
              )}
            >
              {guessCorrect ? <Check size={20} className="shrink-0" /> : <X size={20} className="shrink-0" />}
              {guessCorrect ? "ถูกต้อง!" : "ยังไม่ถูก"}
            </div>
            <p className="text-center text-sm font-bold text-slate-600 sm:text-base">
              {isLowest ? (
                <>หารต่อไม่ได้อีกแล้ว (ห.ร.ม. = 1) จึงเป็น<span className="text-emerald-700">เศษส่วนอย่างต่ำ</span></>
              ) : (
                <>
                  หารทั้งเศษและส่วนด้วย {gcd(current.numerator, current.denominator)} ได้{" "}
                  <FractionText numerator={reduced.numerator} denominator={reduced.denominator} className="mx-1 inline-flex text-base" toneClassName="text-emerald-700" />
                </>
              )}
            </p>
            <div className="flex justify-center">
              <button
                onClick={next}
                className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-orange-600 active:scale-[0.98] sm:text-base"
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

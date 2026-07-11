"use client";

import { useState } from "react";
import { PartyPopper, Shuffle } from "lucide-react";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

type Pair = { id: number; impNum: number; whole: number; num: number; den: number };

function makeRound(): { pairs: Pair[]; leftOrder: number[]; rightOrder: number[] } {
  // ตัวส่วนไม่ซ้ำกันในรอบเดียว — กันกรณีค่าเท่ากันข้ามคู่ (เช่น 3/2 กับ 6/4) ที่ทำให้เฉลยกำกวม
  const dens = shuffle([2, 3, 4, 5, 6]).slice(0, 4);
  const pairs: Pair[] = dens.map((den, id) => {
    const whole = randInt(1, 4);
    const num = randInt(1, den - 1);
    return { id, impNum: whole * den + num, whole, num, den };
  });
  return { pairs, leftOrder: shuffle(pairs.map((p) => p.id)), rightOrder: shuffle(pairs.map((p) => p.id)) };
}

export function MatchMixedGameCard() {
  const [round, setRound] = useState(() => makeRound());
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongPulse, setWrongPulse] = useState<{ left: number; right: number } | null>(null);

  const pairMap = new Map(round.pairs.map((p) => [p.id, p]));
  const allMatched = matched.size === round.pairs.length;

  function clickLeft(id: number) {
    if (matched.has(id) || wrongPulse) return;
    setSelectedLeft((cur) => (cur === id ? null : id));
  }

  function clickRight(id: number) {
    if (matched.has(id) || selectedLeft === null || wrongPulse) return;
    if (id === selectedLeft) {
      setMatched((prev) => new Set(prev).add(id));
      setSelectedLeft(null);
    } else {
      setWrongPulse({ left: selectedLeft, right: id });
      window.setTimeout(() => {
        setWrongPulse(null);
        setSelectedLeft(null);
      }, 500);
    }
  }

  function newRound() {
    setRound(makeRound());
    setSelectedLeft(null);
    setMatched(new Set());
    setWrongPulse(null);
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">5</span>
          <h2 className="text-xl font-extrabold">จับคู่เศษเกิน–จำนวนคละ</h2>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <p className="text-center text-sm font-bold text-slate-600 sm:text-base">
          แตะเศษเกินทางซ้าย แล้วแตะจำนวนคละที่มีค่าเท่ากันทางขวา
        </p>

        <div className="grid grid-cols-2 gap-4 sm:gap-8">
          <div className="space-y-3">
            {round.leftOrder.map((id) => {
              const pair = pairMap.get(id)!;
              const isMatched = matched.has(id);
              const isSelected = selectedLeft === id;
              const isWrong = wrongPulse?.left === id;
              return (
                <button
                  key={id}
                  onClick={() => clickLeft(id)}
                  disabled={isMatched}
                  className={cn(
                    "flex h-16 w-full items-center justify-center rounded-xl border-2 transition sm:h-20",
                    isMatched && "border-emerald-300 bg-emerald-50 opacity-60",
                    !isMatched && isWrong && "border-rose-400 bg-rose-50",
                    !isMatched && !isWrong && isSelected && "border-pink-500 bg-pink-50 shadow-md",
                    !isMatched && !isWrong && !isSelected && "border-pink-100 bg-white hover:bg-pink-50"
                  )}
                >
                  <FractionText numerator={pair.impNum} denominator={pair.den} className="text-2xl sm:text-3xl" toneClassName="text-pink-600" />
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {round.rightOrder.map((id) => {
              const pair = pairMap.get(id)!;
              const isMatched = matched.has(id);
              const isWrong = wrongPulse?.right === id;
              return (
                <button
                  key={id}
                  onClick={() => clickRight(id)}
                  disabled={isMatched}
                  className={cn(
                    "flex h-16 w-full items-center justify-center gap-1 rounded-xl border-2 transition sm:h-20",
                    isMatched && "border-emerald-300 bg-emerald-50 opacity-60",
                    !isMatched && isWrong && "border-rose-400 bg-rose-50",
                    !isMatched && !isWrong && "border-fuchsia-100 bg-white hover:bg-fuchsia-50"
                  )}
                >
                  <span className="text-2xl font-extrabold text-fuchsia-600 sm:text-3xl">{pair.whole}</span>
                  <FractionText numerator={pair.num} denominator={pair.den} className="text-xl sm:text-2xl" toneClassName="text-fuchsia-600" />
                </button>
              );
            })}
          </div>
        </div>

        {allMatched && (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-100 px-4 py-3 text-center text-base font-extrabold text-emerald-700 sm:text-lg">
            <PartyPopper size={22} className="shrink-0" /> จับคู่ครบแล้ว เก่งมาก!
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={newRound}
            className="flex items-center gap-1.5 rounded-xl bg-pink-600 px-6 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-pink-700 active:scale-[0.98] sm:text-base"
          >
            <Shuffle size={16} /> เล่นรอบใหม่
          </button>
        </div>
      </div>
    </Card>
  );
}

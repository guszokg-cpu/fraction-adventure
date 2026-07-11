"use client";

import { useState } from "react";
import { PartyPopper, Shuffle } from "lucide-react";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

type Fraction = { numerator: number; denominator: number };
type Pair = { id: number; big: Fraction; low: Fraction };

const LOW_POOL: Fraction[] = [
  { numerator: 1, denominator: 2 },
  { numerator: 1, denominator: 3 },
  { numerator: 2, denominator: 3 },
  { numerator: 1, denominator: 4 },
  { numerator: 3, denominator: 4 },
  { numerator: 2, denominator: 5 },
  { numerator: 3, denominator: 5 },
  { numerator: 1, denominator: 6 },
  { numerator: 5, denominator: 6 },
];

function makeRound(): { pairs: Pair[]; leftOrder: number[]; rightOrder: number[] } {
  const chosen = shuffle(LOW_POOL).slice(0, 4);
  const pairs: Pair[] = chosen.map((low, id) => {
    const k = randInt(2, 4);
    return { id, big: { numerator: low.numerator * k, denominator: low.denominator * k }, low };
  });
  return { pairs, leftOrder: shuffle(pairs.map((p) => p.id)), rightOrder: shuffle(pairs.map((p) => p.id)) };
}

export function MatchFamilyGameCard() {
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
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">5</span>
          <h2 className="text-xl font-extrabold">จับคู่ครอบครัว</h2>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <p className="text-center text-sm font-bold text-slate-600 sm:text-base">แตะเศษส่วนใหญ่ทางซ้าย แล้วแตะรูปอย่างต่ำที่เป็นคู่กันทางขวา</p>

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
                    !isMatched && !isWrong && isSelected && "border-orange-500 bg-orange-50 shadow-md",
                    !isMatched && !isWrong && !isSelected && "border-orange-100 bg-white hover:bg-orange-50"
                  )}
                >
                  <FractionText numerator={pair.big.numerator} denominator={pair.big.denominator} className="text-2xl sm:text-3xl" toneClassName="text-orange-600" />
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
                    "flex h-16 w-full items-center justify-center rounded-xl border-2 transition sm:h-20",
                    isMatched && "border-emerald-300 bg-emerald-50 opacity-60",
                    !isMatched && isWrong && "border-rose-400 bg-rose-50",
                    !isMatched && !isWrong && "border-emerald-100 bg-white hover:bg-emerald-50"
                  )}
                >
                  <FractionText numerator={pair.low.numerator} denominator={pair.low.denominator} className="text-2xl sm:text-3xl" toneClassName="text-emerald-600" />
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
            className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-orange-600 active:scale-[0.98] sm:text-base"
          >
            <Shuffle size={16} /> เล่นรอบใหม่
          </button>
        </div>
      </div>
    </Card>
  );
}

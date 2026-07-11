"use client";

import { useState } from "react";
import { Check, Shuffle, Sparkles, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack, SectionHeader } from "@/components/lessons/equivalent/EquivalentMath";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

type Fraction = { numerator: number; denominator: number };

const STARTERS: Fraction[] = [
  { numerator: 1, denominator: 2 },
  { numerator: 1, denominator: 3 },
  { numerator: 2, denominator: 3 },
  { numerator: 1, denominator: 4 },
  { numerator: 3, denominator: 4 },
];

const MAX_CHAIN = 4;

function crossEqual(a: Fraction, b: Fraction): boolean {
  return a.numerator * b.denominator === b.numerator * a.denominator;
}

/** สร้างคู่ "หลอกตา" — บวกจำนวนเดียวกันทั้งเศษและส่วน (ความเข้าใจผิดที่พบบ่อย ไม่ใช่เศษส่วนเท่ากัน) */
function makeTrap(base: Fraction): Fraction {
  let trap: Fraction;
  let tries = 0;
  do {
    const add = randInt(1, 3);
    trap = { numerator: base.numerator + add, denominator: base.denominator + add };
    tries++;
  } while (crossEqual(base, trap) && tries < 10);
  return trap;
}

type Judge = {
  base: Fraction;
  equalPair: Fraction;
  trapPair: Fraction;
  equalOnLeft: boolean;
};

function makeJudge(): Judge {
  const base = STARTERS[randInt(0, STARTERS.length - 1)];
  const k = randInt(2, 3);
  const equalPair: Fraction = { numerator: base.numerator * k, denominator: base.denominator * k };
  const trapPair = makeTrap(base);
  return { base, equalPair, trapPair, equalOnLeft: Math.random() < 0.5 };
}

export function EquivalentConceptCard() {
  const [base, setBase] = useState<Fraction>(STARTERS[0]);
  const [chainLen, setChainLen] = useState(3);
  const [judge, setJudge] = useState<Judge>(() => makeJudge());
  const [judgePicked, setJudgePicked] = useState<"left" | "right" | null>(null);

  const chain: Fraction[] = Array.from({ length: chainLen }, (_, i) => ({
    numerator: base.numerator * (i + 1),
    denominator: base.denominator * (i + 1),
  }));

  function randomizeBase() {
    let next = base;
    let tries = 0;
    while (next.numerator === base.numerator && next.denominator === base.denominator && tries++ < 10) {
      next = STARTERS[randInt(0, STARTERS.length - 1)];
    }
    setBase(next);
    setChainLen(3);
  }

  function multiplyMore() {
    setChainLen((n) => Math.min(MAX_CHAIN, n + 1));
  }

  const judgeCorrect: "left" | "right" = judge.equalOnLeft ? "left" : "right";
  const judgeAnswered = judgePicked !== null;
  const judgeIsCorrect = judgePicked === judgeCorrect;

  function pickJudge(side: "left" | "right") {
    if (judgePicked) return;
    setJudgePicked(side);
  }

  function nextJudge() {
    setJudge(makeJudge());
    setJudgePicked(null);
  }

  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={1} title="เศษส่วนที่เท่ากันคืออะไร?" />
      <div className="space-y-6 p-5 sm:p-6">
        {/* แถบเศษส่วนที่สร้างต่อกันแบบสด ๆ */}
        <div className="space-y-3">
          {chain.map((f, i) => (
            <div key={i} className="grid grid-cols-[1fr_5rem] items-center gap-3">
              <FractionShape numerator={f.numerator} denominator={f.denominator} shape="bar" tone="emerald" className="h-14 w-full sm:h-16" />
              <FractionStack top={f.numerator} bottom={f.denominator} className="text-2xl text-emerald-700 sm:text-3xl" />
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-teal-50 px-4 py-3 text-center text-xl font-extrabold text-teal-700 sm:text-2xl">
          {chain.map((f, i) => (
            <span key={i}>
              <FractionStack top={f.numerator} bottom={f.denominator} className="mx-1 inline-flex align-middle" />
              {i < chain.length - 1 && <span className="mx-1">=</span>}
            </span>
          ))}
        </div>

        <p className="text-center text-sm font-bold text-slate-600 sm:text-base">
          แม้แบ่งจำนวนชิ้นไม่เท่ากัน แต่ส่วนที่ระบายมีขนาดเท่ากัน จึงเป็น <span className="text-teal-700">เศษส่วนที่เท่ากัน</span>
        </p>

        {/* ปุ่มควบคุม */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={multiplyMore}
            disabled={chainLen >= MAX_CHAIN}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:text-base"
          >
            <Sparkles size={16} /> คูณต่ออีกขั้น
          </button>
          <button
            onClick={randomizeBase}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
          >
            <Shuffle size={15} /> ลองเศษส่วนอื่น
          </button>
        </div>

        {/* โซนจับผิด */}
        <div className="rounded-2xl border-2 border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <p className="text-center text-base font-extrabold text-slate-700 sm:text-lg">คู่ไหนคือเศษส่วนที่เท่ากันจริง ๆ?</p>
          <p className="mt-1 text-center text-xs font-bold text-slate-400 sm:text-sm">ระวัง! บางคู่แค่ &ldquo;หน้าตาคล้าย&rdquo; แต่ค่าไม่เท่ากัน</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(["left", "right"] as const).map((side) => {
              const pair = side === "left" ? (judge.equalOnLeft ? judge.equalPair : judge.trapPair) : judge.equalOnLeft ? judge.trapPair : judge.equalPair;
              const isCorrectSide = side === judgeCorrect;
              const isPicked = judgePicked === side;
              return (
                <button
                  key={side}
                  onClick={() => pickJudge(side)}
                  disabled={judgeAnswered}
                  className={cn(
                    "rounded-2xl border-2 bg-white p-4 text-center transition",
                    !judgeAnswered && "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50",
                    judgeAnswered && isCorrectSide && "border-emerald-400 bg-emerald-50",
                    judgeAnswered && !isCorrectSide && isPicked && "border-rose-400 bg-rose-50",
                    judgeAnswered && !isCorrectSide && !isPicked && "border-slate-100 opacity-60"
                  )}
                >
                  <div className="flex items-center justify-center gap-3">
                    <FractionShape numerator={judge.base.numerator} denominator={judge.base.denominator} shape="bar" tone="sky" className="h-10 w-16 sm:h-12 sm:w-20" />
                    <FractionStack top={judge.base.numerator} bottom={judge.base.denominator} className="text-lg text-sky-600 sm:text-xl" />
                  </div>
                  <div className="my-2 text-xl font-extrabold text-slate-300">
                    {judgeAnswered ? (isCorrectSide ? "=" : "≠") : "?"}
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <FractionShape numerator={pair.numerator} denominator={pair.denominator} shape="bar" tone="violet" className="h-10 w-16 sm:h-12 sm:w-20" />
                    <FractionStack top={pair.numerator} bottom={pair.denominator} className="text-lg text-violet-600 sm:text-xl" />
                  </div>
                  {judgeAnswered && (
                    <div className={cn("mt-3 flex items-center justify-center gap-1.5 text-sm font-extrabold", isCorrectSide ? "text-emerald-600" : "text-rose-500")}>
                      {isCorrectSide ? <Check size={16} /> : <X size={16} />}
                      {isCorrectSide ? "เท่ากันจริง" : "ไม่เท่ากัน"}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {judgeAnswered && (
            <div className={cn("mt-4 rounded-xl px-4 py-3 text-center text-sm font-bold sm:text-base", judgeIsCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-50 text-rose-600")}>
              {judgeIsCorrect ? "ถูกต้อง! " : "ยังไม่ถูก — "}
              คู่ที่เท่ากันต้อง<span className="font-extrabold">คูณ</span>ทั้งเศษและส่วนด้วยจำนวนเดียวกัน ไม่ใช่<span className="font-extrabold">บวก</span>
            </div>
          )}

          <div className="mt-3 flex justify-center">
            <button
              onClick={nextJudge}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50 sm:text-sm"
            >
              <Shuffle size={13} /> ลองคู่ใหม่
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Check, Shuffle, Zap } from "lucide-react";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { gcd } from "@/lib/fractionUtils";
import { randInt } from "@/lib/randomFraction";

type Fraction = { numerator: number; denominator: number };

const POOL: Fraction[] = [
  { numerator: 24, denominator: 36 },
  { numerator: 18, denominator: 24 },
  { numerator: 16, denominator: 40 },
  { numerator: 30, denominator: 45 },
  { numerator: 20, denominator: 50 },
  { numerator: 28, denominator: 42 },
];

const SMALL_DIVISORS = [2, 3, 5, 7];

export function GcdShortcutCard() {
  const [base, setBase] = useState<Fraction>(POOL[0]);
  const [leftFrac, setLeftFrac] = useState<Fraction>(POOL[0]);
  const [leftClicks, setLeftClicks] = useState(0);
  const [rightDone, setRightDone] = useState(false);

  const gcdValue = gcd(base.numerator, base.denominator);
  const leftLowest = gcd(leftFrac.numerator, leftFrac.denominator) === 1;
  const rightResult = { numerator: base.numerator / gcdValue, denominator: base.denominator / gcdValue };

  function leftDivisorAvail(d: number) {
    return leftFrac.numerator % d === 0 && leftFrac.denominator % d === 0;
  }

  function clickLeftDivide(d: number) {
    if (!leftDivisorAvail(d) || leftLowest) return;
    setLeftFrac((f) => ({ numerator: f.numerator / d, denominator: f.denominator / d }));
    setLeftClicks((n) => n + 1);
  }

  function clickShortcut() {
    if (rightDone) return;
    setRightDone(true);
  }

  function randomize() {
    let next = base;
    let tries = 0;
    while (next.numerator === base.numerator && next.denominator === base.denominator && tries++ < 10) {
      next = POOL[randInt(0, POOL.length - 1)];
    }
    setBase(next);
    setLeftFrac(next);
    setLeftClicks(0);
    setRightDone(false);
  }

  const bothDone = leftLowest && rightDone;

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">3</span>
          <h2 className="text-xl font-extrabold">ทางลัด ห.ร.ม.</h2>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm font-bold text-slate-500">โจทย์:</span>
          <FractionText numerator={base.numerator} denominator={base.denominator} className="text-3xl text-brand-900 sm:text-4xl" />
          <button
            onClick={randomize}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
          >
            <Shuffle size={14} /> โจทย์ใหม่
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* ทีละขั้น */}
          <div className="rounded-2xl border-2 border-orange-100 bg-white p-4 sm:p-5">
            <p className="text-center text-sm font-extrabold text-orange-700 sm:text-base">✋ ทีละขั้น (แบบเดิม)</p>
            <div className="mt-3 flex items-center justify-center">
              <FractionText numerator={leftFrac.numerator} denominator={leftFrac.denominator} className="text-3xl text-orange-600" />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {SMALL_DIVISORS.map((d) => (
                <button
                  key={d}
                  onClick={() => clickLeftDivide(d)}
                  disabled={!leftDivisorAvail(d) || leftLowest}
                  className={cn(
                    "h-10 w-12 rounded-lg text-base font-extrabold transition",
                    leftDivisorAvail(d) && !leftLowest
                      ? "bg-orange-500 text-white hover:bg-orange-600 active:scale-95"
                      : "cursor-not-allowed border border-slate-200 bg-white text-slate-300"
                  )}
                >
                  ÷{d}
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-sm font-bold text-slate-600">
              คลิกไปแล้ว <span className="text-orange-600">{leftClicks}</span> ครั้ง
            </p>
            {leftLowest && (
              <p className="mt-1 flex items-center justify-center gap-1 text-center text-sm font-extrabold text-emerald-600">
                <Check size={16} /> อย่างต่ำแล้ว!
              </p>
            )}
          </div>

          {/* ทางลัด */}
          <div className="rounded-2xl border-2 border-emerald-100 bg-white p-4 sm:p-5">
            <p className="text-center text-sm font-extrabold text-emerald-700 sm:text-base">⚡ ทางลัด ห.ร.ม.</p>
            <div className="mt-3 flex items-center justify-center">
              <FractionText
                numerator={rightDone ? rightResult.numerator : base.numerator}
                denominator={rightDone ? rightResult.denominator : base.denominator}
                className="text-3xl text-emerald-600"
              />
            </div>
            <div className="mt-3 flex justify-center">
              <button
                onClick={clickShortcut}
                disabled={rightDone}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-extrabold transition sm:text-base",
                  rightDone
                    ? "cursor-not-allowed border border-slate-200 bg-white text-slate-300"
                    : "bg-emerald-600 text-white shadow-md hover:bg-emerald-700 active:scale-[0.98]"
                )}
              >
                <Zap size={16} /> หารด้วย ห.ร.ม. เลย (÷{gcdValue})
              </button>
            </div>
            <p className="mt-3 text-center text-sm font-bold text-slate-600">
              คลิกไปแล้ว <span className="text-emerald-600">{rightDone ? 1 : 0}</span> ครั้ง
            </p>
            {rightDone && (
              <p className="mt-1 flex items-center justify-center gap-1 text-center text-sm font-extrabold text-emerald-600">
                <Check size={16} /> อย่างต่ำแล้ว!
              </p>
            )}
          </div>
        </div>

        {bothDone && (
          <div className="rounded-xl bg-teal-50 px-4 py-3 text-center text-sm font-bold text-teal-700 sm:text-base">
            ทีละขั้นใช้ <span className="font-extrabold text-orange-600">{leftClicks} ครั้ง</span> ส่วนทางลัดใช้แค่{" "}
            <span className="font-extrabold text-emerald-600">1 ครั้ง</span> — ห.ร.ม. ({gcdValue}) ของ {base.numerator} และ{" "}
            {base.denominator} คือทางลัดที่เร็วที่สุด!
          </div>
        )}

        <p className="text-center text-sm font-bold text-slate-500 sm:text-base">
          ห.ร.ม. (ตัวหารร่วมมากที่สุด) คือจำนวนมากที่สุดที่หารทั้งเศษและส่วนได้ลงตัวพร้อมกัน
        </p>
      </div>
    </Card>
  );
}

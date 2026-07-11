"use client";

import { useState } from "react";
import { ArrowRight, RotateCcw, Shuffle } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader } from "@/components/lessons/add/FractionMath";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

type Problem = { w1: number; n1: number; w2: number; n2: number; den: number };

function makeProblem(carry: boolean): Problem {
  const den = randInt(3, 6);
  const w1 = randInt(1, 3);
  const w2 = randInt(1, 3);
  if (carry) {
    // บังคับให้เศษรวมเกิน 1 → ต้องทด
    const n1 = randInt(Math.ceil(den / 2), den - 1);
    const n2 = randInt(den - n1 + 1, den - 1);
    return { w1, n1, w2, n2, den };
  }
  const n1 = randInt(1, den - 2);
  const n2 = randInt(1, den - 1 - n1);
  return { w1, n1, w2, n2, den };
}

function Mixed({ whole, num, den, className }: { whole: number; num: number; den: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span>{whole}</span>
      {num > 0 && <FractionStack top={num} bottom={den} className="text-[0.75em]" />}
    </span>
  );
}

export function MixedAddCard() {
  const [problem, setProblem] = useState<Problem>({ w1: 1, n1: 3, w2: 1, n2: 2, den: 4 });
  const [stage, setStage] = useState(0);

  const { w1, n1, w2, n2, den } = problem;
  const wholeSum = w1 + w2;
  const fracSum = n1 + n2;
  const needCarry = fracSum >= den;
  const finalWhole = needCarry ? wholeSum + 1 : wholeSum;
  const finalNum = needCarry ? fracSum - den : fracSum;
  const maxStage = needCarry ? 3 : 2;

  function randomize() {
    setProblem(makeProblem(Math.random() < 0.5));
    setStage(0);
  }

  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={3} title="บวกจำนวนคละ" />
      <div className="space-y-5 p-5 sm:p-6">
        {/* โจทย์ */}
        <div className="flex items-center justify-center gap-3 rounded-2xl bg-blue-50 px-4 py-4 text-3xl font-extrabold sm:text-4xl">
          <Mixed whole={w1} num={n1} den={den} className="text-sky-600" />
          <span className="text-slate-400">+</span>
          <Mixed whole={w2} num={n2} den={den} className="text-violet-600" />
          <span className="text-slate-400">=</span>
          {stage >= maxStage ? (
            <Mixed whole={finalWhole} num={finalNum} den={den} className="text-blue-700" />
          ) : (
            <span className="text-slate-300">?</span>
          )}
        </div>

        {/* ขั้นที่ 1: บวกจำนวนเต็ม */}
        <div className="rounded-2xl border-2 border-sky-200 bg-white p-4 sm:p-5">
          <p className="flex items-center gap-2 text-base font-extrabold text-sky-700 sm:text-lg">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-sky-500 text-sm text-white">1</span>
            บวกจำนวนเต็มก่อน
          </p>
          <p className="mt-3 text-center text-2xl font-extrabold text-slate-700 sm:text-3xl">
            {w1} + {w2} = <span className="text-sky-600">{wholeSum}</span>
          </p>
        </div>

        {/* ขั้นที่ 2: บวกเศษส่วน */}
        {stage >= 1 && (
          <div className="rounded-2xl border-2 border-violet-200 bg-white p-4 sm:p-5">
            <p className="flex items-center gap-2 text-base font-extrabold text-violet-700 sm:text-lg">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-violet-500 text-sm text-white">2</span>
              บวกเศษส่วน (ส่วนเท่ากัน บวกตัวเศษ)
            </p>
            <div className="mt-3 flex items-center justify-center gap-3 text-2xl font-extrabold sm:text-3xl">
              <FractionStack top={n1} bottom={den} className="text-sky-600" />
              <span className="text-slate-400">+</span>
              <FractionStack top={n2} bottom={den} className="text-violet-600" />
              <span className="text-slate-400">=</span>
              <FractionStack top={fracSum} bottom={den} className={needCarry ? "text-rose-500" : "text-violet-700"} />
            </div>
            {needCarry && stage >= 1 && (
              <p className="mt-2 text-center text-sm font-extrabold text-rose-500 sm:text-base">
                เอ๊ะ! ตัวเศษ ({fracSum}) มากกว่าตัวส่วน ({den}) — เป็นเศษเกิน ต้องทดไปจำนวนเต็ม
              </p>
            )}
          </div>
        )}

        {/* ขั้นที่ 3: ทด (เฉพาะกรณีเศษรวมเกิน 1) */}
        {stage >= 2 && needCarry && (
          <div className="rounded-2xl border-2 border-amber-200 bg-white p-4 sm:p-5">
            <p className="flex items-center gap-2 text-base font-extrabold text-amber-600 sm:text-lg">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-500 text-sm text-white">3</span>
              ทดเศษเกินไปเป็นจำนวนเต็ม
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xl font-extrabold sm:text-2xl">
              <FractionStack top={fracSum} bottom={den} className="text-rose-500" />
              <span className="text-slate-400">=</span>
              <span className="text-amber-600">1</span>
              {finalNum > 0 && (
                <>
                  <span className="text-slate-400">กับ</span>
                  <FractionStack top={finalNum} bottom={den} className="text-amber-600" />
                </>
              )}
              <span className="text-slate-400">→</span>
              <span className="text-slate-700">
                {wholeSum} + 1 = <span className="text-amber-600">{finalWhole}</span>
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <FractionShape numerator={den} denominator={den} shape="circle" tone="accent" className="h-16 w-16" />
              {finalNum > 0 && <FractionShape numerator={finalNum} denominator={den} shape="circle" tone="violet" className="h-16 w-16" />}
            </div>
          </div>
        )}

        {/* คำตอบ */}
        {stage >= maxStage && (
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-4 text-white">
            <span className="text-base font-extrabold sm:text-lg">คำตอบ:</span>
            <Mixed whole={finalWhole} num={finalNum} den={den} className="text-4xl font-extrabold sm:text-5xl" />
          </div>
        )}

        {/* ปุ่มควบคุม */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {stage < maxStage ? (
            <button
              onClick={() => setStage((s) => s + 1)}
              className="flex h-12 items-center gap-1.5 rounded-xl bg-blue-600 px-6 text-base font-extrabold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.98]"
            >
              ขั้นถัดไป <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={randomize}
              className="flex h-12 items-center gap-1.5 rounded-xl bg-blue-600 px-6 text-base font-extrabold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.98]"
            >
              <Shuffle size={17} /> โจทย์ใหม่
            </button>
          )}
          {stage > 0 && (
            <button
              onClick={() => setStage(0)}
              className="flex h-12 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
            >
              <RotateCcw size={15} /> ดูใหม่ตั้งแต่ต้น
            </button>
          )}
        </div>

        <p className="text-center text-sm font-bold text-slate-500 sm:text-base">
          สูตร: บวกจำนวนเต็มแยก บวกเศษส่วนแยก — ถ้าเศษรวมเกิน 1 อย่าลืมทด!
        </p>
      </div>
    </Card>
  );
}

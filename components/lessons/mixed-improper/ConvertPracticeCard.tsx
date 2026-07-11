"use client";

import { useState } from "react";
import { Check, Flame, Shuffle, X } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { randInt, randomImproper, randomMixed, wrongImproperOpts, wrongMixedOpts } from "@/lib/randomFraction";
import type { ImproperOpt, MixedOpt } from "@/lib/randomFraction";

type Problem =
  | { kind: "toMixed"; num: number; den: number; whole: number; rem: number; options: MixedOpt[] }
  | { kind: "toImproper"; whole: number; num: number; den: number; result: number; options: ImproperOpt[] }
  | { kind: "fromImage"; whole: number; num: number; den: number; options: MixedOpt[] };

function makeProblem(): Problem {
  const pick = randInt(0, 2);
  if (pick === 0) {
    const { num, den } = randomImproper(2, 6);
    const whole = Math.floor(num / den);
    const rem = num % den;
    return { kind: "toMixed", num, den, whole, rem, options: wrongMixedOpts(whole, rem, den) };
  }
  if (pick === 1) {
    const { whole, num, den } = randomMixed(2, 6);
    const result = whole * den + num;
    return { kind: "toImproper", whole, num, den, result, options: wrongImproperOpts(result, den) };
  }
  const den = randInt(2, 5);
  const whole = randInt(1, 3);
  const num = randInt(1, den - 1);
  return { kind: "fromImage", whole, num, den, options: wrongMixedOpts(whole, num, den) };
}

export function ConvertPracticeCard() {
  const [problem, setProblem] = useState<Problem>(() => makeProblem());
  const [picked, setPicked] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const answered = picked !== null;

  function isCorrect(i: number) {
    return problem.options[i].correct;
  }
  const pickedCorrect = answered && isCorrect(picked);

  function choose(i: number) {
    if (answered) return;
    setPicked(i);
    if (isCorrect(i)) {
      setStreak((s) => {
        const ns = s + 1;
        setBest((b) => Math.max(b, ns));
        return ns;
      });
    } else {
      setStreak(0);
    }
  }

  function next() {
    setProblem(makeProblem());
    setPicked(null);
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">4</span>
          <h2 className="text-xl font-extrabold">ฝึกแปลง</h2>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">
          <Flame size={13} /> ติดกัน {streak} {best > 0 && `(สูงสุด ${best})`}
        </span>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {/* โจทย์ */}
        <div className="rounded-2xl bg-pink-50/60 p-5">
          {problem.kind === "toMixed" && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-base font-extrabold text-slate-600 sm:text-lg">แปลง</span>
              <FractionText numerator={problem.num} denominator={problem.den} className="text-4xl sm:text-5xl" toneClassName="text-pink-600" />
              <span className="text-base font-extrabold text-slate-600 sm:text-lg">เป็นจำนวนคละ</span>
            </div>
          )}
          {problem.kind === "toImproper" && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-base font-extrabold text-slate-600 sm:text-lg">แปลง</span>
              <span className="flex items-center gap-1">
                <span className="text-4xl font-extrabold text-fuchsia-600 sm:text-5xl">{problem.whole}</span>
                <FractionText numerator={problem.num} denominator={problem.den} className="text-3xl sm:text-4xl" toneClassName="text-fuchsia-600" />
              </span>
              <span className="text-base font-extrabold text-slate-600 sm:text-lg">เป็นเศษเกิน</span>
            </div>
          )}
          {problem.kind === "fromImage" && (
            <div className="space-y-3">
              <p className="text-center text-base font-extrabold text-slate-600 sm:text-lg">ภาพนี้คือจำนวนคละใด?</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {Array.from({ length: problem.whole }).map((_, i) => (
                  <FractionShape key={i} numerator={problem.den} denominator={problem.den} shape="circle" tone="pink" className="h-20 w-20 sm:h-24 sm:w-24" />
                ))}
                <FractionShape numerator={problem.num} denominator={problem.den} shape="circle" tone="violet" className="h-20 w-20 sm:h-24 sm:w-24" />
              </div>
            </div>
          )}
        </div>

        {/* ตัวเลือก */}
        <div className="grid grid-cols-3 gap-3">
          {problem.options.map((o, i) => {
            const correct = isCorrect(i);
            const isPicked = picked === i;
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={answered}
                className={cn(
                  "flex min-h-16 items-center justify-center gap-1 rounded-2xl border-2 bg-white p-3 transition",
                  !answered && "border-slate-200 hover:border-pink-300 hover:bg-pink-50",
                  answered && correct && "border-emerald-400 bg-emerald-50",
                  answered && !correct && isPicked && "border-rose-400 bg-rose-50",
                  answered && !correct && !isPicked && "border-slate-100 opacity-60"
                )}
              >
                {"whole" in o && (o as MixedOpt).whole !== undefined && problem.kind !== "toImproper" ? (
                  <>
                    <span className="text-2xl font-extrabold text-slate-700 sm:text-3xl">{(o as MixedOpt).whole}</span>
                    {(o as MixedOpt).num > 0 && (
                      <FractionText numerator={(o as MixedOpt).num} denominator={(o as MixedOpt).den} className="text-xl sm:text-2xl" toneClassName="text-slate-700" />
                    )}
                  </>
                ) : (
                  <FractionText numerator={(o as ImproperOpt).num} denominator={(o as ImproperOpt).den} className="text-2xl sm:text-3xl" toneClassName="text-slate-700" />
                )}
              </button>
            );
          })}
        </div>

        {/* เฉลย */}
        {answered && (
          <div className="space-y-3">
            <div
              className={cn(
                "flex flex-wrap items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm font-bold sm:text-base",
                pickedCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-50 text-rose-600"
              )}
            >
              {pickedCorrect ? <Check size={18} className="shrink-0" /> : <X size={18} className="shrink-0" />}
              {pickedCorrect ? "ถูกต้อง!" : "ยังไม่ถูก —"}
              {problem.kind === "toMixed" && (
                <span className="flex flex-wrap items-center justify-center gap-1">
                  {problem.num} ÷ {problem.den} = {problem.whole} เศษ {problem.rem} → ได้ {problem.whole}
                  {problem.rem > 0 && (
                    <FractionText numerator={problem.rem} denominator={problem.den} className="inline-flex text-base" toneClassName="text-inherit" />
                  )}
                </span>
              )}
              {problem.kind === "toImproper" && (
                <span className="flex flex-wrap items-center justify-center gap-1">
                  ({problem.whole} × {problem.den}) + {problem.num} = {problem.result} → ได้
                  <FractionText numerator={problem.result} denominator={problem.den} className="inline-flex text-base" toneClassName="text-inherit" />
                </span>
              )}
              {problem.kind === "fromImage" && (
                <span className="flex flex-wrap items-center justify-center gap-1">
                  {problem.whole} วงเต็ม + อีก {problem.num} ชิ้นจาก {problem.den} = {problem.whole}
                  <FractionText numerator={problem.num} denominator={problem.den} className="inline-flex text-base" toneClassName="text-inherit" />
                </span>
              )}
            </div>
            <div className="flex justify-center">
              <button
                onClick={next}
                className="flex items-center gap-1.5 rounded-xl bg-pink-600 px-6 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-pink-700 active:scale-[0.98] sm:text-base"
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

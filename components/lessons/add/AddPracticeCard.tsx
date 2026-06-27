"use client";

import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack } from "@/components/lessons/add/FractionMath";
import { PracticeShell, type PracticeOption } from "@/components/practice/PracticeShell";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

type Problem = { a: number; b: number; den: number; options: PracticeOption[] };

function makeProblem(): Problem {
  const den = randInt(3, 9);
  const a = randInt(1, den - 2);
  const b = randInt(1, den - 1 - a);
  const c = a + b;
  const wrongs = shuffle(
    [-2, -1, 1, 2].map((d) => c + d).filter((n) => n > 0 && n !== c && n < den * 2),
  )
    .slice(0, 3)
    .map((n) => ({ num: n, den, correct: false }));
  return { a, b, den, options: shuffle([{ num: c, den, correct: true }, ...wrongs]) };
}

export function AddPracticeCard() {
  return (
    <PracticeShell<Problem>
      badge={7}
      title="แบบฝึกหัด — บวกเศษส่วน"
      accent="blue"
      gradient="bg-gradient-to-r from-blue-700 to-sky-500"
      makeProblem={makeProblem}
      getOptions={(p) => p.options}
      renderQuestion={(p) => (
        <>
          <FractionStack top={p.a} bottom={p.den} className="text-2xl" />
          <span>+</span>
          <FractionStack top={p.b} bottom={p.den} className="text-2xl" />
        </>
      )}
      renderOption={(opt, state) => (
        <FractionStack
          top={opt.num}
          bottom={opt.den}
          className={cn(
            "text-2xl",
            state === "correct" && "text-emerald-700",
            state === "wrong" && "text-rose-600",
            state === "idle" && "text-slate-800",
          )}
        />
      )}
      getHints={(p) => [
        <span key="v" className="flex flex-wrap items-center gap-2">
          ลองนับช่องที่ระบาย
          <FractionShape numerator={p.a} denominator={p.den} shape="bar" tone="sky" className="h-6 w-16" />
          รวมกับ
          <FractionShape numerator={p.b} denominator={p.den} shape="bar" tone="violet" className="h-6 w-16" />
        </span>,
        <span key="m">ตัวส่วนเท่ากัน บวกเฉพาะตัวเศษ: {p.a} + {p.b}</span>,
        <span key="a">{p.a} + {p.b} = {p.a + p.b} แล้วตัวส่วนคงเดิม</span>,
      ]}
      renderFeedback={(p, ok) => (
        <>
          <FractionStack top={p.a} bottom={p.den} className="text-sm" />
          <span>+</span>
          <FractionStack top={p.b} bottom={p.den} className="text-sm" />
          <span>=</span>
          <FractionStack top={p.a + p.b} bottom={p.den} className="text-sm" />
          {!ok && <span className="ml-1 text-rose-500">ตัวส่วนเท่ากัน บวกแค่ตัวเศษ</span>}
        </>
      )}
    />
  );
}

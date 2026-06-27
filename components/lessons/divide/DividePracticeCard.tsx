"use client";

import { FractionStack } from "@/components/lessons/divide/DivideMath";
import { PracticeShell, type PracticeOption } from "@/components/practice/PracticeShell";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

type Problem = { a: number; p: number; b: number; q: number; options: PracticeOption[] };

function gcd(a: number, b: number): number {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}
function simplify(n: number, d: number): [number, number] {
  const g = gcd(Math.abs(n), Math.abs(d));
  return [n / g, d / g];
}
function fracEq(n1: number, d1: number, n2: number, d2: number) {
  return n1 * d2 === n2 * d1;
}

function makeProblem(): Problem {
  const p = randInt(2, 5);
  const q = randInt(2, 5);
  const a = randInt(1, p - 1);
  const b = randInt(1, q - 1);
  const [cNum, cDen] = simplify(a * q, p * b);
  const candidates: [number, number][] = [
    [a * b, p * q],
    [p * b, a * q],
    [a * q + 1, p * b],
    [a * q, p * b + 1],
  ];
  const wrongs = shuffle(
    candidates.map(([n, d]) => simplify(n, d) as [number, number]).filter(([n, d]) => !fracEq(n, d, cNum, cDen) && n > 0 && d > 0),
  )
    .slice(0, 3)
    .map(([n, d]) => ({ num: n, den: d, correct: false }));
  return { a, p, b, q, options: shuffle([{ num: cNum, den: cDen, correct: true }, ...wrongs]) };
}

export function DividePracticeCard() {
  return (
    <PracticeShell<Problem>
      badge={9}
      title="แบบฝึกหัด — หารเศษส่วน"
      accent="violet"
      gradient="bg-gradient-to-r from-violet-700 to-purple-500"
      makeProblem={makeProblem}
      getOptions={(p) => p.options}
      renderQuestion={(p) => (
        <>
          <FractionStack top={p.a} bottom={p.p} className="text-2xl" />
          <span>÷</span>
          <FractionStack top={p.b} bottom={p.q} className="text-2xl" />
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
        <span key="r">การหารคือ “คงตัวหน้า กลับตัวหลัง แล้วคูณ”</span>,
        <span key="f" className="flex flex-wrap items-center gap-1">
          กลายเป็น
          <FractionStack top={p.a} bottom={p.p} className="text-sm" />
          ×
          <FractionStack top={p.q} bottom={p.b} className="text-sm" />
        </span>,
        <span key="c" className="flex flex-wrap items-center gap-1">
          คูณได้
          <FractionStack top={p.a * p.q} bottom={p.p * p.b} className="text-sm" />
          แล้วทำให้เป็นอย่างต่ำ
        </span>,
      ]}
      renderFeedback={(p, ok) => {
        const raw = p.a * p.q;
        const [sNum, sDen] = simplify(raw, p.p * p.b);
        return (
          <>
            <FractionStack top={p.a} bottom={p.p} className="text-sm" />
            <span>÷</span>
            <FractionStack top={p.b} bottom={p.q} className="text-sm" />
            <span>=</span>
            <FractionStack top={raw} bottom={p.p * p.b} className="text-sm" />
            {sNum !== raw && (
              <>
                <span>=</span>
                <FractionStack top={sNum} bottom={sDen} className="text-sm" />
              </>
            )}
            {!ok && <span className="ml-1 text-rose-500">คงตัวหน้า กลับตัวหลัง แล้วคูณ</span>}
          </>
        );
      }}
    />
  );
}

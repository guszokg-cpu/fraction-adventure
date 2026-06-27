"use client";

import { FractionStack } from "@/components/lessons/multiply/MultiplyMath";
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
  const g = gcd(n, d);
  return [n / g, d / g];
}

function makeProblem(): Problem {
  const p = randInt(2, 5);
  const q = randInt(2, 5);
  const a = randInt(1, p - 1);
  const b = randInt(1, q - 1);
  const rawNum = a * b;
  const rawDen = p * q;
  const [cNum, cDen] = simplify(rawNum, rawDen);
  const candidates: [number, number][] = [
    [a + b, p + q],
    [rawNum + 1, rawDen],
    [rawNum, rawDen + 1],
    [a * q, p * b],
  ];
  const wrongs = shuffle(
    candidates.map(([n, d]) => simplify(n, d)).filter(([n, d]) => !(n === cNum && d === cDen) && n > 0 && d > 0),
  )
    .slice(0, 3)
    .map(([n, d]) => ({ num: n, den: d, correct: false }));
  return { a, p, b, q, options: shuffle([{ num: cNum, den: cDen, correct: true }, ...wrongs]) };
}

export function MultiplyPracticeCard() {
  return (
    <PracticeShell<Problem>
      badge={8}
      title="แบบฝึกหัด — คูณเศษส่วน"
      accent="amber"
      gradient="bg-gradient-to-r from-orange-600 to-amber-400"
      makeProblem={makeProblem}
      getOptions={(p) => p.options}
      renderQuestion={(p) => (
        <>
          <FractionStack top={p.a} bottom={p.p} className="text-2xl" />
          <span>×</span>
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
        <span key="m">คูณเศษกับเศษ และส่วนกับส่วน</span>,
        <span key="c" className="flex flex-wrap items-center gap-1">
          ตัวเศษ: {p.a} × {p.b} = {p.a * p.b} &nbsp;|&nbsp; ตัวส่วน: {p.p} × {p.q} = {p.p * p.q}
        </span>,
        <span key="s" className="flex flex-wrap items-center gap-1">
          ได้
          <FractionStack top={p.a * p.b} bottom={p.p * p.q} className="text-sm" />
          แล้วทำให้เป็นเศษส่วนอย่างต่ำ
        </span>,
      ]}
      renderFeedback={(p, ok) => {
        const [cNum, cDen] = simplify(p.a * p.b, p.p * p.q);
        const raw = p.a * p.b;
        return (
          <>
            <FractionStack top={p.a} bottom={p.p} className="text-sm" />
            <span>×</span>
            <FractionStack top={p.b} bottom={p.q} className="text-sm" />
            <span>=</span>
            <FractionStack top={raw} bottom={p.p * p.q} className="text-sm" />
            {cNum !== raw && (
              <>
                <span>=</span>
                <FractionStack top={cNum} bottom={cDen} className="text-sm" />
              </>
            )}
            {!ok && <span className="ml-1 text-rose-500">คูณเศษคูณเศษ ส่วนคูณส่วน</span>}
          </>
        );
      }}
    />
  );
}

"use client";

import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack } from "@/components/lessons/equivalent/EquivalentMath";
import { PracticeShell, type PracticeOption } from "@/components/practice/PracticeShell";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

type Problem = { baseNum: number; baseDen: number; k: number; options: PracticeOption[] };

const BASES: [number, number][] = [
  [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [1, 6], [5, 6],
];

/** เศษส่วนสองตัวเท่ากันหรือไม่ (คูณไขว้) */
function fracEq(n1: number, d1: number, n2: number, d2: number) {
  return n1 * d2 === n2 * d1;
}

function makeProblem(): Problem {
  const [baseNum, baseDen] = BASES[randInt(0, BASES.length - 1)];
  const k = randInt(2, 5);
  const cNum = baseNum * k;
  const cDen = baseDen * k;

  // ตัวเลือกผิดต้อง "ไม่เท่ากับ" ฐาน (มิฉะนั้นจะมีหลายข้อถูก)
  const pool: [number, number][] = [
    [cNum + 1, cDen], [cNum - 1, cDen],
    [cNum, cDen + 1], [cNum, cDen - 1],
    [cNum + 2, cDen], [cNum, cDen + 2],
    [baseNum + 1, baseDen], [baseNum, baseDen + 1],
    [baseNum + 1, baseDen + 2], [baseNum + 2, baseDen + 1],
  ];

  const seen = new Set<string>();
  const wrongs: PracticeOption[] = [];
  for (const [n, d] of shuffle(pool)) {
    if (n > 0 && d > 1 && n < d && !fracEq(n, d, baseNum, baseDen)) {
      const key = `${n}/${d}`;
      if (!seen.has(key)) {
        seen.add(key);
        wrongs.push({ num: n, den: d, correct: false });
      }
    }
    if (wrongs.length >= 3) break;
  }

  return { baseNum, baseDen, k, options: shuffle([{ num: cNum, den: cDen, correct: true }, ...wrongs]) };
}

export function EquivalentPracticeCard() {
  return (
    <PracticeShell<Problem>
      badge={5}
      title="แบบฝึกหัด — หาเศษส่วนที่เท่ากัน"
      accent="teal"
      gradient="bg-gradient-to-r from-teal-600 to-violet-500"
      makeProblem={makeProblem}
      getOptions={(p) => p.options}
      renderQuestion={(p) => (
        <>
          <span className="text-xl">เศษส่วนใดเท่ากับ</span>
          <FractionStack top={p.baseNum} bottom={p.baseDen} className="text-2xl text-teal-600" />
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
          ภาพเท่ากับ
          <FractionShape numerator={p.baseNum} denominator={p.baseDen} shape="bar" tone="violet" className="h-6 w-16" />
          คือพื้นที่เท่าเดิม
        </span>,
        <span key="m">ต้องคูณทั้งตัวเศษและตัวส่วนด้วยจำนวนเดียวกัน</span>,
        <span key="a" className="flex flex-wrap items-center gap-1">
          เช่น คูณด้วย {p.k}:
          <FractionStack top={p.baseNum} bottom={p.baseDen} className="text-sm" />
          ×
          <FractionStack top={p.k} bottom={p.k} className="text-sm" />
        </span>,
      ]}
      renderFeedback={(p, ok) => (
        <>
          <FractionStack top={p.baseNum} bottom={p.baseDen} className="text-sm" />
          <span>=</span>
          <FractionStack top={p.baseNum * p.k} bottom={p.baseDen * p.k} className="text-sm" />
          {ok ? (
            <span className="ml-1">คูณบนล่างด้วย {p.k}</span>
          ) : (
            <span className="ml-1 text-rose-500">ต้องคูณบนล่างด้วยจำนวนเดียวกัน</span>
          )}
        </>
      )}
    />
  );
}

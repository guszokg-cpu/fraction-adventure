"use client";

import { FractionStack } from "@/components/lessons/multiply/MultiplyMath";
import { PracticeShell, type PracticeOption } from "@/components/practice/PracticeShell";
import { cn } from "@/lib/cn";
import { simplifyFraction } from "@/lib/fractionUtils";
import { randInt, shuffle } from "@/lib/randomFraction";

type Problem =
  | { kind: "frac"; a: number; p: number; b: number; q: number; options: PracticeOption[] }
  | { kind: "whole"; w: number; b: number; q: number; options: PracticeOption[] };

function opt(n: number, d: number, correct: boolean): PracticeOption {
  const s = simplifyFraction(n, d);
  return { num: s.numerator, den: s.denominator, correct };
}

function makeFrac(): Problem {
  const p = randInt(2, 6);
  const q = randInt(2, 6);
  const a = randInt(1, p - 1);
  const b = randInt(1, q - 1);
  const correct = opt(a * b, p * q, true);
  const wrongCandidates = [
    opt(a + b, p + q, false), // กับดัก: บวกแทนคูณ
    opt(a * b + 1, p * q, false),
    opt(a * q, p * b, false),
    opt(a * b, p * q + 1, false),
  ];
  const seen = new Set([`${correct.num}/${correct.den}`]);
  const wrongs = wrongCandidates.filter((o) => {
    const key = `${o.num}/${o.den}`;
    if (o.num < 1 || o.den < 2 || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 3);
  return { kind: "frac", a, p, b, q, options: shuffle([correct, ...wrongs]) };
}

function makeWhole(): Problem {
  const w = randInt(2, 5);
  const q = randInt(3, 6);
  const b = randInt(1, q - 1);
  const correct = opt(w * b, q, true);
  const wrongCandidates = [
    opt(b, w * q, false), // กับดัก: คูณตัวส่วนแทน
    opt(w * b + 1, q, false),
    opt(w * b, q * w, false),
    opt(w + b, q, false),
  ];
  const seen = new Set([`${correct.num}/${correct.den}`]);
  const wrongs = wrongCandidates.filter((o) => {
    const key = `${o.num}/${o.den}`;
    if (o.num < 1 || o.den < 2 || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 3);
  return { kind: "whole", w, b, q, options: shuffle([correct, ...wrongs]) };
}

function makeProblem(): Problem {
  return Math.random() < 0.5 ? makeFrac() : makeWhole();
}

export function MultiplyPracticeCard() {
  return (
    <PracticeShell<Problem>
      badge={6}
      title="แบบฝึกหัด — คูณเศษส่วน"
      accent="amber"
      gradient="bg-gradient-to-r from-orange-600 to-amber-400"
      makeProblem={makeProblem}
      getOptions={(p) => p.options}
      renderQuestion={(p) =>
        p.kind === "frac" ? (
          <>
            <FractionStack top={p.a} bottom={p.p} className="text-2xl" />
            <span>×</span>
            <FractionStack top={p.b} bottom={p.q} className="text-2xl" />
          </>
        ) : (
          <>
            <span className="text-2xl">{p.w}</span>
            <span>×</span>
            <FractionStack top={p.b} bottom={p.q} className="text-2xl" />
          </>
        )
      }
      renderOption={(o, state) => (
        <FractionStack
          top={o.num}
          bottom={o.den}
          className={cn(
            "text-2xl",
            state === "correct" && "text-emerald-700",
            state === "wrong" && "text-rose-600",
            state === "idle" && "text-slate-800",
          )}
        />
      )}
      getHints={(p) =>
        p.kind === "frac"
          ? [
              <span key="m">คูณเศษกับเศษ และส่วนกับส่วน (ไม่ต้องทำส่วนให้เท่ากันก่อน)</span>,
              <span key="c">ตัวเศษ: {p.a} × {p.b} = {p.a * p.b} | ตัวส่วน: {p.p} × {p.q} = {p.p * p.q}</span>,
              <span key="s" className="flex flex-wrap items-center gap-1">
                ได้ <FractionStack top={p.a * p.b} bottom={p.p * p.q} className="text-sm" /> แล้วทำให้อย่างต่ำ
              </span>,
            ]
          : [
              <span key="m">จำนวนเต็มมองเป็นตัวส่วนเท่ากับ 1 → คูณเข้ากับตัวเศษ</span>,
              <span key="c">{p.w} × {p.b} = {p.w * p.b} ตัวส่วนคงเดิม {p.q}</span>,
              <span key="s" className="flex flex-wrap items-center gap-1">
                ได้ <FractionStack top={p.w * p.b} bottom={p.q} className="text-sm" /> แล้วทำให้อย่างต่ำ
              </span>,
            ]
      }
      renderFeedback={(p, ok) => {
        const rawNum = p.kind === "frac" ? p.a * p.b : p.w * p.b;
        const rawDen = p.kind === "frac" ? p.p * p.q : p.q;
        const s = simplifyFraction(rawNum, rawDen);
        return (
          <>
            {p.kind === "frac" ? (
              <>
                <FractionStack top={p.a} bottom={p.p} className="text-sm" />
                <span>×</span>
                <FractionStack top={p.b} bottom={p.q} className="text-sm" />
              </>
            ) : (
              <>
                <span className="text-sm">{p.w}</span>
                <span>×</span>
                <FractionStack top={p.b} bottom={p.q} className="text-sm" />
              </>
            )}
            <span>=</span>
            <FractionStack top={rawNum} bottom={rawDen} className="text-sm" />
            {(s.numerator !== rawNum || s.denominator !== rawDen) && (
              <>
                <span>=</span>
                <FractionStack top={s.numerator} bottom={s.denominator} className="text-sm" />
              </>
            )}
            {!ok && <span className="ml-1 text-rose-500">คูณเศษคูณเศษ ส่วนคูณส่วน</span>}
          </>
        );
      }}
    />
  );
}

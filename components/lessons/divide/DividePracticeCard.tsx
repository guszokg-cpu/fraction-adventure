"use client";

import { FractionStack } from "@/components/lessons/divide/DivideMath";
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

function dedupe(correct: PracticeOption, candidates: PracticeOption[]): PracticeOption[] {
  const seen = new Set([`${correct.num}/${correct.den}`]);
  const out: PracticeOption[] = [];
  for (const o of candidates) {
    const key = `${o.num}/${o.den}`;
    if (o.num < 1 || o.den < 1 || seen.has(key)) continue;
    seen.add(key);
    out.push(o);
    if (out.length === 3) break;
  }
  return out;
}

function makeFrac(): Problem {
  const p = randInt(2, 5);
  const q = randInt(2, 5);
  const a = randInt(1, p - 1);
  const b = randInt(1, q - 1);
  const correct = opt(a * q, p * b, true);
  const wrongs = dedupe(correct, [
    opt(a * b, p * q, false), // คูณตรงไม่กลับ
    opt(p * b, a * q, false), // กลับผลลัพธ์
    opt(a * q + 1, p * b, false),
  ]);
  return { kind: "frac", a, p, b, q, options: shuffle([correct, ...wrongs]) };
}

function makeWhole(): Problem {
  const w = randInt(2, 4);
  const q = randInt(2, 5);
  const b = randInt(1, q - 1);
  const correct = opt(w * q, b, true);
  const wrongs = dedupe(correct, [
    opt(w * b, q, false), // ลืมกลับ
    opt(b, w * q, false),
    opt(w * q + 1, b, false),
  ]);
  return { kind: "whole", w, b, q, options: shuffle([correct, ...wrongs]) };
}

function makeProblem(): Problem {
  return Math.random() < 0.5 ? makeFrac() : makeWhole();
}

export function DividePracticeCard() {
  return (
    <PracticeShell<Problem>
      badge={5}
      title="แบบฝึกหัด — หารเศษส่วน"
      accent="violet"
      gradient="bg-gradient-to-r from-violet-700 to-purple-500"
      makeProblem={makeProblem}
      getOptions={(p) => p.options}
      renderQuestion={(p) =>
        p.kind === "frac" ? (
          <>
            <FractionStack top={p.a} bottom={p.p} className="text-2xl" />
            <span>÷</span>
            <FractionStack top={p.b} bottom={p.q} className="text-2xl" />
          </>
        ) : (
          <>
            <span className="text-2xl">{p.w}</span>
            <span>÷</span>
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
              <span key="r">คงตัวหน้า กลับตัวหลัง แล้วคูณ</span>,
              <span key="f" className="flex flex-wrap items-center gap-1">
                กลายเป็น <FractionStack top={p.a} bottom={p.p} className="text-sm" /> × <FractionStack top={p.q} bottom={p.b} className="text-sm" />
              </span>,
              <span key="c" className="flex flex-wrap items-center gap-1">
                คูณได้ <FractionStack top={p.a * p.q} bottom={p.p * p.b} className="text-sm" /> แล้วทำให้อย่างต่ำ
              </span>,
            ]
          : [
              <span key="r">จำนวนเต็มมีตัวส่วนเท่ากับ 1 → กลับตัวหลังแล้วคูณ</span>,
              <span key="f" className="flex flex-wrap items-center gap-1">
                กลายเป็น <FractionStack top={p.w} bottom={1} className="text-sm" /> × <FractionStack top={p.q} bottom={p.b} className="text-sm" />
              </span>,
              <span key="c" className="flex flex-wrap items-center gap-1">
                คูณได้ <FractionStack top={p.w * p.q} bottom={p.b} className="text-sm" /> แล้วทำให้อย่างต่ำ
              </span>,
            ]
      }
      renderFeedback={(p, ok) => {
        const rawNum = p.kind === "frac" ? p.a * p.q : p.w * p.q;
        const rawDen = p.kind === "frac" ? p.p * p.b : p.b;
        const s = simplifyFraction(rawNum, rawDen);
        return (
          <>
            {p.kind === "frac" ? (
              <>
                <FractionStack top={p.a} bottom={p.p} className="text-sm" />
                <span>÷</span>
                <FractionStack top={p.b} bottom={p.q} className="text-sm" />
              </>
            ) : (
              <>
                <span className="text-sm">{p.w}</span>
                <span>÷</span>
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
            {!ok && <span className="ml-1 text-rose-500">คงตัวหน้า กลับตัวหลัง แล้วคูณ</span>}
          </>
        );
      }}
    />
  );
}

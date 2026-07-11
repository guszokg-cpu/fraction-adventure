"use client";

import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack } from "@/components/lessons/add/FractionMath";
import { PracticeShell, type PracticeOption } from "@/components/practice/PracticeShell";
import { cn } from "@/lib/cn";
import { gcd } from "@/lib/fractionUtils";
import { randInt, shuffle } from "@/lib/randomFraction";

type Problem =
  | { kind: "same"; a: number; b: number; den: number; options: PracticeOption[] }
  | { kind: "diff"; na: number; da: number; nb: number; db: number; l: number; ca: number; cb: number; options: PracticeOption[] };

const DEN_PAIRS: [number, number][] = [[2, 3], [2, 4], [2, 5], [3, 4], [3, 6], [2, 6], [4, 8]];

function lcm(a: number, b: number) {
  return (a * b) / gcd(a, b);
}

function makeSame(): Problem {
  const den = randInt(3, 9);
  const a = randInt(1, den - 2);
  const b = randInt(1, den - 1 - a);
  const c = a + b;
  const wrongs = shuffle(
    [
      { num: c, den: den * 2 }, // กับดัก: บวกตัวส่วนด้วย
      { num: c + 1, den },
      { num: c - 1, den },
      { num: c + 2, den },
    ].filter((o) => o.num > 0 && !(o.num === c && o.den === den))
  )
    .slice(0, 3)
    .map((o) => ({ ...o, correct: false }));
  return { kind: "same", a, b, den, options: shuffle([{ num: c, den, correct: true }, ...wrongs]) };
}

function makeDiff(): Problem {
  for (let guard = 0; guard < 50; guard++) {
    const [da, db] = DEN_PAIRS[randInt(0, DEN_PAIRS.length - 1)];
    const l = lcm(da, db);
    const na = randInt(1, da - 1);
    const nb = randInt(1, db - 1);
    const ca = na * (l / da);
    const cb = nb * (l / db);
    const sum = ca + cb;
    // เอาเฉพาะโจทย์ที่ผลลัพธ์ไม่เกิน 1 และเป็นอย่างต่ำแล้ว — กันคำตอบถูกซ้ำสองรูป
    if (sum > l || gcd(sum, l) !== 1) continue;
    const wrongs = shuffle(
      [
        { num: na + nb, den: da + db }, // กับดัก: บวกตรง ๆ ทั้งเศษทั้งส่วน
        { num: sum + 1, den: l },
        { num: sum - 1, den: l },
        { num: na + nb, den: l },
      ].filter((o) => o.num > 0 && !(o.num === sum && o.den === l) && o.num * l !== sum * o.den)
    )
      .slice(0, 3)
      .map((o) => ({ ...o, correct: false }));
    return { kind: "diff", na, da, nb, db, l, ca, cb, options: shuffle([{ num: sum, den: l, correct: true }, ...wrongs]) };
  }
  return makeSame();
}

function makeProblem(): Problem {
  return Math.random() < 0.5 ? makeSame() : makeDiff();
}

export function AddPracticeCard() {
  return (
    <PracticeShell<Problem>
      badge={5}
      title="แบบฝึกหัด — บวกเศษส่วน"
      accent="blue"
      gradient="bg-gradient-to-r from-blue-700 to-sky-500"
      makeProblem={makeProblem}
      getOptions={(p) => p.options}
      renderQuestion={(p) =>
        p.kind === "same" ? (
          <>
            <FractionStack top={p.a} bottom={p.den} className="text-2xl" />
            <span>+</span>
            <FractionStack top={p.b} bottom={p.den} className="text-2xl" />
          </>
        ) : (
          <>
            <FractionStack top={p.na} bottom={p.da} className="text-2xl" />
            <span>+</span>
            <FractionStack top={p.nb} bottom={p.db} className="text-2xl" />
          </>
        )
      }
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
      getHints={(p) =>
        p.kind === "same"
          ? [
              <span key="v" className="flex flex-wrap items-center gap-2">
                ลองนับช่องที่ระบาย
                <FractionShape numerator={p.a} denominator={p.den} shape="bar" tone="sky" className="h-6 w-16" />
                รวมกับ
                <FractionShape numerator={p.b} denominator={p.den} shape="bar" tone="violet" className="h-6 w-16" />
              </span>,
              <span key="m">ตัวส่วนเท่ากันอยู่แล้ว บวกเฉพาะตัวเศษ: {p.a} + {p.b} (ตัวส่วนห้ามบวก!)</span>,
              <span key="a">{p.a} + {p.b} = {p.a + p.b} แล้วตัวส่วนคงเดิม {p.den}</span>,
            ]
          : [
              <span key="v">ตัวส่วน {p.da} กับ {p.db} ไม่เท่ากัน — ต้องทำให้เท่ากันก่อนด้วย ค.ร.น.</span>,
              <span key="m">ค.ร.น. ของ {p.da} และ {p.db} คือ {p.l} → แปลงทั้งคู่เป็นส่วน {p.l}</span>,
              <span key="a" className="flex flex-wrap items-center gap-1">
                <FractionStack top={p.na} bottom={p.da} className="text-sm" /> = <FractionStack top={p.ca} bottom={p.l} className="text-sm" />
                {" และ "}
                <FractionStack top={p.nb} bottom={p.db} className="text-sm" /> = <FractionStack top={p.cb} bottom={p.l} className="text-sm" />
                {" แล้วบวกตัวเศษ"}
              </span>,
            ]
      }
      renderFeedback={(p, ok) =>
        p.kind === "same" ? (
          <>
            <FractionStack top={p.a} bottom={p.den} className="text-sm" />
            <span>+</span>
            <FractionStack top={p.b} bottom={p.den} className="text-sm" />
            <span>=</span>
            <FractionStack top={p.a + p.b} bottom={p.den} className="text-sm" />
            {!ok && <span className="ml-1 text-rose-500">ตัวส่วนเท่ากัน บวกแค่ตัวเศษ อย่าบวกตัวส่วน</span>}
          </>
        ) : (
          <>
            <FractionStack top={p.ca} bottom={p.l} className="text-sm" />
            <span>+</span>
            <FractionStack top={p.cb} bottom={p.l} className="text-sm" />
            <span>=</span>
            <FractionStack top={p.ca + p.cb} bottom={p.l} className="text-sm" />
            {!ok && <span className="ml-1 text-rose-500">ทำส่วนให้เท่ากัน ({p.l}) ก่อนแล้วค่อยบวก</span>}
          </>
        )
      }
    />
  );
}

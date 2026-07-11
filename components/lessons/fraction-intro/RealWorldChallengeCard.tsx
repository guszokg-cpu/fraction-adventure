"use client";

import { useState } from "react";
import { Shuffle, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack } from "@/components/fractions/FractionStack";
import { randInt, shuffle } from "@/lib/randomFraction";
import { cn } from "@/lib/cn";
import type { FractionShapeKind } from "@/types/lessonContent";

type Scenario = {
  emoji: string;
  shape: FractionShapeKind;
  unit: string;
  /** เล่าสถานการณ์ เช่น "แม่ตัดเค้กเป็น 8 ชิ้นเท่า ๆ กัน น้องกินไป 3 ชิ้น" */
  tell: (d: number, n: number) => string;
  /** คำถามแบบ "ส่วนที่ใช้ไป" */
  askUsed: string;
  /** คำถามแบบ "ส่วนที่เหลือ" */
  askLeft: string;
};

const SCENARIOS: Scenario[] = [
  {
    emoji: "🎂",
    shape: "circle",
    unit: "ชิ้น",
    tell: (d, n) => `แม่ตัดเค้กเป็น ${d} ชิ้นเท่า ๆ กัน น้องกินไป ${n} ชิ้น`,
    askUsed: "ส่วนที่น้องกินคิดเป็นเศษส่วนเท่าไร?",
    askLeft: "ส่วนที่เหลือคิดเป็นเศษส่วนเท่าไร?",
  },
  {
    emoji: "🍕",
    shape: "pizza",
    unit: "ชิ้น",
    tell: (d, n) => `พิซซ่า 1 ถาดตัดเป็น ${d} ชิ้นเท่า ๆ กัน เพื่อนหยิบไป ${n} ชิ้น`,
    askUsed: "ส่วนที่เพื่อนหยิบคิดเป็นเศษส่วนเท่าไร?",
    askLeft: "ส่วนที่เหลือในถาดคิดเป็นเศษส่วนเท่าไร?",
  },
  {
    emoji: "🍫",
    shape: "chocolate",
    unit: "ชิ้น",
    tell: (d, n) => `ช็อกโกแลต 1 แผ่นหักได้ ${d} ชิ้นเท่า ๆ กัน แบ่งให้น้อง ${n} ชิ้น`,
    askUsed: "ส่วนที่แบ่งให้น้องคิดเป็นเศษส่วนเท่าไร?",
    askLeft: "ส่วนที่เหลือคิดเป็นเศษส่วนเท่าไร?",
  },
  {
    emoji: "🍉",
    shape: "watermelon",
    unit: "ชิ้น",
    tell: (d, n) => `แตงโม 1 ลูกผ่าเป็น ${d} ชิ้นเท่า ๆ กัน กินไปแล้ว ${n} ชิ้น`,
    askUsed: "ส่วนที่กินไปคิดเป็นเศษส่วนเท่าไร?",
    askLeft: "ส่วนที่ยังไม่ได้กินคิดเป็นเศษส่วนเท่าไร?",
  },
  {
    emoji: "🥬",
    shape: "grid",
    unit: "ช่อง",
    tell: (d, n) => `แปลงผักแบ่งเป็น ${d} ช่องเท่า ๆ กัน ปลูกผักไปแล้ว ${n} ช่อง`,
    askUsed: "ส่วนที่ปลูกแล้วคิดเป็นเศษส่วนเท่าไร?",
    askLeft: "ส่วนที่ยังว่างคิดเป็นเศษส่วนเท่าไร?",
  },
];

/** ตัวส่วนที่วาดสวยตามรูปทรง */
const SHAPE_DENS: Record<string, number[]> = {
  circle: [2, 3, 4, 5, 6, 8],
  pizza: [2, 3, 4, 6, 8],
  chocolate: [2, 3, 4, 6, 8],
  watermelon: [2, 3, 4, 6, 8],
  grid: [4, 6, 8, 9],
};

type Frac = { num: number; den: number };
type Problem = {
  scenario: Scenario;
  den: number;
  num: number;
  askLeft: boolean;
  correct: Frac;
  choices: Frac[];
};

function makeProblem(): Problem {
  const scenario = SCENARIOS[randInt(0, SCENARIOS.length - 1)];
  const dens = SHAPE_DENS[scenario.shape];
  const den = dens[randInt(0, dens.length - 1)];
  const num = randInt(1, den - 1);
  const askLeft = Math.random() < 0.4;
  const correct: Frac = askLeft ? { num: den - num, den } : { num, den };

  const seen = new Set([`${correct.num}/${correct.den}`]);
  const wrongsRaw: Frac[] = [
    // กับดัก: ตอบสลับ "กิน" กับ "เหลือ"
    askLeft ? { num, den } : { num: den - num, den },
    // กับดัก: สลับเศษกับส่วน
    { num: den, den: correct.num },
    { num: correct.num + 1, den },
    { num: Math.max(1, correct.num - 1), den },
  ];
  const wrongs: Frac[] = [];
  for (const w of wrongsRaw) {
    const key = `${w.num}/${w.den}`;
    if (w.num < 1 || w.den < 2 || seen.has(key)) continue;
    seen.add(key);
    wrongs.push(w);
    if (wrongs.length === 3) break;
  }
  return { scenario, den, num, askLeft, correct, choices: shuffle([correct, ...wrongs]) };
}

export function RealWorldChallengeCard() {
  const [problem, setProblem] = useState<Problem>(() => makeProblem());
  const [selected, setSelected] = useState<Frac | null>(null);
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);

  const { scenario, den, num, askLeft, correct } = problem;
  const answered = selected !== null;
  const isCorrect = answered && selected.num === correct.num && selected.den === correct.den;

  function next() {
    setProblem(makeProblem());
    setSelected(null);
  }

  function choose(f: Frac) {
    if (answered) return;
    setSelected(f);
    const ok = f.num === correct.num && f.den === correct.den;
    if (ok) {
      setStars((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between bg-gradient-to-r from-rose-500 to-orange-400 px-4 py-2.5 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-sm font-extrabold">5</span>
          <h2 className="text-lg font-extrabold">เศษส่วนรอบตัวเรา 🌍</h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-extrabold">
          <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1">
            <Star size={13} className="fill-amber-300 text-amber-300" /> {stars}
          </span>
          {streak >= 2 && <span className="rounded-full bg-white/20 px-3 py-1">🔥 ต่อเนื่อง {streak}</span>}
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        {/* โจทย์สถานการณ์ */}
        <div className="rounded-2xl border-2 border-orange-100 bg-orange-50/50 p-4 text-center">
          <p className="text-base font-extrabold text-slate-700 sm:text-lg">
            <span className="mr-1 text-2xl">{scenario.emoji}</span> {scenario.tell(den, num)}
          </p>
          <p className={cn("mt-2 text-lg font-extrabold sm:text-xl", askLeft ? "text-emerald-700" : "text-rose-600")}>
            {askLeft ? scenario.askLeft : scenario.askUsed}
          </p>
        </div>

        <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr]">
          {/* ภาพประกอบ */}
          <div className="mx-auto h-40 w-40">
            <FractionShape numerator={num} denominator={den} shape={scenario.shape} tone="accent" className="h-full w-full" />
          </div>

          {/* ตัวเลือก */}
          <div className="grid grid-cols-2 gap-3">
            {problem.choices.map((c, i) => {
              const chosen = answered && selected.num === c.num && selected.den === c.den;
              const isAns = c.num === correct.num && c.den === correct.den;
              return (
                <button
                  key={i}
                  onClick={() => choose(c)}
                  className={cn(
                    "flex h-20 items-center justify-center rounded-xl border-2 transition active:scale-95",
                    !answered && "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50",
                    answered && isAns && "border-emerald-400 bg-emerald-50",
                    answered && chosen && !isAns && "border-rose-400 bg-rose-50",
                    answered && !chosen && !isAns && "border-slate-100 bg-slate-50 opacity-60"
                  )}
                >
                  <FractionStack top={c.num} bottom={c.den} className="text-2xl font-extrabold text-slate-700" />
                </button>
              );
            })}
          </div>
        </div>

        {/* เฉลย */}
        {answered && (
          <div
            className={cn(
              "rounded-2xl border-2 p-4 text-center",
              isCorrect ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
            )}
          >
            <p className={cn("text-base font-extrabold sm:text-lg", isCorrect ? "text-emerald-700" : "text-rose-600")}>
              {isCorrect ? "🎉 เก่งมาก!" : "ยังไม่ใช่ ลองดูเฉลยนะ"}
            </p>
            <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-sm font-bold text-slate-600 sm:text-base">
              {askLeft ? (
                <>ทั้งหมด {den} {scenario.unit} ใช้ไป {num} {scenario.unit} จึงเหลือ {den - num} {scenario.unit} จาก {den} {scenario.unit} =</>
              ) : (
                <>{scenario.emoji} {num} {scenario.unit} จากทั้งหมด {den} {scenario.unit}ที่เท่า ๆ กัน =</>
              )}
              <FractionStack top={correct.num} bottom={correct.den} className="text-lg font-extrabold text-emerald-700" />
            </p>
            <button
              onClick={next}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-orange-600 active:scale-[0.98] sm:text-base"
            >
              <Shuffle size={16} /> ข้อต่อไป
            </button>
          </div>
        )}

        {!answered && (
          <p className="text-center text-sm font-bold text-slate-500">
            อ่านโจทย์ให้ดี — ระวังคำว่า &ldquo;ที่เหลือ&rdquo; กับ &ldquo;ที่ใช้ไป&rdquo; ไม่เหมือนกันนะ!
          </p>
        )}
      </div>
    </Card>
  );
}

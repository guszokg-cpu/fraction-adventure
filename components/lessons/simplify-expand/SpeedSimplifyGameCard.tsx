"use client";

import { useEffect, useState } from "react";
import { Play, RotateCcw, Timer, Trophy } from "lucide-react";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { simplifyFraction } from "@/lib/fractionUtils";
import { randInt, shuffle } from "@/lib/randomFraction";

type Fraction = { numerator: number; denominator: number };

const LOW_POOL: Fraction[] = [
  { numerator: 1, denominator: 2 },
  { numerator: 1, denominator: 3 },
  { numerator: 2, denominator: 3 },
  { numerator: 1, denominator: 4 },
  { numerator: 3, denominator: 4 },
  { numerator: 2, denominator: 5 },
  { numerator: 3, denominator: 5 },
  { numerator: 1, denominator: 6 },
  { numerator: 5, denominator: 6 },
];

const DURATION = 60;

function makeProblem() {
  const low = LOW_POOL[randInt(0, LOW_POOL.length - 1)];
  const k = randInt(2, 5);
  const shown: Fraction = { numerator: low.numerator * k, denominator: low.denominator * k };
  const correct = simplifyFraction(shown.numerator, shown.denominator);

  const distractors: Fraction[] = [
    { numerator: correct.numerator + 1, denominator: correct.denominator },
    { numerator: shown.numerator / 2, denominator: shown.denominator / 2 },
    { numerator: correct.numerator, denominator: correct.denominator + 1 },
    { numerator: correct.numerator + 1, denominator: correct.denominator + 1 },
  ].filter((f) => Number.isInteger(f.numerator) && Number.isInteger(f.denominator) && f.numerator >= 1 && f.denominator >= 2);

  const seen = new Set([`${correct.numerator}/${correct.denominator}`]);
  const wrongs: Fraction[] = [];
  for (const f of distractors) {
    const key = `${f.numerator}/${f.denominator}`;
    if (seen.has(key)) continue;
    seen.add(key);
    wrongs.push(f);
    if (wrongs.length === 3) break;
  }
  while (wrongs.length < 3) {
    const f = { numerator: correct.numerator + wrongs.length + 1, denominator: correct.denominator };
    wrongs.push(f);
  }

  return { shown, correct, choices: shuffle([correct, ...wrongs]) };
}

export function SpeedSimplifyGameCard() {
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [problem, setProblem] = useState(() => makeProblem());
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      setRunning(false);
      setBest((b) => Math.max(b, score));
      return;
    }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
  }, [running, timeLeft, score]);

  useEffect(() => {
    if (!flash) return;
    const id = window.setTimeout(() => setFlash(null), 250);
    return () => window.clearTimeout(id);
  }, [flash]);

  function start() {
    setScore(0);
    setTimeLeft(DURATION);
    setRunning(true);
    setProblem(makeProblem());
  }

  function choose(f: Fraction) {
    if (!running) return;
    const ok = f.numerator === problem.correct.numerator && f.denominator === problem.correct.denominator;
    setFlash(ok ? "correct" : "wrong");
    if (ok) setScore((s) => s + 1);
    setProblem(makeProblem());
  }

  const finished = !running && timeLeft === 0;

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">6</span>
          <h2 className="text-xl font-extrabold">ภารกิจย่อเร็ว 60 วินาที</h2>
        </div>
        {best > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">
            <Trophy size={13} /> สูงสุด {best}
          </span>
        )}
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-center gap-4 rounded-xl bg-orange-50/70 px-4 py-3">
          <span className={cn("flex items-center gap-2 text-2xl font-extrabold sm:text-3xl", timeLeft <= 10 && running ? "text-rose-600" : "text-orange-600")}>
            <Timer size={26} /> {timeLeft} วิ
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 sm:text-3xl">คะแนน {score}</span>
        </div>

        {!running && !finished && (
          <div className="flex justify-center">
            <button
              onClick={start}
              className="flex h-14 items-center gap-2 rounded-xl bg-orange-500 px-8 text-lg font-extrabold text-white shadow-md transition hover:bg-orange-600 active:scale-[0.98]"
            >
              <Play size={20} /> เริ่มเกม
            </button>
          </div>
        )}

        {finished && (
          <div className="space-y-3">
            <div className="rounded-xl bg-emerald-100 px-4 py-4 text-center">
              <p className="text-lg font-extrabold text-emerald-700 sm:text-xl">หมดเวลา! ย่อถูก {score} ข้อ</p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={start}
                className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-orange-600 active:scale-[0.98] sm:text-base"
              >
                <RotateCcw size={16} /> เล่นอีกครั้ง
              </button>
            </div>
          </div>
        )}

        {running && (
          <div className={cn("space-y-4 rounded-2xl border-2 p-4 transition-colors sm:p-5", flash === "correct" ? "border-emerald-300 bg-emerald-50" : flash === "wrong" ? "border-rose-300 bg-rose-50" : "border-orange-100 bg-white")}>
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm font-bold text-slate-500">ย่อให้อยู่ในรูปอย่างต่ำ</span>
              <FractionText numerator={problem.shown.numerator} denominator={problem.shown.denominator} className="text-3xl text-brand-900 sm:text-4xl" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {problem.choices.map((c, i) => (
                <button
                  key={i}
                  onClick={() => choose(c)}
                  className="flex h-16 items-center justify-center rounded-xl border-2 border-slate-200 bg-white transition hover:border-orange-300 hover:bg-orange-50 active:scale-95"
                >
                  <FractionText numerator={c.numerator} denominator={c.denominator} className="text-xl sm:text-2xl" toneClassName="text-slate-700" />
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-sm font-bold text-slate-500 sm:text-base">หาตัวหารร่วมมากที่สุด แล้วหารทั้งเศษและส่วนทีเดียวจะได้เร็วที่สุด</p>
      </div>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Play, RotateCcw, Timer, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionStack } from "@/components/lessons/divide/DivideMath";
import { cn } from "@/lib/cn";
import { simplifyFraction } from "@/lib/fractionUtils";
import { randInt, shuffle } from "@/lib/randomFraction";

type Fraction = { num: number; den: number };
type Problem = { a: number; p: number; b: number; q: number; correct: Fraction; choices: Fraction[] };

const DURATION = 60;

function makeProblem(): Problem {
  const p = randInt(2, 5);
  const q = randInt(2, 5);
  const a = randInt(1, p - 1);
  const b = randInt(1, q - 1);
  // a/p ÷ b/q = a·q / p·b
  const reduced = simplifyFraction(a * q, p * b);
  const correct: Fraction = { num: reduced.numerator, den: reduced.denominator };

  const seen = new Set([`${correct.num}/${correct.den}`]);
  const wrongsRaw = [
    { num: a * b, den: p * q }, // กับดัก: คูณตรงไม่กลับ
    { num: p * b, den: a * q }, // กับดัก: กลับผลลัพธ์
    { num: a * q + 1, den: p * b },
    { num: a * q, den: p * b + 1 },
  ];
  const wrongs: Fraction[] = [];
  for (const w of wrongsRaw) {
    if (w.num < 1 || w.den < 1) continue;
    const s = simplifyFraction(w.num, w.den);
    const key = `${s.numerator}/${s.denominator}`;
    if (seen.has(key)) continue;
    seen.add(key);
    wrongs.push({ num: s.numerator, den: s.denominator });
    if (wrongs.length === 3) break;
  }
  return { a, p, b, q, correct, choices: shuffle([correct, ...wrongs]) };
}

export function DivideTimerGameCard() {
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [problem, setProblem] = useState<Problem>(() => makeProblem());
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
    const ok = f.num === problem.correct.num && f.den === problem.correct.den;
    setFlash(ok ? "correct" : "wrong");
    if (ok) setScore((s) => s + 1);
    setProblem(makeProblem());
  }

  const finished = !running && timeLeft === 0;

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between bg-gradient-to-r from-violet-700 to-purple-500 px-4 py-2.5 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-sm font-extrabold">4</span>
          <h2 className="text-lg font-extrabold">เกมจับเวลา 60 วินาที ⏱️</h2>
        </div>
        {best > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">
            <Trophy size={13} /> สูงสุด {best}
          </span>
        )}
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-center gap-4 rounded-xl bg-violet-50/70 px-4 py-3">
          <span className={cn("flex items-center gap-2 text-2xl font-extrabold sm:text-3xl", timeLeft <= 10 && running ? "text-rose-600" : "text-violet-600")}>
            <Timer size={26} /> {timeLeft} วิ
          </span>
          <span className="text-2xl font-extrabold text-emerald-700 sm:text-3xl">คะแนน {score}</span>
        </div>

        {!running && !finished && (
          <div className="flex justify-center">
            <button
              onClick={start}
              className="flex h-14 items-center gap-2 rounded-xl bg-violet-600 px-8 text-lg font-extrabold text-white shadow-md transition hover:bg-violet-700 active:scale-[0.98]"
            >
              <Play size={20} /> เริ่มเกม
            </button>
          </div>
        )}

        {finished && (
          <div className="space-y-3">
            <div className="rounded-xl bg-emerald-100 px-4 py-4 text-center">
              <p className="text-lg font-extrabold text-emerald-700 sm:text-xl">หมดเวลา! หารถูก {score} ข้อ</p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={start}
                className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-violet-700 active:scale-[0.98] sm:text-base"
              >
                <RotateCcw size={16} /> เล่นอีกครั้ง
              </button>
            </div>
          </div>
        )}

        {running && (
          <div
            className={cn(
              "space-y-4 rounded-2xl border-2 p-4 transition-colors sm:p-5",
              flash === "correct" ? "border-emerald-300 bg-emerald-50" : flash === "wrong" ? "border-rose-300 bg-rose-50" : "border-violet-100 bg-white"
            )}
          >
            <div className="flex items-center justify-center gap-3 text-3xl font-extrabold sm:text-4xl">
              <FractionStack top={problem.a} bottom={problem.p} className="text-pink-600" />
              <span className="text-slate-400">÷</span>
              <FractionStack top={problem.b} bottom={problem.q} className="text-violet-600" />
              <span className="text-slate-400">= ?</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {problem.choices.map((c, i) => (
                <button
                  key={i}
                  onClick={() => choose(c)}
                  className="flex h-16 items-center justify-center rounded-xl border-2 border-slate-200 bg-white transition hover:border-violet-300 hover:bg-violet-50 active:scale-95"
                >
                  <FractionStack top={c.num} bottom={c.den} className="text-xl text-slate-700 sm:text-2xl" />
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-sm font-bold text-slate-500 sm:text-base">
          คงตัวหน้า กลับตัวหลัง แล้วคูณ — ระวังตัวลวงที่คูณตรงหรือกลับผิดตัว!
        </p>
      </div>
    </Card>
  );
}

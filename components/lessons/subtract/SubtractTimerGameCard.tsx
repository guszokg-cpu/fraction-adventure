"use client";

import { useEffect, useState } from "react";
import { Play, RotateCcw, Timer, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionStack } from "@/components/lessons/subtract/SubtractMath";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

type Fraction = { num: number; den: number };
type Problem = { a: number; b: number; den: number; correct: Fraction; choices: Fraction[] };

const DURATION = 60;

function makeProblem(): Problem {
  const den = randInt(3, 9);
  const a = randInt(2, den);
  const b = randInt(1, a - 1);
  const diff = a - b;
  const correct = { num: diff, den };

  const seen = new Set([`${diff}/${den}`]);
  const wrongs: Fraction[] = [];
  const candidates = shuffle([
    { num: a + b, den }, // กับดัก: เผลอบวกแทนลบ
    { num: diff + 1, den },
    { num: Math.max(1, diff - 1), den },
    { num: diff, den: den + 1 },
  ]);
  for (const c of candidates) {
    if (c.num < 1 || c.num > c.den) continue;
    const key = `${c.num}/${c.den}`;
    if (seen.has(key)) continue;
    seen.add(key);
    wrongs.push(c);
    if (wrongs.length === 3) break;
  }
  return { a, b, den, correct, choices: shuffle([correct, ...wrongs]) };
}

export function SubtractTimerGameCard() {
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
      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-700 to-green-500 px-4 py-2.5 text-white">
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
        <div className="flex flex-wrap items-center justify-center gap-4 rounded-xl bg-emerald-50/70 px-4 py-3">
          <span className={cn("flex items-center gap-2 text-2xl font-extrabold sm:text-3xl", timeLeft <= 10 && running ? "text-rose-600" : "text-emerald-600")}>
            <Timer size={26} /> {timeLeft} วิ
          </span>
          <span className="text-2xl font-extrabold text-emerald-700 sm:text-3xl">คะแนน {score}</span>
        </div>

        {!running && !finished && (
          <div className="flex justify-center">
            <button
              onClick={start}
              className="flex h-14 items-center gap-2 rounded-xl bg-emerald-600 px-8 text-lg font-extrabold text-white shadow-md transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              <Play size={20} /> เริ่มเกม
            </button>
          </div>
        )}

        {finished && (
          <div className="space-y-3">
            <div className="rounded-xl bg-emerald-100 px-4 py-4 text-center">
              <p className="text-lg font-extrabold text-emerald-700 sm:text-xl">หมดเวลา! ลบถูก {score} ข้อ</p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={start}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-emerald-700 active:scale-[0.98] sm:text-base"
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
              flash === "correct" ? "border-emerald-300 bg-emerald-50" : flash === "wrong" ? "border-rose-300 bg-rose-50" : "border-emerald-100 bg-white"
            )}
          >
            <div className="flex items-center justify-center gap-3 text-3xl font-extrabold sm:text-4xl">
              <FractionStack top={problem.a} bottom={problem.den} className="text-emerald-600" />
              <span className="text-slate-400">−</span>
              <FractionStack top={problem.b} bottom={problem.den} className="text-rose-500" />
              <span className="text-slate-400">= ?</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {problem.choices.map((c, i) => (
                <button
                  key={i}
                  onClick={() => choose(c)}
                  className="flex h-16 items-center justify-center rounded-xl border-2 border-slate-200 bg-white transition hover:border-emerald-300 hover:bg-emerald-50 active:scale-95"
                >
                  <FractionStack top={c.num} bottom={c.den} className="text-xl text-slate-700 sm:text-2xl" />
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-sm font-bold text-slate-500 sm:text-base">
          ตัวส่วนเท่ากัน ลบเฉพาะตัวเศษ — ระวังตัวลวงที่เผลอบวกแทนลบ!
        </p>
      </div>
    </Card>
  );
}

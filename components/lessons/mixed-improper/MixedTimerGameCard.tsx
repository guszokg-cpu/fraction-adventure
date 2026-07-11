"use client";

import { useEffect, useState } from "react";
import { Play, RotateCcw, Timer, Trophy } from "lucide-react";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { randInt, randomImproper, randomMixed, wrongImproperOpts, wrongMixedOpts } from "@/lib/randomFraction";
import type { ImproperOpt, MixedOpt } from "@/lib/randomFraction";

type Problem =
  | { kind: "toMixed"; num: number; den: number; options: MixedOpt[] }
  | { kind: "toImproper"; whole: number; num: number; den: number; options: ImproperOpt[] };

const DURATION = 60;

function makeProblem(): Problem {
  if (randInt(0, 1) === 0) {
    const { num, den } = randomImproper(2, 6);
    const whole = Math.floor(num / den);
    const rem = num % den;
    return { kind: "toMixed", num, den, options: wrongMixedOpts(whole, rem, den) };
  }
  const { whole, num, den } = randomMixed(2, 6);
  return { kind: "toImproper", whole, num, den, options: wrongImproperOpts(whole * den + num, den) };
}

export function MixedTimerGameCard() {
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

  function choose(correct: boolean) {
    if (!running) return;
    setFlash(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
    setProblem(makeProblem());
  }

  const finished = !running && timeLeft === 0;

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">6</span>
          <h2 className="text-xl font-extrabold">เกมจับเวลา 60 วินาที</h2>
        </div>
        {best > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">
            <Trophy size={13} /> สูงสุด {best}
          </span>
        )}
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-center gap-4 rounded-xl bg-pink-50/60 px-4 py-3">
          <span className={cn("flex items-center gap-2 text-2xl font-extrabold sm:text-3xl", timeLeft <= 10 && running ? "text-rose-600" : "text-pink-600")}>
            <Timer size={26} /> {timeLeft} วิ
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 sm:text-3xl">คะแนน {score}</span>
        </div>

        {!running && !finished && (
          <div className="flex justify-center">
            <button
              onClick={start}
              className="flex h-14 items-center gap-2 rounded-xl bg-pink-600 px-8 text-lg font-extrabold text-white shadow-md transition hover:bg-pink-700 active:scale-[0.98]"
            >
              <Play size={20} /> เริ่มเกม
            </button>
          </div>
        )}

        {finished && (
          <div className="space-y-3">
            <div className="rounded-xl bg-emerald-100 px-4 py-4 text-center">
              <p className="text-lg font-extrabold text-emerald-700 sm:text-xl">หมดเวลา! แปลงถูก {score} ข้อ</p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={start}
                className="flex items-center gap-1.5 rounded-xl bg-pink-600 px-6 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-pink-700 active:scale-[0.98] sm:text-base"
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
              flash === "correct" ? "border-emerald-300 bg-emerald-50" : flash === "wrong" ? "border-rose-300 bg-rose-50" : "border-pink-100 bg-white"
            )}
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              {problem.kind === "toMixed" ? (
                <>
                  <span className="text-sm font-bold text-slate-500">แปลงเป็นจำนวนคละ</span>
                  <FractionText numerator={problem.num} denominator={problem.den} className="text-3xl sm:text-4xl" toneClassName="text-pink-600" />
                </>
              ) : (
                <>
                  <span className="text-sm font-bold text-slate-500">แปลงเป็นเศษเกิน</span>
                  <span className="flex items-center gap-1">
                    <span className="text-3xl font-extrabold text-fuchsia-600 sm:text-4xl">{problem.whole}</span>
                    <FractionText numerator={problem.num} denominator={problem.den} className="text-2xl sm:text-3xl" toneClassName="text-fuchsia-600" />
                  </span>
                </>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {problem.kind === "toMixed"
                ? problem.options.map((o, i) => (
                    <button
                      key={i}
                      onClick={() => choose(o.correct)}
                      className="flex h-16 items-center justify-center gap-1 rounded-xl border-2 border-slate-200 bg-white transition hover:border-pink-300 hover:bg-pink-50 active:scale-95"
                    >
                      <span className="text-xl font-extrabold text-slate-700 sm:text-2xl">{o.whole}</span>
                      {o.num > 0 && <FractionText numerator={o.num} denominator={o.den} className="text-lg sm:text-xl" toneClassName="text-slate-700" />}
                    </button>
                  ))
                : problem.options.map((o, i) => (
                    <button
                      key={i}
                      onClick={() => choose(o.correct)}
                      className="flex h-16 items-center justify-center rounded-xl border-2 border-slate-200 bg-white transition hover:border-pink-300 hover:bg-pink-50 active:scale-95"
                    >
                      <FractionText numerator={o.num} denominator={o.den} className="text-xl sm:text-2xl" toneClassName="text-slate-700" />
                    </button>
                  ))}
            </div>
          </div>
        )}

        <p className="text-center text-sm font-bold text-slate-500 sm:text-base">
          เคล็ดลับ: เศษเกิน→คละ ใช้หาร | คละ→เศษเกิน ใช้คูณแล้วบวก
        </p>
      </div>
    </Card>
  );
}

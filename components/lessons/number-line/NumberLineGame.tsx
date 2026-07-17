"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Lightbulb, Play } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionStack } from "@/components/fractions/FractionStack";
import { DraggableNumberLine } from "@/components/lessons/number-line/DraggableNumberLine";
import { NumberLineStrip } from "@/components/lessons/number-line/NumberLineStrip";
import { DrawChallengeResult } from "@/components/lessons/fraction-from-image/DrawChallengeResult";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

const TOTAL_QUESTIONS = 8;

// พิกัดของ NumberLineStrip — ใช้วางกบซ้อนบนเส้นลากได้
const VB_W = 320;
const VB_H = 82;
const LEFT = 26;
const RIGHT = 294;
const USABLE = RIGHT - LEFT;
const BASE_Y = 46;

type GameQuestion =
  | { mode: "place"; numerator: number; denominator: number }
  | { mode: "read"; numerator: number; denominator: number; choices: string[] };

function otherNumeratorsOf(n: number, d: number): number[] {
  const arr: number[] = [];
  for (let i = 1; i < d; i++) if (i !== n) arr.push(i);
  return arr;
}

/** สลับโหมดวางจุด/อ่านจุดทีละข้อ ให้ได้ฝึกทั้งสองทักษะเท่า ๆ กัน */
function makeGameQuestion(index: number): GameQuestion {
  if (index % 2 === 0) {
    const denominator = randInt(3, 8);
    return { mode: "place", numerator: randInt(1, denominator - 1), denominator };
  }
  const denominator = randInt(5, 9);
  const numerator = randInt(1, denominator - 1);
  const wrongs = shuffle(otherNumeratorsOf(numerator, denominator)).slice(0, 3);
  const choices = shuffle([`${numerator}/${denominator}`, ...wrongs.map((w) => `${w}/${denominator}`)]);
  return { mode: "read", numerator, denominator, choices };
}

type Phase = "intro" | "playing" | "result";

export function NumberLineGame() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState<GameQuestion | null>(null);
  const [placed, setPlaced] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [hint, setHint] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);

  function loadQuestion(index: number) {
    setQuestion(makeGameQuestion(index));
    setQuestionIndex(index);
    setPlaced(0);
    setSelected(null);
    setChecked(false);
    setAnswered(false);
    setWasCorrect(false);
    setHint(false);
  }

  function startGame() {
    setScore(0);
    setResults([]);
    loadQuestion(0);
    setPhase("playing");
  }

  function checkPlace() {
    if (!question || question.mode !== "place") return;
    setChecked(true);
    const correct = placed === question.numerator;
    if (!answered) {
      setAnswered(true);
      setWasCorrect(correct);
      if (correct) setScore((s) => s + 1);
    }
  }

  function chooseRead(choice: string) {
    if (!question || question.mode !== "read" || selected) return;
    setSelected(choice);
    setChecked(true);
    const correct = choice === `${question.numerator}/${question.denominator}`;
    setAnswered(true);
    setWasCorrect(correct);
    if (correct) setScore((s) => s + 1);
  }

  function nextQuestion() {
    setResults((r) => [...r, wasCorrect]);
    const next = questionIndex + 1;
    if (next >= TOTAL_QUESTIONS) {
      setPhase("result");
      return;
    }
    loadQuestion(next);
  }

  function restart() {
    setPhase("intro");
  }

  if (phase === "intro") {
    return (
      <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-lime-500 px-6 py-5 text-white">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">
            5
          </span>
          <div>
            <h2 className="text-2xl font-extrabold">เกมกบกระโดดหาจุด</h2>
            <p className="mt-0.5 text-sm font-bold text-emerald-100">สลับกัน 2 แบบ ทั้งพากบไปหาจุด และอ่านว่ากบอยู่ที่ไหน</p>
          </div>
          <span className="ml-auto hidden text-4xl sm:block" aria-hidden>
            🐸
          </span>
        </div>
        <div className="space-y-5 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm font-extrabold text-emerald-700">🎯 โหมดพากบไปหาจุด</p>
              <p className="mt-1 text-sm font-bold text-emerald-700">โจทย์บอกเศษส่วน แล้วลากกบไปวางให้ตรงตำแหน่ง</p>
            </div>
            <div className="rounded-2xl bg-violet-50 p-4">
              <p className="text-sm font-extrabold text-violet-700">🔍 โหมดอ่านจุด</p>
              <p className="mt-1 text-sm font-bold text-violet-700">กบนั่งอยู่บนเส้น ให้ตอบว่ากบอยู่ที่เศษส่วนใด</p>
            </div>
          </div>
          <button
            onClick={startGame}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-base font-extrabold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            <Play size={18} />
            เริ่มเกม ({TOTAL_QUESTIONS} ข้อ)
          </button>
        </div>
      </Card>
    );
  }

  if (phase === "result") {
    return (
      <Card className="rounded-3xl">
        <DrawChallengeResult score={score} total={TOTAL_QUESTIONS} results={results} onRestart={restart} />
      </Card>
    );
  }

  if (!question) return null;

  const isPlace = question.mode === "place";
  const frogLeftPct = ((LEFT + (placed / question.denominator) * USABLE) / VB_W) * 100;
  const frogTopPct = (BASE_Y / VB_H) * 100;

  return (
    <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-600 to-lime-500 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">
            5
          </span>
          <h2 className="text-2xl font-extrabold">เกมกบกระโดดหาจุด</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-extrabold">
            ข้อที่ {questionIndex + 1} จาก {TOTAL_QUESTIONS}
          </span>
          <span className="rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-extrabold">
            ⭐ คะแนน {score}/{TOTAL_QUESTIONS}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-6">
        {/* โจทย์ */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 text-center">
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-xs font-extrabold",
              isPlace ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"
            )}
          >
            {isPlace ? "🎯 โหมดพากบไปหาจุด" : "🔍 โหมดอ่านจุด"}
          </span>
          {isPlace ? (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-lg font-bold text-slate-700">
              <span>ลากกบไปวางที่</span>
              <FractionStack top={question.numerator} bottom={question.denominator} className="text-3xl font-extrabold text-emerald-700" />
              <span>ให้ตรงเป๊ะ!</span>
            </div>
          ) : (
            <p className="mt-3 text-lg font-bold text-slate-700">กบนั่งอยู่ที่จุดใดบนเส้นจำนวน?</p>
          )}
        </div>

        {/* เส้นจำนวน */}
        <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
          {isPlace ? (
            <div className="relative w-full max-w-lg">
              <DraggableNumberLine
                denominator={question.denominator}
                value={placed}
                onChange={(v) => {
                  setPlaced(v);
                  setChecked(false);
                }}
                tone="emerald"
                showFractionLabels={false}
                showMarkerLabel={false}
                className="w-full"
              />
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-[92%] text-xl transition-all duration-200 ease-out sm:text-2xl"
                style={{ left: `${frogLeftPct}%`, top: `${frogTopPct}%` }}
                aria-hidden
              >
                🐸
              </div>
            </div>
          ) : (
            <div className="relative w-full max-w-lg">
              <NumberLineStrip
                denominator={question.denominator}
                marker={question.numerator}
                tone="violet"
                showFractionLabels={false}
                showMarkerLabel={false}
                className="h-full w-full"
              />
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-[92%] text-xl sm:text-2xl"
                style={{
                  left: `${((LEFT + (question.numerator / question.denominator) * USABLE) / VB_W) * 100}%`,
                  top: `${frogTopPct}%`,
                }}
                aria-hidden
              >
                🐸
              </div>
            </div>
          )}
        </div>

        {/* ตัวเลือกโหมดอ่านจุด */}
        {!isPlace && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {question.choices.map((choice) => {
              const [top, bottom] = choice.split("/").map(Number);
              const chosen = selected === choice;
              const right = choice === `${question.numerator}/${question.denominator}`;
              return (
                <button
                  key={choice}
                  onClick={() => chooseRead(choice)}
                  disabled={selected !== null}
                  className={cn(
                    "flex items-center justify-center rounded-xl border-2 py-3 transition",
                    !selected && "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50",
                    selected && !chosen && !right && "border-slate-100 bg-slate-50 opacity-40",
                    chosen && right && "border-emerald-400 bg-emerald-50",
                    chosen && !right && "border-rose-400 bg-rose-50",
                    selected && right && !chosen && "border-emerald-300 bg-emerald-50/70"
                  )}
                >
                  <FractionStack top={top} bottom={bottom} className="text-xl font-extrabold text-brand-900" />
                </button>
              );
            })}
          </div>
        )}

        {/* คำใบ้ */}
        {hint && (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
            💡{" "}
            {isPlace
              ? "ตัวส่วนบอกว่าเส้นแบ่งเป็นกี่ช่อง ตัวเศษบอกว่าต้องนับจาก 0 ไปกี่ช่อง — ค่อย ๆ นับทีละขีดนะ"
              : "นับช่องทั้งหมดระหว่าง 0 กับ 1 ก่อน (นั่นคือตัวส่วน) แล้วนับว่ากบอยู่ห่างจาก 0 กี่ช่อง (นั่นคือตัวเศษ)"}
          </div>
        )}

        {/* ผลการตรวจ */}
        {checked && (
          <div
            className={cn(
              "flex flex-wrap items-center gap-1 rounded-xl px-4 py-3 text-sm font-bold",
              (isPlace ? placed === question.numerator : selected === `${question.numerator}/${question.denominator}`)
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-600"
            )}
          >
            {isPlace
              ? placed === question.numerator
                ? <>ถูกต้อง! กบถึง <Frac n={question.numerator} d={question.denominator} /> พอดีเป๊ะ 🐸🎉</>
                : <>ยังไม่ตรง — ตอนนี้กบอยู่ที่ <Frac n={placed} d={question.denominator} /> แต่โจทย์ต้องการ <Frac n={question.numerator} d={question.denominator} /> ลองเลื่อนอีกนิดนะ</>
              : selected === `${question.numerator}/${question.denominator}`
                ? <>ถูกต้อง! กบอยู่ที่ <Frac n={question.numerator} d={question.denominator} /> เก่งมาก 🎉</>
                : <>ยังไม่ถูก — เส้นแบ่งเป็น {question.denominator} ช่อง กบอยู่ห่างจาก 0 ไป {question.numerator} ช่อง จึงเป็น <Frac n={question.numerator} d={question.denominator} /></>}
          </div>
        )}

        {/* ปุ่มควบคุม */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex gap-2.5">
            <button
              onClick={() => setHint(true)}
              disabled={hint}
              className="flex items-center gap-1.5 rounded-xl border-2 border-amber-200 bg-white px-4 py-2.5 text-sm font-extrabold text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Lightbulb size={16} />
              ขอคำใบ้
            </button>
            {isPlace && (
              <button
                onClick={checkPlace}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-emerald-700"
              >
                <CheckCircle size={16} />
                ตรวจคำตอบ
              </button>
            )}
          </div>

          {answered && (
            <button
              onClick={nextQuestion}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-violet-700 active:scale-[0.98]"
            >
              {questionIndex + 1 >= TOTAL_QUESTIONS ? "ดูผลคะแนน" : "ข้อถัดไป"}
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

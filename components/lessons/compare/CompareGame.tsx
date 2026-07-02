"use client";

import { useState } from "react";
import { ArrowRight, Lightbulb, Play, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { DrawChallengeResult } from "@/components/lessons/fraction-from-image/DrawChallengeResult";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

const TOTAL_QUESTIONS = 8;

const SIGNS = [">", "=", "<"] as const;
type Sign = (typeof SIGNS)[number];

type Frac = { n: number; d: number };

function signOf(a: Frac, b: Frac): Sign {
  const av = a.n / a.d;
  const bv = b.n / b.d;
  if (av > bv) return ">";
  if (av < bv) return "<";
  return "=";
}

function randProper(): Frac {
  const d = randInt(2, 9);
  return { n: randInt(1, d - 1), d };
}

/** สุ่มเศษส่วนที่ค่าไม่ซ้ำกับตัวที่มีอยู่ (กันเสมอในโหมดเรียงลำดับ) */
function distinctProper(existing: Frac[]): Frac {
  let f = randProper();
  let tries = 0;
  while (existing.some((e) => Math.abs(e.n / e.d - f.n / f.d) < 0.03) && tries++ < 40) {
    f = randProper();
  }
  return f;
}

type SignQuestion = { mode: "sign"; left: Frac; right: Frac };
type OrderQuestion = { mode: "order"; items: Frac[] };
type GameQuestion = SignQuestion | OrderQuestion;

function makeQuestion(index: number): GameQuestion {
  if (index % 2 === 0) {
    return { mode: "sign", left: randProper(), right: randProper() };
  }
  const items: Frac[] = [];
  for (let i = 0; i < 3; i++) items.push(distinctProper(items));
  return { mode: "order", items };
}

export function CompareGame() {
  const [phase, setPhase] = useState<"intro" | "playing" | "result">("intro");
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState<GameQuestion | null>(null);
  const [pickedSign, setPickedSign] = useState<Sign | null>(null);
  const [orderPicks, setOrderPicks] = useState<number[]>([]);
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [hint, setHint] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);

  function load(i: number) {
    setQuestion(makeQuestion(i));
    setIndex(i);
    setPickedSign(null);
    setOrderPicks([]);
    setAnswered(false);
    setWasCorrect(false);
    setHint(false);
  }

  function start() {
    setScore(0);
    setResults([]);
    load(0);
    setPhase("playing");
  }

  function finishAnswer(correct: boolean) {
    setAnswered(true);
    setWasCorrect(correct);
    if (correct) setScore((s) => s + 1);
  }

  function chooseSign(sign: Sign) {
    if (answered || !question || question.mode !== "sign") return;
    setPickedSign(sign);
    finishAnswer(sign === signOf(question.left, question.right));
  }

  function pickOrder(itemIndex: number) {
    if (answered || !question || question.mode !== "order" || orderPicks.includes(itemIndex)) return;
    const next = [...orderPicks, itemIndex];
    setOrderPicks(next);
    if (next.length === question.items.length) {
      // ตรวจว่าเรียงจากน้อยไปมากถูกต้องหรือไม่
      const vals = next.map((i) => question.items[i].n / question.items[i].d);
      const correct = vals.every((v, i) => i === 0 || vals[i - 1] <= v + 1e-9);
      finishAnswer(correct);
    }
  }

  function next() {
    setResults((r) => [...r, wasCorrect]);
    const ni = index + 1;
    if (ni >= TOTAL_QUESTIONS) {
      setPhase("result");
      return;
    }
    load(ni);
  }

  if (phase === "intro") {
    return (
      <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-5 text-white">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">7</span>
          <div>
            <h2 className="text-2xl font-extrabold">เกมฝึกเปรียบเทียบ</h2>
            <p className="mt-0.5 text-sm font-bold text-emerald-100">สลับกัน 2 แบบ ทั้งเลือกเครื่องหมาย และเรียงลำดับเศษส่วน</p>
          </div>
        </div>
        <div className="space-y-5 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm font-extrabold text-emerald-700">⚖️ โหมดเลือกเครื่องหมาย</p>
              <p className="mt-1 text-sm font-bold text-emerald-700">ดูเศษส่วน 2 ตัว แล้วเลือก &gt; &lt; = ให้ถูก</p>
            </div>
            <div className="rounded-2xl bg-violet-50 p-4">
              <p className="text-sm font-extrabold text-violet-700">🔢 โหมดเรียงลำดับ</p>
              <p className="mt-1 text-sm font-bold text-violet-700">คลิกเศษส่วนจากน้อยไปมากให้ถูกลำดับ</p>
            </div>
          </div>
          <button onClick={start} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-base font-extrabold text-white transition hover:bg-emerald-700 active:scale-[0.98]">
            <Play size={18} /> เริ่มเกม ({TOTAL_QUESTIONS} ข้อ)
          </button>
        </div>
      </Card>
    );
  }

  if (phase === "result") {
    return (
      <Card className="rounded-3xl">
        <DrawChallengeResult score={score} total={TOTAL_QUESTIONS} results={results} onRestart={() => setPhase("intro")} />
      </Card>
    );
  }

  if (!question) return null;
  const isSign = question.mode === "sign";
  const correctOrder = !isSign
    ? [...question.items.keys()].sort((a, b) => question.items[a].n / question.items[a].d - question.items[b].n / question.items[b].d)
    : [];

  return (
    <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">7</span>
          <h2 className="text-2xl font-extrabold">เกมฝึกเปรียบเทียบ</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-extrabold">ข้อที่ {index + 1} จาก {TOTAL_QUESTIONS}</span>
          <span className="rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-extrabold">⭐ คะแนน {score}/{TOTAL_QUESTIONS}</span>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-center">
          <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-extrabold", isSign ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700")}>
            {isSign ? "⚖️ เลือกเครื่องหมายที่ถูกต้อง" : "🔢 คลิกจากน้อยไปมาก"}
          </span>
        </div>

        {isSign ? (
          <>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              <StackedFraction numerator={question.left.n} denominator={question.left.d} className="text-4xl" toneClassName="text-sky-600" />
              <span className="text-3xl font-extrabold text-slate-300">?</span>
              <StackedFraction numerator={question.right.n} denominator={question.right.d} className="text-4xl" toneClassName="text-emerald-600" />
            </div>
            <div className="flex items-center justify-center gap-3">
              {SIGNS.map((sign) => {
                const active = pickedSign === sign;
                const right = sign === signOf(question.left, question.right);
                return (
                  <button
                    key={sign}
                    onClick={() => chooseSign(sign)}
                    disabled={answered}
                    className={cn(
                      "grid h-14 w-14 place-items-center rounded-2xl border-2 text-3xl font-extrabold transition",
                      !answered && "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50",
                      answered && !active && !right && "border-slate-100 bg-slate-50 text-slate-300",
                      active && right && "border-emerald-400 bg-emerald-500 text-white",
                      active && !right && "border-rose-400 bg-rose-50 text-rose-600",
                      answered && right && !active && "border-emerald-300 bg-emerald-50 text-emerald-600"
                    )}
                  >
                    {sign}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* แถวลำดับที่เลือกแล้ว */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-bold text-slate-400">น้อย</span>
              <div className="flex min-h-[60px] flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-2">
                {orderPicks.length === 0 ? (
                  <span className="text-xs font-bold text-slate-300">คลิกการ์ดด้านล่างเรียงจากน้อยไปมาก</span>
                ) : (
                  orderPicks.map((pi, slot) => (
                    <span key={pi} className="flex items-center gap-1">
                      {slot > 0 && <span className="text-slate-300">&lt;</span>}
                      <StackedFraction numerator={question.items[pi].n} denominator={question.items[pi].d} className="text-xl" toneClassName="text-emerald-600" />
                    </span>
                  ))
                )}
              </div>
              <span className="text-xs font-bold text-slate-400">มาก</span>
            </div>
            {/* การ์ดให้เลือก */}
            <div className="flex flex-wrap justify-center gap-3">
              {question.items.map((it, i) => {
                const used = orderPicks.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => pickOrder(i)}
                    disabled={used || answered}
                    className={cn(
                      "grid h-20 w-20 place-items-center rounded-2xl border-2 transition",
                      used ? "border-slate-100 bg-slate-50 opacity-30" : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"
                    )}
                  >
                    <StackedFraction numerator={it.n} denominator={it.d} className="text-2xl" toneClassName="text-brand-900" />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {hint && !answered && (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
            💡 {isSign
              ? "ถ้าตัวส่วนต่างกัน ลองนึกภาพแท่ง หรือทำตัวส่วนให้เท่ากันก่อนเทียบตัวเศษ"
              : "เทียบทีละคู่ก็ได้ — ตัวที่ค่าน้อยที่สุดวางซ้ายสุด แล้วไล่ไปขวา"}
          </div>
        )}

        {answered && (
          <div className={cn("rounded-xl px-4 py-3 text-sm font-bold", wasCorrect ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600")}>
            {isSign ? (
              <span className="flex flex-wrap items-center gap-1.5">
                {wasCorrect ? "ถูกต้อง! " : "ยังไม่ถูก — คำตอบคือ "}
                <StackedFraction numerator={question.left.n} denominator={question.left.d} className="text-base" toneClassName="text-sky-600" />
                <span className="text-lg font-extrabold">{signOf(question.left, question.right)}</span>
                <StackedFraction numerator={question.right.n} denominator={question.right.d} className="text-base" toneClassName="text-emerald-600" />
              </span>
            ) : (
              <span className="flex flex-wrap items-center gap-1.5">
                {wasCorrect ? "ถูกต้อง! " : "ยังไม่ถูก — ลำดับที่ถูกคือ "}
                {correctOrder.map((pi, slot) => (
                  <span key={pi} className="flex items-center gap-1">
                    {slot > 0 && <span className="text-slate-400">&lt;</span>}
                    <StackedFraction numerator={question.items[pi].n} denominator={question.items[pi].d} className="text-base" toneClassName="text-emerald-700" />
                  </span>
                ))}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex gap-2.5">
            <button onClick={() => setHint(true)} disabled={hint || answered} className="flex items-center gap-1.5 rounded-xl border-2 border-amber-200 bg-white px-4 py-2.5 text-sm font-extrabold text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40">
              <Lightbulb size={16} /> ขอคำใบ้
            </button>
            {!isSign && !answered && orderPicks.length > 0 && (
              <button onClick={() => setOrderPicks([])} className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                <RotateCcw size={15} /> ล้าง
              </button>
            )}
          </div>
          {answered && (
            <button onClick={next} className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-violet-700 active:scale-[0.98]">
              {index + 1 >= TOTAL_QUESTIONS ? "ดูผลคะแนน" : "ข้อถัดไป"} <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

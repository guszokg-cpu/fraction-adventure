"use client";

import { useState, type ReactNode } from "react";
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionStack } from "@/components/fractions/FractionStack";
import { Confetti } from "@/components/ui/Confetti";
import { cn } from "@/lib/cn";
import type { QuizQuestion } from "@/lib/quizGenerators";

export type { QuizQuestion };

const LABELS = ["ก", "ข", "ค", "ง"];

/** Render "N/D" as FractionStack, "W N/D" as mixed number, else plain text */
function ChoiceDisplay({ text }: { text: string }) {
  if (/^\d+ \d+\/\d+$/.test(text)) {
    const [whole, fp] = text.split(" ");
    const [n, d] = fp.split("/").map(Number);
    return (
      <span className="inline-flex items-center gap-1 text-xl font-extrabold">
        <span>{whole}</span>
        <FractionStack top={n} bottom={d} className="text-xl" />
      </span>
    );
  }
  if (/^\d+\/\d+$/.test(text)) {
    const [n, d] = text.split("/").map(Number);
    return <FractionStack top={n} bottom={d} className="text-2xl font-extrabold" />;
  }
  return <span className="text-base font-extrabold">{text}</span>;
}

/** Inline-render N/D patterns within a prompt string */
function PromptText({ text }: { text: string }) {
  const parts = text.split(/(\d+\/\d+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/^\d+\/\d+$/.test(part)) {
          const [n, d] = part.split("/").map(Number);
          return (
            <span key={i} className="inline-flex items-end">
              <FractionStack top={n} bottom={d} className="text-xl" />
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

type LessonQuizProps = {
  title?: string;
  gradient?: string;
  makeQuestion: () => QuizQuestion;
  count?: number;
};

export function LessonQuiz({
  title = "แบบทดสอบหลังเรียน",
  gradient = "bg-gradient-to-r from-pink-600 to-rose-500",
  makeQuestion,
  count = 10,
}: LessonQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    Array.from({ length: count }, makeQuestion)
  );
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [confetti, setConfetti] = useState(0);

  const q = questions[current];
  const isAnswered = selected !== null;
  const isCorrect = isAnswered && selected === q.correctIndex;

  function choose(idx: number) {
    if (isAnswered) return;
    setSelected(idx);
    if (idx === q.correctIndex) setConfetti((c) => c + 1);
  }

  function goNext() {
    const newAnswers = [...answers, selected!];
    if (current + 1 >= count) {
      setAnswers(newAnswers);
      setDone(true);
    } else {
      setAnswers(newAnswers);
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  }

  function restart() {
    setQuestions(Array.from({ length: count }, makeQuestion));
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setDone(false);
  }

  /* ── Score screen ── */
  if (done) {
    const score = answers.filter((a, i) => a === questions[i].correctIndex).length;
    const pct = score / count;
    const emoji = pct >= 0.9 ? "🏆" : pct >= 0.7 ? "😄" : pct >= 0.5 ? "🙂" : "😅";
    const msg =
      pct >= 0.9 ? "ยอดเยี่ยมมาก!" :
      pct >= 0.7 ? "ทำได้ดีมาก!" :
      pct >= 0.5 ? "พอใช้ได้ ลองอีกครั้งนะ" :
      "ทบทวนบทเรียนแล้วลองใหม่นะ";

    return (
      <Card className="relative overflow-hidden p-0">
        <Confetti trigger={pct >= 0.7 ? 1 : 0} />
        <div className={cn("px-5 py-4 text-white", gradient)}>
          <h2 className="text-lg font-extrabold">{title}</h2>
          <p className="text-sm opacity-80">สรุปผลการทำแบบทดสอบ</p>
        </div>
        <div className="flex flex-col items-center gap-5 px-5 py-10 text-center">
          <div className="text-7xl">{emoji}</div>
          <div>
            <p className="text-xl font-extrabold text-slate-700">{msg}</p>
            <p className="mt-2 text-5xl font-extrabold text-brand-700">
              {score}
              <span className="text-2xl text-slate-400"> / {count}</span>
            </p>
          </div>
          {/* per-question result dots */}
          <div className="flex flex-wrap justify-center gap-2">
            {answers.map((a, i) => {
              const ok = a === questions[i].correctIndex;
              return (
                <div
                  key={i}
                  title={`ข้อ ${i + 1}: ${ok ? "ถูก" : "ผิด"}`}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold",
                    ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
                  )}
                >
                  {ok ? "✓" : "✗"}
                </div>
              );
            })}
          </div>
          <button
            onClick={restart}
            className={cn(
              "flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-extrabold text-white transition hover:opacity-90",
              gradient
            )}
          >
            <RotateCcw size={16} /> สุ่มข้อใหม่ ทำอีกรอบ
          </button>
        </div>
      </Card>
    );
  }

  /* ── Quiz screen ── */
  const progress = ((current + (isAnswered ? 1 : 0)) / count) * 100;

  return (
    <Card className="relative overflow-hidden p-0">
      <Confetti trigger={confetti} />

      {/* Header + progress bar */}
      <div className={cn("px-5 py-3 text-white", gradient)}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-extrabold sm:text-lg">{title}</h2>
          <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">
            {current + 1} / {count}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/30">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="p-5">
        {/* Question */}
        <div className="mb-5 flex min-h-[4.5rem] flex-wrap items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-5 py-4 text-center text-lg font-extrabold text-slate-800">
          <PromptText text={q.prompt} />
        </div>

        {/* Choices 2 × 2 */}
        <div className="grid grid-cols-2 gap-3">
          {q.choices.map((choice, idx) => {
            const isChosen = selected === idx;
            const isRight = idx === q.correctIndex;
            return (
              <button
                key={idx}
                onClick={() => choose(idx)}
                disabled={isAnswered}
                className={cn(
                  "flex min-h-[5.5rem] flex-col items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-3 transition",
                  !isAnswered && "border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50",
                  isAnswered && !isChosen && !isRight && "border-slate-100 bg-slate-50 opacity-40",
                  isChosen && isRight && "border-emerald-400 bg-emerald-50",
                  isChosen && !isRight && "border-rose-400 bg-rose-50",
                  isAnswered && isRight && !isChosen && "border-emerald-300 bg-emerald-50/70 opacity-100",
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {LABELS[idx]}
                </span>
                <ChoiceDisplay text={choice} />
                {isAnswered && isRight && (
                  <CheckCircle size={14} className="text-emerald-500" />
                )}
                {isChosen && !isRight && (
                  <XCircle size={14} className="text-rose-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isAnswered && (
          <div
            className={cn(
              "mt-4 flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-bold",
              isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
            )}
          >
            {isCorrect ? (
              <CheckCircle size={18} className="mt-0.5 shrink-0 text-emerald-500" />
            ) : (
              <XCircle size={18} className="mt-0.5 shrink-0 text-rose-500" />
            )}
            <span>
              {isCorrect ? "ถูกต้อง! " : "ไม่ถูก — "}
              {q.explanation}
            </span>
          </div>
        )}

        {/* Next / finish button */}
        {isAnswered && (
          <button
            onClick={goNext}
            className={cn(
              "mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold text-white transition hover:opacity-90",
              gradient
            )}
          >
            {current + 1 < count ? (
              <>ข้อถัดไป <ArrowRight size={16} /></>
            ) : (
              <><Trophy size={16} /> ดูผลคะแนน</>
            )}
          </button>
        )}
      </div>
    </Card>
  );
}

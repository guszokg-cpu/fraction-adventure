"use client";

import { useState } from "react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack } from "@/components/fractions/FractionStack";
import { cn } from "@/lib/cn";
import type { FractionShapeKind, FractionTone } from "@/types/lessonContent";

type QuizItem = {
  id: string;
  prompt: string;
  render: "fraction-image" | "read" | "equal";
  numerator: number;
  denominator: number;
  shape: FractionShapeKind;
  tone: FractionTone;
  choices: string[];
  answer: string;
};

const QUIZ: QuizItem[] = [
  {
    id: "mq1",
    prompt: "ภาพนี้แทนเศษส่วนใด?",
    render: "fraction-image",
    numerator: 1,
    denominator: 2,
    shape: "pizza",
    tone: "accent",
    choices: ["1/2", "2/3", "1/3", "3/4"],
    answer: "1/2",
  },
  {
    id: "mq2",
    prompt: "เศษห้าส่วนแปด เขียนเป็นเศษส่วนได้อย่างไร?",
    render: "read",
    numerator: 5,
    denominator: 8,
    shape: "grid",
    tone: "violet",
    choices: ["5/8", "8/5", "5/10", "1/5"],
    answer: "5/8",
  },
  {
    id: "mq3",
    prompt: "ภาพนี้แบ่งเป็นส่วนเท่า ๆ กันหรือไม่?",
    render: "equal",
    numerator: 3,
    denominator: 6,
    shape: "chocolate",
    tone: "accent",
    choices: ["เท่ากัน", "ไม่เท่ากัน"],
    answer: "เท่ากัน",
  },
];

export function FractionExamplesMiniQuiz() {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const score = QUIZ.filter((q) => answers[q.id] === q.answer).length;
  const answered = Object.keys(answers).length;

  return (
    <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-extrabold text-violet-700">
          <span>✏️</span> ลองทำดูสิ! <span className="text-slate-400">(3 ข้อสั้น ๆ)</span>
        </div>
        <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-extrabold text-violet-600">
          {score}/{QUIZ.length}
        </span>
      </div>

      <div className="mt-3 space-y-4">
        {QUIZ.map((q, index) => {
          const selected = answers[q.id];
          const isCorrect = selected === q.answer;
          return (
            <div key={q.id} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
              <div className="flex gap-1.5 text-xs font-extrabold text-slate-700">
                <span className="text-violet-500">{index + 1}.</span>
                {q.prompt}
              </div>

              {(q.render === "fraction-image" || q.render === "equal") && (
                <FractionShape
                  numerator={q.numerator}
                  denominator={q.denominator}
                  shape={q.shape}
                  tone={q.tone}
                  className="mx-auto my-2 h-16 w-24"
                />
              )}

              <div className="mt-2 flex flex-wrap gap-1.5">
                {q.choices.map((choice) => {
                  const active = selected === choice;
                  const correctChoice = q.answer === choice;
                  const isFractionChoice = /^\d+\/\d+$/.test(choice);
                  return (
                    <button
                      key={choice}
                      onClick={() => setAnswers((cur) => ({ ...cur, [q.id]: choice }))}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-extrabold transition",
                        !active && "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50",
                        active && !isCorrect && "border-rose-300 bg-rose-50 text-rose-600",
                        active && isCorrect && "border-emerald-300 bg-emerald-50 text-emerald-700",
                        selected && correctChoice && "border-emerald-300 bg-emerald-50 text-emerald-700"
                      )}
                    >
                      {isFractionChoice ? (
                        <FractionStack
                          top={choice.split("/")[0]}
                          bottom={choice.split("/")[1]}
                        />
                      ) : (
                        choice
                      )}
                    </button>
                  );
                })}
              </div>

              {selected && (
                <p
                  className={cn(
                    "mt-2 rounded-lg px-2.5 py-1.5 text-[11px] font-bold",
                    isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  )}
                >
                  {isCorrect ? "✓ ถูกต้อง เก่งมาก!" : "ลองใหม่อีกครั้งนะ"}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-center text-[10px] font-bold text-sky-600">
        ตอบแล้ว {answered}/{QUIZ.length} ข้อ — กิจกรรมนี้ยังไม่บันทึกคะแนนจริง
      </p>
    </div>
  );
}

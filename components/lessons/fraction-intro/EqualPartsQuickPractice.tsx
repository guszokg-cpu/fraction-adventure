"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack } from "@/components/fractions/FractionStack";
import { UnequalCircle } from "@/components/lessons/shared/UnequalShapes";
import { cn } from "@/lib/cn";

type VisualKind = "equalCircle" | "equalBar" | "unequalCircle";

type Question = {
  id: string;
  prompt: string;
  visual: VisualKind;
  choices: string[];
  answer: string;
};

/**
 * ข้อ 3 ถือว่า "ยังไม่ได้" เป็นคำตอบที่ถูก เพราะภาพแบ่งไม่เท่ากันเขียนเป็นเศษส่วนที่ถูกต้องไม่ได้
 * (ตรงตามกฎคณิตศาสตร์ของบทเรียนนี้)
 */
const QUESTIONS: Question[] = [
  { id: "q1", prompt: "ภาพนี้แบ่งเท่า ๆ กันหรือไม่?", visual: "equalCircle", choices: ["ใช่", "ไม่ใช่"], answer: "ใช่" },
  {
    id: "q2",
    prompt: "ถ้าแบ่งเป็น 4 ส่วนเท่ากัน และระบาย 2 ส่วน เขียนเป็นเศษส่วนใด?",
    visual: "equalBar",
    choices: ["2/4", "4/2", "1/4"],
    answer: "2/4",
  },
  {
    id: "q3",
    prompt: "ภาพที่แบ่งไม่เท่ากัน เขียนเป็นเศษส่วนได้ถูกต้องหรือไม่?",
    visual: "unequalCircle",
    choices: ["ได้", "ยังไม่ได้"],
    answer: "ยังไม่ได้",
  },
];

function QuestionVisual({ type }: { type: VisualKind }) {
  if (type === "equalCircle") {
    return <FractionShape numerator={1} denominator={4} shape="circle" tone="accent" className="h-24 w-24 shrink-0" />;
  }
  if (type === "equalBar") {
    return <FractionShape numerator={2} denominator={4} shape="bar" tone="emerald" className="h-14 w-44 shrink-0" />;
  }
  return <UnequalCircle className="h-24 w-24 shrink-0" />;
}

export function EqualPartsQuickPractice() {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  return (
    <Card className="rounded-2xl">
      <h3 className="flex items-center gap-2 text-xl font-extrabold text-brand-900">
        <span>🧠</span> ลองคิดดู
      </h3>

      <div className="mt-5 space-y-5">
        {QUESTIONS.map((q, i) => {
          const selected = answers[q.id];
          const isCorrect = selected === q.answer;

          return (
            <div key={q.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-500 text-sm font-extrabold text-white">
                  {i + 1}
                </span>
                <QuestionVisual type={q.visual} />
                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <p className="text-base font-bold text-slate-700">{q.prompt}</p>
                  <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                    {q.choices.map((choice) => {
                      const active = selected === choice;
                      const correctChoice = q.answer === choice;
                      const isFraction = /^\d+\/\d+$/.test(choice);
                      return (
                        <button
                          key={choice}
                          onClick={() => setAnswers((cur) => ({ ...cur, [q.id]: choice }))}
                          className={cn(
                            "rounded-xl border-2 px-4 py-2.5 text-base font-extrabold transition",
                            !active && "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50",
                            active && !isCorrect && "border-rose-300 bg-rose-50 text-rose-500",
                            active && isCorrect && "border-emerald-400 bg-emerald-50 text-emerald-600",
                            selected && correctChoice && !active && "border-emerald-300 bg-emerald-50/60 text-emerald-600"
                          )}
                        >
                          {isFraction ? (
                            <FractionStack top={choice.split("/")[0]} bottom={choice.split("/")[1]} />
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
                        "inline-block rounded-lg px-3 py-1.5 text-sm font-bold",
                        isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-500"
                      )}
                    >
                      {isCorrect ? "ถูกต้อง!" : "ลองดูใหม่อีกครั้ง"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

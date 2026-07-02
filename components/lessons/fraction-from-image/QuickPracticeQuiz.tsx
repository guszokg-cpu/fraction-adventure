"use client";

import { useState } from "react";
import { PencilLine } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import { UnequalCircle } from "@/components/lessons/shared/UnequalShapes";
import { cn } from "@/lib/cn";

type VisualKind = "equalCircle" | "equalBar" | "unequalCircle";

type Question = {
  id: string;
  prompt: string;
  visual: VisualKind;
  choices: string[];
  answer: string;
  correctFeedback: string;
};

const QUESTIONS: Question[] = [
  {
    id: "q1",
    prompt: "ภาพนี้คือเศษส่วนใด?",
    visual: "equalCircle",
    choices: ["1/4", "2/4", "3/4", "4/4"],
    answer: "3/4",
    correctFeedback: "ถูกต้อง! เก่งมากเลย",
  },
  {
    id: "q2",
    prompt: "ภาพนี้เขียนเป็นเศษส่วนใด?",
    visual: "equalBar",
    choices: ["2/5", "3/5", "4/5", "5/5"],
    answer: "2/5",
    correctFeedback: "ถูกต้อง! นับเก่งมาก",
  },
  {
    id: "q3",
    prompt: "ภาพนี้เขียนเป็นเศษส่วนได้ถูกต้องหรือไม่?",
    visual: "unequalCircle",
    choices: ["ได้", "ไม่ได้"],
    answer: "ไม่ได้",
    correctFeedback: "ถูกต้อง! เพราะแต่ละส่วนมีขนาดไม่เท่ากัน",
  },
];

function QuestionVisual({ type }: { type: VisualKind }) {
  if (type === "equalCircle") {
    return <FractionShape numerator={3} denominator={4} shape="circle" tone="pink" className="h-28 w-28 shrink-0" />;
  }
  if (type === "equalBar") {
    return <FractionShape numerator={2} denominator={5} shape="bar" tone="violet" className="h-16 w-48 shrink-0" />;
  }
  return <UnequalCircle className="h-28 w-28 shrink-0" />;
}

export function QuickPracticeQuiz() {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const answeredCount = Object.keys(answers).length;
  const correctCount = QUESTIONS.filter((q) => answers[q.id] === q.answer).length;

  return (
    <Card className="rounded-2xl">
      <h3 className="flex items-center gap-2 text-xl font-extrabold text-brand-900">
        <PencilLine size={22} className="text-violet-600" />
        ลองทำทันที 3 ข้อ
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
                            <FractionText numerator={choice.split("/")[0]} denominator={choice.split("/")[1]} className="text-base" />
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
                      {isCorrect ? q.correctFeedback : "ลองใหม่อีกครั้ง"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl bg-violet-50 px-5 py-3.5 text-center text-base font-extrabold text-violet-700">
        คุณทำถูก {correctCount} จาก {QUESTIONS.length} ข้อ
        {answeredCount < QUESTIONS.length && (
          <span className="ml-1 font-bold text-violet-400">(ตอบแล้ว {answeredCount}/{QUESTIONS.length})</span>
        )}
      </div>
    </Card>
  );
}

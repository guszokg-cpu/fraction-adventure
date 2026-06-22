"use client";

import { useState } from "react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { fractionIntroQuiz } from "@/data/lessonFractionIntro";
import { cn } from "@/lib/cn";

export function FractionMeaningQuiz() {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const score = fractionIntroQuiz.filter((question) => answers[question.id] === question.answer).length;
  const answeredCount = Object.keys(answers).length;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
            กิจกรรมสั้น ๆ
          </div>
          <h2 className="mt-2 text-xl font-extrabold text-brand-900">ลองตอบ: เศษส่วนหมายถึงอะไร?</h2>
          <p className="mt-1 text-sm font-bold text-slate-600">เลือกคำตอบจากภาพ แล้วดูเฉลยทันที</p>
        </div>
        <div className="rounded-xl bg-brand-50 px-4 py-3 text-center">
          <div className="text-xs font-bold text-slate-500">คะแนนทดลอง</div>
          <div className="text-2xl font-extrabold text-brand-900">
            {score}/{fractionIntroQuiz.length}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {fractionIntroQuiz.map((question, index) => {
          const selected = answers[question.id];
          const isCorrect = selected === question.answer;

          return (
            <section key={question.id} className="rounded-xl border border-brand-100 bg-white p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-extrabold text-white">
                  {index + 1}
                </span>
                <h3 className="text-sm font-extrabold text-brand-900">{question.prompt}</h3>
              </div>
              <FractionShape
                numerator={question.numerator}
                denominator={question.denominator}
                shape={question.shape}
                tone={question.tone}
                className="mx-auto my-4 h-28 w-40"
              />
              <div className="space-y-2">
                {question.choices.map((choice) => {
                  const active = selected === choice;
                  const correctChoice = question.answer === choice;

                  return (
                    <button
                      key={choice}
                      onClick={() => setAnswers((current) => ({ ...current, [question.id]: choice }))}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm font-extrabold transition",
                        !active && "border-slate-200 bg-white text-slate-700 hover:bg-brand-50",
                        active && !isCorrect && "border-rose-300 bg-rose-50 text-rose-600",
                        active && isCorrect && "border-emerald-300 bg-emerald-50 text-emerald-700",
                        selected && correctChoice && "border-emerald-300 bg-emerald-50 text-emerald-700"
                      )}
                    >
                      <span>{choice}</span>
                      {selected && correctChoice && <span>✓</span>}
                      {active && !isCorrect && <span>×</span>}
                    </button>
                  );
                })}
              </div>
              {selected && (
                <div
                  className={cn(
                    "mt-3 rounded-lg px-3 py-2 text-xs font-bold",
                    isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  )}
                >
                  {isCorrect ? question.explanation : `ลองดูอีกครั้ง: ${question.explanation}`}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg bg-sky-50 px-4 py-3 text-center text-sm font-bold text-sky-700">
        ตอบแล้ว {answeredCount}/{fractionIntroQuiz.length} ข้อ กิจกรรมนี้เป็น mock เท่านั้น ยังไม่บันทึกคะแนนจริง
      </div>
    </Card>
  );
}

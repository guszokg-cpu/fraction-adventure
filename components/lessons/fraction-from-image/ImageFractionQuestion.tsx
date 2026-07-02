"use client";

import { useState } from "react";
import { CheckCircle, Eye, PieChart, Paintbrush, RotateCcw, XCircle } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

const LABELS = ["ก", "ข", "ค", "ง"];
const CHOICES = ["1/4", "2/4", "3/4", "4/4"];
const CORRECT_ANSWER = "3/4";

export function ImageFractionQuestion() {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const isCorrect = selected === CORRECT_ANSWER;
  const revealed = checked || showAnswer;
  const score = checked && isCorrect ? 1 : 0;

  function chooseAnswer(choice: string) {
    if (revealed) return;
    setSelected(choice);
  }

  function checkAnswer() {
    if (!selected) return;
    setChecked(true);
  }

  function reset() {
    setSelected(null);
    setChecked(false);
    setShowAnswer(false);
  }

  return (
    <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">
            1
          </span>
          <div>
            <h2 className="text-2xl font-extrabold">ภาพนี้คือเศษส่วนอะไร?</h2>
            <p className="mt-0.5 text-sm font-bold text-sky-100">
              ดูภาพ แล้วนับจำนวนส่วนที่ระบายสี จากจำนวนส่วนทั้งหมด
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-extrabold">
            ⭐ คะแนนทดลอง {score}/1
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="space-y-6 p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* ภาพใหญ่ */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-sky-100 bg-sky-50/60 p-6">
            <FractionShape numerator={3} denominator={4} tone="pink" className="h-56 w-56" />
            <div className="mt-4 rounded-xl bg-white px-5 py-3 text-center text-base font-bold text-slate-600 shadow-sm">
              วงกลม 1 รูป แบ่งเป็น 4 ส่วนเท่า ๆ กัน และระบายสี 3 ส่วน
            </div>
          </div>

          {/* ตัวเลือก */}
          <div className="flex flex-col gap-3">
            {CHOICES.map((choice, i) => {
              const active = selected === choice;
              const showCorrect = revealed && choice === CORRECT_ANSWER;
              const showWrong = revealed && active && !isCorrect;

              return (
                <button
                  key={choice}
                  onClick={() => chooseAnswer(choice)}
                  disabled={revealed}
                  className={cn(
                    "flex h-16 items-center justify-between rounded-2xl border-2 px-5 text-2xl font-extrabold transition disabled:cursor-default",
                    !active && !showCorrect && "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50",
                    active && !revealed && "border-sky-400 bg-sky-50 text-sky-700",
                    showCorrect && "border-emerald-300 bg-emerald-50 text-emerald-700",
                    showWrong && "border-rose-200 bg-rose-50 text-rose-500"
                  )}
                >
                  <span>
                    {LABELS[i]}. {choice}
                  </span>
                  {showCorrect && (
                    <span className="flex items-center gap-1 text-sm font-extrabold text-emerald-600">
                      <CheckCircle size={20} />
                      ถูกต้อง!
                    </span>
                  )}
                  {showWrong && <XCircle size={22} className="text-rose-400" />}
                </button>
              );
            })}

            {checked && !isCorrect && (
              <div className="rounded-xl bg-rose-50 px-4 py-3 text-center text-sm font-bold text-rose-500">
                ลองนับส่วนที่ระบายอีกครั้ง
              </div>
            )}
          </div>
        </div>

        {/* วิธีคิด */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
          <div className="mb-4 flex items-center gap-2 text-lg font-extrabold text-brand-900">
            <span>💡</span> วิธีคิด
          </div>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <div className="flex flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm sm:flex-col sm:text-center">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-500 text-sm font-extrabold text-white">
                1
              </span>
              <PieChart className="text-sky-500" size={28} />
              <span className="text-base font-bold text-slate-700">ทั้งหมด 4 ส่วน</span>
            </div>
            <span className="hidden text-2xl font-extrabold text-slate-300 sm:block">→</span>
            <div className="flex flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm sm:flex-col sm:text-center">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pink-500 text-sm font-extrabold text-white">
                2
              </span>
              <Paintbrush className="text-pink-500" size={28} />
              <span className="text-base font-bold text-slate-700">ระบายสี 3 ส่วน</span>
            </div>
            <span className="hidden text-2xl font-extrabold text-slate-300 sm:block">→</span>
            <div className="flex flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm sm:flex-col sm:text-center">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-500 text-sm font-extrabold text-white">
                3
              </span>
              <FractionText numerator={3} denominator={4} className="text-2xl" toneClassName="text-violet-700" />
              <span className="text-base font-bold text-slate-700">เขียนเป็น 3/4</span>
            </div>
          </div>
        </div>

        {/* เฉลย */}
        {revealed && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
            <div className="flex items-center gap-2 text-lg font-extrabold text-emerald-700">
              <CheckCircle size={22} />
              เฉลย
            </div>
            <p className="mt-2 text-base font-bold leading-relaxed text-emerald-800">
              คำตอบคือ <span className="text-xl">3/4</span> เพราะรูปวงกลมแบ่งเป็น 4 ส่วนเท่า ๆ กัน และระบายสี 3 ส่วน
            </p>
            <p className="mt-1 text-base font-bold text-emerald-800">
              อ่านว่า <span className="text-lg">เศษสามส่วนสี่</span>
            </p>
          </div>
        )}

        {/* ปุ่ม */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={checkAnswer}
            disabled={!selected || revealed}
            className="flex h-12 items-center gap-2 rounded-xl bg-sky-600 px-6 text-base font-extrabold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <CheckCircle size={18} />
            ตรวจคำตอบ
          </button>
          <button
            onClick={() => setShowAnswer(true)}
            disabled={revealed}
            className="flex h-12 items-center gap-2 rounded-xl border-2 border-violet-200 bg-white px-6 text-base font-extrabold text-violet-600 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300"
          >
            <Eye size={18} />
            ดูเฉลย
          </button>
          <button
            onClick={reset}
            className="flex h-12 items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 text-base font-extrabold text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw size={18} />
            เริ่มใหม่
          </button>
        </div>
      </div>
    </Card>
  );
}

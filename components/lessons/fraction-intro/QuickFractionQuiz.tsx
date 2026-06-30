"use client";

import { useState } from "react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack } from "@/components/fractions/FractionStack";
import { UnequalCircle } from "@/components/lessons/shared/UnequalShapes";
import { cn } from "@/lib/cn";

const Q1_CHOICES = ["1/4", "1/2", "2/4", "3/4"];
const Q1_ANSWER = "2/4";
const Q2_ANSWER = "A";

export function QuickFractionQuiz() {
  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setQ2] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-extrabold text-brand-900">⚡ ลองตอบเร็ว!</h3>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-700">
          เลือกคำตอบที่ถูกต้อง
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* ── ข้อ 1 ── */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-indigo-500 text-xs text-white">1</span>
            ภาพนี้คือเศษส่วนใด?
          </div>
          <FractionShape numerator={2} denominator={4} shape="circle" tone="pink" className="mx-auto my-3 h-24 w-24" />
          <div className="flex flex-wrap justify-center gap-1.5">
            {Q1_CHOICES.map((choice) => {
              const active = q1 === choice;
              const correct = choice === Q1_ANSWER;
              return (
                <button
                  key={choice}
                  onClick={() => setQ1(choice)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-extrabold transition",
                    !active && "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50",
                    active && correct && "border-emerald-300 bg-emerald-50 text-emerald-700",
                    active && !correct && "border-rose-300 bg-rose-50 text-rose-600",
                    q1 && correct && "border-emerald-300 bg-emerald-50 text-emerald-700"
                  )}
                >
                  <FractionStack top={choice.split("/")[0]} bottom={choice.split("/")[1]} />
                </button>
              );
            })}
          </div>
          {q1 && (
            <p
              className={cn(
                "mt-2 rounded-lg px-2.5 py-1.5 text-center text-[11px] font-bold",
                q1 === Q1_ANSWER ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              )}
            >
              {q1 === Q1_ANSWER ? "✓ ถูกต้อง! ระบาย 2 ส่วน จาก 4 ส่วน" : "ลองใหม่อีกครั้งนะ"}
            </p>
          )}
        </div>

        {/* ── ข้อ 2 ── */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-indigo-500 text-xs text-white">2</span>
            ภาพใดแบ่งเท่ากัน?
          </div>
          <div className="my-3 flex items-end justify-center gap-6">
            <div className="text-center">
              <span className="text-xs font-extrabold text-slate-500">A</span>
              <FractionShape numerator={1} denominator={2} shape="circle" tone="emerald" className="mx-auto mt-1 h-20 w-20" />
            </div>
            <div className="text-center">
              <span className="text-xs font-extrabold text-slate-500">B</span>
              <UnequalCircle className="mx-auto mt-1 h-20 w-20" />
            </div>
          </div>
          <div className="flex justify-center gap-2">
            {["A", "B"].map((choice) => {
              const active = q2 === choice;
              const correct = choice === Q2_ANSWER;
              return (
                <button
                  key={choice}
                  onClick={() => setQ2(choice)}
                  className={cn(
                    "rounded-lg border px-4 py-1.5 text-xs font-extrabold transition",
                    !active && "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50",
                    active && correct && "border-emerald-300 bg-emerald-50 text-emerald-700",
                    active && !correct && "border-rose-300 bg-rose-50 text-rose-600",
                    q2 && correct && "border-emerald-300 bg-emerald-50 text-emerald-700"
                  )}
                >
                  ภาพ {choice}
                </button>
              );
            })}
          </div>
          {q2 && (
            <p
              className={cn(
                "mt-2 rounded-lg px-2.5 py-1.5 text-center text-[11px] font-bold",
                q2 === Q2_ANSWER ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              )}
            >
              {q2 === Q2_ANSWER ? "✓ ถูกต้อง! ภาพ A แบ่งเป็นส่วนเท่ากัน" : "ลองใหม่อีกครั้งนะ"}
            </p>
          )}
        </div>
      </div>

      <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-center text-[10px] font-bold text-sky-600">
        กิจกรรมนี้ยังไม่บันทึกคะแนนจริง
      </p>
    </section>
  );
}

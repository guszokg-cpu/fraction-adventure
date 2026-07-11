"use client";

import { useState } from "react";
import { ArrowRight, RotateCcw, Shuffle } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader } from "@/components/lessons/subtract/SubtractMath";
import { cn } from "@/lib/cn";
import { gcd } from "@/lib/fractionUtils";
import { randInt } from "@/lib/randomFraction";

type Problem = { w1: number; n1: number; w2: number; n2: number; den: number };

function makeProblem(borrow: boolean): Problem {
  const den = randInt(3, 6);
  const w2 = randInt(1, 2);
  const w1 = w2 + randInt(1, 2);
  if (borrow) {
    // บังคับให้เศษตัวตั้งน้อยกว่าเศษตัวลบ → ต้องยืม
    const n2 = randInt(2, den - 1);
    const n1 = randInt(1, n2 - 1);
    return { w1, n1, w2, n2, den };
  }
  const n2 = randInt(1, den - 2);
  const n1 = randInt(n2 + 1, den - 1);
  return { w1, n1, w2, n2, den };
}

function Mixed({ whole, num, den, className }: { whole: number; num: number; den: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {(whole > 0 || num === 0) && <span>{whole}</span>}
      {num > 0 && <FractionStack top={num} bottom={den} className="text-[0.75em]" />}
    </span>
  );
}

export function MixedSubtractCard() {
  const [problem, setProblem] = useState<Problem>({ w1: 2, n1: 1, w2: 1, n2: 3, den: 4 });
  const [stage, setStage] = useState(0);

  const { w1, n1, w2, n2, den } = problem;
  const needBorrow = n1 < n2;
  const effWhole = needBorrow ? w1 - 1 : w1;
  const effNum = needBorrow ? n1 + den : n1;
  const resWhole = effWhole - w2;
  const resNum = effNum - n2;
  const g = gcd(resNum || 1, den);
  const hasReduce = resNum > 0 && g > 1;
  // ลำดับขั้น: เช็คเศษ (0) → [ยืม (1)] → ลบ (2) → คำตอบ (3)
  const maxStage = needBorrow ? 3 : 2;

  function randomize() {
    setProblem(makeProblem(Math.random() < 0.5));
    setStage(0);
  }

  const subtractStage = needBorrow ? 2 : 1;
  const answerStage = maxStage;

  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={3} title="ลบจำนวนคละ + การยืม" />
      <div className="space-y-5 p-5 sm:p-6">
        {/* โจทย์ */}
        <div className="flex items-center justify-center gap-3 rounded-2xl bg-emerald-50 px-4 py-4 text-3xl font-extrabold sm:text-4xl">
          <Mixed whole={w1} num={n1} den={den} className="text-emerald-600" />
          <span className="text-slate-400">−</span>
          <Mixed whole={w2} num={n2} den={den} className="text-rose-500" />
          <span className="text-slate-400">=</span>
          {stage >= answerStage ? (
            <Mixed whole={resWhole} num={resNum} den={den} className="text-emerald-700" />
          ) : (
            <span className="text-slate-300">?</span>
          )}
        </div>

        {/* ขั้นที่ 1: เช็คเศษก่อน */}
        <div className="rounded-2xl border-2 border-emerald-200 bg-white p-4 sm:p-5">
          <p className="flex items-center gap-2 text-base font-extrabold text-emerald-700 sm:text-lg">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-sm text-white">1</span>
            เช็คก่อน: เศษพอลบไหม?
          </p>
          <div className="mt-3 flex items-center justify-center gap-3 text-2xl font-extrabold sm:text-3xl">
            <FractionStack top={n1} bottom={den} className="text-emerald-600" />
            <span className="text-slate-400">−</span>
            <FractionStack top={n2} bottom={den} className="text-rose-500" />
            <span className="text-slate-400">= ?</span>
          </div>
          <p className={cn("mt-2 text-center text-sm font-extrabold sm:text-base", needBorrow ? "text-rose-500" : "text-emerald-600")}>
            {needBorrow
              ? `${n1} น้อยกว่า ${n2} — ไม่พอลบ! ต้องไปยืมจากจำนวนเต็ม`
              : `${n1} มากกว่า ${n2} — พอลบ ลุยได้เลย`}
          </p>
        </div>

        {/* ขั้นยืม (เฉพาะกรณีไม่พอลบ) */}
        {needBorrow && stage >= 1 && (
          <div className="rounded-2xl border-2 border-amber-200 bg-white p-4 sm:p-5">
            <p className="flex items-center gap-2 text-base font-extrabold text-amber-600 sm:text-lg">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-500 text-sm text-white">2</span>
              ยืม 1 เต็มมาแตกเป็น {den} ชิ้น
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xl font-extrabold sm:text-2xl">
              <Mixed whole={w1} num={n1} den={den} className="text-emerald-600" />
              <span className="text-slate-400">→</span>
              <span className="text-amber-600">{effWhole}</span>
              <span className="text-slate-400">กับ</span>
              <FractionStack top={effNum} bottom={den} className="text-amber-600" />
              <span className="text-sm font-bold text-slate-400">
                ({n1} + {den} = {effNum})
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <FractionShape numerator={den} denominator={den} shape="circle" tone="accent" className="h-16 w-16" />
              <span className="text-xl font-extrabold text-slate-400">→</span>
              {Array.from({ length: den }).map((_, i) => (
                <FractionShape key={i} numerator={1} denominator={den} shape="circle" tone="accent" className="h-12 w-12" />
              ))}
            </div>
            <p className="mt-2 text-center text-sm font-bold text-slate-500">1 วงเต็มที่ยืมมา ถูกแตกเป็นชิ้นละ 1/{den} จำนวน {den} ชิ้น</p>
          </div>
        )}

        {/* ขั้นลบ */}
        {stage >= subtractStage && (
          <div className="rounded-2xl border-2 border-teal-200 bg-white p-4 sm:p-5">
            <p className="flex items-center gap-2 text-base font-extrabold text-teal-700 sm:text-lg">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-teal-500 text-sm text-white">
                {needBorrow ? 3 : 2}
              </span>
              ลบจำนวนเต็ม และลบเศษส่วน
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-teal-50/60 p-3 text-center">
                <p className="text-sm font-bold text-slate-500">จำนวนเต็ม</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-700 sm:text-3xl">
                  {effWhole} − {w2} = <span className="text-teal-700">{resWhole}</span>
                </p>
              </div>
              <div className="rounded-xl bg-teal-50/60 p-3 text-center">
                <p className="text-sm font-bold text-slate-500">เศษส่วน</p>
                <div className="mt-1 flex items-center justify-center gap-2 text-2xl font-extrabold sm:text-3xl">
                  <FractionStack top={effNum} bottom={den} className="text-slate-700" />
                  <span className="text-slate-400">−</span>
                  <FractionStack top={n2} bottom={den} className="text-slate-700" />
                  <span className="text-slate-400">=</span>
                  <FractionStack top={resNum} bottom={den} className="text-teal-700" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* คำตอบ */}
        {stage >= answerStage && (
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 px-4 py-4 text-white">
            <span className="text-base font-extrabold sm:text-lg">คำตอบ:</span>
            <Mixed whole={resWhole} num={resNum} den={den} className="text-4xl font-extrabold sm:text-5xl" />
            {hasReduce && (
              <>
                <span className="text-2xl font-extrabold sm:text-3xl">=</span>
                <Mixed whole={resWhole} num={resNum / g} den={den / g} className="text-4xl font-extrabold sm:text-5xl" />
                <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-extrabold sm:text-sm">ย่อแล้ว 🏆</span>
              </>
            )}
          </div>
        )}

        {/* ปุ่มควบคุม */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {stage < maxStage ? (
            <button
              onClick={() => setStage((s) => s + 1)}
              className="flex h-12 items-center gap-1.5 rounded-xl bg-emerald-600 px-6 text-base font-extrabold text-white shadow-md transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              ขั้นถัดไป <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={randomize}
              className="flex h-12 items-center gap-1.5 rounded-xl bg-emerald-600 px-6 text-base font-extrabold text-white shadow-md transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              <Shuffle size={17} /> โจทย์ใหม่
            </button>
          )}
          {stage > 0 && (
            <button
              onClick={() => setStage(0)}
              className="flex h-12 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
            >
              <RotateCcw size={15} /> ดูใหม่ตั้งแต่ต้น
            </button>
          )}
        </div>

        <p className="text-center text-sm font-bold text-slate-500 sm:text-base">
          สูตร: เช็คเศษก่อนเสมอ — ถ้าไม่พอลบ ยืม 1 จากจำนวนเต็มมาแตกเป็นชิ้น แล้วค่อยลบ
        </p>
      </div>
    </Card>
  );
}

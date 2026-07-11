"use client";

import { useState } from "react";
import { ArrowRight, RotateCcw, Shuffle, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionInput } from "@/components/ui/FractionInput";
import { FractionStack, SectionHeader } from "@/components/lessons/divide/DivideMath";
import { gcd } from "@/lib/fractionUtils";
import { randInt } from "@/lib/randomFraction";

type Problem = { na: number; da: number; nb: number; db: number };

function makeProblem(): Problem {
  const da = randInt(2, 6);
  const db = randInt(2, 6);
  const na = randInt(1, da - 1);
  const nb = randInt(1, db - 1);
  return { na, da, nb, db };
}

export function DivideStepsCard() {
  const [problem, setProblem] = useState<Problem>({ na: 1, da: 2, nb: 1, db: 4 });
  const [stage, setStage] = useState(0);

  const { na, da, nb, db } = problem;
  // คงตัวหน้า กลับตัวหลัง แล้วคูณ: na/da × db/nb
  const rawNum = na * db;
  const rawDen = da * nb;
  const g = gcd(rawNum, rawDen);
  const hasReduce = g > 1;
  const maxStage = hasReduce ? 3 : 2;

  const valid = nb >= 1 && db >= 1 && na >= 1 && da >= 1;

  function editFraction(part: "a" | "b", n: number, d: number) {
    setProblem((prev) => (part === "a" ? { ...prev, na: n, da: d } : { ...prev, nb: n, db: d }));
    setStage(0);
  }
  function randomize() {
    setProblem(makeProblem());
    setStage(0);
  }

  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={2} title="กลับแล้วคูณ" />
      <div className="space-y-5 p-5 sm:p-6">
        {/* โจทย์ */}
        <div className="flex items-center justify-center gap-4 rounded-2xl bg-violet-50 px-4 py-4">
          <FractionStack top={na} bottom={da} className="text-3xl text-pink-600 sm:text-4xl" />
          <span className="text-3xl font-extrabold text-slate-400 sm:text-4xl">÷</span>
          <FractionStack top={nb} bottom={db} className="text-3xl text-violet-600 sm:text-4xl" />
          <span className="text-3xl font-extrabold text-slate-400 sm:text-4xl">=</span>
          {stage >= 2 ? (
            <FractionStack top={rawNum} bottom={rawDen} className="text-3xl text-purple-700 sm:text-4xl" />
          ) : (
            <span className="text-3xl font-extrabold text-slate-300 sm:text-4xl">?</span>
          )}
        </div>

        {/* พิมพ์โจทย์เอง / สุ่ม */}
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 p-3 sm:p-4">
          <span className="text-sm font-extrabold text-slate-500">พิมพ์โจทย์เอง:</span>
          <FractionInput
            numerator={na}
            denominator={da}
            onChange={(n, d) => editFraction("a", n, d)}
            size="md"
            maxNumerator={99}
            maxDenominator={99}
            colorClass="border-pink-300 focus:border-pink-500 focus:ring-pink-100 bg-pink-500"
          />
          <span className="text-2xl font-extrabold text-slate-400">÷</span>
          <FractionInput
            numerator={nb}
            denominator={db}
            onChange={(n, d) => editFraction("b", n, d)}
            size="md"
            maxNumerator={99}
            maxDenominator={99}
            colorClass="border-violet-300 focus:border-violet-500 focus:ring-violet-100 bg-violet-500"
          />
          <button
            onClick={randomize}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
          >
            <Shuffle size={15} /> สุ่มโจทย์
          </button>
        </div>

        {valid && (
          <>
            {/* ขั้นที่ 1: คงหน้า กลับหลัง */}
            <div className="rounded-2xl border-2 border-violet-200 bg-white p-4 sm:p-5">
              <p className="flex items-center gap-2 text-base font-extrabold text-violet-700 sm:text-lg">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-violet-500 text-sm text-white">1</span>
                คงตัวหน้า กลับตัวหลัง (ส่วนกลับ)
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-2xl font-extrabold sm:text-3xl">
                <FractionStack top={na} bottom={da} className="text-pink-600" />
                <span className="text-slate-400">÷</span>
                <FractionStack top={nb} bottom={db} className="text-violet-600" />
                <span className="text-2xl text-slate-400">→</span>
                <FractionStack top={na} bottom={da} className="text-pink-600" />
                <span className="text-slate-400">×</span>
                <span className="inline-flex flex-col items-center gap-1 leading-none">
                  <FractionStack top={db} bottom={nb} className="text-emerald-600" />
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">กลับหัว–ท้าย</span>
                </span>
              </div>
            </div>

            {/* ขั้นที่ 2: คูณ */}
            {stage >= 1 && (
              <div className="rounded-2xl border-2 border-purple-200 bg-white p-4 sm:p-5">
                <p className="flex items-center gap-2 text-base font-extrabold text-purple-700 sm:text-lg">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-purple-500 text-sm text-white">2</span>
                  คูณ เศษ×เศษ ส่วน×ส่วน
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-2xl font-extrabold sm:text-3xl">
                  <FractionStack top={na} bottom={da} className="text-pink-600" />
                  <span className="text-slate-400">×</span>
                  <FractionStack top={db} bottom={nb} className="text-emerald-600" />
                  <span className="text-slate-400">=</span>
                  <span className="flex flex-col items-center leading-none text-purple-700">
                    <span>{na}×{db}</span>
                    <span className="my-1 h-0.5 w-full rounded-full bg-current" />
                    <span>{da}×{nb}</span>
                  </span>
                  <span className="text-slate-400">=</span>
                  <FractionStack top={rawNum} bottom={rawDen} className="text-purple-700" />
                </div>
              </div>
            )}

            {/* ขั้นย่อ */}
            {stage >= 2 && hasReduce && (
              <div className="rounded-2xl border-2 border-emerald-200 bg-white p-4 sm:p-5">
                <p className="flex items-center gap-2 text-base font-extrabold text-emerald-700 sm:text-lg">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-sm text-white">3</span>
                  ย่อให้เป็นอย่างต่ำ
                </p>
                <div className="mt-3 flex items-center justify-center gap-3 text-2xl font-extrabold sm:text-3xl">
                  <FractionStack top={rawNum} bottom={rawDen} className="text-purple-700" />
                  <span className="flex flex-col items-center gap-1.5 text-base text-emerald-600">
                    <span>÷{g}</span>
                    <span>÷{g}</span>
                  </span>
                  <span className="text-slate-400">=</span>
                  <FractionStack top={rawNum / g} bottom={rawDen / g} className="text-emerald-700" />
                  <Trophy size={26} className="text-yellow-500" />
                </div>
              </div>
            )}

            {stage >= maxStage && !hasReduce && (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-base font-extrabold text-emerald-700 sm:text-lg">
                <Trophy size={20} className="shrink-0 text-yellow-500" /> คำตอบเป็นเศษส่วนอย่างต่ำแล้ว ไม่ต้องย่อ
              </div>
            )}

            {/* กับดัก */}
            <div className="rounded-2xl border-2 border-rose-100 bg-rose-50/40 p-4 text-center">
              <p className="text-sm font-extrabold text-rose-600 sm:text-base">⚠️ กลับ &ldquo;ตัวหลัง&rdquo; เท่านั้น!</p>
              <p className="mt-1 text-sm font-bold text-rose-500">ห้ามกลับตัวหน้า และห้ามกลับทั้งสองตัว — คงตัวหน้าไว้เหมือนเดิม</p>
            </div>

            {/* ปุ่มควบคุม */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {stage < maxStage && (
                <button
                  onClick={() => setStage((s) => s + 1)}
                  className="flex h-12 items-center gap-1.5 rounded-xl bg-violet-600 px-6 text-base font-extrabold text-white shadow-md transition hover:bg-violet-700 active:scale-[0.98]"
                >
                  ขั้นถัดไป <ArrowRight size={18} />
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
          </>
        )}
      </div>
    </Card>
  );
}

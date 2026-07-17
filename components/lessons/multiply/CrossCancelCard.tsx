"use client";
import { Frac } from "@/components/lessons/Frac";

import { useState } from "react";
import { Check, Shuffle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader } from "@/components/lessons/multiply/MultiplyMath";
import { gcd } from "@/lib/fractionUtils";
import { randInt } from "@/lib/randomFraction";

type Problem = { a: number; p: number; b: number; q: number };

/** โจทย์ที่ตัดทอนไขว้ได้ และแต่ละเศษส่วนเป็นอย่างต่ำอยู่แล้ว */
const POOL: Problem[] = [
  { a: 2, p: 3, b: 9, q: 10 },
  { a: 3, p: 4, b: 8, q: 9 },
  { a: 5, p: 6, b: 3, q: 10 },
  { a: 4, p: 5, b: 15, q: 16 },
  { a: 2, p: 9, b: 3, q: 4 },
  { a: 3, p: 8, b: 4, q: 9 },
  { a: 5, p: 8, b: 4, q: 15 },
  { a: 7, p: 10, b: 5, q: 14 },
];

export function CrossCancelCard() {
  const [problem, setProblem] = useState<Problem>(POOL[0]);
  const { a, p, b, q } = problem;

  // ทางตรง: คูณก่อนแล้วย่อ
  const rawNum = a * b;
  const rawDen = p * q;
  const g = gcd(rawNum, rawDen);

  // ทางลัด: ตัดทอนไขว้ (เศษหน้า↔ส่วนหลัง, เศษหลัง↔ส่วนหน้า)
  const gAQ = gcd(a, q);
  const gBP = gcd(b, p);
  const a2 = a / gAQ;
  const q2 = q / gAQ;
  const b2 = b / gBP;
  const p2 = p / gBP;

  function randomize() {
    let next = problem;
    let tries = 0;
    while (next === problem && tries++ < 10) next = POOL[randInt(0, POOL.length - 1)];
    setProblem(next);
  }

  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={3} title="ตัดทอนก่อนคูณ ✂️" />
      <div className="space-y-5 p-5 sm:p-6">
        {/* โจทย์ */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-3 rounded-2xl bg-orange-50 px-5 py-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            <FractionStack top={a} bottom={p} className="text-sky-600" />
            <span className="text-slate-400">×</span>
            <FractionStack top={b} bottom={q} className="text-amber-600" />
          </div>
          <button
            onClick={randomize}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
          >
            <Shuffle size={15} /> โจทย์ใหม่
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* ทางตรง */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-5">
            <p className="text-center text-sm font-extrabold text-slate-500 sm:text-base">🐢 คูณก่อนแล้วย่อ (เลขใหญ่)</p>
            <div className="mt-3 flex flex-col items-center gap-2 text-xl font-extrabold sm:text-2xl">
              <div className="flex items-center gap-2">
                <FractionStack top={a} bottom={p} className="text-slate-600" />
                <span className="text-slate-400">×</span>
                <FractionStack top={b} bottom={q} className="text-slate-600" />
                <span className="text-slate-400">=</span>
                <FractionStack top={rawNum} bottom={rawDen} className="text-slate-700" />
              </div>
              <div className="flex items-center gap-2">
                <FractionStack top={rawNum} bottom={rawDen} className="text-slate-500" />
                <span className="flex flex-col items-center gap-1 text-sm text-emerald-600">
                  <span>÷{g}</span>
                  <span>÷{g}</span>
                </span>
                <span className="text-slate-400">=</span>
                <FractionStack top={rawNum / g} bottom={rawDen / g} className="text-emerald-700" />
              </div>
            </div>
            <p className="mt-2 flex flex-wrap items-center justify-center gap-1 text-center text-xs font-bold text-slate-400">
              ต้องคูณเลขใหญ่ <Frac n={rawNum} d={rawDen} /> แล้วค่อยหาตัวย่อ
            </p>
          </div>

          {/* ทางลัด */}
          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 p-4 sm:p-5">
            <p className="text-center text-sm font-extrabold text-emerald-700 sm:text-base">⚡ ตัดทอนก่อนคูณ (เลขเล็ก)</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              {gAQ > 1 && (
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-extrabold text-sky-700">
                  ตัด {a} ↔ {q} ด้วย {gAQ}
                </span>
              )}
              {gBP > 1 && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-700">
                  ตัด {b} ↔ {p} ด้วย {gBP}
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xl font-extrabold sm:text-2xl">
              <FractionStack top={a2} bottom={p2} className="text-sky-600" />
              <span className="text-slate-400">×</span>
              <FractionStack top={b2} bottom={q2} className="text-amber-600" />
              <span className="text-slate-400">=</span>
              <FractionStack top={a2 * b2} bottom={p2 * q2} className="text-emerald-700" />
            </div>
            <p className="mt-2 text-center text-xs font-bold text-emerald-500">คูณเลขเล็ก ได้อย่างต่ำเลย ไม่ต้องย่อทีหลัง</p>
          </div>
        </div>

        {/* สรุป */}
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl bg-teal-50 px-4 py-3 text-center text-sm font-bold text-teal-700 sm:text-base">
          <Check size={18} className="shrink-0 text-teal-600" />
          ได้คำตอบเดียวกัน
          <FractionStack top={rawNum / g} bottom={rawDen / g} className="mx-1 inline-flex text-base text-teal-700" />
          แต่ทางลัดคิดเลขน้อยกว่า
        </div>
      </div>
    </Card>
  );
}

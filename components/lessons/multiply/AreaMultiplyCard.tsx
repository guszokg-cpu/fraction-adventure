"use client";

import { useState } from "react";
import { Shuffle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader } from "@/components/lessons/multiply/MultiplyMath";
import { cn } from "@/lib/cn";
import { simplifyFraction } from "@/lib/fractionUtils";
import { randInt } from "@/lib/randomFraction";

function StepBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl font-extrabold text-orange-600 transition hover:bg-orange-100 active:scale-95"
    >
      {children}
    </button>
  );
}

export function AreaMultiplyCard() {
  // เศษส่วนแรก a/p คุมแนวนอน (แถว), เศษส่วนสอง b/q คุมแนวตั้ง (คอลัมน์)
  const [p, setP] = useState(3);
  const [a, setA] = useState(2);
  const [q, setQ] = useState(4);
  const [b, setB] = useState(3);

  const rawNum = a * b;
  const rawDen = p * q;
  const reduced = simplifyFraction(rawNum, rawDen);
  const canReduce = reduced.numerator !== rawNum || reduced.denominator !== rawDen;

  function setDenA(v: number) {
    const np = Math.max(2, Math.min(6, v));
    setP(np);
    setA((x) => Math.max(1, Math.min(np - 1, x)));
  }
  function setDenB(v: number) {
    const nq = Math.max(2, Math.min(6, v));
    setQ(nq);
    setB((x) => Math.max(1, Math.min(nq - 1, x)));
  }
  function randomize() {
    const np = randInt(2, 5);
    const nq = randInt(2, 5);
    setP(np);
    setQ(nq);
    setA(randInt(1, np - 1));
    setB(randInt(1, nq - 1));
  }

  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={1} title="โมเดลพื้นที่: คูณคือพื้นที่ซ้อน 🟪" />
      <div className="space-y-5 p-5 sm:p-6">
        {/* ตั้งค่า */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-sky-600">เศษแรก</span>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <StepBtn onClick={() => setA((x) => Math.max(1, x - 1))}>−</StepBtn>
                <span className="w-7 text-center text-2xl font-extrabold text-sky-600">{a}</span>
                <StepBtn onClick={() => setA((x) => Math.min(p - 1, x + 1))}>+</StepBtn>
              </div>
              <div className="h-0.5 w-full rounded bg-sky-300" />
              <div className="flex items-center gap-1.5">
                <StepBtn onClick={() => setDenA(p - 1)}>−</StepBtn>
                <span className="w-7 text-center text-2xl font-extrabold text-sky-600">{p}</span>
                <StepBtn onClick={() => setDenA(p + 1)}>+</StepBtn>
              </div>
            </div>
          </div>

          <span className="text-3xl font-extrabold text-slate-400">×</span>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-amber-600">เศษสอง</span>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <StepBtn onClick={() => setB((x) => Math.max(1, x - 1))}>−</StepBtn>
                <span className="w-7 text-center text-2xl font-extrabold text-amber-600">{b}</span>
                <StepBtn onClick={() => setB((x) => Math.min(q - 1, x + 1))}>+</StepBtn>
              </div>
              <div className="h-0.5 w-full rounded bg-amber-300" />
              <div className="flex items-center gap-1.5">
                <StepBtn onClick={() => setDenB(q - 1)}>−</StepBtn>
                <span className="w-7 text-center text-2xl font-extrabold text-amber-600">{q}</span>
                <StepBtn onClick={() => setDenB(q + 1)}>+</StepBtn>
              </div>
            </div>
          </div>

          <button
            onClick={randomize}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
          >
            <Shuffle size={15} /> สุ่มโจทย์
          </button>
        </div>

        {/* สมการ */}
        <div className="flex items-center justify-center gap-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
          <FractionStack top={a} bottom={p} className="text-sky-600" />
          <span className="text-slate-400">×</span>
          <FractionStack top={b} bottom={q} className="text-amber-600" />
          <span className="text-slate-400">=</span>
          <FractionStack top={rawNum} bottom={rawDen} className="text-violet-700" />
        </div>

        {/* ตารางพื้นที่ */}
        <div className="mx-auto w-full max-w-[22rem]">
          <div
            className="grid overflow-hidden rounded-xl border-2 border-orange-700"
            style={{ gridTemplateColumns: `repeat(${q}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: p * q }, (_, i) => {
              const row = Math.floor(i / q);
              const col = i % q;
              const inRowBand = row < a; // เศษแรก (แนวนอน) สีฟ้า
              const inColBand = col < b; // เศษสอง (แนวตั้ง) สีส้ม
              const overlap = inRowBand && inColBand;
              return (
                <div
                  key={i}
                  className={cn(
                    "aspect-square border border-orange-900/30 bg-white",
                    inRowBand && "bg-sky-200",
                    inColBand && "bg-amber-200",
                    overlap && "bg-violet-400"
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* คำอธิบาย */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-extrabold sm:text-sm">
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-sky-700">
            <span className="h-3 w-3 rounded bg-sky-200 ring-1 ring-sky-400" /> เศษแรก {a} แถว
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-700">
            <span className="h-3 w-3 rounded bg-amber-200 ring-1 ring-amber-400" /> เศษสอง {b} คอลัมน์
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-violet-700">
            <span className="h-3 w-3 rounded bg-violet-400" /> ซ้อนกัน = คำตอบ
          </span>
        </div>

        <div className="rounded-2xl bg-orange-50 px-4 py-4 text-center">
          <p className="text-base font-bold text-slate-600 sm:text-lg">
            ช่องม่วง <span className="text-xl font-extrabold text-violet-700">{rawNum}</span> ช่อง จากทั้งหมด{" "}
            <span className="text-xl font-extrabold text-slate-700">{rawDen}</span> ช่อง
          </p>
          <div className="mt-2 flex items-center justify-center gap-3 text-2xl font-extrabold sm:text-3xl">
            <span className="text-slate-500">คำตอบ:</span>
            <FractionStack top={rawNum} bottom={rawDen} className="text-violet-700" />
            {canReduce && (
              <>
                <span className="text-slate-400">=</span>
                <FractionStack top={reduced.numerator} bottom={reduced.denominator} className="text-emerald-700" />
              </>
            )}
          </div>
        </div>

        <p className="text-center text-sm font-bold text-slate-600 sm:text-base">
          นับช่องที่ซ้อนกัน = <span className="text-sky-600">เศษ × เศษ</span> ({a}×{b}={rawNum}) จากช่องทั้งหมด ={" "}
          <span className="text-amber-600">ส่วน × ส่วน</span> ({p}×{q}={rawDen})
        </p>
      </div>
    </Card>
  );
}

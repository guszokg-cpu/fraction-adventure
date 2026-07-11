"use client";

import { useState } from "react";
import { Shuffle } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader, TwoToneBar } from "@/components/lessons/add/FractionMath";
import { randInt } from "@/lib/randomFraction";

function StepBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-xl font-extrabold text-sky-600 transition hover:bg-sky-100 active:scale-95"
    >
      {children}
    </button>
  );
}

export function SameDenAddCard() {
  const [den, setDen] = useState(5);
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);

  function setDenClamped(d: number) {
    const nd = Math.max(3, Math.min(10, d));
    setDen(nd);
    setA((x) => Math.min(x, nd - 1));
    setB((y) => Math.max(1, Math.min(y, nd - 1)));
  }

  // บังคับ a + b ≤ den เสมอ (ผลบวกไม่เกิน 1 เต็ม — เศษเกินไปเรียนต่อขั้นจำนวนคละ)
  const safeA = Math.min(a, den - 1);
  const safeB = Math.min(b, den - safeA);

  function randomize() {
    const d = randInt(4, 10);
    const na = randInt(1, d - 2);
    const nb = randInt(1, d - na);
    setDen(d);
    setA(na);
    setB(nb);
  }

  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={1} title="ตัวส่วนเท่ากัน: บวกได้เลย" />
      <div className="space-y-5 p-5 sm:p-6">
        {/* ตั้งโจทย์ */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">เศษตัวแรก</span>
            <StepBtn onClick={() => setA((x) => Math.max(1, x - 1))}>−</StepBtn>
            <span className="w-9 text-center text-3xl font-extrabold text-sky-600">{safeA}</span>
            <StepBtn onClick={() => setA((x) => Math.min(den - safeB, x + 1))}>+</StepBtn>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">เศษตัวสอง</span>
            <StepBtn onClick={() => setB((y) => Math.max(1, y - 1))}>−</StepBtn>
            <span className="w-9 text-center text-3xl font-extrabold text-violet-600">{safeB}</span>
            <StepBtn onClick={() => setB((y) => Math.min(den - safeA, y + 1))}>+</StepBtn>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">ตัวส่วน</span>
            <StepBtn onClick={() => setDenClamped(den - 1)}>−</StepBtn>
            <span className="w-9 text-center text-3xl font-extrabold text-blue-700">{den}</span>
            <StepBtn onClick={() => setDenClamped(den + 1)}>+</StepBtn>
          </div>
          <button
            onClick={randomize}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
          >
            <Shuffle size={15} /> สุ่มโจทย์
          </button>
        </div>

        {/* สมการ */}
        <div className="flex items-center justify-center gap-4 rounded-2xl bg-blue-50 px-4 py-4">
          <FractionStack top={safeA} bottom={den} className="text-3xl text-sky-600 sm:text-4xl" />
          <span className="text-3xl font-extrabold text-slate-400 sm:text-4xl">+</span>
          <FractionStack top={safeB} bottom={den} className="text-3xl text-violet-600 sm:text-4xl" />
          <span className="text-3xl font-extrabold text-slate-400 sm:text-4xl">=</span>
          <FractionStack top={safeA + safeB} bottom={den} className="text-3xl text-blue-700 sm:text-4xl" />
        </div>

        {/* บาร์สามแถว ยาวเท่ากันเสมอ */}
        <div className="space-y-3">
          <div className="grid grid-cols-[3.5rem_1fr_4.5rem] items-center gap-3">
            <span className="text-center text-sm font-extrabold text-slate-500">ตัวแรก</span>
            <FractionShape numerator={safeA} denominator={den} shape="bar" tone="sky" className="h-11 w-full sm:h-12" />
            <FractionStack top={safeA} bottom={den} className="justify-self-center text-xl text-sky-600 sm:text-2xl" />
          </div>
          <div className="grid grid-cols-[3.5rem_1fr_4.5rem] items-center gap-3">
            <span className="text-center text-sm font-extrabold text-slate-500">ตัวสอง</span>
            <FractionShape numerator={safeB} denominator={den} shape="bar" tone="violet" className="h-11 w-full sm:h-12" />
            <FractionStack top={safeB} bottom={den} className="justify-self-center text-xl text-violet-600 sm:text-2xl" />
          </div>
          <div className="grid grid-cols-[3.5rem_1fr_4.5rem] items-center gap-3">
            <span className="text-center text-sm font-extrabold text-blue-700">รวม</span>
            <TwoToneBar a={safeA} b={safeB} denominator={den} className="h-11 w-full sm:h-12" />
            <FractionStack top={safeA + safeB} bottom={den} className="justify-self-center text-xl text-blue-700 sm:text-2xl" />
          </div>
        </div>

        <p className="text-center text-sm font-bold text-slate-600 sm:text-base">
          ชิ้นขนาดเท่ากันอยู่แล้ว เทมารวมในแท่งเดียวได้เลย — <span className="text-blue-700">บวกเฉพาะตัวเศษ ตัวส่วนคงเดิม</span>
        </p>

        {/* กับดัก */}
        <div className="rounded-2xl border-2 border-rose-100 bg-rose-50/40 p-4">
          <p className="text-center text-sm font-extrabold text-rose-600 sm:text-base">⚠️ ระวังกับดัก: ห้ามบวกตัวส่วน!</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            <span className="flex items-center gap-2 text-lg font-extrabold sm:text-xl">
              ❌ <FractionStack top={safeA} bottom={den} className="text-lg text-rose-600 sm:text-xl" /> +{" "}
              <FractionStack top={safeB} bottom={den} className="text-lg text-rose-600 sm:text-xl" /> ≠{" "}
              <FractionStack top={safeA + safeB} bottom={den * 2} className="text-lg text-rose-600 sm:text-xl" />
            </span>
            <span className="text-sm font-bold text-rose-500">ตัวส่วนคือขนาดของชิ้น ไม่ได้ถูกบวก!</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

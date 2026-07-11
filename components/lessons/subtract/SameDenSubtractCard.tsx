"use client";

import { useState } from "react";
import { Shuffle } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { CrossOutBar, FractionStack, SectionHeader } from "@/components/lessons/subtract/SubtractMath";
import { randInt } from "@/lib/randomFraction";

function StepBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl font-extrabold text-emerald-600 transition hover:bg-emerald-100 active:scale-95"
    >
      {children}
    </button>
  );
}

export function SameDenSubtractCard() {
  const [den, setDen] = useState(5);
  const [a, setA] = useState(4);
  const [b, setB] = useState(2);

  // บังคับ 1 ≤ b < a ≤ den เสมอ
  const safeA = Math.min(a, den);
  const safeB = Math.min(b, safeA - 1);
  const diff = safeA - safeB;

  function setDenClamped(d: number) {
    const nd = Math.max(3, Math.min(10, d));
    setDen(nd);
    setA((x) => Math.min(x, nd));
    setB((y) => Math.max(1, Math.min(y, nd - 1)));
  }

  function randomize() {
    const d = randInt(4, 10);
    const na = randInt(2, d);
    const nb = randInt(1, na - 1);
    setDen(d);
    setA(na);
    setB(nb);
  }

  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={1} title="ตัวส่วนเท่ากัน: ลบได้เลย" />
      <div className="space-y-5 p-5 sm:p-6">
        {/* ตั้งโจทย์ */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">มีอยู่</span>
            <StepBtn onClick={() => setA((x) => Math.max(safeB + 1, x - 1))}>−</StepBtn>
            <span className="w-9 text-center text-3xl font-extrabold text-emerald-600">{safeA}</span>
            <StepBtn onClick={() => setA((x) => Math.min(den, x + 1))}>+</StepBtn>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">เอาออก</span>
            <StepBtn onClick={() => setB((y) => Math.max(1, y - 1))}>−</StepBtn>
            <span className="w-9 text-center text-3xl font-extrabold text-rose-500">{safeB}</span>
            <StepBtn onClick={() => setB((y) => Math.min(safeA - 1, y + 1))}>+</StepBtn>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">ตัวส่วน</span>
            <StepBtn onClick={() => setDenClamped(den - 1)}>−</StepBtn>
            <span className="w-9 text-center text-3xl font-extrabold text-emerald-700">{den}</span>
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
        <div className="flex items-center justify-center gap-4 rounded-2xl bg-emerald-50 px-4 py-4">
          <FractionStack top={safeA} bottom={den} className="text-3xl text-emerald-600 sm:text-4xl" />
          <span className="text-3xl font-extrabold text-slate-400 sm:text-4xl">−</span>
          <FractionStack top={safeB} bottom={den} className="text-3xl text-rose-500 sm:text-4xl" />
          <span className="text-3xl font-extrabold text-slate-400 sm:text-4xl">=</span>
          <FractionStack top={diff} bottom={den} className="text-3xl text-emerald-700 sm:text-4xl" />
        </div>

        {/* บาร์สามแถว ยาวเท่ากันเสมอ */}
        <div className="space-y-3">
          <div className="grid grid-cols-[3.5rem_1fr_4.5rem] items-center gap-3">
            <span className="text-center text-sm font-extrabold text-slate-500">มีอยู่</span>
            <FractionShape numerator={safeA} denominator={den} shape="bar" tone="emerald" className="h-11 w-full sm:h-12" />
            <FractionStack top={safeA} bottom={den} className="justify-self-center text-xl text-emerald-600 sm:text-2xl" />
          </div>
          <div className="grid grid-cols-[3.5rem_1fr_4.5rem] items-center gap-3">
            <span className="text-center text-sm font-extrabold text-rose-500">เอาออก</span>
            <CrossOutBar filled={safeA} removed={safeB} denominator={den} />
            <FractionStack top={safeB} bottom={den} className="justify-self-center text-xl text-rose-500 sm:text-2xl" />
          </div>
          <div className="grid grid-cols-[3.5rem_1fr_4.5rem] items-center gap-3">
            <span className="text-center text-sm font-extrabold text-emerald-700">เหลือ</span>
            <FractionShape numerator={diff} denominator={den} shape="bar" tone="emerald" className="h-11 w-full sm:h-12" />
            <FractionStack top={diff} bottom={den} className="justify-self-center text-xl text-emerald-700 sm:text-2xl" />
          </div>
        </div>

        <p className="text-center text-sm font-bold text-slate-600 sm:text-base">
          ชิ้นขนาดเท่ากัน หยิบออกแล้วนับที่เหลือ — <span className="text-emerald-700">ลบเฉพาะตัวเศษ ตัวส่วนคงเดิม</span>
        </p>

        {/* กับดัก */}
        <div className="rounded-2xl border-2 border-rose-100 bg-rose-50/40 p-4">
          <p className="text-center text-sm font-extrabold text-rose-600 sm:text-base">⚠️ ระวังกับดัก: ห้ามลบตัวส่วน!</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            <span className="flex items-center gap-2 text-lg font-extrabold sm:text-xl">
              ❌ <FractionStack top={safeA} bottom={den} className="text-lg text-rose-600 sm:text-xl" /> −{" "}
              <FractionStack top={safeB} bottom={den} className="text-lg text-rose-600 sm:text-xl" /> ≠{" "}
              <FractionStack top={diff} bottom={0} className="text-lg text-rose-600 sm:text-xl" />
            </span>
            <span className="text-sm font-bold text-rose-500">ถ้าลบตัวส่วน จะได้ส่วนเป็น 0 ซึ่งไม่มีความหมายเลย!</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

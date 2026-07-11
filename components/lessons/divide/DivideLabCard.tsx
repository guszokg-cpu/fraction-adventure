"use client";

import { useState } from "react";
import { Shuffle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader } from "@/components/lessons/divide/DivideMath";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

const PIECE_MULTIPLIERS = [2, 3, 4];

function StepBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl font-extrabold text-violet-600 transition hover:bg-violet-100 active:scale-95"
    >
      {children}
    </button>
  );
}

export function DivideLabCard() {
  // ตัวตั้ง a/p ÷ ชิ้นละ 1/e (โดย e = p × k เพื่อให้แบ่งลงตัวเสมอ)
  const [p, setP] = useState(2);
  const [a, setA] = useState(1);
  const [k, setK] = useState(2);

  const e = p * k;
  const filled = a * k; // จำนวนชิ้น 1/e ที่อยู่ใน a/p = คำตอบ
  const answer = filled;

  function setDen(v: number) {
    const np = Math.max(2, Math.min(6, v));
    setP(np);
    setA((x) => Math.max(1, Math.min(np - 1, x)));
  }
  function randomize() {
    const np = randInt(2, 5);
    setP(np);
    setA(randInt(1, np - 1));
    setK(PIECE_MULTIPLIERS[randInt(0, PIECE_MULTIPLIERS.length - 1)]);
  }

  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={1} title="ห้องทดลอง: หารคือ &ldquo;มีกี่ชิ้น&rdquo; 📏" />
      <div className="space-y-5 p-5 sm:p-6">
        {/* ตั้งค่า */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-pink-600">ก้อนใหญ่</span>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <StepBtn onClick={() => setA((x) => Math.max(1, x - 1))}>−</StepBtn>
                <span className="w-7 text-center text-2xl font-extrabold text-pink-600">{a}</span>
                <StepBtn onClick={() => setA((x) => Math.min(p - 1, x + 1))}>+</StepBtn>
              </div>
              <div className="h-0.5 w-full rounded bg-pink-300" />
              <div className="flex items-center gap-1.5">
                <StepBtn onClick={() => setDen(p - 1)}>−</StepBtn>
                <span className="w-7 text-center text-2xl font-extrabold text-pink-600">{p}</span>
                <StepBtn onClick={() => setDen(p + 1)}>+</StepBtn>
              </div>
            </div>
          </div>

          <span className="text-2xl font-extrabold text-slate-400">แบ่งเป็นชิ้นละ</span>

          <div className="flex items-center gap-1.5">
            {PIECE_MULTIPLIERS.map((m) => (
              <button
                key={m}
                onClick={() => setK(m)}
                className={cn(
                  "flex flex-col items-center rounded-xl px-3 py-1.5 text-lg font-extrabold leading-none transition",
                  k === m ? "bg-violet-600 text-white shadow-md" : "border border-slate-200 bg-white text-slate-500 hover:bg-violet-50"
                )}
              >
                <span>1</span>
                <span className="my-0.5 h-0.5 w-5 rounded-full bg-current" />
                <span>{p * m}</span>
              </button>
            ))}
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
          <FractionStack top={a} bottom={p} className="text-pink-600" />
          <span className="text-slate-400">÷</span>
          <FractionStack top={1} bottom={e} className="text-violet-600" />
          <span className="text-slate-400">=</span>
          <span className="text-violet-700">{answer}</span>
        </div>

        {/* แถบวัด — นับชิ้น 1/e ที่อยู่ใน a/p */}
        <div className="mx-auto w-full max-w-xl">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${e}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: e }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "grid h-12 place-items-center rounded border-2 text-xs font-extrabold sm:h-14",
                  i < filled ? "border-violet-500 bg-pink-200 text-violet-700" : "border-slate-200 bg-white text-transparent"
                )}
              >
                {i < filled ? i + 1 : ""}
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-sm font-bold text-slate-500">
            ก้อนสีชมพู = <FractionStack top={a} bottom={p} className="mx-1 inline-flex text-sm text-pink-600" /> ถูกแบ่งเป็นชิ้นละ{" "}
            <FractionStack top={1} bottom={e} className="mx-1 inline-flex text-sm text-violet-600" />
          </p>
        </div>

        {/* สรุป + เชื่อมสูตร */}
        <div className="rounded-2xl bg-violet-50 px-4 py-4 text-center">
          <p className="text-base font-bold text-slate-600 sm:text-lg">
            ใน <FractionStack top={a} bottom={p} className="mx-1 inline-flex text-lg text-pink-600" /> มีชิ้นละ{" "}
            <FractionStack top={1} bottom={e} className="mx-1 inline-flex text-lg text-violet-600" /> อยู่{" "}
            <span className="text-xl font-extrabold text-violet-700">{answer}</span> ชิ้น
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xl font-extrabold sm:text-2xl">
            <FractionStack top={a} bottom={p} className="text-pink-600" />
            <span className="text-slate-400">÷</span>
            <FractionStack top={1} bottom={e} className="text-violet-600" />
            <span className="text-slate-400">=</span>
            <FractionStack top={a} bottom={p} className="text-pink-600" />
            <span className="text-slate-400">×</span>
            <FractionStack top={e} bottom={1} className="text-emerald-600" />
            <span className="text-slate-400">=</span>
            <span className="text-emerald-700">{answer}</span>
          </div>
          <p className="mt-2 text-sm font-bold text-emerald-600">นับชิ้นได้เท่าไร = กลับตัวหลังแล้วคูณได้เท่านั้น!</p>
        </div>
      </div>
    </Card>
  );
}

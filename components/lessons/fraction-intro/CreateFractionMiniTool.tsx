"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack } from "@/components/fractions/FractionStack";
import { cn } from "@/lib/cn";
import { readThaiFraction } from "@/lib/thaiNumber";
import type { FractionShapeKind } from "@/types/lessonContent";

const DENOMINATORS = [2, 3, 4, 5, 6, 8, 10];
const SHAPES: { id: FractionShapeKind; label: string; icon: string }[] = [
  { id: "circle", label: "วงกลม", icon: "⏺" },
  { id: "bar", label: "แท่ง", icon: "▭" },
  { id: "grid", label: "ตาราง", icon: "▦" },
];

function describe(numerator: number, denominator: number): string {
  if (numerator === 0) return "ยังไม่ได้ระบายส่วนใด ลองเลือกจำนวนส่วนที่จะระบายดูสิ";
  if (numerator === denominator) return `ระบายครบทั้ง ${denominator} ส่วน รวมเป็น 1 หน่วยเต็มพอดี`;
  return `ระบาย ${numerator} ส่วน จากทั้งหมด ${denominator} ส่วนที่เท่ากัน`;
}

export function CreateFractionMiniTool() {
  const [denominator, setDenominator] = useState(4);
  const [numerator, setNumerator] = useState(3);
  const [shape, setShape] = useState<FractionShapeKind>("circle");

  function handleDenominator(next: number) {
    setDenominator(next);
    if (numerator > next) setNumerator(next);
  }

  function randomize() {
    const den = DENOMINATORS[Math.floor(Math.random() * DENOMINATORS.length)];
    const num = Math.floor(Math.random() * (den + 1));
    const sh = SHAPES[Math.floor(Math.random() * SHAPES.length)].id;
    setDenominator(den);
    setNumerator(num);
    setShape(sh);
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-extrabold text-brand-900">ลองสร้างเศษส่วนเอง</h3>
        <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-extrabold text-violet-700">
          Interactive
        </span>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_300px]">
        {/* ── ตัวควบคุม ── */}
        <div className="space-y-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              เลือกจำนวนส่วนทั้งหมด <span className="text-brand-500">(ตัวส่วน)</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DENOMINATORS.map((value) => (
                <button
                  key={value}
                  onClick={() => handleDenominator(value)}
                  className={cn(
                    "h-10 w-10 rounded-xl border text-sm font-extrabold transition",
                    value === denominator
                      ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50"
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              เลือกจำนวนส่วนที่ระบาย <span className="text-rose-500">(ตัวเศษ)</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Array.from({ length: denominator + 1 }, (_, i) => i).map((value) => (
                <button
                  key={value}
                  onClick={() => setNumerator(value)}
                  className={cn(
                    "h-10 w-10 rounded-xl border text-sm font-extrabold transition",
                    value === numerator
                      ? "border-rose-500 bg-rose-500 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:bg-rose-50"
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">เลือกรูปแบบภาพ</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SHAPES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setShape(item.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-extrabold transition",
                    item.id === shape
                      ? "border-violet-300 bg-violet-50 text-violet-700"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-violet-50/40"
                  )}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── ผลลัพธ์ ── */}
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/40 p-5">
          <FractionShape numerator={numerator} denominator={denominator} shape={shape} tone="violet" className="h-32 w-32" />
          <div className="flex flex-col items-center leading-none">
            <span className="text-4xl font-extrabold text-rose-500">{numerator}</span>
            <span className="my-1 h-1 w-12 rounded-full bg-amber-400" />
            <span className="text-4xl font-extrabold text-brand-600">{denominator}</span>
          </div>
          {numerator > 0 && (
            <div className="rounded-full bg-violet-100 px-3 py-0.5 text-xs font-extrabold text-violet-700">
              {readThaiFraction(numerator, denominator)}
            </div>
          )}
          <p className="text-center text-xs font-bold leading-relaxed text-slate-600">
            {describe(numerator, denominator)}
          </p>
          <button
            onClick={randomize}
            className="mt-1 flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3.5 py-2 text-xs font-extrabold text-violet-600 transition hover:bg-violet-50"
          >
            <RefreshCw size={13} />
            สุ่มตัวอย่างใหม่
          </button>
        </div>
      </div>
    </section>
  );
}

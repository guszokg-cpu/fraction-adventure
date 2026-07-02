"use client";

import { useState } from "react";
import { Shuffle, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack } from "@/components/fractions/FractionStack";
import { cn } from "@/lib/cn";
import { readThaiFraction } from "@/lib/thaiNumber";
import type { FractionShapeKind } from "@/types/lessonContent";

const DENOMINATORS = [2, 3, 4, 6, 8];
const SHAPES: { id: FractionShapeKind; label: string; icon: string }[] = [
  { id: "circle", label: "วงกลม", icon: "⏺" },
  { id: "bar", label: "แท่ง", icon: "▭" },
  { id: "grid", label: "ตาราง", icon: "▦" },
  { id: "flower", label: "แปลงดอกไม้", icon: "🌸" },
];

const DEFAULT_DENOMINATOR = 4;
const DEFAULT_NUMERATOR = 3;
const DEFAULT_SHAPE: FractionShapeKind = "circle";

function describe(n: number, d: number): string {
  if (n === 0) return "ยังไม่ได้ระบายส่วนใด — ลองเลือกจำนวนส่วนที่จะระบายดูสิ";
  if (n === d) return `ระบายครบทั้ง ${d} ส่วน รวมเป็น 1 หน่วยเต็มพอดี`;
  return `ระบาย ${n} ส่วน จากทั้งหมด ${d} ส่วนที่เท่ากัน`;
}

export function EqualPartsInteractiveTool() {
  const [denominator, setDenominator] = useState(DEFAULT_DENOMINATOR);
  const [numerator, setNumerator] = useState(DEFAULT_NUMERATOR);
  const [shape, setShape] = useState<FractionShapeKind>(DEFAULT_SHAPE);

  function handleDenominator(next: number) {
    setDenominator(next);
    if (numerator > next) setNumerator(next);
  }

  function randomize() {
    const d = DENOMINATORS[Math.floor(Math.random() * DENOMINATORS.length)];
    const n = Math.floor(Math.random() * (d + 1));
    const s = SHAPES[Math.floor(Math.random() * SHAPES.length)].id;
    setDenominator(d);
    setNumerator(n);
    setShape(s);
  }

  function reset() {
    setDenominator(DEFAULT_DENOMINATOR);
    setNumerator(DEFAULT_NUMERATOR);
    setShape(DEFAULT_SHAPE);
  }

  return (
    <Card className="rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-xl font-extrabold text-brand-900">
          <span>✏️</span> ลองแบ่งและระบายด้วยตัวเอง
        </h3>
        <div className="flex gap-2">
          <button
            onClick={randomize}
            className="flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3.5 py-2 text-sm font-extrabold text-violet-600 transition hover:bg-violet-50"
          >
            <Shuffle size={15} /> สุ่มตัวอย่าง
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw size={15} /> รีเซ็ต
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* ── ตัวควบคุม ── */}
        <div className="space-y-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              แบ่งเป็น <span className="text-brand-500">(ตัวส่วน)</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DENOMINATORS.map((v) => (
                <button
                  key={v}
                  onClick={() => handleDenominator(v)}
                  className={cn(
                    "h-11 w-11 rounded-xl border text-base font-extrabold transition",
                    v === denominator
                      ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              ระบาย <span className="text-rose-500">(ตัวเศษ)</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Array.from({ length: denominator + 1 }, (_, i) => i).map((v) => (
                <button
                  key={v}
                  onClick={() => setNumerator(v)}
                  className={cn(
                    "h-11 w-11 rounded-xl border text-base font-extrabold transition",
                    v === numerator
                      ? "border-rose-500 bg-rose-500 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:bg-rose-50"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">รูปแบบภาพ</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SHAPES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setShape(s.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-extrabold transition",
                    s.id === shape
                      ? "border-violet-300 bg-violet-50 text-violet-700"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-violet-50/40"
                  )}
                >
                  <span>{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── แสดงผลภาพใหญ่ ── */}
        <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-violet-100 bg-violet-50/30 p-6 sm:flex-row sm:gap-8">
          <FractionShape
            numerator={numerator}
            denominator={denominator}
            shape={shape}
            tone="violet"
            className="h-48 w-48 shrink-0"
          />
          <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
            <div className="text-6xl font-extrabold leading-none text-brand-700">
              <FractionStack top={numerator} bottom={denominator} />
            </div>
            {numerator > 0 && (
              <div className="rounded-full bg-violet-100 px-4 py-1.5 text-base font-extrabold text-violet-700">
                {readThaiFraction(numerator, denominator)}
              </div>
            )}
            <p className="max-w-xs text-base font-bold leading-relaxed text-slate-600">
              {describe(numerator, denominator)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

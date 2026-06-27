"use client";

import { useState } from "react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack } from "@/components/fractions/FractionStack";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { FractionShapeKind } from "@/types/lessonContent";

const OBJECTS: { shape: FractionShapeKind; label: string; emoji: string }[] = [
  { shape: "pizza", label: "พิซซา", emoji: "🍕" },
  { shape: "watermelon", label: "แตงโม", emoji: "🍉" },
  { shape: "glass", label: "แก้วน้ำ", emoji: "🥛" },
  { shape: "chocolate", label: "ช็อกโกแลต", emoji: "🍫" },
];

const DENOMINATORS = [2, 3, 4, 6, 8];

export function FractionWorldCard() {
  const [denominator, setDenominator] = useState(4);
  const [numerator, setNumerator] = useState(3);

  function chooseDen(next: number) {
    setDenominator(next);
    if (numerator > next) setNumerator(next);
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-400 px-4 py-2.5 text-white">
        <span className="text-xl">🌍</span>
        <h2 className="text-lg font-extrabold">เศษส่วนรอบตัวเรา</h2>
      </div>

      <div className="p-4">
        <p className="mb-4 text-center text-sm font-bold text-slate-600">
          เศษส่วนเดียวกันมองเป็นของรอบตัวได้หลายแบบ ลองปรับค่าแล้วดูทุกภาพเปลี่ยนพร้อมกัน
        </p>

        {/* ตัวควบคุม */}
        <div className="mx-auto max-w-xl space-y-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-slate-500">แบ่งเป็น</span>
            {DENOMINATORS.map((d) => (
              <button
                key={d}
                onClick={() => chooseDen(d)}
                className={cn(
                  "h-9 w-9 rounded-lg border text-sm font-extrabold transition",
                  d === denominator
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-orange-50",
                )}
              >
                {d}
              </button>
            ))}
            <span className="text-xs font-extrabold text-slate-500">ส่วน</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-slate-500">ระบาย</span>
            {Array.from({ length: denominator + 1 }, (_, i) => i).map((n) => (
              <button
                key={n}
                onClick={() => setNumerator(n)}
                className={cn(
                  "h-9 w-9 rounded-lg border text-sm font-extrabold transition",
                  n === numerator
                    ? "border-rose-500 bg-rose-500 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-rose-50",
                )}
              >
                {n}
              </button>
            ))}
            <span className="text-xs font-extrabold text-slate-500">ส่วน</span>
          </div>
        </div>

        {/* ภาพของจริง 4 แบบ */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {OBJECTS.map((obj) => (
            <div key={obj.shape} className="flex flex-col items-center rounded-xl border border-slate-100 bg-white p-3">
              <div className="grid h-24 w-24 place-items-center">
                <FractionShape numerator={numerator} denominator={denominator} shape={obj.shape} />
              </div>
              <div className="mt-2 text-sm font-extrabold text-slate-700">
                {obj.emoji} {obj.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 inline-flex w-full flex-wrap items-center justify-center gap-1 rounded-xl bg-rose-50 px-4 py-3 text-center text-sm font-extrabold text-rose-600">
          ทุกภาพคือ
          <FractionStack top={numerator} bottom={denominator} className="text-base" />
          เท่ากัน — ระบาย {numerator} ส่วน จากทั้งหมด {denominator} ส่วนที่เท่า ๆ กัน
        </div>
      </div>
    </Card>
  );
}

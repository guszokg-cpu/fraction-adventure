"use client";

import { Volume2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import type { FractionShapeKind } from "@/types/lessonContent";
import { getThaiFractionReading, splitIntoShapeNumerators } from "@/lib/fractionUtils";

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "th-TH";
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

const EXAMPLES: { total: number; denominator: number; shape: FractionShapeKind }[] = [
  { total: 5, denominator: 4, shape: "circle" },
  { total: 7, denominator: 3, shape: "pizza" },
  { total: 8, denominator: 5, shape: "bar" },
  { total: 6, denominator: 6, shape: "grid" },
];

export function ImproperFractionSection() {
  const reading = getThaiFractionReading(5, 4);
  const heroParts = splitIntoShapeNumerators(5, 4);

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden rounded-3xl border-amber-100 bg-gradient-to-br from-amber-50 to-white p-0">
        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-white">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">
            3
          </span>
          <div>
            <h2 className="text-2xl font-extrabold">เศษเกิน</h2>
            <p className="mt-0.5 text-sm font-bold text-amber-100">
              ตัวเศษมากกว่าหรือเท่ากับตัวส่วน มีค่ามากกว่าหรือเท่ากับ 1 หน่วย
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-2xl bg-amber-50 px-5 py-3 text-center text-base font-bold text-amber-700">
            เมื่อตัวเศษมากกว่าหรือเท่ากับตัวส่วน แสดงว่าเรามีของครบ 1 หน่วยแล้ว และอาจมีเหลือมากกว่านั้นอีก
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
            <div className="flex items-center gap-3">
              {heroParts.map((n, i) => (
                <FractionShape key={i} numerator={n} denominator={4} shape="circle" tone="accent" className="h-28 w-28 shrink-0" />
              ))}
            </div>
            <FractionText numerator={5} denominator={4} className="text-7xl" toneClassName="text-amber-700" />
            <button
              onClick={() => speak(reading)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-extrabold text-amber-600 transition hover:bg-amber-50"
            >
              <Volume2 size={13} /> อ่านว่า {reading}
            </button>
          </div>
        </div>
      </Card>

      {/* ตัวอย่างเศษเกินหลายรูปแบบ */}
      <div>
        <h3 className="mb-3 text-lg font-extrabold text-brand-900">ตัวอย่างเศษเกิน</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {EXAMPLES.map((ex) => {
            const parts = splitIntoShapeNumerators(ex.total, ex.denominator);
            return (
              <div key={`${ex.total}-${ex.denominator}-${ex.shape}`} className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-1.5">
                  {parts.map((n, i) => (
                    <FractionShape key={i} numerator={n} denominator={ex.denominator} shape={ex.shape} tone="accent" className="h-14 w-14" />
                  ))}
                </div>
                <FractionText numerator={ex.total} denominator={ex.denominator} className="text-xl" toneClassName="text-amber-700" />
              </div>
            );
          })}
        </div>
      </div>

      {/* สังเกตอะไรได้บ้าง */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-extrabold text-brand-900">สังเกตอะไรได้บ้าง</h3>
        <ul className="mt-3 space-y-2 text-sm font-bold text-slate-600">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-amber-500">✓</span> ตัวเศษมากกว่าหรือเท่ากับตัวส่วนเสมอ
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-amber-500">✓</span> มีค่ามากกว่าหรือเท่ากับ 1 หน่วยเสมอ
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-amber-500">✓</span> ถ้าวาดภาพ อาจต้องใช้มากกว่า 1 รูปจึงจะครบ
          </li>
        </ul>
      </div>

      {/* ข้อควรระวัง */}
      <div className="rounded-2xl bg-rose-50 p-5">
        <h3 className="flex items-center gap-2 text-base font-extrabold text-rose-600">⚠️ เข้าใจผิดบ่อย</h3>
        <p className="mt-2 text-sm font-bold text-rose-600">
          เศษเกินไม่ได้แปลว่าเขียนผิด แต่เป็นเศษส่วนที่มีค่ามากกว่าหรือเท่ากับ 1 หน่วยตามปกติ เช่น 4/4 (ครบ 1 หน่วยพอดี)
          และ 7/3 (มากกว่า 2 หน่วย) ก็ยังเป็นเศษเกินที่ถูกต้อง
        </p>
      </div>
    </div>
  );
}

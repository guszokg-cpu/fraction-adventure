"use client";

import { Volume2, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import type { FractionShapeKind } from "@/types/lessonContent";
import { getThaiMixedNumberReading } from "@/lib/fractionUtils";

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "th-TH";
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

const EXAMPLES: { whole: number; numerator: number; denominator: number; shape: FractionShapeKind }[] = [
  { whole: 1, numerator: 1, denominator: 4, shape: "circle" },
  { whole: 2, numerator: 1, denominator: 3, shape: "pizza" },
  { whole: 1, numerator: 3, denominator: 5, shape: "bar" },
  { whole: 3, numerator: 2, denominator: 5, shape: "grid" },
];

export function MixedNumberSection() {
  const reading = getThaiMixedNumberReading(1, 1, 4);

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden rounded-3xl border-violet-100 bg-gradient-to-br from-violet-50 to-white p-0">
        <div className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-5 text-white">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">
            4
          </span>
          <div>
            <h2 className="text-2xl font-extrabold">จำนวนคละ</h2>
            <p className="mt-0.5 text-sm font-bold text-violet-100">มีจำนวนเต็มรวมกับเศษส่วนแท้ มีค่ามากกว่าหรือเท่ากับ 1 หน่วย</p>
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-2xl bg-violet-50 px-5 py-3 text-center text-base font-bold text-violet-700">
            จำนวนคละ คือการเขียนของที่มีมากกว่า 1 หน่วย ให้เห็นชัดว่ามีกี่หน่วยเต็ม และเหลือเศษเท่าไร
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <FractionShape numerator={4} denominator={4} shape="circle" tone="violet" className="h-32 w-32 shrink-0" />
            <Plus className="text-violet-400" size={22} />
            <FractionShape numerator={1} denominator={4} shape="circle" tone="violet" className="h-32 w-32 shrink-0" />
            <span className="text-3xl font-extrabold text-violet-300">=</span>
            <div className="flex items-center gap-2">
              <span className="text-6xl font-extrabold text-violet-700">1</span>
              <FractionText numerator={1} denominator={4} className="text-4xl" toneClassName="text-violet-700" />
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <button
              onClick={() => speak(reading)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-extrabold text-violet-600 transition hover:bg-violet-50"
            >
              <Volume2 size={13} /> อ่านว่า {reading}
            </button>
          </div>
        </div>
      </Card>

      {/* ตัวอย่างจำนวนคละ */}
      <div>
        <h3 className="mb-3 text-lg font-extrabold text-brand-900">ตัวอย่างจำนวนคละ</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {EXAMPLES.map((ex) => (
            <div key={`${ex.whole}-${ex.numerator}-${ex.denominator}-${ex.shape}`} className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: ex.whole }, (_, i) => (
                  <FractionShape key={`w-${i}`} numerator={ex.denominator} denominator={ex.denominator} shape={ex.shape} tone="violet" className="h-12 w-12" />
                ))}
                <FractionShape numerator={ex.numerator} denominator={ex.denominator} shape={ex.shape} tone="violet" className="h-12 w-12" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-violet-700">{ex.whole}</span>
                <FractionText numerator={ex.numerator} denominator={ex.denominator} className="text-lg" toneClassName="text-violet-700" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* สังเกตอะไรได้บ้าง */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-extrabold text-brand-900">สังเกตอะไรได้บ้าง</h3>
        <ul className="mt-3 space-y-2 text-sm font-bold text-slate-600">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-violet-500">✓</span> มี 2 ส่วนเสมอ คือ จำนวนเต็ม และเศษส่วนแท้
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-violet-500">✓</span> เศษส่วนที่ตามหลังจำนวนเต็มต้องเป็นเศษส่วนแท้เท่านั้น (ตัวเศษน้อยกว่าตัวส่วน)
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-violet-500">✓</span> มีค่ามากกว่าหรือเท่ากับ 1 หน่วยเสมอ
          </li>
        </ul>
      </div>

      {/* ข้อควรระวัง */}
      <div className="rounded-2xl bg-rose-50 p-5">
        <h3 className="flex items-center gap-2 text-base font-extrabold text-rose-600">⚠️ เข้าใจผิดบ่อย</h3>
        <p className="mt-2 text-sm font-bold text-rose-600">
          จำนวนคละกับเศษเกินคือค่าเดียวกัน เพียงแค่เขียนต่างรูปแบบกัน เช่น 1 1/4 กับ 5/4 มีค่าเท่ากันทุกประการ
          (การแปลงไปมาระหว่างสองรูปแบบนี้จะได้เรียนในบทถัดไป)
        </p>
      </div>
    </div>
  );
}

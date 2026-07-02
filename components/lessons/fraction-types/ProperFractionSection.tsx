"use client";

import { Volume2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import type { FractionShapeKind } from "@/types/lessonContent";
import { getThaiFractionReading } from "@/lib/fractionUtils";

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "th-TH";
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

const EXAMPLES: { numerator: number; denominator: number; shape: FractionShapeKind }[] = [
  { numerator: 1, denominator: 2, shape: "circle" },
  { numerator: 3, denominator: 4, shape: "pizza" },
  { numerator: 2, denominator: 5, shape: "bar" },
  { numerator: 5, denominator: 8, shape: "grid" },
];

export function ProperFractionSection() {
  const reading = getThaiFractionReading(3, 4);

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden rounded-3xl border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-0">
        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">
            2
          </span>
          <div>
            <h2 className="text-2xl font-extrabold">เศษส่วนแท้</h2>
            <p className="mt-0.5 text-sm font-bold text-emerald-100">ตัวเศษน้อยกว่าตัวส่วนเสมอ มีค่าน้อยกว่า 1 หน่วย</p>
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-2xl bg-emerald-50 px-5 py-3 text-center text-base font-bold text-emerald-700">
            เมื่อตัวเศษน้อยกว่าตัวส่วน แสดงว่าเรามีของยังไม่ครบ 1 หน่วยเต็ม
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
            <FractionShape numerator={3} denominator={4} shape="circle" tone="emerald" className="h-40 w-40 shrink-0" />
            <FractionText numerator={3} denominator={4} className="text-7xl" toneClassName="text-emerald-700" />
            <button
              onClick={() => speak(reading)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-extrabold text-emerald-600 transition hover:bg-emerald-50"
            >
              <Volume2 size={13} /> อ่านว่า {reading}
            </button>
          </div>
        </div>
      </Card>

      {/* ตัวอย่างเศษส่วนแท้หลายรูปแบบ */}
      <div>
        <h3 className="mb-3 text-lg font-extrabold text-brand-900">ตัวอย่างเศษส่วนแท้</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {EXAMPLES.map((ex) => (
            <div key={`${ex.numerator}-${ex.denominator}-${ex.shape}`} className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4">
              <FractionShape numerator={ex.numerator} denominator={ex.denominator} shape={ex.shape} tone="emerald" className="h-20 w-20" />
              <FractionText numerator={ex.numerator} denominator={ex.denominator} className="text-xl" toneClassName="text-emerald-700" />
            </div>
          ))}
        </div>
      </div>

      {/* สังเกตอะไรได้บ้าง */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-extrabold text-brand-900">สังเกตอะไรได้บ้าง</h3>
        <ul className="mt-3 space-y-2 text-sm font-bold text-slate-600">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-500">✓</span> ตัวเศษน้อยกว่าตัวส่วนเสมอ
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-500">✓</span> มีค่าน้อยกว่า 1 หน่วยเสมอ
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-500">✓</span> ถ้าระบายภาพ จะไม่มีวันระบายเต็มรูปพอดี
          </li>
        </ul>
      </div>

      {/* ข้อควรระวัง */}
      <div className="rounded-2xl bg-rose-50 p-5">
        <h3 className="flex items-center gap-2 text-base font-extrabold text-rose-600">⚠️ เข้าใจผิดบ่อย</h3>
        <p className="mt-2 text-sm font-bold text-rose-600">
          เศษส่วนแท้ไม่จำเป็นต้องระบายครึ่งเดียวเสมอไป เช่น 1/8 ก็เป็นเศษส่วนแท้ (ระบายน้อยมาก) และ 7/8 ก็เป็นเศษส่วนแท้เช่นกัน
          (ระบายเกือบเต็ม) — สิ่งที่ต้องดูคือ ตัวเศษต้องน้อยกว่าตัวส่วนเท่านั้น
        </p>
      </div>
    </div>
  );
}
